import React, { useState } from 'react';
import { FaStethoscope, FaEnvelope, FaLock } from "react-icons/fa";
import { loginUser } from "../api";
import loginBgImg from "../assets/login-bg.jpg";

function LoginPage({ navigate, setUser }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser(formData);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user); if (user.email === "admin@medicore.com") { navigate("/admin"); } else { navigate("/dashboard"); }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left" style={{ backgroundImage: `url(${loginBgImg})` }}>
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
            <h2>Log In</h2>
            <p>Access your account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>{error && <p style={{color: "red", fontSize: "13px", textAlign: "center"}}>{error}</p>}
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

            <button type="submit" className="submit-btn" style={{marginTop: "10px"}}>Log In</button>
          </form>

          <p className="auth-switch">
            Don't have an account? <span onClick={() => navigate("/register")}>Sign up</span>
          </p>
        </div>

        <div className="auth-bottom-links">
          <a href="#">Contact Us</a> | <a href="#">About Us</a> | <a href="#">FAQ</a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

