"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-hot-toast";

interface FormProps {
  userWalletAddress?: string | null;
}

export default function CreateGameRoomForm({ userWalletAddress }: FormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bountyAmount, setBountyAmount] = useState(1);
  const [timeLimit, setTimeLimit] = useState(30);
  const [baseFeePercentage, setBaseFeePercentage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { connected, publicKey } = useWallet();

  const isWalletLinked = !!userWalletAddress;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!connected || !publicKey) {
      setError("Please connect your wallet first");
      toast.error("Please connect your wallet first");
      return;
    }

    if (!isWalletLinked) {
      setError("Please link your wallet to your account first");
      toast.error("Please link your wallet to your account first");
      return;
    }
    
    // Check that connected wallet matches linked wallet
    if (publicKey.toString() !== userWalletAddress) {
      setError("The connected wallet doesn't match your linked wallet");
      toast.error("The connected wallet doesn't match your linked wallet");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/gamerooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          name, 
          description,
          bountyAmount,
          timeLimit,
          baseFeePercentage,
          walletAddress: publicKey.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Reset form
      setName("");
      setDescription("");
      setBountyAmount(1);
      setTimeLimit(30);
      setBaseFeePercentage(5);
      
      toast.success("Community created successfully!");
      
      // Navigate to the new game room
      router.push(`/gamerooms/${data.id}`);
    } catch (error) {
      console.error("Error creating game room:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create community";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 p-3 text-red-800 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
      
      <div className="pb-2">
        <h1 className="text-2xl font-bold tracking-widest uppercase mb-4">New Community</h1>
        <hr className="border-black dark:border-white border-1 mb-6" />
      </div>
      
      <div>
        <label htmlFor="name" className="block font-bold text-sm uppercase tracking-widest mb-1">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-none bg-blue-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter room name"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block font-bold text-sm uppercase tracking-widest mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border-2 border-black dark:border-white rounded-none bg-blue-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter room description"
        />
      </div>
      
      <div>
        <label htmlFor="bounty" className="block font-bold text-sm uppercase tracking-widest mb-1">
          Bounty (SOL)
        </label>
        <div className="border-2 border-black dark:border-white p-4 bg-blue-100 dark:bg-gray-800 flex items-center">
          <input
            id="bounty"
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={bountyAmount}
            onChange={(e) => setBountyAmount(parseFloat(e.target.value))}
            className="w-full mr-4 accent-blue-500"
          />
          <div className="min-w-[80px] bg-yellow-300 py-1 px-3 font-mono font-bold text-center border-2 border-black">
            {bountyAmount} SOL
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="timeLimit" className="block font-bold text-sm uppercase tracking-widest mb-1">
          Time Limit (MIN)
        </label>
        <div className="border-2 border-black dark:border-white p-4 bg-blue-100 dark:bg-gray-800 flex items-center">
          <input
            id="timeLimit"
            type="range"
            min="1"
            max="120"
            step="1"
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
            className="w-full mr-4 accent-blue-500"
          />
          <div className="min-w-[80px] bg-green-300 py-1 px-3 font-mono font-bold text-center border-2 border-black">
            {timeLimit} MIN
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="baseFee" className="block font-bold text-sm uppercase tracking-widest mb-1">
          Base Fee (%)
        </label>
        <div className="border-2 border-black dark:border-white p-4 bg-blue-100 dark:bg-gray-800 flex items-center">
          <input
            id="baseFee"
            type="range"
            min="0"
            max="20"
            step="1"
            value={baseFeePercentage}
            onChange={(e) => setBaseFeePercentage(parseInt(e.target.value))}
            className="w-full mr-4 accent-blue-500"
          />
          <div className="min-w-[80px] bg-red-300 py-1 px-3 font-mono font-bold text-center border-2 border-black">
            {baseFeePercentage}%
          </div>
        </div>
      </div>
      
      {!connected && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-700 p-3 text-yellow-800 dark:text-yellow-300 text-sm">
          Please connect your wallet to create a community
        </div>
      )}
      
      {connected && !isWalletLinked && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-700 p-3 text-yellow-800 dark:text-yellow-300 text-sm">
          Please link your wallet to your account first
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading || !name.trim() || !connected || !isWalletLinked}
        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wider mt-6"
      >
        {loading ? "Creating..." : "Create Community"}
      </button>
    </form>
  );
}
