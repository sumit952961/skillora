import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Clock, Trophy, AlertTriangle, ArrowLeft } from 'lucide-react';
import './arena.css';
import SEO from '../../components/SEO';
import { AuthContext } from '../../context/AuthContext';

const MAX_TIME = 3; // 3 seconds per question

export default function ArenaSpeedRush() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [gameState, setGameState] = useState('start'); // start, playing, gameover
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate a simple math question
  const generateQuestion = useCallback(() => {
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let a, b, correctAnswer;

    if (operator === '+') {
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      correctAnswer = a + b;
    } else if (operator === '-') {
      a = Math.floor(Math.random() * 50) + 20;
      b = Math.floor(Math.random() * 20) + 1;
      correctAnswer = a - b;
    } else {
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 10) + 2;
      correctAnswer = a * b;
    }

    // Generate 3 wrong options close to the right answer
    const optionsSet = new Set([correctAnswer]);
    while (optionsSet.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrongAnswer = correctAnswer + offset;
      if (wrongAnswer !== correctAnswer && wrongAnswer > 0) {
        optionsSet.add(wrongAnswer);
      } else if (wrongAnswer <= 0) {
        optionsSet.add(correctAnswer + Math.floor(Math.random() * 10) + 1);
      }
    }

    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    setQuestion({
      text: `${a} ${operator} ${b} = ?`,
      options,
      correctAnswer
    });
    setTimeLeft(MAX_TIME);
  }, []);

  const startGame = () => {
    setScore(0);
    setGameState('playing');
    generateQuestion();
  };

  const handleGameOver = useCallback(async () => {
    setGameState('gameover');
    if (score > 0 && token) {
      setIsSubmitting(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';
        await fetch(`${API_URL}/arena/speed-rush/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ score })
        });
      } catch (err) {
        console.error('Failed to save score', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [score, token]);

  const handleAnswer = (selectedOption) => {
    if (selectedOption === question.correctAnswer) {
      setScore(prev => prev + 1);
      generateQuestion();
    } else {
      handleGameOver();
    }
  };

  useEffect(() => {
    let timer;
    if (gameState === 'playing') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, handleGameOver]);

  return (
    <>
      <SEO title="Speed Rush | Arena | SkillZeno" />
      <div className="arena-container fade-in" style={{ maxWidth: '600px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/arena')} className="btn btn-outline" style={{ border: 'none', padding: '0.5rem' }}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="arena-title" style={{ margin: '0 auto', fontSize: '2rem' }}>
            <Zap size={32} color="#eab308" />
            Speed Rush
          </h1>
          <div style={{ width: '40px' }}></div>
        </div>

        <div className="arena-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          
          {gameState === 'start' && (
            <div>
              <Zap size={64} color="#eab308" style={{ margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready for Speed Rush?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                You have exactly <strong>3 seconds</strong> to solve each math problem.<br/>
                One wrong answer or timeout = <strong>Game Over</strong>.
              </p>
              <button className="arena-start-btn" onClick={startGame} style={{ maxWidth: '300px', margin: '0 auto' }}>
                Start Game ⚡
              </button>
            </div>
          )}

          {gameState === 'playing' && question && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div className="arena-streak">
                  <Trophy size={20} /> Score: {score}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', fontWeight: 'bold', color: timeLeft <= 1 ? 'var(--accent-danger)' : 'var(--text-main)' }}>
                  <Clock size={24} /> 00:0{timeLeft}
                </div>
              </div>

              {/* Progress Bar Timer */}
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-main)', borderRadius: '4px', marginBottom: '3rem', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${(timeLeft / MAX_TIME) * 100}%`, 
                  background: timeLeft <= 1 ? 'var(--accent-danger)' : '#eab308',
                  transition: 'width 1s linear, background 0.3s'
                }}></div>
              </div>

              <h2 className="arena-question-text" style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>
                {question.text}
              </h2>

              <div className="arena-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {question.options.map((opt, idx) => (
                  <button 
                    key={idx}
                    className="arena-option" 
                    onClick={() => handleAnswer(opt)}
                    style={{ textAlign: 'center', fontSize: '1.5rem', padding: '1.5rem' }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="fade-in">
              <AlertTriangle size={64} color="var(--accent-danger)" style={{ margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--accent-danger)' }}>GAME OVER</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
                You survived <strong>{score}</strong> rounds!
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-outline" onClick={() => navigate('/arena')} style={{ padding: '1rem 2rem' }}>
                  Quit
                </button>
                <button className="arena-start-btn" onClick={startGame} disabled={isSubmitting} style={{ margin: 0, padding: '1rem 2rem', width: 'auto' }}>
                  {isSubmitting ? 'Saving...' : 'Play Again 🔄'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
