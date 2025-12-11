<<<<<<< HEAD
import React from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminNavbar />
      <div className="admin-container">
        <AdminSidebar />
        <main className="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

=======
import React from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminNavbar />
      <div className="admin-container">
        <AdminSidebar />
        <main className="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

>>>>>>> 0205117 (Completed Admin response)
export default AdminLayout;