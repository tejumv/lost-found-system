import React, { useState } from 'react';
import axios from 'axios';
import './ReportItem.css';

const ReportItem = () => {
    const [formData, setFormData] = useState({
        itemName: '',
        category: 'Lost',
        description: '',
        location: '',
        date: '',
        image: null,
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const token = localStorage.getItem('token');

        if (!token) {
            setMessage('❌ Please login first');
            setLoading(false);
            window.location.href = '/login';
            return;
        }

        const data = new FormData();
        data.append('itemName', formData.itemName);
        data.append('category', formData.category);
        data.append('description', formData.description);
        data.append('location', formData.location);
        data.append('date', formData.date);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            const response = await axios.post('http://localhost:5000/api/items/add', data, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setMessage('✅ Item reported successfully!');
                setFormData({
                    itemName: '',
                    category: 'Lost',
                    description: '',
                    location: '',
                    date: '',
                    image: null,
                });
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
            } else {
                setMessage('❌ ' + (response.data.message || 'Failed to report item'));
            }
        } catch (error) {
            console.error('Full error:', error);

            if (error.response) {
                setMessage('❌ ' + (error.response.data.message ||
                    error.response.data.error ||
                    'Error reporting item'));
            } else if (error.request) {
                setMessage('❌ Cannot connect to server. Please check if backend is running.');
            } else {
                setMessage('❌ Error: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="report-container">
            <h2>Report Lost or Found Item</h2>
            {message && (
                <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="report-form" encType="multipart/form-data">
                <div className="form-group">
                    <label>Item Name *</label>
                    <input
                        type="text"
                        name="itemName"
                        value={formData.itemName}
                        onChange={handleChange}
                        placeholder="e.g., Water Bottle, Wallet, Keys"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Category *</label>
                    <select name="category" value={formData.category} onChange={handleChange}>
                        <option value="Lost">Lost Item</option>
                        <option value="Found">Found Item</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Description *</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the item in detail (color, brand, distinguishing features)"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Location *</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., Main Building Room 201, Cafeteria, Library"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Date *</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Upload Image (Optional)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <small>Upload a clear photo of the item (max 5MB)</small>
                </div>

                <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </form>
        </div>
    );
};

export default ReportItem;