import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";

const InterviewCourse = ({ sessionId }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId));
        const session = res.data.session;

        if (!session.topicsToFocus) return;

        const skills = session.topicsToFocus.split(",").map(s => s.trim());

        const existingModulesRes = await Promise.all(
          skills.map(skill =>
            axiosInstance
              .get(API_PATHS.MODULE.GET_BY_SESSION_AND_SKILL(session._id, skill))
              .catch(err => (err.response?.status === 404 ? null : Promise.reject(err)))
          )
        );

        const modulesList = [];
        const modulesToGenerate = [];

        existingModulesRes.forEach((modRes, idx) => {
          if (modRes?.data) modulesList.push(modRes.data);
          else modulesToGenerate.push(skills[idx]);
        });

        if (modulesToGenerate.length > 0) {
          const genRes = await axiosInstance.post(API_PATHS.AI.GENERATE_MODULES, {
            sessionId: session._id,
            role: session.role,
            experience: session.experience,
            skills: modulesToGenerate.join(","),
            description: session.description,
          });
          modulesList.push(...genRes.data);
        }

        setModules(modulesList);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch modules. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [sessionId]);

  const openModule = (mod) => {
    navigate(`/modules/${mod._id}`, { state: { module: mod } });
  };

  // Get unique skills for filter
  const uniqueSkills = [...new Set(modules.map(module => module.skill))];
  
  // Filter modules based on selected filter
  const filteredModules = filter === "all" 
    ? modules 
    : modules.filter(module => module.skill === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Path</h1>
          <p className="text-gray-600">Customized modules to prepare for your interview</p>
        </div>
        
        {modules.length > 0 && (
          <div className="mt-4 md:mt-0">
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by skill:</label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Skills</option>
              {uniqueSkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md flex items-start">
          <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : modules.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <svg className="mx-auto h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No modules created yet</h3>
          <p className="mt-2 text-gray-500">We'll generate learning modules based on your interview needs.</p>
          <div className="mt-6">
            <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Generate Modules
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredModules.map((mod) => (
            <div
              key={mod._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md cursor-pointer"
              onClick={() => openModule(mod)}
            >
              <div className="flex items-start space-x-5">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 truncate">{mod.skill}</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {mod.estimatedHours || '2-4'} hours
                    </span>
                  </div>
                  
                  <p className="mt-2 text-gray-600">{mod.description}</p>
                  
                  <div className="mt-4 flex items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>5 lessons</span>
                    </div>
                    
                    <div className="ml-4 flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>3 quizzes</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewCourse;