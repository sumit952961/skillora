import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { SocketContext } from '../context/SocketContext';
import { Upload, CheckCircle, Search, Trophy, ShieldCheck } from 'lucide-react';

export default function AdminQuizCertificates() {
  const { API_URL, token } = useContext(AuthContext);
  const { addVerifiedCertificate, verifiedCertificates } = useContext(DataContext);
  const { userRefreshTrigger } = useContext(SocketContext) || {};
  const [users, setUsers] = useState({});
  const [allAppsList, setAllAppsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const appsRes = await fetch(`${API_URL}/admin/quiz-applications`, { headers: { Authorization: `Bearer ${token}` } });
      
      if (appsRes.ok) {
        const fetchedApps = await appsRes.json();
        
        const appsWithUsers = fetchedApps.map(app => ({
          ...app,
          studentName: app.studentName || 'Unknown Student',
          studentEmail: app.studentEmail || 'N/A',
        }));
        
        setAllAppsList(appsWithUsers);
      }
    } catch (e) {
      console.error("Failed to fetch admin data", e);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token, userRefreshTrigger]);

  const filteredApps = allAppsList.filter(app => 
    app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCertSubmit = async (appId, updates, app) => {
    try {
      const res = await fetch(`${API_URL}/admin/quiz-applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        alert('Certificate updated successfully!');
        // fetchData() is removed because WebSocket will trigger it automatically
        
        // Add to verified certificates if not exists
        if (updates.certificateUrl) {
          const exists = verifiedCertificates.find(vc => vc.applicationId === appId);
          if (!exists) {
            addVerifiedCertificate({
              applicationId: appId,
              userName: app.studentName,
              domain: 'Assessment',
              title: app.quizTitle,
              issueDate: new Date().toISOString().split('T')[0],
              certificateNumber: `PENDING-${appId}`,
              performanceRemarks: `Score: ${app.score}/${app.totalQuestions}`
            });
          }
        }
      } else {
        alert('Failed to update');
      }
    } catch (e) {
      alert("Failed to update certificates");
    }
  };

  return (
    <div className="container fade-in">
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Quiz Certificates</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review quiz payments and upload completion certificates.</p>
        </div>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search by student name, email, or quiz..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      {filteredApps.length === 0 ? (
        <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <Trophy size={48} color="var(--primary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-muted)' }}>No quiz applications found.</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '24px' }}>
          {filteredApps.map(app => (
            <div key={app.id} style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
                
                {/* Student Info */}
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {app.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0' }}>{app.studentName}</h3>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{app.studentEmail}</p>
                    </div>
                  </div>
                  
                  <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ marginBottom: '8px', color: 'var(--primary)' }}>{app.quizTitle}</h4>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>Score: <strong>{app.score} / {app.totalQuestions}</strong></p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Taken on: {new Date(app.createdAt || app.takenDate || Date.now()).toLocaleDateString()}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={12} /> App No: {app.id}</p>
                  </div>
                </div>

                {/* Payment & Certificate Details */}
                <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Payment Verification
                      {app.paymentSubmitted ? <CheckCircle size={16} color="var(--accent-success)" /> : null}
                    </h4>
                    
                    {app.paymentSubmitted ? (
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}><strong>Method:</strong> {app.paymentDetails?.method || 'Razorpay'}</p>
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}><strong>Status:</strong> {app.paymentDetails?.status || 'Paid / Redirected'}</p>
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}><strong>Date:</strong> {app.paymentDetails?.paymentDate}</p>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Student has not submitted payment details yet.</p>
                    )}
                  </div>

                  <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Upload size={18} color="var(--primary)" /> Completion Certificate
                    </h4>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Certificate URL</span>
                        {app.certificateUrl && <a href={app.certificateUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>View Uploaded ↗</a>}
                      </label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <input 
                          type="url" 
                          className="form-input" 
                          placeholder={app.paymentSubmitted ? "https://drive.google.com/..." : "Requires Payment Verify"}
                          defaultValue={app.certificateUrl || ''} 
                          id={`cert-${app.id}`}
                          disabled={!app.paymentSubmitted}
                          style={{ opacity: !app.paymentSubmitted ? 0.6 : 1 }}
                        />
                        <button 
                          disabled={!app.paymentSubmitted}
                          onClick={async (e) => {
                            const btn = e.currentTarget;
                            const val = document.getElementById(`cert-${app.id}`).value;
                            if (val && !/^https?:\/\/.+$/.test(val)) {
                              alert("Please enter a valid URL.");
                              return;
                            }
                            const origText = btn.innerText;
                            btn.disabled = true;
                            btn.innerText = "Sending...";
                            await handleCertSubmit(app.id, { certificateUrl: val }, app);
                            btn.disabled = false;
                            btn.innerText = origText;
                          }} 
                          className="btn btn-outline" 
                          style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
                        >
                          {app.certificateUrl ? '🔄 Update Link' : 'Save & Send Email'}
                        </button>
                      </div>
                      {!app.paymentSubmitted && <span style={{ fontSize: '0.75rem', color: 'var(--accent-warning)', marginTop: '4px' }}>Payment submission is required to unlock this field.</span>}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
