const express = require('express');
const router = express.Router();
const Question = require('../models/Quiz');
const mongoose = require('mongoose');
const TestResult = require('../models/TestResult');
const { generateQuestions } = require('../services/geminiService');

// ✅ GET QUESTIONS BY TOPIC
router.get('/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    const { difficulty = 5, lessonId, chapterId, userId } = req.query;
    //console.log(chapterId);

    if (!userId) return res.status(400).json({ message: 'userId is required' });

    if (!lessonId || !mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: 'Invalid or missing lessonId' });
    }

    if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
      return res.status(400).json({ message: 'Invalid or missing chapterId' });
    }

    // Check if test already attempted
    const existingResult = await TestResult.findOne({
      user: userId,
      lessonId,
      chapterId,
      attempt: true,
    });
   //console.log(existingResult);
    if (existingResult) {
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
        chapterId: existingResult.chapterId,
        score: existingResult.score,
        totalQuestions: existingResult.totalQuestions,
        answers: populatedAnswers,
      });
    }

    // Fetch existing questions
    let questions = await Question.find({ lessonId, chapterId });

    // If insufficient, generate more questions
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
          chapterId,
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
      chapterId,
      questions: questions.slice(0, 10),
    });

  } catch (error) {
    console.error('❌ Error in /api/questions route:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ GENERATE QUESTIONS USING GEMINI API
router.post('/generate/:topic', async (req, res) => {
  try {
    const { topic } = req.params;
    const { count = 10, difficulty = 5, lessonId, chapterId } = req.body;

    if (!lessonId || !chapterId) {
      return res.status(400).json({ message: 'lessonId and chapterId are required' });
    }

    const generatedQuestions = await generateQuestions(topic, count, difficulty);

    const questionsWithIds = generatedQuestions.map(q => ({
      ...q,
      lessonId,
      chapterId,
      topic,
      difficulty: parseInt(difficulty),
    }));

    const savedQuestions = await Question.insertMany(questionsWithIds);

    res.status(201).json(savedQuestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ GET ALL QUESTIONS
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
