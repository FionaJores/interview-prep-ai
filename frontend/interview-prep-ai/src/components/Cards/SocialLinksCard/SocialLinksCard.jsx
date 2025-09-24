import React, { useState, useContext } from "react";

import "./SocialLinksCard.css";
import { UserContext } from "../../../context/userContext";

const SocialLinksCard = ({ user }) => {
  const { setUser } = useContext(UserContext);
  const [editing, setEditing] = useState(false);
  const [links, setLinks] = useState({
    linkedin: user?.linkedin || "",
    github: user?.github || "",
    leetcode: user?.leetcode || "",
    hackerrank: user?.hackerrank || "",
    skillrack: user?.skillrack || "",
    portfolio: user?.portfolio || "",
  });

  const handleChange = (e) => setLinks({ ...links, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token"); // or wherever you store JWT
      const res = await fetch("/api/auth/social-links", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(links),
      });

      if (!res.ok) throw new Error("Failed to update links");

      const data = await res.json();
      setUser(data.user); // update context with updated user
      setEditing(false);
    } catch (err) {
      console.error("Error updating links:", err);
    }
  };

  return (
    <div className="social-links-card mt-5 p-4 border rounded-md shadow-sm bg-white">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-lg mb-3">Social & Career Links</h2>
        <button
          onClick={() => setEditing(!editing)}
          className="text-blue-600 underline text-sm"
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>

      {editing ? (
        <div className="space-y-2">
          {Object.keys(links).map((key) => (
            <div key={key} className="flex flex-col">
              <label className="font-medium capitalize">{key}</label>
              <input
                type="text"
                name={key}
                value={links[key]}
                onChange={handleChange}
                placeholder={`Enter ${key} URL`}
                className="p-2 border rounded-md"
              />
            </div>
          ))}
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-3 py-1 rounded-md mt-3"
          >
            Save
          </button>
        </div>
      ) : (
        <ul className="list-disc pl-5 space-y-1">
          {Object.keys(links).map((key) => (
            <li key={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
              {links[key] ? (
                <a
                  href={links[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {links[key]}
                </a>
              ) : (
                "Not added"
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SocialLinksCard;
