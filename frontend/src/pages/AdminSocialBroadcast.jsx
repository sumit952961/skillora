import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Send, Image as ImageIcon, MessageCircle, AlertCircle, CheckCircle, Loader, Share2, Camera, Briefcase } from 'lucide-react';
import SEO from '../components/SEO';

export default function AdminSocialBroadcast() {
  const { token } = useContext(AuthContext);
  
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [platforms, setPlatforms] = useState({
    facebook: true,
    instagram: true,
    linkedin: true,
    telegram: true
  });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  const handleToggle = (platform) => {
    setPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
  };
  
  const handleBroadcast = async () => {
    if (!caption.trim()) {
      alert("Caption cannot be empty.");
      return;
    }
    
    // Ensure at least one platform is selected
    if (!platforms.facebook && !platforms.instagram && !platforms.linkedin && !platforms.telegram) {
      alert("Please select at least one platform to broadcast to.");
      return;
    }
    
    setLoading(true);
    setResults(null);
    
    try {
      const res = await fetch(`http://localhost:5000/api/social/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ caption, imageUrl, platforms })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Broadcast failed');
      
      setResults(data.results);
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
              <label>Post Caption *</label>
              <textarea 
                className="form-control" 
                rows="6"
                placeholder="What do you want to share with your audience?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                style={{ resize: 'vertical' }}
              ></textarea>
            </div>
            
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Image URL (Optional)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <ImageIcon size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="https://example.com/image.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>For best results across all platforms, use a 1:1 or 4:5 aspect ratio image.</p>
            </div>
            
            {imageUrl && (
              <div style={{ marginTop: '20px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', width: '100%', maxWidth: '300px' }}>
                <img src={imageUrl} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
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
                <PlatformToggle 
                  name="LinkedIn Page" 
                  icon={<Briefcase size={20} color="#0A66C2" />} 
                  active={platforms.linkedin} 
                  onToggle={() => handleToggle('linkedin')} 
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
