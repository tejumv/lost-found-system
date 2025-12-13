import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import { Search, MapPin, Calendar, Tag } from "lucide-react"; // Removed Filter import
import axios from "axios";
import "./Items.css";

const Items = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    dateRange: "all"
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

    // Date filter (last 7 days, 30 days, etc.)
    if (filters.dateRange !== "all") {
      const now = new Date();
      let cutoffDate = new Date();

      if (filters.dateRange === "today") {
        cutoffDate.setDate(now.getDate() - 1);
      } else if (filters.dateRange === "week") {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (filters.dateRange === "month") {
        cutoffDate.setDate(now.getDate() - 30);
      }

      filtered = filtered.filter(item => new Date(item.date) >= cutoffDate);
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, filters]); // Added dependencies

  useEffect(() => {
    fetchAllItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]); // Now using the memoized function

  const fetchAllItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/items/all", {
        headers: { "x-auth-token": token }
      });

      if (response.data.success) {
        setItems(response.data.items);
        setFilteredItems(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      category: "all",
      status: "all",
      dateRange: "all"
    });
  };

  return (
    <div className="items-page">
      {/* Header */}
      <div className="items-header">
        <h1>Browse Lost & Found Items</h1>
        <p>Search through items reported on campus</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search items by name, description, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="all">All Categories</option>
            <option value="lost">Lost Items</option>
            <option value="found">Found Items</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="matched">Matched</option>
            <option value="returned">Returned</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>

          <button className="reset-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <span>{filteredItems.length} items found</span>
        {searchTerm && <span> for "{searchTerm}"</span>}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="loading">Loading items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="no-results">
          <h3>No items found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item) => (
            <div key={item._id} className="item-card">
              <div className={`item-category ${item.category}`}>
                {item.category === 'lost' ? '🚨 Lost' : '📦 Found'}
              </div>

              <div className="item-image">
                {item.image ? (
                  <img src={`http://localhost:5000${item.image}`} alt={item.title} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>

              <div className="item-content">
                <h3>{item.title}</h3>
                <p className="item-description">{item.description}</p>

                <div className="item-details">
                  <div className="detail">
                    <MapPin size={16} />
                    <span>{item.location}</span>
                  </div>
                  <div className="detail">
                    <Calendar size={16} />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <div className="detail">
                    <Tag size={16} />
                    <span>{item.itemType || 'Unknown'}</span>
                  </div>
                </div>

                <div className="item-footer">
                  <span className={`status-badge ${item.status}`}>
                    {item.status}
                  </span>
                  <button
                    className="view-details-btn"
                    onClick={() => window.location.href = `/item/${item._id}`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Items;