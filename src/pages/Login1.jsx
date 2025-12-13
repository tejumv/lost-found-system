import React, { useState } from "react";
import "./Login1.css";
import { useNavigate } from "react-router-dom";
import logoImage from "../assets/logo.png";
import { Link } from "react-router-dom";

const Login1 = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter new password

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordData({
      ...forgotPasswordData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

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
          setError("Email not found. Creating new account...");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }
        setError(data.message || "Login failed");
        return;
      }

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userPhone", data.user.phone || "");
        localStorage.setItem("userEnrollment", data.user.enrollment || "");
        localStorage.setItem("userSemester", data.user.semester || "");
        localStorage.setItem("userBranch", data.user.branch || "");
        localStorage.setItem("userYear", data.user.year || "");

        setSuccess("Login Successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!forgotPasswordData.email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    setForgotPasswordLoading(true);

    try {
      // First verify the email exists
      const response = await fetch("http://localhost:5000/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: forgotPasswordData.email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep(2); // Move to password entry step
        setSuccess("Email verified. Please enter your new password.");
      } else {
        setError(data.message || "Email not found. Please check and try again.");
      }
    } catch (err) {
      console.error("Verify email error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

const handleResetPassword = async (e) => {
  e.preventDefault();
  
  if (!forgotPasswordData.newPassword.trim()) {
    setError("Please enter a new password");
    return;
  }
  
  if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
    setError("Passwords do not match");
    return;
  }
  
  if (forgotPasswordData.newPassword.length < 6) {
    setError("Password must be at least 6 characters long");
    return;
  }

  setError("");
  setForgotPasswordLoading(true);

  try {
    const response = await fetch("http://localhost:5000/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: forgotPasswordData.email,
        newPassword: forgotPasswordData.newPassword
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // IMPORTANT: Clear the login form's password
      setFormData({
        ...formData,
        password: ""  // Clear the old password
      });
      
      setSuccess("Password reset successfully! Please login with your new password.");
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordData({
          email: "",
          newPassword: "",
          confirmPassword: ""
        });
        setStep(1);
      }, 3000);
    } else {
      setError(data.message || "Failed to reset password. Please try again.");
    }
  } catch (err) {
    console.error("Reset password error:", err);
    setError("Server error. Please try again later.");
  } finally {
    setForgotPasswordLoading(false);
  }
};

  const toggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
    setError("");
    setSuccess("");
    setForgotPasswordData({
      email: "",
      newPassword: "",
      confirmPassword: ""
    });
    setStep(1);
  };

  const handleBackToEmailStep = () => {
    setStep(1);
    setForgotPasswordData({
      ...forgotPasswordData,
      newPassword: "",
      confirmPassword: ""
    });
    setError("");
    setSuccess("");
  };

  return (
    <div className="auth-page-container">
      <div className="logo-container">
        <img src={logoImage} alt="Logo" className="form-logo" />
      </div>

      <div className="background-image-overlay"></div>

      <div className="auth-card-wrapper">
        <div className="auth-card">
          {!showForgotPassword ? (
            <>
              <h2 className="auth-title">Login</h2>
              <p className="auth-subtitle">Access your account</p>

              {error && (
                <div className="general-error-message error">
                  {error}
                </div>
              )}

              {success && (
  <div className="general-error-message success">
    {success}
    {success.includes("Password reset successfully") && (
      <div style={{ fontSize: "14px", marginTop: "5px" }}>
        Use your new password to login
      </div>
    )}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>

                <div className="forgot-password-link">
                  <button
                    type="button"
                    className="forgot-password-btn"
                    onClick={toggleForgotPassword}
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button className="auth-button" type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="auth-footer-text">
                New user? <Link to="/login">Create Account</Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="auth-title">Reset Password</h2>
              <p className="auth-subtitle">
                {step === 1 
                  ? "Enter your email to reset password" 
                  : "Enter your new password"}
              </p>

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

              <form className="auth-form" onSubmit={step === 1 ? handleVerifyEmail : handleResetPassword}>
                {step === 1 ? (
                  <div className="input-group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter Your Email"
                      className="auth-input"
                      value={forgotPasswordData.email}
                      onChange={handleForgotPasswordChange}
                      required
                      disabled={forgotPasswordLoading}
                    />
                  </div>
                ) : (
                  <>
                    <div className="step-indicator">
                      <span className="step-active">1. Verify Email ✓</span>
                      <span className="step-arrow">→</span>
                      <span className="step-active">2. New Password</span>
                    </div>
                    
                    <div className="input-group">
                      <input
                        type="password"
                        name="newPassword"
                        placeholder="Enter New Password"
                        className="auth-input"
                        value={forgotPasswordData.newPassword}
                        onChange={handleForgotPasswordChange}
                        required
                        disabled={forgotPasswordLoading}
                      />
                    </div>

                    <div className="input-group">
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm New Password"
                        className="auth-input"
                        value={forgotPasswordData.confirmPassword}
                        onChange={handleForgotPasswordChange}
                        required
                        disabled={forgotPasswordLoading}
                      />
                    </div>
                  </>
                )}

                <div className="forgot-password-buttons">
                  <button 
                    className="auth-button" 
                    type="submit" 
                    disabled={forgotPasswordLoading}
                  >
                    {forgotPasswordLoading 
                      ? "Processing..." 
                      : step === 1 
                        ? "Verify Email" 
                        : "Reset Password"}
                  </button>
                  
                  
                  
                  
                </div>
              </form>

              <p className="auth-footer-text">
                Remember your password?{" "}
                <button 
                  className="inline-link-btn" 
                  onClick={toggleForgotPassword}
                >
                  Login here
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login1;
