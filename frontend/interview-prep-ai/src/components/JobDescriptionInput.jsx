import React from "react";

export default function JobDescriptionInput({ value, onChange }) {
  return (
    <textarea
      className="textarea"
      placeholder="Paste the full job description here..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
