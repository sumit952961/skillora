import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ContestTicker() {
  const [hasActiveContests, setHasActiveContests] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveContests = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://skillora-api-mw5c.onrender.com/api';
        const res = await fetch(`${API_URL}/contests/active`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setHasActiveContests(true);
          }
        }
      } catch (error) {
        console.error("Error fetching active contests for ticker:", error);
      }
    };
    fetchActiveContests();
  }, []);

  if (!hasActiveContests) return null;

  return (
    <>
      <style>
        {`
          @keyframes slideMarquee {
            0% { transform: translateX(100vw); }
            100% { transform: translateX(-100%); }
          }
          .contest-ticker-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 40px;
            background: linear-gradient(90deg, #4f46e5, #ec4899);
            color: white;
            z-index: 50;
            display: flex;
            align-items: center;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .contest-ticker-container:hover .contest-ticker-text {
            animation-play-state: paused;
          }
          .contest-ticker-text {
            display: inline-block;
            white-space: nowrap;
            font-weight: 600;
            font-size: 1rem;
            animation: slideMarquee 20s linear infinite;
          }
          .ticker-highlight {
            background: rgba(255, 255, 255, 0.2);
            padding: 2px 10px;
            border-radius: 20px;
            margin-left: 10px;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 1px;
          }
        `}
      </style>
      <div 
        className="contest-ticker-container" 
        onClick={() => navigate('/contests')}
        title="Click to view live contests"
      >
        <div className="contest-ticker-text">
          🚀 FREE CERTIFICATION AVAILABLE! Participate in our Live Skill Assessments and boost your portfolio. 
          <span className="ticker-highlight">Click Here to Register Now!</span>
        </div>
      </div>
    </>
  );
}
