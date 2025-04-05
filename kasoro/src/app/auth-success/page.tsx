'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Twitter } from 'lucide-react';
import { api } from '@/api';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';

// Define user type for TypeScript
interface User {
	id: string;
	username: string;
	oauth_token?: string;
	oauth_token_secret?: string;
	walletAddress?: string | null;
}

export default function AuthSuccess() {
	const router = useRouter();
	const { connected, publicKey } = useWallet();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [linking, setLinking] = useState(false);

	useEffect(() => {
		async function fetchUser() {
			try {
				const { data } = await api.get<User>('/auth/user');

				// Check if the data has valid user properties
				if (data && data.id && data.username) {
					setUser(data);
				} else {
					console.log('No valid user data found');
					setUser(null);
				}
			} catch (error) {
				console.error('Error fetching user:', error);
			} finally {
				setLoading(false);
			}
		}

		fetchUser();
	}, []);

	const handleBackToHome = async () => {
		if (connected && publicKey && user) {
			setLinking(true);
			try {
				const walletAddress = publicKey.toString();
				const { data } = await api.put<{ walletAddress: string }>('/users/wallet', {
					walletAddress: walletAddress,
				});
				setUser({
					...user,
					walletAddress: data.walletAddress,
				});
				toast.success('Wallet linked successfully!');
			} catch (error) {
				console.error('Error linking wallet:', error);
				toast.error(error instanceof Error ? error.message : 'Failed to link wallet');
			} finally {
				setLinking(false);
			}
		}
		router.push('/communities');
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-8">
			<div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
				{loading ? (
					<p className="text-center">Loading user data...</p>
				) : user ? (
					<>
						<div className="flex items-center justify-center mb-6">
							<Twitter className="w-8 h-8" />
						</div>
						<h1 className="text-2xl font-bold text-center mb-6">Successfully logged in with X!</h1>
						<div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-6">
							<p className="mb-2">
								<span className="font-semibold">Username:</span> @{user.username}
							</p>
							<p>
								<span className="font-semibold">User ID:</span> {user.id}
							</p>
						</div>
						<div className="flex justify-center">
							<button
								onClick={handleBackToHome}
								disabled={linking}
								className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
							>
								{linking ? 'Linking Wallet...' : 'Back to Home'}
							</button>
						</div>
					</>
				) : (
					<>
						<h1 className="text-2xl font-bold text-center mb-6 text-red-500">Auth Error</h1>
						<p className="text-center mb-6">Could not retrieve user information. Please try logging in again.</p>
						<div className="flex justify-center">
							<button
								onClick={() => router.push('/communities')}
								className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
							>
								Back to Home
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
