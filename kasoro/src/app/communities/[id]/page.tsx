'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/api';
import MessageList from '@/components/MessageList';
import CreateMessageForm from '@/components/CreateMessageForm';
import { toast, Toaster } from 'react-hot-toast';
import DepositBountyDialog from '@/components/communities/DepositBountyDialog';
import { useWebSocket } from '@/hooks/useWebSocket';
import ClaimBasefeeDialog from '@/components/communities/ClaimBasefeeDialog';
import DepositorsList from '@/components/communities/DepositorsList';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface Creator {
	id: string;
	xId: string;
	username: string;
	displayName: string;
	profileImageUrl: string | null;
}

interface Community {
	id: string;
	name: string;
	description: string;
	createdAt: string;
	creatorId: string;
	creator: Creator;
	messages: any[];
	lastMessageTime: string;
	contractAddress: string;
	bountyAmount: number;
	timeLimit: number;
	baseFeePercentage: number;
	walletAddress: string | null;
	imageURL?: string;
}

interface User {
	id: string;
	username: string;
	walletAddress?: string | null;
}

export default function CommunityPage() {
	const { id } = useParams();
	const [community, setCommunity] = useState<Community | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
	const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
	const [secondsCounter, setSecondsCounter] = useState<number>(0);
	const [remainingTimeText, setRemainingTimeText] = useState<string>('');

	// Connect to WebSocket for real-time updates
	const { isConnected, lastMessageTime } = useWebSocket(id as string);

	// Memoize the isExpired function to prevent recalculations on every render
	const isExpired = useCallback(() => {
		if (!community?.timeLimit || !community?.lastMessageTime) return false;

		const lastMessageDate = new Date(community.lastMessageTime);
		const now = new Date();
		const elapsedMsSinceLastMessage = now.getTime() - lastMessageDate.getTime();
		const timeLimitMs = community.timeLimit * 60 * 1000;

		return elapsedMsSinceLastMessage >= timeLimitMs;
	}, [community?.timeLimit, community?.lastMessageTime]);

	// Update timer every second for real-time countdown - use isExpired function as dependency
	useEffect(() => {
		const timer = setInterval(() => {
			setSecondsCounter((prev) => prev + 1);
		}, 1000);

		return () => clearInterval(timer);
	}, []); // No dependencies to prevent re-creating interval

	// Calculate and update the remaining time text - separate from the interval
	useEffect(() => {
		// Update on secondsCounter change to reflect every second
		const updateRemainingTime = () => {
			if (!community?.timeLimit || !community?.lastMessageTime) {
				setRemainingTimeText(community?.timeLimit ? `${community.timeLimit}m (inactive)` : '-');
				return;
			}

			const lastMessageDate = new Date(community.lastMessageTime);
			const now = new Date();
			const elapsedMsSinceLastMessage = now.getTime() - lastMessageDate.getTime();

			// Convert time limit from minutes to milliseconds
			const timeLimitMs = community.timeLimit * 60 * 1000;

			// Calculate remaining time in milliseconds
			const remainingMs = Math.max(0, timeLimitMs - elapsedMsSinceLastMessage);

			if (remainingMs <= 0) {
				setRemainingTimeText('Expired');
				return;
			}

			// Convert to minutes and seconds
			const remainingMins = Math.floor(remainingMs / 60000);
			const remainingSecs = Math.floor((remainingMs % 60000) / 1000);

			// Format the time string
			if (remainingMins > 0) {
				setRemainingTimeText(`${remainingMins}m ${remainingSecs}s`);
			} else {
				setRemainingTimeText(`${remainingSecs}s`);
			}
		};

		updateRemainingTime();
	}, [secondsCounter, community?.timeLimit, community?.lastMessageTime]);

	// Update community data when a new message is received via WebSocket
	useEffect(() => {
		if (lastMessageTime && community) {
			setCommunity((prevCommunity) => {
				if (!prevCommunity) return null;
				return {
					...prevCommunity,
					lastMessageTime,
				};
			});
		}
	}, [lastMessageTime]);

	// Initial data fetch
	useEffect(() => {
		async function fetchData() {
			try {
				const [communityResponse, userResponse] = await Promise.all([
					api.get<Community>(`/communities/${id}/messages`),
					api.get<User>('/auth/user'),
				]);

				console.log('Community data loaded:', communityResponse.data);
				console.log('User data loaded:', userResponse.data);

				if (communityResponse.data.messages && communityResponse.data.messages.length > 0) {
					console.log('Message structure sample:', communityResponse.data.messages[0]);
				}

				setCommunity(communityResponse.data);
				console.log('Community data:', communityResponse.data);
				setUser(userResponse.data);
			} catch (error) {
				console.error('Error fetching data:', error);
				setError(error instanceof Error ? error.message : '데이터를 불러오는데 실패했습니다');
			} finally {
				setLoading(false);
			}
		}

		if (id) {
			fetchData();
		}
	}, [id]); // Only depend on id, not isConnected which changes often

	// Memoize the refresh function to avoid recreating it on each render
	const handleRefresh = useCallback(async () => {
		try {
			const { data } = await api.get<Community>(`/communities/${id}/messages`);
			setCommunity(data);
		} catch (error) {
			console.error('Error refreshing community:', error);
			toast.error('커뮤니티 정보를 새로고침하는데 실패했습니다');
		}
	}, [id]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950">
				<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF69B4] dark:border-[#FF1493]"></div>
			</div>
		);
	}

	if (error || !community) {
		return (
			<div className="container mx-auto px-4 py-8 bg-gradient-to-br from-white via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950">
				<div className="bg-red-100 dark:bg-red-900/30 border-4 border-dashed border-red-400 dark:border-red-600 p-6 rounded-xl text-red-800 dark:text-red-300 text-center font-bold text-xl">
					{error || 'Oops! This meme community was too dank to find! 🤔'}
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<Link
						href="/communities"
						className="inline-flex items-center gap-2 text-base font-bold text-[#FF69B4] dark:text-[#FF69B4] hover:text-[#FF1493] dark:hover:text-[#FF1493] bg-white dark:bg-gray-800 px-4 py-2 rounded-full border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] shadow-md transform hover:-translate-x-1 transition-all"
					>
						← back to all the dank memes
					</Link>
				</div>

				<div className="flex flex-col lg:flex-row gap-8">
					{/* Left sidebar */}
					<div className="w-full lg:w-64 bg-white dark:bg-gray-800 border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] p-5 shadow-xl rounded-xl transform rotate-0">
						<div className="mb-6">
							<div className="flex items-center mb-4">
								<div className="w-8 h-8 bg-[#FF69B4] rounded-full mr-3 transform rotate-0"></div>
								<h2 className="text-xl font-extrabold text-[#FF69B4] dark:text-[#FF69B4] uppercase">Meme Stakers</h2>
							</div>
							<hr className="border-[#FF69B4] dark:border-[#FF1493] border-2 border-dashed mb-4" />
							<DepositorsList communityId={id as string} />
						</div>
					</div>

					{/* Main content */}
					<div className="flex-1">
						<Toaster position="top-right" />

						<div className="bg-white dark:bg-gray-800 border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] p-6 mb-8 shadow-xl rounded-xl transform rotate-0">
							{community.imageURL && (
								<div className="mb-6 flex justify-center">
									<img 
										src={community.imageURL} 
										alt={community.name} 
										className="max-h-48 rounded-xl border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] transform hover:scale-105 transition-all duration-300" 
									/>
								</div>
							)}
						
							<div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
								<div>
									<h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#FF69B4] to-purple-500 dark:from-[#FF1493] dark:to-purple-400 uppercase transform rotate-0">{community.name}</h1>
									<p className="text-gray-700 dark:text-gray-300 font-medium text-lg">{community.description}</p>
									<p className="text-base text-[#FF69B4] dark:text-[#FF69B4] mt-2 font-bold">
										Created by the legendary @{community.creator.username} 🔥
									</p>
								</div>
								<div className="flex items-center gap-4">
									{!isExpired() && (
										<button
											onClick={() => setIsClaimDialogOpen(true)}
											className="bg-[#FF69B4] hover:bg-[#FF1493] text-white px-5 py-3 border-4 border-dashed border-white dark:border-gray-700 rounded-full text-base font-extrabold transition-all transform hover:scale-105 shadow-lg uppercase"
										>
											Claim Rewards 💰
										</button>
									)}

									{!isExpired() && (
										<button
											onClick={() => setIsDepositDialogOpen(true)}
											className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-3 border-4 border-dashed border-white dark:border-gray-700 rounded-full text-base font-extrabold transition-all transform hover:scale-105 shadow-lg uppercase"
										>
											Add Bounty 🚀
										</button>
									)}
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
								<div className="relative overflow-hidden rounded-xl border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] p-5 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 shadow-lg transform rotate-0 hover:rotate-0 transition-all">
									<div className="relative">
										<div className="text-lg font-extrabold mb-1 text-[#FF69B4] dark:text-[#FF69B4] uppercase">Total Stonks</div>
										<div className="text-3xl font-mono font-extrabold bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border-2 border-dashed border-[#FF69B4] dark:border-[#FF1493] text-center">
											{community.bountyAmount !== null && community.bountyAmount !== undefined
												? Number(community.bountyAmount).toFixed(2)
												: '0.00'}{' '}
											SOL
										</div>
										<div className="absolute -right-1 -top-1 text-2xl animate-bounce">💰</div>
									</div>
								</div>
								<div
									className={`relative overflow-hidden rounded-xl border-4 border-dashed p-5 shadow-lg transform rotate-0 hover:rotate-0 transition-all ${
										isExpired()
											? 'border-red-500 dark:border-red-600 bg-red-100 dark:bg-red-900/30'
											: !community.lastMessageTime
											? 'border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-800'
											: remainingTimeText.includes('m') && parseInt(remainingTimeText.split('m')[0]) <= 5
											? 'border-orange-400 dark:border-orange-500 bg-orange-100 dark:bg-orange-900/30'
											: 'border-green-400 dark:border-green-500 bg-green-100 dark:bg-green-900/30'
									}`}
								>
									<div className="relative">
										<div className="text-lg font-extrabold mb-1 uppercase">
											{isExpired() ? "Time's Up!" : "Meme Time Left"}
										</div>
										<div className={`text-3xl font-mono font-extrabold bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border-2 border-dashed ${
											isExpired()
												? 'border-red-500 dark:border-red-600 text-red-600 dark:text-red-400'
												: !community.lastMessageTime
												? 'border-gray-400 dark:border-gray-500 text-gray-600 dark:text-gray-400'
												: remainingTimeText.includes('m') && parseInt(remainingTimeText.split('m')[0]) <= 5
												? 'border-orange-400 dark:border-orange-500 text-orange-600 dark:text-orange-400'
												: 'border-green-400 dark:border-green-500 text-green-600 dark:text-green-400'
										} text-center`}>
											{remainingTimeText}
											{/* This hidden span forces re-render every second */}
											<span className="hidden">{secondsCounter}</span>
										</div>
										<div className="absolute -right-1 -top-1 text-2xl animate-pulse">⏰</div>
									</div>
								</div>
								<div className="relative overflow-hidden rounded-xl border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] p-5 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 shadow-lg transform rotate-0 hover:rotate-0 transition-all">
									<div className="relative">
										<div className="text-lg font-extrabold mb-1 text-[#FF69B4] dark:text-[#FF69B4] uppercase">Base Fee</div>
										<div className="text-3xl font-mono font-extrabold bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border-2 border-dashed border-[#FF69B4] dark:border-[#FF1493] text-center">
											{community.baseFeePercentage ? Number(community.baseFeePercentage).toFixed(2) : '0.00'} SOL
										</div>
										<div className="absolute -right-1 -top-1 text-2xl animate-bounce delay-300">💸</div>
									</div>
								</div>
							</div>

							<div className="text-base text-gray-600 dark:text-gray-300 bg-pink-50 dark:bg-pink-900/20 p-4 rounded-xl border-2 border-dashed border-[rgba(255,182,193,0.5)] font-medium">
								{community.contractAddress && (
									<div className="mb-1">
										<span className="font-bold text-[#FF69B4] dark:text-[#FF69B4]">Contract:</span> <span className="font-mono">{community.contractAddress}</span>
									</div>
								)}
								<div className="mb-1">
									<span className="font-bold text-[#FF69B4] dark:text-[#FF69B4]">Created:</span> {new Date(community.createdAt).toLocaleString()}
								</div>
								<div className="flex items-center">
									<span className="font-bold text-[#FF69B4] dark:text-[#FF69B4]">Latest meme:</span>
									<span className="font-medium ml-1">
										{community.lastMessageTime
											? new Date(community.lastMessageTime).toLocaleString()
											: 'No memes posted yet'}
									</span>
									{isConnected && (
										<span className="flex h-3 w-3 ml-2">
											<span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
											<span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
										</span>
									)}
								</div>
							</div>
						</div>

						<div className="bg-white dark:bg-gray-800 border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] p-6 shadow-xl rounded-xl transform rotate-0">
							<div className="flex items-center gap-4 mb-8">
								<div className="w-8 h-8 bg-[#FF69B4] rounded-full mr-1 transform rotate-0"></div>
								<h2 className="text-2xl font-extrabold text-[#FF69B4] dark:text-[#FF69B4] uppercase">Meme Feed</h2>
								<div className="w-8 h-8 bg-[#FF69B4] rounded-full ml-1 transform rotate-0"></div>
							</div>
							
							{parseInt(remainingTimeText) < 15 && !isExpired() && (
								<div className="mb-6 bg-red-100 dark:bg-red-900/30 border-4 border-dashed border-red-400 dark:border-red-600 p-4 rounded-xl text-center font-extrabold text-xl">
									<span className="text-red-600 dark:text-red-400 animate-pulse flex items-center justify-center">
										⚠️ HURRY UP! Post your meme before time runs out! ⚠️
									</span>
								</div>
							)}
							
							{isExpired() ? (
								<div className="bg-red-100 dark:bg-red-900/30 border-4 border-dashed border-red-400 dark:border-red-600 p-6 rounded-xl text-center mb-6">
									<div className="text-2xl font-extrabold text-red-600 dark:text-red-400 mb-2">This meme community has expired! 💀</div>
									<div className="text-lg font-bold">Too late for the memes... Better luck next time!</div>
								</div>
							) : (
								<>
									<div className="mb-8 flex flex-col md:flex-row items-center gap-6">
										<div className="w-40 h-40 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 rounded-xl border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] flex items-center justify-center relative transform hover:scale-105 transition-all">
											<div
												className={`text-4xl font-extrabold ${
													parseInt(remainingTimeText) < 15 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-[#FF69B4] dark:text-[#FF69B4]'
												}`}
											>
												{remainingTimeText}
											</div>
											<div className="absolute -top-3 -right-3 text-3xl animate-bounce">⏱️</div>
										</div>
										<div className="flex-1">
											<CreateMessageForm communityId={community.id} onMessageSent={handleRefresh} />
										</div>
									</div>
								</>
							)}
							
							<hr className="border-[#FF69B4] dark:border-[#FF1493] border-2 border-dashed mb-6" />
							
							<MessageList messages={community.messages} currentUserId={user?.id} />
						</div>

						<DepositBountyDialog
							isOpen={isDepositDialogOpen}
							onClose={() => setIsDepositDialogOpen(false)}
							communityId={community.id}
							contractAddress={community.contractAddress}
							onBountyDeposited={handleRefresh}
						/>

						<ClaimBasefeeDialog
							isOpen={isClaimDialogOpen}
							onClose={() => setIsClaimDialogOpen(false)}
							communityId={community.id}
							contractAddress={community.contractAddress}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
