"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface GameRoom {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  creatorId: string;
  bountyAmount?: number;
  timeLimit?: number;
  baseFeePercentage?: number;
}

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
          throw new Error(`Failed to fetch game rooms: ${response.status}`);
        }

        const data = await response.json();
        setGameRooms(data);
      } catch (error) {
        console.error("Error fetching game rooms:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load communities"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchGameRooms();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 p-4 text-red-800 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  if (gameRooms.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-6">
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No communities found. Be the first to create one!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-6">
      <h2 className="text-2xl font-bold tracking-widest uppercase mb-4">Active Communities</h2>
      <hr className="border-black dark:border-white border-1 mb-6" />
      
      <div className="space-y-4">
        {gameRooms.map((room) => (
          <Link
            key={room.id}
            href={`/gamerooms/${room.id}`}
            className="block"
          >
            <div className="border-2 border-black dark:border-white hover:bg-blue-50 dark:hover:bg-gray-700 p-4 transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{room.name}</h3>
                <div className="flex space-x-2">
                  {room.bountyAmount && (
                    <span className="bg-yellow-300 text-black px-2 py-1 text-xs font-mono font-bold border-2 border-black">
                      {room.bountyAmount} SOL
                    </span>
                  )}
                  {room.timeLimit && (
                    <span className="bg-green-300 text-black px-2 py-1 text-xs font-mono font-bold border-2 border-black">
                      {room.timeLimit} MIN
                    </span>
                  )}
                </div>
              </div>
              {room.description && (
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm line-clamp-2">
                  {room.description}
                </p>
              )}
              <div className="flex justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  Created{" "}
                  {new Date(room.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
