import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sword, ArrowLeft, Trophy, Keyboard, Heart } from 'lucide-react';
import SEO from '../../components/SEO';
import { AuthContext } from '../../context/AuthContext';
import './arena.css';

const WORDS_BANK = [
  "javascript", "react", "frontend", "cyber", "ninja", "developer",
  "skillzeno", "programming", "database", "algorithm", "interface",
  "component", "server", "authentication", "deployment", "function",
  "variable", "constant", "iteration", "execution", "compilation",
  "warrior", "sword", "shield", "blade", "strike", "power", "magic"
];

const INITIAL_HEALTH = 100;
const DAMAGE_PER_WORD = 15;

export default function ArenaWordNinja() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [gameState, setGameState] = useState('start'); // start, playing, gameover, victory
  const [currentWord, setCurrentWord] = useState('');
  const [typedIndex, setTypedIndex] = useState(0);
  const [enemyHealth, setEnemyHealth] = useState(INITIAL_HEALTH);
  const [score, setScore] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRandomWord = () => {
    return WORDS_BANK[Math.floor(Math.random() * WORDS_BANK.length)];
  };

  const startGame = () => {
    setGameState('playing');
    setEnemyHealth(INITIAL_HEALTH);
    setScore(0);
    setCurrentWord(getRandomWord());
    setTypedIndex(0);
  };

  const handleGameOver = async (won) => {
    setGameState(won ? 'victory' : 'gameover');
    if (!token) return;
    
    setIsSubmitting(true);
    try {
      // Reusing speed rush endpoint to save score
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
      console.error("Failed to submit score", err);
    }
    setIsSubmitting(false);
  };

  const triggerAttack = () => {
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 300); // 300ms slash animation
  };

  const triggerError = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400); // 400ms shake animation
  };

  const handleKeyDown = useCallback((e) => {
    if (gameState !== 'playing') return;
    
    // Ignore meta keys
    if (e.key.length !== 1) return;

    const char = e.key.toLowerCase();
    const expectedChar = currentWord[typedIndex];

    if (char === expectedChar) {
      // Correct character
      const nextIndex = typedIndex + 1;
      setTypedIndex(nextIndex);

      if (nextIndex === currentWord.length) {
        // Word completed! Attack!
        triggerAttack();
        setScore(s => s + 10);
        const newHealth = Math.max(0, enemyHealth - DAMAGE_PER_WORD);
        setEnemyHealth(newHealth);
        
        if (newHealth === 0) {
          setTimeout(() => handleGameOver(true), 500);
        } else {
          // Next word
          setTimeout(() => {
            setCurrentWord(getRandomWord());
            setTypedIndex(0);
          }, 200); // Slight delay for attack effect to register
        }
      }
    } else {
      // Wrong character
      triggerError();
    }
  }, [gameState, currentWord, typedIndex, enemyHealth]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <SEO title="Word Ninja | Arena | SkillZeno" />
      <div className="arena-page-wrapper">
        <div className="arena-container fade-in" style={{ position: 'relative', zIndex: 2, maxWidth: '800px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <button onClick={() => navigate('/arena')} className="btn btn-outline" style={{ border: 'none', padding: '0.5rem' }}>
              <ArrowLeft size={24} />
            </button>
            <h1 className="arena-title" style={{ margin: '0 auto', fontSize: '2rem' }}>
              <Keyboard size={32} color="#10b981" />
              Word Ninja
            </h1>
            <div style={{ width: '40px' }}></div>
          </div>

          <div className="arena-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            
            {gameState === 'start' && (
              <div>
                <Sword size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready to Fight?</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                  Type the words perfectly to attack the monster. <br/>
                  Fast fingers will bring victory!
                </p>
                <button className="arena-start-btn" onClick={startGame} style={{ maxWidth: '300px', margin: '0 auto', background: 'linear-gradient(45deg, #10b981, #059669)' }}>
                  Start Game ⚔️
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <div className={`ninja-battlefield ${isShaking ? 'shake-error' : ''}`}>
                {/* Enemy Area */}
                <div className="enemy-area" style={{ marginBottom: '3rem', position: 'relative' }}>
                  <div className="health-bar-container" style={{ width: '200px', height: '20px', background: '#333', borderRadius: '10px', margin: '0 auto 1rem', overflow: 'hidden' }}>
                    <div className="health-bar-fill" style={{ width: `${enemyHealth}%`, height: '100%', background: enemyHealth > 30 ? '#10b981' : '#ef4444', transition: 'width 0.3s ease, background 0.3s ease' }}></div>
                  </div>
                  <div className={`monster-sprite ${isAttacking ? 'flash-damage' : ''}`} style={{ fontSize: '6rem', transition: '0.2s', filter: isAttacking ? 'brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)' : 'none' }}>
                    👾
                  </div>
                  {/* Slash Effect overlay */}
                  {isAttacking && <div className="slash-animation"></div>}
                </div>

                {/* Word Typing Area */}
                <div className="word-area" style={{ fontSize: '3rem', fontFamily: 'monospace', letterSpacing: '4px', fontWeight: 'bold' }}>
                  {currentWord.split('').map((char, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        color: idx < typedIndex ? '#10b981' : 'var(--text-color)',
                        textShadow: idx < typedIndex ? '0 0 10px rgba(16,185,129,0.5)' : 'none',
                        borderBottom: idx === typedIndex ? '3px solid #10b981' : 'none'
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Score: {score}</p>
              </div>
            )}

            {(gameState === 'gameover' || gameState === 'victory') && (
              <div>
                <Trophy size={64} color={gameState === 'victory' ? "#eab308" : "#ef4444"} style={{ margin: '0 auto 1.5rem' }} />
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: gameState === 'victory' ? '#eab308' : '#ef4444' }}>
                  {gameState === 'victory' ? 'VICTORY!' : 'GAME OVER'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
                  You scored <strong>{score}</strong> points.
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button className="btn btn-outline" onClick={() => navigate('/arena')} style={{ padding: '1rem 2rem' }}>
                    Quit
                  </button>
                  <button className="arena-start-btn" onClick={startGame} disabled={isSubmitting} style={{ margin: 0, padding: '1rem 2rem', width: 'auto', background: 'linear-gradient(45deg, #10b981, #059669)' }}>
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
