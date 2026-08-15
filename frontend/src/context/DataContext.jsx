import React, { createContext, useState, useEffect } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';

  const [internships, setInternships] = useState([]);

  // Global Settings (UPI, QR Code, Fees)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('globalSettings');
    if (saved) return JSON.parse(saved);
    return {
      internshipPaymentLink: 'https://razorpay.me/@skillzeno',
      quizPaymentLink: 'https://razorpay.me/@skillzeno',
      processingFee: '499.00',
      quizProcessingFee: '199.00'
    };
  });

  const [quizzes, setQuizzes] = useState([]);

  const [verifiedCertificates, setVerifiedCertificates] = useState(() => {
    const saved = localStorage.getItem('globalVerifiedCertificates');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Fetch data from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const intRes = await fetch(`${API_URL}/internships`);
        if (intRes.ok) setInternships(await intRes.json());
        
        const quizRes = await fetch(`${API_URL}/quizzes`);
        if (quizRes.ok) setQuizzes(await quizRes.json());
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [API_URL]);

  useEffect(() => {
    localStorage.setItem('globalSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('globalVerifiedCertificates', JSON.stringify(verifiedCertificates));
  }, [verifiedCertificates]);

  // Admin Actions
  const addInternship = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/internships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (res.ok) setInternships([...internships, await res.json()]);
      else alert("Failed to add internship");
    } catch (e) { console.error(e); alert("Error adding internship"); }
  };

  const updateInternship = async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/internships/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setInternships(internships.map(i => i.id === id ? updated : i));
      } else alert("Failed to update internship");
    } catch (e) { console.error(e); alert("Error updating internship"); }
  };

  const deleteInternship = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/internships/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setInternships(internships.filter(i => i.id !== id));
      else alert("Failed to delete internship");
    } catch (e) { console.error(e); alert("Error deleting internship"); }
  };

  const updateSettings = (data) => {
    setSettings({ ...settings, ...data });
  };

  const addQuiz = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (res.ok) setQuizzes([...quizzes, await res.json()]);
      else alert("Failed to add quiz");
    } catch (e) { console.error(e); alert("Error adding quiz"); }
  };

  const updateQuiz = async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/quizzes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setQuizzes(quizzes.map(q => q.id === id ? updated : q));
      } else alert("Failed to update quiz");
    } catch (e) { console.error(e); alert("Error updating quiz"); }
  };

  const deleteQuiz = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/quizzes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setQuizzes(quizzes.filter(q => q.id !== id));
      else alert("Failed to delete quiz");
    } catch (e) { console.error(e); alert("Error deleting quiz"); }
  };

  const addVerifiedCertificate = (data) => {
    setVerifiedCertificates([{ ...data, id: `vc_${Date.now()}` }, ...verifiedCertificates]);
  };

  const updateVerifiedCertificate = (id, data) => {
    setVerifiedCertificates(verifiedCertificates.map(vc => vc.id === id ? { ...vc, ...data } : vc));
  };

  return (
    <DataContext.Provider value={{ 
      internships, settings, quizzes, verifiedCertificates,
      addInternship, updateInternship, deleteInternship, 
      updateSettings,
      addQuiz, updateQuiz, deleteQuiz,
      addVerifiedCertificate, updateVerifiedCertificate
    }}>
      {children}
    </DataContext.Provider>
  );
};
