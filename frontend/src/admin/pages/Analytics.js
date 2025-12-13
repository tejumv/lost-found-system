import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "../layout/AdminLayout";
import { dashboardService } from "../services/dashboardService";
import { adminService } from "../services/adminService";
import {
  FaChartLine,
  FaUsers,
  FaBoxOpen,
  FaCheckCircle,
  FaHistory,
  FaSync,
  FaMapMarkerAlt,
  FaCalendar,
  FaUser,
} from "react-icons/fa";
import "../styles/Admin.css";
import "../styles/AnalyticsReports.css";

function Analytics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    lostItems: 0,
    foundItems: 0,
    resolvedCases: 0,
    pendingApproval: 0,
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, itemsData] = await Promise.all([
        dashboardService.getDashboardStats(),
        adminService.getAllItems({ limit: 10, page: 1 }),
      ]);

      setStats(
        statsData || {
          totalUsers: 0,
          lostItems: 0,
          foundItems: 0,
          resolvedCases: 0,
          pendingApproval: 0,
        }
      );

      setRecentItems(itemsData.items || []);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const totalItems = stats.lostItems + stats.foundItems;
  const lostPercentage =
    totalItems > 0 ? ((stats.lostItems / totalItems) * 100).toFixed(1) : 0;
  const foundPercentage =
    totalItems > 0 ? ((stats.foundItems / totalItems) * 100).toFixed(1) : 0;
  const resolvedPercentage =
    totalItems > 0
      ? ((stats.resolvedCases / totalItems) * 100).toFixed(1)
      : 0;

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h2>
          <FaChartLine /> Analytics Dashboard
        </h2>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <FaSync spin={loading} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="analytics-container">
        {/* Overview */}
        <div className="analytics-section">
          <h3>System Overview</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <FaUsers /> <span>{stats.totalUsers} Users</span>
            </div>
            <div className="stat-card">
              <FaBoxOpen /> <span>{stats.lostItems} Lost</span>
            </div>
            <div className="stat-card">
              <FaBoxOpen /> <span>{stats.foundItems} Found</span>
            </div>
            <div className="stat-card">
              <FaCheckCircle /> <span>{stats.resolvedCases} Resolved</span>
            </div>
          </div>
        </div>

        {/* Distribution */}
        <div className="analytics-section">
          <h3>Item Distribution</h3>
          <p>Lost: {lostPercentage}%</p>
          <p>Found: {foundPercentage}%</p>
          <p>Resolved: {resolvedPercentage}%</p>
        </div>

        {/* Recent Items */}
        <div className="analytics-section">
          <h3>
            <FaHistory /> Recent Items
          </h3>

          {recentItems.length === 0 ? (
            <p>No items available</p>
          ) : (
            recentItems.map((item) => (
              <div key={item._id} className="item-detail-card">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <div className="item-detail-meta">
                  <span>
                    <FaMapMarkerAlt /> {item.location}
                  </span>
                  <span>
                    <FaCalendar />{" "}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span>
                    <FaUser /> {item.postedBy?.name || "Unknown"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Analytics;
