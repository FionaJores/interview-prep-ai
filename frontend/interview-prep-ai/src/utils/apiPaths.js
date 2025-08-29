export const BASE_URL = "http://localhost:8000";

export const API_PATHS = { 
    AUTH: {
        REGISTER: "/api/auth/register", 
        LOGIN: "/api/auth/login", 
        GET_PROFILE: "/api/auth/profile", 
    },

    IMAGE: {
        UPLOAD_IMAGE: "/api/auth/upload-image", 
    }, 

    AI: { 
        GENERATE_QUESTIONS: "/api/ai/generate-questions", 
        GENERATE_EXPLANATION: "/api/ai/generate-explanation", 
        GENERATE_LESSON: "/api/ai/generate-lesson",
        GENERATE_MODULES: "/api/ai/generate-modules",
    },

    SESSION: {
        CREATE: "/api/sessions/create", 
        GET_ALL: "/api/sessions/my-sessions", 
        GET_ONE: (id) => `/api/sessions/${id}`, 
        DELETE: (id) => `/api/sessions/${id}`, 
    }, 

    QUESTION: { 
        ADD_TO_SESSION: "/api/ai/questions/add",
        PIN: (id) => `/api/ai/questions/${id}/pin`,
        UPDATE_NOTE: (id) => `/api/ai/questions/${id}/note`, 
    },

  MODULE: {
    GET_BY_SESSION_AND_SKILL: (sessionId, skill) =>
        `/api/ai/modules/${sessionId}/${encodeURIComponent(skill)}`,
},

LESSON: {
  GET_BY_MODULE_AND_CHAPTER: (moduleId, chapterId) =>
      `/api/ai/lessons/${moduleId}/${chapterId}`,
},

};
