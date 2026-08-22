import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Trophy, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';

const LiveCountdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Started');
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${d > 0 ? d + 'd ' : ''}${h}h ${m}m ${s}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return <span style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>{timeLeft}</span>;
};

// --- New Massive Countdown Component ---
const MassiveLiveCountdown = ({ targetDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState({ d: '00', h: '00', m: '00', s: '00', isLive: false });

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let triggered = false;
    const updateTimer = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;

      if (diff <= 0) {
        if (!triggered) {
          triggered = true;
          setTimeLeft({ isLive: true });
          if (onCompleteRef.current) onCompleteRef.current();
        }
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        d: String(d).padStart(2, '0'),
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
        isLive: false
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isLive) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', background: 'var(--accent-success-light)', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ color: 'var(--accent-success)', fontSize: '2.5rem', margin: 0 }}>🟢 TEST IS LIVE NOW</h2>
      </div>
    );
  }

  const TimeBlock = ({ value, label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'white', padding: '20px', borderRadius: 'var(--radius-md)', minWidth: '100px', boxShadow: 'var(--shadow-md)' }}>
      <span style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--primary)', lineHeight: '1' }}>{value}</span>
      <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '8px', fontWeight: '600' }}>{label}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
      {timeLeft.d !== '00' && <TimeBlock value={timeLeft.d} label="Days" />}
      <TimeBlock value={timeLeft.h} label="Hours" />
      <TimeBlock value={timeLeft.m} label="Mins" />
      <TimeBlock value={timeLeft.s} label="Secs" />
    </div>
  );
};
// ---------------------------------------

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
  const [userRegistrations, setUserRegistrations] = useState([]); // full registration docs
  const [isTestStartedMap, setIsTestStartedMap] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';

  useEffect(() => {
    fetchActiveContests();
    if (user?._id || user?.id) {
      fetchUserRegistrations();
    }
  }, [user]);

  const fetchUserRegistrations = async () => {
    try {
      const res = await fetch(`${API_URL}/contests/user-registrations/${user?._id || user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserRegistrations(data);
      }
    } catch (err) {
      console.error("Error fetching registrations", err);
    }
  };

  const fetchActiveContests = async () => {
    try {
      const res = await fetch(`${API_URL}/contests/active`);
      if (res.ok) {
        const data = await res.json();
        setContests(data);
        
        // Initialize the started map
        const map = {};
        data.forEach(c => {
          map[c._id] = new Date(c.startTime) <= new Date();
        });
        setIsTestStartedMap(map);
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
          userId: user?._id || user?.id,
          contestId: selectedContest._id,
          ...formData
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        alert("Registration Successful!");
        fetchUserRegistrations(); // refresh registrations
        setShowRegisterModal(false);
      } else {
        alert(`Registration failed: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Registration failed. Please check the console for details.");
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
              const registration = userRegistrations.find(r => 
                (r.contestId._id === contest._id) || (r.contestId === contest._id)
              );
              const isRegistered = !!registration;
              const isStarted = isTestStartedMap[contest._id] || new Date(contest.startTime) <= new Date();
              const contestEndTime = new Date(new Date(contest.startTime).getTime() + contest.timeLimitMinutes * 60000);
              const isContestEnded = new Date() >= contestEndTime;
              
              if (isRegistered) {
                // ---- REGISTERED DASHBOARD ----
                return (
                  <div key={contest._id} className="internship-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ padding: '30px', textAlign: 'center', borderBottom: '1px solid var(--border-color)', background: 'white' }}>
                      <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '8px' }}>Your Contest Dashboard</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>{contest.title}</p>
                    </div>
                    
                    <div style={{ padding: '40px 20px', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                      
                      {/* Selected Domain Highlight */}
                      <div style={{ padding: '16px 32px', background: 'var(--primary-light)', borderRadius: 'var(--radius-full)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Selected Domain:</span>
                        <span style={{ fontSize: '1.2rem', color: 'var(--primary-dark)', fontWeight: '900' }}>{registration.domain}</span>
                      </div>

                      {registration.hasTakenTest ? (
                        <div style={{ width: '100%', maxWidth: '500px', textAlign: 'center', background: 'var(--bg-secondary)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                          <CheckCircle2 size={64} style={{ color: 'var(--accent-success)', margin: '0 auto 16px' }} />
                          <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Test Completed Successfully</h3>
                          
                          {isContestEnded ? (
                            <>
                              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The contest has officially ended. The final results are out!</p>
                              <button 
                                className="btn btn-primary" 
                                style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
                                onClick={() => navigate(`/contests/leaderboard/${contest._id}`)}
                              >
                                View Leaderboard & Certificate
                              </button>
                            </>
                          ) : (
                            <>
                              <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
                                Your answers have been recorded. You cannot take the test again.
                              </p>
                              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '24px' }}>
                                The Leaderboard and Certificate will be available once the contest officially ends at <strong>{contestEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>.
                              </p>
                              <button 
                                className="btn btn-primary" 
                                disabled
                                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', background: 'var(--text-light)', borderColor: 'var(--text-light)', cursor: 'not-allowed' }}
                              >
                                Test Submitted (Awaiting Results)
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <>
                          {/* Massive Countdown */}
                          <div style={{ margin: '20px 0' }}>
                            <MassiveLiveCountdown 
                              targetDate={contest.startTime} 
                              onComplete={() => setIsTestStartedMap(prev => ({ ...prev, [contest._id]: true }))} 
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '30px', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>✓ {contest.questionsPerStudent} Questions</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>✓ {contest.timeLimitMinutes} Mins Duration</span>
                          </div>
                          
                          <div style={{ marginTop: '20px', width: '100%', maxWidth: '400px' }}>
                            <button 
                              className="btn btn-primary" 
                              disabled={!isStarted}
                              style={{ width: '100%', padding: '20px', fontSize: '1.3rem', borderRadius: 'var(--radius-lg)', background: isStarted ? 'var(--primary)' : 'var(--text-light)', borderColor: isStarted ? 'var(--primary)' : 'var(--text-light)', cursor: isStarted ? 'pointer' : 'not-allowed', boxShadow: isStarted ? 'var(--shadow-premium)' : 'none' }} 
                              onClick={() => isStarted && navigate(`/contests/arena/${contest._id}`)}
                            >
                              {isStarted ? 'Start Assessment' : 'Test Not Started Yet'}
                            </button>
                            {!isStarted && <p style={{ textAlign: 'center', marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>The Start Assessment button will unlock automatically when the timer hits zero.</p>}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              }

              // ---- STANDARD REGISTRATION CARD ----
              return (
                <div key={contest._id} className="internship-card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', overflow: 'hidden', border: '1px solid var(--primary-light)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                  {/* Banner Area */}
                  <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', padding: '40px', color: 'white', position: 'relative' }}>
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
                    <Trophy size={160} style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', opacity: 0.1, color: 'white' }} />
                  </div>

                  <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}><Calendar size={24} /></div>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Test Starts In</p>
                          <p style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
                            {isStarted ? <span style={{ color: 'var(--accent-success)' }}>Live Now!</span> : <LiveCountdown targetDate={contest.startTime} />}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ background: 'var(--accent-warning-light)', padding: '12px', borderRadius: '50%', color: 'var(--accent-warning)' }}><Clock size={24} /></div>
                        <div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Registration Ends</p>
                          <p style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
                            {new Date(contest.registrationEndTime).toLocaleString('en-US', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: 'numeric', minute: '2-digit', hour12: true
                            })}
                          </p>
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
                      <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1.1rem' }} onClick={() => openRegisterModal(contest)}>Register Now</button>
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
