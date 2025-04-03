"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Animation effects when page loads
  useEffect(() => {
    setIsLoaded(true);
    
    // Create an interval for the feature carousel
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Feature highlights for carousel
  const features = [
    {
      title: "Time-Based Bounties",
      description: "Deposits fund bounties that reward the last challenger before time expires.",
      icon: "⏱️",
      color: "bg-pink-400"
    },
    {
      title: "Community Building",
      description: "Create sustainable communities with aligned incentives.",
      icon: "🏛️",
      color: "bg-fuchsia-500"
    },
    {
      title: "Content Rewards",
      description: "Get rewarded for creating valuable content that engages the community.",
      icon: "💰",
      color: "bg-indigo-900"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-0 overflow-hidden font-poppins text-gray-800 bg-gradient-to-b from-pink-50 to-fuchsia-100">
      {/* Bubbly Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-50 to-fuchsia-100"></div>
        
        {/* Floating bubbles */}
        <div className={`absolute top-[15%] left-[10%] w-36 h-36 rounded-full bg-pink-200/60 blur-xl transition-all duration-1000 ease-in-out ${isLoaded ? 'opacity-70' : 'opacity-0'}`}></div>
        <div className={`absolute bottom-[25%] right-[20%] w-48 h-48 rounded-full bg-fuchsia-200/60 blur-xl transition-all duration-1000 ease-in-out ${isLoaded ? 'opacity-70' : 'opacity-0'}`}></div>
        <div className={`absolute top-[35%] right-[10%] w-24 h-24 rounded-full bg-indigo-300/60 blur-xl transition-all duration-1000 ease-in-out ${isLoaded ? 'opacity-60' : 'opacity-0'}`}></div>
        <div className={`absolute bottom-[10%] left-[15%] w-32 h-32 rounded-full bg-pink-300/60 blur-xl transition-all duration-1000 ease-in-out ${isLoaded ? 'opacity-60' : 'opacity-0'}`}></div>
      </div>

      {/* Header with Animated Entrance */}
      <header className={`w-full max-w-7xl flex justify-between items-center p-6 transition-all duration-1000 ease-out ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
        <div className="flex items-center space-x-3">
          <div className="relative w-16 h-16 rounded-full bg-white shadow-lg p-2 flex items-center justify-center group transition-transform duration-300 hover:scale-110">
            <Image src="/kasoro_logo.png" alt="Kasoro Logo" width={50} height={50} className="group-hover:animate-bounce" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-fuchsia-600 bg-clip-text text-transparent">
            Kasoro
          </h1>
        </div>
        <nav className="hidden md:flex space-x-8">
          <a href="#about" className="text-fuchsia-700 hover:text-fuchsia-900 transition-colors font-medium border-b-2 border-transparent hover:border-pink-500 pb-1">Docs</a>
          <a href="#features" className="text-fuchsia-700 hover:text-fuchsia-900 transition-colors font-medium border-b-2 border-transparent hover:border-pink-500 pb-1">Features</a>
        </nav>
      </header>

      <main className="flex flex-col items-center text-center w-full z-10">
        {/* Hero Section with Animation */}
        <div className={`w-full max-w-6xl px-4 py-16 md:py-24 transition-all duration-1000 ease-out ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Building <span className="bg-gradient-to-r from-pink-500 to-fuchsia-600 bg-clip-text text-transparent">Chain Communities</span> on Solana
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Incentive-driven community platform that rewards content creators and community builders
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <Link 
              href="/app"
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-full shadow-lg text-xl font-medium transition-all transform hover:scale-105 hover:shadow-xl group flex items-center justify-center gap-3"
            >
              <span>Launch App</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <a 
              href="#learn-more" 
              className="px-8 py-4 bg-white border-2 border-pink-500 text-fuchsia-700 rounded-full shadow-md text-xl font-medium transition-all hover:bg-pink-50"
            >
              Learn More
            </a>
          </div>

          {/* Interactive Feature Carousel */}
          <div className="relative w-full max-w-5xl mx-auto h-[450px] overflow-hidden rounded-3xl shadow-xl bg-white">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-4xl px-8 py-12">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ${
                      currentIndex === index 
                        ? 'opacity-100 translate-x-0' 
                        : currentIndex > index || (currentIndex === 0 && index === features.length - 1)
                          ? 'opacity-0 -translate-x-full'
                          : 'opacity-0 translate-x-full'
                    }`}
                  >
                    <div className={`w-24 h-24 rounded-2xl mb-6 shadow-lg flex items-center justify-center text-4xl ${feature.color}`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-4xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                    <p className="text-xl text-gray-600 max-w-2xl">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Carousel Navigation Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-3">
              {features.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-3 rounded-full transition-all ${
                    currentIndex === index ? `${features[index].color} w-10` : 'bg-gray-300 w-3 hover:bg-gray-400'
                  }`}
                  aria-label={`View feature ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <section id="about" className="w-full py-24 bg-gradient-to-r from-pink-50 to-fuchsia-50 rounded-t-3xl mt-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-fuchsia-600 bg-clip-text text-transparent">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Kasoro connects depositors and challengers to create sustainable communities
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 px-4">
              <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all hover:translate-y-[-10px] hover:shadow-xl">
                <div className="w-16 h-16 bg-pink-400 rounded-2xl shadow-md flex items-center justify-center mb-6">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Depositors</h3>
                <p className="text-gray-600 leading-relaxed">
                  Deposit SOL as bounties for community building and content creation. Set time limits and base fees to ensure quality contributions.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all hover:translate-y-[-10px] hover:shadow-xl">
                <div className="w-16 h-16 bg-fuchsia-500 rounded-2xl shadow-md flex items-center justify-center mb-6">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Challengers</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create valuable content for communities. The last challenger to post before the time limit gets the bounty prize.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-r from-pink-500 to-fuchsia-600 py-10 mt-auto rounded-b-3xl">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
              <Image src="/kasoro_logo.png" alt="Kasoro Logo" width={24} height={24} />
            </div>
            <span className="text-white">© 2025 Kasoro</span>
          </div>
          
          <div className="flex space-x-8">
            <a href="#" className="text-white hover:text-indigo-900 transition-colors flex items-center gap-2">
              <span className="text-lg">𝕏</span> Twitter
            </a>
            <a href="#" className="text-white hover:text-indigo-900 transition-colors flex items-center gap-2">
              <span className="text-lg">📱</span> Telegram
            </a>
            <a href="#" className="text-white hover:text-indigo-900 transition-colors flex items-center gap-2">
              <span className="text-lg">🐙</span> GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
