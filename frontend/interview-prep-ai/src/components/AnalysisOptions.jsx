import React, { useState } from "react";

export default function AnalysisOptions({ onAnalyze, onImprove, onMatch }) {
  const [loadingButton, setLoadingButton] = useState(null);

  const handleClick = async (type, callback) => {
    setLoadingButton(type);
    try {
      await callback();
    } finally {
      setLoadingButton(null);
    }
  };

  return (
    <div className="btn-row">
      <button
        className="primary"
        disabled={loadingButton !== null}
        onClick={() => handleClick("analyze", onAnalyze)}
      >
        {loadingButton === "analyze" ? "Working..." : "Analyze Resume"}
      </button>

      <button
        className="primary"
        disabled={loadingButton !== null}
        onClick={() => handleClick("improve", onImprove)}
      >
        {loadingButton === "improve" ? "Working..." : "Improve Skills"}
      </button>

      <button
        className="primary"
        disabled={loadingButton !== null}
        onClick={() => handleClick("match", onMatch)}
      >
        {loadingButton === "match" ? "Working..." : "Match Score"}
      </button>
    </div>
  );
}
