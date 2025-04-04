"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileImage, setProfileImage] = useState("/default_avatar.png");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
    
    // Simulate loading profile data
    setTimeout(() => {
      setUsername("Kasoro User");
      setBio("I love building communities on Solana!");
      setWalletAddress("soL1Adi3...9j2k");
    }, 1000);
  }, []);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const saveProfile = () => {
    // Save profile logic would go here
    if (previewImage) {
      setProfileImage(previewImage);
      setPreviewImage(null);
    }
    alert("Profile saved successfully! <");
  };
  
  const cancelChanges = () => {
    setPreviewImage(null);
    // Reset other form fields if needed
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-light/40 to-purple-light/30">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-40 h-40 rounded-full bg-pink-light/60 blur-2xl animate-float"></div>
        <div className="absolute bottom-[20%] right-[15%] w-52 h-52 rounded-full bg-purple-light/60 blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-[45%] right-[10%] w-32 h-32 rounded-full bg-pink-medium/40 blur-2xl animate-float" style={{animationDelay: '1.5s'}}></div>
      </div>
      
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
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-10 max-w-5xl mx-auto w-full">
        <div className={`transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-3xl font-bold mb-8 text-purple-dark">Profile Settings</h2>
          
          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-soft border-2 border-pink-light p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-10">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-full border-4 border-pink-light overflow-hidden bg-pink-light/20 flex items-center justify-center relative">
                    {previewImage ? (
                      <Image 
                        src={previewImage} 
                        alt="Profile preview" 
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Image 
                        src={profileImage} 
                        alt="Profile" 
                        fill
                        style={{ objectFit: 'cover' }}
                        onError={() => setProfileImage("/default_avatar.png")}
                      />
                    )}
                    <div 
                      className="absolute inset-0 bg-purple-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      onClick={triggerFileInput}
                    >
                      <span className="text-white text-lg">Change Photo</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*" 
                    className="hidden" 
                  />
                  <div className="absolute -bottom-2 right-2 w-12 h-12 rounded-full bg-pink-primary shadow-pink flex items-center justify-center cursor-pointer hover:bg-pink-dark transition-colors"
                    onClick={triggerFileInput}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Upload a profile picture (max 5MB)
                </p>
                
                {previewImage && (
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={saveProfile}
                      className="px-4 py-2 bg-pink-primary text-white rounded-full text-sm hover:bg-pink-dark transition-colors"
                    >
                      Save Photo
                    </button>
                    <button 
                      onClick={cancelChanges}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {/* Profile Form */}
              <div className="flex-1">
                <div className="grid gap-6">
                  <div>
                    <label htmlFor="username" className="block text-purple-dark font-medium mb-2">
                      Display Name
                    </label>
                    <input 
                      type="text" 
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-pink-light focus:border-pink-primary focus:outline-none transition-colors"
                      placeholder="Your display name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-purple-dark font-medium mb-2">
                      Bio
                    </label>
                    <textarea 
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-pink-light focus:border-pink-primary focus:outline-none transition-colors resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="wallet" className="block text-purple-dark font-medium mb-2">
                      Wallet Address
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        id="wallet"
                        value={walletAddress}
                        readOnly
                        className="w-full px-4 py-3 rounded-2xl border-2 border-pink-light bg-gray-50 cursor-not-allowed"
                      />
                      <button 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-primary hover:text-purple-dark transition-colors"
                        onClick={() => navigator.clipboard.writeText(walletAddress)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Connect your wallet to update
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Social Connections Card */}
          <div className="bg-white rounded-3xl shadow-soft border-2 border-pink-light p-8 mb-8">
            <h3 className="text-2xl font-bold text-purple-dark mb-6">
              Connect Social Accounts
            </h3>
            
            <div className="space-y-6">
              {/* Twitter/X Connection */}
              <div className="flex items-center justify-between p-4 border-2 border-pink-light rounded-2xl hover:border-pink-primary transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                    <Image 
                      src="/x-logo.svg" 
                      alt="X Logo" 
                      width={20} 
                      height={20}
                      className="invert" 
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Twitter / X</h4>
                    <p className="text-gray-500 text-sm">
                      {twitterConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <button 
                  className={`px-5 py-2 rounded-full font-medium transition-all ${
                    twitterConnected 
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                  onClick={() => setTwitterConnected(!twitterConnected)}
                >
                  {twitterConnected ? "Disconnect" : "Connect"}
                </button>
              </div>
              
              {/* Telegram Connection */}
              <div className="flex items-center justify-between p-4 border-2 border-pink-light rounded-2xl hover:border-pink-primary transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm-2.426 14.741h-.012l-3.78-2.58c-.35-.302-.531-.917-.399-1.238l.365-.777c.117-.292.409-.373.695-.12l1.422 1.01c.262.184.543.204.705.064l4.869-4.796c.236-.226.548-.219.752.034l2.48 2.461c.194.158.223.471.083.806l-2.306 3.747c-.145.29-.415.391-.685.275l-4.189-2.12"></path></svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Telegram</h4>
                    <p className="text-gray-500 text-sm">
                      {telegramConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <button 
                  className={`px-5 py-2 rounded-full font-medium transition-all ${
                    telegramConnected 
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                      : "bg-[#0088cc] text-white hover:bg-[#0077b5]"
                  }`}
                  onClick={() => setTelegramConnected(!telegramConnected)}
                >
                  {telegramConnected ? "Disconnect" : "Connect"}
                </button>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end gap-4 mt-10">
            <button 
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-colors"
              onClick={() => {
                // Reset form
                setUsername("Kasoro User");
                setBio("I love building communities on Solana!");
              }}
            >
              Cancel
            </button>
            <button 
              className="px-8 py-3 bg-gradient-to-r from-pink-primary to-purple-primary rounded-full font-medium shadow-pink hover:shadow-lg transition-all hover:scale-105"
              onClick={saveProfile}
            >
              Save Changes
            </button>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full bg-gradient-to-r from-pink-primary to-purple-primary py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <span className="text-white text-sm"> 2025 Kasoro</span>
          </div>
          
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-white hover:text-purple-light transition-colors">Terms</a>
            <a href="#" className="text-white hover:text-purple-light transition-colors">Privacy</a>
            <a href="#" className="text-white hover:text-purple-light transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}