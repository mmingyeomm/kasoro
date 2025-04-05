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
		<header className="sticky top-0 w-full py-3 px-6 flex justify-between items-center relative z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] shadow-md">
			<div className="flex items-center gap-3">
				<Link href="/" className="flex items-center gap-3 group">
					<div className="w-12 h-12 bg-gradient-to-br from-[#FF69B4] to-purple-500 dark:from-[#FF1493] dark:to-purple-400 rounded-full border-4 border-dashed border-white dark:border-gray-800 flex items-center justify-center p-1.5 shadow-lg transform group-hover:scale-110 transition-all">
						<Image src="/images/kasoro_logo.png" alt="Kasoro Logo" width={32} height={32} className="rounded-full" />
					</div>
					<h2 className="font-extrabold text-xl tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FF69B4] to-purple-500 dark:from-[#FF1493] dark:to-purple-400 group-hover:scale-105 transition-transform">KASORO</h2>
				</Link>
				<div className="h-8 border-r-2 border-dashed border-[#FF69B4]/30 dark:border-[#FF1493]/30 mx-2"></div>
				<nav className="flex items-center gap-6 ml-1">
					<Link href="/communities" className="font-bold text-gray-700 dark:text-gray-300 hover:text-[#FF69B4] dark:hover:text-[#FF69B4] transition-colors">
						Communities
					</Link>
					<a href="#features" className="font-bold text-gray-700 dark:text-gray-300 hover:text-[#FF69B4] dark:hover:text-[#FF69B4] transition-colors">
						Features
					</a>
					<a href="#how-it-works" className="font-bold text-gray-700 dark:text-gray-300 hover:text-[#FF69B4] dark:hover:text-[#FF69B4] transition-colors">
						How It Works
					</a>
				</nav>
			</div>
			
			<div className="flex items-center gap-4">
				{mounted && <WalletButton />}
			</div>
		</header>
	);
}