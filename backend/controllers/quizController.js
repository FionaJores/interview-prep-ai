const mongoose = require("mongoose");
const { generateQuestions } = require("../services/questionGenerator");
const Session = require("../models/Session");
const QuizAttempt = require("../models/QuizAttempt");
const FinalQuiz = require("../models/FinalQuiz");

// Helper: generate or reuse questions for a session
const generateQuestionsForSession = async (sessionObjId, weakChapters = []) => {
  const questions = [];

  // Fetch already saved questions for this session
  const existingQuestions = await FinalQuiz.find({ sessionId: sessionObjId });

  const addQuestion = async (q, sessionObjId) => {
    if (questions.length >= 15) return null; // stop if we already have 15

    let savedQ = existingQuestions.find((eq) => eq.questionText === q.questionText);

    if (!savedQ) {
      q.sessionId = sessionObjId;
      q.options = Array.isArray(q.options)
        ? q.options.map((opt, idx) =>
            typeof opt === "string" || typeof opt === "number"
              ? { id: idx, text: String(opt) }
              : opt
          )
        : [{ id: 0, text: "Option 1" }];
      q.correctOptionId =
        q.correctAnswer !== undefined
          ? q.options.findIndex((o) => o.text === q.correctAnswer) || 0
          : 0;

      savedQ = await FinalQuiz.findOneAndUpdate(
        { sessionId: sessionObjId, questionText: q.questionText },
        { $setOnInsert: q },
        { upsert: true, new: true }
      );

      existingQuestions.push(savedQ); // add to existing so next loop reuses
    }

    questions.push(savedQ);
    return savedQ;
  };

  if (weakChapters.length > 0) {
    const perChapter = Math.floor(15 / weakChapters.length);
    const remainder = 15 % weakChapters.length;

    for (let i = 0; i < weakChapters.length; i++) {
      if (questions.length >= 15) break; // stop if 15 reached

      const chapter = weakChapters[i];
      const count = perChapter + (i === 0 ? remainder : 0);
      const chapterQuestions = await generateQuestions(chapter.title, count, count);

      for (const q of chapterQuestions) {
        if (questions.length >= 15) break; // stop if 15 reached
        await addQuestion(q, sessionObjId);
      }
    }
  } else {
    const session = await Session.findById(sessionObjId).populate("modules");
    if (!session) throw new Error("Session not found");

    const moduleNames = session.modules.map(
      (mod) => mod.skill || mod.moduleTitle || "Untitled Module"
    );

    for (let i = 0; i < moduleNames.length; i++) {
      if (questions.length >= 15) break; // stop if 15 reached

      const moduleName = moduleNames[i];
      const count = 15 - questions.length; // generate only as many as needed
      const moduleQuestions = await generateQuestions(moduleName, count, count);

      for (const q of moduleQuestions) {
        if (questions.length >= 15) break; // stop if 15 reached
        await addQuestion(q, sessionObjId);
      }
    }
  }

  return questions; // already max 15
};


// 1️⃣ Get quiz
const getQuiz = async (req, res) => {
  try {
    const { weakChapters = [], sessionId, userId } = req.body;
    if (!sessionId || !userId)
      return res.status(400).json({ message: "Session ID and User ID required" });

    const sessionObjId = new mongoose.Types.ObjectId(sessionId);
    const userObjId = new mongoose.Types.ObjectId(userId);

    // Completed attempt
    let quizAttempt = await QuizAttempt.findOne({
      userId: userObjId,
      sessionId: sessionObjId,
      completed: true,
    }).populate("questions");

    if (quizAttempt) {
      return res.json({
        quizAttempt,
        questions: quizAttempt.questions,
        readOnly: true,
      });
    }

    // Incomplete attempt
    quizAttempt = await QuizAttempt.findOne({
      userId: userObjId,
      sessionId: sessionObjId,
      completed: false,
    }).populate("questions");

    if (quizAttempt) {
      return res.json({
        quizAttempt,
        questions: quizAttempt.questions,
        readOnly: false,
      });
    }

    // No attempt → generate new questions
    const questions = await generateQuestionsForSession(sessionObjId, weakChapters);

    // Create attempt atomically to avoid duplicates
    quizAttempt = await QuizAttempt.findOneAndUpdate(
      { userId: userObjId, sessionId: sessionObjId },
      {
        $setOnInsert: {
          questions: questions.map((q) => q._id),
          answers: [],
          score: 0,
          completed: false,
          currentIndex: 0,
          timeLeftArr: Array(questions.length).fill(60),
          timeTaken: 0,
        },
      },
      { new: true, upsert: true }
    ).populate("questions");

    res.json({ quizAttempt, questions, readOnly: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get quiz" });
  }
};

// 2️⃣ Submit quiz
const saveQuizAttempt = async (req, res) => {
  try {
    const { quizAttemptId, answers, score, timeTaken } = req.body;
    const attempt = await QuizAttempt.findById(quizAttemptId);
    if (!attempt) return res.status(404).json({ message: "Quiz attempt not found" });
    if (attempt.completed)
      return res.status(403).json({ message: "Attempt already submitted" });

    attempt.answers = answers;
    attempt.score = score;
    attempt.completed = true;
    attempt.timeTaken = timeTaken;
    await attempt.save();

    res.json({ message: "Quiz submitted successfully", score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save quiz attempt" });
  }
};

// 3️⃣ Save progress
const saveProgress = async (req, res) => {
  try {
    const { quizAttemptId, answers, currentIndex, timeLeftArr, timeTaken } = req.body;
    const attempt = await QuizAttempt.findById(quizAttemptId);
    if (!attempt) return res.status(404).json({ message: "Quiz attempt not found" });
    if (attempt.completed)
      return res.status(403).json({ message: "Attempt already submitted" });

    attempt.answers = answers;
    attempt.currentIndex = currentIndex;
    attempt.timeLeftArr = timeLeftArr;
    attempt.timeTaken = timeTaken;
    await attempt.save();

    res.json({ message: "Progress saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save progress" });
  }
};

module.exports = { getQuiz, saveQuizAttempt, saveProgress };
