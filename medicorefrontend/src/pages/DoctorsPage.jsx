import React, { useState } from 'react';
import { FaSearch, FaCalendarAlt, FaStethoscope, FaStar } from "react-icons/fa";
import AishaSilva from '../assets/AishaSilva.avif';
import DanielFernando from '../assets/DanielFernando.jpeg';
import GraceThompson from '../assets/GraceThompson.jpg';
import JamesWalker from '../assets/JamesWalker.jpg';
import KevinPatel from '../assets/KevinPatel.avif';
import LucasGreen from '../assets/LucasGreen.jpeg';
import MayaPatel from '../assets/MayaPatel.jpeg';
import MichaelChen from '../assets/MichaelChen.jpeg';
import OliviaBrown from '../assets/OliviaBrown.jpeg';
import PriyaNair from '../assets/PriyaNair.avif';
import RaviKumar from '../assets/RaviKumar.jpeg';
import SarahLee from '../assets/SarahLee.jpeg';
import SaraJohnson from '../assets/SaraJohnson.jpeg';
import SofiaMartinez from '../assets/SofiaMartinez.jpeg';

const doctorImageMap = {
  'Dr. Aisha Silva': AishaSilva,
  'Dr. Daniel Fernando': DanielFernando,
  'Dr. Grace Thompson': GraceThompson,
  'Dr. James Walker': JamesWalker,
  'Dr. Kevin Patel': KevinPatel,
  'Dr. Lucas Green': LucasGreen,
  'Dr. Maya Patel': MayaPatel,
  'Dr. Michael Chen': MichaelChen,
  'Dr. Olivia Brown': OliviaBrown,
  'Dr. Priya Nair': PriyaNair,
  'Dr. Ravi Kumar': RaviKumar,
  'Dr. Sarah Lee': SarahLee,
  'Dr. Sara Johnson': SaraJohnson,
  'Dr. Sofia Martinez': SofiaMartinez,
};

function DoctorsPage({ doctors, navigate }) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [expandedDoctorId, setExpandedDoctorId] = useState(null);
  const staticCategories = ["ALL", "DENTAL CARE", "NEUROLOGY", "CARDIOLOGY", "GASTROENTEROLOGY", "ORTHOPAEDICS", "PULMONOLOGY", "DERMATOLOGY"];
  const categories = staticCategories;

  const getAvailabilityText = (availability) => {
    if (!Array.isArray(availability) || availability.length === 0) return "No schedule set yet.";
    return availability.map(slot => `${slot.day}: ${slot.slots.join(', ')}`).join(' • ');
  };

  const normalizeDepartment = (value) => String(value || "General Medicine").trim();

  const enrichedDoctors = (doctors || []).map((doc, idx) => ({
    ...doc,
    department: doc.department || doc.specialization || "General Medicine",
    experience: doc.experience || `${5 + (idx % 7)} years`,
    rating: Number(doc.rating) || (4.5 + (idx % 5) * 0.1),
    address: doc.address || "1200 Natalie Brook Apt. 966",
    image: doctorImageMap[doc.name] || doc.image || `https://i.pravatar.cc/150?img=${idx + 11}`
  }));

  const fallbackDoctors = [
    { _id: "d1", name: "Dr. Aisha Silva", specialization: "Cardiology", department: "Cardiology", experience: "12 years", rating: 4.9, address: "No. 15, Colombo 03", image: AishaSilva },
    { _id: "d2", name: "Dr. Ravi Kumar", specialization: "Cardiology", department: "Cardiology", experience: "14 years", rating: 5.0, address: "No. 88, Jaffna", image: RaviKumar },
    { _id: "d3", name: "Dr. Daniel Fernando", specialization: "Dermatology", department: "Dermatology", experience: "10 years", rating: 4.8, address: "No. 28, Kandy Road", image: DanielFernando },
    { _id: "d4", name: "Dr. Sarah Lee", specialization: "Dermatology", department: "Dermatology", experience: "8 years", rating: 4.6, address: "No. 33, Dehiwala", image: SarahLee },
    { _id: "d5", name: "Dr. Priya Nair", specialization: "Neurology", department: "Neurology", experience: "11 years", rating: 4.9, address: "No. 42, Galle Face", image: PriyaNair },
    { _id: "d6", name: "Dr. James Walker", specialization: "Neurology", department: "Neurology", experience: "11 years", rating: 4.8, address: "No. 45, Kadawatha", image: JamesWalker },
    { _id: "d7", name: "Dr. Kevin Patel", specialization: "Dental Care", department: "Dental Care", experience: "8 years", rating: 4.7, address: "No. 09, Mount Lavinia", image: KevinPatel },
    { _id: "d8", name: "Dr. Grace Thompson", specialization: "Dental Care", department: "Dental Care", experience: "7 years", rating: 4.6, address: "No. 31, Malabe", image: GraceThompson },
    { _id: "d9", name: "Dr. Sara Johnson", specialization: "Gastroenterology", department: "Gastroenterology", experience: "9 years", rating: 4.8, address: "No. 17, Negombo", image: SaraJohnson },
    { _id: "d10", name: "Dr. Michael Chen", specialization: "Gastroenterology", department: "Gastroenterology", experience: "13 years", rating: 4.9, address: "No. 11, Bambalapitiya", image: MichaelChen },
    { _id: "d11", name: "Dr. Sofia Martinez", specialization: "Orthopaedics", department: "Orthopaedics", experience: "10 years", rating: 4.9, address: "No. 58, Kurunegala", image: SofiaMartinez },
    { _id: "d12", name: "Dr. Olivia Brown", specialization: "Orthopaedics", department: "Orthopaedics", experience: "10 years", rating: 4.8, address: "No. 67, Nugegoda", image: OliviaBrown },
    { _id: "d13", name: "Dr. Lucas Green", specialization: "Pulmonology", department: "Pulmonology", experience: "12 years", rating: 4.8, address: "No. 76, Wanathamulla", image: LucasGreen },
    { _id: "d14", name: "Dr. Maya Patel", specialization: "Pulmonology", department: "Pulmonology", experience: "9 years", rating: 4.7, address: "No. 20, Kalubowila", image: MayaPatel }
  ];

  const displayDoctors = enrichedDoctors.length > 0 ? enrichedDoctors : fallbackDoctors;

  const filteredDoctors = displayDoctors.filter(doc => {
    if (activeCategory === "ALL") return true;
    const department = normalizeDepartment(doc.department || doc.specialization).toUpperCase();
    const category = activeCategory.toUpperCase();
    return department.includes(category);
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

            <div className="doc-rating-row">
              <FaStar style={{ color: "#f59e0b", fontSize: "13px" }} />
              <span>{Number(doc.rating || 4.8).toFixed(1)}</span>
            </div>

            <h3 className="doc-name">{doc.name}</h3>
            <p className="doc-address">{doc.address}</p>

            <div className="doc-spec-pill">
              {normalizeDepartment(doc.department || doc.specialization).toUpperCase()}
            </div>

            <p className="doc-meta">{doc.experience || "8 years"} experience</p>

            <div className="doc-actions">
              <button className="doc-action-btn" onClick={() => setExpandedDoctorId(expandedDoctorId === doc._id ? null : doc._id)}>
                <FaCalendarAlt className="action-ic" /> Availability
              </button>
            </div>

            {expandedDoctorId === doc._id && (
              <div className="doc-availability-panel" style={{ marginTop: '12px', padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #dbeafe' }}>
                <strong style={{ display: 'block', marginBottom: '8px', color: '#1e3a8a' }}>Doctor availability</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: '#334155', fontSize: '13px' }}>
                  {Array.isArray(doc.availability) && doc.availability.length > 0 ? (
                    doc.availability.map((slot) => (
                      <div key={`${doc._id}-${slot.day}`}>
                        <span style={{ fontWeight: 700 }}>{slot.day}:</span> {slot.slots.join(' • ')}
                      </div>
                    ))
                  ) : (
                    <span>No schedule set yet.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorsPage;


