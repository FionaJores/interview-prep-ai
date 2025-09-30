// models/FinalQuiz.js
const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  id: Number,       // Option number (1,2,3,4)
  text: String      // Option text
});

const finalQuizSchema = new mongoose.Schema({
 sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  questionText: { type: String, required: true },
  options: [optionSchema],                           // 4 options
  correctOptionId: { type: Number, required: true },// ID of correct option
  difficulty: { type: Number, default: 5 },         // 1-10
  explanation: { type: String, default: "" }        // Explanation of correct answer
}, { timestamps: true });

module.exports = mongoose.model("FinalQuiz", finalQuizSchema);
