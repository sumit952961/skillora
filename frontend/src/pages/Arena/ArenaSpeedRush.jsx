import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Clock, Trophy, AlertTriangle, ArrowLeft, Heart } from 'lucide-react';
import './arena.css';
import SEO from '../../components/SEO';
import { AuthContext } from '../../context/AuthContext';

const MAX_TIME = 5; // 5 seconds per question

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const COLORS = [
  { p1: 'Red', p2: 'Blue', res: 'Purple' },
  { p1: 'Red', p2: 'Yellow', res: 'Orange' },
  { p1: 'Blue', p2: 'Yellow', res: 'Green' },
  { p1: 'var(--text-main)', p2: 'var(--bg-secondary)', res: 'Gray' },
  { p1: 'Red', p2: 'var(--bg-secondary)', res: 'Pink' }
];
const WORDS = ['APPLE', 'BANANA', 'ORANGE', 'TIGER', 'WATER', 'EARTH', 'SPACE', 'REACT', 'PYTHON', 'LAPTOP'];

export default function ArenaSpeedRush() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [gameState, setGameState] = useState('start'); // start, playing, gameover
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lives, setLives] = useState(3);

  // Massive procedural generator for infinite combinations
  const generateQuestion = useCallback(() => {
    const types = ['math_basic', 'math_divide', 'series', 'days', 'word_len', 'colors', 'compare'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let text = '';
    let correctAnswer = '';
    let optionsSet = new Set();

    if (type === 'math_basic') {
      const operators = ['+', '-', '*'];
      const op = operators[Math.floor(Math.random() * operators.length)];
      let a, b;
      if (op === '+') { a = Math.floor(Math.random() * 80) + 10; b = Math.floor(Math.random() * 80) + 10; correctAnswer = String(a + b); }
      else if (op === '-') { a = Math.floor(Math.random() * 80) + 30; b = Math.floor(Math.random() * 30) + 1; correctAnswer = String(a - b); }
      else { a = Math.floor(Math.random() * 12) + 3; b = Math.floor(Math.random() * 12) + 3; correctAnswer = String(a * b); }
      text = `${a} ${op} ${b} = ?`;
      optionsSet.add(correctAnswer);
      while(optionsSet.size < 4) { optionsSet.add(String(parseInt(correctAnswer) + Math.floor(Math.random() * 15) - 7 || parseInt(correctAnswer) + 2)); }
    } 
    else if (type === 'math_divide') {
      const b = Math.floor(Math.random() * 10) + 2;
      const ans = Math.floor(Math.random() * 12) + 2;
      const a = b * ans;
      correctAnswer = String(ans);
      text = `${a} / ${b} = ?`;
      optionsSet.add(correctAnswer);
      while(optionsSet.size < 4) { optionsSet.add(String(ans + Math.floor(Math.random() * 6) - 2 || ans + 1)); }
    }
    else if (type === 'series') {
      const diff = Math.floor(Math.random() * 10) + 2;
      const start = Math.floor(Math.random() * 20) + 1;
      correctAnswer = String(start + diff * 3);
      text = `${start}, ${start + diff}, ${start + diff * 2}, ?`;
      optionsSet.add(correctAnswer);
      while(optionsSet.size < 4) { optionsSet.add(String(parseInt(correctAnswer) + Math.floor(Math.random() * 10) - 4 || parseInt(correctAnswer)+diff)); }
    }
    else if (type === 'days') {
      const todayIdx = Math.floor(Math.random() * 7);
      const isTomorrow = Math.random() > 0.5;
      text = `If Today is ${DAYS[todayIdx]}, ${isTomorrow ? 'Tomorrow' : 'Yesterday'} is?`;
      correctAnswer = isTomorrow ? DAYS[(todayIdx + 1) % 7] : DAYS[(todayIdx + 6) % 7];
      optionsSet.add(correctAnswer);
      while(optionsSet.size < 4) { optionsSet.add(DAYS[Math.floor(Math.random() * 7)]); }
    }
    else if (type === 'word_len') {
      const word = WORDS[Math.floor(Math.random() * WORDS.length)];
      text = `Letters in '${word}'?`;
      correctAnswer = String(word.length);
      optionsSet.add(correctAnswer);
      while(optionsSet.size < 4) { optionsSet.add(String(word.length + Math.floor(Math.random() * 4) - 1 || word.length + 2)); }
    }
    else if (type === 'colors') {
      const mix = COLORS[Math.floor(Math.random() * COLORS.length)];
      text = `${mix.p1} + ${mix.p2} = ?`;
      correctAnswer = mix.res;
      optionsSet.add(correctAnswer);
      while(optionsSet.size < 4) { optionsSet.add(COLORS[Math.floor(Math.random() * COLORS.length)].res); }
    }
    else if (type === 'compare') {
      const a = Math.floor(Math.random() * 90) + 10;
      const b = Math.floor(Math.random() * 90) + 10;
      if (a === b) { text = `Which is larger?`; correctAnswer = 'Equal'; }
      else { text = `Which is larger?`; correctAnswer = String(Math.max(a, b)); }
      optionsSet.add(String(a)); optionsSet.add(String(b)); optionsSet.add('Equal'); optionsSet.add(String(a+b));
    }

    const options = Array.from(optionsSet).slice(0, 4).sort(() => Math.random() - 0.5);

    setQuestion({ text, options, correctAnswer });  
    setTimeLeft(MAX_TIME);
  }, []);

  const startGame = () => {
    setScore(0);
    setLives(3);
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
      setLives(prev => {
        if (prev > 1) {
          generateQuestion();
          return prev - 1;
        } else {
          handleGameOver();
          return 0;
        }
      });
    }
  };

  const handleTimeout = useCallback(() => {
    setLives(prev => {
      if (prev > 1) {
        generateQuestion();
        return prev - 1;
      } else {
        handleGameOver();
        return 0;
      }
    });
  }, [generateQuestion, handleGameOver]);

  useEffect(() => {
    let timer;
    if (gameState === 'playing') {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, handleTimeout]);

  return (
    <>
      <SEO title="Speed Rush | Arena | SkillZeno" />
      <div className="arena-page-wrapper">
        <div className="arena-container fade-in" style={{ position: 'relative', zIndex: 2, maxWidth: '600px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="arena-title" style={{ margin: '0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={32} color='var(--accent-warning)' />
            Speed Rush
          </h1>
        </div>

        <div className="arena-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          
          {gameState === 'start' && (
            <div>
              <Zap size={64} color='var(--accent-warning)' style={{ margin: '0 auto 1.5rem' }} />
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready for Speed Rush?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                You have exactly <strong>5 seconds</strong> to solve each problem.<br/>
                You have <strong>3 lives (❤️)</strong>. Lose them all and it's <strong>Game Over</strong>.
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
                
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[...Array(3)].map((_, i) => (
                    <Heart 
                      key={i} 
                      size={24} 
                      color={i < lives ? 'var(--accent-danger)' : "#4b5563"} 
                      fill={i < lives ? 'var(--accent-danger)' : "transparent"} 
                    />
                  ))}
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
                  background: timeLeft <= 1 ? 'var(--accent-danger)' : 'var(--accent-warning)',
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
      </div>
    </>
  );
}
