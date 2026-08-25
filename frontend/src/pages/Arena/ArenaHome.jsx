import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Zap } from 'lucide-react';
import './arena.css';
import SEO from '../../components/SEO';
import { AuthContext } from '../../context/AuthContext';

const CATEGORIES = [
  { id: 'math', name: 'Mathematics', icon: '🧮' },
  { id: 'reasoning', name: 'Reasoning', icon: '🧠' },
  { id: 'gk', name: 'General Knowledge', icon: '🌍' },
  { id: 'current_affairs', name: 'Current Affairs', icon: '📰' },
  { id: 'science', name: 'Science', icon: '🔬' },
  { id: 'english', name: 'English', icon: '🗣️' },
  { id: 'cs', name: 'Computer Science', icon: '💻' },
  { id: 'aptitude', name: 'Aptitude', icon: '🎯' },
  { id: 'interview', name: 'Interview Preparation', icon: '💼' }
];

export default function ArenaHome() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (selectedCategory) {
      setIsLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';
        const res = await fetch(`${API_URL}/arena/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ category: selectedCategory.name })
        });
        const data = await res.json();
        if (res.ok) {
          navigate(`/arena/play`, { state: { category: selectedCategory, sessionId: data.sessionId } });
        } else {
          alert(data.message || "Failed to start session");
        }
      } catch (err) {
        alert("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <SEO title="Arena | Can You Beat AI? | SkillZeno" />
      <div className="arena-page-wrapper">
        {/* Animated Game Background ONLY on selection screen */}
        {mode === null && <div className="game-bg-animation"></div>}
        
        <div className="arena-container fade-in" style={{ position: 'relative', zIndex: 2 }}>
          <div className="arena-header">
            <h1 className="arena-title">
              <Bot size={40} color="#FF6B6B" />
              WELCOME TO ARENA
            </h1>
            <p className="arena-subtitle">Choose your challenge mode</p>
          </div>

        {mode === null ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {/* Mode 1: Beat AI */}
            <div 
              className="arena-card" 
              onClick={() => setMode('beat_ai')} 
              style={{ cursor: 'pointer', border: '2px solid transparent', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <Bot size={60} color="#FF6B6B" style={{ marginBottom: '1rem' }} />
              <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Beat the AI</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1 }}>
                Challenge yourself with adaptive questions. The AI learns and gets harder as you perform better. Endless mode!
              </p>
              <button className="arena-start-btn" style={{ margin: 0, padding: '0.75rem' }}>Select Mode</button>
            </div>

            {/* Mode 2: Speed Rush */}
            <div 
              className="arena-card" 
              onClick={() => navigate('/arena/speed-rush')} 
              style={{ cursor: 'pointer', border: '2px solid transparent', transition: '0.3s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <Zap size={60} color="#eab308" style={{ marginBottom: '1rem' }} />
              <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Speed Rush</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1 }}>
                Extremely simple questions, but you only have 3 seconds per question! One mistake and it's Game Over.
              </p>
              <button className="arena-start-btn" style={{ margin: 0, padding: '0.75rem', width: '100%' }}>Select Mode</button>
            </div>
          </div>
        ) : mode === 'beat_ai' ? (
          <div className="arena-card">
            {step === 1 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <button className="btn btn-outline" onClick={() => setMode(null)} style={{ padding: '0.5rem 1rem' }}>← Back</button>
                  <h2 style={{ margin: 0, textAlign: 'center' }}>Choose Your Arena</h2>
                  <div style={{ width: '80px' }}></div>
                </div>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Challenge yourself with adaptive questions and see how far you can go against AI.
                </p>
                
                <div className="arena-categories">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      className={`arena-category-btn ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>

                <button 
                  className="arena-start-btn" 
                  onClick={() => setStep(2)}
                  disabled={!selectedCategory}
                >
                  Continue
                </button>
              </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Bot size={40} color="#FF6B6B" style={{ margin: '0 auto 0.5rem' }} />
              <h2 style={{ marginBottom: '1rem' }}>Ready to Face the AI?</h2>
              
              <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '12px', margin: '0 auto 1rem', maxWidth: '400px', textAlign: 'left' }}>
                <p style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>
                  <strong>Selected Category:</strong> <br/>
                  <span style={{ color: 'var(--primary)', display: 'inline-block', marginTop: '2px' }}>
                    {selectedCategory?.icon} {selectedCategory?.name}
                  </span>
                </p>
                <p style={{ fontSize: '1rem', marginBottom: 0 }}>
                  <strong>Starting Difficulty:</strong> <br/>
                  <span className="arena-difficulty easy" style={{ display: 'inline-flex', marginTop: '2px' }}>🟢 Easy</span>
                </p>
              </div>

              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Questions will become harder as your performance improves.<br/>
                This is an endless mode. Go as far as you can!
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-outline"
                  onClick={() => setStep(1)}
                  style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                >
                  Back
                </button>
                <button 
                  className="arena-start-btn" 
                  onClick={handleStart}
                  disabled={isLoading}
                  style={{ margin: 0, width: 'auto', padding: '1rem 2rem', flex: '1 1 auto', maxWidth: '250px' }}
                >
                  {isLoading ? 'Loading...' : '🚀 Start Challenge'}
                </button>
              </div>
            </div>
          )}
        </div>
        ) : null}
        </div>
      </div>
    </>
  );
}
