import React, { useState, useEffect, useRef } from 'react';
import { Send, Bell, Clock, Paperclip, Mic, Image as ImageIcon, Smile, X, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'audio'
  const [mediaPreview, setMediaPreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications");
    } finally {
      setFetching(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaType('image');
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setMediaFile(audioBlob);
        setMediaType('audio');
        setMediaPreview(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaType(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !mediaFile) {
      alert("Please enter a message or record audio.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('message', message);
      
      if (mediaFile && mediaType) {
        formData.append('media', mediaFile);
        formData.append('mediaType', mediaType);
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to send notification.");
      }
      
      alert(data.message || "Notification sent successfully!");
      setTitle('');
      setMessage('');
      removeMedia();
      fetchNotifications();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to send notification.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification for everyone?")) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
      } else {
        alert("Failed to delete notification.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting notification.");
    }
  };

  const addEmoji = (emoji) => {
    setMessage(prev => prev + emoji);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    return `${date.toLocaleDateString('en-US', options)}, ${date.toLocaleTimeString('en-US', timeOptions)}`;
  };

  const popularEmojis = ["😀", "😂", "🥰", "😎", "🔥", "🎉", "🚀", "💡", "📢", "🏆", "✅", "⚠️"];

  return (
    <div className="container fade-in">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bell size={32} color="var(--primary)" /> Global Notifications
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Send real-time updates with Images, Audio, and Emojis!</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Chat History View */}
        <div style={{ 
          height: '50vh', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'var(--bg-secondary)', 
          padding: '24px', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h2 style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', margin: '0 0 16px 0' }}>Sent Broadcasts</h2>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '10px' }}>
            {fetching ? (
              <p>Loading...</p>
            ) : notifications.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No notifications sent yet.</p>
            ) : (
              notifications.map(notif => (
                <div key={notif._id} style={{ 
                  alignSelf: 'flex-end', 
                  maxWidth: '85%', 
                  background: 'var(--primary-light)', 
                  padding: '12px 32px 12px 16px', /* Increased right padding for the trash icon */
                  borderRadius: '16px 16px 0 16px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  position: 'relative'
                }}>
                  <button 
                    onClick={() => handleDelete(notif._id)}
                    style={{ position: 'absolute', top: '8px', right: '4px', background: 'transparent', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '4px' }}
                    title="Delete for Everyone"
                  >
                    <Trash2 size={14} />
                  </button>
                  
                  {notif.title && <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--primary-dark)' }}>{notif.title}</h4>}
                  
                  {notif.mediaType === 'image' && notif.mediaUrl && (
                    <img 
                      src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://skillora-api-mw5c.onrender.com'}${notif.mediaUrl}`} 
                      alt="Attachment" 
                      style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '8px', border: '1px solid rgba(0,0,0,0.1)' }}
                    />
                  )}
                  
                  {notif.mediaType === 'audio' && notif.mediaUrl && (
                    <audio 
                      controls 
                      src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://skillora-api-mw5c.onrender.com'}${notif.mediaUrl}`} 
                      style={{ width: '100%', height: '40px', marginBottom: '8px' }}
                    />
                  )}

                  <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{notif.message}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Clock size={12} /> {formatDate(notif.date)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* WhatsApp-Style Input Bar */}
        <div style={{ 
          padding: '24px',
          background: 'var(--bg-secondary)', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          
          {mediaPreview && (
            <div style={{ marginBottom: '16px', position: 'relative', display: 'inline-block', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <button 
                onClick={removeMedia}
                type="button"
                style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--accent-danger)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
              >
                <X size={14} />
              </button>
              
              {mediaType === 'image' ? (
                <img src={mediaPreview} alt="Preview" style={{ height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mic size={24} color="var(--primary)" />
                  <audio src={mediaPreview} controls style={{ height: '40px' }} />
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Notification Title (Optional)..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              style={{ padding: '12px 16px', borderRadius: '24px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', fontSize: '1rem' }}
            />
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)',
                borderRadius: '24px',
                padding: '8px 16px',
                position: 'relative'
              }}>
                <textarea 
                  rows="2" 
                  placeholder="Type your message..." 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  required 
                  style={{ border: 'none', background: 'transparent', resize: 'none', outline: 'none', fontSize: '1rem', width: '100%', paddingRight: '40px' }}
                />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', paddingBottom: '4px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '8px' }}>
                  <label style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <Paperclip size={20} />
                    <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                  </label>
                  
                  <div className="emoji-picker-container" style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {popularEmojis.map(emoji => (
                        <span 
                          key={emoji} 
                          onClick={() => addEmoji(emoji)}
                          style={{ cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.1s' }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                          {emoji}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {isRecording ? (
                <button 
                  type="button"
                  onClick={stopRecording}
                  style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-danger)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, animation: 'pulse 1s infinite' }}
                >
                  <div style={{ width: '14px', height: '14px', background: 'white', borderRadius: '2px' }} />
                </button>
              ) : (
                message.trim() || title.trim() || mediaFile ? (
                  <button 
                    type="submit"
                    disabled={loading}
                    style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: loading ? 0.7 : 1 }}
                  >
                    <Send size={20} style={{ marginLeft: '4px' }} />
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={startRecording}
                    style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <Mic size={22} />
                  </button>
                )
              )}
            </div>
          </form>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}} />
    </div>
  );
}
