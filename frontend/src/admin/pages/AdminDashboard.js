<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from '../layout/AdminLayout';
import { dashboardService } from '../services/dashboardService';
import '../styles/Admin.css';
import { 
  FaUsers, 
  FaBoxOpen, 
  FaCheckCircle, 
  FaChartBar,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaExclamationTriangle,
  FaUserShield,
  FaSync,
  FaExclamationCircle
} from 'react-icons/fa';

const AdminDashboard = () => {
    const [admin, setAdmin] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        lostItems: 0,
        foundItems: 0,
        resolvedCases: 0,
        pendingApproval: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
        fetchDashboardData();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem("adminToken");
        const adminData = localStorage.getItem("adminData");
        
        if (!token || !adminData) {
            navigate("/admin/login");
            return;
        }

        try {
            const parsedAdmin = JSON.parse(adminData);
            setAdmin(parsedAdmin);
        } catch (err) {
            console.error("Error parsing admin data:", err);
            navigate("/admin/login");
        }
    };

    const fetchDashboardData = async () => {
        try {
            setError(null);
            setRefreshing(true);
            
            // Fetch all dashboard data in parallel
            const [statsData, activitiesData] = await Promise.all([
                dashboardService.getDashboardStats(),
                dashboardService.getRecentActivities(5)
            ]);
            
            setStats({
                totalUsers: statsData.totalUsers || 0,
                lostItems: statsData.lostItems || 0,
                foundItems: statsData.foundItems || 0,
                resolvedCases: statsData.resolvedCases || 0,
                pendingApproval: statsData.pendingApproval || 0
            });
            
            setRecentActivity(activitiesData.activities || []);
            
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setError("Failed to load dashboard data. Please try again.");
            
            // Set fallback data for testing
            setStats({
                totalUsers: 0,
                lostItems: 0,
                foundItems: 0,
                resolvedCases: 0,
                pendingApproval: 0
            });
            setRecentActivity([]);
            
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchDashboardData();
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        localStorage.removeItem("adminSession");
        navigate("/admin/login");
    };

    const handleQuickAction = (action) => {
        switch(action) {
            case 'manageUsers':
                navigate("/admin/users");
                break;
            case 'viewReports':
                navigate("/admin/reports");
                break;
            case 'systemSettings':
                navigate("/admin/settings");
                break;
            case 'viewAnalytics':
                navigate("/admin/analytics");
                break;
            case 'pendingItems':
                navigate("/admin/pending");
                break;
            case 'allItems':
                navigate("/admin/all-items");
                break;
            default:
                console.log("Action not defined:", action);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, onClick, subtitle }) => (
        <div 
            className={`stat-card ${onClick ? 'clickable' : ''}`} 
            onClick={onClick}
            style={{ borderLeft: `4px solid ${color}` }}
        >
            <div className="stat-icon" style={{ backgroundColor: `${color}15` }}>
                <Icon size={22} color={color} />
            </div>
            <div className="stat-content">
                <h3 className="stat-number">{value}</h3>
                <p className="stat-title">{title}</p>
                {subtitle && <small className="stat-subtitle">{subtitle}</small>}
            </div>
        </div>
    );

    // Render loading state
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    // Render error state
    if (error && stats.totalUsers === 0) {
        return (
            <AdminLayout>
                <div className="error-container">
                    <FaExclamationCircle size={50} color="#e74c3c" />
                    <h2>Connection Error</h2>
                    <p>{error}</p>
                    <p className="error-hint">
                        Please ensure:
                        <br />1. Backend server is running
                        <br />2. API endpoints are correct
                        <br />3. You have proper admin privileges
                    </p>
                    <button className="btn btn-primary" onClick={handleRefresh}>
                        <FaSync /> Retry
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('/admin/login')}>
                        Go to Login
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="dashboard-container">
                {/* Dashboard Header */}
                <div className="dashboard-header">
                    <div className="header-content">
                        <h1><FaUserShield /> Admin Dashboard</h1>
                        <p className="welcome-text">
                            Welcome back, <strong>{admin?.name || admin?.email}</strong>
                        </p>
                        <p className="last-login">
                            Last login: {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="header-actions">
                        <button 
                            className="btn btn-secondary"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <FaSync spin={refreshing} /> 
                            {refreshing ? 'Refreshing...' : 'Refresh Data'}
                        </button>
                        <button 
                            className="btn btn-primary"
                            onClick={() => handleQuickAction('viewAnalytics')}
                        >
                            <FaChartBar /> View Analytics
                        </button>
                        <button 
                            className="btn btn-danger logout-btn"
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-warning">
                        <FaExclamationCircle /> {error} 
                        <button onClick={handleRefresh} className="alert-refresh">
                            Try Again
                        </button>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="stats-section">
                    <div className="section-header">
                        <h2><FaChartBar /> System Overview</h2>
                        <small>Last updated: {new Date().toLocaleTimeString()}</small>
                    </div>
                    <div className="stats-grid">
                        <StatCard
                            title="Total Users"
                            value={stats.totalUsers}
                            icon={FaUsers}
                            color="#3498db"
                            onClick={() => handleQuickAction('manageUsers')}
                            subtitle="Registered users"
                        />
                        <StatCard
                            title="Lost Items"
                            value={stats.lostItems}
                            icon={FaExclamationTriangle}
                            color="#e74c3c"
                            onClick={() => handleQuickAction('allItems')}
                            subtitle="Awaiting recovery"
                        />
                        <StatCard
                            title="Found Items"
                            value={stats.foundItems}
                            icon={FaBoxOpen}
                            color="#2ecc71"
                            onClick={() => handleQuickAction('allItems')}
                            subtitle="Reported found"
                        />
                        <StatCard
                            title="Resolved Cases"
                            value={stats.resolvedCases}
                            icon={FaCheckCircle}
                            color="#9b59b6"
                            subtitle="Successfully matched"
                        />
                        <StatCard
                            title="Pending Approval"
                            value={stats.pendingApproval}
                            icon={FaHistory}
                            color="#f39c12"
                            onClick={() => handleQuickAction('pendingItems')}
                            subtitle="Need review"
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="dashboard-content">
                    {/* Recent Activity Section */}
                    <div className="content-section">
                        <div className="section-header">
                            <h3><FaHistory /> Recent Activity</h3>
                            <button 
                                className="btn btn-text"
                                onClick={() => handleQuickAction('viewReports')}
                            >
                                View All
                            </button>
                        </div>
                        <div className="activity-list">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <div className="activity-icon">
                                            {activity.type === 'user' ? <FaUsers /> : <FaBoxOpen />}
                                        </div>
                                        <div className="activity-content">
                                            <p className="activity-text">{activity.description}</p>
                                            <span className="activity-time">{activity.time}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <p>No recent activity to display</p>
                                    <small>Activity will appear here as users interact with the system</small>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions Section */}
                    <div className="content-section">
                        <div className="section-header">
                            <h3><FaCog /> Quick Actions</h3>
                        </div>
                        <div className="actions-grid">
                            <button 
                                className="action-card"
                                onClick={() => handleQuickAction('manageUsers')}
                            >
                                <FaUsers size={24} />
                                <span>Manage Users</span>
                            </button>
                            <button 
                                className="action-card"
                                onClick={() => handleQuickAction('allItems')}
                            >
                                <FaBoxOpen size={24} />
                                <span>All Items</span>
                            </button>
                            <button 
                                className="action-card"
                                onClick={() => handleQuickAction('pendingItems')}
                            >
                                <FaExclamationTriangle size={24} />
                                <span>Pending Items</span>
                            </button>
                            <button 
                                className="action-card"
                                onClick={() => handleQuickAction('viewReports')}
                            >
                                <FaChartBar size={24} />
                                <span>View Reports</span>
                            </button>
                            <button 
                                className="action-card"
                                onClick={() => handleQuickAction('systemSettings')}
                            >
                                <FaCog size={24} />
                                <span>Settings</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Connection Status */}
                <div className="connection-status">
                    <div className={`status-indicator ${error ? 'disconnected' : 'connected'}`}>
                        <span className="status-dot"></span>
                        {error ? 'Disconnected from backend' : 'Connected to backend'}
                    </div>
                    <small>API Base URL: http://localhost:5000/api</small>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
=======
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from '../layout/AdminLayout';
import { dashboardService } from '../services/dashboardService';
import '../styles/Admin.css';
import {
    FaUsers,
    FaBoxOpen,
    FaCheckCircle,
    FaChartBar,
    FaChartLine,
    FaCog,
    FaSignOutAlt,
    FaExclamationTriangle,
    FaUserShield,
    FaSync,
    FaExclamationCircle
} from 'react-icons/fa';

const AdminDashboard = () => {
    const [admin, setAdmin] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        lostItems: 0,
        foundItems: 0,
        resolvedCases: 0,
        pendingApproval: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
        fetchDashboardData();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem("adminToken");
        const adminData = localStorage.getItem("adminData");

        if (!token || !adminData) {
            navigate("/admin/login");
            return;
        }

        try {
            const parsedAdmin = JSON.parse(adminData);
            setAdmin(parsedAdmin);
        } catch (err) {
            console.error("Error parsing admin data:", err);
            navigate("/admin/login");
        }
    };

    const fetchDashboardData = async () => {
        try {
            setError(null);
            setRefreshing(true);

            const statsData = await dashboardService.getDashboardStats();

            setStats({
                totalUsers: statsData.totalUsers || 0,
                lostItems: statsData.lostItems || 0,
                foundItems: statsData.foundItems || 0,
                resolvedCases: statsData.resolvedCases || 0,
                pendingApproval: statsData.pendingApproval || 0
            });

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setError("Failed to load dashboard data. Please try again.");

            setStats({
                totalUsers: 0,
                lostItems: 0,
                foundItems: 0,
                resolvedCases: 0,
                pendingApproval: 0
            });

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchDashboardData();
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");
        localStorage.removeItem("adminSession");
        navigate("/admin/login");
    };

    const handleQuickAction = (action) => {
        switch (action) {
            case 'manageUsers':
                navigate("/admin/users");
                break;
            case 'viewReports':
                navigate("/admin/reports");
                break;
            case 'systemSettings':
                navigate("/admin/settings");
                break;
            case 'viewAnalytics':
                navigate("/admin/analytics");
                break;
            case 'pendingItems':
                navigate("/admin/pending");
                break;
            case 'allItems':
                navigate("/admin/all-items");
                break;
            case 'lostItems':
                navigate("/admin/all-items?type=lost");
                break;
            case 'foundItems':
                navigate("/admin/all-items?type=found");
                break;
            default:
                console.log("Action not defined:", action);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, onClick, subtitle }) => (
        <div
            className={`stat-card ${onClick ? 'clickable' : ''}`}
            onClick={onClick}
            style={{ borderLeft: `4px solid ${color}` }}
        >
            <div className="stat-icon" style={{ backgroundColor: `${color}15` }}>
                <Icon size={22} color={color} />
            </div>
            <div className="stat-content">
                <h3 className="stat-number">{value}</h3>
                <p className="stat-title">{title}</p>
                {subtitle && <small className="stat-subtitle">{subtitle}</small>}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    if (error && stats.totalUsers === 0) {
        return (
            <AdminLayout>
                <div className="error-container">
                    <FaExclamationCircle size={50} color="#e74c3c" />
                    <h2>Connection Error</h2>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={handleRefresh}>
                        <FaSync /> Retry
                    </button>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <div className="header-content">
                        <h1><FaUserShield /> Admin Dashboard</h1>
                        <p className="welcome-text">
                            Welcome back, <strong>{admin?.name || admin?.email}</strong>
                        </p>
                        <p className="last-login">
                            Last login: {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="header-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <FaSync spin={refreshing} />
                            {refreshing ? 'Refreshing...' : 'Refresh Data'}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => handleQuickAction('viewAnalytics')}
                        >
                            <FaChartBar /> View Analytics
                        </button>
                        <button
                            className="btn btn-danger logout-btn"
                            onClick={handleLogout}
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-warning">
                        <FaExclamationCircle /> {error}
                        <button onClick={handleRefresh} className="alert-refresh">
                            Try Again
                        </button>
                    </div>
                )}

                <div className="stats-section">
                    <div className="section-header">
                        <h2><FaChartBar /> System Overview</h2>
                        <small>Last updated: {new Date().toLocaleTimeString()}</small>
                    </div>
                    <div className="stats-grid">
                        <StatCard
                            title="Total Users"
                            value={stats.totalUsers}
                            icon={FaUsers}
                            color="#3498db"
                            onClick={() => handleQuickAction('manageUsers')}
                            subtitle="Registered users"
                        />
                        <StatCard
                            title="Lost Items"
                            value={stats.lostItems}
                            icon={FaExclamationTriangle}
                            color="#e74c3c"
                            onClick={() => handleQuickAction('lostItems')}
                            subtitle="Awaiting recovery"
                        />
                        <StatCard
                            title="Found Items"
                            value={stats.foundItems}
                            icon={FaBoxOpen}
                            color="#2ecc71"
                            onClick={() => handleQuickAction('foundItems')}
                            subtitle="Reported found"
                        />
                        <StatCard
                            title="Resolved Cases"
                            value={stats.resolvedCases}
                            icon={FaCheckCircle}
                            color="#9b59b6"
                            subtitle="Successfully matched"
                        />
                        <StatCard
                            title="Pending Approval"
                            value={stats.pendingApproval}
                            icon={FaChartBar}
                            color="#f39c12"
                            onClick={() => handleQuickAction('pendingItems')}
                            subtitle="Need review"
                        />
                    </div>
                </div>

                {/* Quick Actions - Horizontal */}
                <div className="quick-actions-full">
                    <div className="section-header">
                        <h3><FaCog /> Quick Actions</h3>
                        <p className="section-subtitle">Manage your system efficiently</p>
                    </div>
                    <div className="actions-horizontal">
                        <button className="action-button" onClick={() => handleQuickAction('manageUsers')}>
                            <FaUsers size={20} />
                            <span>Manage Users</span>
                        </button>
                        <button className="action-button" onClick={() => handleQuickAction('allItems')}>
                            <FaBoxOpen size={20} />
                            <span>All Items</span>
                        </button>
                        <button className="action-button" onClick={() => handleQuickAction('pendingItems')}>
                            <FaExclamationTriangle size={20} />
                            <span>Pending Items</span>
                        </button>
                        <button className="action-button" onClick={() => handleQuickAction('viewReports')}>
                            <FaChartBar size={20} />
                            <span>Reports</span>
                        </button>
                        <button className="action-button" onClick={() => handleQuickAction('viewAnalytics')}>
                            <FaChartLine size={20} />
                            <span>Analytics</span>
                        </button>
                        <button className="action-button" onClick={() => handleQuickAction('systemSettings')}>
                            <FaCog size={20} />
                            <span>Settings</span>
                        </button>
                    </div>
                </div>

                <div className="connection-status">
                    <div className={`status-indicator ${error ? 'disconnected' : 'connected'}`}>
                        <span className="status-dot"></span>
                        {error ? 'Disconnected from backend' : 'Connected to backend'}
                    </div>
                    <small>API Base URL: http://localhost:5000/api</small>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
>>>>>>> 0205117 (Completed Admin response)
