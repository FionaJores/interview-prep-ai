import React, { useState } from 'react'
import SAMPLE_PAGE from '../assets/sample_page.png';
import { APP_FEATURES } from "../utils/data"
import { useNavigate } from 'react-router-dom';
import { LuSparkles, LuArrowRight, LuRocket, LuUsers, LuTarget } from "react-icons/lu";
import { FaCheckCircle, FaRegCheckCircle } from "react-icons/fa";
import Login from './Auth/Login';
import SignUp from './Auth/SignUp';
import Modal from '../components/Modal';
import { useContext } from 'react';
import { UserContext } from '../context/userContext';
import ProfileInfoCard from '../components/Cards/ProfileInfoCard';

const LandingPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("login");

  const handleCTA = () => {
    if (!user) {
      setOpenAuthModal(true);
    } else {
      navigate("/dashboard");
    }
  };

  const FeatureIcon = ({ index }) => {
    const icons = [LuTarget, LuRocket, LuUsers, FaCheckCircle, LuSparkles];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="w-6 h-6" />;
  };

  return (
    <>
      {/* Hero Section */}
      <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        <div className="container mx-auto px-4 pt-8 pb-20 relative z-10">
          {/* Header */}
          <header className="flex justify-between items-center mb-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <LuSparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                InterviewPrep AI
              </span>
            </div>

            {user ? (
              <ProfileInfoCard />
            ) : (
              <button 
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:shadow-amber-200 transition-all duration-300 hover:scale-105 cursor-pointer border border-amber-400"
                onClick={() => setOpenAuthModal(true)}
              >
                Get Started
              </button>
            )}
          </header>

          {/* Hero Content */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-amber-700 font-semibold bg-amber-100 px-4 py-2 rounded-full border border-amber-200">
                  <LuSparkles className="w-4 h-4" />
                  AI Powered Learning Platform
                </div>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Ace Your Next{' '}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  Technical Interview
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Master role-specific questions with AI-powered guidance. Get instant feedback, 
                expand your answers, and dive deeper into concepts. Your complete interview 
                preparation toolkit is here.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className="group bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl hover:shadow-amber-200 transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-2 justify-center"
                  onClick={handleCTA}
                >
                  {user ? "Go to Dashboard" : "Start Learning Now"}
                  <LuArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
               
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-12">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">1000+</div>
                  <div className="text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">50+</div>
                  <div className="text-gray-600">Tech Roles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">24/7</div>
                  <div className="text-gray-600">AI Support</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl blur-lg opacity-20"></div>
                <img 
                  src={SAMPLE_PAGE}
                  alt="InterviewPrep AI Dashboard"
                  className="relative w-full max-w-2xl rounded-xl shadow-2xl border border-amber-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed to help you master technical interviews and land your dream job
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {APP_FEATURES.map((feature, index) => (
              <div 
                key={feature.id}
                className="group bg-gradient-to-br from-white to-amber-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-amber-100 hover:border-amber-200 hover:scale-105 cursor-pointer"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FeatureIcon index={index} />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="w-full bg-gradient-to-r from-amber-500 to-orange-500 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Ace Your Interviews?
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who have transformed their interview skills with our AI-powered platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="bg-white text-amber-600 px-8 py-4 rounded-xl font-semibold hover:bg-amber-50 transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-2 justify-center"
                onClick={() => setOpenAuthModal(true)}
              >
                Start
                <LuRocket className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded flex items-center justify-center">
                <LuSparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-white font-bold">InterviewPrep AI</span>
            </div>
            
            <div className="text-sm">
              Made with ❤️ for the developer community
            </div>
            
            <div className="text-sm mt-4 md:mt-0">
              © 2024 InterviewPrep AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <Modal
        isOpen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("login");
        }}
        hideHeader
      >
        <div className="p-2">
          {currentPage === "login" && (
            <Login setCurrentPage={setCurrentPage} />
          )}
          {currentPage === "signup" && (
            <SignUp setCurrentPage={setCurrentPage} />
          )}
        </div>
      </Modal>
    </>
  );
};

export default LandingPage;