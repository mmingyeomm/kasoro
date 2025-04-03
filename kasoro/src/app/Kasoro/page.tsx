"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function KasoroApp() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-50 to-fuchsia-100">
      {/* Header */}
      <header className="w-full py-6 px-6 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-pink flex items-center justify-center p-2">
              <Image src="/kasoro_logo.png" alt="Kasoro Logo" width={32} height={32} />
            </div>
            <h2 className="text-xl font-bold text-pink-primary">
              <Link href="/">
                KASORO
              </Link>
            </h2>
          </div>
        
        <nav className="flex items-center space-x-6">
          <Link href="/Kasoro/profile" className="px-5 py-2 bg-gradient-to-r from-pink-primary to-purple-primary text-purple-dark rounded-full font-medium shadow-md hover:shadow-pink transition-all hover:scale-105">
            Profile
          </Link>
          <button className="px-4 py-2 bg-gradient-to-r from-pink-400 to-fuchsia-400 text-white rounded-full text-sm">
            Connect Wallet
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-10">
        <div className={`max-w-6xl mx-auto transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-3xl font-bold mb-6">Welcome to Kasoro App</h2>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4">Get Started</h3>
            <p className="mb-4 text-gray-600">
              Connect your wallet to start depositing or challenging in communities.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-full">
              Connect Wallet
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold mb-4">Active Communities</h3>
              <p className="text-gray-500 mb-8">No communities available yet. Connect wallet to see communities.</p>
              <button className="px-4 py-2 border border-pink-500 text-fuchsia-600 rounded-full hover:bg-pink-50 transition-colors">
                Browse Communities
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold mb-4">My Activity</h3>
              <p className="text-gray-500 mb-8">Connect your wallet to see your activity.</p>
              <button className="px-4 py-2 border border-pink-500 text-fuchsia-600 rounded-full hover:bg-pink-50 transition-colors">
                View Activity
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full bg-gradient-to-r from-pink-500 to-fuchsia-600 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <span className="text-white text-sm">© 2025 Kasoro</span>
          </div>
          
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-white hover:text-indigo-900 transition-colors">Terms</a>
            <a href="#" className="text-white hover:text-indigo-900 transition-colors">Privacy</a>
            <a href="#" className="text-white hover:text-indigo-900 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}