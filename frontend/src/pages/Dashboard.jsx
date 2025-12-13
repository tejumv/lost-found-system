import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, MessageSquare } from "lucide-react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const userName = localStorage.getItem("userName") || "Student";
  const [recentItems, setRecentItems] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [itemsRes, notifRes] = await Promise.all([
        axios.get("http://localhost:5000/api/items/my-items", {
          headers: { "x-auth-token": token }
        }),
        axios.get("http://localhost:5000/api/notifications", {
          headers: { "x-auth-token": token }
        })
      ]);

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
      </div>
    </div>
  );
};

export default Dashboard;