import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Calendar, Tag, Filter, Eye, CheckCircle, Clock } from "lucide-react";
import axios from "axios";
import "./MyItems.css";

const MyItems = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        category: "all",
        status: "all"
    });

    // Memoize the applyFilters function
    const applyFilters = useCallback(() => {
        let filtered = [...items];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (filters.category !== "all") {
            filtered = filtered.filter(item => item.category === filters.category);
        }

        // Status filter
        if (filters.status !== "all") {
            filtered = filtered.filter(item => item.status === filters.status);
        }

        setFilteredItems(filtered);
    }, [items, searchTerm, filters]);

    useEffect(() => {
        fetchMyItems();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const fetchMyItems = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5000/api/items/my-items", {
                headers: { "x-auth-token": token }
            });

            if (response.data.success) {
                setItems(response.data.items);
                setFilteredItems(response.data.items);
            }
        } catch (error) {
            console.error("Error fetching my items:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'returned':
                return <CheckCircle size={16} className="status-icon returned" />;
            case 'matched':
                return <CheckCircle size={16} className="status-icon matched" />;
            case 'claimed':
                return <Clock size={16} className="status-icon claimed" />;
            default:
                return <Clock size={16} className="status-icon pending" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'matched': return 'Matched';
            case 'claimed': return 'Claimed';
            case 'returned': return 'Returned';
            default: return status;
        }
    };

    const resetFilters = () => {
        setSearchTerm("");
        setFilters({ category: "all", status: "all" });
    };

    return (
        <div className="my-items-page">
            {/* Header */}
            <div className="my-items-header">
                <h1>My Reported Items</h1>
                <p>View and manage all items you have reported</p>
            </div>

            {/* Stats Summary */}
            <div className="my-items-stats">
                <div className="stat-box">
                    <h3>{items.length}</h3>
                    <p>Total Reports</p>
                </div>
                <div className="stat-box">
                    <h3>{items.filter(i => i.category === 'lost').length}</h3>
                    <p>Lost Items</p>
                </div>
                <div className="stat-box">
                    <h3>{items.filter(i => i.category === 'found').length}</h3>
                    <p>Found Items</p>
                </div>
                <div className="stat-box">
                    <h3>{items.filter(i => i.status === 'returned').length}</h3>
                    <p>Returned</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="search-filter-bar">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search your items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-controls">
                    <div className="filter-group">
                        <Filter size={16} />
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            <option value="all">All Categories</option>
                            <option value="lost">Lost Items</option>
                            <option value="found">Found Items</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <Filter size={16} />
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="matched">Matched</option>
                            <option value="claimed">Claimed</option>
                            <option value="returned">Returned</option>
                        </select>
                    </div>

                    <button className="reset-btn" onClick={resetFilters}>
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* Results Info */}
            <div className="results-info">
                <span>Showing {filteredItems.length} of {items.length} items</span>
                {searchTerm && <span> for "{searchTerm}"</span>}
            </div>

            {/* Items Table/Grid */}
            {loading ? (
                <div className="loading">Loading your items...</div>
            ) : filteredItems.length === 0 ? (
                <div className="no-items">
                    <div className="no-items-icon">📋</div>
                    <h3>No items found</h3>
                    <p>{searchTerm || filters.category !== "all" || filters.status !== "all"
                        ? "Try adjusting your search or filters"
                        : "You haven't reported any items yet."}</p>
                    {!searchTerm && filters.category === "all" && filters.status === "all" && (
                        <Link to="/report-item" className="report-btn">
                            Report Your First Item
                        </Link>
                    )}
                </div>
            ) : (
                <div className="items-table-container">
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Category</th>
                                <th>Location</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item) => (
                                <tr key={item._id} className="item-row">
                                    <td className="item-info-cell">
                                        <div className="item-info">
                                            <div className="item-image-small">
                                                {item.image ? (
                                                    <img src={`http://localhost:5000${item.image}`} alt={item.title} />
                                                ) : (
                                                    <div className="no-image-small">No Image</div>
                                                )}
                                            </div>
                                            <div className="item-details">
                                                <h4>{item.title}</h4>
                                                <p className="item-description">
                                                    {item.description.length > 60
                                                        ? `${item.description.substring(0, 60)}...`
                                                        : item.description}
                                                </p>
                                                <div className="item-type">
                                                    <Tag size={14} />
                                                    <span>{item.itemType || 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`category-badge ${item.category}`}>
                                            {item.category === 'lost' ? '🚨 Lost' : '📦 Found'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="location-cell">
                                            <MapPin size={14} />
                                            <span>{item.location}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="date-cell">
                                            <Calendar size={14} />
                                            <span>{new Date(item.date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`status-cell ${item.status}`}>
                                            {getStatusIcon(item.status)}
                                            <span>{getStatusText(item.status)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <Link to={`/item/${item._id}`} className="view-btn">
                                                <Eye size={16} />
                                                View
                                            </Link>
                                            {item.status === 'pending' && (
                                                <button className="edit-btn">
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Report New Item Button */}
            <div className="report-new-section">
                <Link to="/report-item" className="report-new-btn">
                    + Report New Item
                </Link>
            </div>
        </div>
    );
};

export default MyItems;