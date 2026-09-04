import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { API_URL } = useContext(AuthContext);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Extract base URL if API_URL has /api suffix
    const baseUrl = API_URL?.replace(/\/api$/, '') || 'https://skillora-api-mw5c.onrender.com';
    const socket = io(baseUrl);

    socket.on('connect', () => {
      console.log("Connected to Real-Time Server");
    });

    socket.on('data_updated', () => {
      console.log("Server indicated data changed. Refreshing components...");
      setRefreshTrigger(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [API_URL]);

  return (
    <SocketContext.Provider value={{ refreshTrigger }}>
      {children}
    </SocketContext.Provider>
  );
};
