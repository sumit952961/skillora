import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { Users, Briefcase, Settings, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const { internships } = useContext(DataContext);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';
        const res = await fetch(`${API_URL}/auth/users`, { headers: { Authorization: `Bearer ${token}` }});
        if (res.ok) {
          const users = await res.json();
          setStudentCount(users.filter(u => u.role !== 'admin').length);
        }
      } catch (err) { console.error('Failed to fetch users'); }
    };
    fetchUsers();
  }, []);

  return (
    <div className="container fade-in">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name}. Manage your platform here.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {/* Metric 1 */}
        <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', margin: '0 0 4px 0' }}>{internships.length}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Internships</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', margin: '0 0 4px 0' }}>{studentCount}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Registered Students</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '16px' }}>Manage Internships</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Create new internship programs, update existing tasks, or remove outdated listings.
          </p>
          <Link to="/admin/internships" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            Go to Internships <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '16px' }}>Manage Applications</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Track student progress, verify final submissions, and upload completion certificates.
          </p>
          <Link to="/admin/applications" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
            Go to Applications <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginBottom: '16px' }}>Platform Settings</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Update payment configurations like processing fees, UPI IDs, and QR Codes.
          </p>
          <Link to="/admin/settings" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Settings size={16} /> Go to Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
