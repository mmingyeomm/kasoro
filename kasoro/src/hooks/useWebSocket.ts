import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessageTime: string | null;
  clientCount: number;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(communityId: string): UseWebSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<string | null>(null);
  const [clientCount, setClientCount] = useState(0);

  // Initialize the socket connection
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const newSocket = io(`${socketUrl}/communities`, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    setSocket(newSocket);

    return () => {
      if (newSocket.connected) {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
      }
    };
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!socket) return;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected successfully. Socket ID:', socket.id);
      setIsConnected(true);
      
      // Join the community room
      console.log('Attempting to join room for community:', communityId);
      socket.emit('joinRoom', communityId, (response: any) => {
        console.log('Joined room response:', response);
        if (response?.data) {
          setLastMessageTime(response.data.lastMessageTime);
          setClientCount(response.data.clientCount);
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected. Was connected:', socket.connected);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error, error.message);
      console.log('Socket connection options:', {
        // uri 대신 socket.io.engine.uri 사용 또는 아예 제거
        transports: socket.io.opts.transports,
        withCredentials: socket.io.opts.withCredentials
      });
      setIsConnected(false);
    });

    // Specific community events
    socket.on('lastMessageTimeUpdated', (data) => {
      console.log('Last message time updated:', data);
      setLastMessageTime(data.lastMessageTime);
    });

    // Handle client count updates
    socket.on('clientCountUpdated', (data) => {
      console.log('Client count updated:', data);
      if (data.roomId === communityId) {
        setClientCount(data.clientCount);
      }
    });

    // Auto-connect
    socket.connect();

    // Clean up when component unmounts or communityId changes
    return () => {
      if (socket.connected) {
        console.log(`Leaving room ${communityId} and disconnecting socket`);
        socket.emit('leaveRoom', communityId);
        socket.disconnect();
      } else {
        console.log('Socket already disconnected, cleaning up listeners');
      }
      
      // Clean up all listeners to prevent memory leaks
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('lastMessageTimeUpdated');
      socket.off('clientCountUpdated');
      socket.off('roomJoined');
      socket.off('roomLeft');
      socket.off('error');
    };
  }, [socket, communityId]);

  // Function to manually connect
  const connect = useCallback(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [socket]);

  // Function to manually disconnect
  const disconnect = useCallback(() => {
    if (socket && socket.connected) {
      socket.emit('leaveRoom', communityId);
      socket.disconnect();
    }
  }, [socket, communityId]);

  return {
    isConnected,
    lastMessageTime,
    clientCount,
    connect,
    disconnect,
  };
}