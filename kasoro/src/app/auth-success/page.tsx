"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// 사용자 데이터 타입 정의
interface User {
  id: string;
  username: string;
  // 필요한 다른 사용자 속성들을 여기에 추가할 수 있습니다
}

export default function AuthSuccess() {
  // null 또는 User 타입으로 명시적 타입 정의
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/auth/user`, {
          credentials: "include",
        });
        const data = await response.json();
        setUser(data);
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
