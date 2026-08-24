import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, Flame, Loader2 } from 'lucide-react';
import './arena.css';
import SEO from '../../components/SEO';
import { AuthContext } from '../../context/AuthContext';

export default function ArenaGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  const category = location.state?.category || { name: 'General', icon: '❓' };
  const sessionId = location.state?.sessionId;
  
  const [currentQ, setCurrentQ] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState('easy');
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/arena');
      return;
    }
    fetchQuestion();
    // eslint-disable-next-line
  }, []);

  const fetchQuestion = async () => {
    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';
      const res = await fetch(`${API_URL}/arena/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentQ(data);
      } else {
        alert(data.message || "Failed to load question.");
      }
    } catch (err) {
      alert("Network error. Could not fetch question.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = async (opt) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';
      const res = await fetch(`${API_URL}/arena/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId, answer: opt })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(data);
        setStreak(data.streak);
        setDifficulty(data.newDifficulty);
      } else {
        alert(data.message || "Failed to submit answer.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setFeedback(null);
    setCurrentQ(null);
    fetchQuestion();
  };

  const endChallenge = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';
      const res = await fetch(`${API_URL}/arena/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/arena/result', { state: { session: data.session, category } });
      } else {
        alert("Failed to end session.");
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  const renderDifficulty = () => {
    switch(difficulty) {
      case 'easy': return <span className="arena-difficulty easy">🟢 Easy</span>;
      case 'medium': return <span className="arena-difficulty medium">🟡 Medium</span>;
      case 'hard': return <span className="arena-difficulty hard">🟠 Hard</span>;
      case 'expert': return <span className="arena-difficulty expert">🔴 Expert</span>;
      default: return <span className="arena-difficulty easy">🟢 Easy</span>;
    }
  };

  return (
    <>
      <SEO title="Playing Arena | SkillZeno" noindex={true} />
      <div className="arena-container fade-in">
        
        {!showConfirmEnd ? (
          <div className="arena-card">
            <div className="arena-game-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <Bot size={24} color="#FF6B6B" /> 
                <span>VS AI</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {renderDifficulty()}
                <div className="arena-streak">
                  <Flame size={20} /> {streak} Streak
                </div>
              </div>
            </div>

            <div className="arena-question-area">
              <p style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>
                {category.icon} {category.name}
              </p>
              
              {isLoading || !currentQ ? (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                  <Loader2 className="spin" size={48} color="var(--primary)" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                  <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Generating question...</p>
                </div>
              ) : (
                <>
                  <h2 className="arena-question-text">{currentQ.question}</h2>

                  <div className="arena-options">
                    {currentQ.options.map((opt, i) => {
                      let btnClass = "arena-option";
                      if (isAnswered && feedback) {
                        if (opt === feedback.correctAnswer) btnClass += " correct";
                        else if (opt === selectedOption) btnClass += " incorrect";
                      }
                      
                      return (
                        <button 
                          key={i}
                          className={btnClass}
                          onClick={() => handleOptionSelect(opt)}
                          disabled={isAnswered}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && feedback && (
                    <div className={`arena-feedback ${feedback.isCorrect ? 'success' : 'error'}`}>
                      {feedback.isCorrect ? (
                        <span>✅ Correct! +{feedback.xpGained} XP</span>
                      ) : (
                        <span>❌ Incorrect. Correct answer: {feedback.correctAnswer}</span>
                      )}
                      {feedback.explanation && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', fontWeight: 'normal' }}>
                          {feedback.explanation}
                        </p>
                      )}
                      <button className="arena-next-btn" onClick={nextQuestion}>
                        Next Question
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <button 
              className="arena-end-btn" 
              onClick={() => setShowConfirmEnd(true)}
              style={{ display: isAnswered || isLoading ? 'none' : 'block' }}
            >
              🛑 End Challenge
            </button>
          </div>
        ) : (
          <div className="arena-card" style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>End Challenge?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Are you sure you want to end this challenge? Your progress will be saved.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowConfirmEnd(false)}
                style={{ width: '100%' }}
              >
                Continue Playing
              </button>
              <button 
                className="btn btn-outline" 
                onClick={endChallenge}
                style={{ width: '100%', color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)' }}
              >
                End Challenge
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
