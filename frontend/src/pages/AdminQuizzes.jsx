import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { Plus, Edit2, Trash2, Clock, HelpCircle, Save, X } from 'lucide-react';

export default function AdminQuizzes() {
  const { quizzes, addQuiz, updateQuiz, deleteQuiz } = useContext(DataContext);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (quiz = null) => {
    if (quiz) {
      setEditingQuiz({ ...quiz });
    } else {
      setEditingQuiz({
        title: '',
        description: '',
        timeLimit: 10,
        questions: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingQuiz.id) {
      updateQuiz(editingQuiz.id, editingQuiz);
    } else {
      addQuiz(editingQuiz);
    }
    setIsModalOpen(false);
  };

  const addQuestion = () => {
    setEditingQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', options: ['', '', '', ''], answer: 0 }]
    }));
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...editingQuiz.questions];
    updated[idx][field] = value;
    setEditingQuiz(prev => ({ ...prev, questions: updated }));
  };

  const updateOption = (qIdx, optIdx, value) => {
    const updated = [...editingQuiz.questions];
    updated[qIdx].options[optIdx] = value;
    setEditingQuiz(prev => ({ ...prev, questions: updated }));
  };

  const removeQuestion = (idx) => {
    const updated = [...editingQuiz.questions];
    updated.splice(idx, 1);
    setEditingQuiz(prev => ({ ...prev, questions: updated }));
  };

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Manage Quizzes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create and edit skill assessment quizzes.</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Quiz
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {quizzes.map(quiz => (
          <div key={quiz.id} style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{quiz.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>{quiz.description}</p>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                <Clock size={16} color="var(--primary)" /> {quiz.timeLimit} mins
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                <HelpCircle size={16} color="var(--primary)" /> {quiz.questions.length} questions
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => openModal(quiz)} className="btn btn-outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={16} /> Edit
              </button>
              <button onClick={() => deleteQuiz(quiz.id)} className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderColor: 'var(--accent-danger)', color: 'var(--accent-danger)' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && editingQuiz && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto', padding: '40px 20px', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-secondary)', width: '100%', maxWidth: '800px', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{editingQuiz.id ? 'Edit Quiz' : 'Add New Quiz'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Quiz Title</label>
                <input required className="form-input" value={editingQuiz.title} onChange={e => setEditingQuiz({...editingQuiz, title: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label>Description / Instructions</label>
                <textarea required className="form-input" rows="3" value={editingQuiz.description} onChange={e => setEditingQuiz({...editingQuiz, description: e.target.value})}></textarea>
              </div>

              <div className="form-group">
                <label>Time Limit (minutes)</label>
                <input required type="number" min="1" className="form-input" value={editingQuiz.timeLimit} onChange={e => setEditingQuiz({...editingQuiz, timeLimit: Number(e.target.value)})} />
              </div>

              <div style={{ marginTop: '32px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Questions</h3>
                <button type="button" onClick={addQuestion} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Add Question</button>
              </div>

              {editingQuiz.questions.map((q, qIdx) => (
                <div key={qIdx} style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <strong>Question {qIdx + 1}</strong>
                    <button type="button" onClick={() => removeQuestion(qIdx)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                  
                  <input required className="form-input" style={{ marginBottom: '12px' }} placeholder="Question text" value={q.question} onChange={e => updateQuestion(qIdx, 'question', e.target.value)} />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="radio" name={`answer-${qIdx}`} checked={q.answer === optIdx} onChange={() => updateQuestion(qIdx, 'answer', optIdx)} />
                        <input required className="form-input" placeholder={`Option ${optIdx + 1}`} value={opt} onChange={e => updateOption(qIdx, optIdx, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Quiz</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
