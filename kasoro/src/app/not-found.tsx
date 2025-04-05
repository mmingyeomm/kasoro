'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p>Loading...</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center h-screen p-8">
			<div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
				<div className="flex items-center justify-center mb-2">
					<Image src="/images/kasoro_logo.png" alt="Kasoro logo" width={50} height={50} />
				</div>
				<h1 className="text-2xl font-bold text-center mb-6 text-red-500">404 - Page Not Found</h1>
				<p className="text-center mb-6">The page you are looking for does not exist or has been moved.</p>
				<div className="flex justify-center">
					<Link href="/" className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">
						Back to Home
					</Link>
				</div>
			</div>
		</div>
	);
}
