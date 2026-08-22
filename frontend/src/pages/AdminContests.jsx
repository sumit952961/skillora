import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Upload, PlayCircle, Clock, Calendar, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminContests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domains: '',
    startTime: '',
    registrationEndTime: '',
    isActive: false,
    timeLimitMinutes: 30,
    questionsPerStudent: 25
  });
  const [selectedContest, setSelectedContest] = useState(null);
  
  // Excel upload state
  const [uploadDomain, setUploadDomain] = useState('');
  const [uploading, setUploading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';

  useEffect(() => {
    fetchContests();
  }, []);

  // Compute unique domains from all contests for the upload dropdown
  const allDomains = Array.from(new Set(contests.flatMap(c => c.domains)));

  const fetchContests = async () => {
    try {
      const res = await fetch(`${API_URL}/contests`);
      const data = await res.json();
      setContests(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      domains: formData.domains.split(',').map(d => d.trim()),
    };

    try {
      const url = isEditing 
        ? `${API_URL}/contests/${selectedContest._id}` 
        : `${API_URL}/contests`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchContests();
        resetForm();
      }
    } catch (err) {
      console.error('Error saving contest', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contest?")) return;
    try {
      await fetch(`${API_URL}/contests/${id}`, { method: 'DELETE' });
      fetchContests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (contest) => {
    setSelectedContest(contest);
    setFormData({
      title: contest.title,
      description: contest.description,
      domains: contest.domains.join(', '),
      startTime: new Date(contest.startTime).toISOString().slice(0, 16),
      registrationEndTime: new Date(contest.registrationEndTime).toISOString().slice(0, 16),
      isActive: contest.isActive,
      timeLimitMinutes: contest.timeLimitMinutes,
      questionsPerStudent: contest.questionsPerStudent
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', domains: '', startTime: '', registrationEndTime: '',
      isActive: false, timeLimitMinutes: 30, questionsPerStudent: 25
    });
    setIsEditing(false);
    setSelectedContest(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!uploadDomain) return alert("Please select a domain before uploading.");

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      // Case-insensitive key lookup
      const getVal = (row, ...targetKeys) => {
        const foundKey = Object.keys(row).find(k => {
          const normalizedK = k.toLowerCase().replace(/[\s_]+/g, '');
          return targetKeys.some(tk => normalizedK === tk.toLowerCase().replace(/[\s_]+/g, ''));
        });
        return row[foundKey];
      };

      const formattedQuestions = data
        .map(row => {
          // If 'Correct Option' has 'A', 'B', 'C', 'D', parse it to 0, 1, 2, 3
          let correctStr = getVal(row, 'correctoptionindex', 'correctoption', 'answer', 'correct');
          let correctIndex = parseInt(correctStr);
          
          if (isNaN(correctIndex) && typeof correctStr === 'string') {
            const letter = correctStr.trim().toUpperCase();
            if (letter === 'A') correctIndex = 0;
            else if (letter === 'B') correctIndex = 1;
            else if (letter === 'C') correctIndex = 2;
            else if (letter === 'D') correctIndex = 3;
            else correctIndex = 0;
          } else if (isNaN(correctIndex)) {
            correctIndex = 0;
          }

          return {
            question: getVal(row, 'question', 'q'),
            options: [
              getVal(row, 'option1', 'optiona', 'a'), 
              getVal(row, 'option2', 'optionb', 'b'), 
              getVal(row, 'option3', 'optionc', 'c'), 
              getVal(row, 'option4', 'optiond', 'd')
            ].map(opt => String(opt || '').trim()),
            correctOptionIndex: correctIndex,
            difficulty: getVal(row, 'difficulty', 'level') || 'Medium'
          };
        })
        // Only keep rows that have a question AND all 4 options filled
        .filter(q => q.question && q.options.every(opt => opt !== ''));

      try {
        const res = await fetch(`${API_URL}/contests/upload-questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: uploadDomain, questions: formattedQuestions })
        });
        const result = await res.json();
        if (!res.ok) {
          alert("Error: " + result.message);
        } else {
          alert(result.message);
        }
      } catch (err) {
        console.error(err);
        alert("Upload failed. Please check the console for more details.");
      } finally {
        setUploading(false);
        e.target.value = null; // reset input
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDeleteQuestions = async () => {
    if (!uploadDomain) return alert("Please select a domain first.");
    if (!window.confirm(`Are you sure you want to delete ALL questions for the domain: ${uploadDomain}?`)) return;
    
    try {
      const res = await fetch(`${API_URL}/contests/questions/${uploadDomain}`, { method: 'DELETE' });
      const result = await res.json();
      alert(result.message);
    } catch (err) {
      console.error(err);
      alert("Failed to delete questions.");
    }
  };

  if (loading) return <div className="container"><h3>Loading Contests...</h3></div>;

  return (
    <div className="container fade-in">
      <div className="section-title-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="section-title">Manage Contests</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={16} style={{ marginRight: '6px' }} /> Create Contest
        </button>
      </div>

      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '30px', border: '1px solid var(--border-color)' }}>
        <h3><Upload size={18} style={{ display: 'inline', marginRight: '8px' }} /> Upload Question Bank (Excel)</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
          Excel format columns: <b>question, option1, option2, option3, option4, correctOptionIndex (0-3), difficulty</b>
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <select
            className="form-input"
            style={{ maxWidth: '300px' }}
            value={uploadDomain}
            onChange={(e) => setUploadDomain(e.target.value)}
          >
            <option value="">-- Select Target Domain --</option>
            {allDomains.map((d, i) => (
              <option key={i} value={d}>{d}</option>
            ))}
          </select>
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            id="excel-upload" 
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <label htmlFor="excel-upload" className="btn btn-primary" style={{ cursor: 'pointer', opacity: uploading || !uploadDomain ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Excel'}
          </label>
          <button 
            className="btn btn-outline" 
            style={{ color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)', opacity: !uploadDomain ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={handleDeleteQuestions}
            disabled={!uploadDomain}
          >
            <Trash2 size={16} /> Delete Domain Questions
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {contests.length === 0 ? (
          <div style={{ background: 'var(--bg-secondary)', padding: '40px', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <h3 style={{ color: 'var(--text-muted)' }}>No contests found.</h3>
          </div>
        ) : (
          contests.map(contest => (
            <div key={contest._id} style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h3 style={{ marginBottom: '6px' }}>{contest.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Domains:</span> {contest.domains.join(', ')}
                </p>
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }}/> 
                    Starts: {new Date(contest.startTime).toLocaleDateString()}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    <Clock size={14} style={{ display: 'inline', marginRight: '4px' }}/> 
                    Reg End: {new Date(contest.registrationEndTime).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {contest.isActive ? (
                  <span style={{ fontSize: '0.85rem', background: 'var(--accent-success-light)', color: 'var(--accent-success)', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14}/> Active
                  </span>
                ) : (
                  <span style={{ fontSize: '0.85rem', background: 'var(--bg-primary)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', border: '1px solid var(--border-color)' }}>
                    Inactive
                  </span>
                )}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleEdit(contest)} className="btn btn-outline" style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(contest._id)} className="btn btn-outline" style={{ padding: '8px', color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h2 className="modal-title">{isEditing ? 'Edit Contest' : 'Create New Contest'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Contest Title</label>
                <input type="text" name="title" required className="form-input" value={formData.title} onChange={handleChange} placeholder="e.g. National Skill Assessment 2026" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" className="form-input" value={formData.description} onChange={handleChange} rows={3}></textarea>
              </div>
              <div className="form-group">
                <label>Domains (Comma separated)</label>
                <input type="text" name="domains" required className="form-input" value={formData.domains} onChange={handleChange} placeholder="e.g. MERN Stack, Python, Data Science" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label><Clock size={16}/> Start Time</label>
                  <input type="datetime-local" name="startTime" required className="form-input" value={formData.startTime} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label><Calendar size={16}/> Registration End</label>
                  <input type="datetime-local" name="registrationEndTime" required className="form-input" value={formData.registrationEndTime} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Time Limit (Minutes)</label>
                  <input type="number" name="timeLimitMinutes" required className="form-input" value={formData.timeLimitMinutes} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Questions Per Student</label>
                  <input type="number" name="questionsPerStudent" required className="form-input" value={formData.questionsPerStudent} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                <label htmlFor="isActive" style={{ margin: 0, cursor: 'pointer' }}>Make Contest Active (Visible to Students)</label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isEditing ? 'Update Contest' : 'Create Contest'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
