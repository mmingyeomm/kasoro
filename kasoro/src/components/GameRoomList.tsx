"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type GameRoom = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  creatorId: string;
};

export default function GameRoomList() {
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGameRooms() {
      try {
        const response = await fetch("http://localhost:3001/gamerooms", {
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch game rooms: ${response.statusText}`);
        }
        
        const data = await response.json();
        setGameRooms(data);
      } catch (error) {
        console.error("Error fetching game rooms:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchGameRooms();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-6 text-red-800 dark:text-red-300">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (gameRooms.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No game rooms available. Create the first one!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold">Available Game Rooms</h2>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {gameRooms.map((room) => (
          <li key={room.id}>
            <Link 
              href={`/gamerooms/${room.id}`}
              className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">{room.name}</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(room.createdAt).toLocaleDateString()}
                </span>
              </div>
              {room.description && (
                <p className="mt-2 text-gray-600 dark:text-gray-400">{room.description}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
