// generateCourse.js

/**
 * Generate structured chapters for a technical course
 */
const generateChapterPrompt = (skill, role, experience, description) => (`
You are an AI that generates structured chapters for a technical course.

Task:
- Skill: "${skill}"
- Role: "${role}"
- Experience: "${experience} years"
- Description: "${description}"

Rules:
1. Generate 5–8 chapters for this skill.
2. Each chapter should have:
   {
     "chapterTitle": "Title of the chapter",
     "chapterDescription": "Brief explanation of what will be learned in this chapter."
   }
3. Do NOT include code, examples, diagrams, or resources inside "chapterDescription". 
   Keep it short and descriptive only.

Return a JSON array of chapters only, no extra text.
`);

/**
 * Generate detailed lesson content for a specific chapter
 */
const generateLessonPrompt = (skill, chapterTitle, chapterDescription, experience) => (`
You are an AI that generates a detailed lesson for a technical development course.

Task:
- Skill: "${skill}"
- Chapter Title: "${chapterTitle}"
- Chapter Description: "${chapterDescription}"
- Candidate Experience: "${experience} years"

Rules:
1. "lessonContent" must contain ONLY the detailed explanation of the lesson:
   - Step-by-step explanations
   - Code examples (if relevant)
   - Diagrams or flowcharts described in text
   ❌ Do NOT include the chapter title anywhere in "lessonContent"
   ❌ Do NOT include resources here
2. "resources" must be a separate array containing notes, links, or videos.

Return a JSON object exactly in this format:
{
  "chapterTitle": "${chapterTitle}",
  "lessonContent": "Full lesson content ONLY (no resources, no chapter title)",
  "resources": [
    { "type": "note", "label": "Key takeaway", "content": "..." },
    { "type": "link", "label": "Reference link", "content": "https://..." },
    { "type": "video", "label": "Tutorial video", "content": "https://..." }
  ]
}

- Only return JSON, no extra text.
`);

module.exports= { generateChapterPrompt, generateLessonPrompt };
