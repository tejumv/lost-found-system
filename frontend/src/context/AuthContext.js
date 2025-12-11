// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        // Check if admin is already logged in (on page refresh)
        const token = localStorage.getItem('adminToken');
        const adminData = localStorage.getItem('adminData');

        if (token && adminData) {
            try {
                const adminObj = JSON.parse(adminData);
                setAdmin({ ...adminObj, token });
            } catch (e) {
                console.error("Failed to parse admin data", e);
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminData');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/admin/login`, {
                email,
                password
            });

            if (response.data.success) {
                // Save to localStorage
                localStorage.setItem('adminToken', response.data.token);
                localStorage.setItem('adminData', JSON.stringify(response.data.admin));

                // Update state
                setAdmin({ ...response.data.admin, token: response.data.token });
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (err) {
            console.error('Login error:', err);
            return {
                success: false,
                message: err.response?.data?.message || 'Network error. Please try again.'
            };
        }
    };

    const logout = () => {
        // Remove from localStorage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');

        // Update state
        setAdmin(null);

        // Redirect to login
        window.location.href = '/admin/login';
    };

    const value = {
        admin,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};