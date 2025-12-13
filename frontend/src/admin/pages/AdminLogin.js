import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAuthService } from "../services/adminAuthService";
import "../styles/Admin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await adminAuthService.login(email, password);

      if (result.success) {
        navigate("/admin/dashboard");
      } else {
        setError(result.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <h1>🔐 Admin Login</h1>
          <p>Lost & Found System Admin Portal</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="admin@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "⏳ Logging in..." : "🚀 Login to Admin Panel"}
          </button>
        </form>

        <div className="login-footer">
          <p>© {new Date().getFullYear()} Lost & Found System</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
