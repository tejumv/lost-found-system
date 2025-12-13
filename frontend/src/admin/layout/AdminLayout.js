import React from "react";
import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminNavbar />
      <div className="admin-container">
        <AdminSidebar />
        <main className="admin-main-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
