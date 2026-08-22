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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {contests.map(contest => {
              const isRegistered = registeredContestIds.includes(contest._id);
              const isStarted = new Date(contest.startTime) <= new Date();
              
              return (
                <div key={contest._id} className="internship-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '24px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '1.2rem', lineHeight: '1.4', margin: 0 }}>{contest.title}</h3>
                    </div>
                    {contest.description && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>{contest.description}</p>
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        <Calendar size={16} color="var(--primary)" /> 
                        <span>Start: {new Date(contest.startTime).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        <Clock size={16} color="var(--accent-warning)" /> 
                        <span>Reg Ends: {new Date(contest.registrationEndTime).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {contest.domains.map(d => (
                        <span key={d} style={{ fontSize: '0.75rem', background: 'var(--bg-primary)', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>{d}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px 24px', background: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{contest.questionsPerStudent} Questions • {contest.timeLimitMinutes} Mins</span>
                    
                    {isRegistered ? (
                       isStarted ? (
                         <button className="btn btn-primary" onClick={() => navigate(`/contests/arena/${contest._id}`)}>Enter Arena</button>
                       ) : (
                         <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-success)', fontSize: '0.9rem', fontWeight: '600' }}>
                           <CheckCircle2 size={16} /> Registered
                         </span>
                       )
                    ) : (
                      <button className="btn btn-primary" onClick={() => openRegisterModal(contest)}>Register Now</button>
                    )}
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
