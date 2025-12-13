import React from "react";
import { FaUserCircle } from "react-icons/fa";
import "../styles/Admin.css";

function AdminNavbar() {
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");

  return (
    <div className="admin-navbar">
      <div className="navbar-brand">
        <h3>Lost & Found Admin Portal</h3>
      </div>
      <div className="navbar-actions">
        <div className="admin-profile">
          <span className="admin-name">{adminData.name || "Admin"}</span>
          <FaUserCircle size={24} />
        </div>
      </div>
    </div>
  );
}

export default AdminNavbar;
