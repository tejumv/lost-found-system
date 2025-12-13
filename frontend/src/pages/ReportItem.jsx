import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, Calendar, Tag, Smartphone, Info, AlertCircle } from 'lucide-react';
import './ReportItem.css';

const ReportItem = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'lost',
        itemType: '',
        location: '',
        exactLocation: '',
        date: new Date().toISOString().split('T')[0],
        contactInfo: localStorage.getItem('userPhone') || '',
        color: '',
        brand: '',
        image: null,
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Common locations for suggestions (users can still type their own)
    const commonLocations = [
        'Main Building Entrance',
        'Central Library - Ground Floor',
        'Library - First Floor',
        'Computer Lab 101',
        'Computer Lab 102',
        'Cafeteria - Food Court',
        'Cafeteria - Sitting Area',
        'Sports Complex - Gym',
        'Sports Complex - Basketball Court',
        'Hostel Block A - Lobby',
        'Hostel Block B - Common Room',
        'Parking Lot - Near Gate',
        'Parking Lot - Faculty Area',
        'Auditorium - Main Hall',
        'Auditorium - Backstage',
        'Classroom Block - Room 201',
        'Classroom Block - Corridor',
        'Admin Office',
        'Medical Center - Waiting Room',
        'Bus Stop - Main Gate',
        'Garden Area',
        'Playground - Football Field',
        'Student Center - Game Room'
    ];

    const itemTypes = [
        'Mobile Phone', 'Laptop', 'Tablet', 'Headphones', 'Charger', 'Power Bank',
        'Wallet', 'Purse', 'ID Card', 'Student ID', 'Driver License', 'Passport',
        'Keys', 'House Keys', 'Car Keys', 'Bike Keys',
        'Books', 'Notebooks', 'Textbooks', 'Study Material',
        'Water Bottle', 'Lunch Box', 'Tiffin Box',
        'Jacket', 'Sweater', 'Cap', 'Scarf', 'Gloves',
        'Bag', 'Backpack', 'Handbag', 'Laptop Bag',
        'Watch', 'Bracelet', 'Necklace', 'Earrings',
        'Glasses', 'Sunglasses', 'Spectacles',
        'Sports Equipment', 'Cricket Bat', 'Football', 'Badminton Racket',
        'Calculator', 'Pen Drive', 'Hard Disk',
        'Umbrella', 'Raincoat',
        'Other Electronics',
        'Other Accessories',
        'Other Personal Items'
    ];

    const colors = [
        'Black', 'White', 'Gray', 'Silver', 'Gold',
        'Red', 'Blue', 'Green', 'Yellow', 'Orange',
        'Purple', 'Pink', 'Brown', 'Maroon', 'Navy Blue',
        'Sky Blue', 'Light Green', 'Dark Green', 'Beige', 'Multicolor'
    ];

    useEffect(() => {
        // Pre-fill contact info from profile
        const userPhone = localStorage.getItem('userPhone');
        if (userPhone) {
            setFormData(prev => ({ ...prev, contactInfo: userPhone }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Show location suggestions when typing location
        if (name === 'location' && value.length > 2) {
            const filtered = commonLocations.filter(loc =>
                loc.toLowerCase().includes(value.toLowerCase())
            );
            setLocationSuggestions(filtered.slice(0, 5));
            setShowSuggestions(true);
        } else if (name === 'location' && value.length <= 2) {
            setShowSuggestions(false);
        }

        // Clear message when user types
        if (message) setMessage('');
    };

    const handleSuggestionClick = (suggestion) => {
        setFormData(prev => ({ ...prev, location: suggestion }));
        setShowSuggestions(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage('❌ Please upload only image files (JPG, PNG, GIF)');
            e.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage('❌ Image size should be less than 5MB');
            e.target.value = '';
            return;
        }

        setFormData(prev => ({ ...prev, image: file }));

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        if (!formData.title.trim()) return '❌ Item title is required';
        if (!formData.description.trim() || formData.description.trim().length < 10)
            return '❌ Please provide a detailed description (at least 10 characters)';
        if (!formData.itemType) return '❌ Please select item type';
        if (!formData.location.trim()) return '❌ Please enter location where item was lost/found';
        if (!formData.date) return '❌ Date is required';
        if (!formData.contactInfo.trim()) return '❌ Contact number is required';
        if (!/^\d{10}$/.test(formData.contactInfo)) return '❌ Contact number must be 10 digits';
        if (!formData.image) return '❌ Please upload a clear picture of the item';

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
            navigate('/login1');
            return;
        }

        const data = new FormData();
        data.append('title', formData.title.trim());
        data.append('description', formData.description.trim());
        data.append('category', formData.category);
        data.append('itemType', formData.itemType);
        data.append('location', formData.location.trim());
        data.append('exactLocation', formData.exactLocation.trim());
        data.append('date', formData.date);
        data.append('contactInfo', formData.contactInfo.trim());
        data.append('color', formData.color);
        data.append('brand', formData.brand);
        data.append('image', formData.image);

        try {
            const response = await axios.post('http://localhost:5000/api/items/add', data, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                const matchesFound = response.data.matchesFound || 0;
                const matchScore = response.data.matchScore || 0;

                if (matchesFound > 0) {
                    setMessage(`✅ Item reported successfully! We found ${matchesFound} potential match${matchesFound > 1 ? 'es' : ''} (${matchScore}% match). Redirecting...`);
                } else {
                    setMessage('✅ Item reported successfully! Our system will notify you if any matches are found. Redirecting...');
                }

                // Reset form
                setFormData({
                    title: '',
                    description: '',
                    category: 'lost',
                    itemType: '',
                    location: '',
                    exactLocation: '',
                    date: new Date().toISOString().split('T')[0],
                    contactInfo: localStorage.getItem('userPhone') || '',
                    color: '',
                    brand: '',
                    image: null,
                });
                setImagePreview(null);
                setShowSuggestions(false);

                // Clear file input
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';

                // Redirect to dashboard
                setTimeout(() => navigate('/dashboard'), 3000);
            } else {
                setMessage(`❌ ${response.data.message || 'Failed to report item'}`);
            }
        } catch (error) {
            console.error('Error:', error);

            if (error.response) {
                if (error.response.status === 401) {
                    setMessage('❌ Session expired. Please login again');
                    localStorage.removeItem('token');
                    setTimeout(() => navigate('/login1'), 2000);
                } else if (error.response.status === 413) {
                    setMessage('❌ Image file is too large (max 5MB)');
                } else {
                    setMessage(`❌ ${error.response.data?.message || 'Server error'}`);
                }
            } else if (error.request) {
                setMessage('❌ Cannot connect to server. Please check your internet connection.');
            } else {
                setMessage(`❌ ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="report-page">
            <div className="report-container">
                <div className="report-header">
                    <h1>
                        {formData.category === 'lost' ? '🚨 Report Lost Item' : '📦 Report Found Item'}
                    </h1>
                    <p className="report-subtitle">
                        Provide detailed information to help recover lost items or return found items
                    </p>
                </div>

                {message && (
                    <div className={`report-message ${message.includes('✅') ? 'success' : 'error'}`}>
                        <AlertCircle size={20} />
                        <span>{message}</span>
                    </div>
                )}

                <div className="report-card">
                    <form onSubmit={handleSubmit} className="report-form">
                        {/* Category Toggle */}
                        <div className="category-toggle">
                            <button
                                type="button"
                                className={`toggle-btn ${formData.category === 'lost' ? 'active' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, category: 'lost' }))}
                            >
                                <span className="toggle-icon">🚨</span>
                                I Lost Something
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${formData.category === 'found' ? 'active' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, category: 'found' }))}
                            >
                                <span className="toggle-icon">📦</span>
                                I Found Something
                            </button>
                        </div>

                        <div className="form-section">
                            <div className="section-header">
                                <h3><Tag size={18} /> Item Details</h3>
                                <p className="section-subtitle">Describe what you lost/found</p>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Item Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g., iPhone 13 Pro, Blue Nike Backpack, Silver Watch"
                                        maxLength="100"
                                        required
                                    />
                                    <small>Be specific about the item</small>
                                </div>

                                <div className="form-group">
                                    <label>Item Type *</label>
                                    <select
                                        name="itemType"
                                        value={formData.itemType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        {itemTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Detailed Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder={`Provide detailed information:
• Brand and model
• Color and size
• Unique features (scratches, stickers, engraving)
• Contents (if wallet/bag)
• Any identifying marks`}
                                    rows="4"
                                    maxLength="1000"
                                    required
                                />
                                <small>Minimum 10 characters. The more details, better the chance of recovery.</small>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Color (Optional)</label>
                                    <select
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Color</option>
                                        {colors.map((color) => (
                                            <option key={color} value={color}>{color}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Brand (Optional)</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        placeholder="e.g., Apple, Nike, Samsung"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <div className="section-header">
                                <h3><MapPin size={18} /> Location Details</h3>
                                <p className="section-subtitle">Where was the item lost/found?</p>
                            </div>

                            <div className="form-group">
                                <label>Location *</label>
                                <div className="location-input-wrapper">
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="e.g., Main Library - 2nd Floor, Computer Lab 101, Cafeteria Food Court"
                                        required
                                    />
                                    {showSuggestions && locationSuggestions.length > 0 && (
                                        <div className="location-suggestions">
                                            {locationSuggestions.map((suggestion, index) => (
                                                <div
                                                    key={index}
                                                    className="suggestion-item"
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                >
                                                    <MapPin size={14} />
                                                    <span>{suggestion}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <small>Type the exact location. Common locations will appear as suggestions.</small>
                            </div>

                            <div className="form-group">
                                <label>Exact Spot (Optional)</label>
                                <input
                                    type="text"
                                    name="exactLocation"
                                    value={formData.exactLocation}
                                    onChange={handleChange}
                                    placeholder="e.g., Under table near window, On bench near entrance, Inside locker #45"
                                />
                                <small>More specific location within the area</small>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date *</label>
                                    <div className="date-input">
                                        <Calendar size={18} />
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

                                <div className="form-group">
                                    <label>Time (Approximate)</label>
                                    <select name="time" onChange={handleChange}>
                                        <option value="">Select Time Range</option>
                                        <option value="Morning (6 AM - 12 PM)">Morning (6 AM - 12 PM)</option>
                                        <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                                        <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                                        <option value="Night (8 PM - 6 AM)">Night (8 PM - 6 AM)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <div className="section-header">
                                <h3><Smartphone size={18} /> Contact Information</h3>
                                <p className="section-subtitle">How can someone contact you?</p>
                            </div>

                            <div className="form-group">
                                <label>Contact Number *</label>
                                <div className="contact-input">
                                    <span className="country-code">+91</span>
                                    <input
                                        type="tel"
                                        name="contactInfo"
                                        value={formData.contactInfo}
                                        onChange={handleChange}
                                        placeholder="10-digit mobile number"
                                        pattern="[0-9]{10}"
                                        required
                                    />
                                </div>
                                <small>We'll use this number to contact you when item is found/claimed</small>
                            </div>

                            <div className="form-group">
                                <label>Additional Contact (Optional)</label>
                                <input
                                    type="text"
                                    name="alternateContact"
                                    onChange={handleChange}
                                    placeholder="Email or alternate phone number"
                                />
                                <small>We'll use this if we can't reach you on primary number</small>
                            </div>
                        </div>

                        <div className="form-section">
                            <div className="section-header">
                                <h3><Upload size={18} /> Upload Picture *</h3>
                                <p className="section-subtitle">A clear picture helps identify the item</p>
                            </div>

                            <div className="image-upload-section">
                                <label className="upload-label">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        required
                                        className="file-input"
                                    />
                                    <div className="upload-container">
                                        {imagePreview ? (
                                            <div className="image-preview-container">
                                                <div className="preview-header">
                                                    <span>Image Preview</span>
                                                    <button
                                                        type="button"
                                                        className="remove-btn"
                                                        onClick={() => {
                                                            setImagePreview(null);
                                                            setFormData(prev => ({ ...prev, image: null }));
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <img src={imagePreview} alt="Preview" className="preview-image" />
                                            </div>
                                        ) : (
                                            <div className="upload-placeholder">
                                                <div className="upload-icon">
                                                    <Upload size={40} />
                                                </div>
                                                <div className="upload-text">
                                                    <h4>Click to upload image</h4>
                                                    <p>Supported formats: JPG, PNG, GIF</p>
                                                    <p className="upload-note">Max file size: 5MB</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="form-footer">
                            <div className="footer-note">
                                <Info size={16} />
                                <p>
                                    <strong>Note:</strong> All reports are verified. Providing false information may lead to account suspension.
                                    Your contact information will be shared only with potential matches.
                                </p>
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
                                    {loading ? (
                                        <>
                                            <span className="spinner"></span>
                                            Submitting Report...
                                        </>
                                    ) : (
                                        `Report ${formData.category === 'lost' ? 'Lost' : 'Found'} Item`
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportItem;