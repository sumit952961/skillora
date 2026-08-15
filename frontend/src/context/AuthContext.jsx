import React, { createContext, useState, useEffect } from 'react';
import { sendApplicationEmail, sendPasswordResetEmail, sendQuizCompletionEmail } from '../utils/emailService';

export const AuthContext = createContext();

const mockHashPassword = (str) => {
  return btoa(unescape(encodeURIComponent(str))); // simple base64 mock encryption
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Load applied internships scoped by user
  const [allApplications, setAllApplications] = useState(() => {
    const saved = localStorage.getItem('userApplications');
    if (saved) return JSON.parse(saved);
    const oldSaved = localStorage.getItem('appliedInternships');
    if (oldSaved) return { 'admin_default_1': JSON.parse(oldSaved) };
    return {};
  });

  // Load quiz applications scoped by user
  const [allQuizApplications, setAllQuizApplications] = useState(() => {
    const saved = localStorage.getItem('userQuizApplications');
    if (saved) return JSON.parse(saved);
    return {};
  });

  // Load password reset requests
  const [passwordResetRequests, setPasswordResetRequests] = useState(() => {
    const saved = localStorage.getItem('passwordResetRequests');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync across tabs/windows in real-time
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userApplications') {
        const newData = JSON.parse(e.newValue || '{}');
        setAllApplications(newData);
      }
      if (e.key === 'userQuizApplications') {
        const newData = JSON.parse(e.newValue || '{}');
        setAllQuizApplications(newData);
      }
      if (e.key === 'passwordResetRequests') {
        const newData = JSON.parse(e.newValue || '[]');
        setPasswordResetRequests(newData);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const appliedInternships = user ? (allApplications[user.id] || []) : [];
  const quizApplications = user ? (allQuizApplications[user.id] || []) : [];

  const updateApplicationsForUser = (newApps) => {
    if (!user) return;
    const updated = { ...allApplications, [user.id]: newApps };
    setAllApplications(updated);
    localStorage.setItem('userApplications', JSON.stringify(updated));
  };

  const updateQuizApplicationsForUser = (newApps) => {
    if (!user) return;
    const updated = { ...allQuizApplications, [user.id]: newApps };
    setAllQuizApplications(updated);
    localStorage.setItem('userQuizApplications', JSON.stringify(updated));
  };

  const API_URL = import.meta.env.VITE_API_URL || 'https://api.skillora.com/api';

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
      
      // Do not auto-login
      return { success: true };
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  const applyForInternship = (internshipData, customAppId = null) => {
    const prev = appliedInternships;
    // Check if already applied
    if (prev.some(app => app.details.id === internshipData.id)) {
      alert("You have already applied for this internship.");
      return;
    }

    // Add new application with default tasks
    const newApplication = {
      id: customAppId || `app_${Date.now()}`,
      internshipId: internshipData.id,
      status: 'In Progress',
      appliedDate: new Date().toISOString().split('T')[0],
      finalSubmitted: false,
      details: {
        id: internshipData.id,
        title: internshipData.title,
        company: internshipData.company
      },
      tasks: (internshipData.tasks || []).map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: 'Pending',
        submissionLink: '',
        feedback: ''
      }))
    };
    updateApplicationsForUser([newApplication, ...prev]);

    // Send email notification to admin
    sendApplicationEmail({
      studentName: user?.name || 'Unknown',
      studentEmail: user?.email || 'Unknown',
      internshipTitle: internshipData.title,
      internshipDomain: internshipData.domain || internshipData.type || 'N/A',
      appliedDate: newApplication.appliedDate
    });
  };

  const submitTask = (internshipId, taskId, link) => {
    const prev = appliedInternships;
    const updated = prev.map(app => {
      if (app.internshipId === internshipId || app.details.id === internshipId) {
        return {
          ...app,
          tasks: app.tasks.map(t => {
            if (t.id === taskId) {
              return { ...t, status: 'Submitted', submissionLink: link, feedback: 'Under Review' };
            }
            return t;
          })
        };
      }
      return app;
    });
    updateApplicationsForUser(updated);
  };

  const processFinalSubmit = (internshipId, paymentDetails = null) => {
    const prev = appliedInternships;
    const updated = prev.map(app => {
      if (app.internshipId === internshipId || app.details.id === internshipId) {
        return { 
          ...app, 
          finalSubmitted: true,
          paymentDetails: paymentDetails // Store transaction ID, date, screenshot
        };
      }
      return app;
    });
    updateApplicationsForUser(updated);
  };
  const submitQuiz = (quizData, score, customAppId = null) => {
    const prev = quizApplications;
    // Overwrite previous attempt or create new one
    const existingIndex = prev.findIndex(app => app.quizId === quizData.id);
    const newAttempt = {
      id: customAppId || `qapp_${Date.now()}`,
      quizId: quizData.id,
      quizTitle: quizData.title,
      score: score,
      totalQuestions: quizData.questions.length,
      takenDate: new Date().toISOString().split('T')[0],
      paymentSubmitted: false,
      certificateUrl: ''
    };
    
    let updated;
    if (existingIndex >= 0) {
      updated = [...prev];
      updated[existingIndex] = { ...updated[existingIndex], ...newAttempt, id: updated[existingIndex].id }; // preserve ID but update attempt
    } else {
      updated = [newAttempt, ...prev];
    }
    updateQuizApplicationsForUser(updated);
  };

  const processQuizPayment = (quizId, paymentDetails) => {
    const prev = quizApplications;
    let targetApp = null;
    const updated = prev.map(app => {
      if (app.quizId === quizId) {
        targetApp = { 
          ...app, 
          paymentSubmitted: true,
          paymentDetails: paymentDetails
        };
        return targetApp;
      }
      return app;
    });
    updateQuizApplicationsForUser(updated);

    if (targetApp) {
      sendQuizCompletionEmail({
        studentName: user?.name || 'Unknown',
        studentEmail: user?.email || 'Unknown',
        quizTitle: targetApp.quizTitle,
        score: targetApp.score,
        submittedDate: new Date().toLocaleDateString('en-IN')
      });
    }
  };
  const updateStudentApplication = (targetUserId, applicationId, updates) => {
    setAllApplications(prev => {
      const userApps = prev[targetUserId] || [];
      const updatedUserApps = userApps.map(app => {
        if (app.id === applicationId) {
          return { ...app, ...updates };
        }
        return app;
      });
      const newAllApps = { ...prev, [targetUserId]: updatedUserApps };
      localStorage.setItem('userApplications', JSON.stringify(newAllApps));
      return newAllApps;
    });
  };

  const updateStudentQuizApplication = (targetUserId, applicationId, updates) => {
    setAllQuizApplications(prev => {
      const userApps = prev[targetUserId] || [];
      const updatedUserApps = userApps.map(app => {
        if (app.id === applicationId) {
          return { ...app, ...updates };
        }
        return app;
      });
      const newAllApps = { ...prev, [targetUserId]: updatedUserApps };
      localStorage.setItem('userQuizApplications', JSON.stringify(newAllApps));
      return newAllApps;
    });
  };

  const verifyTask = (targetUserId, applicationId, taskId, status, feedback) => {
    setAllApplications(prev => {
      const userApps = prev[targetUserId] || [];
      const updatedUserApps = userApps.map(app => {
        if (app.id === applicationId) {
          return {
            ...app,
            tasks: app.tasks.map(t => {
              if (t.id === taskId) {
                return { ...t, status, feedback };
              }
              return t;
            })
          };
        }
        return app;
      });
      const newAllApps = { ...prev, [targetUserId]: updatedUserApps };
      localStorage.setItem('userApplications', JSON.stringify(newAllApps));
      
      // If the currently logged in user is the target, also update their local state
      if (user && user.id === targetUserId) {
        setAppliedInternships(updatedUserApps);
      }
      
      return newAllApps;
    });
  };

  const requestPasswordReset = async (email) => {
    const savedUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const userFound = savedUsers.find(u => u.email === email);
    if (!userFound) {
      throw new Error('User with this email not found.');
    }

    // Check if there's already a pending request for this user
    const existingReq = passwordResetRequests.find(r => r.email === email && r.status === 'pending');
    if (existingReq) {
      throw new Error('A password reset request is already pending for this email.');
    }

    const newReq = {
      id: `pr_${Date.now()}`,
      userId: userFound.id,
      email: userFound.email,
      name: userFound.name,
      requestedDate: new Date().toISOString(),
      status: 'pending'
    };

    const updatedRequests = [newReq, ...passwordResetRequests];
    setPasswordResetRequests(updatedRequests);
    localStorage.setItem('passwordResetRequests', JSON.stringify(updatedRequests));

    // Send email notification to admin
    await sendPasswordResetEmail({
      userEmail: email,
      requestDate: new Date().toLocaleDateString('en-IN')
    });
  };

  const resetUserPassword = async (requestId, email, newPassword) => {
    try {
      await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
    } catch (err) {
      console.warn('Backend reset failed or unavailable, updating local only');
    }

    const savedUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const userIndex = savedUsers.findIndex(u => u.email === email);
    
    if (userIndex !== -1) {
      savedUsers[userIndex].password = mockHashPassword(newPassword);
      localStorage.setItem('mockUsers', JSON.stringify(savedUsers));
    }

    const updatedRequests = passwordResetRequests.filter(req => req.id !== requestId);
    setPasswordResetRequests(updatedRequests);
    localStorage.setItem('passwordResetRequests', JSON.stringify(updatedRequests));
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, login, register, logout, loading, 
      appliedInternships, applyForInternship, submitTask, 
      processFinalSubmit, allApplications, updateStudentApplication,
      verifyTask,
      allQuizApplications, quizApplications, submitQuiz, processQuizPayment,
      updateStudentQuizApplication,
      passwordResetRequests, requestPasswordReset, resetUserPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
