import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { API_URL } = useContext(AuthContext);
  const [globalRefreshTrigger, setGlobalRefreshTrigger] = useState(0);
  const [userRefreshTrigger, setUserRefreshTrigger] = useState(0);

  useEffect(() => {
    // Extract base URL if API_URL has /api suffix
    const baseUrl = API_URL?.replace(/\/api$/, '') || 'https://skillora-api-mw5c.onrender.com';
    const socket = io(baseUrl);

    socket.on('connect', () => {
      console.log("Connected to Real-Time Server");
    });

    socket.on('data_updated', (data) => {
      const path = data?.path || "";
      console.log("Server indicated data changed at path:", path);
      
      // Smart Filtering: Only refresh global data if relevant endpoints are modified
      // This prevents internship/quiz/settings lists from reloading on every application update
      if (path.includes("/settings") || path.includes("/internships") || path.includes("/quizzes") || path.includes("/contests")) {
        if (!path.includes("/applications") && !path.includes("/apply")) {
          setGlobalRefreshTrigger(prev => prev + 1);
        }
      }
      
      // Always refresh user-specific data (applications, certificates etc.) immediately
      setUserRefreshTrigger(prev => prev + 1);
    });

    return () => {
      clearTimeout(debounceTimer);
      socket.disconnect();
    };
  }, [API_URL]);

  return (
    <SocketContext.Provider value={{ globalRefreshTrigger, userRefreshTrigger }}>
      {children}
    </SocketContext.Provider>
  );
};
