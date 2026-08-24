import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { Award, Users, Star, Briefcase, Clock, ArrowRight, Code, Bookmark, ShieldCheck, Database, Atom, Box, Layers, Bot, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const end = parseInt(target, 10);
    if (isNaN(end)) return;
    
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      if (!active) return;
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      const easeProgress = progress * (2 - progress);
      const currentCount = Math.floor(easeProgress * end);
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCount);
    return () => { active = false; };
  }, [target, duration]);

  return <>{count}{suffix}</>;
}

export default function Dashboard() {
  const { internships } = useContext(DataContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 400);
  }, []);

  const handleApply = (id) => {
    navigate(`/internships/${id}`);
  };

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
    <div className="container fade-in">
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Ignite Your Potential</h1>
        <p className="section-subtitle" style={{ margin: '0 auto', maxWidth: '700px' }}>
          Take the next step in your career journey. Explore hand-picked opportunities, track your progress, and build a verifiable portfolio that sets you apart from the crowd.
        </p>
      </div>

      {/* Metrics Row from Home */}
      <div className="hero-metrics-row" style={{ marginBottom: '60px', justifyContent: 'center' }}>
        <div className="hero-metric-item">
          <div className="metric-icon-circle">
            <Users size={18} />
          </div>
          <div className="metric-value">
            <AnimatedCounter target="500" suffix="+" />
          </div>
          <div className="metric-label">Students Trained</div>
        </div>
        
        <div className="metric-divider"></div>

        <div className="hero-metric-item">
          <div className="metric-icon-circle">
            <Briefcase size={18} />
          </div>
          <div className="metric-value">
            <AnimatedCounter target="20" suffix="+" />
          </div>
          <div className="metric-label">Internship Programs</div>
        </div>

        <div className="metric-divider"></div>

        <div className="hero-metric-item">
          <div className="metric-icon-circle">
            <Award size={18} />
          </div>
          <div className="metric-value">
            <AnimatedCounter target="100" suffix="+" />
          </div>
          <div className="metric-label">Projects Completed</div>
        </div>

        <div className="metric-divider"></div>

        <div className="hero-metric-item">
          <div className="metric-icon-circle">
            <Star size={18} />
          </div>
          <div className="metric-value">
            <AnimatedCounter target="98" suffix="%" />
          </div>
          <div className="metric-label">Satisfaction Rate</div>
        </div>
      </div>

      {/* Premium Arena Banner */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '16px',
        padding: '28px 36px',
        marginBottom: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap',
        boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          zIndex: 0
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 1 }}>
          <div style={{
            background: 'linear-gradient(135deg, #FF6B6B, #6B66FF)',
            color: 'white',
            padding: '16px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(107, 102, 255, 0.4)'
          }}>
            <Bot size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '6px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
              Enter the Arena: You vs AI <Zap size={22} color="#F59E0B" fill="#F59E0B" />
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.05rem', maxWidth: '650px', lineHeight: '1.5' }}>
              Challenge our adaptive AI in an endless battle of wits. Prove your mastery, build an unstoppable streak, and see how far you can go!
            </p>
          </div>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/arena')}
          style={{ 
            padding: '14px 32px', 
            fontSize: '1.15rem', 
            fontWeight: '700',
            whiteSpace: 'nowrap', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            background: 'linear-gradient(135deg, var(--primary), #8B5CF6)',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            border: 'none',
            zIndex: 1
          }}
        >
          Enter Now <ArrowRight size={20} />
        </button>
      </div>

      <div className="section-title-wrapper">
        <h2 className="section-title">Available Internships</h2>
        <p className="section-subtitle">Find your next big opportunity below and start your application.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '60px' }}><h3>Loading opportunities...</h3></div>
      ) : (
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
                    <span className="card-stat-value">Full-Time</span>
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
                >
                  Apply Now <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
