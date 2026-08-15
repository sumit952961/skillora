import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Award, BookOpen, LogOut, CheckCircle, User, Briefcase, LayoutDashboard, Settings, Layers, MoreVertical, Key, Shield, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAdminMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleLogout = () => {
    navigate('/');
    // Delay state update slightly so ProtectedRoute doesn't intercept and redirect to /login
    setTimeout(() => {
      logout();
    }, 50);
  };

  return (
    <nav className="navbar-container">
      <div className="navbar">
        <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="https://plain-apac-prod-public.komododecks.com/202608/15/qawgcaBGcokEqf4C321X/image.png" alt="Skillzeno Logo" style={{ height: '110px', margin: '-15px 0' }} />
        </Link>

        <div className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </div>

        <ul className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          {!user ? (
            <>
              <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink></li>
              <li><NavLink to="/internships" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Internships</NavLink></li>
              <li><NavLink to="/quiz" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Quiz Test</NavLink></li>
              <li><NavLink to="/verify" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Verify Certificate</NavLink></li>
              <li><NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>About</NavLink></li>
              <li><NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>Contact</NavLink></li>
              <li style={{ marginLeft: '12px' }}>
                <Link to="/login" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }} onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
              </li>
            </>
          ) : user.role === 'admin' ? (
            <>
              <li>
                <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <LayoutDashboard size={16} /> Admin Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/internships" className={({ isActive }) => isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <Briefcase size={16} /> Manage Internships
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/applications" className={({ isActive }) => isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <CheckCircle size={16} /> Manage Applications
                </NavLink>
              </li>

              <li style={{ marginLeft: '12px', position: 'relative' }} ref={dropdownRef}>
                <button
                  onClick={() => setShowAdminMenu(!showAdminMenu)}
                  className="btn btn-outline"
                  style={{ padding: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <MoreVertical size={18} />
                </button>

                {showAdminMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)',
                    minWidth: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 100,
                    overflow: 'hidden'
                  }}>
                    <NavLink to="/admin/quizzes" onClick={() => setShowAdminMenu(false)} className="dropdown-link" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
                      <BookOpen size={16} /> Manage Quizzes
                    </NavLink>
                    <NavLink to="/admin/quiz-certificates" onClick={() => setShowAdminMenu(false)} className="dropdown-link" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
                      <Award size={16} /> Quiz Certificates
                    </NavLink>
                    <NavLink to="/admin/password-reset" onClick={() => setShowAdminMenu(false)} className="dropdown-link" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
                      <Key size={16} /> Password Reset
                    </NavLink>
                    <NavLink to="/admin/certificate-verification" onClick={() => setShowAdminMenu(false)} className="dropdown-link" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
                      <Shield size={16} /> Certificate Verification
                    </NavLink>
                    <NavLink to="/admin/settings" onClick={() => setShowAdminMenu(false)} className="dropdown-link" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
                      <Settings size={16} /> Settings
                    </NavLink>
                    <button onClick={() => { setShowAdminMenu(false); handleLogout(); }} className="dropdown-link" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-danger)', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <LayoutDashboard size={16} /> Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/quiz" className={({ isActive }) => isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <BookOpen size={16} /> Quiz
                </NavLink>
              </li>
              <li>
                <NavLink to="/my-internships" className={({ isActive }) => isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <Briefcase size={16} /> My Internships
                </NavLink>
              </li>
              <li>
                <NavLink to="/tasks" className={({ isActive }) => isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <CheckCircle size={16} /> Tasks
                </NavLink>
              </li>
              <li>
                <NavLink to="/certificates" className={({ isActive }) => isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <Award size={16} /> Certificates
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''} style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setIsMobileMenuOpen(false)}>
                  <User size={16} /> Profile
                </NavLink>
              </li>
              <li style={{ marginLeft: '12px' }}>
                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
