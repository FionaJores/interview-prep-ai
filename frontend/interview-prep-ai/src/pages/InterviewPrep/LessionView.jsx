import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { marked } from "marked";
import DOMPurify from "dompurify";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

const LessonView = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { module, chapter } = state || {};
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeResourceTab, setActiveResourceTab] = useState("all");
  const [progress, setProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const cleanContent = (rawContent) => {
    if (!rawContent) return "";
    let content = rawContent
      .replace(/^```json\s*/, "")
      .replace(/\s*```$/, "");
    content = content
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t");
    return content;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!module || !chapter) return;

    const fetchOrGenerateLesson = async () => {
      setLoading(true);
      // Simulate progress for better UX
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      try {
        let res = null;

        try {
          res = await axiosInstance.get(
            API_PATHS.LESSON.GET_BY_MODULE_AND_CHAPTER(module._id, chapter._id)
          );
        } catch (err) {
          if (!(err.response && err.response.status === 404)) throw err;
        }

        if (res?.data) {
          setLesson(res.data);
        } else {
          const genRes = await axiosInstance.post(API_PATHS.AI.GENERATE_LESSON, {
            sessionId: module.session?._id || module.session,
            moduleId: module._id,
            chapterId: chapter._id,
            skill: module.skill,
            chapterTitle: chapter.chapterTitle,
            chapterDescription: chapter.chapterDescription,
            experience: module.experience,
          });
          setLesson(genRes.data);
        }
        setProgress(100);
      } catch (err) {
        console.error("Error generating lesson:", err);
        setLesson({
          chapterTitle: chapter.chapterTitle,
          lessonContent: "Lesson is being generated, please wait...",
        });
      } finally {
        clearInterval(interval);
        setLoading(false);
        setTimeout(() => setProgress(0), 500);
      }
    };

    fetchOrGenerateLesson();
  }, [module, chapter]);

  useEffect(() => {
    if (lesson) {
      setTimeout(() => {
        Prism.highlightAll();
        
        // Add styling for questions and lists
        document.querySelectorAll('h3, h4, h5, h6').forEach((heading) => {
          if (heading.textContent.match(/^\d+\./)) {
            heading.classList.add('question-heading');
          }
        });
        
        // Style ordered lists with custom numbers
        document.querySelectorAll('ol li').forEach((li, index) => {
          li.setAttribute('data-number', index + 1);
        });
      }, 100);
    }
  }, [lesson]);

  if (!module || !chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Chapter Selected</h2>
          <p className="text-gray-600 mb-6">Please go back and select a chapter to view its content.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const renderMarkdown = (md) => {
    const dirtyHtml = marked.parse(md || "");
    const cleanHtml = DOMPurify.sanitize(dirtyHtml);
    return { __html: cleanHtml };
  };

  // Filter resources by type
  const filterResources = (type) => {
    if (!lesson.resources) return [];
    if (type === "all") return lesson.resources;
    return lesson.resources.filter(res => res.type === type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-gradient-to-r from-blue-600 to-indigo-700 py-4'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className={`flex items-center font-medium transition-all duration-300 ${isScrolled ? 'text-gray-700 hover:text-indigo-600' : 'text-white/90 hover:text-white'} rounded-lg p-2 hover:bg-white/10`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Chapters
              </button>
              
              {isScrolled && (
                <div className="hidden md:flex items-center">
                  <div className="h-6 w-px bg-gray-300 mx-3"></div>
                  <h1 className="text-lg font-semibold text-gray-800 truncate max-w-xs">
                    {chapter.chapterTitle}
                  </h1>
                </div>
              )}
            </div>
            
            <div className={`text-sm px-3 py-1 rounded-full ${isScrolled ? 'bg-indigo-100 text-indigo-700' : 'bg-white/20 text-white/90'}`}>
              {module.skill} • Chapter {module.chapters.findIndex(ch => ch._id === chapter._id) + 1} of {module.chapters.length}
            </div>
          </div>
        </div>
      </header>

      {/* Add padding to account for fixed header */}
      <div className="pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Chapter Header */}
          <div className="mb-8 bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 mb-4 shadow-sm">
              {module.skill}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{chapter.chapterTitle}</h1>
            <p className="text-gray-600 text-lg">{chapter.chapterDescription}</p>
          </div>

          {/* Lesson Content */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Generating content...</span>
                  <span>{progress}%</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-gray-300 rounded-lg animate-pulse"></div>
                <div className="h-5 w-full bg-gray-300 rounded-lg animate-pulse"></div>
                <div className="h-5 w-5/6 bg-gray-300 rounded-lg animate-pulse"></div>
                <div className="h-5 w-4/6 bg-gray-300 rounded-lg animate-pulse"></div>
                <div className="h-8 w-1/2 bg-gray-300 rounded-lg animate-pulse mt-6"></div>
                <div className="h-5 w-full bg-gray-300 rounded-lg animate-pulse"></div>
                <div className="h-5 w-5/6 bg-gray-300 rounded-lg animate-pulse"></div>
                <div className="h-5 w-4/6 bg-gray-300 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ) : lesson ? (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 md:p-8">
                <style>
                  {`
                    .lesson-content {
                      font-size: 1.125rem;
                      line-height: 1.7;
                      color: #374151;
                    }
                    .lesson-content h2 {
                      font-size: 1.875rem;
                      font-weight: bold;
                      color: #1f2937;
                      margin-top: 2.5rem;
                      margin-bottom: 1.25rem;
                      padding-bottom: 0.5rem;
                      border-bottom: 2px solid #e5e7eb;
                    }
                    .lesson-content h3 {
                      font-size: 1.5rem;
                      font-weight: 600;
                      color: #1f2937;
                      margin-top: 2rem;
                      margin-bottom: 1rem;
                    }
                    .lesson-content h4 {
                      font-size: 1.25rem;
                      font-weight: 600;
                      color: #1f2937;
                      margin-top: 1.75rem;
                      margin-bottom: 0.75rem;
                    }
                    .lesson-content p {
                      margin-bottom: 1.5rem;
                    }
                    .lesson-content ul, .lesson-content ol {
                      margin-bottom: 1.5rem;
                      padding-left: 2rem;
                    }
                    .lesson-content li {
                      margin-bottom: 0.75rem;
                      position: relative;
                    }
                    .lesson-content ol {
                      list-style-type: none;
                      counter-reset: custom-counter;
                    }
                    .lesson-content ol li {
                      counter-increment: custom-counter;
                    }
                    .lesson-content ol li::before {
                      content: counter(custom-counter) ".";
                      font-weight: 600;
                      color: #6366f1;
                      position: absolute;
                      left: -2rem;
                      width: 1.5rem;
                      text-align: right;
                    }
                    .lesson-content ul li::before {
                      content: "•";
                      color: #6366f1;
                      font-weight: bold;
                      display: inline-block;
                      width: 1em;
                      margin-left: -1em;
                    }
                    .lesson-content blockquote {
                      border-left: 4px solid #6366f1;
                      background-color: #f0f4ff;
                      padding: 1.5rem;
                      margin: 2rem 0;
                      border-radius: 0 0.5rem 0.5rem 0;
                      font-style: italic;
                    }
                    .lesson-content code {
                      background-color: #f3f4f6;
                      padding: 0.2rem 0.4rem;
                      border-radius: 0.375rem;
                      font-size: 0.95rem;
                      font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
                    }
                    .lesson-content pre {
                      background-color: #1f2937;
                      color: #f3f4f6;
                      padding: 1.25rem;
                      border-radius: 0.5rem;
                      overflow-x: auto;
                      margin: 1.75rem 0;
                      line-height: 1.5;
                    }
                    .lesson-content pre code {
                      background-color: transparent;
                      padding: 0;
                      border-radius: 0;
                      font-size: 0.95rem;
                      color: inherit;
                    }
                    .lesson-content a {
                      color: #6366f1;
                      text-decoration: underline;
                      font-weight: 500;
                    }
                    .lesson-content a:hover {
                      color: #4f46e5;
                    }
                    .question-heading {
                      background-color: #f0f4ff;
                      padding: 1rem 1.25rem;
                      border-radius: 0.75rem;
                      border-left: 4px solid #6366f1;
                      margin-top: 2rem !important;
                      margin-bottom: 1.25rem !important;
                    }
                    .lesson-content strong {
                      font-weight: 600;
                      color: #1f2937;
                    }
                    .lesson-content table {
                      width: 100%;
                      border-collapse: collapse;
                      margin: 1.5rem 0;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    }
                    .lesson-content th, .lesson-content td {
                      border: 1px solid #e5e7eb;
                      padding: 0.75rem;
                      text-align: left;
                    }
                    .lesson-content th {
                      background-color: #f9fafb;
                      font-weight: 600;
                    }
                    .lesson-content tr:nth-child(even) {
                      background-color: #f9fafb;
                    }
                    .key-point {
                      background: linear-gradient(to right, #f0f9ff, #e0f2fe);
                      border-left: 4px solid #0ea5e9;
                      padding: 1.5rem;
                      border-radius: 0 0.5rem 0.5rem 0;
                      margin: 1.5rem 0;
                    }
                    .key-point h4 {
                      margin-top: 0;
                      color: #0369a1;
                      display: flex;
                      align-items: center;
                    }
                    .key-point h4 svg {
                      margin-right: 0.5rem;
                    }
                  `}
                </style>
                <div 
                  className="lesson-content"
                  dangerouslySetInnerHTML={renderMarkdown(cleanContent(lesson.lessonContent))} 
                />
              </div>

              {/* Resources Section */}
              {lesson.resources && lesson.resources.length > 0 && (
                <div className="border-t border-gray-100 p-6 md:p-8 bg-gray-50">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Learning Resources
                  </h2>
                  
                  {/* Resource Tabs */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeResourceTab === "all" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                      onClick={() => setActiveResourceTab("all")}
                    >
                      All Resources
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeResourceTab === "link" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                      onClick={() => setActiveResourceTab("link")}
                    >
                      Articles
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeResourceTab === "video" ? "bg-indigo-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                      onClick={() => setActiveResourceTab("video")}
                    >
                      Videos
                    </button>
                  </div>
                  
                  {/* Resource List */}
                  <div className="grid gap-4">
                    {filterResources(activeResourceTab).map((res, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-all duration-200 bg-white hover:shadow-md">
                        {res.type === "link" ? (
                          <a
                            href={res.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-800 hover:text-blue-600 transition-colors">{res.label}</h3>
                                <p className="text-sm text-gray-500 mt-1">{new URL(res.content).hostname}</p>
                              </div>
                              <div className="ml-auto text-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            </div>
                          </a>
                        ) : res.type === "video" ? (
                          <a
                            href={res.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-800 hover:text-red-600 transition-colors">{res.label}</h3>
                                <p className="text-sm text-gray-500 mt-1">Video Resource</p>
                              </div>
                              <div className="ml-auto text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            </div>
                          </a>
                        ) : (
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 mr-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">{res.label}</h3>
                              <p className="text-sm text-gray-500 mt-1">Additional Resource</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Generating Your Lesson</h2>
              <p className="text-gray-600 mb-6">This may take a moment. Please wait while we create your personalized learning content.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Refresh Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonView;