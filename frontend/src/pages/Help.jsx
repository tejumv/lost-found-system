import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footbar from '../components/Footbar';
import './Help.css';

const HelpForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    query: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.query.trim()) {
      setMessage('❌ Please fill in all fields');
      setTimeout(() => setMessage(''), 5000);
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      // Using Formspree - REPLACE THIS WITH YOUR FORMSPREE URL
      const formspreeUrl = 'https://formspree.io/f/myzrbgjv';
      
      const response = await fetch(formspreeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.query,
          _replyto: formData.email, // This ensures reply goes to user
          _subject: `Help Request from ${formData.name}` // Email subject
        })
      });

      if (response.ok) {
        setMessage('✅ Message sent successfully! We will reply to your email soon.');
        setFormData({ name: '', email: '', query: '' });
        
        setTimeout(() => {
          setMessage('');
        }, 5000);
      } else {
        setMessage('❌ Failed to send message. Please try again.');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Network error. Please check your connection.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="help-page-wrapper">
      <div className="full-width-header">
        <h1>Need Help? Contact Us</h1>
      </div>
      
      <div className="help-page-content">
        <form onSubmit={handleSubmit} className="simple-form">
          {message && (
            <div className={`status-message ${
              message.includes('✅') ? 'success' : 'error'
            }`}>
              {message}
            </div>
          )}
          
          

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="We'll reply to this email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="query">Your Query *</label>
            <textarea
              id="query"
              name="query"
              value={formData.query}
              onChange={handleChange}
              placeholder="Describe your issue or question"
              rows="4"
              required
              disabled={loading}
            />
          </div>

          <div className="button-group">
            <Link to="/" className="back-home-btn" onClick={(e) => loading && e.preventDefault()}>
              Back to Home
            </Link>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>

      <Footbar />
    </div>
  );
};

export default HelpForm;
