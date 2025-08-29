import { useParams } from "react-router-dom";
import React, { useState } from "react";
import InterviewCourse from "./InterviewCourse";
import InterviewPrep from "./InterviewPrep";
import Navbar from "../../components/layouts/Navbar";
import ResumeAnalyzer from "../../ResumeAnalyzer";

const TabsWrapper = () => {
  const { sessionId } = useParams(); 
  const [activeTab, setActiveTab] = useState("course");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Interview Preparation</h1>
          <p className="text-gray-600">Generate customized courses, practice questions, and resumes for your upcoming interview</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1 flex border border-gray-200">
            <button
              className={`flex items-center px-5 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "course" 
                  ? "bg-blue-50 text-blue-700 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("course")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${activeTab === "course" ? "text-blue-600" : "text-gray-400"}`} viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Course Generator
            </button>
            
            <button
              className={`flex items-center px-5 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "qa" 
                  ? "bg-purple-50 text-purple-700 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("qa")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${activeTab === "qa" ? "text-purple-600" : "text-gray-400"}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Interview Q&A
            </button>

            <button
              className={`flex items-center px-5 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === "resume" 
                  ? "bg-green-50 text-green-700 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("resume")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${activeTab === "resume" ? "text-green-600" : "text-gray-400"}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Resume Generator
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeTab === "course" && <InterviewCourse sessionId={sessionId} />}
          {activeTab === "qa" && <InterviewPrep sessionId={sessionId} />}
          {activeTab === "resume" && <ResumeAnalyzer/>}
        </div>
      </div>
    </div>
  );
};

export default TabsWrapper;