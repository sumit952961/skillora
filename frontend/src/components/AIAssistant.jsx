import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, Volume2, VolumeX } from 'lucide-react';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatState, setChatState] = useState('LANGUAGE_SELECTION');
  const [language, setLanguage] = useState(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Welcome to SkillZeno! 👋 I am your AI Mentor.\n\nPlease select your preferred language / कृपया अपनी भाषा चुनें:"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const languageOptions = ["English", "हिंदी (Hindi)"];
  
  const quickActionsEn = [
    "Tell me about SkillZeno",
    "How to apply for internships?",
    "Help me with a coding problem",
    "What is the Arena?"
  ];

  const quickActionsHi = [
    "SkillZeno के बारे में बताएँ",
    "इंटर्नशिप के लिए कैसे अप्लाई करें?",
    "कोडिंग में मेरी मदद करें",
    "Arena क्या है?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const speakText = (text, langCode) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Strip emojis and markdown formatting for cleaner speech
    const cleanText = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '')
                          .replace(/\*\*/g, '')
                          .replace(/\*/g, '')
                          .replace(/#/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (langCode === 'hindi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN'; // Indian English often sounds better for local contexts
    }
    
    utterance.rate = 1.05; // Slightly faster so it doesn't drag
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Attempt to load chat history if logged in
    const loadHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';
        const res = await fetch(`${API_URL}/chat/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          setChatState('CHATTING');
          setLanguage('english'); // Defaulting context
        }
      } catch (error) {
        console.error("Failed to load chat history");
      }
    };
    
    loadHistory();
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Speak welcome message on first open
      if (messages.length === 1 && chatState === 'LANGUAGE_SELECTION') {
        speakText("Welcome to SkillZeno! I am your A I Mentor. Please select your preferred language.", 'english');
      }
    } else {
      // Stop speaking when closed
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen]);

  // Handle scroll on new messages
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSendMessage = async (text, isLanguageSelection = false) => {
    if (!text.trim()) return;

    let userText = text;
    let internalLanguage = language;

    if (isLanguageSelection) {
      if (text === "English") {
        internalLanguage = 'english';
        setLanguage('english');
        userText = "I prefer English. Please communicate in English from now on.";
      } else {
        internalLanguage = 'hindi';
        setLanguage('hindi');
        userText = "मैं हिंदी पसंद करता हूँ। कृपया अब से हिंदी में बात करें।";
      }
      setChatState('CHATTING');
      setMessages(prev => [...prev, { role: 'user', content: text }]);
    } else {
      setMessages(prev => [...prev, { role: 'user', content: text }]);
    }

    setInputMessage("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          message: userText,
          history: messages 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
        speakText(data.reply, internalLanguage);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: data.message || "Oops! Something went wrong." }]);
        speakText(data.message || "Oops! Something went wrong.", internalLanguage);
      }
    } catch (error) {
      const errorMsg = "Failed to connect to the server. Please try again later.";
      setMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
      speakText(errorMsg, internalLanguage);
    } finally {
      setIsTyping(false);
    }
  };

  const currentQuickActions = language === 'hindi' ? quickActionsHi : quickActionsEn;

  const toggleVoice = () => {
    if (isVoiceEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceEnabled(!isVoiceEnabled);
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="ai-close-btn" onClick={toggleVoice} title={isVoiceEnabled ? "Mute Voice" : "Unmute Voice"}>
                {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button className="ai-close-btn" onClick={() => setIsOpen(false)} title="Close Chat">
                <X size={20} />
              </button>
            </div>
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
            
            {/* Quick Actions (Language Selection) */}
            {chatState === 'LANGUAGE_SELECTION' && (
              <div className="ai-quick-actions">
                {languageOptions.map((action, idx) => (
                  <button 
                    key={idx} 
                    className="ai-quick-action-btn"
                    onClick={() => handleSendMessage(action, true)}
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Actions (Chat Topics) */}
            {chatState === 'CHATTING' && messages.length === 3 && (
              <div className="ai-quick-actions">
                {currentQuickActions.map((action, idx) => (
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
              placeholder={language === 'hindi' ? "अपना सवाल यहाँ लिखें..." : "Type your question..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
              disabled={chatState === 'LANGUAGE_SELECTION'}
            />
            <button 
              className="ai-send-btn"
              onClick={() => handleSendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isTyping || chatState === 'LANGUAGE_SELECTION'}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
