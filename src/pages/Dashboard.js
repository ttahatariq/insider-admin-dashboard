import React, { useState, useEffect } from "react";
import UserTable from "../components/UserTable";
import FlaggedUsers from "../components/FlaggedUsers";
import LogsViewer from "../components/LogsViewer";
import "./Dashboard.css";

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("users");
  const [stats, setStats] = useState({
    totalUsers: 0,
    flaggedUsers: 0,
    totalLogs: 0
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      // This would be replaced with actual API calls
      // For now, we'll set default stats
      setStats({
        totalUsers: 0,
        flaggedUsers: 0,
        totalLogs: 0
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    if (onLogout) {
      onLogout();
    }
  };

  const tabs = [
    { id: "users", label: "Users", icon: "👥" },
    { id: "flagged", label: "Flagged Users", icon: "🚨" },
    { id: "logs", label: "Activity Logs", icon: "📊" }
  ];

  if (!isAuthenticated) {
    return (
      <div className="dashboard">
        <div className="auth-required">
          <div className="auth-message">
            <h2>🔐 Authentication Required</h2>
            <p>Please log in to access the dashboard.</p>
            <button onClick={handleLogout} className="btn btn-primary">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Insider Threat Detection Dashboard</h1>
          <p>Monitor and manage user activities and security alerts</p>
        </div>
        <div className="header-actions">
          <button onClick={handleLogout} className="logout-button">
            🚪 Logout
          </button>
        </div>
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <span className="stat-number">{stats.totalUsers}</span>
              <span className="stat-label">Total Users</span>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">🚨</div>
            <div className="stat-info">
              <span className="stat-number">{stats.flaggedUsers}</span>
              <span className="stat-label">Flagged Users</span>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <span className="stat-number">{stats.totalLogs}</span>
              <span className="stat-label">Total Logs</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="dashboard-content">
        {activeTab === "users" && <UserTable />}
        {activeTab === "flagged" && <FlaggedUsers />}
        {activeTab === "logs" && <LogsViewer />}
      </main>
    </div>
  );
}
