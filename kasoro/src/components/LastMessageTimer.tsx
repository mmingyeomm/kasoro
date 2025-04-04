import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface LastMessageTimerProps {
  gameRoomId: string;
}

const LastMessageTimer: React.FC<LastMessageTimerProps> = ({ gameRoomId }) => {
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  // Format elapsed time as hours, minutes, seconds
  const formatElapsedTime = (date: Date | null): string => {
    if (!date) return 'No messages yet';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Handle negative time difference (can happen if server/client clocks are out of sync)
    if (diffMs < 0) return 'Just now';
    
    const diffSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSecs / 3600);
    const minutes = Math.floor((diffSecs % 3600) / 60);
    const seconds = diffSecs % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s ago`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    } else {
      return `${seconds}s ago`;
    }
  };

  // Initialize socket connection
  useEffect(() => {
    // Get the backend URL from env var or default to localhost
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    // Create socket connection
    const newSocket = io(`${backendUrl}/gamerooms`, {
      withCredentials: true,
      transports: ['websocket'],
    });
    
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Join the game room
      newSocket.emit('joinRoom', gameRoomId, (response: any) => {
        console.log('Joined room', response);
        if (response.data.lastMessageTime) {
          setLastMessageTime(new Date(response.data.lastMessageTime));
        }
      });
    });
    
    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });
    
    newSocket.on('lastMessageTimeUpdated', (data: { roomId: string, lastMessageTime: string }) => {
      if (data.roomId === gameRoomId) {
        console.log('Last message time updated:', data.lastMessageTime);
        setLastMessageTime(new Date(data.lastMessageTime));
      }
    });
    
    setSocket(newSocket);
    
    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.emit('leaveRoom', gameRoomId);
        newSocket.disconnect();
      }
    };
  }, [gameRoomId]);
  
  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(formatElapsedTime(lastMessageTime));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastMessageTime]);

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
      <div className="w-2 h-2 rounded-full bg-green-500"></div>
      <div>
        {connected ? (
          <span>Last message: {elapsedTime}</span>
        ) : (
          <span>Connecting...</span>
        )}
      </div>
    </div>
  );
};

export default LastMessageTimer; 