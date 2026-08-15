import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Award, ShieldCheck, Download, FileText, Lock, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Certificates() {
  const { user, appliedInternships, quizApplications } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading to prevent flicker
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const isCompleted = (app) => {
    if (!app.tasks || app.tasks.length === 0) return false;
    // Check if every task is either Submitted or Approved
    return app.tasks.every(t => t.status === 'Submitted' || t.status === 'Approved');
  };

  const calculateUnlockDate = (appliedDate) => {
    const date = new Date(appliedDate);
    date.setDate(date.getDate() + 30);
    return date;
  };

  if (loading) {
    return <div className="container fade-in" style={{ padding: '40px 0' }}><h3>Retrieving secure credentials...</h3></div>;
  }

  return (
    <div className="container fade-in">
      <div className="section-title-wrapper" style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h1 className="section-title">My Credentials</h1>
        <p style={{ color: 'var(--text-muted)' }}>Access cryptographic verified certificates and official letters.</p>
      </div>

      {(!appliedInternships || appliedInternships.length === 0) ? (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '40px', textAlign: 'center' }}>
          <Award size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3>No Credentials Available</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>Enroll in an internship to unlock credentials.</p>
          <Link to="/internships" className="btn btn-primary">Browse Internships</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {appliedInternships.map(app => {
            const completed = isCompleted(app);
            const unlockDate = calculateUnlockDate(app.appliedDate);
            const unlockDateString = unlockDate.toLocaleDateString();
            const now = new Date();
            const isTimePassed = now >= unlockDate;

            return (
              <div key={app.id} style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '4px', color: 'var(--text-main)' }}>{app.details.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>{app.details.company} — Applied: {app.appliedDate}</p>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} /> App No: {app.id}</p>
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '6px 12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-full)', fontWeight: '600' }}>
                    Credential Portal
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  
                  {/* Offer Letter Box */}
                  <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <FileText size={20} color="var(--primary)" />
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>Offer Letter</h4>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', minHeight: '40px' }}>
                      Official internship offer letter containing stipend and joining details.
                    </p>
                    {app.offerLetterUrl ? (
                      <a href={app.offerLetterUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', textDecoration: 'none' }}>
                        <Download size={16} /> Download Offer Letter
                      </a>
                    ) : (
                      <button disabled className="btn btn-outline" style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                        <Clock size={16} /> Generating (Available within 24-48 hrs)
                      </button>
                    )}
                  </div>

                  {/* Completion Certificate Box */}
                  <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <Award size={20} color="var(--accent-warning)" />
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>Completion Certificate</h4>
                    </div>
                    
                    {!completed ? (
                       <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', minHeight: '40px' }}>
                         Requires all assignment tasks to be submitted and reviewed.
                       </p>
                    ) : !app.finalSubmitted ? (
                       <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', minHeight: '40px' }}>
                         Tasks completed! Please finalize your submission in the Tasks portal.
                       </p>
                    ) : !isTimePassed ? (
                       <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', minHeight: '40px' }}>
                         Tasks completed! Verification requires 30 days from application.
                       </p>
                    ) : (
                       <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', minHeight: '40px' }}>
                         Within 24h your certificate will be sent to your registered mail, or you can download it directly from here.
                       </p>
                    )}

                    {app.certificateUrl ? (
                      <a href={app.certificateUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', textDecoration: 'none' }}>
                        <Download size={16} /> Download Certificate
                      </a>
                    ) : !completed ? (
                      <Link to={`/tasks?internshipId=${app.internshipId}`} className="btn btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                        <Lock size={16} /> Complete all tasks to unlock
                      </Link>
                    ) : !app.finalSubmitted ? (
                      <Link to={`/tasks?internshipId=${app.internshipId}`} className="btn btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', background: 'var(--accent-warning)', color: '#000' }}>
                        <Lock size={16} /> Pending Final Submission
                      </Link>
                    ) : (!isTimePassed ? (
                      <button disabled className="btn btn-outline" style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--accent-warning)', border: '1px solid var(--accent-warning)' }}>
                        <Clock size={16} /> Unlocks automatically on {unlockDateString}
                      </button>
                    ) : (
                      <button disabled className="btn btn-outline" style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                        <Clock size={16} /> Generating (Available within 24-48 hrs)
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Quiz Credentials Section */}
          {quizApplications && quizApplications.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-main)' }}>Quiz Certificates</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                {quizApplications.map(app => (
                  <div key={app.id} style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '4px', color: 'var(--text-main)' }}>{app.quizTitle}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Score: {app.score}/{app.totalQuestions} — Taken: {app.takenDate}</p>
                        <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={14} /> App No: {app.id}</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', padding: '6px 12px', backgroundColor: 'var(--accent-info-light, #e0f2fe)', color: 'var(--accent-info, #0284c7)', borderRadius: 'var(--radius-full)', fontWeight: '600' }}>
                        Quiz Assessment
                      </span>
                    </div>

                    <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <Award size={20} color="var(--primary)" />
                        <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>Quiz Certificate</h4>
                      </div>
                      
                      {!app.paymentSubmitted ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                          You have not requested your certificate yet. Go to Quizzes to download.
                        </p>
                      ) : !app.certificateUrl ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                          Your payment is pending verification. Within 24h your certificate will be sent to your registered mail, or you can download it directly from here.
                        </p>
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                          Your certificate is ready to download!
                        </p>
                      )}

                      {app.certificateUrl ? (
                        <a href={app.certificateUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', textDecoration: 'none' }}>
                          <Download size={16} /> Download Certificate
                        </a>
                      ) : app.paymentSubmitted ? (
                        <button disabled className="btn btn-outline" style={{ width: '100%', opacity: 0.7, cursor: 'not-allowed', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                          <Clock size={16} /> Generating (Available within 24 hrs)
                        </button>
                      ) : (
                        <Link to="/quiz" className="btn btn-secondary" style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                          Request Certificate
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
