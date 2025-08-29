import React, { useState } from "react";

export default function UploadSection({ onFileSelect }) {
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file.");
        return;
      }
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div className="uploader">
      <input
        type="file"
        accept="application/pdf"
        onChange={handleChange}
      />
      {fileName && <p><b>✓ {fileName} uploaded successfully!</b></p>}
    </div>
  );
}
