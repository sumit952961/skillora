import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Trophy, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentName: user?.name || '',
    studentEmail: user?.email || '',
    mobileNumber: user?.mobileNumber || '',
    course: user?.course || '',
    branch: user?.branch || '',
    semester: user?.semester || '',
    college: user?.college || '',
    domain: ''
  });

  const [registering, setRegistering] = useState(false);
  const [registeredContestIds, setRegisteredContestIds] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';

  useEffect(() => {
    fetchActiveContests();
  }, []);

  const fetchActiveContests = async () => {
    try {
      const res = await fetch(`${API_URL}/contests/active`);
      if (res.ok) {
        const data = await res.json();
        setContests(data);
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
    } finally {
      setLoading(false);
    }
  };

  const openRegisterModal = (contest) => {
    setSelectedContest(contest);
    setShowRegisterModal(true);
    setFormData(prev => ({ ...prev, domain: '' })); // reset domain selection
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.domain) return alert("Please select a domain");
    setRegistering(true);

    try {
      const res = await fetch(`${API_URL}/contests/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          contestId: selectedContest._id,
          ...formData
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("Registration Successful!");
        setRegisteredContestIds(prev => [...prev, selectedContest._id]);
        setShowRegisterModal(false);
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}><h3>Loading Contests...</h3></div>;

  return (
    <>
      <SEO 
        title="Live Contests & Competitions | Skillzeno" 
        description="Participate in skill-based contests and national assessments. Win certificates and boost your portfolio."
      />
      <div className="container fade-in" style={{ padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div className="icon-wrapper" style={{ margin: '0 auto 16px', background: 'var(--primary-light)', color: 'var(--primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={32} />
          </div>
          <h1 className="section-title">Live Contests & Assessments</h1>
          <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Test your skills against peers nationally. Register for active contests, attempt domain-specific quizzes, and climb the leaderboard!
          </p>
        </div>

        {contests.length === 0 ? (
          <div style={{ background: 'var(--bg-secondary)', padding: '60px 20px', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <h3 style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>No active contests right now.</h3>
            <p style={{ color: 'var(--text-light)' }}>Check back later for upcoming skill assessments.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '900px', margin: '0 auto' }}>
            {contests.map(contest => {
              const isRegistered = registeredContestIds.includes(contest._id);
              const isStarted = new Date(contest.startTime) <= new Date();
              
              return (
                <div key={contest._id} className="internship-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', overflow: 'hidden', border: '1px solid var(--primary-light)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                  {/* Banner Area */}
                  <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', padding: '40px', color: 'white', position: 'relative' }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <span style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '16px', backdropFilter: 'blur(4px)' }}>
                        Featured Assessment
                      </span>
                      <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'white' }}>{contest.title}</h2>
                      {contest.description && (
                        <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: 0, lineHeight: 1.5 }}>{contest.description}</p>
                      )}
                    </div>
                    {/* Decorative elements */}
                    <Trophy size={160} style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', opacity: 0.1 }} />
                  </div>

                  <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}><Calendar size={24} /></div>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Test Starts At</p>
                          <p style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>{new Date(contest.startTime).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ background: 'var(--accent-warning-light)', padding: '12px', borderRadius: '50%', color: 'var(--accent-warning)' }}><Clock size={24} /></div>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Registration Ends</p>
                          <p style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>{new Date(contest.registrationEndTime).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--text-main)' }}>Available Domains</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {contest.domains.map(d => (
                          <span key={d} style={{ fontSize: '0.9rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '20px', fontWeight: '500' }}>{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding: '24px 32px', background: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{contest.questionsPerStudent} Questions</span>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }}></span>
                      <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{contest.timeLimitMinutes} Mins Duration</span>
                    </div>
                    
                    <div>
                      {isRegistered ? (
                         isStarted ? (
                           <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem', background: 'var(--accent-success)', borderColor: 'var(--accent-success)' }} onClick={() => navigate(`/contests/arena/${contest._id}`)}>Enter Arena 🚀</button>
                         ) : (
                           <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-success)', fontSize: '1.1rem', fontWeight: '600', padding: '12px 24px', background: 'var(--accent-success-light)', borderRadius: '8px' }}>
                             <CheckCircle2 size={24} /> You are Registered
                           </span>
                         )
                      ) : (
                        <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem' }} onClick={() => openRegisterModal(contest)}>Register Now</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h2 className="modal-title">Register for Contest</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{selectedContest?.title}</p>
            
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="studentName" required className="form-input" value={formData.studentName} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="studentEmail" required className="form-input" value={formData.studentEmail} onChange={handleInputChange} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input type="tel" name="mobileNumber" required className="form-input" value={formData.mobileNumber} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>College / University Name</label>
                  <input type="text" name="college" required className="form-input" value={formData.college} onChange={handleInputChange} placeholder="e.g. IIT Delhi" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Course</label>
                  <input type="text" name="course" required className="form-input" value={formData.course} onChange={handleInputChange} placeholder="e.g. B.Tech" />
                </div>
                <div className="form-group">
                  <label>Branch</label>
                  <input type="text" name="branch" required className="form-input" value={formData.branch} onChange={handleInputChange} placeholder="e.g. CSE" />
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <input type="text" name="semester" required className="form-input" value={formData.semester} onChange={handleInputChange} placeholder="e.g. 5th" />
                </div>
              </div>

              <div className="form-group">
                <label>Select Domain (You will be tested on this)</label>
                <select name="domain" required className="form-input" value={formData.domain} onChange={handleInputChange}>
                  <option value="">-- Choose a domain --</option>
                  {selectedContest?.domains.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowRegisterModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={registering} style={{ flex: 1 }}>
                  {registering ? 'Registering...' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
