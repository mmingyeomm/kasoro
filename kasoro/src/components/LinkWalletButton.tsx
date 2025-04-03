"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  username: string;
  walletAddress?: string | null;
}

interface LinkWalletButtonProps {
  user: User;
  onWalletLinked: (walletAddress: string) => void;
}

export default function LinkWalletButton({ user, onWalletLinked }: LinkWalletButtonProps) {
  const { connected, publicKey, disconnect } = useWallet();
  const [linking, setLinking] = useState(false);

  const isLinked = user.walletAddress && user.walletAddress.length > 0;
  
  const handleLinkWallet = async () => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    setLinking(true);
    
    try {
      const walletAddress = publicKey.toString();
      
      const response = await fetch("http://localhost:3001/users/wallet", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ walletAddress }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Wallet linked successfully!");
        onWalletLinked(walletAddress);
      } else {
        throw new Error("Failed to link wallet");
      }
    } catch (error) {
      console.error("Error linking wallet:", error);
      toast.error(error instanceof Error ? error.message : "Failed to link wallet");
    } finally {
      setLinking(false);
    }
  };
  
  const handleUnlinkWallet = async () => {
    if (isLinked) {
      try {
        const response = await fetch("http://localhost:3001/users/wallet", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ walletAddress: null }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
        }
        
        disconnect();
        onWalletLinked("");
        toast.success("Wallet unlinked successfully");
      } catch (error) {
        console.error("Error unlinking wallet:", error);
        toast.error(error instanceof Error ? error.message : "Failed to unlink wallet");
      }
    }
  };
  
  if (!connected) {
    return (
      <div className="bg-yellow-50 border-2 border-black p-3 text-sm mb-4">
        <p className="mb-2">Connect your wallet to continue</p>
      </div>
    );
  }
  
  if (isLinked) {
    return (
      <div className="bg-green-50 border-2 border-black p-3 text-sm mb-4">
        <p className="mb-2">Wallet linked: {user.walletAddress?.substring(0, 4)}...{user.walletAddress?.substring(user.walletAddress.length - 4)}</p>
        <button
          onClick={handleUnlinkWallet}
          className="bg-red-100 hover:bg-red-200 text-red-800 border-2 border-black px-3 py-1 text-xs"
        >
          Unlink Wallet
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-yellow-50 border-2 border-black p-3 text-sm mb-4">
      <p className="mb-2">Link your wallet to create communities</p>
      <button
        onClick={handleLinkWallet}
        disabled={linking || !connected}
        className="bg-black hover:bg-gray-800 text-white border-2 border-black px-3 py-1 text-xs disabled:opacity-50"
      >
        {linking ? "Linking..." : "Link Wallet"}
      </button>
    </div>
  );
} 