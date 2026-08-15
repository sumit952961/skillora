import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Key, CheckCircle, Mail, Clock } from 'lucide-react';
import { validateStrongPassword } from '../utils/validation';

export default function AdminPasswordReset() {
  const { passwordResetRequests, resetUserPassword } = useContext(AuthContext);
  const [newPasswords, setNewPasswords] = useState({});

  const handlePasswordChange = (requestId, value) => {
    setNewPasswords(prev => ({ ...prev, [requestId]: value }));
  };

  const handleReset = async (requestId, email) => {
    const pwd = newPasswords[requestId];
    if (!pwd || pwd.trim() === '') {
      alert('Please enter a valid new password.');
      return;
    }
    
    const pwdError = validateStrongPassword(pwd);
    if (pwdError) {
      alert(pwdError);
      return;
    }
    await resetUserPassword(requestId, email, pwd);
    alert('Password updated successfully!');
    setNewPasswords(prev => {
      const updated = { ...prev };
      delete updated[requestId];
      return updated;
    });
  };

  const pendingRequests = passwordResetRequests.filter(req => req.status === 'pending');

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Key size={24} /> Password Reset Requests</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {pendingRequests.length === 0 ? (
          <div style={{ background: 'var(--bg-primary)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <CheckCircle size={48} color="var(--accent-success)" style={{ marginBottom: '16px' }} />
            <h3 style={{ marginBottom: '8px' }}>All caught up!</h3>
            <p style={{ color: 'var(--text-muted)' }}>There are no pending password reset requests at this time.</p>
          </div>
        ) : (
          pendingRequests.map(req => (
            <div key={req.id} style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>{req.name}</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={16} /> {req.email}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> Requested on: {new Date(req.requestedDate).toLocaleString('en-IN')}
                  </p>
                </div>
                
                <div style={{ flex: '1 1 300px', display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>New Password</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Enter new password"
                      value={newPasswords[req.id] || ''}
                      onChange={(e) => handlePasswordChange(req.id, e.target.value)}
                    />
                  </div>
                  <button 
                    className="btn btn-primary" 
                    style={{ whiteSpace: 'nowrap', height: '42px' }}
                    onClick={() => handleReset(req.id, req.email)}
                  >
                    Set Password
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
