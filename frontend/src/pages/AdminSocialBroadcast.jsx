import React, { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Send, Image as ImageIcon, MessageCircle, AlertCircle, CheckCircle, Loader, Share2, Camera, Briefcase, Upload, X } from 'lucide-react';
import SEO from '../components/SEO';

export default function AdminSocialBroadcast() {
  const { API_URL, token } = useContext(AuthContext);
  
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [platforms, setPlatforms] = useState({
    facebook: true,
    instagram: true,
    telegram: true
  });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  const handleToggle = (platform) => {
    setPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreview({ url, type: file.type });
    }
  };

  const clearFile = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleBroadcast = async () => {
    if (!caption.trim()) {
      alert("Caption cannot be empty.");
      return;
    }
    
    // Ensure at least one platform is selected
    if (!platforms.facebook && !platforms.instagram && !platforms.telegram) {
      alert("Please select at least one platform to broadcast to.");
      return;
    }
    
    setLoading(true);
    setResults(null);
    
    try {
      const formData = new FormData();
      formData.append('caption', caption);
      // Send platform selection to backend
      formData.append('platforms', JSON.stringify({
        facebook: platforms.facebook,
        instagram: platforms.instagram,
        telegram: platforms.telegram
      }));
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      const res = await fetch(`${API_URL}/social/broadcast`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Broadcast failed');
      
      setResults(data.results);
      setCaption('');
      clearFile();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Social Broadcast | Admin | SkillZeno" />
      <div className="container fade-in" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Send color="var(--primary)" /> Social Broadcast Studio
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Write once, publish everywhere. Post updates to all your social media channels simultaneously.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
          
          {/* Editor Column */}
          <div className="card" style={{ padding: '30px' }}>
            <div className="form-group">
              <label style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Post Caption *</label>
              <textarea 
                className="form-control" 
                placeholder="What do you want to share with your audience? Type here..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                style={{ 
                  resize: 'vertical', 
                  minHeight: '200px',
                  padding: '16px',
                  fontSize: '1rem',
                  lineHeight: '1.5'
                }}
              ></textarea>
            </div>
            
            <div className="form-group" style={{ marginTop: '30px' }}>
              <label style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Media Upload (Photo / Video)</label>
              
              {!mediaPreview ? (
                <div 
                  onClick={() => fileInputRef.current.click()}
                  style={{ 
                    border: '2px dashed var(--border-color)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '40px', 
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--bg-secondary)',
                    transition: 'all 0.2s',
                    marginTop: '10px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <Upload size={40} color="var(--text-muted)" style={{ marginBottom: '15px' }} />
                  <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0 5px' }}>Click to upload media</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Supports JPG, PNG, MP4</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*,video/mp4" 
                    style={{ display: 'none' }} 
                  />
                </div>
              ) : (
                <div style={{ marginTop: '10px', position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', width: '100%', maxWidth: '100%', background: '#000' }}>
                  <button 
                    onClick={clearFile}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                  >
                    <X size={16} />
                  </button>
                  
                  {mediaPreview.type.startsWith('video/') ? (
                    <video src={mediaPreview.url} controls style={{ width: '100%', maxHeight: '400px', display: 'block' }}></video>
                  ) : (
                    <img src={mediaPreview.url} alt="Preview" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }} />
                  )}
                </div>
              )}
              
            </div>
          </div>
          
          {/* Settings & Status Column */}
          <div>
            <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Select Platforms</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <PlatformToggle 
                  name="Telegram Channel" 
                  icon={<MessageCircle size={20} color="#0088cc" />} 
                  active={platforms.telegram} 
                  onToggle={() => handleToggle('telegram')} 
                />
                <PlatformToggle 
                  name="Facebook Page" 
                  icon={<Share2 size={20} color="#1877F2" />} 
                  active={platforms.facebook} 
                  onToggle={() => handleToggle('facebook')} 
                />
                <PlatformToggle 
                  name="Instagram" 
                  icon={<Camera size={20} color="#E4405F" />} 
                  active={platforms.instagram} 
                  onToggle={() => handleToggle('instagram')} 
                />
              </div>
              
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '30px', padding: '15px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', gap: '10px' }}
                onClick={handleBroadcast}
                disabled={loading}
              >
                {loading ? <Loader className="spin" /> : <Send size={20} />}
                {loading ? 'Broadcasting...' : 'Publish Now'}
              </button>
            </div>
            
            {/* Status Report Board */}
            {results && (
              <div className="card" style={{ padding: '24px', border: '1px solid var(--primary-light)', background: 'var(--bg-secondary)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Broadcast Report</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(results).map(([platform, data]) => (
                    data.status !== 'pending' && (
                      <div key={platform} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        {data.status === 'success' ? (
                          <CheckCircle size={20} color="var(--accent-success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        ) : (
                          <AlertCircle size={20} color="var(--accent-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        )}
                        <div>
                          <p style={{ margin: '0 0 4px', fontWeight: 'bold', textTransform: 'capitalize' }}>{platform}</p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: data.status === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                            {data.message}
                          </p>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </>
  );
}

function PlatformToggle({ name, icon, active, onToggle }) {
  return (
    <div 
      onClick={onToggle}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '12px 16px', 
        background: active ? 'var(--primary-light)' : 'var(--bg-primary)', 
        border: `1px solid ${active ? 'var(--primary)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icon}
        <span style={{ fontWeight: active ? 'bold' : 'normal', color: active ? 'var(--primary)' : 'var(--text-main)' }}>{name}</span>
      </div>
      <div style={{ 
        width: '40px', height: '22px', borderRadius: '11px', 
        background: active ? 'var(--primary)' : 'var(--text-light)',
        position: 'relative', transition: 'all 0.2s'
      }}>
        <div style={{ 
          width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
          position: 'absolute', top: '2px', left: active ? '20px' : '2px',
          transition: 'all 0.2s'
        }}></div>
      </div>
    </div>
  );
}
