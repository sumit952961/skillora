import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { FileText, CheckCircle2, Upload, X, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminApplications() {
  const { API_URL, token } = useContext(AuthContext);
  const { addVerifiedCertificate, verifiedCertificates } = useContext(DataContext);
  const [users, setUsers] = useState({});
  const [allAppsList, setAllAppsList] = useState([]);
  
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [reviewModalData, setReviewModalData] = useState(null); // { appId, task, feedbackText }

  const fetchData = async () => {
    try {
      const appsRes = await fetch(`${API_URL}/admin/applications`, { headers: { Authorization: `Bearer ${token}` } });
      
      if (appsRes.ok) {
        const fetchedApps = await appsRes.json();
        
        const appsWithUsers = fetchedApps.map(app => ({
          ...app,
          studentName: app.userId?.name || 'Unknown Student',
          studentEmail: app.userId?.email || 'N/A',
        })).sort((a, b) => b.id.localeCompare(a.id));
        
        setAllAppsList(appsWithUsers);
      }
    } catch (e) {
      console.error("Failed to fetch admin data", e);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleCertSubmit = async (appId, updates) => {
    try {
      const res = await fetch(`${API_URL}/admin/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        alert('Application updated successfully!');
        fetchData();
      } else {
        alert('Failed to update');
      }
    } catch (e) {
      alert("Failed to update certificates");
    }
  };

  const handleTaskReview = async (status) => {
    if (!reviewModalData) return;
    try {
      const res = await fetch(`${API_URL}/admin/tasks/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          applicationId: reviewModalData.appId,
          taskId: reviewModalData.task.id,
          status,
          feedback: reviewModalData.feedbackText
        })
      });
      if (res.ok) {
        alert(`Task has been ${status.toLowerCase()}!`);
        setReviewModalData(null);
        fetchData();
      } else {
        alert('Failed to verify task');
      }
    } catch (e) {
      alert("Failed to verify task");
    }
  };

  return (
    <div className="container fade-in">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Manage Applications</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track student progress and upload completion certificates.</p>
      </div>

      {allAppsList.length === 0 ? (
        <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'var(--text-muted)' }}>No student applications found.</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {allAppsList.map(app => {
            const completedTasks = app.tasks ? app.tasks.filter(t => t.status === 'Submitted' || t.status === 'Approved').length : 0;
            const totalTasks = app.tasks ? app.tasks.length : 0;

            return (
              <div key={app.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                
                {/* Accordion Header */}
                <div 
                  onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                  style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expandedAppId === app.id ? 'var(--bg-primary)' : 'transparent' }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{app.studentName}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{app.studentEmail}</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', margin: 0 }}>{app.details?.title}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Applied: {app.appliedDate}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={12} /> App No: {app.id}</p>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} color={completedTasks === totalTasks && totalTasks > 0 ? "var(--accent-success)" : "var(--text-muted)"} />
                      <span style={{ fontSize: '0.85rem' }}>{completedTasks}/{totalTasks}</span>
                    </div>
                    {app.finalSubmitted && (
                      <span style={{ fontSize: '0.75rem', background: 'var(--accent-success-light)', color: 'var(--accent-success)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>Final</span>
                    )}
                    {app.certificateUrl && (
                      <span style={{ fontSize: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Docs
                      </span>
                    )}
                    {expandedAppId === app.id ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedAppId === app.id && (
                  <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Tasks Section */}
                    <div>
                      <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} color="var(--primary)" /> Tasks & Submissions
                      </h4>
                      {totalTasks === 0 ? (
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No tasks available for this internship.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {app.tasks.map(t => (
                            <div key={t.id} style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong>{t.title}</strong>
                                <span style={{ 
                                  fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold',
                                  background: t.status === 'Approved' ? 'var(--accent-success-light)' : (t.status === 'Submitted' ? 'var(--accent-warning-light)' : (t.status === 'Rejected' ? 'var(--accent-danger-light)' : 'var(--bg-secondary)')),
                                  color: t.status === 'Approved' ? 'var(--accent-success)' : (t.status === 'Submitted' ? 'var(--accent-warning)' : (t.status === 'Rejected' ? 'var(--accent-danger)' : 'var(--text-muted)'))
                                }}>
                                  {t.status === 'Submitted' ? 'Under Review' : (t.status || 'Pending')}
                                </span>
                              </div>
                              {t.submissionLink && (
                                <div style={{ fontSize: '0.85rem' }}>
                                  <strong>Link:</strong> <a href={t.submissionLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{t.submissionLink}</a>
                                </div>
                              )}
                              {t.feedback && (
                                <div style={{ fontSize: '0.85rem', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '4px', fontStyle: 'italic' }}>
                                  <strong>Feedback:</strong> {t.feedback}
                                </div>
                              )}
                              {t.status === 'Submitted' && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                  <button onClick={() => setReviewModalData({ appId: app.id, task: t, feedbackText: 'Good job!' })} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                    Review Task
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Final Submission Details */}
                    {app.finalSubmitted && (
                      <div>
                        <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ShieldCheck size={18} color="var(--accent-success)" /> Final Submission & Payment
                        </h4>
                        <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}><strong>Method:</strong> {app.paymentDetails?.method || 'Razorpay'}</p>
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}><strong>Status:</strong> {app.paymentDetails?.status || 'Paid / Redirected'}</p>
                          <p style={{ margin: '0', fontSize: '0.9rem' }}><strong>Payment Date:</strong> {app.paymentDetails?.paymentDate || app.paymentDetails?.submittedOn ? new Date(app.paymentDetails.submittedOn).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                    )}

                    {/* Inline Certificate Management */}
                    <div>
                      <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Upload size={18} color="var(--primary)" /> Manage Documents
                      </h4>
                      <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.85rem' }}>Offer Letter URL</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <input 
                                type="url" 
                                className="form-input" 
                                placeholder="https://drive.google.com/..." 
                                defaultValue={app.offerLetterUrl || ''} 
                                id={`offer-${app.id}`}
                              />
                              <button onClick={() => {
                                const val = document.getElementById(`offer-${app.id}`).value;
                                if (val && !/^https?:\/\/.+$/.test(val)) {
                                  alert("Please enter a valid URL.");
                                  return;
                                }
                                handleCertSubmit(app.id, { offerLetterUrl: val });
                              }} className="btn btn-outline" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>Save</button>
                            </div>
                          </div>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.85rem' }}>Completion Certificate URL</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                              <input 
                                type="url" 
                                className="form-input" 
                                placeholder={app.finalSubmitted ? "https://drive.google.com/..." : "Requires Final Submit"}
                                defaultValue={app.certificateUrl || ''} 
                                disabled={!app.finalSubmitted}
                                id={`cert-${app.id}`}
                                style={{ opacity: !app.finalSubmitted ? 0.6 : 1 }}
                              />
                              <button 
                                disabled={!app.finalSubmitted}
                                onClick={() => {
                                  const val = document.getElementById(`cert-${app.id}`).value;
                                  if (val && !/^https?:\/\/.+$/.test(val)) {
                                    alert("Please enter a valid URL.");
                                    return;
                                  }
                                  handleCertSubmit(app.id, { certificateUrl: val });
                                  
                                  // Add to verified certificates if not exists
                                  if (val) {
                                    const exists = verifiedCertificates.find(vc => vc.applicationId === app.id);
                                    if (!exists) {
                                      addVerifiedCertificate({
                                        applicationId: app.id,
                                        userName: app.studentName,
                                        domain: 'Internship',
                                        title: app.details?.title || 'Internship Program',
                                        issueDate: new Date().toISOString().split('T')[0],
                                        certificateNumber: '',
                                        performanceRemarks: ''
                                      });
                                    }
                                  }
                                }} className="btn btn-outline" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>Save</button>
                            </div>
                            {!app.finalSubmitted && <span style={{ fontSize: '0.75rem', color: 'var(--accent-warning)', marginTop: '4px' }}>Final submit is required to unlock this field.</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Task Review Modal */}
      {reviewModalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '80px 20px 40px' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setReviewModalData(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '8px' }}>Review Task</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              <strong>{reviewModalData.task.title}</strong>
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>Student Submission Link:</label>
              <a href={reviewModalData.task.submissionLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>
                {reviewModalData.task.submissionLink}
              </a>
            </div>

            <div className="form-group">
              <label>Feedback (visible to student)</label>
              <textarea 
                className="form-input" 
                rows="3"
                value={reviewModalData.feedbackText}
                onChange={(e) => setReviewModalData({ ...reviewModalData, feedbackText: e.target.value })}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button type="button" onClick={() => handleTaskReview('Rejected')} className="btn btn-outline" style={{ padding: '10px 20px', color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)' }}>Reject & Ask Retry</button>
              <button type="button" onClick={() => handleTaskReview('Approved')} className="btn btn-primary" style={{ padding: '10px 20px', background: 'var(--accent-success)' }}>Verify & Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
