import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { CheckCircle, AlertCircle, Clock, Link as LinkIcon, Send } from 'lucide-react';
import { sendFinalSubmitEmail } from '../utils/emailService';
import { validateURL } from '../utils/validation';

export default function Tasks() {
  const { token, user, appliedInternships, submitTask, processFinalSubmit } = useContext(AuthContext);
  const { settings } = useContext(DataContext);
  const [searchParams] = useSearchParams();
  const filterInternshipId = searchParams.get('internshipId');

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLink, setSubmitLink] = useState('');
  const [activeTask, setActiveTask] = useState(null);
  const [paymentModalData, setPaymentModalData] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // If a filter is applied via URL, only show that specific internship
    if (filterInternshipId) {
      setInternships(appliedInternships.filter(app => app.details.id === filterInternshipId || app.internshipId === filterInternshipId));
    } else {
      // Otherwise, show all of them grouped by default
      setInternships(appliedInternships);
    }
    setLoading(false);
  }, [appliedInternships, filterInternshipId]);

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!activeTask || !submitLink.trim()) return;
    
    const urlError = validateURL(submitLink);
    if (urlError) {
      alert(urlError);
      return;
    }

    try {
      // Use the global context function to submit so state is consistent everywhere
      submitTask(activeTask.internshipId, activeTask.taskId, submitLink);
      alert('Task submitted successfully!');
      setSubmitLink('');
      setActiveTask(null);
    } catch (err) {
      alert('Failed to submit task.');
    }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPaymentScreenshot(file);
    const reader = new FileReader();
    reader.onloadend = () => setPaymentScreenshotPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFinalSubmitPayment = (e) => {
    e.preventDefault();
    
    // Save payment details to context
    processFinalSubmit(paymentModalData, {
      transactionId: transactionId,
      paymentDate: paymentDate,
      screenshot: paymentScreenshotPreview || null,
      submittedOn: new Date().toISOString()
    });

    const internship = appliedInternships.find(
      app => app.details.id === paymentModalData || app.internshipId === paymentModalData
    );

    // Send email with details but NO photo
    sendFinalSubmitEmail({
      studentName: user?.name || 'N/A',
      studentEmail: user?.email || 'N/A',
      internshipTitle: internship?.details?.title || 'N/A',
      internshipDomain: internship?.details?.domain || internship?.details?.type || 'N/A',
      appliedDate: internship?.appliedDate || 'N/A',
      transactionId: transactionId,
      paymentDate: paymentDate,
      paymentScreenshotBase64: null // Pass null to avoid large base64 payload
    });

    setPaymentModalData(null);
    setTransactionId('');
    setPaymentDate('');
    setPaymentScreenshot(null);
    setPaymentScreenshotPreview(null);
    alert('Final Submission Complete! Details have been sent to Admin for verification. Certificate will be available soon.');
  };

  if (loading) {
    return <div className="container"><h3>Fetching active deliverables...</h3></div>;
  }

  return (
    <div className="container fade-in">
      <div className="section-title-wrapper" style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h1 className="section-title">Assignment Deliverables</h1>
        <p style={{ color: 'var(--text-muted)' }}>Submit project repository links and check evaluation feedback comments.</p>
      </div>

      {internships.map(program => (
        <div key={program.id} style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--primary)' }}>
            {program.details?.title} - <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{program.details?.company}</span>
          </h3>

          <div className="tasks-table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Status</th>
                  <th>Submission Link</th>
                  <th>Instructor Feedback</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {program.tasks?.map(task => (
                  <tr key={task.id}>
                    <td style={{ fontWeight: '600', fontSize: '0.9rem' }}>{task.title}</td>
                    <td>
                      <span className={`status-chip ${
                        task.status === 'Approved' ? 'status-approved' : 
                        task.status === 'Submitted' ? 'status-review' : 'status-pending'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      {task.submissionLink ? (
                        <a href={task.submissionLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '0.85rem' }}>
                          <LinkIcon size={14} /> Repository Link
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Not Submitted</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {task.feedback || 'No feedback yet'}
                    </td>
                    <td>
                      {task.status !== 'Approved' && task.status !== 'Submitted' ? (
                        <button 
                          onClick={() => setActiveTask({ internshipId: program.internshipId, taskId: task.id, title: task.title })} 
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          Submit Task
                        </button>
                      ) : (
                        <span style={{ color: 'var(--accent-success)', fontSize: '0.8rem', fontWeight: '600' }}>Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Final Submit Banner */}
          {program.tasks && program.tasks.length > 0 && program.tasks.every(t => t.status === 'Submitted' || t.status === 'Approved') && (
            <div style={{
              marginTop: '16px',
              padding: '20px',
              background: program.finalSubmitted ? 'var(--accent-success-light)' : 'var(--bg-secondary)',
              border: `1px solid ${program.finalSubmitted ? 'var(--accent-success)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ fontSize: '1rem', color: program.finalSubmitted ? 'var(--accent-success)' : 'var(--text-main)', marginBottom: '4px' }}>
                  {program.finalSubmitted ? 'Final Submission Complete' : 'All Tasks Submitted!'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {program.finalSubmitted 
                    ? 'Your submission has been finalized. After completion period, your certificate will be sent to your respective mail and uploaded to the site.' 
                    : (program.tasks.every(t => t.status === 'Approved') 
                        ? 'Admin has approved all your tasks. You can now proceed with final submission.' 
                        : 'Admin is reviewing your tasks. Final submission will unlock after all tasks are approved.')}
                </p>
              </div>
              {!program.finalSubmitted && (
                <button 
                  onClick={() => program.tasks.every(t => t.status === 'Approved') ? setPaymentModalData(program.internshipId) : null} 
                  className={`btn ${program.tasks.every(t => t.status === 'Approved') ? 'btn-primary' : 'btn-outline'}`}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    opacity: program.tasks.every(t => t.status === 'Approved') ? 1 : 0.5,
                    cursor: program.tasks.every(t => t.status === 'Approved') ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!program.tasks.every(t => t.status === 'Approved')}
                >
                  <CheckCircle size={16} /> Final Submit
                </button>
              )}
            </div>
          )}

        </div>
      ))}

      {/* Submission Modal Dialog */}
      {activeTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          zIndex: 1000,
          overflowY: 'auto',
          padding: '80px 20px 40px'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '32px',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '500px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ marginBottom: '8px' }}>Submit Deliverable</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Submit public repository link for: <strong>{activeTask.title}</strong>
            </p>

            <form onSubmit={handleSubmitTask}>
              <div className="form-group">
                <label>GitHub/Deployment Link</label>
                <input 
                  type="url" 
                  required 
                  className="form-input" 
                  placeholder="https://github.com/your-username/repo-name" 
                  value={submitLink} 
                  onChange={(e) => setSubmitLink(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" onClick={() => setActiveTask(null)} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Submit <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal Dialog */}
      {paymentModalData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          zIndex: 1000,
          overflowY: 'auto',
          padding: '80px 20px 40px'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '32px',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '500px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ marginBottom: '8px' }}>Final Submit & Verification</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Scan the QR code or use the UPI ID below to pay the processing fee.
            </p>

            <div style={{ textAlign: 'center', marginBottom: '24px', background: 'var(--bg-primary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              {/* Conditional QR Code */}
              {settings?.qrCodeImage ? (
                <div style={{ width: '150px', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={settings.qrCodeImage} alt="QR Code" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #ccc' }} />
                </div>
              ) : (
                <div style={{ width: '150px', height: '150px', margin: '0 auto 16px auto', background: '#fff', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                  <span style={{ color: '#000', fontWeight: 'bold' }}>QR CODE</span>
                </div>
              )}
              <p style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>UPI ID: {settings?.upiId || 'skillora@upi'}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Processing Fee: ₹{settings?.processingFee || '499.00'}</p>
            </div>

            <form onSubmit={handleFinalSubmitPayment}>
              <div className="form-group">
                <label>Transaction ID / UTR</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  placeholder="e.g. 123456789012"
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Name</label>
                  <input type="text" required className="form-input" placeholder="Your Name" defaultValue={user?.name || ''} />
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Date of Payment</label>
                  <input type="date" required className="form-input" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Payment Screenshot <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Required)</span></label>
                <input 
                  type="file" 
                  required
                  accept="image/*"
                  className="form-input"
                  style={{ padding: '8px' }}
                  onChange={handleScreenshotChange}
                />
                {paymentScreenshotPreview && (
                  <img src={paymentScreenshotPreview} alt="Payment Screenshot" style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', marginTop: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setPaymentModalData(null); setPaymentScreenshotPreview(null); }} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={14} /> Submit Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
