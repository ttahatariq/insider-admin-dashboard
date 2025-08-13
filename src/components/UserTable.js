import React, { useEffect, useState } from "react";
import API from "../api";
import "./UserTable.css";

export default function UserTable({ userRole, onUserStatusChanged, onViewLogs }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchUsers();
  }, [userRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get("/all-users");
      setUsers(response.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You don't have permission to view all users. Contact your administrator.");
      } else {
        setError("Failed to fetch users. Please try again later.");
      }
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const copyUserId = async (userId) => {
    try {
      await navigator.clipboard.writeText(userId);
      // Visual feedback
      const element = document.querySelector(`[data-user-id="${userId}"]`);
      if (element) {
        element.style.background = '#48bb78';
        element.style.color = 'white';
        setTimeout(() => {
          element.style.background = '';
          element.style.color = '';
        }, 1000);
      }
      // You could add a toast notification here
      console.log("User ID copied to clipboard:", userId);
    } catch (err) {
      console.error("Failed to copy user ID:", err);
    }
  };

  const viewUserLogs = (userId, userName) => {
    if (onViewLogs) {
      onViewLogs(userId, userName);
    } else {
      // Fallback: copy the user ID
      copyUserId(userId);
      alert(`User ID copied: ${userId}\n\nYou can now go to the Activity Logs tab and paste this ID to view logs for ${userName}`);
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy] || "";
      const bValue = b[sortBy] || "";
      
      if (sortOrder === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

  const toggleUserStatus = async (userId, currentStatus) => {
    if (!["Admin", "Manager"].includes(userRole)) {
      setError("You don't have permission to block/unblock users.");
      return;
    }

    try {
      if (currentStatus) {
        await API.post(`/unblock/${userId}`);
      } else {
        // For blocking, we'll need to implement this endpoint
        setError("Blocking users is not yet implemented.");
        return;
      }
      // Refresh the users list
      fetchUsers();
      onUserStatusChanged && onUserStatusChanged(userId, !currentStatus);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You don't have permission to perform this action.");
      } else {
        setError("Failed to update user status. Please try again.");
      }
      console.error("Error updating user status:", err);
    }
  };

  const canManageUsers = ["Admin", "Manager"].includes(userRole);
  const canSeeAllData = userRole === "Admin";

  if (loading) {
    return (
      <div className="component-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="component-container">
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={fetchUsers} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="component-container">
      <div className="component-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <button onClick={fetchUsers} className="refresh-button">
            🔄 Refresh
          </button>
        </div>
      </div>

      {!canManageUsers && (
        <div className="permission-notice">
          <p>ℹ️ You have limited access to user data based on your role: <strong>{userRole}</strong></p>
        </div>
      )}

      {filteredAndSortedUsers.length === 0 ? (
        <div className="empty-state">
          <p>No users found matching your search criteria.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("_id")} className="sortable">
                  User ID {sortBy === "_id" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("name")} className="sortable">
                  Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("email")} className="sortable">
                  Email {sortBy === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("role")} className="sortable">
                  Role {sortBy === "role" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("isBlocked")} className="sortable">
                  Status {sortBy === "isBlocked" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                {canManageUsers && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.map((user) => (
                <tr key={user._id} className={user.isBlocked ? "blocked-user" : ""}>
                  <td className="user-id">
                    <span className="id-text" title="Click to copy ID" onClick={() => copyUserId(user._id)} data-user-id={user._id}>{user._id}</span>
                  </td>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <span className="user-name">{user.name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="user-email">{user.email || "No email"}</td>
                  <td>
                    <span className={`role-badge role-${user.role?.toLowerCase() || "unknown"}`}>
                      {user.role || "Unknown"}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isBlocked ? "blocked" : "active"}`}>
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td>
                    <div className="user-actions">
                      <button
                        onClick={() => viewUserLogs(user._id, user.name)}
                        className="action-button view-logs"
                        title="View user activity logs"
                      >
                        📊 View Logs
                      </button>
                      {canManageUsers && (
                        user.isBlocked ? (
                          <button
                            onClick={() => toggleUserStatus(user._id, user.isBlocked)}
                            className="action-button unblock"
                          >
                            Unblock
                          </button>
                        ) : (
                          <span className="no-action">No action needed</span>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-footer">
        <p>Showing {filteredAndSortedUsers.length} of {users.length} users</p>
        {!canManageUsers && (
          <p className="permission-note">
            <small>Note: You have limited access based on your {userRole} role</small>
          </p>
        )}
      </div>
    </div>
  );
}
