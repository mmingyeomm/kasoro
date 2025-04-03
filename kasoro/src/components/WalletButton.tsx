'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';

export function WalletButton() {
  const { publicKey, connecting } = useWallet();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering wallet button to avoid hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      <WalletMultiButton className="wallet-button" />
      {publicKey && (
        <div className="text-xs mt-1 text-center">
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </div>
      )}
    </div>
  );
}