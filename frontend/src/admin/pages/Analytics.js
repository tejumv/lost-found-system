<<<<<<< HEAD
import React from "react";
import AdminLayout from '../layout/AdminLayout';
import { FaChartLine } from 'react-icons/fa';
import '../styles/Admin.css';

function Analytics() {
    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h2>Analytics</h2>
            </div>

            <div className="analytics-container">
                <div className="empty-state">
                    <FaChartLine size={50} color="#ccc" />
                    <h3>Analytics Dashboard</h3>
                    <p>Detailed analytics and charts will be implemented here.</p>
                </div>
            </div>
        </AdminLayout>
    );
}

export default Analytics;
=======
import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from '../layout/AdminLayout';
import { dashboardService } from '../services/dashboardService';
import { adminService } from '../services/adminService';
import { FaChartLine, FaUsers, FaBoxOpen, FaCheckCircle, FaHistory, FaSync, FaMapMarkerAlt, FaCalendar, FaUser } from 'react-icons/fa';
import '../styles/Admin.css';
import '../styles/AnalyticsReports.css';

function Analytics() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        lostItems: 0,
        foundItems: 0,
        resolvedCases: 0,
        pendingApproval: 0
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
                adminService.getAllItems({ limit: 10, page: 1 })
            ]);

            setStats(statsData || {
                totalUsers: 0,
                lostItems: 0,
                foundItems: 0,
                resolvedCases: 0,
                pendingApproval: 0
            });

            setRecentItems(itemsData.items || []);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const totalItems = stats.lostItems + stats.foundItems;
    const lostPercentage = totalItems > 0 ? ((stats.lostItems / totalItems) * 100).toFixed(1) : 0;
    const foundPercentage = totalItems > 0 ? ((stats.foundItems / totalItems) * 100).toFixed(1) : 0;
    const resolvedPercentage = totalItems > 0 ? ((stats.resolvedCases / totalItems) * 100).toFixed(1) : 0;

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h2><FaChartLine /> Analytics Dashboard</h2>
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

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            <div className="analytics-container">
                {/* Overview Stats */}
                <div className="analytics-section">
                    <h3>System Overview</h3>
                    <div className="stats-grid">
                        <div className="stat-card" style={{ borderLeft: '4px solid #3498db' }}>
                            <div className="stat-icon" style={{ backgroundColor: '#3498db15' }}>
                                <FaUsers size={22} color="#3498db" />
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-number">{stats.totalUsers}</h3>
                                <p className="stat-title">Total Users</p>
                            </div>
                        </div>

                        <div className="stat-card" style={{ borderLeft: '4px solid #e74c3c' }}>
                            <div className="stat-icon" style={{ backgroundColor: '#e74c3c15' }}>
                                <FaBoxOpen size={22} color="#e74c3c" />
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-number">{stats.lostItems}</h3>
                                <p className="stat-title">Lost Items</p>
                            </div>
                        </div>

                        <div className="stat-card" style={{ borderLeft: '4px solid #2ecc71' }}>
                            <div className="stat-icon" style={{ backgroundColor: '#2ecc7115' }}>
                                <FaBoxOpen size={22} color="#2ecc71" />
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-number">{stats.foundItems}</h3>
                                <p className="stat-title">Found Items</p>
                            </div>
                        </div>

                        <div className="stat-card" style={{ borderLeft: '4px solid #9b59b6' }}>
                            <div className="stat-icon" style={{ backgroundColor: '#9b59b615' }}>
                                <FaCheckCircle size={22} color="#9b59b6" />
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-number">{stats.resolvedCases}</h3>
                                <p className="stat-title">Resolved Cases</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Item Distribution */}
                <div className="analytics-section">
                    <h3>Item Distribution</h3>
                    <div className="chart-container">
                        <div className="progress-chart">
                            <div className="progress-item">
                                <div className="progress-label">
                                    <span>Lost Items</span>
                                    <span className="progress-value">{stats.lostItems} ({lostPercentage}%)</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${lostPercentage}%`, backgroundColor: '#e74c3c' }}
                                    ></div>
                                </div>
                            </div>

                            <div className="progress-item">
                                <div className="progress-label">
                                    <span>Found Items</span>
                                    <span className="progress-value">{stats.foundItems} ({foundPercentage}%)</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${foundPercentage}%`, backgroundColor: '#2ecc71' }}
                                    ></div>
                                </div>
                            </div>

                            <div className="progress-item">
                                <div className="progress-label">
                                    <span>Resolved Cases</span>
                                    <span className="progress-value">{stats.resolvedCases} ({resolvedPercentage}%)</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${resolvedPercentage}%`, backgroundColor: '#9b59b6' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Items */}
                <div className="analytics-section">
                    <h3><FaHistory /> Recent Lost & Found Items ({recentItems.length})</h3>
                    {recentItems.length > 0 ? (
                        <div className="items-grid">
                            {recentItems.map((item) => (
                                <div key={item._id} className="item-detail-card">
                                    {item.image && (
                                        <div className="item-image-container">
                                            <img src={item.image} alt={item.title} className="item-detail-image" />
                                            <span className={`item-category-badge badge-${item.category}`}>
                                                {item.category}
                                            </span>
                                        </div>
                                    )}
                                    <div className="item-detail-content">
                                        <h4 className="item-detail-title">{item.title}</h4>
                                        <p className="item-detail-description">{item.description}</p>
                                        <div className="item-detail-meta">
                                            <div className="meta-item">
                                                <FaMapMarkerAlt className="meta-icon" />
                                                <span>{item.location}</span>
                                            </div>
                                            <div className="meta-item">
                                                <FaCalendar className="meta-icon" />
                                                <span>{new Date(item.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="meta-item">
                                                <FaUser className="meta-icon" />
                                                <span>{item.postedBy?.name || 'Unknown'}</span>
                                            </div>
                                        </div>
                                        <div className="item-detail-footer">
                                            <span className={`status-badge status-${item.status}`}>
                                                {item.status}
                                            </span>
                                            <span className="item-detail-date">
                                                Posted {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <FaBoxOpen size={50} color="#ccc" />
                            <p>No items to display</p>
                            <small>Items will appear here as users report lost or found items</small>
                        </div>
                    )}
                </div>

                {/* Key Metrics */}
                <div className="analytics-section">
                    <h3>Key Metrics</h3>
                    <div className="metrics-grid">
                        <div className="metric-card">
                            <h4>Total Items</h4>
                            <p className="metric-value">{totalItems}</p>
                            <small>Lost + Found items</small>
                        </div>
                        <div className="metric-card">
                            <h4>Resolution Rate</h4>
                            <p className="metric-value">{resolvedPercentage}%</p>
                            <small>Items successfully resolved</small>
                        </div>
                        <div className="metric-card">
                            <h4>Pending Items</h4>
                            <p className="metric-value">{stats.pendingApproval}</p>
                            <small>Awaiting action</small>
                        </div>
                        <div className="metric-card">
                            <h4>Active Users</h4>
                            <p className="metric-value">{stats.totalUsers}</p>
                            <small>Registered users</small>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default Analytics;
>>>>>>> 0205117 (Completed Admin response)
