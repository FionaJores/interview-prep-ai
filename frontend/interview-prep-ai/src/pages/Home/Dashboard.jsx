import React, {useState,useEffect} from 'react'
import { LuPlus, LuCalendar, LuTarget, LuUsers, LuFileText, LuSparkles, LuBookOpen, LuAward, LuFlame } from 'react-icons/lu'
import { CARD_BG } from "../../utils/data";
import toast from "react-hot-toast";
import DashBoardLayout from '../../components/layouts/DashBoardLayout';
import { useNavigate } from 'react-router-dom';
import { API_PATHS } from '../../utils/apiPaths';
import SummaryCard from '../../components/Cards/SummaryCard';
import moment from "moment";
import CreateSessionForm from './CreateSessionForm';
import Modal from '../../components/Modal';
import axiosInstance from '../../utils/axiosInstance';
import DeleteAlertContent from '../../components/DeleteAlertContent';
import Navbar from '../../components/layouts/Navbar';

const Dashboard = () => {
  const navigate=useNavigate();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [sessions, setSessions]=useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openDeleteAlert,setOpenDeleteAlert]=useState({
    open:false,
    data:null,
  });

  const fetchAllSessions = async () => {
    try{
      setIsLoading(true);
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSessions(response.data);
    }catch(error){
      console.error("Error fetching session data:",error);
      toast.error("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  }

  const deleteSession = async (sessionData) => {
    try{
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionData?._id));
      toast.success("Session Deleted Successfully");
      setOpenDeleteAlert({
        open:false,
        data:null,
      });
      fetchAllSessions();
    }catch(error){
      console.error("Error deleting session data:",error);
      toast.error("Failed to delete session");
    }
  };

  useEffect(()=>{
    fetchAllSessions();
  },[]);

  return (
    <DashBoardLayout>
      <Navbar/>
      
      {/* Main Content - Gradious Theme */}
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
              
              {/* Stats Cards - Simplified */}
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

            {/* Learning Streak Section */}
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

          {/* Sessions Grid */}
          {isLoading ? (
            // Loading Skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {sessions?.map((data,index)=>(
                <div 
                  key={data?._id}
                  className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <SummaryCard
                    colors={CARD_BG[index%CARD_BG.length]}
                    role={data?.role || ""}
                    topicsToFocus={data?.topicsToFocus || ""}
                    experience={data?.experience || "-"}
                    // Removed questions count and progress line
                    description={data?.description || ""}
                    lastUpdated = {
                      data?.updatedAt
                        ? moment(data.updatedAt).format("Do MMM YYYY")
                        :""
                    }
                    onSelect={()=> navigate(`/interview-prep/${data?._id}`)}
                    onDelete={()=>setOpenDeleteAlert({open:true,data})}
                    hideProgress // Add this prop to hide progress line
                    hideQuestionCount // Add this prop to hide question count
                  />
                </div>
              ))}
            </div>
          ) : (
            // Empty State - Gradious Theme
            <div className="text-center py-20 bg-white rounded-3xl shadow-md border border-gray-200 mb-8">
              <div className="max-w-lg mx-auto">
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-200 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                      <LuPlus className="text-3xl text-white" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Interview Preparation</h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Create your first practice session to begin mastering interview questions and techniques.
                </p>
                
                <button
                  onClick={() => setOpenCreateModal(true)}
                  className="group relative bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-semibold text-lg px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto overflow-hidden"
                >
                  <div className="relative z-10 flex items-center gap-3">
                    <LuPlus className="text-xl transition-transform group-hover:rotate-90 duration-300" />
                    Create Session
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                <div className="mt-8 flex justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Mock Interviews
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Practice Questions
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Progress Tracking
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Floating Action Button - Gradious Colors */}
          {sessions.length > 0 && !isLoading && (
            <button
              className="fixed bottom-8 right-8 z-50 group"
              onClick={() => setOpenCreateModal(true)}
            >
              <div className="relative">
                <div className="h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-semibold text-base px-6 py-3 rounded-2xl transition-all duration-300 transform group-hover:scale-105 shadow-2xl hover:shadow-blue-500/40 cursor-pointer border border-blue-200/20">
                  <LuPlus className="text-xl transition-transform group-hover:rotate-90 duration-500" />
                  New Session
                </div>
                {/* Animated ring effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/30 animate-ping group-hover:animate-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      <Modal
        isOpen={openCreateModal}
        onClose={()=>{
          setOpenCreateModal(false);
        }}
        hideHeader
        size="lg"
      >
        <div className="p-1">
          <CreateSessionForm 
            onSuccess={() => {
              setOpenCreateModal(false);
              fetchAllSessions();
            }}
            onCancel={() => setOpenCreateModal(false)}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={openDeleteAlert?.open}
        onClose={()=>{
          setOpenDeleteAlert({open:false,data:null});
        }}
        title="Delete Session"
        size="md"
      >
        <div className="p-1">
          <DeleteAlertContent
            content="This action will permanently delete the session. This cannot be undone."
            onDelete={()=>deleteSession(openDeleteAlert.data)}
            onCancel={() => setOpenDeleteAlert({open:false,data:null})}
          />
        </div>
      </Modal>
    </DashBoardLayout>
  )
}

export default Dashboard