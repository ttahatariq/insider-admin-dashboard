import React, { useState } from "react";
import API from "../api";
import "./UserRegistration.css";

export default function UserRegistration({ onUserCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Intern"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await API.post("/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      });

      if (response.status === 201) {
        setSuccess("User registered successfully!");
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "Intern"
        });
        
        // Call the callback to refresh user list
        if (onUserCreated) {
          onUserCreated();
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Failed to register user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "Intern", label: "Intern", description: "Basic access, limited permissions" },
    { value: "Analyst", label: "Analyst", description: "Data analysis and reporting" },
    { value: "Manager", label: "Manager", description: "Team management and oversight" },
    { value: "Admin", label: "Admin", description: "Full system access and control" }
  ];

  return (
    <div className="component-container">
      <div className="component-header">
        <h2>Register New User</h2>
        <p>Create new user accounts with appropriate roles and permissions</p>
      </div>

      <div className="registration-form-container">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="form-input"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="form-input"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password (min 6 characters)"
                className="form-input"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm password"
                className="form-input"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              User Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="form-select"
              disabled={loading}
              required
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label} - {role.description}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="mini-spinner"></span>
                  Creating User...
                </>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>

        <div className="role-info">
          <h3>Role Permissions</h3>
          <div className="role-grid">
            {roles.map(role => (
              <div key={role.value} className="role-card">
                <h4>{role.label}</h4>
                <p>{role.description}</p>
                <div className="permissions">
                  {role.value === "Intern" && (
                    <span>• Basic file access</span>
                  )}
                  {role.value === "Analyst" && (
                    <>
                      <span>• View user data</span>
                      <span>• Access reports</span>
                      <span>• View own logs</span>
                    </>
                  )}
                  {role.value === "Manager" && (
                    <>
                      <span>• Manage team members</span>
                      <span>• View team logs</span>
                      <span>• Unblock team users</span>
                    </>
                  )}
                  {role.value === "Admin" && (
                    <>
                      <span>• Full system access</span>
                      <span>• Manage all users</span>
                      <span>• View all logs</span>
                      <span>• System administration</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
