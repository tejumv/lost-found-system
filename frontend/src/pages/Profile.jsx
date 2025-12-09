import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        phone: "",
        enrollment: "",
        branch: "",
        year: "",
    });
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        fetchProfile(token);
        fetchUserItems(token);
    }, [navigate]);

    const fetchProfile = async (token) => {
        try {
            // Get user data from localStorage or backend
            const name = localStorage.getItem("userName") || "User";
            const email = localStorage.getItem("userEmail") || "user@example.com";
            const phone = localStorage.getItem("userPhone") || "Not provided";
            const enrollment = localStorage.getItem("userEnrollment") || "Not provided";
            const branch = localStorage.getItem("userBranch") || "Not provided";
            const year = localStorage.getItem("userYear") || "Not provided";

            setUserData({ name, email, phone, enrollment, branch, year });
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchUserItems = async (token) => {
        try {
            const response = await axios.get("http://localhost:5000/api/items/my-items", {
                headers: { "x-auth-token": token },
            });

            if (response.data.success) {
                setItems(response.data.items || []);
            }
        } catch (error) {
            console.error("Error fetching items:", error);
            // For demo, create dummy items
            setItems([
                {
                    _id: "1",
                    title: "Blue Water Bottle",
                    category: "lost",
                    location: "Library",
                    date: "2024-12-05",
                    status: "pending",
                },
                {
                    _id: "2",
                    title: "MacBook Charger",
                    category: "found",
                    location: "Computer Lab",
                    date: "2024-12-04",
                    status: "found",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>My Profile</h1>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>

                <div className="profile-content">
                    {/* User Info Card */}
                    <div className="user-info-card">
                        <div className="user-avatar">
                            <div className="avatar-circle">
                                {userData.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-details">
                                <h2>{userData.name}</h2>
                                <p className="user-email">{userData.email}</p>
                            </div>
                        </div>

                        <div className="user-stats">
                            <div className="stat">
                                <span className="stat-number">{items.length}</span>
                                <span className="stat-label">Items Reported</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">
                                    {items.filter(item => item.category === "found").length}
                                </span>
                                <span className="stat-label">Found Items</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">
                                    {items.filter(item => item.status === "returned").length}
                                </span>
                                <span className="stat-label">Returned</span>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="info-section">
                        <h3>Personal Information</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Full Name</label>
                                <p>{userData.name}</p>
                            </div>
                            <div className="info-item">
                                <label>Email</label>
                                <p>{userData.email}</p>
                            </div>
                            <div className="info-item">
                                <label>Phone</label>
                                <p>{userData.phone}</p>
                            </div>
                            <div className="info-item">
                                <label>Enrollment No</label>
                                <p>{userData.enrollment}</p>
                            </div>
                            <div className="info-item">
                                <label>Branch</label>
                                <p>{userData.branch}</p>
                            </div>
                            <div className="info-item">
                                <label>Year</label>
                                <p>{userData.year}</p>
                            </div>
                        </div>
                    </div>

                    {/* Reported Items */}
                    <div className="items-section">
                        <div className="section-header">
                            <h3>My Reported Items</h3>
                            <button
                                className="report-btn"
                                onClick={() => navigate("/report-item")}
                            >
                                + Report New
                            </button>
                        </div>

                        {items.length === 0 ? (
                            <div className="no-items">
                                <p>You haven't reported any items yet.</p>
                                <button
                                    className="browse-btn"
                                    onClick={() => navigate("/items")}
                                >
                                    Browse Items
                                </button>
                            </div>
                        ) : (
                            <div className="items-list">
                                {items.map((item) => (
                                    <div key={item._id} className="item-card">
                                        <div className="item-category">
                                            <span className={`category-badge ${item.category}`}>
                                                {item.category === "lost" ? "🚨 Lost" : "📦 Found"}
                                            </span>
                                            <span className={`status-badge ${item.status}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <h4>{item.title}</h4>
                                        <p className="item-description">{item.description}</p>
                                        <div className="item-details">
                                            <span className="location">📍 {item.location}</span>
                                            <span className="date">
                                                📅 {new Date(item.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;