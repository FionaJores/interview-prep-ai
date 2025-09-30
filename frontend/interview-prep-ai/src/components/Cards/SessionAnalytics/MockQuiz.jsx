import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  const [showQuestionPalette, setShowQuestionPalette] = useState(false);
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
        } else if (currentIndex < questions.length - 1) {
          setCurrentIndex((i) => i + 1);
        }
        return newArr;
      });
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeftArr, currentIndex, submitted, questions, readOnly]);

  // Voice reading
  useEffect(() => {
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
  }, [currentIndex, questions]);

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
    if (!submitted && !readOnly && timeLeftArr[currentIndex] > 0) {
      setAnswers((prev) => ({ ...prev, [qId]: optId }));
    }
  };

  const handleNext = () => currentIndex < questions.length - 1 && setCurrentIndex((i) => i + 1);
  const handlePrev = () => currentIndex > 0 && setCurrentIndex((i) => i - 1);

  const handleQuestionNavigate = (index) => {
    setCurrentIndex(index);
    setShowQuestionPalette(false);
  };

  const handleSubmit = async () => {
    if (submitted) return;
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

  const handleRestart = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/restart-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userId, weakChapters }),
      });
      const data = await res.json();
      const questionsWithIds = data.questions.map((q, qIndex) => ({
        ...q,
        _id: q._id || qIndex,
        options: q.options.map((opt, oIndex) => ({
          id: oIndex,
          text: typeof opt === "string" ? opt : opt.text,
        })),
      }));
      setQuestions(questionsWithIds);
      setQuizAttemptId(data.quizAttempt._id);
      setCurrentIndex(0);
      setAnswers({});
      setTimeLeftArr(Array(questionsWithIds.length).fill(60));
      setTimeTaken(0);
      setSubmitted(false);
      setReadOnly(false);
      setShowQuestionPalette(false);
    } catch (err) {
      console.error("Failed to restart quiz:", err);
    }
  };

  if (questions.length === 0) return <div className="flex justify-center items-center h-64 text-xl">Loading Quiz...</div>;

  const currentQuestion = questions[currentIndex];
  const scorePct = Math.round((score / questions.length) * 100);
  const badge = getBadge(scorePct);
  const minutes = String(Math.floor(timeLeftArr[currentIndex] / 60)).padStart(2, "0");
  const seconds = String(timeLeftArr[currentIndex] % 60).padStart(2, "0");

  const getQuestionStatus = (index) => {
    if (answers[questions[index]._id] !== undefined) return "answered";
    if (index === currentIndex) return "current";
    return "unanswered";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Final Mock Quiz</h2>

      {!submitted && (
        <div className="space-y-6">
          {/* Header with Timer and Progress */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-lg font-semibold text-gray-700">
                Time Left: <span className="text-red-600">{minutes}:{seconds}</span>
              </div>
              <div className="text-sm text-gray-600">
                Question {currentIndex + 1} of {questions.length}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex gap-4">
            {/* Main Question Area */}
            <div className="flex-1 bg-white rounded-xl shadow-md p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {currentQuestion.questionText}
                </h3>
                <div className="space-y-3">
                  {currentQuestion.options.map((opt) => (
                    <div key={opt.id} className="flex items-center">
                      <input
                        type="radio"
                        name={`q-${currentQuestion._id}`}
                        value={opt.id}
                        checked={answers[currentQuestion._id] === opt.id}
                        onChange={() => handleOptionSelect(currentQuestion._id, opt.id)}
                        disabled={readOnly || timeLeftArr[currentIndex] === 0}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                      />
                      <label className="ml-3 text-gray-700 cursor-pointer flex-1 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                        {opt.text}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <button
                  onClick={() => setShowQuestionPalette(!showQuestionPalette)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Question Palette
                </button>

                {currentIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>

            {/* Question Palette Sidebar */}
            {showQuestionPalette && (
              <div className="w-64 bg-white rounded-xl shadow-md p-4 h-fit">
                <h4 className="font-semibold text-gray-800 mb-3">Question Palette</h4>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    const statusColors = {
                      answered: "bg-green-500 text-white",
                      current: "bg-blue-500 text-white",
                      unanswered: "bg-gray-200 text-gray-700"
                    };
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleQuestionNavigate(index)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all hover:scale-105 ${statusColors[status]}`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <span>Unanswered</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {submitted && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Quiz Submitted!</h3>
            <p className="text-lg text-gray-600 mb-4">
              Score: <span className="font-semibold">{score}</span> / {questions.length} ({scorePct}%)
            </p>
            <div className={`inline-flex items-center px-4 py-2 rounded-full font-semibold ${badge.color}`}>
              {badge.name}
            </div>
          </div>

          {/* Quiz Review */}
          <div className="mt-6 max-h-96 overflow-y-auto space-y-4 pr-2">
            {questions.map((q, index) => (
              <div key={q._id} className="p-4 border border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-800 mb-3">
                  Q{index + 1}: {q.questionText}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const isCorrect = opt.id === q.correctOptionId;
                    const isSelected = answers[q._id] === opt.id;
                    let bgColor = "bg-white";
                    
                    if (isCorrect) bgColor = "bg-green-100 border border-green-300";
                    else if (isSelected) bgColor = "bg-red-100 border border-red-300";
                    
                    return (
                      <p
                        key={opt.id}
                        className={`p-3 rounded-lg ${bgColor} transition-colors`}
                      >
                        {opt.text}
                        {isCorrect && " ✓"}
                        {isSelected && !isCorrect && " ✗"}
                      </p>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-600 mt-3 p-2 bg-gray-50 rounded">
                  <span className="font-medium">Explanation:</span> {q.explanation}
                </p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            {readOnly && (
              <button
                onClick={handleRestart}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Restart Quiz
              </button>
            )}
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockQuiz;