import React, { useState, useEffect } from "react";
import { AI_API } from "../api";
import "./BehaviorMonitor.css";

export default function BehaviorMonitor({ userRole }) {
  const [aiStatus, setAiStatus] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    loadAIStatus();
    loadAIInsights();
  }, []);

  const loadAIStatus = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await AI_API.get("/status");
      setAiStatus(response.data.data);
    } catch (err) {
      console.log("Real AI status failed, trying mock endpoint...");
      try {
        const mockResponse = await AI_API.get("/mock-status");
        setAiStatus(mockResponse.data.data);
      } catch (mockErr) {
        setError("Failed to load AI system status. Please try again.");
        console.error("Error loading AI status:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsights = async () => {
    try {
      const response = await AI_API.get("/insights");
      setAiInsights(response.data.data);
    } catch (err) {
      console.log("Real AI insights failed, trying mock endpoint...");
      try {
        const mockResponse = await AI_API.get("/mock-insights");
        setAiInsights(mockResponse.data.data);
      } catch (mockErr) {
        console.error("Error loading AI insights:", err);
      }
    }
  };

  const triggerAIAnalysis = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await AI_API.post("/trigger-weekly");
      
      if (response.data.success) {
        // Reload insights after analysis
        await loadAIInsights();
        alert("✅ AI analysis completed successfully!");
      }
    } catch (err) {
      setError("Failed to trigger AI analysis. Please try again.");
      console.error("Error triggering AI analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendWeeklySummaryEmail = async () => {
    try {
      setSendingEmail(true);
      setError("");
      const response = await AI_API.post("/trigger-weekly");
      
      if (response.data.success) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 5000);
      } else {
        setError("Failed to send weekly summary email.");
      }
    } catch (err) {
      setError("Failed to send weekly summary email. Please try again.");
      console.error("Error sending weekly summary email:", err);
    } finally {
      setSendingEmail(false);
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
          <p>Loading AI system status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="component-container">
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={loadAIStatus} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="component-container">
      <div className="component-header">
        <h2>🧠 AI-Powered Behavior Monitoring Dashboard</h2>
        <div className="header-actions">
          <button onClick={loadAIStatus} className="refresh-button">
            🔄 Refresh
          </button>
          <button 
            onClick={triggerAIAnalysis} 
            disabled={loading}
            className="ai-analysis-button"
          >
            🤖 Trigger AI Analysis
          </button>
          <button 
            onClick={sendWeeklySummaryEmail} 
            disabled={sendingEmail}
            className="send-email-button"
          >
            {sendingEmail ? (
              <>
                <span className="mini-spinner"></span>
                Sending...
              </>
            ) : (
              '📧 Send Weekly Summary'
            )}
          </button>
        </div>
      </div>

      {emailSent && (
        <div className="success-message">
          <p>✅ Weekly summary email sent successfully!</p>
        </div>
      )}

      {/* AI System Status */}
      {aiStatus && (
        <div className="ai-status-section">
          <h3>🤖 AI System Status</h3>
          <div className="status-grid">
            <div className="status-card">
              <div className="status-icon">⚙️</div>
              <div className="status-info">
                <span className="status-label">AI Model</span>
                <span className="status-value">OpenAI GPT-3.5 Turbo</span>
              </div>
            </div>
            
            <div className="status-card">
              <div className="status-icon">📊</div>
              <div className="status-info">
                <span className="status-label">High Risk Threshold</span>
                <span className="status-value">{(aiStatus.aiConfig?.thresholds?.highRisk * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            <div className="status-card">
              <div className="status-icon">🔍</div>
              <div className="status-info">
                <span className="status-label">Behavior Patterns</span>
                <span className="status-value">{aiStatus.aiConfig?.patterns?.length || 0} patterns</span>
              </div>
            </div>
            
            <div className="status-card">
              <div className="status-icon">⏰</div>
              <div className="status-info">
                <span className="status-label">Last Analysis</span>
                <span className="status-value">{new Date(aiStatus.lastAnalysis).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {aiInsights && (
        <div className="ai-insights-section">
          <h3>🧠 AI-Powered Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">👥</div>
              <div className="insight-info">
                <span className="insight-number">{aiInsights.totalUsers}</span>
                <span className="insight-label">Total Users Monitored</span>
              </div>
            </div>
            
            <div className="insight-card">
              <div className="insight-icon">🚨</div>
              <div className="insight-info">
                <span className="insight-number">{aiInsights.riskDistribution?.high || 0}</span>
                <span className="insight-label">High Risk Users</span>
              </div>
            </div>
            
            <div className="insight-card">
              <div className="insight-icon">⚠️</div>
              <div className="insight-info">
                <span className="insight-number">{aiInsights.riskDistribution?.medium || 0}</span>
                <span className="insight-label">Medium Risk Users</span>
              </div>
            </div>
            
            <div className="insight-card">
              <div className="insight-icon">✅</div>
              <div className="insight-info">
                <span className="insight-number">{aiInsights.riskDistribution?.low || 0}</span>
                <span className="insight-label">Low Risk Users</span>
              </div>
            </div>
          </div>

          {/* Top Risk Users */}
          {aiInsights.topRiskUsers && aiInsights.topRiskUsers.length > 0 && (
            <div className="top-risk-users">
              <h4>🚨 Top Risk Users (AI Analysis)</h4>
              <div className="risk-users-list">
                {aiInsights.topRiskUsers.slice(0, 5).map((user, index) => (
                  <div key={index} className={`risk-user-item risk-${getRiskLevelColor(user.riskScore)}`}>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="user-details">
                        <h5 className="user-name">{user.name || "Unknown User"}</h5>
                        <p className="user-email">{user.email || "No email"}</p>
                        <p className="user-role">Role: {user.role || "Unknown"}</p>
                      </div>
                    </div>
                    
                    <div className="risk-info">
                      <div className="risk-score">
                        <span className="risk-label">AI Risk Score:</span>
                        <span className={`risk-value risk-${getRiskLevelColor(user.riskScore)}`}>
                          {(user.riskScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="risk-level">
                        <span className={`risk-badge risk-${getRiskLevelColor(user.riskScore)}`}>
                          {getRiskLevelText(user.riskScore)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

      {!aiStatus && !aiInsights && (
        <div className="empty-state">
          <div className="empty-icon">🤖</div>
          <h3>AI System Not Connected</h3>
          <p>AI-powered threat detection data will appear here once the system is properly connected.</p>
          <button onClick={loadAIStatus} className="connect-ai-button">
            🔌 Connect to AI System
          </button>
        </div>
      )}
    </div>
  );
}
