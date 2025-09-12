import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import Question from './Question';
import { getQuestions, saveTestResult } from '../services/api';
import { UserContext } from '../context/userContext';
import Results from './Results';

const AdaptiveTest = () => {
  const location = useLocation();
  const { topic, moduleId, chapterId } = location.state || {};

  const { user } = useContext(UserContext);
  const [lessonId, setLessonId] = useState(location.state?.lessonId || null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState(5);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [savingResults, setSavingResults] = useState(false);

  // Container styles
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  };

  // Header styles
  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    background: 'linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%)',
    color: 'white'
  };

  // Title styles
  const titleStyle = {
    color: 'white',
    margin: '0 0 10px 0',
    fontSize: '28px',
    fontWeight: '600'
  };

  // Loading style
  const loadingStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
    color: '#6c757d'
  };

  // Error style
  const errorStyle = {
    padding: '20px',
    backgroundColor: '#ffeaea',
    color: '#e63946',
    borderRadius: '8px',
    textAlign: 'center',
    margin: '20px 0'
  };

  // Button style
  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#4361ee',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  };

  // Difficulty level colors based on value
  const difficultyColors = [
    '#4caf50', // 1 - Easy green
    '#66bb6a', // 2
    '#9ccc65', // 3
    '#d4e157', // 4
    '#ffee58', // 5 - Medium yellow
    '#ffca28', // 6
    '#ffa726', // 7
    '#ff7043', // 8
    '#ff5722', // 9
    '#f44336'  // 10 - Hard red
  ];

  // Difficulty level icons based on value
  const difficultyIcons = [
    '🌱', // 1 - Sprout
    '🌿', // 2
    '🍀', // 3
    '🌾', // 4
    '🌻', // 5 - Sunflower
    '🌺', // 6
    '🌹', // 7
    '🔥', // 8
    '⚡', // 9
    '💀'  // 10 - Skull
  ];

  // Difficulty level labels based on value
  const difficultyLabels = [
    'Beginner',
    'Novice',
    'Apprentice',
    'Learner',
    'Intermediate',
    'Skilled',
    'Proficient',
    'Advanced',
    'Expert',
    'Master'
  ];

  // ✅ Fetch questions when topic and user are available
useEffect(() => {
    if (!topic) {
      setError('Topic not provided');
      setLoading(false);
      return;
    }
    if (!user) return; // wait for user
    if (!lessonId) {
      setError('Lesson ID not provided. Please start the test from the correct page.');
      setLoading(false);
      return;
    }

    loadQuestions(currentDifficulty);
  }, [topic, user, lessonId]);

  const loadQuestions = async (difficulty = 5) => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Always send the validated lessonId
      const response = await getQuestions(topic, difficulty, lessonId, user._id);
      const data = response.data;

      console.log('Questions API Response:', data);

      if (data.attempted) {
        setTestResult(data);
        setTestCompleted(true);
        setLoading(false);
        return;
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        setError('No questions available for this topic');
        setQuestions([]);
        setLoading(false);
        return;
      }

      // ✅ Backend may return normalized lessonId → update once
      if (data.lessonId && lessonId !== data.lessonId) {
        setLessonId(data.lessonId);
      }

      setQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setLoading(false);
    } catch (err) {
      console.error('Error loading questions:', err);
      setError('Failed to load questions. Please try again.');
      setLoading(false);
    }
  };

  const handleAnswer = async (selectedAnswer) => {
    try {
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) throw new Error('Current question is undefined');

      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

      const newAnswer = {
        questionId: currentQuestion._id,
        selectedAnswer,
        isCorrect,
        difficulty: currentQuestion.difficulty,
      };

      const updatedAnswers = [...answers, newAnswer];
      setAnswers(updatedAnswers);

      if (updatedAnswers.length >= 10) {
        await completeTest(updatedAnswers);
        return;
      }

      // ✅ Adaptive difficulty
      const newDifficulty = isCorrect
        ? Math.min(10, currentDifficulty + 1)
        : Math.max(1, currentDifficulty - 1);

      setCurrentDifficulty(newDifficulty);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        await loadQuestions(newDifficulty);
      }
    } catch (err) {
      console.error('Error handling answer:', err);
      setError('Error processing your answer. Please try again.');
    }
  };

  const completeTest = async (answerData) => {
    try {
      setSavingResults(true);
      const score = answerData.filter(ans => ans.isCorrect).length;

      const enrichedAnswers = answerData.map(ans => {
        const q = questions.find(q => q._id === ans.questionId);
        return {
          ...ans,
          questionText: q?.questionText || '',
          options: q?.options || [],
          correctAnswer: q?.correctAnswer || '',
          explanation: q?.explanation || 'No explanation available',
        };
      });

      const result = {
        userId: user?._id,
        topic,
        lessonId,   // ✅ always safe & validated
        moduleId,
        chapterId,
        score,
        totalQuestions: 10,
        answers: enrichedAnswers,
        attempt: true,
      };

      console.log('Saving Test Result:', result);

      saveTestResult(result).catch(err => {
        console.error('Failed to save test results:', err);
      });

      setTestResult(result);
      setTestCompleted(true);
      setSavingResults(false);
    } catch (err) {
      console.error('Error completing test:', err);
      setSavingResults(false);
    }
  };

  if (!user) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={{ fontSize: '24px', marginBottom: '15px' }}>⏳</div>
          <p>Loading user information...</p>
        </div>
      </div>
    );
  }

  if (savingResults) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={{ fontSize: '24px', marginBottom: '15px' }}>📊</div>
          <p>Calculating your results...</p>
        </div>
      </div>
    );
  }

  if (loading && !testCompleted) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <div style={{ fontSize: '24px', marginBottom: '15px' }}>📚</div>
          <p>Loading questions...</p>
          <div style={{ width: '50%', height: '4px', backgroundColor: '#e0e0e0', borderRadius: '2px', marginTop: '20px' }}>
            <div style={{ height: '100%', width: '30%', backgroundColor: '#4361ee', borderRadius: '2px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Adaptive Test</h2>
        </div>
        <div style={errorStyle}>
          <h3 style={{ margin: '0 0 10px 0' }}>⚠️ Error</h3>
          <p>{error}</p>
          <button 
            style={{...buttonStyle, backgroundColor: '#4a4e69', marginTop: '15px'}}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (testCompleted && testResult) {
    return <Results results={testResult} />;
  }

  if (questions.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Adaptive Test</h2>
        </div>
        <div style={errorStyle}>
          <p>No questions found for this topic.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Adaptive Test</h2>
        </div>
        <div style={errorStyle}>
          <p>Error: Current question is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Adaptive Test: {topic}</h2>
        <p style={{ margin: 0, opacity: 0.9 }}>Answer questions to test your knowledge</p>
      </div>
      
      <div className="progress-header">
        <div className="question-counter">
          <span className="counter-number">{answers.length + 1}</span>
          <span className="counter-label">of 10</span>
        </div>
        
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(answers.length / 10) * 100}%` }}>
            <div className="progress-dot"></div>
          </div>
          <div className="progress-milestones">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className={`milestone ${i < answers.length ? 'completed' : ''} ${i === answers.length ? 'current' : ''}`}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="difficulty-indicator">
          <div className="difficulty-icon" style={{ color: difficultyColors[currentDifficulty - 1] }}>
            {difficultyIcons[currentDifficulty - 1]}
          </div>
          <div className="difficulty-content">
            <div className="difficulty-label">{difficultyLabels[currentDifficulty - 1]}</div>
            <div className="difficulty-bar-container">
              <div 
                className="difficulty-bar" 
                style={{ width: `${currentDifficulty * 10}%`, backgroundColor: difficultyColors[currentDifficulty - 1] }}
              ></div>
            </div>
            <div className="difficulty-level">Level: {currentDifficulty}/10</div>
          </div>
        </div>
      </div>

      <Question
        question={currentQuestion}
        onAnswer={handleAnswer}
      />
    </div>
  );
};

export default AdaptiveTest;