import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const hiddenRoutes = ['/', '/dashboard', '/admin/dashboard'];
  
  // Also hide if it's an exact match or part of the hidden routes logic
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        position: 'fixed',
        top: '100px',
        left: '30px',
        zIndex: 1000,
        backgroundColor: 'var(--primary)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transition: 'transform 0.2s, background-color 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title="Go Back"
    >
      <ArrowLeft size={24} />
    </button>
  );
}
