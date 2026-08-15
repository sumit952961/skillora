import React, { useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { AuthProvider, AuthContext } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import Navbar from './components/Navbar'
import BackButton from './components/BackButton'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import Internships from './pages/Internships'
import InternshipDetail from './pages/InternshipDetail'
import Quiz from './pages/Quiz'
import Verify from './pages/Verify'
import Dashboard from './pages/Dashboard'
import MyInternships from './pages/MyInternships'
import InternshipTaskOverview from './pages/InternshipTaskOverview'
import Tasks from './pages/Tasks'
import Certificates from './pages/Certificates'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminInternships from './pages/AdminInternships'
import AdminApplications from './pages/AdminApplications'
import AdminQuizzes from './pages/AdminQuizzes'
import AdminQuizCertificates from './pages/AdminQuizCertificates'
import AdminSettings from './pages/AdminSettings'
import AdminCertificateVerification from './pages/AdminCertificateVerification'
import AdminPasswordReset from './pages/AdminPasswordReset'
import { MapPin, Phone, Mail, BookOpen, ShieldCheck, Award } from 'lucide-react'
import './App.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="container"><h3>Verifying session...</h3></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="container"><h3>Verifying session...</h3></div>;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
}

// Scroll to top on every route change and handle browser reload
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const [activePolicy, setActivePolicy] = useState(null);

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <BackButton />
      <main style={{ minHeight: 'calc(100vh - 220px)' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/internships/:id" element={<InternshipDetail />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/verify" element={<Verify />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/my-internships" element={<ProtectedRoute><MyInternships /></ProtectedRoute>} />
          <Route path="/my-internships/:id" element={<ProtectedRoute><InternshipTaskOverview /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/internships" element={
            <AdminRoute>
              <AdminInternships />
            </AdminRoute>
          } />
          <Route path="/admin/applications" element={
            <AdminRoute>
              <AdminApplications />
            </AdminRoute>
          } />
          <Route path="/admin/quizzes" element={
            <AdminRoute>
              <AdminQuizzes />
            </AdminRoute>
          } />
          <Route path="/admin/quiz-certificates" element={
            <AdminRoute>
              <AdminQuizCertificates />
            </AdminRoute>
          } />
          <Route path="/admin/certificate-verification" element={
            <AdminRoute>
              <AdminCertificateVerification />
            </AdminRoute>
          } />
          <Route path="/admin/password-reset" element={
            <AdminRoute>
              <AdminPasswordReset />
            </AdminRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminRoute>
              <AdminSettings />
            </AdminRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="premium-footer">
        <div className="footer-container">
          {/* Column 1: Brand Info */}
          <div className="footer-col">
            <div className="footer-logo" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="https://plain-apac-prod-public.komododecks.com/202608/15/dLTEVqKrqGQSZzgf3yI9/image.png" alt="Skillzeno Logo" style={{ height: '80px', margin: '-10px 0' }} />
            </div>
            <p className="footer-desc">
              Bridging the gap between theory and industry experience. Build production-grade software and claim verifiable credentials.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
              <a href="#" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Career Sectors */}
          <div className="footer-col">
            <h4 className="footer-title">Career Sectors</h4>
            <ul className="footer-links">
              <li><Link to="/internships">Frontend React Development</Link></li>
              <li><Link to="/internships">Backend API Engineering</Link></li>
              <li><Link to="/internships">Full Stack MERN Systems</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="footer-col">
            <h4 className="footer-title">Resources</h4>
            <ul className="footer-links">
              <li><Link to="/internships">Internship Programs</Link></li>
              <li><Link to="/verify">Verification Portal</Link></li>
              <li><Link to="/quiz">Interactive Quiz Test</Link></li>
              <li><Link to="/about">About Programs</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Desk */}
          <div className="footer-col">
            <h4 className="footer-title">Contact Desk</h4>
            <ul className="footer-contact">
              <li>
                <MapPin size={18} className="contact-icon" />
                <span>NH-56 near Agrasen Chauraha Usarpurwa, Shivpur, Varanasi, Uttar Pradesh 221003</span>
              </li>
              <li>
                <Mail size={18} className="contact-icon" />
                <a href="mailto:skillzeno26@gmail.com" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>skillzeno26@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="footer-divider" />
        
        <div className="footer-trust-bar">
          {/* Left: Trusted & Verified */}
          <div className="trust-item">
            <div className="trust-icon-wrapper">
              <ShieldCheck size={20} />
            </div>
            <div className="trust-text">
              <h4>Trusted & Verified</h4>
              <p>Certificates • Transparency • Trust</p>
            </div>
          </div>

          {/* Middle: Copyright & Legal Links */}
          <div className="trust-center">
            <p>© 2026 Skillzeno. All rights reserved.</p>
            <div className="legal-links">
              <a href="#policy" onClick={(e) => { e.preventDefault(); setActivePolicy('privacy'); }}>Privacy Policy</a>
              <span>|</span>
              <a href="#policy" onClick={(e) => { e.preventDefault(); setActivePolicy('terms'); }}>Terms & Conditions</a>
              <span>|</span>
              <a href="#policy" onClick={(e) => { e.preventDefault(); setActivePolicy('refund'); }}>Refund & Cancellation Policy</a>
            </div>
          </div>

          {/* Right: Udyam Registered */}
          <div className="trust-item">
            <div className="trust-icon-wrapper">
              <Award size={20} />
            </div>
            <div className="trust-text">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Udyam Registered <span className="check-badge">✓</span>
              </h4>
              <p>Registered Business</p>
            </div>
          </div>
        </div>
      </footer>
      {activePolicy && (
        <PolicyModal policy={activePolicy} onClose={() => setActivePolicy(null)} />
      )}
    </>
  )
}

function PolicyModal({ policy, onClose }) {
  const policies = {
    privacy: {
      title: "Privacy Policy",
      content: (
        <>
          <p><strong>Effective Date:</strong> August 14, 2026</p>
          <p>Skillzeno Learning Systems respects your privacy and is committed to protecting the information you provide while using our website and services. For any privacy-related questions, contact us at <a href="mailto:skillzeno26@gmail.com">skillzeno26@gmail.com</a>.</p>
          
          <h4>1. Information We Collect</h4>
          <p>We may collect information such as your name, email address, phone number, academic/professional details, account information, internship applications, project submissions, quiz results, and certificate details.</p>
          
          <h4>2. How We Use Your Information</h4>
          <p>We use this information to:</p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Process internship applications.</li>
            <li>Provide projects, quizzes, and related services.</li>
            <li>Track internship progress and evaluate submissions.</li>
            <li>Issue and verify internship completion certificates.</li>
            <li>Process payments and provide important service-related notifications.</li>
          </ul>
          
          <h4>3. Sharing of Information</h4>
          <p>We do not sell your personal information. Information may be shared with trusted service providers when necessary to operate our services, process payments, maintain security, or comply with applicable laws.</p>
          
          <h4>4. Certificate Verification</h4>
          <p>Certificates issued by Skillzeno may be verified through a unique certificate ID or verification link. Limited information may be displayed for verification purposes.</p>
          
          <h4>5. Data Security</h4>
          <p>We take reasonable measures to protect your information from unauthorized access, misuse, or disclosure.</p>
          
          <h4>6. Your Rights</h4>
          <p>You may contact us to request correction or deletion of your personal information, or to raise any privacy-related concern, subject to applicable laws.</p>
          
          <h4>7. Policy Updates</h4>
          <p>We may update this Privacy Policy when necessary. Any changes will be posted on this page with an updated effective date.</p>
          
          <h4>8. Contact Us</h4>
          <p>Skillzeno Learning Systems<br />Email: <a href="mailto:skillzeno26@gmail.com">skillzeno26@gmail.com</a></p>
        </>
      )
    },
    terms: {
      title: "Terms & Conditions",
      content: (
        <>
          <p><strong>Effective Date:</strong> August 14, 2026</p>
          <p>By using Skillzeno, you agree to follow these Terms &amp; Conditions.</p>
          
          <h4>1. Platform Usage</h4>
          <p>Skillzeno provides educational, project-based internship programs and related services. Users must provide accurate information and use the platform lawfully.</p>
          
          <h4>2. Original Work &amp; AI Use</h4>
          <p>Users must submit their own work. AI-generated content, code, or automated solutions must not be submitted as original work unless specifically permitted for that task. Plagiarism or false submissions may result in task rejection, account suspension, or certificate cancellation.</p>
          
          <h4>3. Internship &amp; Certificates</h4>
          <p>Certificates are issued only after fulfilling the applicable internship requirements. Skillzeno may withhold or revoke certificates obtained through fraudulent or prohibited activities. Certificates may include a unique verification ID or link.</p>
          
          <h4>4. Payments &amp; Refunds</h4>
          <p>Applicable fees will be displayed before payment. Refunds, where applicable, are subject to our Refund Policy.</p>
          
          <h4>5. Account &amp; Platform</h4>
          <p>Skillzeno may suspend accounts that violate these Terms or misuse the platform. We may update, modify, or discontinue features when necessary.</p>
          
          <h4>6. Changes</h4>
          <p>These Terms may be updated from time to time. Continued use of Skillzeno after updates constitutes acceptance of the revised Terms.</p>
          
          <h4>7. Contact</h4>
          <p>Skillzeno Learning Systems<br />Email: <a href="mailto:skillzeno26@gmail.com">skillzeno26@gmail.com</a></p>
        </>
      )
    },
    refund: {
      title: "Refund & Cancellation Policy",
      content: (
        <>
          <p><strong>Effective Date:</strong> August 14, 2026</p>
          <p>Skillzeno aims to provide a clear and transparent experience for all users.</p>
          
          <h4>1. Refund Requests</h4>
          <p>Refund requests may be submitted within 7 calendar days of the transaction, subject to the eligibility conditions below.</p>
          
          <h4>2. Eligibility</h4>
          <p>Refunds may be available if the purchased service has not been started, used, or substantially accessed.</p>
          
          <h4>3. Non-Refundable Cases</h4>
          <p>Refunds may not be available after a service, project, assessment, evaluation, or other paid feature has been used or submitted.</p>
          
          <h4>4. Refund Processing</h4>
          <p>Approved refunds will be processed to the original payment method. Processing time may vary depending on the payment provider or bank.</p>
          
          <h4>5. Contact</h4>
          <p>For refund-related queries: <a href="mailto:skillzeno26@gmail.com">skillzeno26@gmail.com</a></p>
        </>
      )
    }
  };

  const active = policies[policy];

  return (
    <div className="policy-modal-overlay" onClick={onClose}>
      <div className="policy-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="policy-modal-header">
          <h3>{active.title}</h3>
          <button className="policy-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="policy-modal-body">
          {active.content}
        </div>
        <div className="policy-modal-footer">
          <button className="btn btn-primary-premium" onClick={onClose}>Accept & Close</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </DataProvider>
  )
}
