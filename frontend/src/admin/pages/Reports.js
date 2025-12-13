import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "../layout/AdminLayout";
import { dashboardService } from "../services/dashboardService";
import { adminService } from "../services/adminService";
import {
  FaChartPie,
  FaList,
  FaDownload,
  FaSync,
  FaFileAlt,
} from "react-icons/fa";
import "../styles/Admin.css";
import "../styles/AnalyticsReports.css";

function Reports() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, activitiesData, itemsData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivities(15),
        adminService.getAllItems({ limit: 10, page: 1 }),
      ]);

      setStats(statsData);
      setActivities(activitiesData.activities || []);
      setRecentItems(itemsData.items || []);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError("Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const exportToCSV = () => {
    const csvContent = [
      ["Date", "Type", "Description", "Time"],
      ...activities.map((activity) => [
        new Date().toLocaleDateString(),
        activity.type,
        activity.description,
        activity.time,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-report-${new Date()
      .toISOString()
      .split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h2>
          <FaFileAlt /> System Reports
        </h2>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchReportData}>
            <FaSync /> Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={exportToCSV}
            disabled={activities.length === 0}
          >
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="reports-container">
        {/* Summary */}
        <div className="report-card">
          <h3>
            <FaChartPie /> Summary Statistics
          </h3>

          {stats && (
            <div className="summary-grid">
              <div className="summary-item">
                <span>Total Users</span>
                <strong>{stats.totalUsers}</strong>
              </div>
              <div className="summary-item">
                <span>Lost Items</span>
                <strong>{stats.lostItems}</strong>
              </div>
              <div className="summary-item">
                <span>Found Items</span>
                <strong>{stats.foundItems}</strong>
              </div>
              <div className="summary-item">
                <span>Resolved Cases</span>
                <strong>{stats.resolvedCases}</strong>
              </div>
              <div className="summary-item">
                <span>Pending Approval</span>
                <strong>{stats.pendingApproval}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="report-card">
          <h3>
            <FaList /> Recent Activity Log
          </h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {activities.length > 0 ? (
                activities.map((a, i) => (
                  <tr key={i}>
                    <td>{a.type}</td>
                    <td>{a.description}</td>
                    <td>{a.time}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    No activity logs
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Items */}
        <div className="report-card">
          <h3>
            <FaList /> Recent Items
          </h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Posted By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentItems.map((item) => (
                <tr key={item._id}>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>{item.status}</td>
                  <td>{item.postedBy?.name || "Unknown"}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Reports;
