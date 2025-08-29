// api.js
const API_BASE_URL = "http://localhost:8000"; // Your Streamlit server

export const api = {
  analyze: async (jobDescription, resumeFile) => {
    const formData = new FormData();
    formData.append("job_description", jobDescription);
    formData.append("resume", resumeFile);
    
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error("Analysis failed");
    }
    
    return response.json();
  },
  
  improve: async (jobDescription, resumeFile) => {
    const formData = new FormData();
    formData.append("job_description", jobDescription);
    formData.append("resume", resumeFile);
    
    const response = await fetch(`${API_BASE_URL}/improve`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error("Improvement analysis failed");
    }
    
    return response.json();
  },
  
  match: async (jobDescription, resumeFile) => {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    console.log(jobDescription);
    formData.append("resume", resumeFile);
    
    const response = await fetch(`${API_BASE_URL}/match`, {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error("Match analysis failed");
    }
    
    const data = await response.json();
    console.log(data.matchPercentage);
    // Extract match percentage from the result if not provided directly
    if (!data.matchPercentage && data.result) {
      data.matchPercentage = extractMatchPercentage(data.result);
    }
    
    return data;
  }
};

// Helper function to extract match percentage (same as in component)
function extractMatchPercentage(responseText) {
  const patterns = [
    /Match Percentage:\s*(\d+)%/,
    /Match Percentage\s*:\s*(\d+)%/,
    /(\d+)%\s*(?:match|Match)/,
    /Match:\s*(\d+)%/
  ];
  
  for (const pattern of patterns) {
    const match = responseText.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  const numbers = responseText.match(/\b(\d{1,2}|100)\b/g);
  if (numbers) {
    for (const num of numbers) {
      const numVal = parseInt(num);
      if (numVal >= 0 && numVal <= 100) {
        return numVal;
      }
    }
  }
  
  return 0;
}