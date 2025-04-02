import Image from "next/image";
import Link from "next/link";

export default function LoginError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <Image
            src="/x-logo.svg"
            alt="X logo"
            width={32}
            height={32}
            className="dark:invert"
          />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6 text-red-500">
          Login Error
        </h1>
        <p className="text-center mb-6">
          There was an error logging in with X. Please try again later.
        </p>
        <div className="flex justify-center">
          <Link
            href="/"
            className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
