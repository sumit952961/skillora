import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

import { validateEmail } from '../utils/validation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState({ text: '', type: '' });
  const { login, requestPasswordReset } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailError = validateEmail(email);
    if (emailError) return setError(emailError);

    try {
      const res = await login(email, password);
      if (res.success) {
        const pendingId = localStorage.getItem('pendingApplicationId');
        const pendingQuizId = localStorage.getItem('pendingQuizId');
        if (pendingId) {
          localStorage.removeItem('pendingApplicationId');
          navigate(`/internships/${pendingId}?autoOpenApply=true`);
        } else if (pendingQuizId) {
          navigate('/quiz');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMessage({ text: '', type: '' });
    
    const emailError = validateEmail(forgotEmail);
    if (emailError) {
      return setForgotMessage({ text: emailError, type: 'error' });
    }
    
    try {
      await requestPasswordReset(forgotEmail);
      setForgotMessage({ text: 'We have received your request. A new password will be sent to your registered email address within 24 hours.', type: 'success' });
      setForgotEmail('');
    } catch (err) {
      setForgotMessage({ text: err.message || 'Failed to submit request.', type: 'error' });
    }
  };

  return (
    <div className="auth-wrapper fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your student profile</p>
        </div>

        {error && (
          <div style={{ background: 'var(--accent-danger-light)', color: 'var(--accent-danger)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.9rem', fontWeight: '500' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required className="form-input" placeholder="e.g. john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Password</label>
            <input type={showPassword ? "text" : "password"} required className="form-input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '38px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
            <button type="button" onClick={() => setShowForgotModal(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', padding: 0 }}>Forgot Password?</button>
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Create an account</Link>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }}>
            <LogIn size={18} /> Sign In
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Register</Link>
        </p>
      </div>

      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in" style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Reset Password</h2>
              <button onClick={() => { setShowForgotModal(false); setForgotMessage({ text: '', type: '' }); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>&times;</span>
              </button>
            </div>
            
            {forgotMessage.text && (
              <div style={{ 
                background: forgotMessage.type === 'success' ? 'var(--accent-success-light)' : 'var(--accent-danger-light)', 
                color: forgotMessage.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)', 
                padding: '10px 14px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.9rem', lineHeight: '1.4' 
              }}>
                {forgotMessage.text}
              </div>
            )}
            
            <form onSubmit={handleForgotSubmit}>
              <div className="form-group">
                <label>Registered Email</label>
                <input type="email" required className="form-input" placeholder="Enter your email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Request</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
