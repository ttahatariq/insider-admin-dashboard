import React, { useEffect, useState } from "react";
import API from "../api";
import "./UserTable.css";

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get("/all-users");
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users. Please try again later.");
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
    try {
      if (currentStatus) {
        await API.post(`/unblock/${userId}`);
      } else {
        await API.post(`/block/${userId}`);
      }
      // Refresh the users list
      fetchUsers();
    } catch (err) {
      setError("Failed to update user status. Please try again.");
      console.error("Error updating user status:", err);
    }
  };

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

      {filteredAndSortedUsers.length === 0 ? (
        <div className="empty-state">
          <p>No users found matching your search criteria.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.map((user) => (
                <tr key={user._id} className={user.isBlocked ? "blocked-user" : ""}>
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
                    <button
                      onClick={() => toggleUserStatus(user._id, user.isBlocked)}
                      className={`action-button ${user.isBlocked ? "unblock" : "block"}`}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-footer">
        <p>Showing {filteredAndSortedUsers.length} of {users.length} users</p>
      </div>
    </div>
  );
}
