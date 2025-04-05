'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import IntroAnimation from '@/components/global/IntroAnimation';

export default function Home() {
	const [introComplete, setIntroComplete] = useState(false);
	const [scrollY, setScrollY] = useState(0);
	const [activeFeature, setActiveFeature] = useState(0);

	// Features data
	const features = [
		{
			title: 'Time-Based Bounties',
			description: 'Deposits fund bounties that reward the last challenger before time expires.',
			icon: '⏱️',
			color: 'from-[#FF69B4] to-[#FF1493]',
		},
		{
			title: 'Community Building',
			description: 'Create sustainable communities with aligned incentives.',
			icon: '🏛️',
			color: 'from-purple-500 to-purple-700',
		},
		{
			title: 'Content Rewards',
			description: 'Get rewarded for creating valuable content that engages the community.',
			icon: '💰',
			color: 'from-[#FF69B4] to-purple-500',
		},
	];

	// Animation effects when page loads
	useEffect(() => {
		// Rotate through features
		const featureInterval = setInterval(() => {
			setActiveFeature((prev) => (prev + 1) % features.length);
		}, 5000);

		// Track scroll position for animations
		const handleScroll = () => {
			setScrollY(window.scrollY);
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			clearInterval(featureInterval);
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	// Handle intro animation completion
	const handleIntroComplete = () => {
		setIntroComplete(true);
	};

	return (
		<main className="flex flex-col items-center min-h-screen bg-gradient-to-br from-white via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950">
			{/* Intro Animation Overlay - Shows only during intro sequence */}
			{!introComplete && <IntroAnimation onComplete={handleIntroComplete} />}

			{/* Main content - becomes visible after intro animation */}
			<div className={`w-full transition-opacity duration-1000 ${introComplete ? 'opacity-100' : 'opacity-0'}`}>
				{/* Hero Section */}
				<section className="relative h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden">
					{/* Background */}
					<div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950">
						<div className="absolute inset-0 opacity-20 bg-[url('/images/pattern.svg')] bg-repeat bg-center"></div>
					</div>

					<div className="max-w-5xl mx-auto text-center relative z-10 px-4">
						<div className="mb-8 md:mb-12 relative">
							<div className="relative inline-block">
								<div className="relative w-36 h-36 mx-auto mb-6">
									<div className="absolute inset-0 bg-[#FF69B4] opacity-20 rounded-full blur-2xl animate-pulse-soft"></div>
									<Image
										src="/images/kasoro_logo.png"
										alt="Kasoro Logo"
										width={160}
										height={160}
										className="relative z-10"
									/>
								</div>
								<h1
									className="font-extrabold mt-4 md:mt-6 text-6xl md:text-8xl lg:text-9xl tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FF69B4] to-purple-500 dark:from-[#FF1493] dark:to-purple-400 animate-pulse-soft"
									style={{ textShadow: '0 0 15px rgba(255, 105, 180, 0.3)' }}
								>
									KASORO
								</h1>
							</div>
						</div>

						<p className="text-xl md:text-3xl font-extrabold mb-4 md:mb-6 text-[#FF69B4] dark:text-[#FF69B4]">
							First CommuniFi on Solana
						</p>
						<p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 md:mb-16 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm px-8 py-4 rounded-xl border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] text-gray-700 dark:text-gray-200 font-medium">
							The community-driven platform for dank meme creators and community builders
						</p>

						<div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6">
							<Link
								href="/communities"
								className="px-10 py-5 bg-[#FF69B4] hover:bg-[#FF1493] text-white rounded-full shadow-lg text-xl font-extrabold transition-all border-4 border-dashed border-white dark:border-gray-700 hover:scale-105 transform"
							>
								<span className="mr-2">LAUNCH APP</span>
								<span className="inline-block">→</span>
							</Link>
							<a
								href="#how-it-works"
								className="px-10 py-5 bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm border-4 border-dashed border-[#FF69B4]/50 dark:border-[#FF1493]/50 text-[#FF69B4] dark:text-[#FF1493] rounded-full shadow-md text-xl font-extrabold transition-all hover:bg-white/30 dark:hover:bg-gray-800/40 hover:scale-105 transform"
							>
								<span className="mr-2">LEARN MORE</span>
								<span className="inline-block">↓</span>
							</a>
						</div>
					</div>
				</section>

				{/* Features Section */}
				<section
					id="features"
					className={`py-24 px-4 bg-white dark:bg-gray-800 border-t-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] relative z-10 transition-all duration-1000 ease-out transform ${
						scrollY > 200 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
					}`}
				>
					<div className="max-w-6xl mx-auto">
						<div className="text-center mb-16">
							<div className="inline-block px-6 py-3 rounded-full bg-[#FF69B4]/10 text-[#FF69B4] dark:text-[#FF69B4] text-xl font-extrabold mb-6 border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] shadow-sm transform hover:scale-105 transition-all duration-300">
								OUR FEATURES
							</div>
							<h2 className="text-5xl font-extrabold tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FF69B4] to-purple-500 dark:from-[#FF1493] dark:to-purple-400 mb-8">
								Why Choose Kasoro
							</h2>
							<p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
								Discover the dankest features that make our platform special
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-8 px-4 mb-20">
							{features.map((feature, index) => (
								<div
									key={index}
									className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] transition-all duration-700 hover:-translate-y-3 hover:shadow-pink ${
										scrollY > 300 + index * 50 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
									}`}
									style={{ transitionDelay: `${index * 200}ms` }}
								>
									<div
										className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl shadow-md flex items-center justify-center text-3xl mb-6 rotate-3`}
									>
										{feature.icon}
									</div>
									<h3 className="text-2xl font-extrabold text-[#FF69B4] dark:text-[#FF69B4] mb-4">{feature.title}</h3>
									<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{feature.description}</p>
									<div className="flex items-center text-[#FF69B4] dark:text-[#FF69B4] font-extrabold">
										<span className="mr-2">Learn more</span>
										<span className="w-7 h-7 rounded-full border-2 border-dashed border-[#FF69B4] dark:border-[#FF1493] flex items-center justify-center">→</span>
									</div>
								</div>
							))}
						</div>

						{/* Features carousel */}
						<div className="relative mx-auto w-full max-w-5xl h-[450px] overflow-hidden rounded-3xl shadow-2xl border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493]">
							{features.map((feature, index) => (
								<div
									key={index}
									className={`absolute inset-0 transition-all duration-700 ease-in-out ${
										index === activeFeature
											? 'opacity-100 translate-x-0'
											: index < activeFeature
											? 'opacity-0 -translate-x-full'
											: 'opacity-0 translate-x-full'
									}`}
								>
									<div className="h-full bg-white dark:bg-gray-800 flex flex-col md:flex-row items-center overflow-hidden">
										<div className="md:w-1/2 h-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-gray-700 dark:to-purple-900/50 p-8 sm:p-12 flex items-center justify-center">
											<div
												className={`w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg flex items-center justify-center text-5xl md:text-6xl transform hover:scale-105 transition-all duration-300`}
											>
												{feature.icon}
											</div>
										</div>
										<div className="md:w-1/2 p-8 sm:p-12 flex flex-col items-center md:items-start justify-center">
											<h3 className="text-3xl md:text-4xl font-extrabold text-[#FF69B4] dark:text-[#FF69B4] mb-6">{feature.title}</h3>
											<p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">{feature.description}</p>
											<div className="mt-8 flex items-center text-[#FF69B4] dark:text-[#FF69B4] font-extrabold">
												<span className="mr-2">Learn more</span>
												<span className="w-7 h-7 rounded-full border-2 border-dashed border-[#FF69B4] dark:border-[#FF1493] flex items-center justify-center">→</span>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* How It Works Section */}
				<section
					id="how-it-works"
					className={`py-24 px-4 bg-gradient-to-br from-white via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950 border-t-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] relative z-10 transition-all duration-1000 ease-out transform ${
						scrollY > 600 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
					}`}
				>
					<div className="max-w-6xl mx-auto">
						<div className="text-center mb-16">
							<div className="inline-block px-6 py-3 rounded-full bg-[#FF69B4]/10 text-[#FF69B4] dark:text-[#FF69B4] text-xl font-extrabold mb-6 border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] shadow-sm transform hover:scale-105 transition-all duration-300">
								HOW IT WORKS
							</div>
							<h2 className="text-5xl font-extrabold tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#FF69B4] to-purple-500 dark:from-[#FF1493] dark:to-purple-400 mb-8">
								Community as DeFi Itself
							</h2>
							<p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
								Kasoro connects depositors and challengers to create sustainable meme communities
							</p>
						</div>

						<div className="grid md:grid-cols-2 gap-12 px-4">
							<div
								className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] transition-all duration-700 hover:-translate-y-3 hover:shadow-pink ${
									scrollY > 700 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
								}`}
							>
								<div className="w-20 h-20 bg-gradient-to-br from-[#FF69B4] to-[#FF1493] rounded-2xl shadow-md flex items-center justify-center text-3xl mb-6 rotate-3">
									💰
								</div>
								<h3 className="text-2xl font-extrabold text-[#FF69B4] dark:text-[#FF69B4] mb-4">Depositors</h3>
								<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
									Deposit SOL as bounties for community building and dank meme creation. Set time limits and base fees to
									ensure quality contributions.
								</p>
								<div className="flex items-center text-[#FF69B4] dark:text-[#FF69B4] font-extrabold">
									<span className="mr-2">Learn more about depositing</span>
									<span className="w-7 h-7 rounded-full border-2 border-dashed border-[#FF69B4] dark:border-[#FF1493] flex items-center justify-center">→</span>
								</div>
							</div>

							<div
								className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] transition-all duration-700 hover:-translate-y-3 hover:shadow-pink ${
									scrollY > 750 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
								}`}
								style={{ transitionDelay: '200ms' }}
							>
								<div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-md flex items-center justify-center text-3xl mb-6 rotate-3">
									🏆
								</div>
								<h3 className="text-2xl font-extrabold text-[#FF69B4] dark:text-[#FF69B4] mb-4">Challengers</h3>
								<p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
									Create valuable dank meme content for communities. The last challenger to post before the time limit gets the
									bounty prize.
								</p>
								<div className="flex items-center text-[#FF69B4] dark:text-[#FF69B4] font-extrabold">
									<span className="mr-2">Learn more about challenging</span>
									<span className="w-7 h-7 rounded-full border-2 border-dashed border-[#FF69B4] dark:border-[#FF1493] flex items-center justify-center">→</span>
								</div>
							</div>
						</div>

						{/* Call to action */}
						<div
							className={`mt-24 text-center transition-all duration-1000 ease-out transform ${
								scrollY > 900 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
							}`}
						>
							<div className="inline-block bg-white dark:bg-gray-800 p-0 rounded-3xl shadow-lg border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493]">
								<div className="rounded-xl px-10 py-8">
									<h3 className="text-3xl font-extrabold text-[#FF69B4] dark:text-[#FF69B4] mb-4">Ready to join our community?</h3>
									<p className="text-xl text-gray-700 dark:text-gray-300 mb-6">Start building or challenging in our dank meme ecosystem today!</p>
									<Link
										href="/communities"
										className="inline-block px-8 py-3 bg-[#FF69B4] hover:bg-[#FF1493] text-white font-extrabold border-4 border-dashed border-white dark:border-gray-700 rounded-full transition-all transform hover:scale-105 shadow-lg"
									>
										🚀 JOIN DANK MEME COMMUNITY 🚀
									</Link>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
