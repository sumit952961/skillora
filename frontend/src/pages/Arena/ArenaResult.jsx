import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Target, Zap, BrainCircuit, Activity } from 'lucide-react';
import './arena.css';
import SEO from '../../components/SEO';

export default function ArenaResult() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const session = location.state?.session;
  const category = location.state?.category || { name: session?.category || 'Unknown' };

  if (!session) {
    return (
      <div className="arena-container fade-in" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>No session data found.</h2>
        <button className="btn btn-primary" onClick={() => navigate('/arena')}>Back to Arena</button>
      </div>
    );
  }

  const aiBeat = session.result === 'win';

  return (
    <>
      <SEO title="Arena Result | SkillZeno" noindex={true} />
      <div className="arena-container fade-in">
        <div className="arena-header">
          <h1 className="arena-title" style={{ fontSize: '2.2rem' }}>
            <Trophy size={36} color="#F59E0B" />
            Challenge Complete
          </h1>
          <p className="arena-subtitle">Here is how you performed in {category.name}</p>
        </div>

        <div className="arena-card">
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
            Your Performance Breakdown
          </h3>

          <div className="arena-result-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <div className="arena-stat-box">
              <div className="arena-stat-label"><Activity size={16} style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}}/> Questions</div>
              <div className="arena-stat-value">{session.questionsAttempted}</div>
            </div>
            
            <div className="arena-stat-box">
              <div className="arena-stat-label"><Target size={16} style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}}/> Correct</div>
              <div className="arena-stat-value" style={{ color: 'var(--accent-success)' }}>{session.correctAnswers}</div>
            </div>

            <div className="arena-stat-box">
              <div className="arena-stat-label">🔥 Best Streak</div>
              <div className="arena-stat-value">{session.bestQuestionStreak}</div>
            </div>

            <div className="arena-stat-box">
              <div className="arena-stat-label"><Zap size={16} style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}}/> Total XP</div>
              <div className="arena-stat-value" style={{ color: '#8B5CF6' }}>+{session.totalXp}</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '1rem' }}>
            <h4 style={{ marginBottom: '10px', fontSize: '1rem' }}>XP Breakdown</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '5px' }}>
              <span>Base XP:</span> <span>{session.baseXp}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '5px' }}>
              <span>Streak Bonus:</span> <span>{session.streakBonusXp}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>{aiBeat ? 'AI Beat Bonus:' : 'Completion Bonus:'}</span> <span>{session.aiBeatBonusXp}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
            <p>Highest Difficulty Reached: <strong style={{ textTransform: 'capitalize', color: 'var(--text-main)' }}>{session.highestDifficulty}</strong></p>
          </div>

          <div className="arena-result-banner" style={{
            background: aiBeat ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))' : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
            borderColor: aiBeat ? 'var(--accent-success)' : 'var(--accent-danger)'
          }}>
            <BrainCircuit size={40} color={aiBeat ? 'var(--accent-success)' : 'var(--accent-danger)'} style={{ margin: '0 auto 10px' }} />
            <h2 style={{ color: aiBeat ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              {aiBeat ? '🏆 YOU BEAT AI!' : '🤖 AI BEAT YOU THIS TIME!'}
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-around', margin: '15px 0', fontWeight: 'bold' }}>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Your Score</div>
                <div style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>{session.accuracy.toFixed(1)}%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>AI Benchmark</div>
                <div style={{ fontSize: '1.4rem', color: 'var(--text-main)' }}>{session.aiBenchmark.toFixed(1)}%</div>
              </div>
            </div>

            <p style={{ color: 'var(--text-main)', marginTop: '0.5rem', fontWeight: '500' }}>
              {aiBeat 
                ? "Excellent performance. Your accuracy and streak outsmarted the algorithm." 
                : "The AI was a bit too adaptive this time. Keep practicing!"}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', justifyContent: 'center' }}>
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/arena')}
              style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}
            >
              Play Again
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/profile')}
              style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
