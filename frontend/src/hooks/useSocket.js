import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// If VITE_API_URL includes '/api', remove it to get the root URL for socket.io
const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  try {
    const url = new URL(apiUrl);
    return url.origin;
  } catch (e) {
    return import.meta.env.PROD ? window.location.origin : 'http://localhost:5000';
  }
};

const SOCKET_URL = getSocketUrl();

export const useSocket = (eventName, callback) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Disable Socket.io in production (Vercel doesn't support WebSockets)
    if (import.meta.env.PROD) {
      console.warn('Socket.io is disabled in production. Real-time updates are not available.');
      return;
    }

    const s = io(SOCKET_URL);
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && eventName && callback) {
      socket.on(eventName, callback);
      return () => {
        socket.off(eventName, callback);
      };
    }
  }, [socket, eventName, callback]);

  return socket;
};
