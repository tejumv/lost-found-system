import React, { useState } from "react";
import AdminLayout from '../layout/AdminLayout';
import { FaSave, FaCog, FaLock } from 'react-icons/fa';
import '../styles/Admin.css';

function Settings() {
    const [settings, setSettings] = useState({
        siteName: 'Campus Lost & Found',
        emailNotifications: true,
        autoApprove: false,
        maintenanceMode: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Settings saved successfully!');
    };

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h2>System Settings</h2>
            </div>

            <div className="settings-container">
                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="settings-section">
                        <h3><FaCog /> General Settings</h3>
                        <div className="form-group">
                            <label>Site Name</label>
                            <input
                                type="text"
                                name="siteName"
                                value={settings.siteName}
                                onChange={handleChange}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="emailNotifications"
                                    checked={settings.emailNotifications}
                                    onChange={handleChange}
                                />
                                Enable Email Notifications
                            </label>
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="autoApprove"
                                    checked={settings.autoApprove}
                                    onChange={handleChange}
                                />
                                Auto-approve Items (Not Recommended)
                            </label>
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onChange={handleChange}
                                />
                                Maintenance Mode
                            </label>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3><FaLock /> Security</h3>
                        <div className="form-group">
                            <button type="button" className="btn btn-secondary">Change Admin Password</button>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            <FaSave /> Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

export default Settings;
