'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginErrorClient() {
	const searchParams = useSearchParams();
	const errorType = searchParams.get('type');

	return (
		<div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-8">
			<div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
				<div className="flex items-center justify-center mb-2">
					<Image src="/images/kasoro_logo.png" alt="Kasoro logo" width={50} height={50} />
				</div>
				<h1 className="text-2xl font-bold text-center mb-6 text-red-500">Login Error</h1>
				<p className="text-center mb-6">
					{errorType === 'twitter'
						? 'An error occurred while connecting your X account. Please try again.'
						: 'An error occurred during login. Please check your X account or wallet address and try again.'}
				</p>
				<div className="flex justify-center">
					<Link href="/" className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">
						Back to Home
					</Link>
				</div>
			</div>
		</div>
	);
}

export default function LoginError() {
	// useSearchParams를 사용하지 않고 hydrate 이슈를 방지
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-4rem)]">
				<p>Loading...</p>
			</div>
		);
	}

	return <LoginErrorClient />;
}
