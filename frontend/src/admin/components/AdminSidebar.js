import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBoxOpen,
  FaExclamationCircle,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaClipboardList
} from 'react-icons/fa';
import '../styles/Admin.css';

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    localStorage.removeItem("adminSession");
    navigate("/admin/login");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <FaTachometerAlt /> <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <FaUsers /> <span>Users</span>
        </NavLink>

        <NavLink to="/admin/all-items" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <FaBoxOpen /> <span>All Items</span>
        </NavLink>

        <NavLink to="/admin/pending" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <FaExclamationCircle /> <span>Pending Items</span>
        </NavLink>

        <NavLink to="/admin/reports" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <FaClipboardList /> <span>Reports</span>
        </NavLink>

        <NavLink to="/admin/analytics" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <FaChartBar /> <span>Analytics</span>
        </NavLink>

        <NavLink to="/admin/settings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          <FaCog /> <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt /> <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;

