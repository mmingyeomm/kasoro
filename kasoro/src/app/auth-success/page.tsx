"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Define user type for TypeScript
interface User {
  id: string;
  username: string;
  oauth_token?: string;
  oauth_token_secret?: string;
}

export default function AuthSuccess() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("http://localhost:3001/auth/user", {
          method: 'GET',
          credentials: "include",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching user: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("User data received:", data);
        
        // Check if the data has valid user properties
        if (data && data.id && data.username) {
          setUser(data);
        } else {
          console.log("No valid user data found");
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
        {loading ? (
          <p className="text-center">Loading user data...</p>
        ) : user ? (
          <>
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/x-logo.svg"
                alt="X logo"
                width={32}
                height={32}
                className="dark:invert"
              />
            </div>
            <h1 className="text-2xl font-bold text-center mb-6">
              Successfully logged in with X!
            </h1>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-6">
              <p className="mb-2">
                <span className="font-semibold">Username:</span> @{user.username}
              </p>
              <p>
                <span className="font-semibold">User ID:</span> {user.id}
              </p>
            </div>
            <div className="flex justify-center">
              <Link
                href="/"
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center mb-6 text-red-500">
              Auth Error
            </h1>
            <p className="text-center mb-6">
              Could not retrieve user information. Please try logging in again.
            </p>
            <div className="flex justify-center">
              <Link
                href="/"
                className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
