import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Medal, Clock, Star, Download } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import SEO from '../components/SEO';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ContestLeaderboard() {
  const { id: contestId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const certificateRef = useRef(null);

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

  const handleDownloadCertificate = async (studentData) => {
    if (!certificateRef.current) return;
    setGeneratingPdf(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Skillzeno_Certificate_${studentData.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating certificate PDF.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}><h3>Loading Leaderboard...</h3></div>;
  if (error) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}><h3 style={{ color: 'var(--accent-danger)' }}>{error}</h3></div>;

  const currentUserData = leaderboard.find(s => s.userId === user?._id);

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
            <button 
              className="btn btn-primary" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', padding: '12px 24px', background: 'var(--accent-success)', borderColor: 'var(--accent-success)' }}
              onClick={() => handleDownloadCertificate(currentUserData)}
              disabled={generatingPdf}
            >
              <Download size={20} />
              {generatingPdf ? 'Generating...' : 'Download My Certificate'}
            </button>
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

      {/* Hidden Certificate Element for html2canvas to render */}
      {currentUserData && (
        <div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute', top: -9999 }}>
          <div 
            ref={certificateRef} 
            style={{ 
              width: '1200px', 
              height: '848px', 
              position: 'relative', 
              backgroundImage: 'url(/contest-certificate-template.jpg)', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {/* Name */}
            <div style={{ position: 'absolute', top: '425px', left: '0', width: '100%', textAlign: 'center', fontSize: '42px', fontWeight: 'bold', color: '#0A192F', letterSpacing: '2px' }}>
              {currentUserData.name}
            </div>

            {/* Domain (Mid) */}
            <div style={{ position: 'absolute', top: '565px', left: '400px', width: '400px', textAlign: 'center', fontSize: '18px', fontWeight: '600', color: '#1B263B' }}>
              {currentUserData.domain}
            </div>

            {/* Domain (Bottom Row 1) */}
            <div style={{ position: 'absolute', bottom: '215px', left: '190px', width: '150px', textAlign: 'left', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              {currentUserData.domain}
            </div>

            {/* Score (Bottom Row 2) */}
            <div style={{ position: 'absolute', bottom: '215px', left: '445px', width: '80px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              {currentUserData.score}
            </div>

            {/* Rank (Bottom Row 3) */}
            <div style={{ position: 'absolute', bottom: '215px', left: '655px', width: '80px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              {currentUserData.rank}
            </div>

            {/* Date (Bottom Row 4) */}
            <div style={{ position: 'absolute', bottom: '215px', left: '855px', width: '120px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              {currentUserData.date}
            </div>

            {/* Certificate ID */}
            <div style={{ position: 'absolute', bottom: '150px', left: '145px', fontSize: '14px', fontWeight: 'bold', color: '#000' }}>
              SKZ-QUZ-{currentUserData.registrationId}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
