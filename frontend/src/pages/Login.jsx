import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import logoImage from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    semester: "",
    email: "",
    mobile: "",
    password: "",
    branch: "",
    year: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const { name, semester, email, mobile, password } = formData;

    if (!name || !semester || !email || !mobile || !password) {
      setMessage("All fields are required!");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Invalid email format!");
      return false;
    }
    if (!/^\d{10}$/.test(mobile)) {
      setMessage("Mobile number must be 10 digits!");
      return false;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          ...formData,
          phone: formData.mobile
        }
      );

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userName", response.data.user.name);
        localStorage.setItem("userEmail", response.data.user.email);
        localStorage.setItem("userPhone", response.data.user.phone || "");
        localStorage.setItem("userEnrollment", response.data.user.enrollment || "");
        localStorage.setItem("userSemester", response.data.user.semester || "");
        localStorage.setItem("userBranch", response.data.user.branch || "");
        localStorage.setItem("userYear", response.data.user.year || "");

        setMessage("Account Created Successfully!");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setMessage(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message ||
        "Registration Failed. Try again!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="logo-container">
        <img src={logoImage} alt="Logo" className="form-logo" />
      </div>

      <div className="form-container">
        <h2>Create Account</h2>
        <p>Register for the Lost & Found Portal</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            required
          >
            <option value="">Select Semester</option>
            {[...Array(8)].map((_, i) => (
              <option key={i + 1} value={`Semester ${i + 1}`}>
                Semester {i + 1}
              </option>
            ))}
          </select>

          <select
            name="branch"
            value={formData.branch}
            onChange={handleChange}
          >
            <option value="">Select Branch (Optional)</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Computer Science (AI)">Computer Science (AI)</option>
            <option value="Automation and Robotics">Automation and Robotics</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Civil">Civil</option>
            <option value="Electrical">Electrical</option>
            <option value="Electronics and Communication">Electronics and Communication</option>
            <option value="Electronics and Communication (VLSI)">Electronics and Communication (VLSI)</option>
          </select>

          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
          >
            <option value="">Select Year (Optional)</option>
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
            <option value="Third Year">Third Year</option>
            <option value="Fourth Year">Fourth Year</option>
          </select>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="mobile-input">
            <span>+91</span>
            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              required
              maxLength="10"
            />
          </div>

          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {message && (
          <p className={`message ${message.includes("Success") ? "success" : "error"}`}>
            {message}
          </p>
        )}

        <p className="footer-message">
          Already have an account?{" "}
          <span
            className="login-link"
            onClick={() => navigate("/login1")}
            style={{ color: "#4f46e5", cursor: "pointer", textDecoration: "underline" }}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}