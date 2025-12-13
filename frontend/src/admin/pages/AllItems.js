import React, { useEffect, useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import { adminService } from "../services/adminService";

function AllItems() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAllItems();
        setItems(data.items || []);
        setPagination(data.pagination || null);
      } catch (err) {
        console.error("Fetch items error", err);
        setError("Failed to load items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <AdminLayout>
      <h2>All Items</h2>

      {loading && <p>Loading...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && items.length === 0 && <p>No items found</p>}

      {!loading && items.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.title}</td>
                <td>{item.category}</td>
                <td>{item.status}</td>
                <td>
                  {item.userId?.name || item.userName || "Unknown"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}

export default AllItems;
