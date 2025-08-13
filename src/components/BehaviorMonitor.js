import React, { useState, useEffect } from "react";
import API from "../api";
import "./BehaviorMonitor.css";

export default function BehaviorMonitor({ userRole }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    loadBehaviorSummary();
  }, []);

  const loadBehaviorSummary = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await API.get("/behavior-summary");
      setSummary(response.data);
    } catch (err) {
      setError("Failed to load behavior summary. Please try again.");
      console.error("Error loading behavior summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendWeeklySummaryEmail = async () => {
    try {
      setSendingEmail(true);
      setError("");
      const response = await API.post("/send-weekly-summary");
      
      if (response.data.emailSent) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 5000); // Hide success message after 5 seconds
      } else {
        setError("Failed to send weekly summary email.");
      }
    } catch (err) {
      setError("Failed to send weekly summary email. Please try again.");
      console.error("Error sending weekly summary:", err);
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
          <p>Loading behavior summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="component-container">
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={loadBehaviorSummary} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="component-container">
      <div className="component-header">
        <h2>Behavior Monitoring Dashboard</h2>
        <div className="header-actions">
          <button onClick={loadBehaviorSummary} className="refresh-button">
            🔄 Refresh
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
          <p>✅ Weekly summary email sent successfully to tahatariq273@gmail.com</p>
        </div>
      )}

      {summary && (
        <div className="behavior-summary">
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-icon">🚨</div>
              <div className="summary-info">
                <span className="summary-number">{summary.totalSuspicious}</span>
                <span className="summary-label">Suspicious Activities</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">⚠️</div>
              <div className="summary-info">
                <span className="summary-number">{summary.usersWithViolations}</span>
                <span className="summary-label">Users with Violations</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">🚫</div>
              <div className="summary-info">
                <span className="summary-number">{summary.blockedUsers}</span>
                <span className="summary-label">Blocked Users</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">📅</div>
              <div className="summary-info">
                <span className="summary-text">{summary.period}</span>
                <span className="summary-label">Monitoring Period</span>
              </div>
            </div>
          </div>

          {summary.userViolations.length > 0 && (
            <div className="violations-section">
              <h3>Users with Multiple Violations</h3>
              <div className="violations-list">
                {summary.userViolations.map((user, index) => (
                  <div key={index} className={`violation-item risk-${getRiskLevelColor(user.avgRiskScore)}`}>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="user-details">
                        <h4 className="user-name">{user.name || "Unknown User"}</h4>
                        <p className="user-email">{user.email || "No email"}</p>
                        <p className="user-role">Role: {user.role || "Unknown"}</p>
                      </div>
                    </div>
                    
                    <div className="violation-stats">
                      <div className="stat-item">
                        <span className="stat-label">Violations:</span>
                        <span className="stat-value violations-count">{user.violationCount}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Avg Risk:</span>
                        <span className={`stat-value risk-${getRiskLevelColor(user.avgRiskScore)}`}>
                          {(user.avgRiskScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Risk Level:</span>
                        <span className={`risk-badge risk-${getRiskLevelColor(user.avgRiskScore)}`}>
                          {getRiskLevelText(user.avgRiskScore)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="monitoring-rules">
            <h3>Monitoring Rules & Thresholds</h3>
            <div className="rules-grid">
              <div className="rule-card">
                <h4>📥 Download Limits (Work Hours)</h4>
                <ul>
                  <li><strong>Manager:</strong> 10 downloads/day</li>
                  <li><strong>Analyst:</strong> 8 downloads/day</li>
                  <li><strong>Intern:</strong> 5 downloads/day</li>
                  <li><strong>Work Hours:</strong> Mon-Fri, 9 AM - 5 PM</li>
                </ul>
              </div>
              
              <div className="rule-card">
                <h4>🚫 Blocking Thresholds</h4>
                <ul>
                  <li><strong>Manager/Analyst:</strong> 80% risk score</li>
                  <li><strong>Intern:</strong> 150% risk score</li>
                  <li><strong>Weekly Violations:</strong> 3+ suspicious activities</li>
                  <li><strong>Admin:</strong> Cannot be blocked</li>
                </ul>
              </div>
              
              <div className="rule-card">
                <h4>📧 Email Notifications</h4>
                <ul>
                  <li><strong>Admin Email:</strong> tahatariq273@gmail.com</li>
                  <li><strong>Triggers:</strong> High risk, limit exceeded, violations</li>
                  <li><strong>Weekly Summary:</strong> Automated behavior report</li>
                  <li><strong>Real-time Alerts:</strong> Suspicious behavior detection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {!summary && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No Behavior Data Available</h3>
          <p>Behavior monitoring data will appear here once users start performing activities.</p>
        </div>
      )}
    </div>
  );
}
