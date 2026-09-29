import React from 'react';
import { FaSearch, FaStar, FaCalendarAlt, FaPhoneAlt, FaStethoscope } from "react-icons/fa";

function DoctorsPage({ doctors, navigate }) {
  const enrichedDoctors = doctors.map((doc, idx) => ({
    ...doc,
    rating: doc.rating || (4.5 + (idx % 5) * 0.1).toFixed(1),
    address: doc.address || "1200 Natalie Brook Apt. 966",
    image: doc.image || `https://i.pravatar.cc/150?img=${idx + 11}`
  }));

  const displayDoctors = enrichedDoctors.length > 0 ? enrichedDoctors : [
    { _id: "d1", name: "Dr. Topon Kumar", specialization: "NEUROLOGIST", rating: "4.5", address: "1200 Natalie Brook Apt. 966", image: "https://i.pravatar.cc/150?img=11" },
    { _id: "d2", name: "Dr. Albert Miles", specialization: "CARDIOLOGIST", rating: "5.0", address: "1200 Natalie Brook Apt. 966", image: "https://i.pravatar.cc/150?img=12" },
    { _id: "d3", name: "Gabriel Holt", specialization: "NEUROLOGIST", rating: "4.8", address: "1200 Natalie Brook Apt. 966", image: "https://i.pravatar.cc/150?img=5" },
    { _id: "d4", name: "Lois Saunders", specialization: "ONCOLOGY", rating: "4.3", address: "1200 Natalie Brook Apt. 966", image: "https://i.pravatar.cc/150?img=14" }
  ];

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
          <span className="doc-tab active">ALL</span>
          <span className="doc-tab">DENTAL CARE</span>
          <span className="doc-tab">NEUROLOGY</span>
          <span className="doc-tab">CARDIOLOGY</span>
          <span className="doc-tab">GASTROENTEROLOGY</span>
          <span className="doc-tab">ORTHOPAEDICS</span>
          <span className="doc-tab">PULMONOLOGY</span>
        </div>
      </div>

      <div className="doc-grid">
        {displayDoctors.map((doc) => (
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
