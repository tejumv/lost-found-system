import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ReportItem.css';

const ReportItem = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'lost',
        location: '',
        date: new Date().toISOString().split('T')[0],
        contactInfo: '',
        image: null,
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const campusLocations = [
        'Main Building',
        'Library',
        'Cafeteria',
        'Computer Lab',
        'Sports Complex',
        'Parking Lot',
        'Hostel Block A',
        'Hostel Block B',
        'Admin Block',
        'Auditorium',
        'Classroom Block',
        'Medical Center',
        'Playground',
        'Gymnasium',
        'Other'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setMessage('❌ Please upload only image files');
            e.target.value = '';
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setMessage('❌ Image size should be less than 5MB');
            e.target.value = '';
            return;
        }

        setFormData({ ...formData, image: file });

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        if (!formData.title.trim()) return '❌ Item title is required';
        if (!formData.description.trim()) return '❌ Description is required';
        if (!formData.location.trim()) return '❌ Please select location';
        if (!formData.date) return '❌ Date is required';
        if (!formData.contactInfo.trim()) return '❌ Contact number is required';
        if (!/^\d{10}$/.test(formData.contactInfo)) return '❌ Contact number must be 10 digits';
        if (!formData.image) return '❌ Please upload a picture of the item';

        // Validate date is not in future
        const selectedDate = new Date(formData.date);
        const today = new Date();
        if (selectedDate > today) return '❌ Date cannot be in the future';

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setMessage(validationError);
            return;
        }

        setLoading(true);
        setMessage('');

        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('❌ Please login first');
            setLoading(false);
            navigate('/login');
            return;
        }

        const data = new FormData();
        data.append('title', formData.title.trim());
        data.append('description', formData.description.trim());
        data.append('category', formData.category);
        data.append('location', formData.location);
        data.append('date', formData.date);
        data.append('contactInfo', formData.contactInfo.trim());
        data.append('image', formData.image);

        try {
            const response = await axios.post('http://localhost:5000/api/items/add', data, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setMessage('✅ Item reported successfully! Redirecting...');

                // Reset form
                setFormData({
                    title: '',
                    description: '',
                    category: 'lost',
                    location: '',
                    date: new Date().toISOString().split('T')[0],
                    contactInfo: '',
                    image: null,
                });
                setImagePreview(null);

                // Clear file input
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';

                // Redirect to dashboard
                setTimeout(() => navigate('/dashboard'), 2000);
            } else {
                setMessage(`❌ ${response.data.message || 'Failed to report item'}`);
            }
        } catch (error) {
            console.error('Error:', error);

            if (error.response) {
                if (error.response.status === 401) {
                    setMessage('❌ Session expired. Please login again');
                    localStorage.removeItem('token');
                    setTimeout(() => navigate('/login'), 2000);
                } else if (error.response.status === 413) {
                    setMessage('❌ Image file is too large (max 5MB)');
                } else {
                    setMessage(`❌ ${error.response.data?.message || 'Server error'}`);
                }
            } else if (error.request) {
                setMessage('❌ Cannot connect to server');
            } else {
                setMessage(`❌ ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="report-container">
            <div className="report-header">
                <h1>Report Lost or Found Item</h1>
            </div>

            {message && (
                <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            <div className="report-card">
                <form onSubmit={handleSubmit} className="report-form">
                    <div className="form-section">
                        <h3>Item Information</h3>

                        <div className="form-group">
                            <label>Item Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Blue Water Bottle, MacBook Charger"
                                maxLength="100"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the item in detail (color, brand, size, distinguishing features)"
                                rows="3"
                                maxLength="500"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="lost">🚨 Lost Item</option>
                                    <option value="found">📦 Found Item</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Date *</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Location Details</h3>

                        <div className="form-group">
                            <label>Location *</label>
                            <select
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Location</option>
                                {campusLocations.map((loc) => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Contact Number *</label>
                            <input
                                type="tel"
                                name="contactInfo"
                                value={formData.contactInfo}
                                onChange={handleChange}
                                placeholder="10-digit mobile number"
                                pattern="[0-9]{10}"
                                required
                            />
                            <small>We'll contact you when item is found/claimed</small>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Upload Picture *</h3>

                        <div className="image-upload-area">
                            <label className="upload-label">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                />
                                <div className="upload-box">
                                    {imagePreview ? (
                                        <div className="image-preview">
                                            <img src={imagePreview} alt="Preview" />
                                            <button
                                                type="button"
                                                className="remove-btn"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setFormData({ ...formData, image: null });
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <span className="upload-icon">📷</span>
                                            <p>Click to upload image</p>
                                            <small>Max size: 5MB | Formats: JPG, PNG</small>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate('/dashboard')}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportItem;