import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { X, CheckCircle } from 'lucide-react';

import { validateName, validateEmail, validatePhone, validateURL } from '../utils/validation';

// Reusable modal component handling detail, form, and success steps
export default function InternshipApplyFlow({ internship, isOpen, onClose, onApplied }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState('detail'); // 'detail' | 'form' | 'success'
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    college: '',
    yearOfStudy: '',
    linkedIn: '',
    resumeLink: '',
    coverLetter: ''
  });
  const [appNumber, setAppNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user && window.location.search.includes('autoOpenApply=true')) {
      setFormData((prev) => ({ ...prev, name: user.name || '', email: user.email || '' }));
      setStep('form');
    } else if (isOpen) {
      setStep('detail'); // Reset to detail when normally opened
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateAppNumber = () => {
    return 'APP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const submitApplication = async () => {
    const nameError = validateName(formData.name);
    if (nameError) return alert(nameError);

    const emailError = validateEmail(formData.email);
    if (emailError) return alert(emailError);

    const phoneError = validatePhone(formData.phone);
    if (phoneError) return alert(phoneError);

    const linkedInError = validateURL(formData.linkedIn);
    if (linkedInError || !formData.linkedIn.includes('linkedin.com')) {
      return alert("Please enter a valid LinkedIn URL.");
    }

    const resumeError = validateURL(formData.resumeLink);
    if (resumeError) return alert("Please enter a valid URL for your resume.");

    setSubmitting(true);
    // Simulate API call – replace with real endpoint later
    try {
      await new Promise((res) => setTimeout(res, 500));
      const number = generateAppNumber();
      setAppNumber(number);
      setStep('success');
      if (onApplied) onApplied(number);
    } catch (err) {
      console.error('Application error', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        {step === 'detail' && (
          <div className="modal-step">
            <h2 className="modal-title">{internship.title}</h2>
            <p className="modal-company">{internship.company} • {internship.type}</p>
            <p className="modal-description">{internship.description}</p>
            <ul className="modal-skills">
              {internship.skillsLearned?.map((skill, i) => (
                <li key={i}>• {skill}</li>
              ))}
            </ul>
            <button className="btn btn-primary" onClick={() => {
              if (!user) {
                localStorage.setItem('pendingApplicationId', internship.id);
                onClose();
                navigate('/login');
                return;
              }
              setFormData((prev) => ({ ...prev, name: user?.name || '', email: user?.email || '' }));
              setStep('form');
            }}>
              Apply for this Internship
            </button>
          </div>
        )}
        {step === 'form' && (
          <div className="modal-step">
            <h2 className="modal-title">Application Form</h2>
            <form
              className="apply-form"
              onSubmit={(e) => {
                e.preventDefault();
                submitApplication();
              }}
            >
              {/* Auto‑filled fields (read‑only) */}
              <div className="form-group auto-filled">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} readOnly />
                <span className="auto-badge">🔒 Auto‑filled</span>
              </div>
              <div className="form-group auto-filled">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} readOnly />
                <span className="auto-badge">🔒 Auto‑filled</span>
              </div>
              {/* Manual fields */}
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>College / University</label>
                <input type="text" name="college" required value={formData.college} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Year of Study</label>
                <input type="text" name="yearOfStudy" required value={formData.yearOfStudy} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>LinkedIn Profile URL</label>
                <input type="url" name="linkedIn" required value={formData.linkedIn} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Resume/CV Link (optional)</label>
                <input type="url" name="resumeLink" value={formData.resumeLink} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Cover Letter (optional)</label>
                <textarea name="coverLetter" rows={4} value={formData.coverLetter} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>
            </form>
          </div>
        )}
        {step === 'success' && (
          <div className="modal-step success-step">
            <CheckCircle size={48} className="success-icon" />
            <h2>Application Submitted!</h2>
            <p>
              Your application number is <strong>{appNumber}</strong>. You will receive a confirmation
              email within <strong>24‑48 hours</strong> and can track the status on the portal.
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
