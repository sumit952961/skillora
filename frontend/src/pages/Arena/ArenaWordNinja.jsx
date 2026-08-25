import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sword, ArrowLeft, Trophy, Keyboard, Heart } from 'lucide-react';
import SEO from '../../components/SEO';
import { AuthContext } from '../../context/AuthContext';
import './arena.css';

const INITIAL_HEALTH = 100;
const DAMAGE_PER_WORD = 20;

const MONSTERS = ["👾", "👹", "👽", "👻", "🤖", "🤡", "🧟"];

// Generate random string of characters (gibberish)
const generateGibberish = (score) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  // Length increases as score gets higher
  const length = Math.min(10, Math.max(4, Math.floor(score / 50) + 4));
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function ArenaWordNinja() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [gameState, setGameState] = useState('start'); // start, playing, gameover, victory
  const [currentWord, setCurrentWord] = useState('');
  const [typedIndex, setTypedIndex] = useState(0);
  const [enemyHealth, setEnemyHealth] = useState(INITIAL_HEALTH);
  const [currentMonster, setCurrentMonster] = useState(MONSTERS[0]);
  const [score, setScore] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isEnemyAttacking, setIsEnemyAttacking] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Timer state
  const [wordStartTime, setWordStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lastWordTime, setLastWordTime] = useState(null);

  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - wordStartTime);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [gameState, wordStartTime]);

  const startGame = () => {
    setGameState('playing');
    setEnemyHealth(INITIAL_HEALTH);
    setCurrentMonster(MONSTERS[Math.floor(Math.random() * MONSTERS.length)]);
    setScore(0);
    setCurrentWord(generateGibberish(0));
    setTypedIndex(0);
    setWordStartTime(Date.now());
    setElapsedTime(0);
    setLastWordTime(null);
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
    setIsEnemyAttacking(true); // Enemy shoots back!
    setTimeout(() => {
      setIsShaking(false);
      setIsEnemyAttacking(false);
    }, 400); 
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
        const newScore = score + 10;
        setScore(newScore);
        
        let newHealth = enemyHealth - DAMAGE_PER_WORD;
        
        if (newHealth <= 0) {
          // Monster defeated, respawn a new one immediately!
          newHealth = INITIAL_HEALTH;
          setCurrentMonster(MONSTERS[Math.floor(Math.random() * MONSTERS.length)]);
        }
        
        setEnemyHealth(newHealth);
        
        // Next random gibberish word
        setTimeout(() => {
          setLastWordTime((Date.now() - wordStartTime) / 1000); // record time taken for the word
          setCurrentWord(generateGibberish(newScore));
          setTypedIndex(0);
          setWordStartTime(Date.now());
          setElapsedTime(0);
        }, 200); 
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
      <SEO 
        title="Word Ninja | Fast Typing Game | SkillZeno Arena"
        description="Type fast to survive! Play Word Ninja in the SkillZeno Arena, a typing battle where you defeat monsters by typing falling words accurately."
        canonical="/arena/word-ninja"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Word Ninja - SkillZeno Arena",
          "description": "Type fast to survive! Play Word Ninja in the SkillZeno Arena, a typing battle where you defeat monsters by typing falling words accurately.",
          "url": "https://skillzeno.in/arena/word-ninja"
        }}
      />
      <div className="arena-page-wrapper" style={{ padding: '0', margin: '0', maxWidth: '100vw', overflowX: 'hidden' }}>
        <div className="arena-container fade-in" style={{ position: 'relative', zIndex: 2, maxWidth: '100%', padding: gameState === 'playing' ? '0' : '1rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem', padding: '0 2rem' }}>
            <h1 className="arena-title" style={{ margin: '0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Keyboard size={32} color='var(--accent-success)' />
              Word Ninja
            </h1>
          </div>

          <div style={{ width: '100%' }}>
            
            {gameState === 'start' && (
              <div className="arena-card" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
                <Sword size={64} color='var(--accent-success)' style={{ margin: '0 auto 1.5rem' }} />
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready to Fight?</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                  Type the words perfectly to attack the monster. <br/>
                  Fast fingers will bring victory!
                </p>
                <button className="arena-start-btn" onClick={startGame} style={{ maxWidth: '300px', margin: '0 auto', background: 'var(--accent-success)' }}>
                  Start Game ⚔️
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <div className={`ninja-battlefield ${isShaking ? 'shake-error' : ''}`} style={{ position: 'relative', height: 'calc(100vh - 80px)', background: 'linear-gradient(to bottom, #1e3a8a 0%, #172554 100%)', borderRadius: '0', overflow: 'hidden', minHeight: '500px' }}>
                
                {/* 3D Scene Background Element (Cliff) */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '30%', background: '#0f172a', clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0% 100%)' }}></div>

                {/* Top UI Info: Score, Health, and Timer (Responsive Stacking) */}
                <div style={{ position: 'absolute', top: '10px', left: '0', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 1rem', zIndex: 10 }}>
                  
                  {/* Score & Timer Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    {/* Score */}
                    <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '8px', border: '1px solid #3b82f6', minWidth: '80px' }}>
                      <h3 style={{ margin: 0, color: '#60a5fa', fontSize: '0.9rem' }}>Score</h3>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#ffffff' }}>{score}</p>
                    </div>
                    
                    {/* Timer Display */}
                    <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '8px', border: '1px solid #10b981', textAlign: 'right', minWidth: '90px' }}>
                      <h3 style={{ margin: 0, color: '#34d399', fontSize: '0.9rem' }}>Word Timer</h3>
                      <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#ffffff' }}>
                        {(elapsedTime / 1000).toFixed(2)}s
                      </p>
                      {lastWordTime && <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>Last: {lastWordTime.toFixed(2)}s</span>}
                    </div>
                  </div>

                  {/* Health Bar (Enemy) */}
                  <div style={{ width: '100%', maxWidth: '300px', margin: '0 auto', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 5px', color: 'var(--accent-danger)', fontWeight: 'bold', fontSize: '0.9rem' }}>Monster Health</p>
                    <div style={{ width: '100%', height: '12px', background: 'var(--text-main)', borderRadius: '6px', overflow: 'hidden', border: '2px solid #fff' }}>
                      <div style={{ width: `${enemyHealth}%`, height: '100%', background: enemyHealth > 30 ? 'var(--accent-danger)' : 'var(--accent-danger)', transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                </div>

                {/* Characters */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'absolute', bottom: '15%', width: '100%', padding: '0 5%' }}>
                  {/* Player Character */}
                  <div className={`player-character ${isTypingHit ? 'attack-dash' : ''} ${isEnemyAttacking ? 'flash-damage' : ''}`} style={{ fontSize: '5rem', filter: 'drop-shadow(0 0 10px rgba(56,189,248,0.6))', zIndex: 5, transition: '0.2s' }}>
                    🥷
                  </div>
                  {/* Player Projectile */}
                  {isTypingHit && <div className="projectile-animation">✨</div>}
                  
                  {/* Enemy Projectile (Counter-attack) */}
                  {isEnemyAttacking && <div className="enemy-projectile-animation">🔥</div>}
                  
                  {/* Enemy Character */}
                  <div className={`monster-sprite ${isAttacking ? 'flash-damage' : ''}`} style={{ fontSize: '7rem', filter: 'drop-shadow(0 0 15px rgba(239,68,68,0.5))', zIndex: 5, transition: '0.2s' }}>
                    {currentMonster}
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
              </div>
            )}

            {(gameState === 'gameover' || gameState === 'victory') && (
              <div className="arena-card" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
                <Trophy size={64} color={gameState === 'victory' ? 'var(--accent-warning)' : 'var(--accent-danger)'} style={{ margin: '0 auto 1.5rem' }} />
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: gameState === 'victory' ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>
                  {gameState === 'victory' ? 'VICTORY!' : 'GAME OVER'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
                  You scored <strong>{score}</strong> points.
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button className="btn btn-outline" onClick={() => navigate('/arena')} style={{ padding: '1rem 2rem' }}>
                    Quit
                  </button>
                  <button className="arena-start-btn" onClick={startGame} disabled={isSubmitting} style={{ margin: 0, padding: '1rem 2rem', width: 'auto', background: 'var(--accent-success)' }}>
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
