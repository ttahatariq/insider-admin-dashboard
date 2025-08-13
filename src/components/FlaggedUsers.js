import React, { useEffect, useState } from "react";
import API from "../api";
import "./FlaggedUsers.css";

export default function FlaggedUsers() {
  const [flagged, setFlagged] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(new Set());

  const fetchFlagged = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get("/flagged-users");
      setFlagged(response.data);
    } catch (err) {
      setError("Failed to fetch flagged users. Please try again later.");
      console.error("Error fetching flagged users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlagged();
  }, []);

  const unblock = async (id) => {
    if (processing.has(id)) return;
    
    try {
      setProcessing(prev => new Set(prev).add(id));
      await API.post(`/unblock/${id}`);
      await fetchFlagged();
    } catch (err) {
      setError("Failed to unblock user. Please try again.");
      console.error("Error unblocking user:", err);
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getRiskLevel = (riskNotes) => {
    if (!riskNotes || riskNotes.length === 0) return "low";
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
                    {user.riskNotes && user.riskNotes.length > 0 ? (
                      <ul className="risk-list">
                        {user.riskNotes.map((note, index) => (
                          <li key={index} className="risk-item">
                            {note}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-notes">No specific risk notes available</p>
                    )}
                  </div>

                  <div className="card-actions">
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="component-footer">
        <p>
          <strong>Note:</strong> Flagged users are automatically detected based on suspicious activity patterns.
          Review each case carefully before taking action.
        </p>
      </div>
    </div>
  );
}
