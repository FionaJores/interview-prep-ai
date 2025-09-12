import React, { useState } from "react";
import UploadSection from "./components/UploadSection.jsx";
import JobDescriptionInput from "./components/JobDescriptionInput.jsx";
import AnalysisOptions from "./components/AnalysisOptions.jsx";
import MatchScoreCard from "./components/MatchScoreCard.jsx";
import Footer from "./components/Footer.jsx";
import { api } from "./api.js";
import "./styles.css";
import "./results.css";

// Create a separate component for the skill tags
const SkillTag = ({ skill }) => {
  return <span className="skill-tag">{skill}</span>;
};

// Create a separate component for the list with show more/less functionality
const ExpandableList = ({ items, maxItems = 5, isSkills = false }) => {
  const [showAll, setShowAll] = useState(false);
  
  if (!items || items.length === 0) return null;
  
  const itemsToShow = showAll ? items : items.slice(0, maxItems);
  
  return (
    <>
      {isSkills ? (
        <div className="skill-cloud">
          {itemsToShow.map((item, i) => (
            <SkillTag key={i} skill={item} />
          ))}
        </div>
      ) : (
        <ul>
          {itemsToShow.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
      {items.length > maxItems && (
        <button 
          className="show-more-btn"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show Less' : `Show All (${items.length})`}
        </button>
      )}
    </>
  );
};

export default function ResumeAnalyzer() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchInfo, setMatchInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastAction, setLastAction] = useState(""); // Track which action was last performed

  const guard = () => {
    if (!jobDescription?.trim() || !resumeFile) {
      alert("Please upload your resume (PDF) and paste the job description.");
      return false;
    }
    return true;
  };

  const parseJSONSafe = (str) => {
    if (!str) return null;
    const cleaned = str.replace(/```json|```/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse JSON:", e, cleaned);
      return null;
    }
  };

  const handleAnalyze = async () => {
    if (!guard()) return;
    setLoading(true);
    try {
      const { result, previewImage } = await api.analyze(jobDescription, resumeFile);
      const parsedResult = parseJSONSafe(result);
      setAnalysisResult(parsedResult);
      setPreviewImage(previewImage);
      setMatchInfo(parsedResult?.matchPercentage ? { matchPercentage: parsedResult.matchPercentage } : null);
      setActiveTab("overview");
      setLastAction("analyze");
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
      const parsedResult = parseJSONSafe(result);
      setAnalysisResult(parsedResult);
      setPreviewImage(previewImage);
      setMatchInfo(null);
      setActiveTab("skillgaps");
      setLastAction("improve");
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
      const { result, previewImage } = await api.match(jobDescription, resumeFile);
      const parsedResult = parseJSONSafe(result);
      setAnalysisResult(parsedResult);
      setPreviewImage(previewImage);
      setMatchInfo(parsedResult?.matchPercentage ? { matchPercentage: parsedResult.matchPercentage } : null);
      setActiveTab("summary");
      setLastAction("match");
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  // Determine which tabs to show based on the last action
  const showTabs = () => {
    if (lastAction === "analyze") {
      return [
        { id: "overview", label: "Overview" },
        { id: "alignment", label: "Skills Alignment" },
        { id: "strengths", label: "Strengths" },
        { id: "weaknesses", label: "Weaknesses" }
      ];
    } else if (lastAction === "improve") {
      return [
        { id: "skillgaps", label: "Skill Gaps" },
        { id: "learning", label: "Learning Path" },
        { id: "priorities", label: "Priorities" },
        { id: "softskills", label: "Soft Skills" },
        { id: "trends", label: "Emerging Trends" }
      ];
    } else if (lastAction === "match") {
      return [
        { id: "summary", label: "Match Summary" },
        { id: "keywords", label: "Missing Keywords" }
      ];
    }
    return [{ id: "overview", label: "Overview" }];
  };

  const currentTabs = showTabs();

  return (
    <div className="container">
      <header className="app-header">
        <a
          href="#"
          className="back-button"
          onClick={(e) => {
            e.preventDefault();
            history.back();
          }}
        >
          ← Back
        </a>
        <h1 className="header-title">Resume Analyzer Pro</h1>
      </header>

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
      <AnalysisOptions
        onAnalyze={handleAnalyze}
        onImprove={handleImprove}
        onMatch={handleMatch}
        loading={loading}
      />

      <div className="results">
        {matchInfo && <MatchScoreCard matchPercentage={matchInfo.matchPercentage} />}

        {analysisResult && (
          <div className="analysis-section">
            <h2>Detailed Analysis</h2>
            
            {/* Tab Navigation - Dynamic based on last action */}
            <div className="analysis-tabs">
              {currentTabs.map(tab => (
                <button 
                  key={tab.id}
                  className={activeTab === tab.id ? "tab-active" : ""}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Tab Content */}
            <div className="tab-content">
              {/* Overview Tab (Analyze) */}
              {activeTab === "overview" && analysisResult.overallFit && (
                <div className="tab-pane">
                  <div className="analysis-card">
                    <h3>Overall Fit</h3>
                    <p><strong>Recommendation:</strong> {analysisResult.overallFit.recommendation}</p>
                    <p><strong>Reasoning:</strong> {analysisResult.overallFit.reasoning}</p>
                  </div>
                </div>
              )}
              
              {/* Alignment Tab (Analyze) */}
              {activeTab === "alignment" && analysisResult.alignment?.length > 0 && (
                <div className="tab-pane">
                  <div className="analysis-card">
                    <h3>Skills Alignment</h3>
                    <ExpandableList items={analysisResult.alignment} maxItems={12} isSkills={true} />
                  </div>
                </div>
              )}
              
              {/* Strengths Tab (Analyze) */}
              {activeTab === "strengths" && analysisResult.strengths?.length > 0 && (
                <div className="tab-pane">
                  <div className="analysis-card strengths">
                    <h3>Strengths</h3>
                    <ExpandableList items={analysisResult.strengths} />
                  </div>
                </div>
              )}
              
              {/* Weaknesses Tab (Analyze) */}
              {activeTab === "weaknesses" && analysisResult.weaknesses?.length > 0 && (
                <div className="tab-pane">
                  <div className="analysis-card weaknesses">
                    <h3>Areas for Improvement</h3>
                    <ExpandableList items={analysisResult.weaknesses} />
                  </div>
                </div>
              )}
              
              {/* Skill Gaps Tab (Improve) */}
              {activeTab === "skillgaps" && analysisResult.skillGaps?.length > 0 && (
                <div className="tab-pane">
                  <div className="analysis-card">
                    <h3>Skill Gaps</h3>
                    <ExpandableList items={analysisResult.skillGaps} isSkills={true} />
                  </div>
                </div>
              )}
              
              {/* Learning Path Tab (Improve) */}
              {activeTab === "learning" && analysisResult.learningPath?.length > 0 && (
                <div className="tab-pane">
                  <div className="analysis-card">
                    <h3>Learning Path</h3>
                    <ExpandableList items={analysisResult.learningPath} />
                  </div>
                </div>
              )}
              
              {/* Priorities Tab (Improve) */}
              {activeTab === "priorities" && analysisResult.topPriorities?.length > 0 && (
                <div className="tab-pane">
                  <div className="analysis-card">
                    <h3>Top Priorities</h3>
                    <ExpandableList items={analysisResult.topPriorities} />
                  </div>
                </div>
              )}
              
              {/* Soft Skills Tab (Improve) */}
              {activeTab === "softskills" && analysisResult.softSkillsImprovement?.length > 0 && (
                <div className="tab-pane">
                  <div className="analysis-card">
                    <h3>Soft Skills Improvement</h3>
                    <ExpandableList items={analysisResult.softSkillsImprovement} isSkills={true} />
                  </div>
                </div>
              )}
              
              {/* Trends Tab (Improve) */}
              {activeTab === "trends" && analysisResult.emergingTrends?.length > 0 && (
                <div className="tab-pane">
                  <div className="analysis-card">
                    <h3>Emerging Trends</h3>
                    <ExpandableList items={analysisResult.emergingTrends} isSkills={true} />
                  </div>
                </div>
              )}
              
              {/* Summary Tab (Match) */}
              {activeTab === "summary" && analysisResult.summary && (
                <div className="tab-pane">
                  <div className="analysis-card">
                    <h3>Match Summary</h3>
                    <p>{analysisResult.summary}</p>
                  </div>
                </div>
              )}
              
              {/* Keywords Tab (Match) */}
              {activeTab === "keywords" && analysisResult.missingKeywords?.length > 0 && (
                <div className="tab-pane">
                  <div className="analysis-card">
                    <h3>Missing Keywords</h3>
                    <div className="skill-cloud">
                      {analysisResult.missingKeywords.map((k, i) => (
                        <SkillTag key={i} skill={k} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Match percentage if not using MatchScoreCard */}
            {analysisResult.matchPercentage != null && !matchInfo && (
              <MatchScoreCard matchPercentage={analysisResult.matchPercentage} />
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}