import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Home/Dashboard';
import InterviewPrep from './pages/InterviewPrep/InterviewPrep';
import UserProvider from './context/userContext';
import TabsWrapper from './pages/InterviewPrep/TabsWrapper';
import ModuleChapters from './pages/InterviewPrep/ModuleChapters';
import LessonView from './pages/InterviewPrep/LessionView';
import ResumeAnalyzer from './ResumeAnalyzer';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />

          {/* Protected / Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Interview Prep Routes */}
          <Route path="/interview-prep/:sessionId" element={<TabsWrapper />} />
          <Route path="/interview-prep/:sessionId/prep" element={<InterviewPrep />} />
          <Route path="/resume" element={<ResumeAnalyzer/>}/>

          {/* Module & Lesson Routes */}
          <Route path="/modules/:moduleId" element={<ModuleChapters />} />
          <Route path="/lessons/:moduleId/:chapterId" element={<LessonView />} />
        </Routes>
      </Router>

      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </UserProvider>
  );
};

export default App;
