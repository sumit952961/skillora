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
            height: 32px;
            background: linear-gradient(90deg, #ec4899, #8b5cf6, #ec4899);
            background-size: 200% auto;
            animation: shineBanner 4s linear infinite;
            color: #ffffff;
            z-index: 50;
            display: flex;
            align-items: center;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          @keyframes shineBanner {
            to { background-position: 200% center; }
          }
          .contest-ticker-container:hover .contest-ticker-text {
            animation-play-state: paused;
          }
          .contest-ticker-text {
            display: inline-block;
            white-space: nowrap;
            font-weight: 600;
            font-size: 0.85rem;
            animation: slideMarquee 40s linear infinite;
            will-change: transform;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
          }
          .ticker-highlight {
            background: #fde047;
            padding: 2px 10px;
            border-radius: 20px;
            margin-left: 6px;
            margin-right: 30px;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.5px;
            color: #1e3a8a;
            font-weight: 800;
            box-shadow: 0 0 10px rgba(253, 224, 71, 0.5);
            text-shadow: none;
          }
          @media (max-width: 768px) {
            .contest-ticker-text {
              font-size: 0.75rem;
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
              <span style={{ verticalAlign: 'middle', marginRight: '4px' }}>🚀</span> FREE CERTIFICATION AVAILABLE! Participate in our Live Contests and Assessments and boost your portfolio. 
              <span className="ticker-highlight">Click Here to Register Now!</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
