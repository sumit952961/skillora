import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { validateName, validateEmail } from '../utils/validation';
import { sendContactEmail } from '../utils/emailService';
import SEO from '../components/SEO';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const nameError = validateName(formData.name);
    if (nameError) return setError(nameError);

    const emailError = validateEmail(formData.email);
    if (emailError) return setError(emailError);

    if (formData.message.trim().length < 10) {
      return setError('Message must be at least 10 characters long.');
    }

    // Send email notification
    sendContactEmail({ name: formData.name, email: formData.email, message: formData.message });

    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <>
    <SEO 
      title="Contact Us | Skillzeno" 
      description="Get in touch with Skillzeno for support, inquiries, or business partnerships. We are here to help." 
      canonical="/contact"
    />
    <div className="container fade-in">
      <div className="section-title-wrapper">

        <h1 className="section-title">We'd Love to Hear From You</h1>
        <p className="section-subtitle">Have questions about our internship programs or certificate verification? Let us know!</p>
      </div>

      {/* Mobile Responsive Fix: className='contact-grid' targets this in responsive-fix.css */}
      <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px', marginTop: '40px' }}>
        {/* Contact Info */}
        <div className="contact-info-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
              <div className="feature-icon-wrapper"><Mail size={20} /></div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Email Us</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <a href="mailto:skillzeno26@gmail.com" style={{ color: 'var(--primary)', textDecoration: 'none' }}>skillzeno26@gmail.com</a>
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
              <div className="feature-icon-wrapper"><Phone size={20} style={{ color: 'var(--accent-success)' }} /></div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>WhatsApp Us</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <a href="https://wa.me/917048107697" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>+91 7048107697</a>
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="feature-icon-wrapper"><MapPin size={20} style={{ color: 'var(--accent-success)' }} /></div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Headquarters</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>NH-56 near Agrasen Chauraha Usarpurwa, Shivpur, Varanasi, Uttar Pradesh 221003</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form - Mobile Responsive Fix: className='contact-form-panel' */}
        <div className="contact-form-panel" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '32px', borderRadius: 'var(--radius-lg)' }}>
          {error && (
            <div style={{ background: 'var(--accent-danger-light)', color: 'var(--accent-danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontWeight: '600' }}>
              {error}
            </div>
          )}
          {submitted && (
            <div style={{ background: 'var(--accent-success-light)', color: 'var(--accent-success)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontWeight: '600' }}>
              Thank you! Your message has been received. We will get back to you shortly.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" required className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" required className="form-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Your Message</label>
              <textarea required rows={4} className="form-input" style={{ resize: 'vertical' }} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Send Message <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
