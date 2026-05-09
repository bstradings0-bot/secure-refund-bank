'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  balance: any | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  balance: null,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState<any | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      setConnected(false);
    });

    // Balance updates
    newSocket.on('balance:update', (data) => {
      console.log('[Socket] Balance update:', data);
      setBalance(data);
    });

    // New transactions
    newSocket.on('transaction:new', (data) => {
      console.log('[Socket] New transaction:', data);
      toast.success(
        `${data.type}: $${data.amount?.toFixed(2)}`,
        { icon: '💰', duration: 4000 }
      );
    });

    // New notifications
    newSocket.on('notification:new', (data) => {
      console.log('[Socket] New notification:', data);
      toast(data.title || data.message, {
        icon: '🔔',
        duration: 5000,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected, balance }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
