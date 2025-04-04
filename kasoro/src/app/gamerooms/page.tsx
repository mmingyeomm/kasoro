"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GameRoomList from "@/components/GameRoomList";
import CreateGameRoomForm from "@/components/CreateGameRoomForm";
import { WalletButton } from "@/components/WalletButton";
import LinkWalletButton from "@/components/LinkWalletButton";
import { toast, Toaster } from "react-hot-toast";

type User = {
  id: string;
  username: string;
  walletAddress?: string | null;
};

export default function GameRoomsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const response = await fetch("https://kasoro.onrender.com/auth/user", {
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
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleWalletLinked = (walletAddress: string) => {
    if (user) {
      setUser({
        ...user,
        walletAddress
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wider">Communities</h1>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <p className="text-sm">Logged in as <span className="font-semibold">@{user.username}</span></p>
              <Link 
                href="/auth/logout"
                className="bg-gray-200 dark:bg-gray-700 px-4 py-2 border-2 border-black dark:border-white text-sm font-bold"
              >
                Logout
              </Link>
            </>
          ) : (
            <Link 
              href="http://localhost:3001/auth/login/twitter"
              className="bg-black text-white px-4 py-2 border-2 border-black text-sm font-bold"
            >
              Login with X
            </Link>
          )}
          <div className="ml-2">
            <WalletButton />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <GameRoomList />
        </div>
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-white p-6">
            {user ? (
              <>
                {user.walletAddress ? null : (
                  <LinkWalletButton user={user} onWalletLinked={handleWalletLinked} />
                )}
                <CreateGameRoomForm userWalletAddress={user.walletAddress} />
              </>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-black dark:border-yellow-700 p-4 text-yellow-800 dark:text-yellow-300">
                Please log in to create a community.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
