'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api';
import { useWebSocket } from '@/hooks/useWebSocket';

interface Depositor {
  id: string;
  amount: number;
  walletAddress: string;
  depositedAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    profileImageUrl: string | null;
  };
}

interface DepositorListProps {
  communityId: string;
}

export default function DepositorsList({ communityId }: DepositorListProps) {
  const [depositors, setDepositors] = useState<Depositor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Connect to WebSocket for real-time updates
  const { lastDeposit } = useWebSocket(communityId);

  // Create fetchDepositors as a memoized function so we can call it on demand
  const fetchDepositors = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Depositor[]>(`/communities/${communityId}/depositors`);
      
      // The backend is already aggregating the amounts per user
      // so we just need to sort by amount (highest first)
      const sortedDepositors = [...data].sort((a, b) => b.amount - a.amount);
      setDepositors(sortedDepositors);
      
      console.log('Fetched depositors:', data);
    } catch (err) {
      console.error('Error fetching depositors:', err);
      setError('Could not load depositors. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  // Fetch depositors when component mounts or when a new deposit is made
  useEffect(() => {
    fetchDepositors();
  }, [fetchDepositors, lastDeposit]); // Re-fetch when lastDeposit changes

  // Calculate total amount staked
  const totalStaked = depositors.reduce((sum, depositor) => sum + depositor.amount, 0);

  return (
    <div>
      <div className="mb-6 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-[#FF69B4] dark:bg-[#FF1493] rounded-full"></span>
            <h3 className="text-lg font-extrabold tracking-widest uppercase text-[#FF69B4] dark:text-[#FF69B4]">Meme Stakers</h3>
            <span className="w-4 h-4 bg-[#FF69B4] dark:bg-[#FF1493] rounded-full"></span>
          </div>
          <button 
            onClick={() => fetchDepositors()} 
            className="text-xs bg-[#FF69B4] hover:bg-[#FF1493] text-white px-2 py-1 rounded-full border-2 border-dashed border-white dark:border-gray-700 transition-all transform hover:scale-110 font-bold"
            title="Refresh list"
          >
            ↻ Refresh
          </button>
        </div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 border-b-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] pb-2">
          {depositors.length} staker{depositors.length !== 1 ? 's' : ''} · {totalStaked.toFixed(2)} SOL total
        </div>
      </div>
      
      {loading ? (
        <div className="py-2 px-3 text-sm text-gray-500">
          <div className="animate-pulse flex space-x-2 items-center">
            <div className="h-4 w-4 bg-[#FF69B4]/30 rounded-full"></div>
            <div className="h-4 w-full bg-[#FF69B4]/20 rounded"></div>
          </div>
        </div>
      ) : error ? (
        <div className="py-3 px-4 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 border-4 border-dashed border-red-400 dark:border-red-600 rounded-xl font-bold">
          {error}
        </div>
      ) : depositors.length === 0 ? (
        <div className="py-3 px-4 text-sm text-[#FF69B4] dark:text-[#FF69B4] italic bg-[#FF69B4]/10 border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] rounded-xl font-bold text-center">
          No stakers yet. Be the first to deposit! 🚀
        </div>
      ) : (
        <div className="space-y-3">
          {depositors.map((depositor) => (
            <div 
              key={depositor.id} 
              className="border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] rounded-lg p-3.5 bg-white dark:bg-gray-800 hover:shadow-lg transition-all transform hover:scale-[1.02]"
            >
              <div className="flex-grow">
                <div className="font-extrabold text-[#FF69B4] dark:text-[#FF69B4]">
                  @{depositor.user.username}
                </div>
                <div 
                  className="font-mono font-bold text-gray-600 dark:text-gray-400 text-sm mt-1 flex items-center"
                  title={`Last deposit: ${new Date(depositor.depositedAt).toLocaleString()}`}
                >
                  <span>{depositor.amount.toFixed(2)} SOL</span>
                  <span className="ml-2 bg-[#FF69B4]/10 dark:bg-[#FF69B4]/20 px-1.5 py-0.5 rounded text-xs">
                    {totalStaked > 0 ? ((depositor.amount / totalStaked) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
