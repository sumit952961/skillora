import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { Shield, Search, CheckCircle, Clock } from 'lucide-react';

export default function AdminCertificateVerification() {
  const { verifiedCertificates, updateVerifiedCertificate } = useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = verifiedCertificates.filter(vc => 
    vc.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vc.certificateNumber && vc.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container fade-in" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="section-title-wrapper" style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h1 className="section-title">Certificate Verification Records</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage certificate details, assign verification IDs, and add performance remarks.</p>
      </div>

      <div style={{ marginBottom: '24px', position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search by student name, domain, or certificate number..." 
          className="form-input"
          style={{ paddingLeft: '40px', maxWidth: '500px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <Shield size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3>No Records Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>When you upload a certificate URL for a student, a record will appear here automatically.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filtered.map(cert => {
            const isCompleted = !!(cert.certificateNumber && !cert.certificateNumber.startsWith('PENDING-') && cert.performanceRemarks);
            return (
              <div key={cert.id} style={{ 
                background: 'var(--bg-secondary)', 
                padding: '24px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
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
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. CERT-12345" 
                      defaultValue={cert.certificateNumber?.startsWith('PENDING-') ? '' : cert.certificateNumber}
                      id={`certNum-${cert.id}`}
                    />
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.85rem' }}>Performance Remarks (Publicly visible upon verification)</label>
                    <textarea 
                      className="form-input" 
                      rows="3" 
                      placeholder="e.g. Completed all tasks with excellent code quality..."
                      defaultValue={cert.performanceRemarks || ''}
                      id={`remarks-${cert.id}`}
                    ></textarea>
                  </div>
                  
                  <div>
                    <button 
                      onClick={() => {
                        const num = document.getElementById(`certNum-${cert.id}`).value;
                        const remarks = document.getElementById(`remarks-${cert.id}`).value;
                        updateVerifiedCertificate(cert.id, {
                          certificateNumber: num,
                          performanceRemarks: remarks
                        });
                        alert('Verification details saved successfully!');
                      }} 
                      className="btn btn-primary"
                    >
                      Save Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
