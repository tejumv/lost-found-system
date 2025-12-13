import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import graduationIcon from './graduate-hat.svg'; 
import user from './user.svg'; // This imports as URL
import phone from './phone.svg'; // This imports as URL
import mail from './communication.svg'; // This imports as URL
import calendar from './calendar.svg'; // This imports as URL
import books from './book-stack.svg'; // This imports as URL
import building from './university.svg'; // This imports as URL

const Profile = () => {
    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        name: "",
        email: "",
        phone: "",
        enrollment: "",
        semester: "",
        branch: "",
        year: ""
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...userData });
    const [saving, setSaving] = useState(false);

    // Fetch profile function wrapped in useCallback
    const fetchProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login1");
                return;
            }

            const response = await axios.get("http://localhost:5000/api/auth/me", {
                headers: { "x-auth-token": token }
            });

            if (response.data.success) {
                const user = response.data.user;
                const data = {
                    name: user.name || "User",
                    email: user.email || "user@example.com",
                    phone: user.phone || "Not provided",
                    enrollment: user.enrollment || "Not provided",
                    semester: user.semester || "Not provided",
                    branch: user.branch || "Not provided",
                    year: user.year || "Not provided"
                };

                setUserData(data);
                setEditData(data);
            } else {
                // Fallback to localStorage
                const name = localStorage.getItem("userName") || "User";
                const email = localStorage.getItem("userEmail") || "user@example.com";
                const phone = localStorage.getItem("userPhone") || "Not provided";
                const enrollment = localStorage.getItem("userEnrollment") || "Not provided";
                const semester = localStorage.getItem("userSemester") || "Not provided";
                const branch = localStorage.getItem("userBranch") || "Not provided";
                const year = localStorage.getItem("userYear") || "Not provided";

                const fallbackData = { name, email, phone, enrollment, semester, branch, year };
                setUserData(fallbackData);
                setEditData(fallbackData);
            }
        } catch (error) {
            console.error("Profile fetch error:", error);
            // Fallback to localStorage
            const name = localStorage.getItem("userName") || "User";
            const email = localStorage.getItem("userEmail") || "user@example.com";
            const phone = localStorage.getItem("userPhone") || "Not provided";
            const enrollment = localStorage.getItem("userEnrollment") || "Not provided";
            const semester = localStorage.getItem("userSemester") || "Not provided";
            const branch = localStorage.getItem("userBranch") || "Not provided";
            const year = localStorage.getItem("userYear") || "Not provided";

            const fallbackData = { name, email, phone, enrollment, semester, branch, year };
            setUserData(fallbackData);
            setEditData(fallbackData);

            setError("Could not fetch profile data. Using saved information.");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleEdit = () => {
        setIsEditing(true);
        setEditData({ ...userData });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData({ ...userData });
        setError("");
    };

    const handleChange = (e) => {
        setEditData({
            ...editData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSave = async () => {
        if (!editData.name.trim()) {
            setError("Name is required");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                "http://localhost:5000/api/auth/update",
                editData,
                {
                    headers: { "x-auth-token": token },
                }
            );

            if (response.data.success) {
                setUserData({ ...editData });
                setIsEditing(false);

                // Update localStorage
                localStorage.setItem("userName", editData.name);
                localStorage.setItem("userPhone", editData.phone);
                localStorage.setItem("userEnrollment", editData.enrollment);
                localStorage.setItem("userSemester", editData.semester);
                localStorage.setItem("userBranch", editData.branch);
                localStorage.setItem("userYear", editData.year);

                alert("Profile updated successfully!");

                // Refresh data
                fetchProfile();
            } else {
                setError(response.data.message || "Update failed");
            }
        } catch (error) {
            console.error("Update error:", error);
            setError(error.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login1");
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
                    <div className="header-actions">
                        <button className="edit-profile-btn" onClick={handleEdit}>
                            ✏️ Edit Profile
                        </button>
                        
                    </div>
                </div>

                {error && <div className="error-alert">{error}</div>}

                <div className="profile-content">
                    {/* Profile Card */}
                    <div className="user-info-card">
                        <div className="user-avatar">
                            <div className="avatar-circle">
                                {userData.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-details">
                                <h2>{userData.name}</h2>
                                <p className="user-email">{userData.email}</p>
                                <p className="user-id">ID: {userData.enrollment}</p>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="info-section">
                        <h3>Personal Information</h3>

                        {isEditing ? (
                            <div className="edit-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={editData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={editData.email}
                                            disabled
                                            className="disabled-input"
                                        />
                                        <small>Email cannot be changed</small>
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={editData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Enrollment No</label>
                                        <input
                                            type="text"
                                            name="enrollment"
                                            value={editData.enrollment}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Semester</label>
                                        <select
                                            name="semester"
                                            value={editData.semester}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Semester</option>
                                            {[...Array(8)].map((_, i) => (
                                                <option key={i + 1} value={`Semester ${i + 1}`}>
                                                    Semester {i + 1}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Branch</label>
                                        <select
                                            name="branch"
                                            value={editData.branch}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Branch</option>
                                            <option value="Computer Science">Computer Science</option>
                                            <option value="Computer Science(AI)">Computer Science(AI)</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Electronics (VLSI)">Electronics (VLSI)</option>
                                            <option value="Mechanical">Mechanical</option>
                                            <option value="Civil">Civil</option>
                                            <option value="Electrical">Electrical</option>
                                            <option value="BioTech">BioTech</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Year</label>
                                        <select
                                            name="year"
                                            value={editData.year}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Year</option>
                                            <option value="First Year">First Year</option>
                                            <option value="Second Year">Second Year</option>
                                            <option value="Third Year">Third Year</option>
                                            <option value="Fourth Year">Fourth Year</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button
                                        className="save-btn"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving ? "Saving..." : "💾 Save Changes"}
                                    </button>
                                    <button
                                        className="cancel-btn"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        ❌ Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="info-grid">
                                <div className="info-card">
                                    <div className="info-icon"><img src={user} alt="Graduation" width="50" height="50" /></div>
                                    <div className="info-content">
                                        <label>Full Name</label>
                                        <p>{userData.name}</p>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <div className="info-icon"><img src={mail} alt="Graduation" width="50" height="50" /></div>
                                    <div className="info-content">
                                        <label>Email</label>
                                        <p>{userData.email}</p>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <div className="info-icon"><img src={phone} alt="Graduation" width="50" height="50" /></div>
                                    <div className="info-content">
                                        <label>Phone</label>
                                        <p>{userData.phone}</p>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <div className="info-icon"><img src={graduationIcon} alt="Graduation" width="50" height="50" /></div>
                                    <div className="info-content">
                                        <label>Enrollment No</label>
                                        <p>{userData.enrollment}</p>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <div className="info-icon"><img src={books} alt="Graduation" width="50" height="50" /></div>
                                    <div className="info-content">
                                        <label>Semester</label>
                                        <p>{userData.semester}</p>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <div className="info-icon"><img src={building} alt="Graduation" width="50" height="50" /></div>
                                    <div className="info-content">
                                        <label>Branch</label>
                                        <p>{userData.branch}</p>
                                    </div>
                                </div>
                                <div className="info-card">
                                    <div className="info-icon"><img src={calendar} alt="Graduation" width="50" height="50" /></div>
                                    <div className="info-content">
                                        <label>Year</label>
                                        <p>{userData.year}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
