import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import UserProvider from "./context/userContext";

// ✅ Lazy load all page components
const Login = lazy(() => import("./pages/Auth/Login"));
const SignUp = lazy(() => import("./pages/Auth/SignUp"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Dashboard = lazy(() => import("./pages/Home/Dashboard"));
const InterviewPrep = lazy(() => import("./pages/InterviewPrep/InterviewPrep"));
const TabsWrapper = lazy(() => import("./pages/InterviewPrep/TabsWrapper"));
const ModuleChapters = lazy(() => import("./pages/InterviewPrep/ModuleChapters"));
const LessonView = lazy(() => import("./pages/InterviewPrep/LessionView"));
const ResumeAnalyzer = lazy(() => import("./ResumeAnalyzer"));
const AdaptiveTest = lazy(() => import("./components/AdaptiveTest"));
const ProfilePage = lazy(() => import("./pages/InterviewPrep/ProfilePage/ProfilePage"));
const MockQuiz = lazy(() => import("./components/Cards/SessionAnalytics/MockQuiz"));

const App = () => {
  return (
    <UserProvider>
      <Router>
        {/* Suspense fallback shows while lazy components load */}
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signUp" element={<SignUp />} />

            {/* Protected / Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quiz" element={<AdaptiveTest />} />

            {/* Interview Prep Routes */}
            <Route path="/interview-prep/:sessionId" element={<TabsWrapper />} />
            <Route path="/interview-prep/:sessionId/prep" element={<InterviewPrep />} />
            <Route path="/resume" element={<ResumeAnalyzer />} />

            {/* Module & Lesson Routes */}
            <Route path="/modules/:moduleId" element={<ModuleChapters />} />
            <Route path="/lessons/:moduleId/:chapterId" element={<LessonView />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/mock-quiz" element={<MockQuiz />} />
          </Routes>
        </Suspense>
      </Router>

      {/* Toast notifications */}
      <Toaster
        toastOptions={{
          style: { fontSize: "13px" },
        }}
      />
    </UserProvider>
  );
};

export default App;
