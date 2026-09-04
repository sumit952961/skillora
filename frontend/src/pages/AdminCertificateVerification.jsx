import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Shield, Search, CheckCircle, Clock, Award, BookOpen } from 'lucide-react';

export default function AdminCertificateVerification() {
  const { verifiedCertificates, updateVerifiedCertificate } = useContext(DataContext);
  const { API_URL, token } = useContext(AuthContext);
  const { userRefreshTrigger } = useContext(SocketContext) || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('internship');
  const [quizCerts, setQuizCerts] = useState([]);
  const [quizLoading, setQuizLoading] = useState(true);

  // Fetch quiz applications that have a certificate uploaded
  useEffect(() => {
    const fetchQuizCerts = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/admin/quiz-applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setQuizCerts(data.filter(app => app.certificateUrl));
        }
      } catch (e) {
        console.error('Failed to fetch quiz certs', e);
      } finally {
        setQuizLoading(false);
      }
    };
    fetchQuizCerts();
  }, [token, API_URL, userRefreshTrigger]);

  // Filter internship certs
  const filteredInternship = verifiedCertificates.filter(vc =>
    vc.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vc.certificateNumber && vc.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter quiz certs
  const filteredQuiz = quizCerts.filter(app =>
    app.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.quizTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabStyle = (tab) => ({
    padding: '10px 24px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    background: activeTab === tab ? 'var(--primary)' : 'var(--bg-secondary)',
    color: activeTab === tab ? '#fff' : 'var(--text-muted)',
    boxShadow: activeTab === tab ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
  });

  return (
    <div className="container fade-in" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="section-title-wrapper" style={{ textAlign: 'left', marginBottom: '24px' }}>
        <h1 className="section-title">Certificate Verification Records</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage certificate details, assign verification IDs, and add performance remarks.</p>
      </div>

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '28px',
        background: 'var(--bg-secondary)',
        padding: '8px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        width: 'fit-content'
      }}>
        <button style={tabStyle('internship')} onClick={() => setActiveTab('internship')}>
          <Award size={16} />
          Internship Certificates
          <span style={{
            background: activeTab === 'internship' ? 'rgba(255,255,255,0.2)' : 'var(--border-color)',
            borderRadius: '20px', padding: '1px 8px', fontSize: '0.75rem', fontWeight: 700
          }}>
            {verifiedCertificates.length}
          </span>
        </button>
        <button style={tabStyle('quiz')} onClick={() => setActiveTab('quiz')}>
          <BookOpen size={16} />
          Quiz Certificates
          <span style={{
            background: activeTab === 'quiz' ? 'rgba(255,255,255,0.2)' : 'var(--border-color)',
            borderRadius: '20px', padding: '1px 8px', fontSize: '0.75rem', fontWeight: 700
          }}>
            {quizCerts.length}
          </span>
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder={activeTab === 'internship' ? "Search by student name, domain, or certificate number..." : "Search by student name or quiz title..."}
          className="form-input"
          style={{ paddingLeft: '40px', maxWidth: '500px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ── INTERNSHIP TAB ── */}
      {activeTab === 'internship' && (
        filteredInternship.length === 0 ? (
          <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <Shield size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3>No Records Found</h3>
            <p style={{ color: 'var(--text-muted)' }}>When you upload a completion certificate for a student, a record will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredInternship.map(cert => {
              const isCompleted = !!(cert.certificateNumber && !cert.certificateNumber.startsWith('PENDING-'));
              return (
                <div key={cert.id} style={{
                  background: 'var(--bg-secondary)', padding: '24px',
                  borderRadius: '8px', border: '1px solid var(--border-color)',
                  display: 'flex', flexDirection: 'column', gap: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{cert.userName}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <strong>{cert.domain}:</strong> {cert.title} — Issued: {cert.issueDate}
                      </p>
                    </div>
                    {isCompleted ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px', background: 'var(--accent-success-light, #dcfce7)', color: 'var(--accent-success, #166534)', borderRadius: '20px', fontWeight: '600' }}>
                        <CheckCircle size={14} /> Verification Ready
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px', background: 'var(--accent-warning-light)', color: 'var(--accent-warning)', borderRadius: '20px', fontWeight: '600' }}>
                        <Clock size={14} /> Action Required
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.85rem' }}>Certificate Number (Verification ID)</label>
                      <input
                        type="text" className="form-input"
                        placeholder="e.g. CERT-12345"
                        defaultValue={cert.certificateNumber?.startsWith('PENDING-') ? '' : cert.certificateNumber}
                        id={`certNum-${cert.id}`}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.85rem' }}>Performance Remarks (Publicly visible upon verification)</label>
                      <textarea
                        className="form-input" rows="3"
                        placeholder="e.g. Completed all tasks with excellent code quality..."
                        defaultValue={cert.performanceRemarks || ''}
                        id={`remarks-${cert.id}`}
                      ></textarea>
                    </div>
                    <div>
                      <button
                        onClick={async () => {
                          const num = document.getElementById(`certNum-${cert.id}`).value;
                          const remarks = document.getElementById(`remarks-${cert.id}`).value;
                          const success = await updateVerifiedCertificate(cert.id, { certificateNumber: num, performanceRemarks: remarks });
                          if (success) alert('Verification details saved successfully!');
                        }}
                        className="btn btn-primary"
                      >Save Details</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── QUIZ TAB ── */}
      {activeTab === 'quiz' && (
        quizLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                borderRadius: '8px', padding: '24px', animation: 'pulse 1.5s ease-in-out infinite'
              }}>
                <div style={{ height: '18px', width: '35%', background: 'var(--border-color)', borderRadius: '6px', marginBottom: '10px' }} />
                <div style={{ height: '14px', width: '20%', background: 'var(--border-color)', borderRadius: '6px', opacity: 0.6 }} />
                <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
              </div>
            ))}
          </div>
        ) : filteredQuiz.length === 0 ? (
          <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3>No Quiz Certificates Found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Upload a certificate in Quiz Certificates section to see records here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredQuiz.map(app => (
              <div key={app.id} style={{
                background: 'var(--bg-secondary)', padding: '24px',
                borderRadius: '8px', border: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column', gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{app.studentName}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <strong>Quiz:</strong> {app.quizTitle} &nbsp;|&nbsp; <strong>Score:</strong> {app.score ?? 'N/A'}%
                    </p>
                    {app.studentEmail && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{app.studentEmail}</p>
                    )}
                  </div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontSize: '0.8rem', padding: '6px 12px',
                    background: 'var(--accent-success-light, #dcfce7)',
                    color: 'var(--accent-success, #166534)',
                    borderRadius: '20px', fontWeight: '600'
                  }}>
                    <CheckCircle size={14} /> Certificate Uploaded
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Certificate URL</label>
                  <a href={app.certificateUrl} target="_blank" rel="noreferrer"
                    style={{ color: 'var(--primary)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                    {app.certificateUrl}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
