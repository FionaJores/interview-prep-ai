const questionAnswerPrompt = (role, experience, topicsToFocus, numberOfQuestions) =>(`
    You are an AI trained to generate technical interview questions and answers. 

    Task: 
    - Role: ${role} 
    - Candidate Experience: ${experience} years 
    - Focus Topics: ${topicsToFocus}
    - Write ${numberOfQuestions} interview questions. 
    - For each question, generate a detailed but beginner-friendly answer. 
    - If the answer needs a code example, add a small code block inside. 
    - Keep formatting very clean. 
    - Return a pure JSON array like: 
    [
        {
            "question": "Question here?", 
            "answer": "Answer here." 
        },
        ....
    ]
    Important: Do NOT add any extra text. Only return valid JSON. 
`)

const conceptExplainPrompt = (question) => (`
You are an Al trained to generate explanations for a given interview question. 

Task: 

- Explain the following interview question and its concept in depth as if you're teaching a beginner developer. 
- Question: "${question}"
- After the explanation, provide a short and clear title that summarizes the concept for the article or page header.
- If the explanation includes a code example, provide a small code block. 
- Keep the formatting very clean and clear. 
- Return the result as a valid 350N object in the following format: 
{
    "title": "Short title here?", 
    "explanation": "Explanation here." 
}
Important: Do NOT add any extra text outside the JSON format. Only return valid JSON. 
`);
const analyzePrompt = `
You are an experienced Technical HR Manager. Analyze the provided resume against the job description.
Return ONLY a JSON object in the following format:

{
  "alignment": [/* key skills matching job requirements */],
  "strengths": [/* candidate's strengths */],
  "weaknesses": [/* gaps or missing skills */],
  "overallFit": {
    "recommendation": "Highly Suitable / Moderately Suitable / Not Suitable",
    "reasoning": "Short reasoning here."
  }
}

Do NOT include any extra text. Ensure the output is valid JSON.
`;

const improvePrompt = `
You are a Technical Career Advisor. Based on the resume and job description, provide actionable advice.
Return ONLY a JSON object in the following format:

{
  "skillGaps": [/* missing skills, tools, certifications */],
  "certifications": [
    "AWS Certified Solutions Architect",
    "Microsoft Azure Fundamentals",
    "Google Cloud Associate Engineer",
    "Coursera/edX Full-Stack Web Development Specialization",
    "Udemy Advanced ReactJS & Node.js Courses",
    "Certified Scrum Master (CSM)"
  ],
  "learningPath": [/* actionable steps, courses, projects, internships */],
  "emergingTrends": [/* trends, tools, frameworks to explore */],
  "softSkillsImprovement": [/* communication, teamwork, leadership */],
  "topPriorities": [/* top 3 actionable steps */]
}

Do NOT include any extra text. Ensure the output is valid JSON.
`;

const matchPrompt = `
You are an ATS evaluator. Compare the resume against the job description.
Return ONLY a JSON object in the following format:

{
  "matchPercentage": 0, 
  "missingKeywords": [/*skills/tools/certifications missing from resume */],
  "summary": "Short summary of strengths, weaknesses, and overall suitability."
}

Do NOT include any extra text. Ensure the output is valid JSON.
`;




module.exports = { questionAnswerPrompt, conceptExplainPrompt,analyzePrompt,matchPrompt,improvePrompt };