import React, { useState, useEffect, lazy, Suspense } from 'react';
import { LuPlus, LuBookOpen, LuFileText, LuAward, LuFlame } from 'react-icons/lu';
import { CARD_BG } from "../../utils/data";
import toast from "react-hot-toast";
import DashBoardLayout from '../../components/layouts/DashBoardLayout';
import { useNavigate } from 'react-router-dom';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import moment from "moment";

// Lazy-loaded components
const SummaryCard = lazy(() => import('../../components/Cards/SummaryCard'));
const CreateSessionForm = lazy(() => import('./CreateSessionForm'));
const Modal = lazy(() => import('../../components/Modal'));
const DeleteAlertContent = lazy(() => import('../../components/DeleteAlertContent'));
const Navbar = lazy(() => import('../../components/layouts/Navbar'));

const Dashboard = () => {
  const navigate = useNavigate();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({ open: false, data: null });

  // Fetch all sessions
  const fetchAllSessions = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching session data:", error);
      toast.error("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete session
  const deleteSession = async (sessionData) => {
    try {
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionData?._id));
      toast.success("Session Deleted Successfully");
      setOpenDeleteAlert({ open: false, data: null });
      fetchAllSessions();
    } catch (error) {
      console.error("Error deleting session data:", error);
      toast.error("Failed to delete session");
    }
  };

  useEffect(() => { fetchAllSessions(); }, []);

  return (
    <DashBoardLayout>
      <Suspense fallback={<div></div>}><Navbar /></Suspense>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 md:px-6 py-8">

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl shadow-lg">
                    <LuBookOpen className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent">
                      Interview Sessions
                    </h1>
                    <p className="text-gray-600 text-lg">Practice and master your interview skills</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <LuFileText className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
                      <p className="text-xs text-gray-600 font-medium">Total Sessions</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <LuAward className="text-green-600 text-lg" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {sessions.filter(session =>
                          moment(session.updatedAt).isAfter(moment().subtract(7, 'days'))
                        ).length}
                      </p>
                      <p className="text-xs text-gray-600 font-medium">Active This Week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Streak */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <LuFlame className="text-orange-600 text-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Learning Streak</h3>
                    <p className="text-sm text-gray-600">Past 7 days activity</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  {sessions.length > 0 ? "Active" : "Start Learning"}
                </span>
              </div>
            </div>
          </div>

          {/* Sessions Grid or Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(item => (
                <div key={item} className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 animate-pulse"></div>
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {sessions.map((data, index) => (
                <Suspense fallback={<div></div>} key={data._id}>
                  <SummaryCard
                    colors={CARD_BG[index % CARD_BG.length]}
                    role={data?.role || ""}
                    topicsToFocus={data?.topicsToFocus || ""}
                    experience={data?.experience || "-"}
                    description={data?.description || ""}
                    lastUpdated={data?.updatedAt ? moment(data.updatedAt).format("Do MMM YYYY") : ""}
                    onSelect={() => navigate(`/interview-prep/${data?._id}`)}
                    onDelete={() => setOpenDeleteAlert({ open: true, data })}
                    hideProgress
                    hideQuestionCount
                  />
                </Suspense>
              ))}
            </div>
          ) : (
            // 🧭 Empty State when no sessions found
            <div className="text-center py-20 bg-white rounded-3xl shadow-md border border-gray-200 mb-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-blue-100 rounded-full">
                  <LuBookOpen className="text-blue-600 text-4xl" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">No Sessions Found</h2>
                <p className="text-gray-500 max-w-md">
                  You haven’t created any interview sessions yet. Start by creating your first session to begin your learning journey!
                </p>
                <button
                  onClick={() => setOpenCreateModal(true)}
                  className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-semibold text-base px-6 py-3 rounded-2xl transition-all duration-300 shadow-md hover:shadow-blue-500/40"
                >
                  <LuPlus className="text-lg" /> Create Your First Session
                </button>
              </div>
            </div>
          )}

          {/* Floating Action Button (if sessions exist) */}
          {sessions.length > 0 && !isLoading && (
            <button onClick={() => setOpenCreateModal(true)} className="fixed bottom-8 right-8 z-50 group">
              <div className="relative">
                <div className="h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-semibold text-base px-6 py-3 rounded-2xl transition-all duration-300 transform group-hover:scale-105 shadow-2xl hover:shadow-blue-500/40 cursor-pointer border border-blue-200/20">
                  <LuPlus className="text-xl transition-transform group-hover:rotate-90 duration-500" />
                  New Session
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/30 animate-ping group-hover:animate-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <Suspense fallback={<div></div>}>
        {/* Create Session Modal */}
        <Modal isOpen={openCreateModal} onClose={() => setOpenCreateModal(false)} hideHeader size="lg">
          <CreateSessionForm
            onSuccess={() => { setOpenCreateModal(false); fetchAllSessions(); }}
            onCancel={() => setOpenCreateModal(false)}
          />
        </Modal>

        {/* Delete Session Modal */}
        <Modal isOpen={openDeleteAlert.open} onClose={() => setOpenDeleteAlert({ open: false, data: null })} title="Delete Session" size="md">
          <DeleteAlertContent
            content="This action will permanently delete the session. This cannot be undone."
            onDelete={() => deleteSession(openDeleteAlert.data)}
            onCancel={() => setOpenDeleteAlert({ open: false, data: null })}
          />
        </Modal>
      </Suspense>
    </DashBoardLayout>
  );
};

export default Dashboard;
