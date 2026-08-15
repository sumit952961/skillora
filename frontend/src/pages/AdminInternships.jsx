import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminInternships() {
  const { internships, addInternship, updateInternship, deleteInternship } = useContext(DataContext);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const initialForm = {
    title: '', company: 'Skillzeno', department: '', domain: 'DEVELOPMENT', duration: '3 Months', stipend: 'Unpaid (Certificate + LOR)', type: 'Remote', mode: 'Full-Time', description: '', overview: '', responsibilities: '', requirements: '', skillsLearned: '', perks: '',
    tasks: [{ id: `t_${Date.now()}_1`, title: 'Task 1: ', description: '' }]
  };
  const [formData, setFormData] = useState(initialForm);

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...(prev.tasks || []), { id: `t_${Date.now()}_${prev.tasks?.length || 0}`, title: `Task ${(prev.tasks?.length || 0) + 1}: `, description: '' }]
    }));
  };

  const removeTask = (index) => {
    setFormData(prev => {
      const newTasks = [...prev.tasks];
      newTasks.splice(index, 1);
      return { ...prev, tasks: newTasks };
    });
  };

  const handleTaskChange = (index, field, value) => {
    setFormData(prev => {
      const newTasks = [...prev.tasks];
      newTasks[index] = { ...newTasks[index], [field]: value };
      return { ...prev, tasks: newTasks };
    });
  };

  const openNewModal = () => {
    setEditId(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (prog) => {
    setEditId(prog.id);
    setFormData({
      ...initialForm,
      ...prog,
      domain: prog.domain || initialForm.domain,
      duration: prog.duration || initialForm.duration,
      type: prog.type || initialForm.type,
      responsibilities: Array.isArray(prog.responsibilities) ? prog.responsibilities.join('\n') : prog.responsibilities || '',
      requirements: Array.isArray(prog.requirements) ? prog.requirements.join('\n') : prog.requirements || '',
      skillsLearned: Array.isArray(prog.skillsLearned) ? prog.skillsLearned.join('\n') : prog.skillsLearned || '',
      perks: Array.isArray(prog.perks) ? prog.perks.join('\n') : prog.perks || '',
      tasks: prog.tasks || initialForm.tasks
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedInternship = {
      ...formData,
      responsibilities: typeof formData.responsibilities === 'string' ? formData.responsibilities.split('\n').filter(Boolean) : formData.responsibilities,
      requirements: typeof formData.requirements === 'string' ? formData.requirements.split('\n').filter(Boolean) : formData.requirements,
      skillsLearned: typeof formData.skillsLearned === 'string' ? formData.skillsLearned.split('\n').filter(Boolean) : formData.skillsLearned,
      perks: typeof formData.perks === 'string' ? formData.perks.split('\n').filter(Boolean) : formData.perks,
      tasks: formData.tasks || []
    };

    if (editId) {
      updateInternship(editId, formattedInternship);
      alert('Internship Updated successfully!');
    } else {
      addInternship(formattedInternship);
      alert('Internship Added successfully!');
    }
    
    setShowModal(false);
  };

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Manage Internships</h1>
          <p style={{ color: 'var(--text-muted)' }}>Add, edit, or remove internship programs.</p>
        </div>
        <button onClick={openNewModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add New Program
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {internships.map(prog => (
          <div key={prog.id} style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ marginBottom: '4px' }}>{prog.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{prog.department} • {prog.type}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => openEditModal(prog)} className="btn btn-outline" style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Edit2 size={16} />
              </button>
              <button onClick={() => deleteInternship(prog.id)} className="btn btn-outline" style={{ padding: '8px', color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '80px 20px 40px' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '32px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '700px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '24px' }}>{editId ? 'Edit Internship' : 'Add New Internship'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Title</label>
                  <input required className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Top Tag / Domain</label>
                  <input required className="form-input" placeholder="e.g. DEVELOPMENT" value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Duration</label>
                  <input required className="form-input" placeholder="e.g. 3 Months" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <input required className="form-input" placeholder="e.g. Full-Time" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input required className="form-input" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Description (Short)</label>
                <textarea required className="form-input" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="form-group">
                <label>Skills Covered (One per line)</label>
                <textarea required className="form-input" rows="2" placeholder="React.js&#10;State Management" value={formData.skillsLearned} onChange={e => setFormData({...formData, skillsLearned: e.target.value})}></textarea>
              </div>

              <div className="form-group">
                <label>Responsibilities (One per line)</label>
                <textarea required className="form-input" rows="3" value={formData.responsibilities} onChange={e => setFormData({...formData, responsibilities: e.target.value})}></textarea>
              </div>
              
              <div className="form-group">
                <label>Requirements (One per line)</label>
                <textarea required className="form-input" rows="3" value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})}></textarea>
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>Internship Tasks</h3>
                  <button type="button" onClick={addTask} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} /> Add Task
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {formData.tasks?.map((task, idx) => (
                    <div key={task.id || idx} style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 'bold' }}>Task {idx + 1}</span>
                        {formData.tasks.length > 1 && (
                          <button type="button" onClick={() => removeTask(idx)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label>Task Title</label>
                        <input required className="form-input" value={task.title} onChange={e => handleTaskChange(idx, 'title', e.target.value)} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Task Description (Detailed instructions)</label>
                        <textarea required className="form-input" rows="3" value={task.description} onChange={e => handleTaskChange(idx, 'description', e.target.value)}></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '24px', padding: '12px' }}>
                {editId ? 'Update Program' : 'Save Program'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
