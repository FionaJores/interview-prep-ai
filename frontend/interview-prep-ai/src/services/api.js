import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getQuestions = (topic, difficulty, lessonId, userId) => {
  if (!lessonId) {
    throw new Error("lessonId is required to fetch questions");
  }
  return api.get(
    `/api/questions/${encodeURIComponent(topic)}?difficulty=${difficulty}&lessonId=${lessonId}&userId=${userId}`
  );
};



// ✅ Save test result
export const saveTestResult = (testData) => {
  console.log(testData);
  return api.post('/api/test-results', testData);
};

// ✅ Get test results for a user
export const getTestResults = (userId) => {
  return api.get(`/api/test-results/${userId}`);
};


export default api;
