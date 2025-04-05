'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface IntroAnimationProps {
	onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		// Check if this is the first visit
		const isFirstVisit = localStorage.getItem('hasVisited') === null;

		if (isFirstVisit) {
			// Show animation for first visit
			setIsLoaded(true);
			localStorage.setItem('hasVisited', 'true');

			// Intro animation timing
			const introTimer = setTimeout(() => {
				onComplete();
			}, 2500);

			return () => clearTimeout(introTimer);
		} else {
			// Skip animation for returning visitors
			setIsLoaded(true);
			onComplete();
		}
	}, [onComplete]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-light/50 via-white to-purple-light/50">
			<div className="flex flex-col items-center">
				<div
					className={`transform transition-all duration-1000 ease-out ${
						isLoaded ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
					}`}
				>
					<div className="relative w-32 h-32 flex items-center justify-center">
						<div className="absolute inset-0 bg-white rounded-2xl rotate-45 shadow-pink animate-pulse-soft"></div>
						<Image src="/images/kasoro_logo.png" alt="Kasoro Logo" width={120} height={120} className="relative z-10" />
					</div>
				</div>
				<h1
					className={`font-[bazzi] mt-10 text-6xl font-bold text-purple-dark/80 bg-clip-text bg-gradient-to-r from-pink-primary to-purple-primary transition-all duration-1000 delay-300 ${
						isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
					}`}
				>
					KASORO
				</h1>
				<p
					className={`mt-4 text-xl text-purple-dark/80 transition-all duration-1000 delay-500 ${
						isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
					}`}
				>
					First CommuniFi on Solana
				</p>
			</div>
		</div>
	);
}
