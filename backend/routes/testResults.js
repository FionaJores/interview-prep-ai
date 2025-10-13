const express = require('express');
const router = express.Router();
const TestResult = require('../models/TestResult');
const Quiz = require('../models/Quiz'); // ✅ To fetch question details

// ✅ Create or return existing attempt
router.post('/', async (req, res) => {
  try {
    const { userId, lessonId, chapterId } = req.body;
    //console.log(chapterId,userId,lessonId);

    if (!userId || !lessonId || !chapterId) {
      return res.status(400).json({ message: 'userId, lessonId, and chapterId are required' });
    }

    // ✅ Check if an attempt already exists for this user, lesson, and chapter
    let existingResult = await TestResult.findOne({ 
      user: userId, 
      lessonId, 
      chapterId, 
      attempt: true 
    });

    if (existingResult) {
      const populatedResult = await populateAnswerDetails(existingResult);
      return res.status(200).json({
        message: 'Existing attempt found',
        result: populatedResult
      });
    }

    // ✅ Prepare new attempt
    const testData = {
      ...req.body,
      user: userId,
      attempt: true
    };
    delete testData.userId;

    const newTestResult = new TestResult(testData);
    //console.log(newTestResult);
    const savedResult = await newTestResult.save();

    const populatedResult = await populateAnswerDetails(savedResult);

    res.status(201).json({
      message: 'New test result saved',
      result: populatedResult
    });

  } catch (error) {
    console.error('Error saving/retrieving test result:', error);
    res.status(400).json({ message: error.message });
  }
});


router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const results = await TestResult.find({ user: userId }).sort({ date: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Function to populate question details inside answers
async function populateAnswerDetails(testResult) {
  const populatedAnswers = await Promise.all(
    testResult.answers.map(async (ans) => {
      const question = await Quiz.findById(ans.questionId).lean();
      return {
        questionId: ans.questionId,
        questionText: question?.questionText || '',
        options: question?.options || [],
        correctAnswer: question?.correctAnswer || '',
        selectedAnswer: ans.selectedAnswer,
        isCorrect: ans.isCorrect,
        difficulty: ans.difficulty
      };
    })
  );

  return {
    ...testResult.toObject(),
    answers: populatedAnswers
  };
}

module.exports = router;
