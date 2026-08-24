import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { ArrowRight, Briefcase, MapPin, Clock, Award, Users, BookOpen, Shield, Zap, Code, Bookmark, Building2, ShieldCheck, Database, Atom, Box, Layers, Star, Target, Bot, Gamepad2, Swords, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';
import ContestTicker from '../components/ContestTicker';

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
      
      // Easing function: easeOutQuad
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

export default function Home() {
  const { user, token } = useContext(AuthContext);
  const { internships } = useContext(DataContext);
  const navigate = useNavigate();
  const [applyStatus, setApplyStatus] = useState({});
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const featuredInternships = internships.slice(0, 3);

  const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const durations = [6000, 3000, 3000]; // Double time for the 1st slide (MSME)
    const timer = setTimeout(() => {
      setActiveSlide(prev => (prev + 1) % 3);
    }, durations[activeSlide]);
    return () => clearTimeout(timer);
  }, [activeSlide]);

  const carouselSlides = [
    {
      title: "Govt. of India Recognized",
      subtitle: "Proudly registered under MSME (Reg No: UDYAM-UP-75-0200760).",
      icon: null,
      graphic: (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '190px', width: '100%', overflow: 'visible', paddingTop: '10px' }}>
          <img 
            src="https://plain-apac-prod-public.komododecks.com/202608/15/3LeRCGw6I87K71JrPhDt/image.png" 
            alt="MSME Registered" 
            style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain', transform: 'scale(1.1)' }}
          />
        </div>
      )
    },
    {
      title: "Real-World Experience",
      subtitle: "Learn by working on practical projects and industry-relevant tasks.",
      icon: <Briefcase size={22} />,
      graphic: (
        <svg width="220" height="150" viewBox="10 25 210 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="15" y="45" width="45" height="65" rx="6" fill="#e0e7ff" />
          <rect x="25" y="40" width="25" height="8" rx="2" fill="#4f46e5" />
          <line x1="23" y1="62" x2="52" y2="62" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" />
          <line x1="23" y1="74" x2="52" y2="74" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" />
          <line x1="23" y1="86" x2="45" y2="86" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" />
          <line x1="23" y1="98" x2="37" y2="98" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" />
          <rect x="85" y="38" width="112" height="74" rx="8" fill="#0f172a" />
          <rect x="91" y="44" width="100" height="62" rx="4" fill="#1e293b" />
          <rect x="75" y="112" width="132" height="8" rx="4" fill="#475569" />
          <path d="M136 65l-8 8 8 8M152 65l8-8-8-8" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="148" y1="58" x2="140" y2="78" stroke="#38bdf8" strokeWidth="3" />
          <circle cx="215" cy="55" r="4" fill="#a5b4fc" />
          <circle cx="80" cy="30" r="3" fill="#38bdf8" />
        </svg>
      )
    },
    {
      title: "Verified Certification",
      subtitle: "Get industry-standard certificates recognized globally and cryptographically verified.",
      icon: <Award size={22} />,
      graphic: (
        <svg width="220" height="150" viewBox="35 25 170 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="40" y="30" width="160" height="110" rx="12" fill="#e0e7ff" />
          <rect x="50" y="40" width="140" height="90" rx="8" fill="#ffffff" />
          <circle cx="120" cy="85" r="22" fill="#fbbf24" />
          <circle cx="120" cy="85" r="17" fill="#f59e0b" />
          <path d="M114 85l4 4 8-8" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="65" y1="55" x2="120" y2="55" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
          <line x1="65" y1="65" x2="105" y2="65" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
          <line x1="65" y1="115" x2="175" y2="115" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )
    }
  ];

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
    <>
    <SEO 
      title="Skillzeno | Premium Internships and Learning Portal" 
      description="Skillzeno is a premium project-based virtual internship and learning platform. Gain real-world experience, get verified certificates, and level up your career." 
      canonical="/"
      schema={{
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "Skillzeno",
        "url": "https://skillzeno.in",
        "logo": "https://skillzeno.in/favicon.png",
        "description": "Skillzeno is a premium project-based virtual internship and learning platform in India.",
        "sameAs": [
          "https://www.facebook.com/profile.php?id=61593113833134",
          "https://www.instagram.com/skillzeno26",
          "https://www.linkedin.com/company/skillzeno"
        ]
      }}
    />
    <div style={{ position: 'relative' }}>
      <ContestTicker />
      <div className="container fade-in" style={{ paddingTop: '10px' }}>
      {/* Hero Section */}
      <section className="hero-section">
        {/* Left Column: Headings, Buttons, and integrated metrics row */}
        <div className="hero-left">
          <span className="hero-badge">⚡ Certified Learning & Career Support</span>
          <h1 className="hero-title">
            Elevate Your Career with Skillzeno Internships
          </h1>
          <p className="hero-subtitle">
            Apply to curated virtual internships, challenge yourself with modern skills quiz tests, and receive cryptographically verified blockchain-ready certificates.
          </p>
          <div className="hero-buttons">
            <Link to="/internships" className="btn btn-primary-premium">
              Explore Internships <ArrowRight size={18} />
            </Link>
            <Link to="/quiz" className="btn btn-outline-premium">
              Take Practice Quiz <ArrowRight size={18} />
            </Link>
          </div>

          {/* Integrated Compact Metrics Row */}
          <div className="hero-metrics-row">
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
        </div>

        {/* Right Column: Visual illustration card */}
        <div className="hero-right">
          <div className="illustration-card">
            <div key={activeSlide} className="carousel-fade">
              {/* Visual element representing active graphic */}
              <div className="illustration-graphic">
                {carouselSlides[activeSlide].graphic}
              </div>
              
              {/* Middle Badge Icon */}
              {carouselSlides[activeSlide].icon && (
                <div className="icon-badge">
                  {carouselSlides[activeSlide].icon}
                </div>
              )}

              {/* Description details */}
              <h3 className="illustration-title" style={{ marginTop: carouselSlides[activeSlide].icon ? '0' : '40px' }}>
                {carouselSlides[activeSlide].title}
              </h3>
              <p className="illustration-subtitle">
                {carouselSlides[activeSlide].subtitle}
              </p>
            </div>

            {/* Carousel slider indicator dots */}
            <div className="carousel-indicators" style={{ position: 'absolute', bottom: '32px' }}>
              {carouselSlides.map((_, index) => (
                <span 
                  key={index} 
                  className={`dot ${index === activeSlide ? 'active' : ''}`}
                  onClick={() => setActiveSlide(index)}
                  style={{ cursor: 'pointer' }}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Epic Arena Banner */}
      <section style={{ marginTop: '80px', marginBottom: '40px', padding: '0 20px' }} className="container">
        <div className="home-arena-banner-wrapper">
          
          {/* Animated Background Elements */}
          <div className="arena-bg-glow"></div>
          <div className="arena-bg-grid"></div>
          
          <div className="arena-banner-content">
            <div className="arena-banner-left">
              <div className="arena-icon-container">
                <Swords size={36} className="swords-icon" />
              </div>
              <div className="arena-text-content">
                <div className="arena-badge">
                  <Sparkles size={14} /> NEW GAME MODE
                </div>
                <h2 className="arena-title">
                  SkillZeno <span className="arena-highlight">ARENA</span> <Zap size={28} className="zap-icon" />
                </h2>
                <p className="arena-desc">
                  Step into the ultimate battleground. Challenge our <strong>Adaptive AI</strong> in an endless battle of wits, build your streak, and prove your dominance.
                </p>
                <div className="arena-stats">
                  <span><Gamepad2 size={16} /> Endless Mode</span>
                  <span><Award size={16} /> Earn XP</span>
                  <span><Target size={16} /> Dynamic Difficulty</span>
                </div>
              </div>
            </div>
            
            <div className="arena-banner-right">
              <button className="btn arena-play-btn" onClick={() => navigate('/arena')}>
                Enter The Arena
                <div className="btn-glow"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Internships Section */}
      <section style={{ marginTop: '80px' }}>
        <div className="section-title-wrapper">
          <h2 className="section-title">Featured Internship Tracks</h2>
          <p className="section-subtitle">Jump-start your learning path immediately by applying to our most popular tracks.</p>
        </div>

        <div className="slider-container">
          <div className="slider-track">
            {[...featuredInternships, ...featuredInternships, ...featuredInternships].map((internship, index) => (
              <div key={`${internship.id}-${index}`} className="premium-internship-card" style={{ width: '380px', flexShrink: 0 }}>
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
                  {internship.description || 'Gain real-world experience building robust solutions and improving your technical skillset in a fast-paced environment.'}
                </p>

                {/* Skills section */}
                <div className="card-skills-section">
                  <div className="skills-header">SKILLS COVERED</div>
                  <div className="skills-list">
                    {internship.skillsLearned?.map((skill, i) => (
                      <span key={i} className="skill-pill-detailed">
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
                  >
                    Apply Now <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ marginTop: '100px' }}>
        <div className="section-title-wrapper">
          <h2 className="section-title">Why Choose Skillzeno?</h2>
          <p className="section-subtitle">We bridge the gap between academic learning and industry standards through real-world task-based internships.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Zap size={24} />
            </div>
            <h3>Self-Paced Internships</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Work on production-grade tasks with high-quality descriptions and receive constructive feedback.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Target size={24} />
            </div>
            <h3>Skill Quizzes</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Evaluate your core competency with curated multi-topic assessments and practice test interfaces.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Shield size={24} />
            </div>
            <h3>Verifiable Certificates</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Each certificate carries a unique security hash searchable directly through our portal for employers.
            </p>
          </div>
        </div>
      </section>

      {/* Student Testimonials Section */}
      <section style={{ marginTop: '100px', marginBottom: '0px' }}>
        <div className="section-title-wrapper">
          <h2 className="section-title">Success Stories</h2>
          <p className="section-subtitle">Hear from students who successfully completed their internship tracks and boosted their careers.</p>
        </div>

        <div className="testimonial-slideshow-container">
          <div key={activeTestimonial} className="carousel-fade testimonials-slide-row">
            {[
              {
                name: "Aarav Sharma",
                role: "Frontend Developer Intern",
                location: "Bengaluru, Karnataka",
                review: "The React internship track at Skillzeno was a turning point for me. Building real-world projects helped me clear my developer rounds easily!",
                rating: 5,
                initials: "AS",
                gradient: "linear-gradient(135deg, #6366f1, #a855f7)"
              },
              {
                name: "Priya Patel",
                role: "Backend API Engineer Intern",
                location: "Noida, Uttar Pradesh",
                review: "Designing database structures and working with JWT authentication gave me core production knowledge. Verifiable certificates are a huge plus!",
                rating: 5,
                initials: "PP",
                gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)"
              },
              {
                name: "Rohan Das",
                role: "Full Stack MERN Intern",
                location: "Mumbai, Maharashtra",
                review: "The self-paced tasks match actual software developer roles. Highly recommended for building a strong, recruiter-ready project portfolio.",
                rating: 5,
                initials: "RD",
                gradient: "linear-gradient(135deg, #10b981, #3b82f6)"
              },
              {
                name: "Sneha Reddy",
                role: "Web Design Intern",
                location: "Hyderabad, Telangana",
                review: "Submitting landing page tasks and getting structured task outcomes taught me grid systems, animations, and modern UI practices.",
                rating: 5,
                initials: "SR",
                gradient: "linear-gradient(135deg, #ec4899, #f43f5e)"
              },
              {
                name: "Amit Verma",
                role: "Node.js Developer Intern",
                location: "Pune, Maharashtra",
                review: "The interactive quiz tests evaluated my concepts perfectly before starting backend server codes. Great learning system!",
                rating: 5,
                initials: "AV",
                gradient: "linear-gradient(135deg, #f59e0b, #e11d48)"
              },
              {
                name: "Ananya Iyer",
                role: "React.js Intern",
                location: "Chennai, Tamil Nadu",
                review: "Being able to verify certificates online with unique secure hashes instantly built trust with my hiring manager.",
                rating: 5,
                initials: "AI",
                gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)"
              }
            ].slice(activeTestimonial * 2, activeTestimonial * 2 + 2).map((t, index) => (
              <div key={index} className="testimonial-card" style={{ flex: 1, maxWidth: '500px' }}>
                <div className="testimonial-header">
                  <div className="testimonial-avatar" style={{ background: t.gradient }}>
                    {t.initials}
                  </div>
                  <div className="testimonial-meta">
                    <h4>{t.name}</h4>
                    <p>{t.role}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: '2px', fontWeight: '700' }}>📍 {t.location}</p>
                  </div>
                </div>
                <div className="testimonial-rating">
                  {"★".repeat(t.rating)}
                </div>
                <p className="testimonial-quote">
                  "{t.review}"
                </p>
              </div>
            ))}
          </div>

          {/* Testimonial Carousel Indicator Dots */}
          <div className="carousel-indicators" style={{ marginTop: '28px' }}>
            {[0, 1, 2].map((i) => (
              <span 
                key={i} 
                className={`dot ${i === activeTestimonial ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(i)}
                style={{ cursor: 'pointer' }}
              ></span>
            ))}
          </div>
        </div>
      </section>
      </div>
    </div>
    </>
  );
}
