const express = require("express");
const router = express.Router();
const { getQuiz, saveQuizAttempt, saveProgress } = require("../controllers/quizController");

router.post("/get-quiz", getQuiz);
router.post("/save-quiz-attempt", saveQuizAttempt);
router.post("/save-progress", saveProgress);

module.exports = router;
