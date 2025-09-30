import React, { useState, useEffect, useContext } from "react";
import "./ProfilePage.css";
import ProfileInfoCard from "../../../components/Cards/ProfileInfoCard";

import SessionAnalytics from "../../../components/Cards/SessionAnalytics/SessionAnalytics";
import { UserContext } from "../../../context/userContext";
import { API_PATHS } from "../../../utils/apiPaths";
import axiosInstance from "../../../utils/axiosInstance";
import { getTestResults } from "../../../services/api";

const ProfilePage = () => {
  const { user } = useContext(UserContext);
  const [sessions, setSessions] = useState([]);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Fetch sessions using axiosInstance
    const fetchSessions = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.SESSION.GET_ANALYZE);
        setSessions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setSessions([]);
      }
    };

    // Fetch test results using api.js
    const fetchTestResults = async () => {
      try {
        const res = await getTestResults(user._id);
        setTestResults(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching test results:", err);
        setTestResults([]);
      }
    };

    fetchSessions();
    fetchTestResults();
  }, [user]);

  if (!user) return <div>Please login to view profile</div>;

  return (
    <div className="profile-page p-5">
      <ProfileInfoCard />
  
      <SessionAnalytics sessions={sessions} testResults={testResults} />
    </div>
  );
};

export default ProfilePage;
