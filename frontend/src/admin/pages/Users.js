import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from '../layout/AdminLayout';
import { adminService } from '../services/adminService';
import { FaSearch, FaUser, FaEnvelope, FaBan, FaCheck } from 'react-icons/fa';
import '../styles/Admin.css';

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllUsers(filters);
            // Service now returns data directly: { users: [...], pagination: {...} }
            setUsers(response.users || []);
            setPagination(response.pagination || null);
        } catch (err) {
            setError('Failed to fetch users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchUsers();
    };

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h2>Manage Users</h2>
                <div className="header-actions">
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                        <button type="submit" className="btn btn-primary"><FaSearch /></button>
                    </form>
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner"></div>
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Joined Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar">
                                                <FaUser />
                                            </div>
                                            <strong>{user.name}</strong>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="email-cell">
                                            <FaEnvelope className="text-muted" /> {user.email}
                                        </div>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className="badge badge-success">Active</span>
                                    </td>
                                    <td>
                                        <button className="btn-icon text-danger" title="Block User"><FaBan /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {pagination && (
                <div className="pagination">
                    <button
                        disabled={pagination.page === 1}
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        Previous
                    </button>
                    <span>Page {pagination.page} of {pagination.pages}</span>
                    <button
                        disabled={pagination.page === pagination.pages}
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        Next
                    </button>
                </div>
            )}
        </AdminLayout>
    );
}

export default Users;
