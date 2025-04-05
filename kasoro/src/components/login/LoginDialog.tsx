'use client';

import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { api } from '@/api';

// User type
interface User {
  id: string;
  username: string;
  oauth_token?: string;
  oauth_token_secret?: string;
  walletAddress?: string | null;
}

interface LoginDialogProps {
	onClose: () => void;
	user?: User | null;
}

export default function LoginDialog({ onClose, user }: LoginDialogProps) {
	const { publicKey, connected, disconnect } = useWallet();
	const [hasTwitterConnected, setHasTwitterConnected] = useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();
	const [linking, setLinking] = useState(false);
	const [walletAddress, setWalletAddress] = useState(user?.walletAddress || '');
	const [isLinked, setIsLinked] = useState(!!user?.walletAddress);

	useEffect(() => {
		// Check if user data exists from props
		if (user && user.username) {
			setHasTwitterConnected(true);
		} else {
			// URL 파라미터로부터 트위터 연결 상태 확인
			const twitterConnected = searchParams.get('twitter') === 'connected';
			if (twitterConnected) {
				setHasTwitterConnected(true);
			}
		}
	}, [searchParams, user]);

	const isLoginEnabled = publicKey && hasTwitterConnected;

	const handleLogin = () => {
		// 로그인 처리 로직
		if (isLoginEnabled) {
			console.log('로그인 처리:', {
				wallet: publicKey?.toString(),
				twitter: 'connected',
			});
			// 로그인 성공 후 홈페이지로 리다이렉트
			router.push('/');
			onClose();
		}
	};
	
	const handleLinkWallet = async () => {
		if (!connected || !publicKey) {
			toast.error('Please connect your wallet first');
			return;
		}

		setLinking(true);

		try {
			const walletAddressStr = publicKey.toString();

			const { data } = await api.put<{ walletAddress: string }>('/users/wallet', {
				walletAddress: walletAddressStr,
			});
			setWalletAddress(data.walletAddress);
			setIsLinked(true);
			toast.success('Wallet linked successfully!');
			onClose(); // Set Profile 버튼 클릭 시 팝업 닫기
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
				toast.success('Wallet unlinked successfully');
				onClose(); // Unlink Profile 버튼 클릭 시 팝업 닫기
			} catch (error) {
				console.error('Error unlinking wallet:', error);
				toast.error(error instanceof Error ? error.message : 'Failed to unlink wallet');
			}
		}
	};

	return (
		<div className="w-full">
			<DialogHeader>
				<div className="flex flex-col items-center mb-4">
					<div className="w-16 h-16 bg-white rounded-xl shadow-pink flex items-center justify-center p-2 mb-4">
						<Image src="/images/kasoro_logo.png" alt="Kasoro Logo" width={40} height={40} />
					</div>
					<DialogTitle className="text-center text-2xl font-bold text-purple-dark">Set Profile</DialogTitle>
					<p className="text-sm text-gray-500 text-center mt-2">
						To continue, please connect your wallet and X (Twitter) account.
					</p>
				</div>
			</DialogHeader>

			{searchParams.get('error') && (
				<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
					{searchParams.get('error') === 'twitter_auth_failed'
						? 'Failed to connect X account. Please try again.'
						: 'An error occurred. Please try again.'}
				</div>
			)}

			<div className="grid gap-4 py-4">
				<div className="w-full px-4 py-3 rounded-lg bg-black text-white font-medium flex items-center justify-center">
					{publicKey ? '✅ Wallet connected' : 'Connect your wallet'}
				</div>

				<Link
					href={`${process.env.NEXT_PUBLIC_API_URL}/auth/login/twitter`}
					className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-black text-white font-medium hover:opacity-90 transition-opacity"
				>
					{hasTwitterConnected && user ? (
						<>
							✅ Connected as <span className="font-bold ml-1">@{user.username}</span>
						</>
					) : 'Connect X account'}
				</Link>
				
				<button 
					className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-black text-white font-medium hover:opacity-90 transition-opacity"
				>
					Connect Discord
				</button>
				
				<button
					className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-black text-white font-medium hover:opacity-90 transition-opacity"
				>
					Connect Telegram
				</button>

				{connected && publicKey && (
					<div className="mt-4">
						{isLinked ? (
							<button
								onClick={handleUnlinkWallet}
								className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-100 text-red-800 border border-red-300 font-medium hover:bg-red-200 transition-colors"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z"
									/>
								</svg>
								Unlink Profile
							</button>
						) : (
							<button
								onClick={handleLinkWallet}
								disabled={linking || !connected}
								className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-100 text-purple-800 border border-purple-300 font-medium hover:bg-purple-200 transition-colors disabled:opacity-50"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
								{linking ? 'Linking...' : 'Set Profile'}
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}