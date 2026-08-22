import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Medal, Clock, Award, Star } from 'lucide-react';
import SEO from '../components/SEO';

export default function ContestLeaderboard() {
  const { id: contestId } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';

  useEffect(() => {
    fetchLeaderboard();
  }, [contestId]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/contests/leaderboard/${contestId}`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      const data = await res.json();
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
  if (error) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}><h3 style={{ color: 'var(--accent-danger)' }}>{error}</h3></div>;

  return (
    <>
      <SEO title="Contest Leaderboard | Skillzeno" />
      <div className="container fade-in" style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-block', background: 'var(--primary-light)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
            <Trophy size={40} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>National Leaderboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Top performers from across the country</p>
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
