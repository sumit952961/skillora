import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, MapPin, Clock, ArrowRight, Code, Bookmark, Building2, ShieldCheck, Database, Atom, Box, Layers } from 'lucide-react';


export default function Internships() {
  const { internships } = useContext(DataContext);
  const [loading, setLoading] = useState(true);
  const [applyStatus, setApplyStatus] = useState({});
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 400);
  }, []);

  const handleApply = (id) => {
    navigate(`/internships/${id}`);
  };

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '60px' }}><h3>Loading opportunities...</h3></div>;
  }

  const getSkillIcon = (skillName) => {
    const s = skillName.toLowerCase();
    if (s.includes('mongo') || s.includes('database')) return <Database size={14} style={{color: '#10b981'}} />;
    if (s.includes('react')) return <Atom size={14} style={{color: '#0ea5e9'}} />;
    if (s.includes('node') || s.includes('express')) return <Box size={14} style={{color: '#10b981'}} />;
    if (s.includes('architecture') || s.includes('system')) return <Layers size={14} style={{color: '#4f46e5'}} />;
    if (s.includes('html') || s.includes('css')) return <Code size={14} style={{color: '#f59e0b'}} />;
    return <Code size={14} style={{color: '#64748b'}} />;
  };

  return (
    <>
    <div className="container fade-in">
      <div className="section-title-wrapper">

        <h1 className="section-title">Available Virtual Internships</h1>
        <p className="section-subtitle">Choose from our selected high-standard projects and start working right away to secure your certificate.</p>
      </div>

      <div className="internships-grid">
        {internships.map(internship => (
          <div key={internship.id} className="premium-internship-card">
            
            {/* Header Top Row */}
            <div className="card-header-top">
              <div className="domain-badge">
                <Code size={14} strokeWidth={3} /> {internship.domain || 'DEVELOPMENT'}
              </div>
              <button className="bookmark-btn">
                <Bookmark size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Title */}
            <div>
              <Link to={`/internships/${internship.id}`} style={{ textDecoration: 'none' }}>
                <h2 className="card-title">{internship.title}</h2>
              </Link>
            </div>

            {/* Description */}
            <p className="card-description">
              {internship.description}
            </p>

            {/* Skills section */}
            <div className="card-skills-section">
              <div className="skills-header">SKILLS COVERED</div>
              <div className="skills-list">
                {internship.skillsLearned ? internship.skillsLearned.map((skill, index) => (
                  <span key={index} className="skill-pill-detailed">
                    {getSkillIcon(skill)} {skill}
                  </span>
                )) : internship.requirements.map((skill, index) => (
                  <span key={index} className="skill-pill-detailed">
                    {getSkillIcon(skill)} {skill}
                  </span>
                ))}
              </div>
            </div>

            <hr className="card-divider" />

            {/* Timings / Type Stats Grid */}
            <div className="card-stats-grid">
              <div className="card-stat-block">
                <div className="card-stat-icon-wrap"><Clock size={16} /></div>
                <div className="card-stat-text-col">
                  <span className="card-stat-label">DURATION</span>
                  <span className="card-stat-value">{internship.duration}</span>
                </div>
              </div>
              <div className="card-stat-block">
                <div className="card-stat-icon-wrap"><Briefcase size={16} /></div>
                <div className="card-stat-text-col">
                  <span className="card-stat-label">TYPE</span>
                  <span className="card-stat-value">{internship.type || internship.mode || 'Full-Time'}</span>
                </div>
              </div>
            </div>

            {/* Footer row: Certificate + Apply Link */}
            <div className="card-footer-action">
              <div className="cert-badge">
                <ShieldCheck size={24} strokeWidth={2} className="cert-icon" />
                <div className="cert-text">
                  <span className="cert-title">Certificate</span>
                  <span className="cert-subtitle">Upon Completion</span>
                </div>
              </div>

              <button 
                onClick={() => handleApply(internship.id)}
                className="card-apply-btn-large"
                disabled={applyStatus[internship.id] === 'Applied'}
              >
                {applyStatus[internship.id] === 'Applied' ? (
                  'Applied ✓'
                ) : (
                  <>
                    Apply Now <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}
