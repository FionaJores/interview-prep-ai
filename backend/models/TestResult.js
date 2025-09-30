const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const testResultSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  answers: [{
    questionId: {
      type: String, // Matches Quiz _id which is String
      ref: 'Quiz',
      required: true
    },
    selectedAnswer: {
      type: String
    },
    isCorrect: {
      type: Boolean
    },
    difficulty: {
      type: Number
    }
  }],
  date: {
    type: Date,
    default: Date.now
  },
  attempt: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TestResult', testResultSchema);
