import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Trash2, RotateCcw, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminTrash() {
  const { API_URL, token } = useContext(AuthContext);
  const [trashList, setTrashList] = useState([]);

  const fetchTrash = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/trash`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setTrashList(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch trash", error);
    }
  };

  useEffect(() => {
    if (token) fetchTrash();
  }, [token]);

  const handleRestore = async (appId) => {
    if (!window.confirm("Are you sure you want to restore this application? It will become visible to the student again.")) return;
    try {
      const res = await fetch(`${API_URL}/admin/applications/restore/${appId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Application restored successfully!");
        fetchTrash();
      } else {
        alert("Failed to restore application.");
      }
    } catch (e) {
      alert("Error restoring application.");
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--accent-danger-light)', padding: '12px', borderRadius: '12px' }}>
          <Trash2 size={24} color="var(--accent-danger)" />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Trash Bin</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Deleted applications are kept here for 30 days before being permanently removed.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {trashList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <AlertCircle size={48} color="var(--text-light)" style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Trash is Empty</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No deleted applications found.</p>
          </div>
        ) : (
          trashList.map(app => (
            <div key={app.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-primary)' }}>{app.studentName}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{app.studentEmail}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: '8px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} /> App No: {app.id}
                </p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600', margin: '0 0 4px 0' }}>{app.details?.title}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-danger)', margin: 0 }}>
                  Deleted: {new Date(app.deletedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <button 
                  onClick={() => handleRestore(app.id)} 
                  className="btn btn-outline" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-success)', borderColor: 'var(--accent-success)' }}
                >
                  <RotateCcw size={16} /> Restore
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
