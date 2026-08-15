import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { Save } from 'lucide-react';

export default function AdminSettings() {
  const { settings, updateSettings } = useContext(DataContext);
  const [formData, setFormData] = useState({
    internshipPaymentLink: settings.internshipPaymentLink || '',
    quizPaymentLink: settings.quizPaymentLink || '',
    processingFee: settings.processingFee || '',
    quizProcessingFee: settings.quizProcessingFee || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(formData);
    alert('Settings updated successfully!');
  };

  return (
    <div className="container fade-in">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure platform payment and UI settings.</p>
      </div>

      <div style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '24px' }}>Payment Configuration</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="form-group">
            <label>Internship Payment Link (Razorpay)</label>
            <input 
              type="url" 
              className="form-input" 
              placeholder="https://rzp.io/l/..."
              value={formData.internshipPaymentLink} 
              onChange={e => setFormData({...formData, internshipPaymentLink: e.target.value})} 
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>External link for Internship Final Submissions.</p>
          </div>

          <div className="form-group">
            <label>Quiz Payment Link (Razorpay)</label>
            <input 
              type="url" 
              className="form-input" 
              placeholder="https://rzp.io/l/..."
              value={formData.quizPaymentLink} 
              onChange={e => setFormData({...formData, quizPaymentLink: e.target.value})} 
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>External link for Quiz Certificate Downloads.</p>
          </div>

          <div className="form-group">
            <label>Internship Processing Fee (₹)</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.processingFee} 
              onChange={e => setFormData({...formData, processingFee: e.target.value})} 
            />
          </div>

          <div className="form-group">
            <label>Quiz Processing Fee (₹)</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.quizProcessingFee} 
              onChange={e => setFormData({...formData, quizProcessingFee: e.target.value})} 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', marginTop: '12px' }}>
            <Save size={18} /> Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
