const { generateChapterPrompt, generateLessonPrompt } = require("../utils/generateCourse");
const { GoogleGenAI } = require("@google/genai");
const Session = require("../models/Session");
const Module = require("../models/Module");
const Chapter = require("../models/Chapter");
const Lesson = require("../models/Lesson");

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });


const generateModulesFromAI = async (req, res) => {
  try {
    const { sessionId, role, experience, skills, description } = req.body;

    if (!sessionId || !role || !experience || !skills || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log("🔹 Starting module generation for session:", sessionId);

    const session = await Session.findById(sessionId).populate("modules");
    if (!session) return res.status(404).json({ message: "Session not found" });

    const skillList = skills.split(",").map(s => s.trim().toLowerCase());
    const modules = [];

    for (const skill of skillList) {
      console.log("➡ Processing skill:", skill);

      // Check existing module
      let moduleDoc = await Module.findOne({ session: session._id, skill });
      console.log("Module found in DB:", !!moduleDoc);

      if (!moduleDoc) {
        console.log("⚡ No module found, creating new module for skill:", skill);

        // Generate chapters via AI
        const prompt = generateChapterPrompt(skill, role, experience, description);
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash-lite",
          contents: prompt,
        });

        let chaptersData = [];
        try {
          chaptersData = JSON.parse(
            response.text.replace(/^```json\s*/, "").replace(/```$/, "").trim()
          );
        } catch (err) {
          console.error(`❌ Failed to parse chapters for skill "${skill}":`, response.text);
        }

        // Create new module
        moduleDoc = await Module.create({ skill, session: session._id, chapters: [] });
        console.log("Module created:", moduleDoc._id);

        // Create chapters dynamically
        for (const ch of chaptersData) {
          const chapterDoc = await Chapter.create({
            chapterTitle: ch.chapterTitle,
            chapterDescription: ch.chapterDescription,
            module: moduleDoc._id,
          });
          moduleDoc.chapters.push(chapterDoc._id);
          console.log("Chapter created:", chapterDoc.chapterTitle, chapterDoc._id);
        }

        await moduleDoc.save();
        console.log("Module saved with chapters:", moduleDoc._id, moduleDoc.chapters.length);
      }

      // Link module to session if not already linked
      if (!session.modules.some(id => id.toString() === moduleDoc._id.toString())) {
        session.modules.push(moduleDoc._id);
        console.log("Module linked to session:", moduleDoc._id);
      } else {
        console.log("Module already linked to session, skipping:", moduleDoc._id);
      }

      modules.push(moduleDoc);
    }

    await session.save();
    console.log("✅ Session saved with modules:", session.modules.length);

    res.status(200).json({ success: true, modules });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate modules", error: err.message });
  }
};


// ------------------ Generate Lesson and save to DB ------------------
const generateLessonFromAI = async (req, res) => {
  try {
    const { moduleId, chapterId, sessionId, skill, chapterTitle, chapterDescription, experience } = req.body;

    if (!moduleId || !chapterId || !sessionId || !skill || !chapterTitle || !chapterDescription) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ message: "Module not found" });

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Check if lesson already exists for chapter
    let lessonDoc = await Lesson.findOne({ module: moduleId, chapter: chapterId });
    if (lessonDoc) return res.json(lessonDoc);

    // Generate lesson via AI
    const prompt = generateLessonPrompt(skill, chapterTitle, chapterDescription, experience);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });

    let lessonData;
    try {
      lessonData = JSON.parse(
        response.text.replace(/^```json\s*/, "").replace(/```$/, "").trim()
      );
    } catch (err) {
      console.error(`❌ Failed to parse lesson JSON:`, response.text);
      lessonData = {
        lessonContent: response.text,
        resources: [],
      };
    }

    // Save lesson with resources
    lessonDoc = await Lesson.create({
      skill,
      chapterTitle,
      chapterDescription,
      lessonContent: lessonData.lessonContent || response.text,
      resources: lessonData.resources || [],
      module: module._id,
      chapter: chapterId,
      session: session._id,
    });

    // ✅ No need to push lesson ID into module

    res.status(200).json(lessonDoc);
  } catch (err) {
    console.error(`❌ Error generating lesson for "${req.body.chapterTitle}":`, err);
    res.status(500).json({ message: "Failed to generate lesson", error: err.message });
  }
};

// ------------------ GET Module by Session & Skill ------------------
const getModuleBySessionAndSkill = async (req, res) => {
  try {
    const { sessionId, skill } = req.params;

    const module = await Module.findOne({ session: sessionId, skill })
      .populate("chapters"); // no lessons
    if (!module) return res.status(404).json({ message: "Module not found" });
    res.json(module);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch module", error: err.message });
  }
};

// ------------------ GET Lesson by Module and Chapter ------------------
const getLessonByModuleAndChapter = async (req, res) => {
  try {
    const { moduleId, chapterId } = req.params;

    const lesson = await Lesson.findOne({ module: moduleId, chapter: chapterId });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch lesson", error: err.message });
  }
};

module.exports = {
  generateModulesFromAI,
  generateLessonFromAI,
  getModuleBySessionAndSkill,
  getLessonByModuleAndChapter,
};
