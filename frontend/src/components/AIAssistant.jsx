import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Welcome to SkillZeno! 👋 I am your AI Mentor. I can help you explore our internships, use the Arena, or assist you with coding and career questions.\n\nHow can I help you today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    "Tell me about SkillZeno",
    "How to apply for internships?",
    "Help me with a coding problem",
    "What is the Arena?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          history: messages 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: data.message || "Oops! Something went wrong." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Failed to connect to the server. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="ai-assistant-wrapper">
      {/* Floating Action Button */}
      <button 
        className={`ai-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with AI Mentor"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
        {!isOpen && <span className="ai-fab-badge"><Sparkles size={14} /></span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-info">
              <div className="ai-avatar">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="ai-title">SkillZeno AI Mentor</h3>
                <span className="ai-status">Online • Ready to help</span>
              </div>
            </div>
            <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="ai-chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message-row ${msg.role === 'user' ? 'user' : 'ai'}`}>
                {msg.role === 'ai' && (
                  <div className="ai-message-avatar">
                    <Bot size={16} />
                  </div>
                )}
                <div className={`ai-message-bubble ${msg.role}`}>
                  {msg.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                {msg.role === 'user' && (
                  <div className="ai-message-avatar user-avatar">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
            
            {/* Quick Actions (only show if it's just the welcome message) */}
            {messages.length === 1 && (
              <div className="ai-quick-actions">
                {quickActions.map((action, idx) => (
                  <button 
                    key={idx} 
                    className="ai-quick-action-btn"
                    onClick={() => handleSendMessage(action)}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {isTyping && (
              <div className="ai-message-row ai">
                <div className="ai-message-avatar">
                  <Bot size={16} />
                </div>
                <div className="ai-message-bubble ai typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="ai-chat-input-area">
            <input
              type="text"
              className="ai-chat-input"
              placeholder="Type your question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
            />
            <button 
              className="ai-send-btn"
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isTyping}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
