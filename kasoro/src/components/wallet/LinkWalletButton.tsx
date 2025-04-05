'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import { api } from '@/api';

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
	const [walletAddress, setWalletAddress] = useState(user.walletAddress || '');
	const [isLinked, setIsLinked] = useState(!!user.walletAddress);

	const handleLinkWallet = async () => {
		if (!connected || !publicKey) {
			toast.error('Please connect your wallet first');
			return;
		}

		setLinking(true);

		try {
			const walletAddress = publicKey.toString();

			const { data } = await api.put<{ walletAddress: string }>('/users/wallet', {
				walletAddress: walletAddress,
			});
			setWalletAddress(data.walletAddress);
			setIsLinked(true);
			toast.success('Wallet linked successfully!');
			onWalletLinked(walletAddress);
		} catch (error) {
			console.error('Error linking wallet:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to link wallet');
		} finally {
			setLinking(false);
		}
	};

	const handleUnlinkWallet = async () => {
		if (isLinked) {
			try {
				await api.delete('/users/wallet');
				setWalletAddress('');
				setIsLinked(false);
				disconnect();
				onWalletLinked('');
				toast.success('Wallet unlinked successfully');
			} catch (error) {
				console.error('Error unlinking wallet:', error);
				toast.error(error instanceof Error ? error.message : 'Failed to unlink wallet');
			}
		}
	};

	if (!connected) {
		return (
			<div className="bg-yellow-50 border-2 border-black p-3 text-sm mb-4">
				<p className="mb-2">Connect your wallet to enable bounty features (optional)</p>
			</div>
		);
	}

	if (isLinked) {
		return (
			<div className="bg-green-50 border-2 border-black p-3 text-sm mb-4">
				<p className="mb-2">
					Wallet linked: {walletAddress?.substring(0, 4)}...
					{walletAddress?.substring(walletAddress.length - 4)}
				</p>
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
			<p className="mb-2">Link your wallet to enable bounty features (optional)</p>
			<button
				onClick={handleLinkWallet}
				disabled={linking || !connected}
				className="bg-black hover:bg-gray-800 text-white border-2 border-black px-3 py-1 text-xs disabled:opacity-50"
			>
				{linking ? 'Linking...' : 'Link Wallet'}
			</button>
		</div>
	);
}
