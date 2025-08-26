import React, { useEffect, useState } from "react";
import API from "../api";
import "./FlaggedUsers.css";

export default function FlaggedUsers({ userRole, onUserUnblocked, onViewLogs }) {
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(new Set());

  const fetchFlagged = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get("/flagged-users");
      
      // Debug: Log the data received
      console.log('Flagged users data received:', response.data);
      
      // Validate and clean the data
      const cleanedData = response.data.map(user => {
        if (user.riskNotes && !Array.isArray(user.riskNotes)) {
          console.warn('Invalid riskNotes format for user:', user._id, user.riskNotes);
          user.riskNotes = [];
        }
        return user;
      });
      
      setFlagged(cleanedData);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You don't have permission to view flagged users. Contact your administrator.");
      } else {
        setError("Failed to fetch flagged users. Please try again later.");
      }
      console.error("Error fetching flagged users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlagged();
  }, [userRole]);

  const unblock = async (id) => {
    if (!["Admin", "Manager"].includes(userRole)) {
      setError("You don't have permission to unblock users.");
      return;
    }

    if (processing.has(id)) return;
    
    try {
      setProcessing(prev => new Set(prev).add(id));
      await API.post(`/unblock/${id}`);
      await fetchFlagged();
      onUserUnblocked && onUserUnblocked(id);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You don't have permission to unblock this user.");
      } else {
        setError("Failed to unblock user. Please try again.");
      }
      console.error("Error unblocking user:", err);
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const viewUserLogs = (userId, userName) => {
    if (onViewLogs) {
      onViewLogs(userId, userName);
    } else {
      // Fallback: copy the user ID
      navigator.clipboard.writeText(userId).then(() => {
        alert(`User ID copied: ${userId}\n\nYou can now go to the Activity Logs tab and paste this ID to view logs for ${userName}`);
      }).catch(() => {
        alert(`User ID: ${userId}\n\nYou can now go to the Activity Logs tab and paste this ID to view logs for ${userName}`);
      });
    }
  };

  const getRiskLevel = (riskNotes) => {
    if (!riskNotes || !Array.isArray(riskNotes) || riskNotes.length === 0) return "low";
    if (riskNotes.length > 3) return "high";
    if (riskNotes.length > 1) return "medium";
    return "low";
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case "high": return "🚨";
      case "medium": return "⚠️";
      case "low": return "ℹ️";
      default: return "ℹ️";
    }
  };

  const canUnblockUsers = ["Admin", "Manager"].includes(userRole);

  if (loading) {
    return (
      <div className="component-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading flagged users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="component-container">
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={fetchFlagged} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="component-container">
      <div className="component-header">
        <h2>Flagged Users</h2>
        <div className="header-actions">
          <span className="flagged-count">
            {flagged.length} user{flagged.length !== 1 ? 's' : ''} flagged
          </span>
          <button onClick={fetchFlagged} className="refresh-button">
            🔄 Refresh
          </button>
        </div>
      </div>

      {!canUnblockUsers && (
        <div className="permission-notice">
          <p>ℹ️ You have limited access to flagged users based on your role: <strong>{userRole}</strong></p>
        </div>
      )}

      {flagged.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>No Flagged Users</h3>
          <p>All users are currently in good standing.</p>
        </div>
      ) : (
        <div className="flagged-grid">
          {flagged.map((user) => {
            const riskLevel = getRiskLevel(user.riskNotes);
            const riskIcon = getRiskIcon(riskLevel);
            
            return (
              <div key={user._id} className={`flagged-card risk-${riskLevel}`}>
                <div className="card-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="user-details">
                      <h4 className="user-name">{user.name || "Unknown User"}</h4>
                      <p className="user-email">{user.email || "No email"}</p>
                    </div>
                  </div>
                  <div className="risk-indicator">
                    <span className="risk-icon">{riskIcon}</span>
                    <span className="risk-level">{riskLevel.toUpperCase()}</span>
                  </div>
                </div>

                <div className="card-content">
                  <div className="risk-details">
                    <h5>Risk Factors:</h5>
                    {user.riskNotes && Array.isArray(user.riskNotes) && user.riskNotes.length > 0 ? (
                      <ul className="risk-list">
                        {user.riskNotes.map((note, index) => {
                          let displayText = 'Unknown risk note';
                          try {
                            if (typeof note === 'string') {
                              displayText = note;
                            } else if (note && typeof note === 'object' && note.reason) {
                              displayText = `${note.reason} (${note.action || 'unknown action'})`;
                            }
                          } catch (error) {
                            console.error('Error processing risk note:', error, note);
                            displayText = 'Error processing risk note';
                          }
                          return (
                            <li key={index} className="risk-item">
                              {displayText}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="no-notes">No specific risk notes available</p>
                    )}
                  </div>

                  {canUnblockUsers && (
                    <div className="card-actions">
                      <button
                        onClick={() => viewUserLogs(user._id, user.name)}
                        className="view-logs-button"
                        title="View user activity logs"
                      >
                        📊 View Logs
                      </button>
                      <button
                        onClick={() => unblock(user._id)}
                        disabled={processing.has(user._id)}
                        className={`unblock-button ${processing.has(user._id) ? 'processing' : ''}`}
                      >
                        {processing.has(user._id) ? (
                          <>
                            <span className="mini-spinner"></span>
                            Processing...
                          </>
                        ) : (
                          'Unblock User'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="component-footer">
        <p>
          <strong>Note:</strong> Flagged users are automatically detected based on suspicious activity patterns.
          {!canUnblockUsers && " Contact your administrator to manage blocked users."}
        </p>
        {!canUnblockUsers && (
          <p className="permission-note">
            <small>Your role ({userRole}) has limited access to flagged user management</small>
          </p>
        )}
      </div>
    </div>
  );
}
