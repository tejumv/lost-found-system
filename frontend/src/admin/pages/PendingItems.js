import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "../layout/AdminLayout";
import { adminService } from "../services/adminService";
import { FaCheck, FaTimes } from "react-icons/fa";
import "../styles/Admin.css";

function PendingItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllItems({ status: "pending" });
      setItems(response.items || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch pending items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingItems();
  }, [fetchPendingItems]);

  const handleApprove = async (id) => {
    try {
      await adminService.updateItemStatus(id, "approved", "Approved by admin");
      fetchPendingItems();
    } catch (err) {
      console.error("Error approving item:", err);
      alert("Failed to approve item");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this item?")) return;

    try {
      await adminService.updateItemStatus(id, "rejected", "Rejected by admin");
      fetchPendingItems();
    } catch (err) {
      console.error("Error rejecting item:", err);
      alert("Failed to reject item");
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <h2>Pending Approval Items</h2>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>No pending items found.</p>
        </div>
      ) : (
        <div className="grid-view">
          {items.map((item) => (
            <div key={item._id} className="item-card">
              <div className="item-card-image">
                {item.image ? (
                  <img src={item.image} alt={item.title} />
                ) : (
                  <div className="placeholder-image">No Image</div>
                )}
                <span className={`badge badge-${item.category}`}>
                  {item.category}
                </span>
              </div>

              <div className="item-card-content">
                <h3>{item.title}</h3>
                <p className="item-desc">{item.description}</p>

                <div className="item-meta">
                  <span>
                    Reported by: {item.postedBy?.name || "Unknown"}
                  </span>
                  <span>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="item-actions">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleApprove(item._id)}
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleReject(item._id)}
                  >
                    <FaTimes /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

export default PendingItems;
