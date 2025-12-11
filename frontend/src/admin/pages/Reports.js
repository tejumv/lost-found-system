import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from '../layout/AdminLayout';
import { dashboardService } from '../services/dashboardService';
import { adminService } from '../services/adminService';
import { FaChartPie, FaList, FaDownload, FaSync, FaFileAlt } from 'react-icons/fa';
import '../styles/Admin.css';
import '../styles/AnalyticsReports.css';

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
                adminService.getAllItems({ limit: 10, page: 1 })
            ]);

            setStats(statsData);
            setActivities(activitiesData.activities || []);
            setRecentItems(itemsData.items || []);
        } catch (err) {
            console.error('Error fetching report data:', err);
            setError('Failed to load report data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    const exportToCSV = () => {
        // Simple CSV export of activities
        const csvContent = [
            ['Date', 'Type', 'Description', 'Time'],
            ...activities.map(activity => [
                new Date().toLocaleDateString(),
                activity.type,
                activity.description,
                activity.time
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity-report-${new Date().toISOString().split('T')[0]}.csv`;
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
                <h2><FaFileAlt /> System Reports</h2>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={fetchReportData}
                        disabled={loading}
                    >
                        <FaSync spin={loading} /> Refresh
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

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            <div className="reports-container">
                {/* Summary Statistics */}
                <div className="report-card">
                    <h3><FaChartPie /> Summary Statistics</h3>
                    {stats ? (
                        <div className="stats-summary">
                            <div className="summary-grid">
                                <div className="summary-item">
                                    <span className="summary-label">Total Users</span>
                                    <span className="summary-value">{stats.totalUsers}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Lost Items</span>
                                    <span className="summary-value" style={{ color: '#e74c3c' }}>{stats.lostItems}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Found Items</span>
                                    <span className="summary-value" style={{ color: '#2ecc71' }}>{stats.foundItems}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Resolved Cases</span>
                                    <span className="summary-value" style={{ color: '#9b59b6' }}>{stats.resolvedCases}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Pending Approval</span>
                                    <span className="summary-value" style={{ color: '#f39c12' }}>{stats.pendingApproval}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Total Items</span>
                                    <span className="summary-value">{stats.lostItems + stats.foundItems}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>No statistics available</p>
                    )}
                </div>

                {/* Recent Activity Log */}
                <div className="report-card">
                    <h3><FaList /> Recent Activity Log</h3>
                    <div className="table-responsive">
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
                                    activities.map((activity, index) => (
                                        <tr key={index}>
                                            <td>
                                                <span className={`badge badge-${activity.type}`}>
                                                    {activity.type}
                                                </span>
                                            </td>
                                            <td>{activity.description}</td>
                                            <td>{activity.time}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center">
                                            No activity logs available yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Items Report */}
                <div className="report-card">
                    <h3><FaList /> Recent Items</h3>
                    <div className="table-responsive">
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
                                {recentItems.length > 0 ? (
                                    recentItems.map((item) => (
                                        <tr key={item._id}>
                                            <td><strong>{item.title}</strong></td>
                                            <td>
                                                <span className={`badge badge-${item.category}`}>
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${item.status}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td>{item.postedBy?.name || 'Unknown'}</td>
                                            <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            No items to display
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Report Footer */}
                <div className="report-footer">
                    <p>Report generated on: {new Date().toLocaleString()}</p>
                    <p>Total activities logged: {activities.length}</p>
                </div>
            </div>
        </AdminLayout>
    );
}

export default Reports;
