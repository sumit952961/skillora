import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { Calendar, Briefcase, ChevronRight, ShieldCheck, ArrowRight, Compass } from 'lucide-react';

export default function MyInternships() {
  const { appliedInternships } = useContext(AuthContext);
  const { internships: allInternships } = useContext(DataContext);
  // Derive directly - no local state copy needed, prevents blink on WebSocket re-renders
  const myInternships = appliedInternships || [];
  const loading = !appliedInternships; // only show loading if data hasn't loaded at all yet

  if (loading) {
    return <div className="container"><h3>Fetching active courses...</h3></div>;
  }

  // Internships the user has NOT applied to yet
  const unappliedInternships = allInternships.filter(
    i => !myInternships.some(app => app.internshipId === i.id || app.details?.id === i.id)
  );

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
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} /> App No: {app.appNumber || app.id}</span>
                </div>
              </div>
              <Link to={`/my-internships/${app.internshipId}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                View Overview <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Explore More Internships — shown when user has applied to at least one */}
      {myInternships.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Compass size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Explore More Internships</h2>
          </div>

          {unappliedInternships.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '16px' }}>
              You have applied to all available internships! 🎉
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {unappliedInternships.slice(0, 3).map(internship => (
                <div key={internship.id} style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '600' }}>{internship.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{internship.domain} · {internship.duration}</p>
                  </div>
                  <Link
                    to={`/internships/${internship.id}`}
                    className="btn btn-outline"
                    style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                  >
                    View <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/internships" style={{ color: 'var(--primary)', fontSize: '0.88rem', textDecoration: 'none', fontWeight: '600' }}>
              View all internships →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
