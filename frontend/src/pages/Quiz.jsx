import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { BookOpen, Clock, ArrowRight, HelpCircle } from 'lucide-react';
import TakeQuiz from '../components/TakeQuiz';

export default function Quiz() {
  const { quizzes } = useContext(DataContext);
  const [activeQuiz, setActiveQuiz] = useState(null);

  React.useEffect(() => {
    const pendingId = localStorage.getItem('pendingQuizId');
    if (pendingId && quizzes.length > 0) {
      const quiz = quizzes.find(q => q.id === pendingId);
      if (quiz) {
        setActiveQuiz(quiz);
      }
    }
  }, [quizzes]);

  if (activeQuiz) {
    return <TakeQuiz quiz={activeQuiz} onBack={() => setActiveQuiz(null)} />;
  }

  return (
    <div className="container fade-in">
      <div className="section-title-wrapper" style={{ textAlign: 'left', marginBottom: '40px' }}>
        <h1 className="section-title">Available Quizzes</h1>
        <p style={{ color: 'var(--text-muted)' }}>Test your knowledge and earn completion certificates.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {quizzes.map(quiz => (
          <div key={quiz.id} className="premium-internship-card" style={{ minHeight: 'auto', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{quiz.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {quiz.description}
            </p>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                <Clock size={16} color="var(--primary)" /> {quiz.timeLimit} mins
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                <HelpCircle size={16} color="var(--primary)" /> {quiz.questions.length} Qs
              </div>
            </div>

            <button onClick={() => setActiveQuiz(quiz)} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              View Details <ArrowRight size={16} />
            </button>
          </div>
        ))}
        {quizzes.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
            <BookOpen size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--text-muted)' }}>No quizzes available at the moment.</h3>
          </div>
        )}
      </div>
    </div>
  );
}
