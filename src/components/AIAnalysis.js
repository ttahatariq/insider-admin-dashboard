import React, { useState, useEffect } from "react";
import { AI_API } from "../api";
import "./AIAnalysis.css";

export default function AIAnalysis({ userRole }) {
  const [aiStatus, setAiStatus] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [userAnalysis, setUserAnalysis] = useState(null);

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Load AI status
      try {
        const statusResponse = await AI_API.get("/status");
        setAiStatus(statusResponse.data.data);
      } catch (err) {
        console.log("Real AI status failed, trying mock endpoint...");
        const mockStatusResponse = await AI_API.get("/mock-status");
        setAiStatus(mockStatusResponse.data.data);
      }
      
      // Load AI insights
      try {
        const insightsResponse = await AI_API.get("/insights");
        setAiInsights(insightsResponse.data.data);
      } catch (err) {
        console.log("Real AI insights failed, trying mock endpoint...");
        const mockInsightsResponse = await AI_API.get("/mock-insights");
        setAiInsights(mockInsightsResponse.data.data);
      }
      
      // Load analysis history (skip for now since we don't have mock data)
      setAnalysisHistory([]);
      
    } catch (err) {
      setError("Failed to load AI data. Please try again.");
      console.error("Error loading AI data:", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerWeeklyAnalysis = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await AI_API.post("/trigger-weekly");
      
      if (response.data.success) {
        alert("✅ AI weekly analysis completed successfully!");
        await loadAIData(); // Reload data
      }
    } catch (err) {
      setError("Failed to trigger weekly analysis. Please try again.");
      console.error("Error triggering weekly analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSpecificUser = async () => {
    if (!selectedUser) {
      alert("Please enter a user ID to analyze");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await AI_API.post(`/analyze-user/${selectedUser}`, {
        timeRange: 7
      });
      
      if (response.data.success) {
        setUserAnalysis(response.data.data);
      }
    } catch (err) {
      setError("Failed to analyze user. Please try again.");
      console.error("Error analyzing user:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskScore) => {
    if (riskScore > 0.8) return "danger";
    if (riskScore > 0.6) return "warning";
    if (riskScore > 0.4) return "info";
    return "success";
  };

  const getRiskLevelText = (riskScore) => {
    if (riskScore > 0.8) return "High";
    if (riskScore > 0.6) return "Medium";
    if (riskScore > 0.4) return "Low";
    return "None";
  };

  if (loading) {
    return (
      <div className="component-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading AI analysis data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="component-container">
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={loadAIData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="component-container">
      <div className="component-header">
        <h2>🤖 AI-Powered Threat Detection Analysis</h2>
        <div className="header-actions">
          <button onClick={loadAIData} className="refresh-button">
            🔄 Refresh
          </button>
          <button 
            onClick={triggerWeeklyAnalysis} 
            disabled={loading}
            className="ai-analysis-button"
          >
            🤖 Trigger Weekly Analysis
          </button>
        </div>
      </div>

      {/* AI System Overview */}
      {aiStatus && (
        <div className="ai-overview-section">
          <h3>🧠 AI System Overview</h3>
          <div className="overview-grid">
            <div className="overview-card">
              <div className="overview-icon">⚙️</div>
              <div className="overview-info">
                <span className="overview-label">AI Model</span>
                <span className="overview-value">OpenAI GPT-3.5 Turbo</span>
              </div>
            </div>
            
            <div className="overview-card">
              <div className="overview-icon">📊</div>
              <div className="overview-info">
                <span className="overview-label">High Risk Threshold</span>
                <span className="overview-value">{(aiStatus.aiConfig?.thresholds?.highRisk * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            <div className="overview-card">
              <div className="overview-icon">🔍</div>
              <div className="overview-info">
                <span className="overview-label">Behavior Patterns</span>
                <span className="overview-value">{aiStatus.aiConfig?.patterns?.length || 0} patterns</span>
              </div>
            </div>
            
            <div className="overview-card">
              <div className="overview-icon">⏰</div>
              <div className="overview-info">
                <span className="overview-label">Last Analysis</span>
                <span className="overview-value">{new Date(aiStatus.lastAnalysis).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Dashboard */}
      {aiInsights && (
        <div className="ai-insights-dashboard">
          <h3>📈 AI-Powered Risk Insights</h3>
          <div className="insights-dashboard-grid">
            <div className="insight-metric">
              <div className="metric-icon">👥</div>
              <div className="metric-info">
                <span className="metric-number">{aiInsights.totalUsers}</span>
                <span className="metric-label">Total Users</span>
              </div>
            </div>
            
            <div className="insight-metric">
              <div className="metric-icon">🚨</div>
              <div className="metric-info">
                <span className="metric-number">{aiInsights.riskDistribution?.high || 0}</span>
                <span className="metric-label">High Risk</span>
              </div>
            </div>
            
            <div className="insight-metric">
              <div className="metric-icon">⚠️</div>
              <div className="metric-info">
                <span className="metric-number">{aiInsights.riskDistribution?.medium || 0}</span>
                <span className="metric-label">Medium Risk</span>
              </div>
            </div>
            
            <div className="insight-metric">
              <div className="metric-icon">✅</div>
              <div className="metric-info">
                <span className="metric-number">{aiInsights.riskDistribution?.low || 0}</span>
                <span className="metric-label">Low Risk</span>
              </div>
            </div>
          </div>

          {/* Top Risk Users */}
          {aiInsights.topRiskUsers && aiInsights.topRiskUsers.length > 0 && (
            <div className="top-risk-section">
              <h4>🚨 Top Risk Users (AI Analysis)</h4>
              <div className="risk-users-grid">
                {aiInsights.topRiskUsers.slice(0, 6).map((user, index) => (
                  <div key={index} className={`risk-user-card risk-${getRiskLevelColor(user.riskScore)}`}>
                    <div className="user-avatar">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="user-details">
                      <h5>{user.name || "Unknown User"}</h5>
                      <p className="user-email">{user.email || "No email"}</p>
                      <p className="user-role">{user.role || "Unknown"}</p>
                    </div>
                    <div className="risk-indicator">
                      <span className={`risk-badge risk-${getRiskLevelColor(user.riskScore)}`}>
                        {getRiskLevelText(user.riskScore)}
                      </span>
                      <span className="risk-score">{(user.riskScore * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Individual User Analysis */}
      <div className="user-analysis-section">
        <h3>🔍 Individual User AI Analysis</h3>
        <div className="user-analysis-controls">
          <input
            type="text"
            placeholder="Enter User ID to analyze..."
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="user-id-input"
          />
          <button 
            onClick={analyzeSpecificUser}
            disabled={!selectedUser || loading}
            className="analyze-user-button"
          >
            🔍 Analyze User
          </button>
        </div>

        {userAnalysis && (
          <div className="user-analysis-results">
            <h4>Analysis Results for User: {selectedUser}</h4>
            <div className="analysis-summary">
              <div className="analysis-metric">
                <span className="metric-label">Risk Score:</span>
                <span className={`metric-value risk-${getRiskLevelColor(userAnalysis.riskScore)}`}>
                  {(userAnalysis.riskScore * 100).toFixed(1)}%
                </span>
              </div>
              <div className="analysis-metric">
                <span className="metric-label">Risk Level:</span>
                <span className={`risk-badge risk-${getRiskLevelColor(userAnalysis.riskScore)}`}>
                  {getRiskLevelText(userAnalysis.riskScore)}
                </span>
              </div>
            </div>
            
            <div className="analysis-details">
              <h5>AI Analysis Summary:</h5>
              <p>{userAnalysis.analysis}</p>
              
              {userAnalysis.recommendations && userAnalysis.recommendations.length > 0 && (
                <div className="recommendations">
                  <h5>AI Recommendations:</h5>
                  <ul>
                    {userAnalysis.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Behavior Patterns */}
      {aiStatus && aiStatus.aiConfig?.patterns && (
        <div className="ai-patterns-section">
          <h3>🔍 AI Behavior Pattern Recognition</h3>
          <div className="patterns-grid">
            {aiStatus.aiConfig.patterns.map((pattern, index) => (
              <div key={index} className="pattern-card">
                <div className="pattern-icon">🔍</div>
                <div className="pattern-info">
                  <h4>{pattern}</h4>
                  <p>AI-powered detection for {pattern.toLowerCase()} patterns</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis History */}
      {analysisHistory.length > 0 && (
        <div className="analysis-history-section">
          <h3>📚 Recent AI Analysis History</h3>
          <div className="history-list">
            {analysisHistory.slice(0, 10).map((analysis, index) => (
              <div key={index} className="history-item">
                <div className="history-info">
                  <span className="history-user">{analysis.userId?.name || "Unknown User"}</span>
                  <span className="history-time">{new Date(analysis.timestamp).toLocaleString()}</span>
                </div>
                <div className="history-action">{analysis.action}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!aiStatus && !aiInsights && (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <h3>AI System Not Connected</h3>
          <p>AI-powered threat detection data will appear here once the system is properly connected.</p>
          <button onClick={loadAIData} className="connect-ai-button">
            🔌 Connect to AI System
          </button>
        </div>
      )}
    </div>
  );
}
