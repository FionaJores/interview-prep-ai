import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SessionAnalytics = ({ sessions = [], testResults = [] }) => {
  const [analyticsData, setAnalyticsData] = useState({
    sessions: [],
    testResults: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let sessionsData = sessions;
        let testResultsData = testResults;

        if (sessions.length === 0 && testResults.length === 0) {
          const [sessionsResponse, testResultsResponse] = await Promise.all([
            fetch('/api/sessions'),
            fetch('/api/test-results')
          ]);

          if (!sessionsResponse.ok || !testResultsResponse.ok) {
            throw new Error('Failed to fetch data');
          }

          sessionsData = await sessionsResponse.json();
          testResultsData = await testResultsResponse.json();
        }

        setAnalyticsData({
          sessions: sessionsData || [],
          testResults: testResultsData || []
        });
        setError(null);
      } catch (err) {
        setError("Failed to load analytics data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessions, testResults]);

  // Helper: return array of items for a module where each item = { id: string, title?: string }
  const getModuleItems = (mod) => {
    if (!mod) return [];

    // If lessons array exists and has entries, use them
    if (mod.lessons && Array.isArray(mod.lessons) && mod.lessons.length > 0) {
      return mod.lessons.map((lesson) => {
        // Handle case where lesson is an object or just an ID string
        let id, title;
        
        if (typeof lesson === 'object' && lesson !== null) {
          id = lesson._id ? String(lesson._id) : (lesson.id ? String(lesson.id) : "");
          title = lesson.chapterTitle || lesson.title || lesson.name || null;
        } else {
          // lesson is just an ID string/number
          id = String(lesson);
          title = null;
        }
        
        return { id, title };
      }).filter(item => item.id); // Filter out items without valid IDs
    }

    // If chapters array exists, use chapter IDs
    if (mod.chapters && Array.isArray(mod.chapters) && mod.chapters.length > 0) {
      const details = Array.isArray(mod.chapterDetails) ? mod.chapterDetails : [];
      
      return mod.chapters.map((ch) => {
        let id;
        
        // Handle case where chapter is an object or just an ID
        if (typeof ch === 'object' && ch !== null) {
          id = ch._id ? String(ch._id) : (ch.id ? String(ch.id) : String(ch));
        } else {
          id = String(ch);
        }
        
        // Try to find title from chapterDetails
        const det = details.find(d => {
          const detId = d && d._id ? String(d._id) : (d && d.id ? String(d.id) : null);
          return detId === id;
        });
        
        const title = det ? (det.chapterTitle || det.title || det.name) : null;
        return { id, title };
      }).filter(item => item.id); // Filter out items without valid IDs
    }

    // If neither lessons nor chapters exist, but there are other arrays that might represent content
    // Check for other possible content arrays
    const possibleContentKeys = ['content', 'items', 'topics', 'units'];
    for (const key of possibleContentKeys) {
      if (mod[key] && Array.isArray(mod[key]) && mod[key].length > 0) {
        return mod[key].map((item, index) => {
          let id, title;
          
          if (typeof item === 'object' && item !== null) {
            id = item._id ? String(item._id) : (item.id ? String(item.id) : `${key}_${index}`);
            title = item.title || item.name || item.chapterTitle || null;
          } else {
            id = String(item);
            title = null;
          }
          
          return { id, title };
        }).filter(item => item.id);
      }
    }

    return [];
  };

  // Total lessons across all modules (treat chapters as lessons when lessons[] is empty)
  const getTotalLessons = (session) => {
    if (!session?.modules || !Array.isArray(session.modules)) return 0;

    const total = session.modules.reduce((total, mod) => {
      const items = getModuleItems(mod);
      console.log(`Module ${mod.skill || mod.moduleTitle || 'Unknown'} has ${items.length} items:`, items);
      return total + items.length;
    }, 0);
    
    console.log(`Total lessons calculated: ${total}`);
    return total;
  };

  // Completed quizzes: count of module items (lessons/chapters) that have matching testResults
  const getCompletedQuizzes = (session) => {
    if (!session?.modules || !Array.isArray(session.modules)) return 0;

    const allIds = session.modules.flatMap((mod) => getModuleItems(mod).map(i => i.id));
    if (!analyticsData.testResults || !Array.isArray(analyticsData.testResults)) return 0;
    
    const completed = allIds.filter(id => 
      analyticsData.testResults.some(r => String(r.lessonId) === String(id))
    ).length;
    
    console.log(`All lesson IDs: ${allIds.length}`, allIds);
    console.log(`Test results: ${analyticsData.testResults.length}`, analyticsData.testResults.map(r => r.lessonId));
    console.log(`Completed quizzes: ${completed}`);
    
    return completed;
  };

  // Weak chapters: items (lesson/chapter) with score < 6
  const getWeakChapters = (session) => {
    if (!session?.modules || !Array.isArray(session.modules)) return [];

    return session.modules.flatMap((mod) => {
      const items = getModuleItems(mod);
      return items.map((item) => {
        if (!item || !item.id) return null;
        const result = (analyticsData.testResults || []).find(r => String(r.lessonId) === String(item.id));
        if (result && typeof result.score === 'number' && result.score < 6) {
          return {
            title: item.title || "Untitled Chapter",
            score: result.score,
            module: mod.skill || mod.moduleTitle || "Untitled Module",
            lessonId: item.id
          };
        }
        return null;
      }).filter(Boolean);
    });
  };

  // Average score across all items in session (lessons or chapters)
  const getAverageScore = (session) => {
    if (!session?.modules || !Array.isArray(session.modules)) return null;

    const scores = session.modules.flatMap((mod) => {
      const items = getModuleItems(mod);
      return items.map(item => {
        if (!item || !item.id) return null;
        const result = (analyticsData.testResults || []).find(r => String(r.lessonId) === String(item.id));
        return result && typeof result.score === 'number' ? result.score : null;
      }).filter(s => s !== null);
    });

    if (!scores || scores.length === 0) return null;
    const sum = scores.reduce((a, b) => a + b, 0);
    return (sum / scores.length).toFixed(1);
  };

  // Get the first module id that has items (lessons or chapters)
  const getFirstModuleId = (session) => {
    if (!session?.modules || !Array.isArray(session.modules) || session.modules.length === 0) return null;

    const firstModule = session.modules.find(mod => {
      const items = getModuleItems(mod);
      return items.length > 0 && mod?._id;
    });

    return firstModule ? firstModule._id : null;
  };

  // Journey URL helpers (unchanged)
  const getJourneyUrl = (session) => {
    const firstModuleId = getFirstModuleId(session);
    if (firstModuleId) {
      return `/modules/${firstModuleId}`;
    }
    return '/modules';
  };

  const handleStartJourney = (session) => {
    const journeyUrl = getJourneyUrl(session);
    navigate(journeyUrl);
  };

  const getSessionStatus = (session) => {
    const completedQuizzes = getCompletedQuizzes(session);
    const totalLessons = getTotalLessons(session);
    const avgScore = getAverageScore(session);
    const weakChapters = getWeakChapters(session);

    if (completedQuizzes === 0) {
      return {
        status: "not-started",
        title: "Ready to Begin Your Learning Journey",
        message: "You haven't started any quizzes yet. Begin your preparation to track your progress!",
        icon: "📚",
        color: "gray",
        showMetrics: false
      };
    } else if (completedQuizzes < totalLessons) {
      const progressPercentage = Math.round((completedQuizzes / (totalLessons || 1)) * 100);
      return {
        status: "in-progress",
        title: "Great Progress! Keep Going",
        message: `You've completed ${completedQuizzes} of ${totalLessons} lessons (${progressPercentage}%). Continue your learning journey!`,
        icon: "🚀",
        color: "blue",
        showMetrics: true
      };
    } else if (weakChapters.length === 0) {
      return {
        status: "excellent",
        title: "Outstanding Achievement!",
        message: `Perfect performance! You've aced all ${totalLessons} lessons with excellent scores.`,
        icon: "🎉",
        color: "green",
        showMetrics: true
      };
    } else {
      return {
        status: "needs-improvement",
        title: "Course Completed - Areas to Focus",
        message: `You've finished all ${totalLessons} lessons. Here are some areas where you can improve further:`,
        icon: "💡",
        color: "orange",
        showMetrics: true
      };
    }
  };

  const getPerformanceLabel = (avg) => {
    if (avg === null) return "No Data";
    if (avg >= 8) return "Excellent";
    if (avg >= 6) return "Good";
    if (avg >= 4) return "Average";
    return "Needs Improvement";
  };

  const getPerformanceColor = (avg) => {
    if (avg === null) return "gray";
    if (avg >= 8) return "green";
    if (avg >= 6) return "blue";
    if (avg >= 4) return "yellow";
    return "red";
  };

  const ProgressBar = ({ value, max = 10, color = "blue" }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const colorClasses = {
      green: "bg-green-500",
      blue: "bg-blue-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      gray: "bg-gray-500"
    };

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Learning Analytics</h2>
          <p className="text-gray-600">Tracking your learning progress</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Learning Analytics</h2>
          <p className="text-gray-600">Tracking your learning progress</p>
        </div>
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">Unable to Load Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Learning Analytics</h2>
        <p className="text-gray-600">Track your progress and identify areas for improvement</p>
      </div>

      {analyticsData.sessions.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Learning Sessions Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start your first learning session to unlock detailed analytics and track your progress
          </p>
          <button
            onClick={() => navigate('/modules')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
          >
            Start Learning Journey
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {analyticsData.sessions.map((session, index) => {
            const weakChapters = getWeakChapters(session);
            const avgScore = getAverageScore(session);
            const completedQuizzes = getCompletedQuizzes(session);
            const totalLessons = getTotalLessons(session);
            const sessionStatus = getSessionStatus(session);
            const performanceLabel = getPerformanceLabel(avgScore);
            const performanceColor = getPerformanceColor(avgScore);
            const journeyUrl = getJourneyUrl(session);

            return (
              <div key={session._id || index} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Session Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-blue-700 border border-blue-200 shadow-sm">
                          {session.role || "General Learning"}
                        </span>
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-${sessionStatus.color}-100 text-${sessionStatus.color}-800 border border-${sessionStatus.color}-200`}>
                          <span className="text-lg mr-2">{sessionStatus.icon}</span>
                          {sessionStatus.title}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Study Session {index + 1}</h3>
                      <p className="text-gray-600 mt-1">
                        {Array.isArray(session.topicsToFocus) ? session.topicsToFocus.join(", ") : session.topicsToFocus || "General topics"}
                      </p>
                      {totalLessons > 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          Total Lessons: {totalLessons} | Completed: {completedQuizzes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{completedQuizzes}</div>
                        <div className="text-xs text-gray-500 font-medium">Completed</div>
                      </div>
                      <div className="w-px h-10 bg-gray-300"></div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{totalLessons}</div>
                        <div className="text-xs text-gray-500 font-medium">Total</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Content */}
                <div className="p-6">
                  {/* Status Message */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm font-medium">{sessionStatus.message}</p>
                  </div>

                  {/* Metrics - Only show if user has started */}
                  {sessionStatus.showMetrics ? (
                    <>
                      <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {/* Average Score */}
                        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-700">Average Score</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${performanceColor}-100 text-${performanceColor}-800`}>
                              {performanceLabel}
                            </span>
                          </div>
                          <div className="flex items-end gap-2 mb-3">
                            <span className="text-3xl font-bold text-gray-900">
                              {avgScore || "0.0"}
                            </span>
                            <span className="text-gray-500 mb-1 text-lg">/ 10</span>
                          </div>
                          <ProgressBar value={avgScore || 0} color={performanceColor} />
                        </div>

                        {/* Performance Rating */}
                        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                          <h4 className="font-semibold text-gray-700 mb-4">Performance Rating</h4>
                          <div className="flex items-center gap-3">
                            <div className={`text-3xl ${
                              performanceColor === 'green' ? 'text-green-500' :
                              performanceColor === 'blue' ? 'text-blue-500' :
                              performanceColor === 'yellow' ? 'text-yellow-500' : 'text-red-500'
                            }`}>
                              {performanceColor === 'green' ? '⭐' :
                               performanceColor === 'blue' ? '👍' :
                               performanceColor === 'yellow' ? '👉' : '💡'}
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-gray-900">{performanceLabel}</div>
                              <div className="text-sm text-gray-500">Overall performance</div>
                            </div>
                          </div>
                        </div>

                        {/* Completion Progress */}
                        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                          <h4 className="font-semibold text-gray-700 mb-4">Completion Progress</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-semibold text-gray-900">
                                {totalLessons > 0 ? Math.round((completedQuizzes / totalLessons) * 100) : 0}%
                              </span>
                            </div>
                            <ProgressBar 
                              value={completedQuizzes} 
                              max={totalLessons || 1} 
                              color="green" 
                            />
                            <div className="text-xs text-gray-500 text-center">
                              {completedQuizzes} of {totalLessons} lessons completed
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Weak Chapters Section */}
                      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-700 text-lg">
                            Performance Analysis
                          </h4>
                          {weakChapters.length === 0 ? (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                              All Topics Mastered
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                              Focus Areas
                            </span>
                          )}
                        </div>

                        {weakChapters.length === 0 ? (
                          <></>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-gray-600 text-sm">
                              Focus on these areas to enhance your overall performance:
                            </p>
                            {weakChapters.map((wc, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-200 transition-colors shadow-sm">
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 text-sm">{wc.title}</div>
                                  <div className="text-xs text-gray-500 mt-1">{wc.module}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <div className="text-red-600 font-bold text-lg">{wc.score}/10</div>
                                    <div className="text-xs text-gray-500">Score</div>
                                  </div>
                                  <div className="w-20">
                                    <ProgressBar value={wc.score} color="red" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionAnalytics;