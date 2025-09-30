const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const quizSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
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
  questionText: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr) {
        return arr.length === 4; // Exactly 4 options
      },
      message: 'Options array must contain exactly 4 items'
    }
  },
  correctAnswer: {
    type: String,
    required: true
  },
  difficulty: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
   explanation: {
    type: String,
    default: ''  // ✅ Optional field
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
