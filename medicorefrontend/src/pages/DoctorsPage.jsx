import React, { useState } from 'react';
import { FaSearch, FaStar, FaCalendarAlt, FaPhoneAlt, FaStethoscope } from "react-icons/fa";

function DoctorsPage({ doctors, navigate }) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const categories = ["ALL", "DENTAL CARE", "NEUROLOGY", "CARDIOLOGY", "GASTROENTEROLOGY", "ORTHOPAEDICS", "PULMONOLOGY"];

  const enrichedDoctors = doctors.map((doc, idx) => ({
    ...doc,
    rating: doc.rating || (4.5 + (idx % 5) * 0.1).toFixed(1),
    address: doc.address || "1200 Natalie Brook Apt. 966",
    image: doc.image || `https://i.pravatar.cc/150?img=${idx + 11}`
  }));

  const displayDoctors = enrichedDoctors.length > 0 ? enrichedDoctors : [
    { _id: "d1", name: "Dr. Topon Kumar", specialization: "NEUROLOGY", rating: "4.5", address: "1200 Natalie Brook Apt. 966", image: "https://i.pravatar.cc/150?img=11" },
    { _id: "d2", name: "Dr. Albert Miles", specialization: "CARDIOLOGY", rating: "5.0", address: "1200 Natalie Brook Apt. 966", image: "https://i.pravatar.cc/150?img=12" },
    { _id: "d3", name: "Gabriel Holt", specialization: "NEUROLOGY", rating: "4.8", address: "1200 Natalie Brook Apt. 966", image: "https://i.pravatar.cc/150?img=5" },
    { _id: "d4", name: "Lois Saunders", specialization: "PULMONOLOGY", rating: "4.3", address: "1200 Natalie Brook Apt. 966", image: "https://i.pravatar.cc/150?img=14" }
  ];

  const filteredDoctors = displayDoctors.filter(doc => {
    if (activeCategory === "ALL") return true;
    const spec = doc.specialization.toUpperCase();
    if (activeCategory === "NEUROLOGY" && spec.includes("NEUROLOG")) return true;
    if (activeCategory === "CARDIOLOGY" && spec.includes("CARDIOLOG")) return true;
    return spec.includes(activeCategory);
  });

  return (
    <div className="doctors-layout">
      <div className="doc-topbar">
        <div onClick={() => navigate("/")} style={{cursor: "pointer", display: "flex", alignItems: "center", gap: "12px"}}>
          <FaStethoscope style={{fontSize: "32px", color: "#1d4ed8"}} />
          <div>
            <h2 style={{margin: 0, fontSize: "24px", color: "#1e293b", fontWeight: "bold"}}>MediCore</h2>
            <p style={{fontSize: "12px", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b"}}>Care Beyond Measure</p>
          </div>
        </div>
        <div className="doc-search">
          <input type="text" placeholder="Search Doctor" />
          <FaSearch className="search-icon" />
        </div>
      </div>

      <div className="doc-filter-bar">
        <div className="doc-tabs">
          {categories.map(cat => (
            <span 
              key={cat} 
              className={`doc-tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      <div className="doc-grid">
        {filteredDoctors.map((doc) => (
          <div className="doc-card" key={doc._id}>
            <div className="doc-avatar">
              <img src={doc.image} alt={doc.name} />
            </div>
            
            <h3 className="doc-name">{doc.name}</h3>
            <p className="doc-address">{doc.address}</p>
            
            <div className="doc-spec-pill">
              {doc.specialization.toUpperCase()}
            </div>
            
            <div className="doc-actions">
              <button className="doc-action-btn">
                <FaCalendarAlt className="action-ic" /> Availability
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorsPage;


