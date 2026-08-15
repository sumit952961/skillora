import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="container fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <CheckCircle size={80} color="var(--accent-success)" style={{ marginBottom: '24px' }} />
      <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Payment Successful!</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: '1.6', marginBottom: '32px' }}>
        You will receive an email with your certificate within 24 hours, and you can also download it directly from the website once verified.
      </p>
      <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>
        Return to Dashboard
      </button>
    </div>
  );
}
