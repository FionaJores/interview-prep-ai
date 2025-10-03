import React, { useState, useEffect, useContext } from "react";
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

    // FIXED: More accurate completed quizzes calculation
    const completedQuizzes = allChapters.filter(chapter => {
      const result = analyticsData.testResults.find(r => 
        String(r.chapterId) === String(chapter.id)
      );
      // Consider a chapter completed if there's any test result for it
      return result !== undefined;
    }).length;

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

    return { 
      totalChapters, 
      completedQuizzes, 
      weakChapters, 
      avgScore,
      allChapters // Added for debugging
    };
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

  // Performance Graph Component
  const PerformanceGraph = ({ score, max = 10, size = "md" }) => {
    const percentage = Math.min(100, Math.max(0, (score / max) * 100));
    const performanceColor = getPerformanceColor(score);
    
    const colorClasses = {
      green: "from-green-400 to-green-500",
      blue: "from-blue-400 to-blue-500", 
      yellow: "from-yellow-400 to-yellow-500",
      red: "from-red-400 to-red-500",
      gray: "from-gray-400 to-gray-500"
    };

    const sizeClasses = {
      sm: "w-12 h-12",
      md: "w-20 h-20",
      lg: "w-28 h-28"
    };

    return (
      <div className="flex flex-col items-center">
        <div className={`relative ${sizeClasses[size]} mb-2`}>
          <div className="absolute inset-0 bg-gray-100 rounded-full"></div>
          <div 
            className={`absolute inset-0 rounded-full border-4 border-transparent 
              bg-gradient-to-r ${colorClasses[performanceColor]} 
              transform -rotate-90`}
            style={{
              clipPath: `conic-gradient(transparent 0%, transparent ${100 - percentage}%, currentColor ${100 - percentage}%, currentColor 100%)`
            }}
          ></div>
          <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
            <span className={`font-bold ${
              performanceColor === 'green' ? 'text-green-600' :
              performanceColor === 'blue' ? 'text-blue-600' :
              performanceColor === 'yellow' ? 'text-yellow-600' :
              performanceColor === 'red' ? 'text-red-600' : 'text-gray-600'
            } ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'}`}>
              {score}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Compact Progress Bar
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
      <div className="w-full">
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${colorClasses[color]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  // Performance Summary Card
  const PerformanceSummary = ({ session, analytics, index }) => {
    const { totalChapters, completedQuizzes, weakChapters, avgScore } = analytics;
    const performanceColor = getPerformanceColor(avgScore);
    const performanceLabel = getPerformanceLabel(avgScore);
    const progressPercentage = totalChapters > 0 ? Math.round((completedQuizzes / totalChapters) * 100) : 0;
    
    // FIXED: Check if all chapters are completed
    const allChaptersCompleted = completedQuizzes === totalChapters && totalChapters > 0;

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                Session {index + 1}
              </span>
              <span className="text-gray-500 text-sm">{session.role || "General Learning"}</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
              {Array.isArray(session.topicsToFocus) ? session.topicsToFocus.join(", ") : session.topicsToFocus || "General Topics"}
            </h3>
            <p className="text-gray-600 text-sm">
              {completedQuizzes} of {totalChapters} chapters completed
              {allChaptersCompleted && (
                <span className="ml-2 text-green-600 font-medium">✓ All Completed</span>
              )}
            </p>
          </div>
          <PerformanceGraph score={avgScore || 0} size="sm" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{avgScore || "0.0"}</div>
            <div className="text-xs text-gray-500">Avg Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{progressPercentage}%</div>
            <div className="text-xs text-gray-500">Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{weakChapters.length}</div>
            <div className="text-xs text-gray-500">Weak Areas</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Completion</span>
            <span className="font-medium text-gray-900">{progressPercentage}%</span>
          </div>
          <ProgressBar value={completedQuizzes} max={totalChapters || 1} color="green" />
        </div>
      </div>
    );
  };

  // Detailed Performance View
  const DetailedPerformance = ({ session, analytics, index }) => {
    const { totalChapters, completedQuizzes, weakChapters, avgScore, allChapters } = analytics;
    const performanceColor = getPerformanceColor(avgScore);
    const performanceLabel = getPerformanceLabel(avgScore);

    // FIXED: More accurate check for completion
    const allChaptersCompleted = completedQuizzes === totalChapters && totalChapters > 0;
    const remainingChapters = totalChapters - completedQuizzes;

    const chapterResults = analyticsData.testResults.filter(result => {
      const sessionChapters = session.modules?.flatMap(mod => getModuleChapters(mod)) || [];
      return sessionChapters.some(ch => String(ch.id) === String(result.chapterId));
    });

    const scoreRanges = {
      excellent: chapterResults.filter(r => r.score >= 8).length,
      good: chapterResults.filter(r => r.score >= 6 && r.score < 8).length,
      average: chapterResults.filter(r => r.score >= 4 && r.score < 6).length,
      weak: chapterResults.filter(r => r.score < 4).length,
    };

    const totalAttempted = chapterResults.length;

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 text-xl">Detailed Performance - Session {index + 1}</h3>
          <div className="flex items-center gap-3">
            {allChaptersCompleted && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✅ Ready for Mock Quiz
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              performanceColor === 'green' ? 'bg-green-100 text-green-800' :
              performanceColor === 'blue' ? 'bg-blue-100 text-blue-800' :
              performanceColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {performanceLabel}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Score Distribution</h4>
            <div className="space-y-2">
              {[
                { label: "Excellent", count: scoreRanges.excellent, color: "bg-green-500", width: totalAttempted > 0 ? (scoreRanges.excellent / totalAttempted) * 100 : 0 },
                { label: "Good", count: scoreRanges.good, color: "bg-blue-500", width: totalAttempted > 0 ? (scoreRanges.good / totalAttempted) * 100 : 0 },
                { label: "Average", count: scoreRanges.average, color: "bg-yellow-500", width: totalAttempted > 0 ? (scoreRanges.average / totalAttempted) * 100 : 0 },
                { label: "Needs Work", count: scoreRanges.weak, color: "bg-red-500", width: totalAttempted > 0 ? (scoreRanges.weak / totalAttempted) * 100 : 0 },
              ].map((range, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-20">{range.label}</span>
                  <div className="flex-1 mx-2">
                    <div className="bg-gray-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${range.color}`}
                        style={{ width: `${range.width}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {range.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Areas */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">
              Focus Areas {weakChapters.length > 0 && `(${weakChapters.length})`}
            </h4>
            {weakChapters.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-2xl text-green-500 mb-2">✅</div>
                <p className="text-green-600 text-sm">All topics mastered!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {weakChapters.slice(0, 5).map((wc, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{wc.title}</p>
                      <p className="text-xs text-gray-500 truncate">{wc.module}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-bold text-sm">{wc.score}/10</span>
                      <PerformanceGraph score={wc.score} size="sm" />
                    </div>
                  </div>
                ))}
                {weakChapters.length > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{weakChapters.length - 5} more areas to improve
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Button - FIXED: Only enable when all chapters are completed */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => allChaptersCompleted && handleGenerateMockQuiz(weakChapters, session._id, userId)}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
              allChaptersCompleted
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
                : "bg-gray-100 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!allChaptersCompleted}
          >
            {allChaptersCompleted 
              ? "🎯 Generate Quiz from Weak Areas" 
              : `Complete ${remainingChapters} more chapter${remainingChapters !== 1 ? 's' : ''} to unlock quiz`
            }
          </button>
          
          {/* Debug info - you can remove this in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-gray-500">
              Debug: {completedQuizzes} completed / {totalChapters} total chapters
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleGenerateMockQuiz = (weakChapters, sessionId, userId) => {
    if (!weakChapters || weakChapters.length === 0) {
      alert("No weak chapters to generate quiz from!");
      return;
    }
    navigate("/mock-quiz", { state: { weakChapters, sessionId, userId } });
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Analytics</h2>
        <p className="text-gray-600">Crunching your learning data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Data</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
          <span className="text-2xl text-blue-600">📊</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Learning Analytics
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Track your progress and identify areas for improvement
        </p>
      </div>

      {analyticsData.sessions.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-200 max-w-sm w-full">
            <div className="text-4xl mb-4 opacity-60">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Sessions Yet</h3>
            <p className="text-gray-600 mb-6">
              Start learning to see your analytics here
            </p>
            <button
              onClick={() => navigate('/modules')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Start Learning
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Session Summaries Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.sessions.map((session, index) => {
              const analytics = computeSessionAnalytics(session);
              if (!analytics) return null;
              
              return (
                <PerformanceSummary 
                  key={session._id || index}
                  session={session}
                  analytics={analytics}
                  index={index}
                />
              );
            })}
          </div>

          {/* Detailed Views */}
          <div className="space-y-4">
            {analyticsData.sessions.map((session, index) => {
              const analytics = computeSessionAnalytics(session);
              if (!analytics) return null;
              
              return (
                <DetailedPerformance
                  key={`detail-${session._id || index}`}
                  session={session}
                  analytics={analytics}
                  index={index}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionAnalytics;