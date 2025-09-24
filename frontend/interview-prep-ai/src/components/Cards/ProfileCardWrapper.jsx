import React from "react";
import { useNavigate } from "react-router-dom";
import ProfileInfoCard from "./ProfileInfoCard";

const ProfileCardWrapper = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/profile"); // navigate to profile dashboard
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <ProfileInfoCard />
    </div>
  );
};

export default ProfileCardWrapper;
