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

    let debounceTimer;

    socket.on('data_updated', (data) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const path = data?.path || "";
        console.log("Server indicated data changed at path:", path);
        
        // Smart Filtering: Only refresh global data if relevant endpoints are modified
        if (path.includes("/settings") || path.includes("/internships") || path.includes("/quizzes")) {
          // If the path includes specific user actions like /apply or /applications, don't do a global refresh
          if (!path.includes("/applications") && !path.includes("/apply")) {
            setGlobalRefreshTrigger(prev => prev + 1);
          }
        }
        
        // Always refresh user-specific data to be safe
        setUserRefreshTrigger(prev => prev + 1);
      }, 500); // 500ms Debounce
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
