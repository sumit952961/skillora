import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

import { validateEmail, validateStrongPassword } from '../utils/validation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [forgotMessage, setForgotMessage] = useState({ text: '', type: '' });
  const { login, sendOtp, verifyOtp, resetPasswordWithOtp } = useContext(AuthContext);
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

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setForgotMessage({ text: '', type: '' });
    
    const emailError = validateEmail(forgotEmail);
    if (emailError) return setForgotMessage({ text: emailError, type: 'error' });
    
    try {
      await sendOtp(forgotEmail);
      setForgotMessage({ text: 'OTP sent to your email. It expires in 10 minutes.', type: 'success' });
      setForgotStep(2);
      setResendTimer(60);
    } catch (err) {
      setForgotMessage({ text: err.message || 'Failed to send OTP.', type: 'error' });
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotMessage({ text: '', type: '' });
    if (otp.length !== 6) return setForgotMessage({ text: 'Enter a valid 6-digit OTP', type: 'error' });
    
    try {
      await verifyOtp(forgotEmail, otp);
      setForgotMessage({ text: 'OTP verified. Please set a new password.', type: 'success' });
      setForgotStep(3);
    } catch (err) {
      setForgotMessage({ text: err.message || 'Invalid OTP.', type: 'error' });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotMessage({ text: '', type: '' });
    
    if (newPassword !== confirmPassword) {
      return setForgotMessage({ text: 'Passwords do not match.', type: 'error' });
    }
    const passError = validateStrongPassword(newPassword);
    if (passError) return setForgotMessage({ text: passError, type: 'error' });

    try {
      await resetPasswordWithOtp(forgotEmail, otp, newPassword);
      setForgotMessage({ text: '', type: '' });
      setForgotStep(4);
    } catch (err) {
      setForgotMessage({ text: err.message || 'Failed to reset password.', type: 'error' });
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
              <button onClick={() => { setShowForgotModal(false); setForgotMessage({ text: '', type: '' }); setForgotStep(1); setOtp(''); setNewPassword(''); setConfirmPassword(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
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
            
            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label>Registered Email</label>
                  <input type="email" required className="form-input" placeholder="Enter your email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send OTP</button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <div className="form-group">
                  <label>Enter 6-digit OTP</label>
                  <input type="text" required maxLength="6" className="form-input" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Verify OTP</button>
                <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
                  <button type="button" onClick={() => handleSendOtp(null)} disabled={resendTimer > 0} style={{ background: 'none', border: 'none', color: resendTimer > 0 ? 'var(--text-muted)' : 'var(--primary)', fontWeight: '600', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer' }}>
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" required className="form-input" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input type="password" required className="form-input" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Reset Password</button>
              </form>
            )}

            {forgotStep === 4 && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '1.4rem' }}>Password Reset Successful!</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
                  Your password has been updated successfully. You can now login using your new password.
                </p>
                <button 
                  onClick={() => { setShowForgotModal(false); setForgotStep(1); setOtp(''); setNewPassword(''); setConfirmPassword(''); }} 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                >
                  Login Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
