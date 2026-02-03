import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocket = (eventName, callback) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
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
