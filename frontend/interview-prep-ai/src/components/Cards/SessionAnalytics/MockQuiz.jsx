import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuizReview from "./QuizReview";
import Navbar from "../../layouts/Navbar";

const getBadge = (scorePct) => {
  if (scorePct === 100) return { name: "🏆 Gold", color: "bg-yellow-300 text-yellow-900" };
  if (scorePct >= 70) return { name: "🥈 Silver", color: "bg-gray-300 text-gray-900" };
  if (scorePct >= 40) return { name: "🥉 Bronze", color: "bg-orange-300 text-orange-900" };
  return { name: "🔄 Practice More", color: "bg-red-300 text-red-900" };
};

const MockQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const weakChapters = location.state?.weakChapters || [];
  const sessionId = location.state?.sessionId;
  const userId = location.state?.userId;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizAttemptId, setQuizAttemptId] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [timeLeftArr, setTimeLeftArr] = useState([]);
  const [timeTaken, setTimeTaken] = useState(0);
  const [autoNavigate, setAutoNavigate] = useState(true);
  const timerRef = useRef(null);

  // Fetch quiz on mount
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!sessionId || !userId) return;
      try {
        const res = await fetch("http://localhost:8000/api/get-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weakChapters, sessionId, userId }),
        });
        const data = await res.json();

        if (!data) return;
        const questionsWithIds = (data.questions || []).map((q, qIndex) => ({
          ...q,
          _id: q._id || qIndex,
          options: q.options.map((opt, oIndex) => ({
            id: oIndex,
            text: typeof opt === "string" ? opt : opt.text,
          })),
        }));

        setQuestions(questionsWithIds);
        setQuizAttemptId(data.quizAttempt?._id);
        setReadOnly(data.readOnly);

        // Resume unfinished quiz
        if (data.quizAttempt && !data.readOnly) {
          const savedAnswers = {};
          (data.quizAttempt.answers || []).forEach(
            (a) => (savedAnswers[a.questionId] = a.selectedOptionId)
          );
          setAnswers(savedAnswers);
          setCurrentIndex(data.quizAttempt.currentIndex || 0);
          setTimeLeftArr(
            data.quizAttempt.timeLeftArr?.length === questionsWithIds.length
              ? data.quizAttempt.timeLeftArr
              : Array(questionsWithIds.length).fill(60)
          );
          setTimeTaken(data.quizAttempt.timeTaken || 0);
        } else if (!data.readOnly) {
          setTimeLeftArr(Array(questionsWithIds.length).fill(60));
        }

        if (data.readOnly) {
          setSubmitted(true);
          setScore(data.quizAttempt?.score || 0);
        }
      } catch (err) {
        console.error("Failed to fetch quiz:", err);
      }
    };
    fetchQuiz();
  }, [weakChapters, sessionId, userId]);

  // Timer per question
  useEffect(() => {
    if (submitted || questions.length === 0 || readOnly) return;

    timerRef.current = setTimeout(() => {
      setTimeLeftArr((prev) => {
        const newArr = [...prev];
        if (newArr[currentIndex] > 0) {
          newArr[currentIndex] -= 1;
          setTimeTaken((t) => t + 1);
        } else if (newArr[currentIndex] === 0 && autoNavigate) {
          handleAutoNext();
        }
        return newArr;
      });
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeftArr, currentIndex, submitted, questions, readOnly, autoNavigate]);

  // Auto navigate to next question when time runs out
  const handleAutoNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setAutoNavigate(true);
    } else {
      handleSubmit();
    }
  };

  // Voice reading - ONLY during quiz attempt (not submitted and not readOnly)
  useEffect(() => {
    // Stop voice guidance if quiz is submitted or in read-only mode
    if (submitted || readOnly || questions.length === 0) {
      window.speechSynthesis.cancel();
      return;
    }

    if (!questions[currentIndex]) return;
    
    window.speechSynthesis.cancel();
    const currentQ = questions[currentIndex];
    const utterance = new SpeechSynthesisUtterance(
      `${currentQ.questionText}. ${currentQ.options
        .map((o, i) => `Option ${i + 1}: ${o.text}`)
        .join(". ")}`
    );
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }, [currentIndex, questions, submitted, readOnly]);

  // Clean up voice synthesis when component unmounts or quiz ends
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Save progress on unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (quizAttemptId && !submitted) {
        try {
          await fetch("http://localhost:8000/api/save-progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              quizAttemptId,
              answers: Object.entries(answers).map(([qId, selectedOptionId]) => ({
                questionId: qId,
                selectedOptionId,
              })),
              currentIndex,
              timeLeftArr,
              timeTaken,
            }),
          });
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [quizAttemptId, answers, currentIndex, timeLeftArr, timeTaken, submitted]);

  // Option select
  const handleOptionSelect = (qId, optId) => {
    const isTimeOver = timeLeftArr[currentIndex] === 0;
    if (!submitted && !readOnly && !isTimeOver) {
      setAnswers((prev) => ({ ...prev, [qId]: optId }));
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setAutoNavigate(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setAutoNavigate(true);
    }
  };

  const handleQuestionNavigate = (index) => {
    setCurrentIndex(index);
    setAutoNavigate(false);
  };

  const handleSubmit = async () => {
    if (submitted) return;
    
    // Stop voice guidance when submitting
    window.speechSynthesis.cancel();
    
    let calculatedScore = 0;
    questions.forEach((q) => {
      if (answers[q._id] === q.correctOptionId) calculatedScore += 1;
    });
    setScore(calculatedScore);
    setSubmitted(true);

    if (!readOnly) {
      try {
        await fetch("http://localhost:8000/api/save-quiz-attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizAttemptId,
            answers: Object.entries(answers).map(([qId, optId]) => ({
              questionId: qId,
              selectedOptionId: optId,
            })),
            score: calculatedScore,
            timeTaken,
          }),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (questions.length === 0) return (
    <div className="flex justify-center items-center h-64 text-xl text-gray-600">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        Loading Quiz...
      </div>
    </div>
  );

  const currentQuestion = questions[currentIndex];
  const scorePct = Math.round((score / questions.length) * 100);
  const badge = getBadge(scorePct);
  const minutes = String(Math.floor(timeLeftArr[currentIndex] / 60)).padStart(2, "0");
  const seconds = String(timeLeftArr[currentIndex] % 60).padStart(2, "0");
  const isTimeOver = timeLeftArr[currentIndex] === 0;
  const isLastQuestion = currentIndex === questions.length - 1;

  const getQuestionStatus = (index) => {
    if (answers[questions[index]._id] !== undefined) return "answered";
    if (index === currentIndex) return "current";
    if (timeLeftArr[index] === 0) return "time-over";
    return "unanswered";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Static Navbar */}
      <Navbar />
      
      <div className="p-4 pt-6"> {/* Added pt-6 for some top padding */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-800 mb-2 text-center">Final Mock Quiz</h2>
          <p className="text-gray-600 text-center mb-8">Test your knowledge from weak areas</p>

          {!submitted && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Question Palette - Always Visible */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 text-lg">Question Palette</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      isTimeOver ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {isTimeOver ? 'Time Over' : `${minutes}:${seconds}`}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-3 mb-6">
                    {questions.map((_, index) => {
                      const status = getQuestionStatus(index);
                      const statusColors = {
                        answered: "bg-green-500 text-white shadow-green-200",
                        current: "bg-blue-500 text-white shadow-blue-200 ring-2 ring-blue-300",
                        "time-over": "bg-red-400 text-white shadow-red-200",
                        unanswered: "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      };
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleQuestionNavigate(index)}
                          className={`w-12 h-12 rounded-xl font-semibold transition-all duration-200 shadow-sm ${statusColors[status]} ${
                            status === 'time-over' ? 'hover:scale-105 cursor-pointer' : 'hover:scale-105'
                          }`}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded shadow-sm"></div>
                      <span className="text-gray-600">Answered</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded shadow-sm ring-2 ring-blue-300"></div>
                      <span className="text-gray-600">Current</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-400 rounded shadow-sm"></div>
                      <span className="text-gray-600">Time Over</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-200 rounded shadow-sm"></div>
                      <span className="text-gray-600">Unanswered</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{currentIndex + 1} / {questions.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Question Area */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-lg p-8">
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div>
                      <span className="text-sm text-gray-500 font-medium">Question {currentIndex + 1}</span>
                      <h3 className="text-xl font-semibold text-gray-800 mt-1">
                        {currentQuestion.questionText}
                      </h3>
                    </div>
                    {isTimeOver && (
                      <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-semibold">
                        Time's Up!
                      </div>
                    )}
                  </div>

                  {/* Options - Updated to make entire option clickable */}
                  <div className="space-y-4 mb-8">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = answers[currentQuestion._id] === opt.id;
                      const isDisabled = isTimeOver || readOnly;
                      
                      return (
                        <div 
                          key={opt.id} 
                          onClick={() => !isDisabled && handleOptionSelect(currentQuestion._id, opt.id)}
                          className={`flex items-center rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : isDisabled
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${currentQuestion._id}`}
                            value={opt.id}
                            checked={isSelected}
                            onChange={() => handleOptionSelect(currentQuestion._id, opt.id)}
                            disabled={isDisabled}
                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 ml-4"
                          />
                          <label className={`ml-4 text-gray-700 flex-1 py-4 px-4 ${
                            isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                          }`}>
                            {opt.text}
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <button
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="px-8 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>

                    {isLastQuestion ? (
                      <button
                        onClick={handleSubmit}
                        className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
                      >
                        Submit Quiz
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                      >
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {submitted && (
            <QuizReview 
              score={score}
              questions={questions}
              answers={answers}
              scorePct={scorePct}
              badge={badge}
              readOnly={readOnly}
              navigate={navigate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MockQuiz;