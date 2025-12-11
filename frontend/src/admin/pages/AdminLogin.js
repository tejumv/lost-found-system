<<<<<<< HEAD
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
            // API call to backend login endpoint
            const response = await fetch("http://localhost:5000/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            setError("Cannot connect to server. Please check if backend is running.");
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

                {error && (
                    <div className="alert alert-error">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>⏳ Logging in...</>
                        ) : (
                            <>🚀 Login to Admin Panel</>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <div className="test-credentials">
                        <h4>Test Credentials:</h4>
                        <p><strong>Email:</strong> admin@test.com</p>
                        <p><strong>Password:</strong> password123</p>
                    </div>

                    <div className="backend-status">
                        <h4>Backend Status:</h4>
                        <button
                            className="test-btn"
                            onClick={async () => {
                                try {
                                    const res = await fetch("http://localhost:5000/api/health");
                                    const data = await res.json();
                                    alert(`✅ Backend is running!\nDatabase: ${data.database}\nStatus: ${data.message}`);
                                } catch {
                                    alert("❌ Backend is not responding. Make sure:\n1. Backend server is running\n2. Port 5000 is not blocked\n3. MongoDB is running");
                                }
                            }}
                        >
                            Test Backend Connection
                        </button>
                    </div>
                </div>

                <div className="copyright">
                    <p>© {new Date().getFullYear()} Lost & Found System</p>
                </div>
            </div>
        </div>
    );
};

=======
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../styles/Admin.css";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                console.log("Login successful, navigating to dashboard...");
                navigate("/admin/dashboard");
            } else {
                setError(result.message || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("An unexpected error occurred.");
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

                {error && (
                    <div className="alert alert-error">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>⏳ Logging in...</>
                        ) : (
                            <>🚀 Login to Admin Panel</>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <div className="copyright">
                        <p>© {new Date().getFullYear()} Lost & Found System</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

>>>>>>> 0205117 (Completed Admin response)
export default AdminLogin;