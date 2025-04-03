"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GameRoomList from "@/components/GameRoomList";
import CreateGameRoomForm from "@/components/CreateGameRoomForm";

type User = {
  id: string;
  username: string;
};

export default function GameRoomsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("http://localhost:3001/auth/user", {
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        
        const userData = await response.json();
        if (userData && userData.id) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Game Rooms</h1>
        {user ? (
          <div className="flex items-center gap-4">
            <p className="text-sm">Logged in as <span className="font-semibold">@{user.username}</span></p>
            <Link 
              href="/auth/logout"
              className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full text-sm"
            >
              Logout
            </Link>
          </div>
        ) : (
          <Link 
            href="http://localhost:3001/auth/login/twitter"
            className="bg-black text-white px-4 py-2 rounded-full text-sm"
          >
            Login with X
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <GameRoomList />
        </div>
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Game Room</h2>
            {user ? (
              <CreateGameRoomForm />
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md p-4 text-yellow-800 dark:text-yellow-300">
                Please log in to create a game room.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
