const express = require('express');
const router = express.Router();
const Question = require('../models/Quiz');
const mongoose = require('mongoose');
const TestResult=require('../models/TestResult')
const { generateQuestions } = require('../services/geminiService');

// ✅ GET QUESTIONS WITH LESSON ID'
router.get('/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    const { difficulty = 5, lessonId, userId } = req.query;

    

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // ✅ Validate lessonId
    if (!lessonId || !mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: 'Invalid or missing lessonId' });
    }

    // ✅ Check if test already attempted
    const existingResult = await TestResult.findOne({
      user: userId,
      lessonId,
      attempt: true,
    });

    if (existingResult) {
      // Populate answers with question + explanation
      const populatedAnswers = await Promise.all(
        existingResult.answers.map(async (ans) => {
          const q = await Question.findById(ans.questionId).lean();
          return {
            questionId: ans.questionId,
            questionText: q?.questionText || '',
            options: q?.options || [],
            correctAnswer: q?.correctAnswer || '',
            explanation: q?.explanation || 'No explanation provided',
            selectedAnswer: ans.selectedAnswer,
            isCorrect: ans.isCorrect,
            difficulty: ans.difficulty,
          };
        })
      );

      return res.json({
        attempted: true,
        topic: existingResult.topic,
        lessonId: existingResult.lessonId,
        score: existingResult.score,
        totalQuestions: existingResult.totalQuestions,
        answers: populatedAnswers,
      });
    }

    // ✅ If not attempted, fetch/generate quiz
    let questions = await Question.find({ lessonId });

    if (questions.length === 0) {
      questions = await Question.aggregate([
        { $match: { topic: new RegExp(topic, 'i') } },
        { $addFields: { diff: { $abs: { $subtract: ["$difficulty", parseInt(difficulty)] } } } },
        { $sort: { diff: 1 } },
        { $limit: 10 },
      ]);
    }

    if (questions.length < 10) {
      const remaining = 10 - questions.length;
      let generated = [];
      try {
        generated = await generateQuestions(topic, remaining, difficulty);
      } catch (err) {
        console.error('Gemini error:', err);
      }

      if (generated.length > 0) {
        const toSave = generated.map(q => ({
          ...q,
          lessonId,
          topic,
          difficulty: parseInt(difficulty),
        }));
        const saved = await Question.insertMany(toSave);
        questions = [...questions, ...saved];
      }
    }

    res.json({
      attempted: false,
      topic,
      lessonId,
      questions: questions.slice(0, 10),
    });
  } catch (error) {
    console.error('❌ Error in /api/questions route:', error);
    res.status(500).json({ message: error.message });
  }
});

// Generate questions with Gemini API
router.post('/generate/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    const { count = 10, difficulty = 5, lessonId } = req.body; // ✅ Accept lessonId

    const generatedQuestions = await generateQuestions(topic, count, difficulty);

    const questionsWithLessonId = generatedQuestions.map(q => ({
      ...q,
      lessonId: lessonId || null
    }));

    const savedQuestions = await Question.insertMany(questionsWithLessonId);

    res.status(201).json(savedQuestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
