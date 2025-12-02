import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to Campus Lost & Found Portal</h1>
        <p>Manage your lost and found items efficiently</p>
      </div>

      <div className="dashboard-actions">
        <div className="action-card">
          <h3>🔍 Report New Item</h3>
          <p>Report a lost item you're looking for or a found item you want to return</p>
          <Link to="/report-item">
            <button className="action-btn primary-btn">
              Report Lost/Found Item
            </button>
          </Link>
        </div>

        <div className="action-card">
          <h3>📋 View My Reports</h3>
          <p>Check the status of your reported items</p>
          <Link to="/items">
            <button className="action-btn secondary-btn">
              View My Items
            </button>
          </Link>
        </div>

        <div className="action-card">
          <h3>🔎 Browse Items</h3>
          <p>Search through all lost and found items on campus</p>
          <div className="button-group">
            <Link to="/lost">
              <button className="action-btn tertiary-btn">
                Lost Items
              </button>
            </Link>
            <Link to="/found">
              <button className="action-btn tertiary-btn">
                Found Items
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
        <p className="user-info">
          Logged in as: <span>{localStorage.getItem('userEmail') || 'User'}</span>
        </p>
      </div>
    </div>
  );
}

export default Dashboard;