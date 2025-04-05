'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import LoginDialog from '@/components/login/LoginDialog';
import { api } from '@/api';

// Define user type
interface User {
  id: string;
  username: string;
  oauth_token?: string;
  oauth_token_secret?: string;
  walletAddress?: string | null;
}

export function WalletButton() {
	const { publicKey, connecting } = useWallet();
	const [mounted, setMounted] = useState(false);
	const [showLoginDialog, setShowLoginDialog] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	
	// Ensure component is mounted before rendering wallet button to avoid hydration errors
	useEffect(() => {
		setMounted(true);
	}, []);
	
	// Show login dialog when wallet is connected
	useEffect(() => {
		if (publicKey) {
			setShowLoginDialog(true);
			fetchUser();
		} else {
			setShowLoginDialog(false);
		}
	}, [publicKey]);
	
	// Fetch user data from API
	const fetchUser = async () => {
		try {
			const { data } = await api.get<User>('/auth/user');
			if (data && data.id && data.username) {
				setUser(data);
			}
		} catch (error) {
			console.error('Error fetching user:', error);
		}
	};

	if (!mounted) return null;

	return (
		<>
			<div className="flex items-center">
				<WalletMultiButton className="wallet-button" />
			</div>
			
			<Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
				<DialogContent className="sm:max-w-md p-6">
					<LoginDialog 
						onClose={() => setShowLoginDialog(false)} 
						user={user}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
