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

  const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';

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

  const handlePayNow = async () => {
    try {
      const amount = settings?.processingFee || 99;
      const appId = paymentModalData.internshipId;
      const orderRes = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, receipt: `app_${appId}` })
      });
      const order = await orderRes.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummykey',
        amount: order.amount,
        currency: order.currency,
        name: "Skillzeno",
        description: "Internship Certificate Fee",
        order_id: order.id,
        handler: function (response) {
          // Temporarily store pending payment to allow PaymentSuccess to show success
          localStorage.setItem('pendingPayment', JSON.stringify({
            type: 'internship',
            appId: appId,
            internshipTitle: paymentModalData.details?.title || 'Internship Program',
            internshipDomain: paymentModalData.details?.domain || paymentModalData.details?.type || 'N/A',
            appliedDate: paymentModalData.appliedDate || 'N/A',
            verificationData: response
          }));
          window.location.href = '/payment-success';
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: {
          color: "#4f46e5"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert("Payment Failed. Reason: " + response.error.description);
      });
      rzp.open();
    } catch (err) {
      alert("Failed to initialize payment gateway.");
      console.error(err);
    }
  };

  const handleMaybeLater = () => {
    setPaymentModalData(null);
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

          {!program.offerLetterUrl ? (
            <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)', marginBottom: '24px' }}>
              <AlertCircle size={32} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Tasks are currently locked</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Tasks will be unlocked and provided here immediately after the admin issues your official Offer Letter.</p>
            </div>
          ) : (
            <>
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
                        <td data-label="Task Title" style={{ fontWeight: '600', fontSize: '0.9rem' }}>{task.title}</td>
                        <td data-label="Status">
                          <span className={`status-chip ${
                            task.status === 'Approved' ? 'status-approved' : 
                            task.status === 'Submitted' ? 'status-review' : 'status-pending'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td data-label="Submission Link">
                          {task.submissionLink ? (
                            <a href={task.submissionLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontSize: '0.85rem' }}>
                              <LinkIcon size={14} /> Repository Link
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Not Submitted</span>
                          )}
                        </td>
                        <td data-label="Instructor Feedback" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {task.feedback || 'No feedback yet'}
                        </td>
                        <td data-label="Action">
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
                      onClick={() => program.tasks.every(t => t.status === 'Approved') ? setPaymentModalData(program) : null} 
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
            </>
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
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            padding: '40px 32px',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            position: 'relative'
          }}>
            <button 
              onClick={handleMaybeLater}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#888' }}
            >
              ✕
            </button>
            <h2 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: '800', color: '#111' }}>Unlock This Certificate</h2>
            <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.5' }}>
              Unlock your verified completion certificate & premium benefits instantly.
            </p>

            <div style={{ background: '#f8f9ff', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid #eef0ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1rem', color: '#666' }}>Amount to pay</span>
                <span style={{ fontSize: '2rem', fontWeight: '800', color: '#111' }}>₹{settings?.processingFee || '499'}</span>
              </div>
              <p style={{ color: '#555', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '12px' }}>
                Verified certificate download, verified link access, and letter of recommendation.
              </p>
              <div style={{ display: 'inline-block', background: '#e8fff0', color: '#0d9f45', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>
                ✨ Premium offer just for you! ✨
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={handlePayNow}
                className="btn btn-primary" 
                style={{ flex: 1, padding: '14px', fontSize: '1rem', fontWeight: '600', borderRadius: '12px', background: '#5d5fef', border: 'none' }}
              >
                Pay Now
              </button>
              <button 
                onClick={handleMaybeLater}
                className="btn btn-outline" 
                style={{ flex: 1, padding: '14px', fontSize: '1rem', fontWeight: '600', borderRadius: '12px', borderColor: '#eee', color: '#555' }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
