const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  generateModulesFromAI,
  generateLessonFromAI,
  getModuleBySessionAndSkill,
  getLessonByModuleAndChapter,
} = require("../controllers/courseController");

const router = express.Router();

// ------------------ POST Routes ------------------
// Generate modules (AI + save to DB)
router.post("/generate-modules", protect, generateModulesFromAI);

// Generate lesson (AI + save to DB)
router.post("/generate-lesson", protect, generateLessonFromAI);


router.get("/modules/:sessionId/:skill", protect, getModuleBySessionAndSkill);

router.get("/lessons/:moduleId/:chapterId", protect, getLessonByModuleAndChapter);


module.exports = router;
