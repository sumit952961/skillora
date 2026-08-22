import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Clock, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO';

export default function ContestArena() {
  const { id: contestId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [contest, setContest] = useState(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(null);
  const [warnings, setWarnings] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';

  useEffect(() => {
    if (user && contestId) {
      fetchArenaData();
    }
  }, [user, contestId]);

  const fetchArenaData = async () => {
    try {
      const res = await fetch(`${API_URL}/contests/arena/${contestId}/${user?._id || user?.id}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to load contest arena.");
      }
      
      setContest(data.contest);
      setQuestions(data.questions);
      // Initialize timer
      setTimeLeft(data.contest.timeLimitMinutes * 60);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmitTest = useCallback(async (isAutoSubmit = false) => {
    if (isSubmitting) return;
    if (!isAutoSubmit) {
      const confirmed = window.confirm("Are you sure you want to submit your test?");
      if (!confirmed) return;
    }
    
    setIsSubmitting(true);
    
    // Calculate time taken
    const totalTime = contest.timeLimitMinutes * 60;
    const timeTaken = totalTime - timeLeft;

    try {
      const res = await fetch(`${API_URL}/contests/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?._id || user?.id,
          contestId: contest._id,
          answers,
          timeTaken
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        setScore(data.score);
      } else {
        alert(data.message || "Failed to submit test.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting test.");
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, contest, isSubmitting, timeLeft, user, API_URL]);

  // Timer logic
  useEffect(() => {
    if (loading || score !== null) return;
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleSubmitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [loading, score, handleSubmitTest]);

  // Anti-Cheat Logic
  useEffect(() => {
    if (loading || score !== null) return;

    const handleCheat = (reason) => {
      setWarnings(prev => {
        const newWarnings = prev + 1;
        if (newWarnings >= 2) {
          alert(`Violation: ${reason}.\nYou have exceeded the warning limit. Test is automatically submitting.`);
          handleSubmitTest(true);
        } else {
          alert(`Warning (${newWarnings}/2): ${reason}.\nDo not do this again or your test will be submitted!`);
        }
        return newWarnings;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleCheat("Tab switching or minimizing window is not allowed");
      }
    };

    const preventCopyPaste = (e) => e.preventDefault();
    const preventContextMenu = (e) => e.preventDefault();
    const preventShortcuts = (e) => {
      if (e.key === 'PrintScreen') {
        if (navigator.clipboard) navigator.clipboard.writeText(''); 
        handleCheat("Screenshots are not allowed");
        e.preventDefault();
      }
      if (e.key === 'F12') e.preventDefault();
      if (e.ctrlKey && ['c', 'v', 'x', 's', 'p'].includes(e.key.toLowerCase())) e.preventDefault();
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') e.preventDefault();
    };
    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen') {
        if (navigator.clipboard) navigator.clipboard.writeText('');
        handleCheat("Screenshots are not allowed");
      }
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    const handlePopState = () => {
      alert("Violation: Back navigation is not allowed. Test is automatically submitting.");
      handleSubmitTest(true);
    };

    // Push a dummy state to trap the back button
    window.history.pushState(null, null, window.location.pathname);

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", preventCopyPaste);
    document.addEventListener("paste", preventCopyPaste);
    document.addEventListener("cut", preventCopyPaste);
    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("keydown", preventShortcuts);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", preventCopyPaste);
      document.removeEventListener("paste", preventCopyPaste);
      document.removeEventListener("cut", preventCopyPaste);
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("keydown", preventShortcuts);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [loading, score, handleSubmitTest]);

  const handleOptionSelect = (qId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [qId]: optionIndex }));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}><h3>Loading Arena...</h3></div>;
  if (error) return <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}><h3 style={{ color: 'var(--accent-danger)' }}>{error}</h3><button className="btn btn-outline" onClick={() => navigate('/contests')} style={{ marginTop: '20px' }}>Go Back</button></div>;

  if (score !== null) {
    return (
      <div className="container fade-in" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <CheckCircle size={64} style={{ color: 'var(--accent-success)', margin: '0 auto 20px' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Test Submitted!</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '30px' }}>
          Your Score: <strong style={{ color: 'var(--text-main)' }}>{score} / {questions.length}</strong>
        </p>
        <button className="btn btn-primary" onClick={() => navigate(`/contests/leaderboard/${contest._id}`)}>
          View Leaderboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{ userSelect: 'none' }}>
      <SEO title={`${contest.title} - Live Arena | Skillzeno`} noindex={true} />
      
      {/* Sticky Header with Timer */}
      <div style={{ position: 'sticky', top: '70px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', zIndex: 10, padding: '16px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{contest.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 'bold', color: timeLeft < 60 ? 'var(--accent-danger)' : 'var(--text-main)', background: 'var(--bg-primary)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Clock size={20} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      <div className="container fade-in" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Question Card */}
        <div style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.3rem', lineHeight: '1.5', marginBottom: '24px' }}>
            <span style={{ color: 'var(--primary)', marginRight: '8px' }}>Q{currentQuestionIndex + 1}.</span>
            {currentQuestion.question}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = answers[currentQuestion._id] === idx;
              return (
                <div 
                  key={idx}
                  onClick={() => handleOptionSelect(currentQuestion._id, idx)}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--text-muted)'}`, background: isSelected ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <span style={{ fontSize: '1.05rem', color: isSelected ? 'var(--primary-dark)' : 'var(--text-main)' }}>{opt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)} 
            disabled={currentQuestionIndex === 0}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ChevronLeft size={18} /> Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button 
              className="btn btn-primary" 
              onClick={() => handleSubmitTest(false)}
              disabled={isSubmitting}
              style={{ background: 'var(--accent-success)', borderColor: 'var(--accent-success)' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Next <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
