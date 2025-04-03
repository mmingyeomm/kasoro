"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  // Features data
  const features = [
    {
      title: "Time-Based Bounties",
      description: "Deposits fund bounties that reward the last challenger before time expires.",
      icon: "⏱️",
      color: "from-pink-medium to-pink-primary"
    },
    {
      title: "Community Building",
      description: "Create sustainable communities with aligned incentives.",
      icon: "🏛️",
      color: "from-purple-medium to-purple-primary"
    },
    {
      title: "Content Rewards",
      description: "Get rewarded for creating valuable content that engages the community.",
      icon: "💰",
      color: "from-pink-primary to-purple-primary"
    }
  ];

  // Animation effects when page loads
  useEffect(() => {
    setIsLoaded(true);
    
    // Intro animation timing
    const introTimer = setTimeout(() => {
      setIntroComplete(true);
    }, 2500);
    
    // Rotate through features
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    
    // Track scroll position for animations
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(introTimer);
      clearInterval(featureInterval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="flex flex-col items-center min-h-screen overflow-x-hidden font-quicksand">
      {/* Intro Animation Overlay - Shows only during intro sequence */}
      {!introComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-light/50 via-white to-purple-light/50">
          <div className="flex flex-col items-center">
            <div className={`transform transition-all duration-1000 ease-out ${isLoaded ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 bg-white rounded-2xl rotate-45 shadow-pink animate-pulse-soft"></div>
                <Image 
                  src="/kasoro_logo.png" 
                  alt="Kasoro Logo" 
                  width={120} 
                  height={120} 
                  className="relative z-10"
                />
              </div>
            </div>
            <h1 className={`mt-10 text-6xl font-bold text-purple-dark/80 bg-clip-text bg-gradient-to-r from-pink-primary to-purple-primary transition-all duration-1000 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              KASORO
            </h1>
            <p className={`mt-4 text-xl text-purple-dark/80 transition-all duration-1000 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              First CommuniFi on Solana
            </p>
          </div>
        </div>
      )}

      {/* Main content - becomes visible after intro animation */}
      <div className={`w-full transition-opacity duration-1000 ${introComplete ? 'opacity-100' : 'opacity-0'}`}>
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-light/40 via-white to-purple-light/40"></div>
          
          {/* Floating bubbles */}
          <div className="absolute top-[10%] left-[15%] w-52 h-52 rounded-full bg-pink-light/60 blur-2xl animate-float"></div>
          <div className="absolute bottom-[20%] right-[15%] w-64 h-64 rounded-full bg-purple-light/60 blur-2xl" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-[45%] right-[10%] w-40 h-40 rounded-full bg-pink-medium/50 blur-2xl animate-float" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-[30%] left-[10%] w-56 h-56 rounded-full bg-purple-light/50 blur-2xl animate-float" style={{animationDelay: '2.5s'}}></div>
          <div className="absolute top-[70%] left-[30%] w-32 h-32 rounded-full bg-pink-primary/30 blur-xl animate-float" style={{animationDelay: '1.7s'}}></div>
          <div className="absolute top-[20%] right-[25%] w-24 h-24 rounded-full bg-purple-primary/20 blur-xl animate-float" style={{animationDelay: '2.2s'}}></div>
        </div>

        {/* Header */}
        <header className="w-full py-6 px-6 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl shadow-pink flex items-center justify-center p-2">
              <Image src="/kasoro_logo.png" alt="Kasoro Logo" width={32} height={32} />
            </div>
            <h2 className="text-xl font-bold text-pink-primary">KASORO</h2>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-purple-dark font-medium hover:text-pink-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-purple-dark font-medium hover:text-pink-primary transition-colors">How It Works</a>
            <Link href="/Kasoro" className="px-5 py-2 bg-gradient-to-r from-pink-primary to-purple-primary text-purple-dark rounded-full font-medium shadow-md hover:shadow-pink transition-all hover:scale-105">
              Launch App
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative pt-16 pb-24 px-4 flex flex-col items-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-pink-light/30 to-purple-light/30 blur-3xl animate-pulse-soft"></div>
          
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="mb-10 relative">
              <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full bg-pink-light/80 animate-float blur-sm"></div>
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-purple-light/80 animate-float blur-sm" style={{animationDelay: '2s'}}></div>
              
              <div className="relative inline-block">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 bg-white/80 rounded-2xl rotate-45 shadow-pink"></div>
                  <Image 
                    src="/kasoro_logo.png" 
                    alt="Kasoro Logo" 
                    width={120} 
                    height={120} 
                    className="relative z-10 p-2"
                  />
                </div>
                <h1 className="mt-13 text-6xl md:text-7xl font-bold text-purple-dark/80 bg-clip-text bg-gradient-to-r from-pink-primary to-purple-primary">
                  KASORO
                </h1>
              </div>
            </div>
            
            <p className="text-2xl md:text-3xl text-purple-dark font-semibold mb-6">
              First CommuniFi on Solana
            </p>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-14">
              The cutest community-driven platform for content creators and community builders
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-5 mb-20">
              <Link 
                href="/Kasoro"
                className="px-10 py-5 bg-white/80 border-2 border-pink-light text-pink-dark rounded-full shadow-md text-xl font-semibold transition-all hover:bg-pink-light/20 hover:border-pink-primary"
              >
                <span>Launch App</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <a 
                href="#how-it-works" 
                className="px-10 py-5 bg-white/80 border-2 border-pink-light text-pink-dark rounded-full shadow-md text-xl font-semibold transition-all hover:bg-pink-light/20 hover:border-pink-primary"
              >
                Learn More
              </a>
            </div>
            
            {/* Features carousel */}
            <div className="relative mx-auto w-full max-w-4xl h-[400px] overflow-hidden rounded-3xl shadow-2xl">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === activeFeature ? 'opacity-100 translate-x-0' : 
                    index < activeFeature ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
                  }`}
                >
                  <div className="h-full bg-white flex flex-col md:flex-row items-center overflow-hidden">
                    <div className="md:w-1/2 h-full bg-gradient-to-br from-pink-light to-purple-light/50 p-8 flex items-center justify-center">
                      <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg flex items-center justify-center text-5xl`}>
                        {feature.icon}
                      </div>
                    </div>
                    <div className="md:w-1/2 p-10 flex flex-col items-center md:items-start justify-center">
                      <h3 className="text-3xl font-bold text-purple-dark mb-4">{feature.title}</h3>
                      <p className="text-xl text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Carousel controls */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-10">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === activeFeature ? 'w-10 bg-black' : 'bg-gray-300'
                    }`}
                    aria-label={`Show feature ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className={`py-24 px-4 bg-white rounded-t-[3rem] mt-12 relative z-10 transition-all duration-1000 ease-out transform ${scrollY > 200 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-5 py-2 rounded-full bg-white/80 text-pink-dark text-lg font-semibold mb-4 border border-pink-light">
                Our Features
              </div>
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-primary to-purple-primary mb-6">
                Why Choose Kasoro
              </h2>
              <p className="text-xl text-purple-dark/80 max-w-3xl mx-auto">
                Discover the unique features that make our platform special
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 px-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`bg-gradient-to-br from-white to-pink-light/10 rounded-3xl shadow-xl p-8 border-2 border-pink-light transition-all duration-700 hover:-translate-y-3 hover:shadow-pink ${scrollY > 300 + index * 50 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                  style={{transitionDelay: `${index * 200}ms`}}
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl shadow-md flex items-center justify-center text-3xl mb-6 ${index % 2 === 0 ? 'rotate-3' : '-rotate-3'}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-pink-dark mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-pink-primary font-medium">
                    <span className="mr-2">Learn more</span>
                    <span className="w-7 h-7 rounded-full bg-pink-light flex items-center justify-center">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      
        {/* How It Works Section */}
        <section 
          id="how-it-works" 
          className={`py-24 px-4 bg-gradient-to-br from-pink-light/50 to-purple-light/50 relative z-10 transition-all duration-1000 ease-out transform ${scrollY > 600 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block px-5 py-2 rounded-full bg-white/80 text-pink-dark text-lg font-semibold mb-4 border border-pink-light">
                How It Works
              </div>
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-primary to-purple-primary mb-6">
                Community as DeFi Itself
              </h2>
              <p className="text-xl text-purple-dark/80 max-w-3xl mx-auto">
                Kasoro connects depositors and challengers to create sustainable communities
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 px-4">
              <div className={`bg-white rounded-3xl shadow-xl p-8 border-2 border-pink-medium transition-all duration-700 hover:-translate-y-3 hover:shadow-pink ${scrollY > 700 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                <div className="w-20 h-20 bg-gradient-to-br from-pink-medium to-pink-primary rounded-2xl shadow-md flex items-center justify-center text-3xl mb-6 rotate-3">
                  💰
                </div>
                <h3 className="text-2xl font-bold text-pink-dark mb-4">Depositors</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Deposit SOL as bounties for community building and content creation. Set time limits and base fees to ensure quality contributions.
                </p>
                <div className="flex items-center text-pink-primary font-medium">
                  <span className="mr-2">Learn more about depositing</span>
                  <span className="w-7 h-7 rounded-full bg-pink-light flex items-center justify-center">→</span>
                </div>
              </div>
              
              <div className={`bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-medium transition-all duration-700 hover:-translate-y-3 hover:shadow-purple ${scrollY > 750 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`} style={{transitionDelay: '200ms'}}>
                <div className="w-20 h-20 bg-gradient-to-br from-purple-medium to-purple-primary rounded-2xl shadow-md flex items-center justify-center text-3xl mb-6 -rotate-3">
                  🏆
                </div>
                <h3 className="text-2xl font-bold text-purple-dark mb-4">Challengers</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Create valuable content for communities. The last challenger to post before the time limit gets the bounty prize.
                </p>
                <div className="flex items-center text-purple-primary font-medium">
                  <span className="mr-2">Learn more about challenging</span>
                  <span className="w-7 h-7 rounded-full bg-purple-light flex items-center justify-center">→</span>
                </div>
              </div>
            </div>
            
            {/* Call to action */}
            <div className={`mt-24 text-center transition-all duration-1000 ease-out transform ${scrollY > 900 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <div className="inline-block bg-gradient-to-r from-pink-primary to-purple-primary p-[3px] rounded-3xl shadow-lg">
                <div className="bg-white rounded-3xl px-10 py-8">
                  <h3 className="text-2xl font-bold text-purple-dark mb-4">Ready to join our community?</h3>
                  <p className="text-gray-600 mb-6">Start building or challenging in our ecosystem today!</p>
                  <Link 
                    href="/app"
                    className="inline-block px-8 py-3 bg-gradient-to-r from-pink-primary to-purple-primary text-purple-black rounded-full shadow-md text-lg font-medium transition-all hover:shadow-lg hover:scale-105 border-2 border-white"
                  >
                    Join Community
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-12 bg-white rounded-b-3xl text-purple-black relative z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-8 border-b border-white/20">
              <div className="flex items-center space-x-3 mb-6 md:mb-0">
                <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
                  <Image src="/kasoro_logo.png" alt="Kasoro Logo" width={30} height={30} />
                </div>
                <div>
                  <h4 className="font-bold text-xl">KASORO</h4>
                  <p className="text-sm text-white/80">First CommuniFi on Solana</p>
                </div>
              </div>
              
              <div className="flex space-x-8">
                <a href="#" className="text-purple-black hover:text-pink-light transition-all hover:scale-105 duration-300 flex items-center gap-2">
                  <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">𝕏</span>
                  <span>Twitter</span>
                </a>
                <a href="#" className="text-purple-black hover:text-pink-light transition-all hover:scale-105 duration-300 flex items-center gap-2">
                  <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">📱</span>
                  <span>Telegram</span>
                </a>
                <a href="#" className="text-purple-black hover:text-pink-light transition-all hover:scale-105 duration-300 flex items-center gap-2">
                  <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">🐙</span>
                  <span>GitHub</span>
                </a>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm mb-4 md:mb-0">© 2025 Kasoro. All rights reserved.</p>
              <div className="flex space-x-6">
                <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}