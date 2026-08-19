import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { ShieldCheck, Search, AlertCircle, Calendar, User, Briefcase, Award, CheckCircle, FileText } from 'lucide-react';
import { validateCertificateID } from '../utils/validation';
import SEO from '../components/SEO';

export default function Verify() {
  const [hash, setHash] = useState('');
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifiedCertificates } = useContext(DataContext);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!hash.trim()) return;

    const idError = validateCertificateID(hash.trim());
    if (idError) {
      setError(idError);
      return;
    }

    setLoading(true);
    setError('');
    setCertData(null);

    // Simulate network delay
    setTimeout(() => {
      const found = verifiedCertificates.find(
        c => c.certificateNumber && c.certificateNumber.toUpperCase() === hash.trim().toUpperCase()
      );

      if (found) {
        setCertData({
          id: found.id,
          userName: found.userName,
          domain: found.domain,
          title: found.title,
          issueDate: found.issueDate,
          verificationHash: found.certificateNumber,
          performanceRemarks: found.performanceRemarks
        });
      } else {
        setError('Verification failed. No matching certificate found with that ID.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <>
    <SEO 
      title="Certificate Verification | Skillzeno" 
      description="Verify the authenticity of Skillzeno certificates online. Secure cryptographic verification for employers and students." 
      canonical="/verify"
    />
    <div className="container fade-in">
      <div className="section-title-wrapper">

        <h1 className="section-title">Certificate Verification</h1>
        <p className="section-subtitle">Instantly verify the authenticity of credentials issued by Skillzeno using the unique Verification ID.</p>
      </div>

      <form onSubmit={handleSearch} className="search-box-wrapper">
        <label>Certificate Hash / ID</label>
        <input 
          type="text" 
          required 
          className="form-input" 
          placeholder="Enter Certificate ID" 
          value={hash} 
          onChange={(e) => setHash(e.target.value)} 
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>
          <Search size={18} /> Verify
        </button>
      </form>



      {loading && <div style={{ textAlign: 'center' }}><h3>Verifying security records...</h3></div>}

      {error && (
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          background: 'var(--accent-danger-light)',
          color: 'var(--accent-danger)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '500'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {certData && (
        <div className="certificate-result-card fade-in">
          <div className="certificate-header-seal">
            <ShieldCheck size={56} style={{ color: 'var(--accent-success)' }} />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-success)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            ✓ Verified Certificate
          </span>
          <h2 className="certificate-title-main" style={{ marginTop: '8px' }}>
            Certificate of {certData.domain === 'Quiz' ? 'Assessment Completion' : 'Internship Completion'}
          </h2>
          
          <p className="certificate-body-text">
            This certifies that <strong>{certData.userName}</strong> has successfully completed all tasks and requirements for the <strong>{certData.title}</strong> program.
          </p>

          <div className="certificate-meta-grid">
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Recipient Name</span>
              <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> {certData.userName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Program Title</span>
              <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={16} /> {certData.title}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Issue Date</span>
              <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {certData.issueDate}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Certificate ID</span>
              <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}><Award size={16} /> {certData.verificationHash}</strong>
            </div>
            {certData.applicationId && (
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Application Number</span>
                <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={16} /> {certData.applicationId}</strong>
              </div>
            )}
          </div>

          {certData.performanceRemarks && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                <FileText size={16} color="var(--primary)" /> Performance Remarks
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                "{certData.performanceRemarks}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
