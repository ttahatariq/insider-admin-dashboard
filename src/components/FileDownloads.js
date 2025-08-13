import React, { useState, useEffect } from "react";
import API from "../api";
import "./FileDownloads.css";

export default function FileDownloads({ userRole }) {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    loadDownloadHistory();
  }, []);

  const loadDownloadHistory = async () => {
    try {
      setLoading(true);
      setError("");
      // This would fetch download history from your backend
      // For now, we'll simulate some download history
      const mockDownloads = [
        {
          id: 1,
          fileName: "security_report.pdf",
          fileSize: "2.5 MB",
          downloadDate: new Date(Date.now() - 86400000).toISOString(),
          status: "completed",
          riskScore: 0.2
        },
        {
          id: 2,
          fileName: "user_activity_logs.csv",
          fileSize: "1.8 MB",
          downloadDate: new Date(Date.now() - 172800000).toISOString(),
          status: "completed",
          riskScore: 0.1
        },
        {
          id: 3,
          fileName: "threat_analysis.xlsx",
          fileSize: "3.2 MB",
          downloadDate: new Date(Date.now() - 259200000).toISOString(),
          status: "completed",
          riskScore: 0.3
        }
      ];
      setDownloads(mockDownloads);
    } catch (err) {
      setError("Failed to load download history. Please try again.");
      console.error("Error loading download history:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (fileName) => {
    try {
      setDownloading(true);
      setError("");
      
      // Call the backend download endpoint
      const response = await API.get("/download-files");
      
      if (response.data.riskScore > 0.7) {
        setError("Download blocked due to high risk score. Please contact administrator.");
        return;
      }

      // Simulate file download
      const link = document.createElement('a');
      link.href = `data:text/plain;charset=utf-8,${encodeURIComponent('This is a sample file content for ' + fileName)}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Add to download history
      const newDownload = {
        id: Date.now(),
        fileName,
        fileSize: "1.0 MB",
        downloadDate: new Date().toISOString(),
        status: "completed",
        riskScore: response.data.riskScore || 0.1
      };
      setDownloads(prev => [newDownload, ...prev]);

    } catch (err) {
      if (err.response?.status === 403) {
        setError("Download blocked due to suspicious behavior. Please try again later.");
      } else {
        setError("Failed to download file. Please try again.");
      }
      console.error("Error downloading file:", err);
    } finally {
      setDownloading(false);
    }
  };

  const getRiskLevel = (riskScore) => {
    if (riskScore > 0.8) return { level: "High", color: "danger" };
    if (riskScore > 0.5) return { level: "Medium", color: "warning" };
    if (riskScore > 0.2) return { level: "Low", color: "info" };
    return { level: "None", color: "success" };
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (err) {
      return "Invalid date";
    }
  };

  const filteredDownloads = downloads.filter(download => {
    const matchesSearch = !searchTerm || 
      download.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || 
      (filterType === "suspicious" && download.riskScore > 0.7) ||
      (filterType === "normal" && download.riskScore <= 0.7);
    
    return matchesSearch && matchesType;
  });

  const canDownloadFiles = ["Admin", "Manager", "Analyst", "Intern"].includes(userRole);

  if (loading) {
    return (
      <div className="component-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading download history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="component-container">
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={loadDownloadHistory} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="component-container">
      <div className="component-header">
        <h2>File Downloads</h2>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search downloads..."
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
            <option value="all">All Downloads</option>
            <option value="suspicious">Suspicious</option>
            <option value="normal">Normal</option>
          </select>
          <button onClick={loadDownloadHistory} className="refresh-button">
            🔄 Refresh
          </button>
        </div>
      </div>

      {!canDownloadFiles && (
        <div className="permission-notice">
          <p>ℹ️ You don't have permission to download files with your current role: <strong>{userRole}</strong></p>
        </div>
      )}

      {canDownloadFiles && (
        <div className="download-section">
          <h3>Download New Files</h3>
          <div className="download-buttons">
            <button
              onClick={() => downloadFile("security_report.pdf")}
              disabled={downloading}
              className="download-button"
            >
              {downloading ? (
                <>
                  <span className="mini-spinner"></span>
                  Downloading...
                </>
              ) : (
                '📄 Download Security Report'
              )}
            </button>
            <button
              onClick={() => downloadFile("user_activity_logs.csv")}
              disabled={downloading}
              className="download-button"
            >
              {downloading ? (
                <>
                  <span className="mini-spinner"></span>
                  Downloading...
                </>
              ) : (
                '📊 Download Activity Logs'
              )}
            </button>
            <button
              onClick={() => downloadFile("threat_analysis.xlsx")}
              disabled={downloading}
              className="download-button"
            >
              {downloading ? (
                <>
                  <span className="mini-spinner"></span>
                  Downloading...
                </>
              ) : (
                '📈 Download Threat Analysis'
              )}
            </button>
          </div>
        </div>
      )}

      {downloads.length > 0 && (
        <div className="downloads-summary">
          <span className="summary-item">
            📥 Total Downloads: {downloads.length}
          </span>
          <span className="summary-item">
            🚨 Suspicious: {downloads.filter(d => d.riskScore > 0.7).length}
          </span>
          <span className="summary-item">
            ✅ Normal: {downloads.filter(d => d.riskScore <= 0.7).length}
          </span>
        </div>
      )}

      {filteredDownloads.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No Downloads Found</h3>
          <p>No download history found matching your search criteria.</p>
        </div>
      ) : (
        <div className="downloads-container">
          <div className="downloads-header">
            <h3>Download History</h3>
            <p>Showing {filteredDownloads.length} of {downloads.length} downloads</p>
          </div>
          
          <div className="downloads-list">
            {filteredDownloads.map((download) => {
              const riskInfo = getRiskLevel(download.riskScore);
              
              return (
                <div key={download.id} className={`download-item risk-${riskInfo.color}`}>
                  <div className="download-header">
                    <div className="file-info">
                      <span className="file-icon">📄</span>
                      <div className="file-details">
                        <h4 className="file-name">{download.fileName}</h4>
                        <p className="file-meta">
                          {download.fileSize} • Downloaded on {formatDate(download.downloadDate)}
                        </p>
                      </div>
                    </div>
                    <div className="download-status">
                      <span className={`status-badge ${download.status}`}>
                        {download.status}
                      </span>
                      <span className={`risk-badge risk-${riskInfo.color}`}>
                        {riskInfo.level}
                      </span>
                    </div>
                  </div>
                  
                  <div className="download-details">
                    <div className="detail-row">
                      <span className="detail-label">Risk Score:</span>
                      <span className="detail-value risk-score">
                        {(download.riskScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value status">
                        {download.status === "completed" ? "✅ Successfully downloaded" : "⏳ Processing"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!canDownloadFiles && (
        <div className="permission-notice">
          <p>ℹ️ Contact your administrator to request download permissions.</p>
        </div>
      )}
    </div>
  );
}
