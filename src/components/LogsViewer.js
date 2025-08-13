import React, { useEffect, useState } from "react";
import API from "../api";
import "./LogsViewer.css";

export default function LogsViewer({ userRole }) {
  const [userId, setUserId] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState("7d");

  const loadLogs = async () => {
    if (!userId.trim()) {
      setError("Please enter a User ID to view logs");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await API.get(`/logs/${userId}`);
      setLogs(response.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You don't have permission to view logs for this user. Check your role permissions.");
      } else {
        setError("Failed to load logs. Please check the User ID and try again.");
      }
      console.error("Error loading logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadOwnLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get("/my-logs");
      setLogs(response.data);
      setUserId("Your Logs");
    } catch (err) {
      setError("Failed to load your logs. Please try again.");
      console.error("Error loading own logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get("/all-logs");
      setLogs(response.data);
      setUserId("All Users");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You don't have permission to view all logs. Admin access required.");
      } else {
        setError("Failed to load all logs. Please try again.");
      }
      console.error("Error loading all logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const actionLower = action?.toLowerCase() || "";
    if (actionLower.includes("login")) return "🔐";
    if (actionLower.includes("logout")) return "🚪";
    if (actionLower.includes("download")) return "⬇️";
    if (actionLower.includes("upload")) return "⬆️";
    if (actionLower.includes("delete")) return "🗑️";
    if (actionLower.includes("modify")) return "✏️";
    if (actionLower.includes("access")) return "🔍";
    return "📝";
  };

  const getActionColor = (action) => {
    const actionLower = action?.toLowerCase() || "";
    if (actionLower.includes("login") || actionLower.includes("logout")) return "info";
    if (actionLower.includes("download") || actionLower.includes("access")) return "success";
    if (actionLower.includes("upload") || actionLower.includes("modify")) return "warning";
    if (actionLower.includes("delete")) return "danger";
    return "default";
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress?.includes(searchTerm);
    
    const matchesType = filterType === "all" || 
      (filterType === "suspicious" && log.riskScore > 0.7) ||
      (filterType === "normal" && log.riskScore <= 0.7);
    
    return matchesSearch && matchesType;
  });

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (err) {
      return "Invalid date";
    }
  };

  const getRiskLevel = (riskScore) => {
    if (riskScore > 0.8) return { level: "High", color: "danger" };
    if (riskScore > 0.5) return { level: "Medium", color: "warning" };
    if (riskScore > 0.2) return { level: "Low", color: "info" };
    return { level: "None", color: "success" };
  };

  const canViewOtherUserLogs = ["Admin", "Manager"].includes(userRole);
  const canViewAllLogs = userRole === "Admin";

  return (
    <div className="component-container">
      <div className="component-header">
        <h2>Activity Logs</h2>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Activities</option>
            <option value="suspicious">Suspicious</option>
            <option value="normal">Normal</option>
          </select>
        </div>
      </div>

      <div className="logs-controls">
        <div className="user-input-section">
          {canViewOtherUserLogs ? (
            <>
              <div className="input-group">
                <label htmlFor="userId">User ID:</label>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter User ID to view logs"
                  className="user-id-input"
                />
              </div>
              <button 
                onClick={loadLogs} 
                disabled={loading || !userId.trim()}
                className="load-logs-button"
              >
                {loading ? (
                  <>
                    <span className="mini-spinner"></span>
                    Loading...
                  </>
                ) : (
                  'Load Logs'
                )}
              </button>
              {canViewAllLogs && (
                <button 
                  onClick={loadAllLogs} 
                  disabled={loading}
                  className="load-all-logs-button"
                >
                  {loading ? (
                    <>
                      <span className="mini-spinner"></span>
                      Loading...
                    </>
                  ) : (
                    '📊 Load All Logs'
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="own-logs-section">
              <p>You can only view your own activity logs.</p>
              <button 
                onClick={loadOwnLogs} 
                disabled={loading}
                className="load-logs-button"
              >
                {loading ? (
                  <>
                    <span className="mini-spinner"></span>
                    Loading...
                  </>
                ) : (
                  'View My Logs'
                )}
              </button>
            </div>
          )}
        </div>

        {logs.length > 0 && (
          <div className="logs-summary">
            <span className="summary-item">
              📊 Total Logs: {logs.length}
            </span>
            <span className="summary-item">
              🚨 Suspicious: {logs.filter(log => log.riskScore > 0.7).length}
            </span>
            <span className="summary-item">
              ✅ Normal: {logs.filter(log => log.riskScore <= 0.7).length}
            </span>
          </div>
        )}
      </div>

      {!canViewOtherUserLogs && (
        <div className="permission-notice">
          <p>ℹ️ Your role ({userRole}) has limited access to logs. You can only view your own activity logs.</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={() => setError(null)} className="dismiss-button">
            Dismiss
          </button>
        </div>
      )}

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading activity logs...</p>
        </div>
      )}

      {!loading && logs.length === 0 && userId && !error && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Logs Found</h3>
          <p>No activity logs found for the specified User ID.</p>
        </div>
      )}

      {!loading && filteredLogs.length > 0 && (
        <div className="logs-container">
          <div className="logs-header">
            <h3>
              {userId === "Your Logs" ? "Your Activity Logs" : 
               userId === "All Users" ? "All Users Activity Logs" : 
               `Activity Logs for User: ${userId}`}
            </h3>
            <p>Showing {filteredLogs.length} of {logs.length} logs</p>
          </div>
          
          <div className="logs-list">
            {filteredLogs.map((log) => {
              const actionIcon = getActionIcon(log.action);
              const actionColor = getActionColor(log.action);
              const riskInfo = getRiskLevel(log.riskScore || 0);
              
              return (
                <div key={log._id} className={`log-item risk-${riskInfo.color}`}>
                  <div className="log-header">
                    <div className="log-action">
                      <span className={`action-icon ${actionColor}`}>
                        {actionIcon}
                      </span>
                      <span className="action-text">{log.action || "Unknown Action"}</span>
                    </div>
                    <div className="log-meta">
                      <span className="log-timestamp">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <span className={`risk-badge risk-${riskInfo.color}`}>
                        {riskInfo.level}
                      </span>
                    </div>
                  </div>
                  
                  <div className="log-details">
                    {log.userId && typeof log.userId === 'object' && (
                      <div className="detail-row">
                        <span className="detail-label">User:</span>
                        <span className="detail-value user-info">
                          {log.userId.name || 'Unknown'} ({log.userId.email || 'No email'}) - {log.userId.role || 'Unknown role'}
                        </span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">IP Address:</span>
                      <span className="detail-value ip-address">{log.ipAddress || "Unknown"}</span>
                    </div>
                    {log.userAgent && (
                      <div className="detail-row">
                        <span className="detail-label">User Agent:</span>
                        <span className="detail-value user-agent">{log.userAgent}</span>
                      </div>
                    )}
                    {log.riskScore !== undefined && (
                      <div className="detail-row">
                        <span className="detail-label">Risk Score:</span>
                        <span className="detail-value risk-score">
                          {(log.riskScore * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {log.additionalData && Object.keys(log.additionalData).length > 0 && (
                      <div className="detail-row">
                        <span className="detail-label">Additional Data:</span>
                        <span className="detail-value additional-data">
                          {JSON.stringify(log.additionalData, null, 2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && !userId && canViewOtherUserLogs && (
        <div className="initial-state">
          <div className="initial-icon">🔍</div>
          <h3>Enter User ID to View Logs</h3>
          <p>Enter a User ID above to view their activity logs and security events.</p>
        </div>
      )}

      {!loading && !userId && !canViewOtherUserLogs && (
        <div className="initial-state">
          <div className="initial-icon">📊</div>
          <h3>View Your Activity Logs</h3>
          <p>Click the button above to view your own activity logs and security events.</p>
        </div>
      )}
    </div>
  );
}
