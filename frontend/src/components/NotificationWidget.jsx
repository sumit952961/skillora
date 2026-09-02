import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, X } from 'lucide-react';

export default function NotificationWidget() {
  const { user, token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [lastReadAt, setLastReadAt] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';

  const renderTextWithLinks = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        let href = part;
        if (part.startsWith('www.')) href = 'https://' + part;
        return (
          <a key={index} href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
            {part}
          </a>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    if (user && token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000); // Polling every 5 seconds for live feel
      return () => clearInterval(interval);
    }
  }, [user, token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, notifications]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setLastReadAt(data.lastReadAt ? new Date(data.lastReadAt) : null);
      }
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setLastReadAt(new Date());
    } catch (error) {
      console.error("Failed to mark notifications as read");
    }
  };

  const toggleDropdown = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    if (willOpen && unreadCount > 0) {
      markAsRead();
    }
  };

  if (!user) return null;

  // Calculate unread count purely from DB timestamp vs Notification date
  const unreadCount = notifications.filter(n => {
    if (!lastReadAt) return true; // If never read, all are unread
    return new Date(n.date) > lastReadAt;
  }).length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    return `${date.toLocaleDateString('en-US', options)}, ${date.toLocaleTimeString('en-US', timeOptions)}`;
  };

  return (
    <div 
      className="notification-widget-container" 
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '24px',
        zIndex: 99999
      }}
      ref={dropdownRef}
    >
      <button 
        className="notification-bell-btn"
        onClick={toggleDropdown}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: 'var(--accent-danger)',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            minWidth: '22px',
            height: '22px',
            borderRadius: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
            padding: '0 4px',
            animation: 'pulse 2s infinite'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="notification-dropdown-panel"
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '0',
            width: '320px',
            maxHeight: '400px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-premium)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease forwards',
            zIndex: 100000
          }}
        >
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-secondary)'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Notifications</h3>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>
          
          <div style={{
            overflowY: 'auto',
            padding: '12px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bell size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                <p style={{ margin: 0 }}>No notifications yet.</p>
              </div>
            ) : (
              [...notifications].reverse().map((notif) => {
                const isUnreadLocally = !lastReadAt || new Date(notif.date) > lastReadAt;
                
                return (
                  <div 
                    key={notif._id} 
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      background: isUnreadLocally ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-secondary)',
                      border: `1px solid ${isUnreadLocally ? 'var(--primary)' : 'var(--border-color)'}`,
                      boxShadow: 'var(--shadow-sm)',
                      position: 'relative'
                    }}
                  >
                    {isUnreadLocally && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        left: '8px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--primary)'
                      }} />
                    )}
                    {notif.title && <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', paddingLeft: isUnreadLocally ? '12px' : '0' }}>{notif.title}</h4>}
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', paddingLeft: isUnreadLocally ? '12px' : '0', whiteSpace: 'pre-wrap' }}>
                      {renderTextWithLinks(notif.message)}
                    </p>
                    {notif.mediaType === 'image' && notif.mediaUrl && (
                      <div style={{ marginTop: '10px', paddingLeft: isUnreadLocally ? '12px' : '0' }}>
                        <img 
                          src={`${API_URL.replace('/api', '')}${notif.mediaUrl}`} 
                          alt="Attachment" 
                          style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                        />
                      </div>
                    )}
                    
                    {notif.mediaType === 'audio' && notif.mediaUrl && (
                      <div style={{ marginTop: '10px', paddingLeft: isUnreadLocally ? '12px' : '0' }}>
                        <audio 
                          controls 
                          src={`${API_URL.replace('/api', '')}${notif.mediaUrl}`} 
                          style={{ width: '100%', height: '40px' }}
                        />
                      </div>
                    )}

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', paddingLeft: isUnreadLocally ? '12px' : '0', marginTop: '10px' }}>
                      {formatDate(notif.date)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); transform-origin: bottom right; }
          to { opacity: 1; transform: translateY(0) scale(1); transform-origin: bottom right; }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); box-shadow: 0 0 8px var(--accent-danger); }
          100% { transform: scale(1); }
        }
        @media (max-width: 768px) {
          .notification-widget-container {
            bottom: 90px !important;
            right: 16px !important;
          }
          .notification-dropdown-panel {
            width: 280px !important;
            max-height: 350px !important;
          }
          .notification-bell-btn {
            width: 44px !important;
            height: 44px !important;
          }
        }
      `}} />
    </div>
  );
}
