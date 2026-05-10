import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user || !token) return;

    socketRef.current = io('http://localhost:5000', { transports: ['websocket'] });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-room', user._id);
    });

    socketRef.current.on('notification', (note) => {
      setNotifications((prev) => [note, ...prev]);
      setUnread((prev) => prev + 1);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, token]);

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, unread, markRead, clearAll, setNotifications, setUnread }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);