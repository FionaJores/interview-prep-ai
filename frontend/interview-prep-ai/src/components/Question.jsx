import { useState } from 'react';

const Question = ({ question, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  // Check if question data is valid
  if (!question || typeof question !== 'object') {
    return (
      <div style={{
        width: '100%',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#ffebee',
        borderRadius: '12px',
        border: '2px solid #f44336',
        boxSizing: 'border-box'
      }}>
        <p style={{ color: '#d32f2f', fontSize: '1.2rem', marginBottom: '1rem' }}>
          Error: No question data received.
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          Reload
        </button>
      </div>
    );
  }

  // Destructure the question object with safe defaults
  const { 
    questionText = 'No question text available', 
    options = [], 
    correctAnswer = '' 
  } = question;

  // Check if we have valid options
  const hasValidOptions = Array.isArray(options) && options.length >= 2;

  const handleSubmit = () => {
    if (selectedOption !== null && onAnswer) {
      onAnswer(selectedOption);  // Make sure onAnswer exists before calling
      setSelectedOption(null);
    }
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#f5f7ff',
      borderRadius: '16px',
      padding: '2rem',
      boxSizing: 'border-box',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <h3 style={{
        fontSize: '1.5rem',
        color: '#2d3748',
        marginBottom: '1.5rem',
        textAlign: 'center',
        fontWeight: '600',
        lineHeight: '1.4'
      }}>
        {questionText}
      </h3>
      
      {hasValidOptions ? (
        <>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {options.map((option, index) => (
              <div key={index} style={{
                backgroundColor: selectedOption === option ? '#e6f7ff' : 'white',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                border: selectedOption === option ? 
                  '2px solid #1890ff' : '2px solid #e2e8f0',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }} onClick={() => setSelectedOption(option)}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  width: '100%'
                }}>
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedOption === option}
                    onChange={() => setSelectedOption(option)}
                    style={{
                      marginRight: '1rem',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{
                    fontSize: '1.1rem',
                    color: '#2d3748'
                  }}>
                    {option}
                  </span>
                </label>
              </div>
            ))}
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={selectedOption === null}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: selectedOption === null ? '#cbd5e0' : '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: selectedOption === null ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
              boxShadow: selectedOption !== null ? '0 4px 12px rgba(66, 153, 225, 0.4)' : 'none'
            }}
          >
            Submit Answer
          </button>
        </>
      ) : (
        <div style={{
          width: '100%',
          padding: '1.5rem',
          textAlign: 'center',
          backgroundColor: '#ffebee',
          borderRadius: '12px',
          border: '2px solid #f44336',
          boxSizing: 'border-box'
        }}>
          <p style={{ color: '#d32f2f', fontSize: '1.1rem', marginBottom: '1rem' }}>
            Error: This question doesn't have valid options.
          </p>
          <button 
            onClick={() => onAnswer && onAnswer('')}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Skip Question
          </button>
        </div>
      )}
    </div>
  );
};

export default Question; 