import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, Save, Lock, LogOut, BookOpen, Layers, Calendar, Phone, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { validateName, validateEmail, validateStrongPassword } from '../utils/validation';

export default function Profile() {
  const { user, changePassword, logout, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || '');
  const [course, setCourse] = useState(user?.course || '');
  const [branch, setBranch] = useState(user?.branch || '');
  const [semester, setSemester] = useState(user?.semester || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [skills, setSkills] = useState(user?.skills || '');

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [arenaProgress, setArenaProgress] = useState(null);

  useEffect(() => {
    const fetchArenaProgress = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/arena/progress`, {
          headers: { 'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setArenaProgress(data);
        }
      } catch (err) {
        console.error("Failed to fetch arena progress", err);
      }
    };
    fetchArenaProgress();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const nameError = validateName(name);
    if (nameError) return setError(nameError);

    const emailError = validateEmail(email);
    if (emailError) return setError(emailError);

    try {
      await updateProfile({ name, course, branch, semester, mobileNumber, skills });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmNewPassword) {
      return setPasswordError("New passwords do not match.");
    }
    const passError = validateStrongPassword(newPassword);
    if (passError) return setPasswordError(passError);

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.message || "Failed to change password.");
    }
  };

  return (
    <div className="container fade-in" style={{ maxWidth: '600px' }}>
      <div className="section-title-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 className="section-title">My Account Profile</h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Keep your academic record profile information up to date.</p>
        </div>
        <button
          onClick={() => { navigate('/'); setTimeout(() => logout(), 50); }}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)', fontSize: '0.9rem', fontWeight: '600', flexShrink: 0 }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
        {error && (
          <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 1000, background: 'var(--accent-danger-light)', color: 'var(--accent-danger)', padding: '16px 24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', fontWeight: '600', border: '1px solid var(--accent-danger)' }}>
            {error}
          </div>
        )}
        {saved && (
          <div style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 1000, background: 'var(--accent-success-light)', color: 'var(--accent-success)', padding: '16px 24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', fontWeight: '600', border: '1px solid var(--accent-success)' }}>
            ✅ Profile details updated successfully!
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> Full Name</label>
            <input type="text" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={16} /> Email Address</label>
            <input type="email" disabled className="form-input" style={{ backgroundColor: 'var(--bg-primary)' }} value={email} />
            <small style={{ color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Email cannot be changed.</small>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={16} /> Enrolled Role</label>
            <input type="text" disabled className="form-input" style={{ textTransform: 'capitalize', backgroundColor: 'var(--bg-primary)' }} value={role} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={16} /> Course / Degree</label>
              <input type="text" className="form-input" placeholder="e.g. B.Tech, BCA" value={course} onChange={(e) => setCourse(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={16} /> Branch</label>
              <input type="text" className="form-input" placeholder="e.g. Computer Science" value={branch} onChange={(e) => setBranch(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> Semester / Year</label>
              <input type="text" className="form-input" placeholder="e.g. 6th Sem" value={semester} onChange={(e) => setSemester(e.target.value)} />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={16} /> Mobile Number</label>
              <input type="tel" className="form-input" placeholder="e.g. +91 9876543210" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Award size={16} /> Key Skills</label>
            <input type="text" className="form-input" placeholder="e.g. React, Node.js, Python" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
            <Save size={18} /> Save & Change
          </button>
        </form>
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)', marginTop: '32px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>⚡</span> Arena Progress
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>💎</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{arenaProgress?.xp || 0} XP</div>
          </div>
          <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>⭐</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Level {arenaProgress?.level || 1}</div>
          </div>
          <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🔥</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{arenaProgress?.currentStreak || 0} Streak</div>
          </div>
          <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🏆</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Best: {arenaProgress?.longestStreak || 0}</div>
          </div>
          <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🎖️</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{arenaProgress?.badges || 0} Badges</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)', marginTop: '32px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={20} /> Change Password</h2>
        
        {passwordError && (
          <div style={{ position: 'fixed', top: '150px', right: '20px', zIndex: 1000, background: 'var(--accent-danger-light)', color: 'var(--accent-danger)', padding: '16px 24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', fontWeight: '600', border: '1px solid var(--accent-danger)' }}>
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div style={{ position: 'fixed', top: '150px', right: '20px', zIndex: 1000, background: 'var(--accent-success-light)', color: 'var(--accent-success)', padding: '16px 24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', fontWeight: '600', border: '1px solid var(--accent-success)' }}>
            ✅ Password changed successfully!
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" required className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" required className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" required className="form-input" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
            <Save size={18} /> Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
