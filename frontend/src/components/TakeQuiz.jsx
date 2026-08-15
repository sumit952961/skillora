import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Download, CreditCard, X, Trophy, ShieldCheck } from 'lucide-react';

export default function TakeQuiz({ quiz, onBack }) {
  const { user, submitQuiz, processQuizPayment, quizApplications } = useContext(AuthContext);
  const { settings } = useContext(DataContext);
  const navigate = useNavigate();
  
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState(null);

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
    } else if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
      submitQuiz(quiz, score, sessionAppId);
    }
    return () => clearInterval(timer);
  }, [hasStarted, isFinished, timeLeft, score, submitQuiz, quiz, sessionAppId]);

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
    let currentScore = score;
    if (selectedOpt === quiz.questions[currentIdx].answer) {
      currentScore += 1;
      setScore(currentScore);
    }
    
    if (currentIdx + 1 < quiz.questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
    } else {
      setIsFinished(true);
      submitQuiz(quiz, currentScore, sessionAppId);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Compress image to avoid localStorage QuotaExceededError
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const MAX_DIMENSION = 800;
        if (width > height && width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress as JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setPaymentScreenshotPreview(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!transactionId.trim() || !paymentScreenshotPreview) {
      alert("Please provide both Transaction ID and Screenshot.");
      return;
    }
    processQuizPayment(quiz.id, {
      transactionId,
      paymentDate: new Date().toISOString().split('T')[0],
      screenshot: paymentScreenshotPreview
    });
    
    // Close modal first
    setShowPaymentModal(false);
    
    // Immediately return to grid
    onBack();

    // Show alert AFTER UI has updated
    setTimeout(() => {
      alert('Your payment details have been submitted. Your certificate will be sent via email within 24 hours or you can download it from the website once approved by admin.');
    }, 100);
  };

  if (!hasStarted) {
    return (
      <div className="container fade-in">
        <button onClick={onBack} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
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
            <div style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: '500px', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Certificate Processing</h3>
                <button onClick={() => setShowPaymentModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Scan the QR code below to pay <strong>₹{settings.quizProcessingFee || '199.00'}</strong></p>
                {settings.quizQrCode ? (
                  <img src={settings.quizQrCode} alt="Payment QR" style={{ width: '200px', height: '200px', objectFit: 'contain', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', background: '#fff' }} />
                ) : (
                  <div style={{ width: '200px', height: '200px', margin: '0 auto', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>QR Code not set by Admin</p>
                  </div>
                )}
              </div>

              <form onSubmit={handlePaymentSubmit}>
                <div className="form-group">
                  <label>Transaction ID / UTR</label>
                  <input required type="text" className="form-input" placeholder="Enter 12-digit UTR number" value={transactionId} onChange={e => setTransactionId(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Upload Payment Screenshot</label>
                  <input required type="file" accept="image/*" className="form-input" onChange={handleScreenshotChange} />
                </div>
                
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>Submit Details</button>
              </form>
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
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: timeLeft <= 60 ? 'var(--accent-danger)' : 'var(--primary)' }}>
            <Clock size={16} /> {formatTime(timeLeft)}
          </span>
        </div>

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

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
          <button 
            className="btn btn-primary" 
            disabled={selectedOpt === null}
            onClick={handleNext}
          >
            {currentIdx + 1 === quiz.questions.length ? 'Submit Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
}
