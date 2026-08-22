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

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/contests');
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
        ? `http://localhost:5000/api/contests/${selectedContest._id}` 
        : 'http://localhost:5000/api/contests';
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
      await fetch(`http://localhost:5000/api/contests/${id}`, { method: 'DELETE' });
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
      
      // Expected columns: question, option1, option2, option3, option4, correctOptionIndex (0-3), difficulty
      const formattedQuestions = data.map(row => ({
        question: row.question,
        options: [row.option1, row.option2, row.option3, row.option4],
        correctOptionIndex: parseInt(row.correctOptionIndex) || 0,
        difficulty: row.difficulty || 'Medium'
      }));

      try {
        const res = await fetch('http://localhost:5000/api/contests/upload-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: uploadDomain, questions: formattedQuestions })
        });
        const result = await res.json();
        alert(result.message);
      } catch (err) {
        console.error(err);
        alert("Upload failed.");
      } finally {
        setUploading(false);
        e.target.value = null; // reset input
      }
    };
    reader.readAsBinaryString(file);
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
          <input 
            type="text" 
            placeholder="Target Domain (e.g. MERN Stack)" 
            className="form-input" 
            style={{ maxWidth: '300px' }}
            value={uploadDomain}
            onChange={(e) => setUploadDomain(e.target.value)}
          />
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            id="excel-upload" 
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <label htmlFor="excel-upload" className="btn btn-primary" style={{ cursor: 'pointer', opacity: uploading || !uploadDomain ? 0.5 : 1 }}>
            {uploading ? 'Uploading...' : 'Select Excel File'}
          </label>
        </div>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Contest Title</th>
              <th>Domains</th>
              <th>Status</th>
              <th>Start Time</th>
              <th>Registration End</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contests.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No contests found.</td></tr>
            ) : (
              contests.map(contest => (
                <tr key={contest._id}>
                  <td style={{ fontWeight: '600' }}>{contest.title}</td>
                  <td>{contest.domains.join(', ')}</td>
                  <td>
                    {contest.isActive ? (
                      <span className="status-badge status-completed"><CheckCircle size={14}/> Active</span>
                    ) : (
                      <span className="status-badge status-pending">Inactive</span>
                    )}
                  </td>
                  <td>{new Date(contest.startTime).toLocaleString()}</td>
                  <td>{new Date(contest.registrationEndTime).toLocaleString()}</td>
                  <td className="action-cells">
                    <button className="btn-icon" onClick={() => handleEdit(contest)} title="Edit"><Edit2 size={16} /></button>
                    <button className="btn-icon delete" onClick={() => handleDelete(contest._id)} title="Delete"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
