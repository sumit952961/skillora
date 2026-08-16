import React, { createContext, useState, useEffect } from 'react';
import { sendApplicationEmail, sendPasswordResetEmail, sendQuizCompletionEmail } from '../utils/emailService';

export const AuthContext = createContext();

const mockHashPassword = (str) => {
  return btoa(unescape(encodeURIComponent(str)));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Student specific data
  const [appliedInternships, setAppliedInternships] = useState([]);
  const [quizApplications, setQuizApplications] = useState([]);

  const [passwordResetRequests, setPasswordResetRequests] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';

  const fetchStudentData = async (currentToken) => {
    try {
      const [internshipRes, quizRes] = await Promise.all([
        fetch(`${API_URL}/my-internships`, { headers: { Authorization: `Bearer ${currentToken}` } }),
        fetch(`${API_URL}/my-quizzes`, { headers: { Authorization: `Bearer ${currentToken}` } })
      ]);
      if (internshipRes.ok) setAppliedInternships(await internshipRes.json());
      if (quizRes.ok) setQuizApplications(await quizRes.json());
    } catch (err) {
      console.warn('Failed to fetch student data:', err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            if (data.role === 'student') {
              await fetchStudentData(token);
            }
            if (data.role === 'admin') {
              const reqsRes = await fetch(`${API_URL}/admin/password-resets`, { headers: { Authorization: `Bearer ${token}` }});
              if (reqsRes.ok) setPasswordResetRequests(await reqsRes.json());
            }
          } else {
            throw new Error('Invalid token from backend');
          }
        } catch (err) {
          console.warn('Backend unavailable');
          logout();
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      if (data.user.role === 'student') {
        await fetchStudentData(data.token);
      }
      if (data.user.role === 'admin') {
        const reqsRes = await fetch(`${API_URL}/admin/password-resets`, { headers: { Authorization: `Bearer ${data.token}` }});
        if (reqsRes.ok) setPasswordResetRequests(await reqsRes.json());
      }
      return { success: true };
    } catch (err) {
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      return { success: true };
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setAppliedInternships([]);
    setQuizApplications([]);
  };

  const applyForInternship = async (internshipData, generatedAppId) => {
    if (appliedInternships.some(app => app.internshipId === internshipData.id)) {
      alert("You have already applied for this internship.");
      return;
    }
    
    try {
      const defaultTasks = (internshipData.tasks || []).map(t => ({
        id: t.id, title: t.title, description: t.description, status: 'Pending', submissionLink: '', feedback: ''
      }));

      const res = await fetch(`${API_URL}/internships/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ internshipId: internshipData.id, appNumber: generatedAppId, tasks: defaultTasks })
      });
      if (res.ok) {
        const { application } = await res.json();
        setAppliedInternships([ { ...application, details: internshipData }, ...appliedInternships ]);
        
        sendApplicationEmail({
          studentName: user?.name || 'Unknown',
          studentEmail: user?.email || 'Unknown',
          internshipTitle: internshipData.title,
          internshipDomain: internshipData.domain || internshipData.type || 'N/A',
          appliedDate: application.appliedDate
        });
      } else {
        const err = await res.json();
        alert(err.message || 'Application failed');
      }
    } catch (e) {
      alert("Failed to apply");
    }
  };

  const submitTask = async (internshipId, taskId, link) => {
    try {
      const res = await fetch(`${API_URL}/tasks/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ internshipId, taskId, submissionLink: link })
      });
      if (res.ok) {
        const { updatedTasks } = await res.json();
        setAppliedInternships(prev => prev.map(app => 
          app.internshipId === internshipId ? { ...app, tasks: updatedTasks } : app
        ));
      }
    } catch (e) {
      console.error("Failed to submit task", e);
    }
  };

  const processFinalSubmit = async (internshipId, paymentDetails = null) => {
    try {
      const res = await fetch(`${API_URL}/internships/final-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ internshipId, paymentDetails })
      });
      if (res.ok) {
        setAppliedInternships(prev => prev.map(app => 
          app.internshipId === internshipId ? { ...app, finalSubmitted: true, paymentDetails } : app
        ));
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to submit final", e);
      return false;
    }
  };

  const submitQuiz = async (quizData, score, customAppId) => {
    try {
      const res = await fetch(`${API_URL}/quizzes/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quizId: quizData.id, quizTitle: quizData.title, score, totalQuestions: quizData.questions.length, appNumber: customAppId })
      });
      if (res.ok) {
        const { application } = await res.json();
        setQuizApplications(prev => {
          const index = prev.findIndex(q => q.quizId === application.quizId);
          if (index !== -1) {
            const copy = [...prev];
            copy[index] = application;
            return copy;
          }
          return [application, ...prev];
        });
      }
    } catch (e) {
      console.error("Quiz submission failed", e);
    }
  };

  const processQuizPayment = async (quizId, paymentDetails) => {
    try {
      const res = await fetch(`${API_URL}/quizzes/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quizId, paymentDetails })
      });
      if (res.ok) {
        const { application } = await res.json();
        setQuizApplications(prev => prev.map(app => app.quizId === quizId ? application : app));
        
        sendQuizCompletionEmail({
          studentName: user?.name || 'Unknown',
          studentEmail: user?.email || 'Unknown',
          quizTitle: application.quizTitle,
          score: application.score,
          submittedDate: new Date().toLocaleDateString('en-IN')
        });
      }
    } catch (e) {
      console.error("Quiz payment failed", e);
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const res = await fetch(`${API_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to request reset');
      }
      await sendPasswordResetEmail({ userEmail: email, requestDate: new Date().toLocaleDateString('en-IN') });
    } catch (e) {
      throw e;
    }
  };

  const resetUserPassword = async (requestId, email, newPassword) => {
    try {
      await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, requestId })
      });
      setPasswordResetRequests(passwordResetRequests.filter(req => req.id !== requestId));
    } catch (err) {
      console.warn('Backend reset failed');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, login, register, logout, loading, 
      appliedInternships, applyForInternship, submitTask, 
      processFinalSubmit, 
      quizApplications, submitQuiz, processQuizPayment,
      passwordResetRequests, requestPasswordReset, resetUserPassword,
      API_URL
    }}>
      {children}
    </AuthContext.Provider>
  );
};
