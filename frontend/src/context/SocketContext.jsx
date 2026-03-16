import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL || '';

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [sosAlert, setSosAlert] = useState(null);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    const s = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] });
    setSocket(s);
    s.on('NEW_SOS', (payload) => setSosAlert(payload));
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user]);

  const clearSosAlert = () => setSosAlert(null);

  return (
    <SocketContext.Provider value={{ socket, sosAlert, clearSosAlert }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  return ctx || { socket: null, sosAlert: null, clearSosAlert: () => {} };
}
