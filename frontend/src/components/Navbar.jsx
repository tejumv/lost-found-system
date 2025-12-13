// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Importing the final CSS styles
import collegeLogo from '../assets/idVTKeb2gc_logos.jpeg'; // Assuming your college logo path

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear authentication token and redirect to login
        localStorage.removeItem('token');
        navigate('/'); 
    };

    return (
        <nav className="navbar-container">
            {/* Left side: College Logo */}
            <div className="navbar-brand">
                <img src={collegeLogo} alt="College Logo" className="college-logo" />
            </div>
            
            {/* Center: Navigation Links */}
            <div className="navbar-links">
                <Link to="/dashboard" className="nav-link">HOME</Link>
                <Link to="/lost-items" className="nav-link">LOST ITEMS</Link>
                <Link to="/found-items" className="nav-link">FOUND ITEMS</Link>
            </div>
            
            {/* Right side: Logout Button */}
            <div className="navbar-actions">
                <button onClick={handleLogout} className="nav-link logout-btn">LOGOUT</button>
            </div>
        </nav>
    );
};

export default Navbar;
