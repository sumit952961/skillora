import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Medal, Clock, Download, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import SEO from '../components/SEO';

export default function ContestLeaderboard() {
  const { id: contestId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';

  const [waitEndTime, setWaitEndTime] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [contestId]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/contests/leaderboard/${contestId}`);
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 403 && data.contestEndTime) {
          setWaitEndTime(data.contestEndTime);
        }
        throw new Error(data.message || "Failed to fetch leaderboard");
      }
      
      setLeaderboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Medal size={24} color="#FFD700" />; // Gold
    if (rank === 2) return <Medal size={24} color="#C0C0C0" />; // Silver
    if (rank === 3) return <Medal size={24} color="#CD7F32" />; // Bronze
    return <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-muted)' }}>#{rank}</span>;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  if (loading) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}><h3>Loading Leaderboard...</h3></div>;
  if (waitEndTime) {
    const timeString = new Date(waitEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <div className="container fade-in" style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <Clock size={64} style={{ color: 'var(--primary)', margin: '0 auto 24px' }} />
        <h1 style={{ fontSize: '2.2rem', marginBottom: '16px' }}>Processing Results...</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '32px' }}>
          The contest is currently ongoing. Final ranks and certificates will be generated once the contest officially ends at <strong style={{ color: 'var(--text-main)' }}>{timeString}</strong>.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/contests')}>
          Return to Dashboard
        </button>
      </div>
    );
  }
  if (error) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}><h3 style={{ color: 'var(--accent-danger)' }}>{error}</h3></div>;

  const currentUserData = leaderboard.find(s => s.userId === (user?._id || user?.id));

  return (
    <>
      <SEO title="Contest Leaderboard | Skillzeno" />
      <div className="container fade-in" style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-block', background: 'var(--primary-light)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
            <Trophy size={40} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>National Leaderboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '24px' }}>Top performers from across the country</p>
          
          {currentUserData && (
            <div style={{ display: 'inline-block', background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '400px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Your Certificate</h3>
              {currentUserData.certificateLink ? (
                <a 
                  href={currentUserData.certificateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', padding: '12px 24px', background: 'var(--accent-success)', borderColor: 'var(--accent-success)', width: '100%', justifyContent: 'center' }}
                >
                  <Download size={20} />
                  Download Certificate
                </a>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <AlertCircle size={24} style={{ color: 'var(--accent-warning)' }} />
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>Certificate is being verified and will be available soon.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 2fr 2fr 1fr 1fr', padding: '16px 24px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <div style={{ textAlign: 'center' }}>Rank</div>
            <div>Student Name</div>
            <div>College / University</div>
            <div style={{ textAlign: 'center' }}>Score</div>
            <div style={{ textAlign: 'center' }}>Time Taken</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {leaderboard.map((student, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '80px 2fr 2fr 1fr 1fr', 
                  padding: '20px 24px', 
                  borderBottom: idx !== leaderboard.length - 1 ? '1px solid var(--border-color)' : 'none',
                  alignItems: 'center',
                  background: 'transparent',
                  transition: 'background 0.2s ease',
                  position: 'relative'
                }}
              >
                
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {getRankIcon(student.rank)}
                </div>
                
                <div style={{ fontWeight: '600', fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {student.name}
                </div>
                
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  {student.college}
                </div>
                
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent-success)' }}>
                  {student.score}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  <Clock size={14} /> {formatTime(student.timeTaken)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn btn-primary" onClick={() => navigate('/contests')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Back to Contests
          </button>
        </div>
      </div>
    </>
  );
}
