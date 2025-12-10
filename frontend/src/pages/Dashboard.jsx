import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, MessageSquare, Search, CheckCircle, BarChart, Clock } from "lucide-react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const userName = localStorage.getItem("userName") || "Student";
  const [stats, setStats] = useState({
    totalItems: 0,
    lostItems: 0,
    foundItems: 0,
    returnedItems: 0,
    matchedItems: 0,
    recoveryRate: 0
  });
  const [recentItems, setRecentItems] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [statsRes, itemsRes, notifRes] = await Promise.all([
        axios.get("http://localhost:5000/api/items/stats/my", {
          headers: { "x-auth-token": token }
        }),
        axios.get("http://localhost:5000/api/items/my-items", {
          headers: { "x-auth-token": token }
        }),
        axios.get("http://localhost:5000/api/notifications", {
          headers: { "x-auth-token": token }
        })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (itemsRes.data.success) setRecentItems(itemsRes.data.items.slice(0, 3));
      if (notifRes.data.success) setNotifications(notifRes.data.notifications.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="dashboard-container">
      {/* Top Bar */}
      <div className="dashboard-topbar">
        <div className="topbar-left">
          <h1 className="dashboard-title">
            {getGreeting()}, <span className="username">{userName}</span>
          </h1>
          <p className="dashboard-subtitle">Campus Lost & Found Portal</p>
        </div>
        <div className="topbar-right">
          <Link to="/notifications" className="icon-btn">
            <Bell size={22} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="badge">{notifications.filter(n => !n.read).length}</span>
            )}
          </Link>
          <Link to="/messages" className="icon-btn">
            <MessageSquare size={22} />
          </Link>
          <Link to="/profile" className="avatar-btn">
            {userName.charAt(0).toUpperCase()}
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card primary">
            <h3>Report Item</h3>
            <p>Lost something? Found something? Report it here</p>
            <Link to="/report-item" className="action-btn">
              Report Now →
            </Link>
          </div>
          <div className="action-card secondary">
            <h3>Search Items</h3>
            <p>Browse lost & found items on campus</p>
            <Link to="/items" className="action-btn">
              Search Items →
            </Link>
          </div>
          <div className="action-card success">
            <h3>My Reports</h3>
            <p>View and manage your reported items</p>
            <Link to="/my-items" className="action-btn">
              View Reports →
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <BarChart size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalItems}</h3>
              <p>Total Reports</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon lost">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.lostItems}</h3>
              <p>Lost Items</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon found">
              <Search size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.foundItems}</h3>
              <p>Found Items</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon returned">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.returnedItems}</h3>
              <p>Returned</p>
            </div>
          </div>
          <div className="stat-card large">
            <div className="stat-info">
              <h3>{stats.recoveryRate}%</h3>
              <p>Recovery Rate</p>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${stats.recoveryRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Notifications */}
        <div className="content-row">
          <div className="recent-activity">
            <h2>Recent Reports</h2>
            {recentItems.length > 0 ? (
              <div className="activity-list">
                {recentItems.map((item) => (
                  <div key={item._id} className="activity-item">
                    <div className={`activity-type ${item.category}`}>
                      {item.category === 'lost' ? '🚨 Lost' : '📦 Found'}
                    </div>
                    <div className="activity-details">
                      <h4>{item.title}</h4>
                      <p>{item.location} • {new Date(item.date).toLocaleDateString()}</p>
                      <span className={`status-badge ${item.status}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No recent reports</p>
            )}
            <Link to="/my-items" className="view-all">
              View All Reports →
            </Link>
          </div>

          <div className="recent-notifications">
            <div className="notifications-header">
              <h2>Notifications</h2>
              <Link to="/notifications" className="view-all">View All</Link>
            </div>
            {notifications.length > 0 ? (
              <div className="notifications-list">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  >
                    <div className="notification-icon">
                      {notif.type === 'match' && '🔍'}
                      {notif.type === 'message' && '💬'}
                      {notif.type === 'claim' && '✅'}
                    </div>
                    <div className="notification-content">
                      <h4>{notif.title}</h4>
                      <p>{notif.message}</p>
                      <span className="notification-time">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No new notifications</p>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="quick-links">
          <h2>Quick Access</h2>
          <div className="links-grid">
            <Link to="/lost" className="link-card">
              <div className="link-icon">🚨</div>
              <h3>Lost Items</h3>
              <p>Browse all lost items on campus</p>
            </Link>
            <Link to="/found" className="link-card">
              <div className="link-icon">📦</div>
              <h3>Found Items</h3>
              <p>View items found by others</p>
            </Link>
            <Link to="/help" className="link-card">
              <div className="link-icon">❓</div>
              <h3>Help & Support</h3>
              <p>Need help? Contact support</p>
            </Link>
            <Link to="/guidelines" className="link-card">
              <div className="link-icon">📋</div>
              <h3>Guidelines</h3>
              <p>Read our guidelines & policies</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;