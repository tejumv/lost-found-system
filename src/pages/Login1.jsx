import React, { useState } from "react";
import "./Login1.css";
import { useNavigate } from "react-router-dom";
import logoImage from "../assets/logo.png";
import { Link } from "react-router-dom"; // Import Link for proper routing

const Login1 = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle Login Submit
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === "User not found") {
          // If user not found, redirect to the create account page (assuming it's '/create-account')
          setError("Email not found. Redirecting to create account...");
          setTimeout(() => navigate("/login"), 2000); 
          return;
        }

        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      setSuccess("Login Successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);

    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="auth-page-container">
      
      {/* 💡 CORRECTED LOGO PLACEMENT: Moved outside the auth-card-wrapper */}
      <div className="logo-container">
        <img src={logoImage} alt="Logo" className="form-logo" />
      </div>

      <div className="background-image-overlay"></div>

      <div className="auth-card-wrapper">
        <div className="auth-card">
          
          {/* REMOVED: The logo placement here to fix the structural issue */}

          <h2 className="auth-title">Login</h2>
          <p className="auth-subtitle">Access your account</p>

          {/* Display Errors */}
          {error && (
            <div className="general-error-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="general-error-message success">
              {success}
            </div>
          )}

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Enter Your Email"
                className="auth-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                className="auth-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button className="auth-button" type="submit">
              Login
            </button>
          </form>

          <p className="auth-footer-text">
            New user? <Link to="/login">Create Account</Link> 
            {/* Note: Changed <a> to <Link> and path to '/create-account' for React Router */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login1;