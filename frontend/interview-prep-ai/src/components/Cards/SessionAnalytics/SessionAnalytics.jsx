import React, { useState, useEffect , useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/userContext";

const SessionAnalytics = ({ sessions = [], testResults = [] }) => {
  const [analyticsData, setAnalyticsData] = useState({ sessions: [], testResults: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
const userId = user?._id;
  const navigate = useNavigate();

  useEffect(() => {
    try {
      setAnalyticsData({ sessions: sessions || [], testResults: testResults || [] });
      setError(null);

      sessions.forEach((session, index) => {
        if (!session?.modules || !Array.isArray(session.modules)) return;

        const logArr = session.modules.map(mod => {
          const moduleName = mod.skill || mod.moduleTitle || "Untitled Module";
          const chaptersLength = Array.isArray(mod.chapters) ? mod.chapters.length : 0;
          return `${moduleName}: ${chaptersLength}`;
        }).filter(Boolean);

        console.log(`Session ${index + 1}: ${logArr.join(' | ')}`);
      });
    } catch (err) {
      setError("Failed to process analytics data");
      console.error("Error processing data:", err);
    } finally {
      setLoading(false);
    }
  }, [sessions, testResults]);

  const getModuleChapters = (mod) => {
    if (!mod || !Array.isArray(mod.chapters)) return [];
    return mod.chapters.map(ch => ({
      id: String(ch._id || ch.id || ch),
      title: ch.chapterTitle || ch.title || "Untitled Chapter",
      module: mod.skill || mod.moduleTitle || "Untitled Module"
    }));
  };

  const computeSessionAnalytics = (session) => {
    if (!session?.modules || !Array.isArray(session.modules)) return null;

    let allChapters = session.modules.flatMap(mod => getModuleChapters(mod));

    const seen = new Set();
    allChapters = allChapters.filter(ch => {
      if (seen.has(ch.id)) return false;
      seen.add(ch.id);
      return true;
    });

    const totalChapters = allChapters.length;

    const completedQuizzes = allChapters.filter(chapter =>
      analyticsData.testResults.some(r => String(r.chapterId) === String(chapter.id))
    ).length;

    const weakChapters = allChapters.map(chapter => {
      const result = analyticsData.testResults.find(r => String(r.chapterId) === String(chapter.id));
      if (result && typeof result.score === 'number' && result.score < 6) {
        return {
          title: chapter.title,
          score: result.score,
          module: chapter.module,
          chapterId: chapter.id
        };
      }
      return null;
    }).filter(Boolean);

    const scores = allChapters.map(chapter => {
      const result = analyticsData.testResults.find(r => String(r.chapterId) === String(chapter.id));
      return result && typeof result.score === 'number' ? result.score : null;
    }).filter(Boolean);

    const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;

    return { totalChapters, completedQuizzes, weakChapters, avgScore };
  };

  const getSessionStatus = ({ totalChapters, completedQuizzes, weakChapters }) => {
    if (completedQuizzes === 0) {
      return {
        status: "not-started",
        title: "Ready to Begin Your Learning Journey",
        message: "You haven't started any quizzes yet. Begin your preparation to track your progress!",
        icon: "📚",
        color: "gray",
        showMetrics: false
      };
    } else if (completedQuizzes < totalChapters) {
      const progressPercentage = Math.round((completedQuizzes / (totalChapters || 1)) * 100);
      return {
        status: "in-progress",
        title: "Great Progress! Keep Going",
        message: `You've completed ${completedQuizzes} of ${totalChapters} chapters (${progressPercentage}%). Continue your learning journey!`,
        icon: "🚀",
        color: "blue",
        showMetrics: true
      };
    } else if (weakChapters.length === 0) {
      return {
        status: "excellent",
        title: "Outstanding Achievement!",
        message: `Perfect performance! You've aced all ${totalChapters} chapters with excellent scores.`,
        icon: "🎉",
        color: "green",
        showMetrics: true
      };
    } else {
      return {
        status: "needs-improvement",
        title: "Course Completed - Areas to Focus",
        message: `You've finished all ${totalChapters} chapters. Here are some areas where you can improve further:`,
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
    const colorClasses = { green: "bg-green-500", blue: "bg-blue-500", yellow: "bg-yellow-500", red: "bg-red-500", gray: "bg-gray-500" };
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  // ===== Handler for generating mock quiz =====
 // ===== Handler for generating mock quiz =====
const handleGenerateMockQuiz = (weakChapters, sessionId,userId) => {
  if (!weakChapters || weakChapters.length === 0) {
    alert("No weak chapters to generate quiz from!");
    return;
  }
 console.log(userId);
  navigate("/mock-quiz", { state: { weakChapters, sessionId ,userId} });
};


  if (loading) return (
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

  if (error) return (
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

  return (
    <div className="max-w-6xl mx-auto p-6">
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
            const { totalChapters, completedQuizzes, weakChapters, avgScore } = computeSessionAnalytics(session);
            const sessionStatus = getSessionStatus({ totalChapters, completedQuizzes, weakChapters });
            const performanceLabel = getPerformanceLabel(avgScore);
            const performanceColor = getPerformanceColor(avgScore);

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
                      {totalChapters > 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          Total Chapters: {totalChapters} | Completed: {completedQuizzes}
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
                        <div className="text-2xl font-bold text-gray-900">{totalChapters}</div>
                        <div className="text-xs text-gray-500 font-medium">Total</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Content */}
                <div className="p-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm font-medium">{sessionStatus.message}</p>
                  </div>

                  {sessionStatus.showMetrics && (
                    <>
                      {/* Metrics Grid */}
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
                            <span className="text-3xl font-bold text-gray-900">{avgScore || "0.0"}</span>
                            <span className="text-gray-500 mb-1 text-lg">/ 10</span>
                          </div>
                          <ProgressBar value={avgScore || 0} color={performanceColor} />
                        </div>

                        {/* Completion Progress */}
                        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                          <h4 className="font-semibold text-gray-700 mb-4">Completion Progress</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-semibold text-gray-900">{totalChapters > 0 ? Math.round((completedQuizzes / totalChapters) * 100) : 0}%</span>
                            </div>
                            <ProgressBar value={completedQuizzes} max={totalChapters || 1} color="green" />
                            <div className="text-xs text-gray-500 text-center">{completedQuizzes} of {totalChapters} chapters completed</div>
                          </div>
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
                      </div>

                      {/* Weak Chapters */}
                      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-700 text-lg">Performance Analysis</h4>
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

                        {weakChapters.length > 0 && (
                          <div className="space-y-4">
                            <p className="text-gray-600 text-sm">Focus on these areas to enhance your overall performance:</p>
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

                        {/* ===== Always Visible Final Mock Quiz Button ===== */}
                        <div className="mt-4">
                                              <button
                        onClick={() => handleGenerateMockQuiz(weakChapters, session._id,userId)}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors shadow-md text-white ${
                          completedQuizzes === totalChapters
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Generate Final Mock Quiz from Weak Areas
                      </button>

                        </div>
                      </div>
                    </>
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
