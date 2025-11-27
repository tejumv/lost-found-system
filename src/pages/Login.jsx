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
  });

  const [message, setMessage] = useState("");

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

    if (!validateForm()) return;

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );

      // Store token
      localStorage.setItem("token", response.data.token);

      setMessage("Account Created Successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage("Registration Failed. Try again!");
    }
  };

  return (
    <div className="login-page">
      <div className="logo-container">
        <img src={logoImage} alt="Logo" className="form-logo" />
      </div>

      <div className="form-container">
        <h2>Create Account</h2>
        <p>A great platform for managing lost and found items at KLE Tech</p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
          >
            <option value="">Select Semester</option>
            {[...Array(8)].map((_, i) => (
              <option key={i + 1} value={`Semester ${i + 1}`}>
                Semester {i + 1}
              </option>
            ))}
          </select>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />

          <div className="mobile-input">
            <span>+91</span>
            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
            />
          </div>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <button type="submit">Create Account</button>
        </form>

        {message && <p className="message">{message}</p>}
        <p className="footer-message">All fields are required!</p>
      </div>
    </div>
  );
}
