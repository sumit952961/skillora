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
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .contest-ticker-container {
            position: relative;
            width: 100%;
            height: 36px;
            background: var(--primary-light);
            color: var(--primary);
            z-index: 50;
            display: flex;
            align-items: center;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          .contest-ticker-container:hover .contest-ticker-text {
            animation-play-state: paused;
          }
          .contest-ticker-text {
            display: inline-block;
            white-space: nowrap;
            font-weight: 600;
            font-size: 0.95rem;
            animation: slideMarquee 40s linear infinite;
            will-change: transform;
          }
          .ticker-highlight {
            background: rgba(79, 70, 229, 0.15);
            padding: 2px 10px;
            border-radius: 20px;
            margin-left: 8px;
            margin-right: 40px;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.5px;
            color: var(--primary-hover);
            font-weight: 700;
          }
          @media (max-width: 768px) {
            .contest-ticker-text {
              font-size: 0.85rem;
              animation-duration: 30s;
            }
          }
        `}
      </style>
      <div 
        className="contest-ticker-container" 
        onClick={() => navigate('/contests')}
        title="Click to view live contests"
      >
        <div className="contest-ticker-text">
          {Array(4).fill().map((_, i) => (
            <span key={i}>
              🚀 FREE CERTIFICATION AVAILABLE! Participate in our Live Skill Assessments and boost your portfolio. 
              <span className="ticker-highlight">Click Here to Register Now!</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
