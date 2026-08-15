import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { Upload, CheckCircle, Search, Trophy, ShieldCheck } from 'lucide-react';

export default function AdminQuizCertificates() {
  const { allQuizApplications, updateStudentQuizApplication } = useContext(AuthContext);
  const { quizzes, addVerifiedCertificate, verifiedCertificates } = useContext(DataContext);
  const [users, setUsers] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadUsers = () => {
      const savedUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const userMap = {};
      savedUsers.forEach(u => {
        userMap[u.id] = { name: u.name, email: u.email };
      });
      setUsers(userMap);
    };
    
    loadUsers();

    const handleStorageChange = (e) => {
      if (e.key === 'mockUsers') {
        loadUsers();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const allAppsList = [];
  Object.keys(allQuizApplications).forEach(userId => {
    const apps = allQuizApplications[userId];
    if (Array.isArray(apps)) {
      apps.forEach(app => {
        allAppsList.push({
          userId,
          studentName: users[userId]?.name || 'Unknown Student',
          studentEmail: users[userId]?.email || 'N/A',
          ...app
        });
      });
    }
  });

  allAppsList.sort((a, b) => new Date(b.takenDate) - new Date(a.takenDate));

  const filteredApps = allAppsList.filter(app => 
    app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div key={`${app.userId}-${app.id}`} style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
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
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Taken on: {app.takenDate}</p>
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
                      <Upload size={18} color="var(--primary)" /> Quiz Certificate URL
                    </h4>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input 
                        type="url" 
                        className="form-input" 
                        placeholder={app.paymentSubmitted ? "https://drive.google.com/..." : "Requires Payment First"}
                        defaultValue={app.certificateUrl || ''} 
                        disabled={!app.paymentSubmitted}
                        id={`cert-${app.id}`}
                        style={{ opacity: !app.paymentSubmitted ? 0.6 : 1 }}
                      />
                      <button 
                        disabled={!app.paymentSubmitted}
                        onClick={() => {
                          const val = document.getElementById(`cert-${app.id}`).value;
                          if (val && !/^https?:\/\/.+$/.test(val)) {
                            alert("Please enter a valid URL.");
                            return;
                          }
                          updateStudentQuizApplication(app.userId, app.id, { certificateUrl: val });
                          
                          if (val) {
                            const exists = verifiedCertificates.find(vc => vc.applicationId === app.id);
                            if (!exists) {
                              addVerifiedCertificate({
                                applicationId: app.id,
                                userName: users[app.userId]?.name || 'Unknown Student',
                                domain: 'Quiz',
                                title: app.quizTitle || 'Quiz Assessment',
                                issueDate: new Date().toISOString().split('T')[0],
                                certificateNumber: '',
                                performanceRemarks: ''
                              });
                            }
                          }

                          alert('Certificate updated!');
                        }} 
                        className="btn btn-outline" 
                        style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
                      >
                        Save
                      </button>
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
