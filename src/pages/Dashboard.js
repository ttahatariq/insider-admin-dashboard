import React, { useState, useEffect } from "react";
import UserTable from "../components/UserTable";
import FlaggedUsers from "../components/FlaggedUsers";
import LogsViewer from "../components/LogsViewer";
import UserRegistration from "../components/UserRegistration";
import FileDownloads from "../components/FileDownloads";
import BehaviorMonitor from "../components/BehaviorMonitor";
import AIAnalysis from "../components/AIAnalysis";
import API from "../api";
import "./Dashboard.css";

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("users");
  const [stats, setStats] = useState({
    totalUsers: 0,
    flaggedUsers: 0,
    totalLogs: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile();
      fetchStats();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await API.get('/profile');
      setUserRole(response.data.role);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError("");

      // Fetch total users
      const usersResponse = await API.get('/all-users');
      const totalUsers = usersResponse.data.length;

      // Fetch flagged users
      const flaggedResponse = await API.get('/flagged-users');
      const flaggedUsers = flaggedResponse.data.length;

      // Fetch total logs count from the new endpoint
      const logsResponse = await API.get('/total-logs-count');
      const totalLogs = logsResponse.data.totalLogs;

      setStats({
        totalUsers,
        flaggedUsers,
        totalLogs
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setStatsError("Failed to load dashboard statistics");
      // Set default stats on error
      setStats({
        totalUsers: 0,
        flaggedUsers: 0,
        totalLogs: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Refresh stats when switching to certain tabs
    if (["users", "flagged", "logs"].includes(tabId)) {
      fetchStats();
    }
  };

  const handleViewUserLogs = (userId, userName) => {
    setActiveTab("logs");
    // You could also set the user ID in the LogsViewer component here
    // For now, the user can copy the ID and paste it in the logs tab
    alert(`Switched to Activity Logs tab!\n\nUser ID: ${userId}\nUser: ${userName}\n\nYou can now paste this ID in the logs tab to view their activity.`);
  };

  const canAccessTab = (tabId) => {
    switch (tabId) {
      case "users":
        return ["Admin", "Manager", "Analyst", "Intern"].includes(userRole);
      case "flagged":
        return ["Admin", "Manager", "Analyst", "Intern"].includes(userRole);
      case "logs":
        return ["Admin", "Manager", "Analyst", "Intern"].includes(userRole);
      case "downloads":
        return ["Admin", "Manager", "Analyst", "Intern"].includes(userRole);
      case "behavior":
        return ["Admin"].includes(userRole);
      case "register":
        return ["Admin", "Manager"].includes(userRole);
      default:
        return false;
    }
  };

  const tabs = [
    { id: "users", label: "Users", icon: "👥" },
    { id: "flagged", label: "Flagged Users", icon: "🚨" },
    { id: "logs", label: "Activity Logs", icon: "📊" },
    { id: "downloads", label: "File Downloads", icon: "⬇️" },
    { id: "behavior", label: "Behavior Monitor", icon: "🔍" },
    { id: "ai-analysis", label: "AI Analysis", icon: "🤖" },
    { id: "register", label: "Register User", icon: "➕" }
  ].filter(tab => canAccessTab(tab.id));

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
          <div className="user-info">
            <span className="user-role">Role: {userRole}</span>
          </div>
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
              <span className="stat-number">
                {statsLoading ? <span className="loading-dots">...</span> : stats.totalUsers}
              </span>
              <span className="stat-label">Total Users</span>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">🚨</div>
            <div className="stat-info">
              <span className="stat-number">
                {statsLoading ? <span className="loading-dots">...</span> : stats.flaggedUsers}
              </span>
              <span className="stat-label">Flagged Users</span>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <span className="stat-number">
                {statsLoading ? <span className="loading-dots">...</span> : stats.totalLogs}
              </span>
              <span className="stat-label">Total Logs</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-info">
              <button onClick={fetchStats} className="refresh-stats-btn" disabled={statsLoading}>
                {statsLoading ? "Refreshing..." : "Refresh Stats"}
              </button>
            </div>
          </div>
        </div>
        {statsError && (
          <div className="stats-error">
            <p>⚠️ {statsError}</p>
            <button onClick={fetchStats} className="retry-stats-btn">
              Try Again
            </button>
          </div>
        )}
      </header>

      <nav className="dashboard-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="dashboard-content">
        {activeTab === "users" && <UserTable userRole={userRole} onUserStatusChanged={() => fetchStats()} onViewLogs={handleViewUserLogs} />}
        {activeTab === "flagged" && <FlaggedUsers userRole={userRole} onUserUnblocked={() => fetchStats()} onViewLogs={handleViewUserLogs} />}
        {activeTab === "logs" && <LogsViewer userRole={userRole} />}
        {activeTab === "downloads" && <FileDownloads userRole={userRole} />}
        {activeTab === "behavior" && <BehaviorMonitor userRole={userRole} />}
        {activeTab === "ai-analysis" && <AIAnalysis userRole={userRole} />}
        {activeTab === "register" && <UserRegistration onUserCreated={() => {
          setActiveTab("users");
          fetchStats(); // Refresh stats after user creation
        }} />}
      </main>
    </div>
  );
}
