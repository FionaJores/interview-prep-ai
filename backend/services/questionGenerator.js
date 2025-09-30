const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Generate questions using Gemini or fallback
const generateQuestions = async (topic, count = 5, initialDifficulty = 5) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Generate ${count} multiple-choice questions on the topic "${topic}" with difficulty levels.
    Each question should include:
    - questionText
    - options (4)
    - correctAnswer (one)
    - difficulty (1–10)
    - explanation

    Format as JSON array only.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("No text returned from Gemini API");

    // clean JSON
    let cleaned = text.trim().replace(/```json|```/g, "");
    const first = cleaned.indexOf("[");
    const last = cleaned.lastIndexOf("]");
    if (first !== -1 && last !== -1) cleaned = cleaned.substring(first, last + 1);

    const questions = JSON.parse(cleaned);

    return questions.map((q) => ({
      questionText: q.questionText || "No question text",
      options: Array.isArray(q.options) ? q.options : ["Option A", "B", "C", "D"],
      correctAnswer: q.correctAnswer || (Array.isArray(q.options) ? q.options[0] : "Option A"),
      difficulty: typeof q.difficulty === "number" ? q.difficulty : initialDifficulty,
      explanation: q.explanation || "No explanation",
    }));
  } catch (error) {
    console.error("AI generation failed, using fallback:", error);
    // fallback generator
    const questions = [];
    for (let i = 0; i < count; i++) {
      questions.push({
        questionText: `Sample question about ${topic} (Difficulty ${initialDifficulty})`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        difficulty: initialDifficulty,
        explanation: `Because Option A is correct for ${topic}.`,
      });
    }
    return questions;
  }
};

module.exports = { generateQuestions };
