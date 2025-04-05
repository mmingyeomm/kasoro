'use client';

import Link from 'next/link';
import { Clock, Percent, Coins, NotebookTabs } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface CommunityCardProps {
	id: string;
	name: string;
	description: string;
	createdAt: string;
	creatorId: string;
	bountyAmount?: number;
	timeLimit?: number;
	baseFeePercentage?: number;
	lastMessageTime?: string | null;
	imageURL?: string | null;
}

export default function CommunityCard({
	id,
	name,
	description,
	createdAt,
	creatorId,
	bountyAmount,
	timeLimit,
	baseFeePercentage,
	lastMessageTime: initialLastMessageTime,
	imageURL,
}: CommunityCardProps) {
	// Use the WebSocket hook to get real-time updates
	const { lastMessageTime: wsLastMessageTime } = useWebSocket(id);
	const [displayedLastMessageTime, setDisplayedLastMessageTime] = useState<string | null>(
		initialLastMessageTime || null
	);
	const [secondsCounter, setSecondsCounter] = useState<number>(0);
	const [remainingTimeText, setRemainingTimeText] = useState<string>('');

	// Update displayed time when WebSocket updates come in
	useEffect(() => {
		if (wsLastMessageTime) {
			setDisplayedLastMessageTime(wsLastMessageTime);
		}
	}, [wsLastMessageTime]);

	// Update timer every second for real-time countdown
	useEffect(() => {
		const timer = setInterval(() => {
			setSecondsCounter((prev) => prev + 1);
			updateRemainingTime();
		}, 1000);

		return () => clearInterval(timer);
	}, [displayedLastMessageTime, timeLimit]);

	// Calculate and update the remaining time text
	const updateRemainingTime = () => {
		if (!timeLimit || !displayedLastMessageTime) {
			setRemainingTimeText(timeLimit ? `${timeLimit}m (inactive)` : '-');
			return;
		}

		const lastMessageDate = new Date(displayedLastMessageTime);
		const now = new Date();
		const elapsedMsSinceLastMessage = now.getTime() - lastMessageDate.getTime();

		// Convert time limit from minutes to milliseconds
		const timeLimitMs = timeLimit * 60 * 1000;

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

	// Initialize remaining time on mount
	useEffect(() => {
		updateRemainingTime();
	}, [displayedLastMessageTime, timeLimit]);

	const formatTimestamp = (timestamp: string | null) => {
		if (!timestamp) return 'No messages yet';

		const messageDate = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - messageDate.getTime();
		const diffMins = Math.floor(diffMs / 60000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;

		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;

		return messageDate.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	return (
		<Link href={`/communities/${id}`}>
			<div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl group transition-all duration-300 h-full flex flex-col border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] transform hover:scale-[1.01]">
				<div className="flex flex-row h-full">
					{/* Image Section - Larger and on the left */}
					{imageURL ? (
						<div className="w-1/3 min-w-[180px] bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900">
							<img 
								src={imageURL} 
								alt={name} 
								className="w-full h-full object-cover border-r-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] transform hover:scale-105 transition-transform duration-300" 
							/>
						</div>
					) : (
						<div className="w-1/3 min-w-[180px] bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 flex items-center justify-center">
							<div className="w-24 h-24 rounded-full bg-[#FF69B4] flex items-center justify-center transform hover:scale-105 transition-transform duration-300 border-4 border-white dark:border-gray-700 shadow-lg">
								<span className="text-3xl font-extrabold text-white">{name.charAt(0).toUpperCase()}</span>
							</div>
						</div>
					)}

					{/* Content Section */}
					<div className="flex flex-col flex-grow">
						<div className="bg-gradient-to-r from-[#FF69B4] to-[#FFB6C1] dark:from-[#FF1493] dark:to-[#FF69B4] p-5 transition-all duration-300 border-b-4 border-dashed border-[#FF69B4] dark:border-[#FF1493]">
							<h3 className="font-extrabold text-xl line-clamp-1 text-white drop-shadow-md tracking-wide uppercase">{name}</h3>
						</div>

						<div className="p-5 flex-grow flex flex-col bg-gradient-to-br from-white to-pink-50 dark:from-gray-800 dark:to-gray-900">
							<div className="flex items-start mb-4">
								<NotebookTabs size={16} className="text-[#FF69B4] dark:text-[#FF69B4] mt-0.5 mr-2 flex-shrink-0" />
								<p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 font-medium">{description || 'No description, just vibes'}</p>
							</div>

							<div className="grid grid-cols-3 gap-3 mb-auto">
								<div className="flex flex-col">
									<span className="text-sm text-gray-600 dark:text-gray-300 flex items-center font-bold">
										<Coins size={16} className="mr-1.5 text-yellow-500" /> bounty:
									</span>
									<span
										className={`${
											bountyAmount !== undefined
												? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
												: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
										} px-3 py-1.5 text-sm font-bold rounded-full mt-1 text-center border-2 border-yellow-400 dark:border-yellow-600`}
									>
										{bountyAmount !== undefined ? `${bountyAmount} SOL` : 'no stonks'}
									</span>
								</div>

								<div className="flex flex-col">
									<span className="text-sm text-gray-600 dark:text-gray-300 flex items-center font-bold">
										<Clock size={16} className="mr-1.5 text-green-500" /> time left:
									</span>
									{timeLimit !== undefined && (
										<span
											className={`px-3 py-1.5 text-sm font-bold rounded-full mt-1 text-center border-2 ${
												displayedLastMessageTime
													? remainingTimeText === 'Expired'
														? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200 border-red-400 dark:border-red-600'
														: remainingTimeText.includes('m') && parseInt(remainingTimeText.split('m')[0]) <= 5
														? 'bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200 border-orange-400 dark:border-orange-600'
														: 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 border-green-400 dark:border-green-600'
													: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border-gray-400 dark:border-gray-600'
											}`}
										>
											{remainingTimeText || 'much time'}
										</span>
									)}
								</div>

								<div className="flex flex-col">
									<span className="text-sm text-gray-600 dark:text-gray-300 flex items-center font-bold">
										<Percent size={16} className="mr-1.5 text-blue-500" /> base fee:
									</span>
									<span
										className={`${
											baseFeePercentage !== undefined
												? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
												: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
										} px-3 py-1.5 text-sm font-bold rounded-full mt-1 text-center border-2 border-blue-400 dark:border-blue-600`}
									>
										{baseFeePercentage !== undefined && baseFeePercentage !== null ? `${baseFeePercentage} SOL` : 'free memes'}
									</span>
								</div>
							</div>

							<div className="pt-4 mt-4 border-t-2 border-dashed border-[#FF69B4] dark:border-[#FF1493]">
								<div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 font-medium">
									<span className="bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded-md">created:</span>
									<span className="bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded-md">
										{new Date(createdAt).toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'short',
											day: 'numeric',
										})}
									</span>
								</div>

								<div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mt-2 font-medium">
									<span className="bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded-md">last meme:</span>
									<span className="bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded-md">{formatTimestamp(displayedLastMessageTime)}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}
