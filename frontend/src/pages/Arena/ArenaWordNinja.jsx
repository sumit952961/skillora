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

  const [isTypingHit, setIsTypingHit] = useState(false);

  const triggerWordComplete = () => {
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 400); // 400ms slash animation
  };

  const triggerTypingHit = () => {
    setIsTypingHit(true);
    setTimeout(() => setIsTypingHit(false), 150); // very quick hit per letter
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
      triggerTypingHit(); // trigger small attack per letter

      if (nextIndex === currentWord.length) {
        // Word completed! Big Attack!
        triggerWordComplete();
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
              <div className={`ninja-battlefield ${isShaking ? 'shake-error' : ''}`} style={{ position: 'relative', height: '400px', background: 'linear-gradient(to bottom, #1e3a8a 0%, #172554 100%)', borderRadius: '16px', overflow: 'hidden' }}>
                
                {/* 3D Scene Background Element (Cliff) */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '30%', background: '#0f172a', clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0% 100%)' }}></div>

                {/* Health Bar */}
                <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '250px', zIndex: 10 }}>
                  <div style={{ width: '100%', height: '12px', background: '#333', borderRadius: '6px', overflow: 'hidden', border: '1px solid #fff' }}>
                    <div style={{ width: `${enemyHealth}%`, height: '100%', background: enemyHealth > 30 ? '#10b981' : '#ef4444', transition: 'width 0.3s' }}></div>
                  </div>
                </div>

                {/* Characters */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'absolute', bottom: '20%', width: '100%', padding: '0 15%' }}>
                  {/* Player Character */}
                  <div className={`player-character ${isTypingHit ? 'attack-dash' : ''}`} style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.6))', zIndex: 5 }}>
                    🥷
                  </div>
                  {/* Projectile */}
                  {isTypingHit && <div className="projectile-animation">✨</div>}
                  
                  {/* Enemy Character */}
                  <div className={`monster-sprite ${isAttacking ? 'flash-damage' : ''}`} style={{ fontSize: '5rem', filter: 'drop-shadow(0 0 15px rgba(239,68,68,0.5))', zIndex: 5 }}>
                    👹
                  </div>
                </div>
                {/* Big Slash Effect overlay */}
                {isAttacking && <div className="slash-animation"></div>}

                {/* Word Typing Area (Floating Blue Boxes) */}
                <div className="word-area" style={{ position: 'absolute', top: '30%', left: '0', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
                  {currentWord.split('').map((char, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        width: '45px',
                        height: '55px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontFamily: 'sans-serif',
                        fontWeight: 'bold',
                        color: idx < typedIndex ? '#94a3b8' : '#ffffff',
                        background: idx < typedIndex ? 'rgba(30, 58, 138, 0.4)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        borderRadius: '8px',
                        boxShadow: idx < typedIndex ? 'none' : '0 4px 12px rgba(59,130,246,0.6)',
                        textTransform: 'lowercase',
                        transition: 'all 0.1s',
                        transform: idx === typedIndex ? 'scale(1.1)' : 'scale(1)'
                      }}
                    >
                      {char}
                    </div>
                  ))}
                </div>
                <p style={{ position: 'absolute', bottom: '10px', left: '20px', color: '#94a3b8', margin: 0 }}>Score: {score}</p>
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
