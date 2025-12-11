import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import { adminService } from '../services/adminService';
import { FaSearch, FaFilter, FaEye } from 'react-icons/fa';
import '../styles/Admin.css';

function AllItems() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get initial type from URL query parameter
  const initialType = searchParams.get('type') || '';

  const [filters, setFilters] = useState({
    search: '',
    type: initialType,
    status: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllItems(filters);
      // Service now returns data directly: { items: [...], pagination: {...} }
      setItems(response.items || []);
      setPagination(response.pagination || null);
    } catch (err) {
      setError('Failed to fetch items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchItems();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h2>All Items</h2>
        <div className="header-actions">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search items..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <button type="submit" className="btn btn-primary"><FaSearch /></button>
          </form>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <FaFilter />
          <select name="type" value={filters.type} onChange={handleFilterChange}>
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
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
                <th>Item</th>
                <th>Type</th>
                <th>Reported By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="item-cell">
                      {item.image && <img src={item.image} alt={item.title} className="item-thumb" />}
                      <div>
                        <strong>{item.title}</strong>
                        <p className="text-muted">{item.description?.substring(0, 50)}...</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${item.category}`}>{item.category}</span>
                  </td>
                  <td>
                    {item.postedBy?.name || 'Unknown'}
                    <br />
                    <small>{item.postedBy?.email}</small>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon" title="View Details"><FaEye /></button>
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

export default AllItems;

