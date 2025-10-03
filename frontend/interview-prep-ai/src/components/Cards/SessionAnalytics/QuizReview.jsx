import React from "react";

const QuizReview = ({ 
  score, 
  questions, 
  answers, 
  scorePct, 
  badge, 
  readOnly, 
  navigate 
}) => {
  // LeetCode-style badge generation
  const getBadgeInfo = () => {
    if (scorePct === 100) {
      return {
        text: "Perfect Score",
        subtext: "Interview Ready",
        color: "from-yellow-400 to-yellow-500",
        borderColor: "border-yellow-400",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-800",
        icon: "🏆"
      };
    } else if (scorePct >= 90) {
      return {
        text: "Excellent",
        subtext: "Strong Candidate",
        color: "from-green-500 to-emerald-600",
        borderColor: "border-green-500",
        bgColor: "bg-green-50",
        textColor: "text-green-800",
        icon: "⭐"
      };
    } else if (scorePct >= 80) {
      return {
        text: "Great Job",
        subtext: "Well Prepared",
        color: "from-blue-500 to-cyan-600",
        borderColor: "border-blue-500",
        bgColor: "bg-blue-50",
        textColor: "text-blue-800",
        icon: "🔥"
      };
    } else if (scorePct >= 70) {
      return {
        text: "Good Work",
        subtext: "Almost There",
        color: "from-purple-500 to-indigo-600",
        borderColor: "border-purple-500",
        bgColor: "bg-purple-50",
        textColor: "text-purple-800",
        icon: "💪"
      };
    } else if (scorePct >= 60) {
      return {
        text: "Not Bad",
        subtext: "Keep Practicing",
        color: "from-orange-500 to-amber-600",
        borderColor: "border-orange-500",
        bgColor: "bg-orange-50",
        textColor: "text-orange-800",
        icon: "📚"
      };
    } else {
      return {
        text: "Needs Work",
        subtext: "More Practice Needed",
        color: "from-gray-500 to-gray-600",
        borderColor: "border-gray-500",
        bgColor: "bg-gray-50",
        textColor: "text-gray-800",
        icon: "🎯"
      };
    }
  };

  const badgeInfo = getBadgeInfo();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Interview Prep AI</h1>
          <h2 className="text-xl text-gray-600 mb-6">Question Review</h2>
          
          {/* LeetCode-style Badge */}
          <div className={`inline-flex flex-col items-center ${badgeInfo.bgColor} border-2 ${badgeInfo.borderColor} rounded-2xl px-8 py-6 mb-6 shadow-sm`}>
            <div className={`text-4xl mb-2`}>{badgeInfo.icon}</div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${badgeInfo.textColor} mb-1`}>
                {badgeInfo.text}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {badgeInfo.subtext}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{score}</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{questions.length}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{scorePct}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Questions Review Section */}
        <div className="space-y-6">
          {questions.map((q, index) => {
            const userAnswer = answers[q._id];
            const isCorrect = userAnswer === q.correctOptionId;
            
            return (
              <div key={q._id} className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-8 h-8 rounded flex items-center justify-center font-semibold text-sm ${
                    isCorrect ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-rose-100 text-rose-700 border border-rose-300'
                  }`}>
                    {index + 1}
                  </div>
                  <h3 className="font-medium text-gray-800 text-lg flex-1 leading-relaxed">
                    {q.questionText}
                  </h3>
                </div>

                {/* Options Grid */}
                <div className="space-y-2 ml-11">
                  {q.options.map((opt) => {
                    const isCorrectOption = opt.id === q.correctOptionId;
                    const isUserSelected = userAnswer === opt.id;
                    
                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded border ${
                          isCorrectOption
                            ? 'bg-emerald-50 border-emerald-300'
                            : isUserSelected
                            ? 'bg-rose-50 border-rose-300'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded flex items-center justify-center font-semibold text-sm border ${
                            isCorrectOption
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : isUserSelected
                              ? 'bg-rose-500 text-white border-rose-600'
                              : 'bg-white text-gray-600 border-gray-400'
                          }`}>
                            {String.fromCharCode(65 + opt.id)}
                          </div>
                          
                          <span className={`flex-1 text-sm ${
                            isCorrectOption ? 'text-emerald-800 font-medium' : 
                            isUserSelected ? 'text-rose-800 font-medium' : 
                            'text-gray-700'
                          }`}>
                            {opt.text}
                          </span>
                          
                          {isCorrectOption && (
                            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {isUserSelected && !isCorrectOption && (
                            <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-4 ml-11 p-4 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-blue-800 text-sm">Explanation</span>
                    </div>
                    <div className="text-gray-700 text-sm leading-relaxed">
                      {q.explanation.split('\n').map((line, lineIndex) => (
                        <p key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizReview;