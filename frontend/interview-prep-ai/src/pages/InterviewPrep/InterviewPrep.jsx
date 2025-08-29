import React from 'react';
import { useParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuListCollapse, LuPin, LuPinOff, LuPlus, LuBookOpen, LuX } from "react-icons/lu";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import { toast } from "react-hot-toast";
import { useState } from 'react';
import { useEffect } from 'react';
import DashBoardLayout from '../../components/layouts/DashBoardLayout';
import RoleInfoHeader from './components/RoleInfoHeader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import QuestionCard from '../../components/Cards/QuestionCard';
import AIResponsePreview from './components/AIResponsePreview';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';

const InterviewPrep = ({ sessionId }) => {
  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  // Fetch session data by session id
  const fetchSessionDetailsById = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );

      if (response.data && response.data.session) {
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load session data");
    }
  };

  const generateConceptExplanation = async (question, index) => {
    try {
      setErrorMsg("");
      setExplanation(null);
      setActiveQuestionIndex(index);

      setIsLoading(true);
      setShowExplanationModal(true);

      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        { question }
      );

      if (response.data) {
        setExplanation(response.data);
      }
    } catch (error) {
      setExplanation(null);
      setErrorMsg("Failed to generate explanation. Try again later.");
      console.log("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestionPinStatus = async (questionId) => {
    try {
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.PIN(questionId)
      );

      if (response.data && response.data.question) {
        toast.success(response.data.question.isPinned ? "Question pinned" : "Question unpinned");
        fetchSessionDetailsById();
      }
    } catch (error) {
      console.log("Error:", error);
      toast.error("Failed to update question status");
    }
  };

  const uploadMoreQuestions = async () => {
    try {
      setIsUpdateLoader(true);

      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionData?.role,
          experience: sessionData?.experience,
          topicsToFocus: sessionData?.topicsToFocus,
          numberOfQuestions: 10,
        }
      );
      
      const generatedQuestions = aiResponse.data;
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          questions: generatedQuestions,
        }
      );

      if (response.data) {
        toast.success("Added more questions!");
        fetchSessionDetailsById();
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Something went wrong. Please try again");
      }
      toast.error("Failed to add more questions");
    } finally {
      setIsUpdateLoader(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetailsById();
    }
    return () => { };
  }, []);

  return (
    <DashBoardLayout>
      <div className="min-h-screen bg-gray-50">
        <RoleInfoHeader
          role={sessionData?.role || ""}
          topicsToFocus={sessionData?.topicsToFocus || ""}
          experience={sessionData?.experience || "-"}
          questions={sessionData?.questions?.length || "-"}
          description={sessionData?.description || ""}
          lastUpdated={
            sessionData?.updatedAt ? moment(sessionData.updatedAt).format("DD MMM YYYY") : ""
          }
        />

        <div className="container mx-auto py-6 px-4 md:px-6 max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Interview Q&A</h2>
              <p className="text-gray-500 mt-1">
                Practice questions tailored for your {sessionData?.role} interview
              </p>
            </div>
            
            {sessionData?.questions?.length > 0 && (
              <button
                className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-lg transition-colors shadow-sm"
                disabled={isLoading || isUpdateLoader}
                onClick={uploadMoreQuestions}
              >
                {isUpdateLoader ? (
                  <SpinnerLoader size="sm" />
                ) : (
                  <LuPlus className="text-lg" />
                )}
                Load More
              </button>
            )}
          </div>

          {!sessionData ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <SkeletonLoader />
                </div>
              ))}
            </div>
          ) : sessionData.questions && sessionData.questions.length > 0 ? (
            <div className="space-y-5">
              <AnimatePresence mode="popLayout">
                {sessionData.questions.map((data, index) => {
                  return (
                    <motion.div
                      key={data._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{
                        duration: 0.3,
                        type: "spring",
                        stiffness: 100,
                        delay: index * 0.05,
                        damping: 15,
                      }}
                      layout
                      layoutId={`question-${data._id || index}`}
                    >
                      <QuestionCard
                        question={data?.question}
                        answer={data?.answer}
                        onLearnMore={() => generateConceptExplanation(data.question, index)}
                        isPinned={data?.isPinned}
                        onTogglePin={() => toggleQuestionPinStatus(data._id)}
                        number={index + 1}
                        pinnedIcon={data?.isPinned ? <LuPinOff /> : <LuPin />}
                        learnMoreIcon={<LuBookOpen />}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <div className="flex items-center justify-center pt-4">
                <button
                  className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-5 py-2.5 rounded-lg transition-colors"
                  disabled={isLoading || isUpdateLoader}
                  onClick={uploadMoreQuestions}
                >
                  {isUpdateLoader ? (
                    <SpinnerLoader size="sm" />
                  ) : (
                    <LuListCollapse className="text-lg" />
                  )}
                  Load More Questions
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <LuListCollapse className="text-2xl text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No questions yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Get started by generating your first set of interview questions tailored to your role.
              </p>
              <button
                className="flex items-center gap-2 mx-auto text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                disabled={isLoading || isUpdateLoader}
                onClick={uploadMoreQuestions}
              >
                {isUpdateLoader ? (
                  <SpinnerLoader size="sm" />
                ) : (
                  <LuPlus className="text-lg" />
                )}
                Generate Questions
              </button>
            </div>
          )}
        </div>

        {/* Explanation Modal - Without black background */}
        <AnimatePresence>
          {showExplanationModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200"
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-xl z-10">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {!isLoading && explanation?.title ? explanation.title : "Concept Explanation"}
                  </h3>
                  <button 
                    onClick={() => setShowExplanationModal(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                  >
                    <LuX className="text-xl" />
                  </button>
                </div>
                
                <div className="p-5 bg-white">
                  {errorMsg && (
                    <div className="flex gap-2 p-3 text-sm text-amber-800 bg-amber-50 rounded-lg mb-4">
                      <LuCircleAlert className="text-lg mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {isLoading ? (
                    <SkeletonLoader count={3} />
                  ) : explanation ? (
                    <AIResponsePreview content={explanation?.explanation} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <LuBookOpen className="text-3xl mx-auto mb-2 opacity-50" />
                      <p>Explanation will appear here</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashBoardLayout>
  );
};

export default InterviewPrep;