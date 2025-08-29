import React, { useState } from "react";
import UploadSection from "./components/UploadSection.jsx";
import JobDescriptionInput from "./components/JobDescriptionInput.jsx";
import AnalysisOptions from "./components/AnalysisOptions.jsx";
import MatchScoreCard from "./components/MatchScoreCard.jsx";
import Footer from "./components/Footer.jsx";
import { api } from "./api.js";
import "./styles.css"

export default function ResumeAnalyzer() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchInfo, setMatchInfo] = useState(null); // { matchPercentage, result }

  const guard = () => {
    if (!jobDescription?.trim() || !resumeFile) {
      alert("Please upload your resume (PDF) and paste the job description.");
      return false;
    }
    return true;
  };

  const handleAnalyze = async () => {
    if (!guard()) return;
    setLoading(true);
    try {
      const { result, previewImage } = await api.analyze(jobDescription, resumeFile);
      setAnalysisResult(result);
      setPreviewImage(previewImage);
      setMatchInfo(null);
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!guard()) return;
    setLoading(true);
    try {
      const { result, previewImage } = await api.improve(jobDescription, resumeFile);
      setAnalysisResult(result);
      setPreviewImage(previewImage);
      setMatchInfo(null);
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    if (!guard()) return;
    setLoading(true);
    try {
      const { result, matchPercentage, previewImage } = await api.match(jobDescription, resumeFile);
      setAnalysisResult(result);
      setPreviewImage(previewImage);
      setMatchInfo({ matchPercentage });
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <a href="#" className="back-button" onClick={(e) => { e.preventDefault(); history.back(); }}>
          ← Back
        </a>
        <h1 className="header-title">Resume Analyzer Pro</h1>
      </header>

      <div className="step-indicator">
        <div className="step-connector"></div>
        <div className="step">
          <div className="step-number">1</div>
          <div className="step-text">Enter Job Details</div>
        </div>
        <div className="step">
          <div className="step-number">2</div>
          <div className="step-text">Upload Resume</div>
        </div>
        <div className="step">
          <div className="step-number">3</div>
          <div className="step-text">Get Analysis</div>
        </div>
      </div>

      <div className="info-box">
        <h3>Analyze Your Resume in 3 Simple Steps</h3>
        <p>Get personalized feedback on how well your resume matches job requirements and discover ways to improve it.</p>
      </div>

      <div className="two-col">
        <div>
          <div className="section-title">Job Description</div>
          <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
        </div>
        <div>
          <div className="section-title">Upload Resume</div>
          <UploadSection onFileSelect={setResumeFile} />
        </div>
      </div>

      <div className="section-title">Analysis Options</div>
      <p className="muted center">Select an analysis type to evaluate your resume</p>

      <AnalysisOptions
        onAnalyze={handleAnalyze}
        onImprove={handleImprove}
        onMatch={handleMatch}
        loading={loading}
      />

      <div className="results">

        {matchInfo && (
          <MatchScoreCard matchPercentage={matchInfo.matchPercentage} />
        )}

        {analysisResult && (
          <div className="analysis-section">
            <h2>Detailed Analysis</h2>
            <pre className="analysis-pre">{analysisResult}</pre>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
