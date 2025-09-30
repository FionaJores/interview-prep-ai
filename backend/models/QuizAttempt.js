// models/QuizAttempt.js
const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "FinalQuiz" },
  selectedOptionId: Number
});

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "FinalQuiz" }],
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  currentIndex: { type: Number, default: 0 },
timeLeftArr: { type: [Number], default: [] },

  timeTaken: { type: Number, default: 0 }           
}, { timestamps: true });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
