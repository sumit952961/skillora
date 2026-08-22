import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { ArrowLeft, Briefcase, Clock, MapPin, CheckCircle, ArrowRight, Layers, Award, Users, BookOpen } from 'lucide-react';
import InternshipApplyFlow from '../components/InternshipApplyFlow';
import SEO from '../components/SEO';

export default function InternshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, applyForInternship, appliedInternships } = useContext(AuthContext);
  const { internships } = useContext(DataContext);
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [alreadyAppliedPopup, setAlreadyAppliedPopup] = useState(false);

  useEffect(() => {
    // Check if user has already applied
    if (user && appliedInternships) {
      const hasApplied = appliedInternships.some(app => app.details.id === id || app.internshipId === id);
      setApplied(hasApplied);
    }
  }, [id, user, appliedInternships]);

  useEffect(() => {
    // Simulate loading and find internship
    setTimeout(() => {
      const found = internships.find(i => i.id === id);
      if (found) {
        setInternship(found);
        
        // Auto open modal if coming from login redirect
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('autoOpenApply') === 'true') {
          setIsModalOpen(true);
        }
      }
      setLoading(false);
    }, 400);
  }, [id, internships]);

  if (loading) {
    return (
      <div className="container fade-in" style={{ textAlign: 'center', marginTop: '80px' }}>
        <h3>Loading internship details...</h3>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="container fade-in" style={{ textAlign: 'center', marginTop: '80px' }}>
        <h3>Internship not found</h3>
        <Link to="/internships" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Internships
        </Link>
      </div>
    );
  }
  return (
    <>
      <SEO 
        title={`${internship.title} Internship | Skillzeno`}
        description={`Apply for the ${internship.title} internship at Skillzeno. ${internship.description}`}
        canonical={`/internships/${internship.id}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "EducationalOccupationalProgram",
          "name": `${internship.title} Virtual Internship`,
          "description": internship.description,
          "provider": {
            "@type": "EducationalOrganization",
            "name": "Skillzeno",
            "sameAs": "https://skillzeno.in"
          },
          "timeToComplete": internship.duration
        }}
      />
      <div className="container fade-in" style={{ position: 'relative' }}>
        {/* Minimal Back Navigation */}
        <Link to="/internships" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'var(--bg-secondary)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-color)',
          marginBottom: '16px',
          textDecoration: 'none'
        }}>
          <ArrowLeft size={18} />
        </Link>

        {/* Header Section */}
        <div className="detail-header">
          <div className="detail-header-left">
            <div className="detail-icon-wrapper">
              <Briefcase size={26} />
            </div>
            <div>
              <h1 className="detail-title">{internship.title}</h1>
              <p className="detail-department">{internship.department || `${internship.company} / ${internship.type}`}</p>
            </div>
          </div>
          <div className="detail-header-badges">
            <span className="detail-badge">
              <Clock size={14} /> {internship.duration}
            </span>
            <span className="detail-badge accent">
              <MapPin size={14} /> {internship.type}
            </span>
          </div>
        </div>

        {/* Content Grid: Main + Sidebar */}
        <div className="detail-content-grid">
          {/* Main Content */}
          <div className="detail-main">
            {/* Role Overview */}
            <section className="detail-section">
              <h2 className="detail-section-title">
                <BookOpen size={20} /> Role Overview
              </h2>
              <p className="detail-text">
                {internship.overview || internship.description}
              </p>
            </section>

            {/* Key Responsibilities */}
            {internship.responsibilities && (
              <section className="detail-section">
                <h2 className="detail-section-title">
                  <Layers size={20} /> Key Responsibilities
                </h2>
                <ul className="detail-checklist">
                  {internship.responsibilities.map((item, i) => (
                    <li key={i}>
                      <CheckCircle size={16} className="checklist-icon" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Required Skills */}
            <section className="detail-section">
              <h2 className="detail-section-title">
                <Layers size={20} /> Required Skills
              </h2>
              <div className="detail-skill-tags">
                {(internship.requirements || []).map((skill, i) => (
                  <span key={i} className="detail-skill-tag">{skill}</span>
                ))}
                {(internship.skillsLearned || []).map((skill, i) => (
                  <span key={`sl-${i}`} className="detail-skill-tag learned">{skill}</span>
                ))}
              </div>
            </section>

            {/* What You'll Get */}
            {internship.perks && (
              <section className="detail-section">
                <h2 className="detail-section-title">
                  <Award size={20} /> What You'll Get
                </h2>
                <ul className="detail-checklist perks">
                  {internship.perks.map((perk, i) => (
                    <li key={i}>
                      <CheckCircle size={16} className="checklist-icon perk-icon" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="detail-sidebar">
            <div className="detail-sidebar-card">
              <h3 className="sidebar-card-title">Ready to Apply?</h3>
              <p className="sidebar-card-text">
                Submit your application and take the first step towards an exciting career opportunity.
              </p>
              <button
                className="btn btn-primary sidebar-apply-btn"
                onClick={() => applied ? setAlreadyAppliedPopup(true) : setIsModalOpen(true)}
              >
                {applied ? 'Applied ✓' : <><span>Apply Now</span> <ArrowRight size={16} /></>}
              </button>

              <div className="sidebar-quick-info">
                <h4>Quick Info</h4>
                <div className="quick-info-row">
                  <span className="qi-label">Type</span>
                  <span className="qi-value">{internship.mode || 'Full-Time'}</span>
                </div>
                <div className="quick-info-row">
                  <span className="qi-label">Duration</span>
                  <span className="qi-value">{internship.duration}</span>
                </div>
                <div className="quick-info-row">
                  <span className="qi-label">Location</span>
                  <span className="qi-value">{internship.type}</span>
                </div>
                {internship.stipend && (
                  <div className="quick-info-row">
                    <span className="qi-label">Stipend</span>
                    <span className="qi-value">{internship.stipend}</span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {internship && (
        <InternshipApplyFlow
          internship={internship}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onApplied={(generatedAppId) => {
            applyForInternship(internship, generatedAppId);
            setApplied(true);
          }}
        />
      )}

      {/* Already Applied Popup */}
      {alreadyAppliedPopup && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setAlreadyAppliedPopup(false); }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1200, padding: '20px'
          }}
        >
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 32px',
            width: '100%', maxWidth: '420px',
            boxShadow: 'var(--shadow-lg)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✅</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>Already Applied!</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              You have already applied for <strong>{internship?.title}</strong>. Track your progress from <strong>My Internships</strong>.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setAlreadyAppliedPopup(false)}
                className="btn btn-outline"
                style={{ padding: '9px 20px', fontSize: '0.88rem' }}
              >
                Close
              </button>
              <a
                href="/my-internships"
                className="btn btn-primary"
                style={{ padding: '9px 20px', fontSize: '0.88rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                My Internships <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
