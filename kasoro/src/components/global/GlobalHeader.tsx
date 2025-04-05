'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/components/wallet/WalletButton';
import { useSearchParams, useRouter } from 'next/navigation';

export default function GlobalHeader() {
	const { publicKey } = useWallet();
	const [mounted, setMounted] = useState(false);
	const [hasTwitterConnected, setHasTwitterConnected] = useState(false);
	const searchParams = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		setMounted(true);

		// URL 파라미터로부터 트위터 연결 상태 확인
		const twitterConnected = searchParams.get('twitter') === 'connected';
		if (twitterConnected) {
			setHasTwitterConnected(true);
		}
	}, [searchParams]);

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
		}
	};

	return (
		<header className="sticky top-0 w-full py-2 sm:py-3 px-3 sm:px-6 flex items-center relative z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b-4 border-dashed border-[#5fb3ff] dark:border-[#4a9ce8] shadow-md">
			{/* Logo and Left Side */}
			<div className="flex items-center flex-grow">
				<Link href="/" className="flex items-center gap-2 sm:gap-3 group mr-3 sm:mr-6">
					<div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-[#5fb3ff] to-purple-500 dark:from-[#4a9ce8] dark:to-purple-400 rounded-full border-3 sm:border-4 border-dashed border-white dark:border-gray-800 flex items-center justify-center p-1 sm:p-1.5 shadow-lg transform group-hover:scale-110 transition-all">
						<Image
							src="/images/kasoro_logo.png"
							alt="Kasoro Logo"
							width={20}
							height={20}
							className="rounded-full sm:hidden"
						/>
						<Image
							src="/images/kasoro_logo.png"
							alt="Kasoro Logo"
							width={32}
							height={32}
							className="rounded-full hidden sm:block"
						/>
					</div>
					<h2 className="font-extrabold text-sm sm:text-xl tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#5fb3ff] to-purple-500 dark:from-[#4a9ce8] dark:to-purple-400 group-hover:scale-105 transition-transform">
						Pulse
					</h2>
				</Link>

				{/* Navigation */}
				<nav className="flex items-center">
					<div className="h-6 sm:h-8 border-r-2 border-dashed border-[#5fb3ff]/30 dark:border-[#4a9ce8]/30 mr-3 sm:mr-4"></div>

					{/* Communities Link - Always visible */}
					<Link
						href="/communities"
						className="font-bold text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:text-[#5fb3ff] dark:hover:text-[#5fb3ff] transition-colors"
					>
						Communities
					</Link>

					{/* Features and How It Works - Only visible on desktop */}
					<div className="hidden md:flex items-center gap-6 ml-6">
						<a
							href="/#features"
							className="font-bold text-gray-700 dark:text-gray-300 hover:text-[#5fb3ff] dark:hover:text-[#5fb3ff] transition-colors"
						>
							Features
						</a>
						<a
							href="/#how-it-works"
							className="font-bold text-gray-700 dark:text-gray-300 hover:text-[#5fb3ff] dark:hover:text-[#5fb3ff] transition-colors"
						>
							How It Works
						</a>
					</div>
				</nav>
			</div>

			{/* Wallet Button (Right Side) */}
			<div className="flex items-center">{mounted && <WalletButton />}</div>
		</header>
	);
}
