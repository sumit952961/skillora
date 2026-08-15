import React, { createContext, useState, useEffect } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  // Global Internships
  const [internships, setInternships] = useState(() => {
    const saved = localStorage.getItem('globalInternships');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'int1',
        title: 'Frontend Web Developer (React)',
        company: 'Skillzeno',
        department: 'Engineering / Frontend',
        duration: '3 Months',
        stipend: 'Unpaid (Certificate + LOR)',
        type: 'Remote',
        mode: 'Full-Time',
        description: 'Work on premium user interfaces, state management, and real-world web applications.',
        overview: 'Join our frontend engineering team to build production-grade React applications.',
        responsibilities: [
          'Build reusable UI components using React.js and modern JavaScript (ES6+)'
        ],
        requirements: ['HTML, CSS, JavaScript', 'React Basics'],
        skillsLearned: ['React.js', 'State Management'],
        perks: ['Certificate of Completion', 'Letter of Recommendation'],
        tasks: [
          { id: 't1', title: 'Task 1: Portfolio Website Landing Page', description: 'Build a responsive portfolio.' },
          { id: 't2', title: 'Task 2: Weather Dashboard App', description: 'Build a weather app using an API.' },
          { id: 't3', title: 'Task 3: E-commerce Shopping Cart', description: 'Build a cart with state management.' }
        ]
      }
    ];
  });

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

  const [quizzes, setQuizzes] = useState(() => {
    const saved = localStorage.getItem('globalQuizzes');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'q1',
        title: 'React Fundamentals',
        description: 'Test your knowledge on React hooks, state, and components.',
        timeLimit: 10,
        questions: [
          {
            question: 'What hook is used to perform side effects in functional components?',
            options: ['useState', 'useContext', 'useEffect', 'useReducer'],
            answer: 2
          }
        ]
      }
    ];
  });

  const [verifiedCertificates, setVerifiedCertificates] = useState(() => {
    const saved = localStorage.getItem('globalVerifiedCertificates');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Save to localStorage when updated
  useEffect(() => {
    localStorage.setItem('globalInternships', JSON.stringify(internships));
  }, [internships]);

  useEffect(() => {
    localStorage.setItem('globalQuizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('globalSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('globalVerifiedCertificates', JSON.stringify(verifiedCertificates));
  }, [verifiedCertificates]);

  // Admin Actions
  const addInternship = (data) => {
    setInternships([...internships, { ...data, id: `int_${Date.now()}` }]);
  };

  const updateInternship = (id, data) => {
    setInternships(internships.map(i => i.id === id ? { ...i, ...data } : i));
  };

  const deleteInternship = (id) => {
    setInternships(internships.filter(i => i.id !== id));
  };

  const updateSettings = (data) => {
    setSettings({ ...settings, ...data });
  };

  const addQuiz = (data) => {
    setQuizzes([...quizzes, { ...data, id: `q_${Date.now()}` }]);
  };

  const updateQuiz = (id, data) => {
    setQuizzes(quizzes.map(q => q.id === id ? { ...q, ...data } : q));
  };

  const deleteQuiz = (id) => {
    setQuizzes(quizzes.filter(q => q.id !== id));
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
