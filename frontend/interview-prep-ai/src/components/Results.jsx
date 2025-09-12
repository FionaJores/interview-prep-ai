const Results = ({ results }) => {
  if (!results) return <div className="no-results">No results available</div>;

  const { score, totalQuestions, topic, answers = [] } = results;
  const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(2) : 0;

  const getFeedback = (percentage) => {
    if (percentage >= 80) return "Excellent! 🎉";
    if (percentage >= 50) return "Good job! Keep improving.";
    return "Needs practice. Don't give up!";
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "#10b981";
    if (percentage >= 50) return "#f59e0b";
    return "#ef4444";
  };

  // Function to handle back button click
  const handleBackClick = () => {
    window.history.back();
  };

  return (
    <div className="results-fullscreen">
      {/* Header */}
      <header className="results-header">
        <h1>Test Results</h1>
        <div className="topic-badge">{topic}</div>
      </header>

      {/* Main Content */}
      <main className="results-content">
        {/* Score Summary */}
        <section className="score-section">
          <div className="score-circle" style={{ '--score-color': getScoreColor(percentage) }}>
            <div className="score-percentage">{percentage}%</div>
            <div className="score-fraction">{score}/{totalQuestions}</div>
            <svg className="progress-ring" width="200" height="200">
              <circle
                className="progress-ring-circle"
                stroke="var(--score-color)"
                strokeWidth="12"
                fill="transparent"
                r="85"
                cx="100"
                cy="100"
                style={{
                  strokeDasharray: 534,
                  strokeDashoffset: 534 - (percentage * 534 / 100)
                }}
              />
            </svg>
          </div>
          
          <div className="feedback-container">
            <h2>{getFeedback(percentage)}</h2>
            <p>Your performance in {topic}</p>
          </div>
        </section>

        {/* Answers Review */}
        <section className="answers-section">
          <h2>Review Your Answers</h2>
          <div className="answers-grid">
            {answers.map((ans, index) => (
              <div key={ans.questionId || index} className="answer-card">
                <div className="question-header">
                  <span className="question-number">Q{index + 1}</span>
                  <span className={`status-badge ${
                    ans.selectedAnswer === ans.correctAnswer ? 'correct' : 'incorrect'
                  }`}>
                    {ans.selectedAnswer === ans.correctAnswer ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                
                <p className="question-text">{ans.questionText}</p>
                
                <div className="options-list">
                  {ans.options.map((opt, i) => {
                    const isCorrect = opt === ans.correctAnswer;
                    const isSelected = opt === ans.selectedAnswer;
                    
                    return (
                      <div
                        key={i}
                        className={`option-item ${
                          isCorrect ? 'correct' : 
                          isSelected ? 'incorrect' : ''
                        }`}
                      >
                        <span className="option-text">{opt}</span>
                        {isCorrect && <span className="option-icon">✅</span>}
                        {isSelected && !isCorrect && <span className="option-icon">❌</span>}
                      </div>
                    );
                  })}
                </div>

                {/* ✅ Explanation Section */}
                {ans.explanation && (
                  <div className="explanation">
                    <strong>Explanation:</strong> {ans.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="results-footer">
        <button className="home-btn" onClick={handleBackClick}>Back to Home</button>
      </footer>
    </div>
  );
};

export default Results;
