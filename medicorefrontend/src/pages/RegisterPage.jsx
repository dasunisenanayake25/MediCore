import React, { useState } from 'react';
import { FaStethoscope, FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { registerUser } from "../api";
import registerBgImg from "../assets/register-bg.jpg";

function RegisterPage({ navigate, setUser }) {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await registerUser(formData);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user); navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left" style={{ backgroundImage: `url(${registerBgImg})` }}>
        <div className="auth-overlay">
          <div className="auth-brand" onClick={() => navigate("/")} style={{cursor: "pointer"}}>
            <FaStethoscope className="auth-brand-icon" />
            <div className="auth-brand-text">
              <h2>MediCore</h2>
              <p style={{fontSize: "12px", opacity: 0.8, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em"}}>Care Beyond Measure</p>
            </div>
          </div>
          <div className="auth-footer">
            <p>All Right Reserved, 2026</p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <div className="auth-logo-circle">
              <FaStethoscope />
            </div>
            <h2>Sign Up</h2>
            <p>Register a new membership</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>{error && <p style={{color: "red", fontSize: "13px", textAlign: "center"}}>{error}</p>}
            <div className="input-wrapper">
              <label>User Name</label>
              <div className="input-group">
                <FaUser className="input-icon" />
                <input type="text" placeholder="Enter User Name" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
              </div>
            </div>
            <div className="input-wrapper">
              <label>Email</label>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input type="email" placeholder="Enter Email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="input-wrapper">
              <label>Password</label>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input type="password" placeholder="Password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="submit-btn">Sign Up</button>
          </form>

          <p className="auth-switch">
            You already have a membership? <span onClick={() => navigate("/login")}>Log in</span>
          </p>
        </div>

        <div className="auth-bottom-links">
          <a href="#">Contact Us</a> | <a href="#">About Us</a> | <a href="#">FAQ</a>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
