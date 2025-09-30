const { GoogleGenerativeAI } = require("@google/generative-ai");
const { v4: uuidv4 } = require('uuid');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const generateQuestions = async (topic, count = 10, initialDifficulty = 5) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

   const prompt = `
You are a JSON generator. 
Return your answer as a **valid JSON array only**, no markdown, no code fences, no commentary.

Generate ${count} multiple-choice questions on the topic "${topic}" with varying difficulty levels.

Each array element must be an object with exactly these fields:
- questionText (string)
- options (array of exactly 4 strings)
- correctAnswer (string, must match one option exactly)
- difficulty (integer 1–10)
- explanation (string, why the correct answer is right)

Use the following difficulty levels:
- Question 1: ${initialDifficulty}
- Questions 2–3: ${initialDifficulty} ± 1
- Questions 4–6: ${initialDifficulty} ± 2
- Questions 7–8: ${initialDifficulty} ± 3
- Questions 9–10: ${initialDifficulty} ± 4

Example format (no text outside the array):

[
  {
    "questionText": "Question text here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "Correct option text",
    "difficulty": 1,
    "explanation": "Reason why this is the correct answer"
  }
]

Return **only** the JSON array above, with ${count} objects for "${topic}".
`;


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) throw new Error('No text returned from Gemini API');

    // Clean JSON if extra formatting exists
    let cleanedText = text.trim().replace(/```json|```/g, '');
    const firstBracket = cleanedText.indexOf('[');
    const lastBracket = cleanedText.lastIndexOf(']');
    
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanedText = cleanedText.substring(firstBracket, lastBracket + 1);
    }

    const questions = JSON.parse(cleanedText);

    if (!Array.isArray(questions)) throw new Error('Generated questions are not an array');

    // ✅ include explanation when mapping
    return questions.map(q => ({
      topic: topic,
      questionText: q.questionText || 'No question text provided',
      options: Array.isArray(q.options) ? q.options : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: q.correctAnswer || (Array.isArray(q.options) ? q.options[0] : 'Option 1'),
      difficulty: typeof q.difficulty === 'number' ? q.difficulty : initialDifficulty,
      explanation: q.explanation || 'No explanation provided'
    }));

  } catch (error) {
    console.error('Error generating questions with Gemini:', error);
    return generateFallbackQuestions(topic, count, initialDifficulty);
  }
};

// ✅ Fixed fallback generator also returns explanation
const generateFallbackQuestions = (topic, count = 10, initialDifficulty = 5) => {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    // Calculate difficulty
    let difficulty;
    if (i === 0) {
      difficulty = initialDifficulty;
    } else if (i >= 1 && i <= 2) {
      difficulty = initialDifficulty + (Math.random() > 0.5 ? 1 : -1);
    } else if (i >= 3 && i <= 5) {
      difficulty = initialDifficulty + (Math.random() > 0.5 ? 2 : -2);
    } else if (i >= 6 && i <= 7) {
      difficulty = initialDifficulty + (Math.random() > 0.5 ? 3 : -3);
    } else {
      difficulty = initialDifficulty + (Math.random() > 0.5 ? 4 : -4);
    }
    difficulty = Math.max(1, Math.min(10, difficulty));
    
    questions.push({
      topic: topic,
      questionText: `Sample question about ${topic} (Difficulty: ${difficulty})`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      difficulty: difficulty,
      explanation: `Because "Option A" is the correct conceptual answer for ${topic}.`
    });
  }
  
  return questions;
};

module.exports = {
  generateQuestions
};
