import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

export default function MatchScoreCard({ matchPercentage }) {
  const remaining = Math.max(0, 100 - (matchPercentage || 0));
  const qualitative = matchPercentage >= 80
    ? { text: "Excellent match! Your resume strongly aligns with the job requirements.", color: "#16A34A" }
    : matchPercentage >= 60
      ? { text: "Good match. Your resume meets most of the requirements.", color: "#FFA500" }
      : matchPercentage >= 40
        ? { text: "Moderate match. Consider enhancing your resume.", color: "#FF8C00" }
        : { text: "Low match. Significant improvements needed.", color: "#DC143C" };

  const data = {
    labels: ["Match", "Remaining"],
    datasets: [
      {
        label: "Match",
        data: [matchPercentage || 0, remaining],
        backgroundColor: ["#16A34A", "#F8F9FA"],
        borderColor: ["#ffffff", "#ffffff"],
        borderWidth: 2
      }
    ]
  };

  const options = {
    plugins: { legend: { position: "bottom" } },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div className="match-card">
      <h3>Match Score</h3>
      <div style={{ fontSize: 42, fontWeight: 700, color: "#16A34A", textAlign: "center", margin: "8px 0" }}>
        {matchPercentage || 0}%
      </div>
      <div style={{ textAlign: "center", color: qualitative.color, fontWeight: 600, marginBottom: 12 }}>
        {qualitative.text}
      </div>
      <div style={{ height: 300 }}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}
