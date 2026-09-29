import React, { useState } from 'react';
import { FaStethoscope, FaTooth, FaBrain, FaHeartbeat, FaBone, FaLungs, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import heroBannerImg from "../assets/hero-banner.jpg";
import journeyDoctorImg from "../assets/journey-doctor.jpg";

function LandingPage({ navigate, user, setUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#departments" },
    { label: "Departments", href: "#about" },
    { label: "Contact Us", href: "#contact" },
  ];

  return (
    <div className="landing-layout">
      <header className="landing-header">
        <div className="landing-logo-container">
          <div className="landing-logo">
            <FaStethoscope className="logo-icon" style={{marginRight: "8px", color: "#1d4ed8"}} /> MediCore
          </div>
          <div className="logo-tagline">Care Beyond Measure</div>
        </div>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          ☰
        </button>

        <nav className={`landing-nav ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="auth-buttons">
          {user ? (
            <>
              <span style={{fontWeight: "bold", color: "#1e40af"}}>Hi, {user.username}</span>
              <button className="landing-login-btn" onClick={() => { localStorage.removeItem("user"); setUser(null); }}>Logout</button>
            </>
          ) : (
            <>
              <button className="landing-login-btn" onClick={() => navigate("/login")}>Login</button>
              <button className="landing-reg-btn" onClick={() => navigate("/register")}>Register</button>
            </>
          )}
        </div>
      </header>

      <section id="home" className="landing-hero">
        <div className="hero-content">
          <h1>Your health,<br/>Our priority</h1>
          <p className="hero-desc">
            Our dedicated team is committed to providing comprehensive and compassionate care, tailored to your unique needs and preferences.
          </p>
          <button className="hero-btn" onClick={() => navigate("/doctors")}>
            Find a doctor
          </button>
        </div>
        <div className="hero-image-wrapper">
          <img src={heroBannerImg} alt="Doctors team" className="hero-img" />
        </div>
      </section>

      <section id="about" className="landing-expertise">
        <h2>Expertise & specializations</h2>
        <div className="expertise-grid">
          {[
            { title: "Dental Care", icon: <FaTooth /> },
            { title: "Neurology", icon: <FaBrain /> },
            { title: "Cardiology", icon: <FaHeartbeat /> },
            { title: "Gastroenterology", icon: <FaStethoscope /> },
            { title: "Orthopaedics", icon: <FaBone /> },
            { title: "Pulmonology", icon: <FaLungs /> }
          ].map((item, index) => (
            <div className="expertise-card" key={index}>
              <div className="card-icon" style={{color: "#3b82f6"}}>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>Lorem ipsum dolor sit amet, consect adip elit, sed do eiusmod tempor.</p>
            </div>
          ))}
        </div>
      </section>

      <section id="departments" className="landing-journey">
        <div className="journey-content">
          <h2>Start Your<br/>Wellness Journey<br/>Now</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, standard dummy text ever since the 1500s, when an unknown to the scrambled it to make a type specimen book.
          </p>
          <button className="contact-btn">Contact us <FaPhoneAlt style={{marginLeft: "8px"}}/></button>
        </div>
        <div className="journey-image-wrapper">
          <img src={journeyDoctorImg} alt="Doctor" className="journey-img" />
        </div>
      </section>

      <section className="landing-lab">
        <h2>We Have Lab Test Facilities,<br/>So Book Yours Todays!</h2>
      </section>

      <footer id="contact" className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <FaStethoscope style={{marginRight: "8px"}} /> MediCore
            </div>
            <p className="footer-tagline">Care Beyond Measure</p>
          </div>
          
          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="#home">Home</a>
            <a href="#departments">About Us</a>
            <a href="#about">Departments</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p><FaPhoneAlt /> +1 234 567 8900</p>
            <p><FaEnvelope /> info@medicore.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} MediCore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

