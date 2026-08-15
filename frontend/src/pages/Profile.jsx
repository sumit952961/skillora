import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Shield, Save } from 'lucide-react';
import { validateName, validateEmail } from '../utils/validation';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setError('');

    const nameError = validateName(name);
    if (nameError) return setError(nameError);

    const emailError = validateEmail(email);
    if (emailError) return setError(emailError);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="container fade-in" style={{ maxWidth: '600px' }}>
      <div className="section-title-wrapper" style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h1 className="section-title">My Account Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>Keep your academic record profile information up to date.</p>
      </div>

      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
        {error && (
          <div style={{ background: 'var(--accent-danger-light)', color: 'var(--accent-danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontWeight: '600' }}>
            {error}
          </div>
        )}
        {saved && (
          <div style={{ background: 'var(--accent-success-light)', color: 'var(--accent-success)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontWeight: '600' }}>
            Profile details updated successfully!
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} /> Full Name</label>
            <input type="text" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={16} /> Email Address</label>
            <input type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={16} /> Enrolled Role</label>
            <input type="text" disabled className="form-input" style={{ textTransform: 'capitalize', backgroundColor: 'var(--bg-primary)' }} value={role} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
            <Save size={18} /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
