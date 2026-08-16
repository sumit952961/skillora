import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Download, CreditCard, X, Trophy, ShieldCheck, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TakeQuiz({ quiz, onBack }) {
  const { user, token, submitQuiz, processQuizPayment, quizApplications } = useContext(AuthContext);
  const { settings } = useContext(DataContext);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';
  
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);
  const [timeWarningShown, setTimeWarningShown] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Check if student already attempted
  const existingApp = quizApplications.find(a => a.quizId === quiz.id);

  useEffect(() => {
    if (existingApp) {
      setHasStarted(true);
      setIsFinished(true);
      setScore(existingApp.score);
    }
  }, [existingApp]);

  const [sessionAppId, setSessionAppId] = useState(null);

  useEffect(() => {
    let timer;
    if (hasStarted && !isFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      
      if (timeLeft === 30 && !timeWarningShown) {
        setTimeWarningShown(true);
      }
    } else if (timeLeft === 0 && !isFinished && hasStarted) {
      alert("⏰ Your time is up! The quiz has been automatically submitted.");
      setIsFinished(true);
      
      // Merge current selection into answers and calculate final score
      const finalAnswers = { ...userAnswers, [currentIdx]: selectedOpt };
      let finalScore = 0;
      quiz.questions.forEach((q, idx) => {
        if (finalAnswers[idx] === q.answer) finalScore += 1;
      });
      setScore(finalScore);
      submitQuiz(quiz, finalScore, sessionAppId);
    }
    return () => clearInterval(timer);
  }, [hasStarted, isFinished, timeLeft, timeWarningShown, selectedOpt, currentIdx, userAnswers, submitQuiz, quiz, sessionAppId]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasStarted && !isFinished) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    const handlePopState = (e) => {
      if (hasStarted && !isFinished) {
        const confirmed = window.confirm('⚠️ Warning: If you go back, your quiz progress will be lost. Are you sure?');
        if (!confirmed) {
          window.history.pushState(null, '', window.location.href);
        } else {
          onBack();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    if (hasStarted && !isFinished) {
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasStarted, isFinished, onBack]);

  const handleStart = () => {
    if (!user) {
      localStorage.setItem('pendingQuizId', quiz.id);
      navigate('/login?redirect=quiz');
      return;
    }
    setSessionAppId('QAPP-' + Math.random().toString(36).substring(2, 10).toUpperCase());
    setHasStarted(true);
    localStorage.removeItem('pendingQuizId');
  };

  const handleNext = () => {
    const updatedAnswers = { ...userAnswers, [currentIdx]: selectedOpt };
    setUserAnswers(updatedAnswers);
    
    if (currentIdx + 1 < quiz.questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(userAnswers[currentIdx + 1] !== undefined ? userAnswers[currentIdx + 1] : null);
    } else {
      setIsFinished(true);
      
      // Calculate final score
      let finalScore = 0;
      quiz.questions.forEach((q, idx) => {
        if (updatedAnswers[idx] === q.answer) finalScore += 1;
      });
      setScore(finalScore);
      submitQuiz(quiz, finalScore, sessionAppId);
    }
  };

  const handlePrev = () => {
    setUserAnswers(prev => ({ ...prev, [currentIdx]: selectedOpt }));
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setSelectedOpt(userAnswers[currentIdx - 1] !== undefined ? userAnswers[currentIdx - 1] : null);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePayNow = async () => {
    try {
      const amount = settings?.quizProcessingFee || 19;
      const orderRes = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, receipt: `quiz_${quiz.id}` })
      });
      const order = await orderRes.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummykey',
        amount: order.amount,
        currency: order.currency,
        name: "Skillzeno",
        description: "Quiz Certificate Fee",
        order_id: order.id,
        handler: function (response) {
          localStorage.setItem('pendingPayment', JSON.stringify({
            type: 'quiz',
            quizId: quiz.id,
            verificationData: response
          }));
          window.location.href = '/payment-success';
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: {
          color: "#4f46e5"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert("Payment Failed. Reason: " + response.error.description);
      });
      rzp.open();
    } catch (err) {
      alert("Failed to initialize payment gateway.");
      console.error(err);
    }
  };

  const handleMaybeLater = () => {
    setShowPaymentModal(false);
  };

  if (!hasStarted) {
    return (
      <div className="container fade-in">
        <button onClick={() => {
          if (hasStarted && !isFinished) {
            const confirmed = window.confirm('⚠️ Warning: If you go back, your quiz progress will be lost and you will have to start from the beginning. Are you sure?');
            if (confirmed) onBack();
          } else {
            onBack();
          }
        }} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <ArrowLeft size={16} /> Back to Quizzes
        </button>

        <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', maxWidth: '700px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>{quiz.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '32px', lineHeight: '1.6' }}>
            {quiz.description}
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
            <div style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}>
                <Clock size={24} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Time Limit</h4>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '1.1rem' }}>{quiz.timeLimit} Minutes</p>
              </div>
            </div>
            <div style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '50%', color: 'var(--primary)' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Questions</h4>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '1.1rem' }}>{quiz.questions.length}</p>
              </div>
            </div>
          </div>

          <button onClick={handleStart} className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
            Start Quiz Now
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="container fade-in">
        <button onClick={onBack} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <ArrowLeft size={16} /> Back to Quizzes
        </button>

        <div style={{ background: 'var(--bg-secondary)', padding: '60px 40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <Trophy size={64} color="var(--primary)" style={{ marginBottom: '24px' }} />
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Quiz Completed!</h1>
          
          <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
            {score} <span style={{ fontSize: '2rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ {quiz.questions.length}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '16px' }}>Your final score has been recorded.</p>
          {existingApp && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--bg-primary)', borderRadius: '20px', border: '1px solid var(--border-color)', marginBottom: '40px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
              <ShieldCheck size={16} color="var(--primary)" /> Application No: <strong>{existingApp.id}</strong>
            </div>
          )}

          <div style={{ background: 'var(--bg-primary)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={20} color="var(--primary)" /> Download Certificate
            </h3>
            
            {existingApp && existingApp.certificateUrl ? (
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Your certificate is ready!</p>
                <a href={existingApp.certificateUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                  Download Certificate <Download size={16} />
                </a>
              </div>
            ) : existingApp && existingApp.paymentSubmitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', background: 'var(--accent-warning-light)', borderRadius: '8px', border: '1px solid var(--accent-warning)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={24} color="var(--accent-warning)" />
                  <p style={{ margin: 0, color: 'var(--accent-warning)', fontWeight: '600', fontSize: '1.1rem' }}>Payment Submitted Successfully!</p>
                </div>
                <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: '1.5' }}>
                  Your certificate will be sent via email within <strong>24 hours</strong>, or you can download it directly from this page once verified by the admin.
                </p>
                <button onClick={onBack} className="btn btn-outline" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>
                  To process and issue your verified completion certificate, a processing fee of <strong>₹{settings.quizProcessingFee || '199.00'}</strong> is required.
                </p>
                <button onClick={() => setShowPaymentModal(true)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={18} /> Proceed to Download
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 1000, overflowY: 'auto' }}>
            <div style={{
              background: '#fff',
              padding: '40px 32px',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '450px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
              position: 'relative'
            }}>
              <button 
                onClick={handleMaybeLater}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#888' }}
              >
                ✕
              </button>
              <h2 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: '800', color: '#111' }}>Unlock This Certificate</h2>
              <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.5' }}>
                Unlock your verified completion certificate & premium benefits instantly.
              </p>

              <div style={{ background: '#f8f9ff', padding: '24px', borderRadius: '16px', marginBottom: '24px', border: '1px solid #eef0ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '1rem', color: '#666' }}>Amount to pay</span>
                  <span style={{ fontSize: '2rem', fontWeight: '800', color: '#111' }}>₹{settings?.quizProcessingFee || '199'}</span>
                </div>
                <p style={{ color: '#555', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '12px' }}>
                  Verified certificate download, verified link access, and letter of recommendation.
                </p>
                <div style={{ display: 'inline-block', background: '#e8fff0', color: '#0d9f45', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>
                  ✨ Premium offer just for you! ✨
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  onClick={handlePayNow}
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '14px', fontSize: '1rem', fontWeight: '600', borderRadius: '12px', background: '#5d5fef', border: 'none' }}
                >
                  Pay Now
                </button>
                <button 
                  onClick={handleMaybeLater}
                  className="btn btn-outline" 
                  style={{ flex: 1, padding: '14px', fontSize: '1rem', fontWeight: '600', borderRadius: '12px', borderColor: '#eee', color: '#555' }}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container fade-in">
      <div className="quiz-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Question {currentIdx + 1} of {quiz.questions.length}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={12} /> App No: {sessionAppId}</span>
          </div>
          <span style={{ 
            display: 'flex', alignItems: 'center', gap: '6px', 
            color: timeLeft <= 30 ? '#fff' : timeLeft <= 60 ? 'var(--accent-danger)' : 'var(--primary)',
            background: timeLeft <= 30 ? 'var(--accent-danger)' : 'transparent',
            padding: timeLeft <= 30 ? '6px 14px' : '0',
            borderRadius: timeLeft <= 30 ? '8px' : '0',
            fontWeight: timeLeft <= 30 ? '700' : '400',
            animation: timeLeft <= 30 ? 'pulse 1s infinite' : 'none'
          }}>
            {timeLeft <= 30 && <AlertTriangle size={16} />}
            <Clock size={16} /> {formatTime(timeLeft)}
          </span>
        </div>

        {timeWarningShown && timeLeft <= 30 && timeLeft > 0 && (
          <div style={{ 
            background: 'linear-gradient(135deg, #fff5f5, #ffe0e0)', 
            border: '1px solid #fca5a5', 
            padding: '12px 20px', 
            borderRadius: '12px', 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#b91c1c'
          }}>
            <AlertTriangle size={18} />
            ⏰ Hurry up! Only {timeLeft} seconds remaining. The quiz will auto-submit when time runs out.
          </div>
        )}

        <h3 style={{ fontSize: '1.35rem', marginBottom: '32px', lineHeight: '1.5' }}>
          {quiz.questions[currentIdx].question}
        </h3>

        <div className="option-list">
          {quiz.questions[currentIdx].options.map((opt, i) => (
            <button 
              key={i} 
              onClick={() => setSelectedOpt(i)} 
              className={`option-btn ${selectedOpt === i ? 'selected' : ''}`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
          <button 
            className="btn btn-outline" 
            disabled={currentIdx === 0}
            onClick={handlePrev}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: currentIdx === 0 ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <button 
            className="btn btn-primary" 
            disabled={selectedOpt === null}
            onClick={handleNext}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {currentIdx + 1 === quiz.questions.length ? 'Submit Quiz' : 'Next Question'}
            {currentIdx + 1 < quiz.questions.length && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
