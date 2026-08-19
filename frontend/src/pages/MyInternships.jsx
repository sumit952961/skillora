import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, Briefcase, ChevronRight, ShieldCheck } from 'lucide-react';

export default function MyInternships() {
  const { appliedInternships } = useContext(AuthContext);
  const [myInternships, setMyInternships] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchMyInternships = async () => {
      // In this version, we are using the global appliedInternships state directly
      // rather than fetching from the mock backend.
      setMyInternships(appliedInternships);
      setLoading(false);
    };
    fetchMyInternships();
  }, [appliedInternships]);

  if (loading) {
    return <div className="container"><h3>Fetching active courses...</h3></div>;
  }

  return (
    <div className="container fade-in">
      <div className="section-title-wrapper" style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h1 className="section-title">My Registered Programs</h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitor progress, view timelines, and upload deliverables for active assignments.</p>
      </div>

      {myInternships.length === 0 ? (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '40px', textAlign: 'center' }}>
          <Briefcase size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3>No Registered Internships</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>You have not enrolled in any programs yet.</p>
          <Link to="/internships" className="btn btn-primary">Browse Internships</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {myInternships.map(app => (
            <div key={app.id} style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <span className="status-chip status-approved" style={{ marginBottom: '8px' }}>{app.status}</span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{app.details?.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>{app.details?.company}</p>
                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> Applied on: {app.appliedDate}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} /> App No: {app.id}</span>
                </div>
              </div>
              <Link to={`/my-internships/${app.internshipId}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                View Overview <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
