'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CommunityCard from '@/components/communities/CommunityCard';
import SearchCommunities from '@/components/communities/SearchCommunities';
import CreateCommunityDialog from '@/components/communities/CreateCommunityDialog';
import LinkWalletButton from '@/components/wallet/LinkWalletButton';
import { toast, Toaster } from 'react-hot-toast';
import { api } from '@/api';

type User = {
	id: string;
	username: string;
	walletAddress?: string | null;
};

interface Community {
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

export default function CommunitysPage() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const router = useRouter();

	// 커뮤니티 상태 관리
	const [communitys, setCommunitys] = useState<Community[]>([]);
	const [filteredCommunitys, setFilteredCommunitys] = useState<Community[]>([]);
	const [communityLoading, setCommunityLoading] = useState(true);
	const [communityError, setCommunityError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchUser() {
			try {
				const { data } = await api.get<User>('/auth/user');
				setUser(data);
			} catch (error) {
				console.error('Error fetching user:', error);
			} finally {
				setLoading(false);
			}
		}

		fetchUser();
	}, []);

	// 커뮤니티 데이터 불러오기
	useEffect(() => {
		async function fetchCommunities() {
			try {
				const { data } = await api.get<Community[]>('/communities');
				console.log('communitys data', data);
				setCommunitys(data);
				setFilteredCommunitys(data);
			} catch (error) {
				console.error('Error fetching communities:', error);
				setCommunityError(error instanceof Error ? error.message : 'Failed to load communities');
			} finally {
				setCommunityLoading(false);
			}
		}

		fetchCommunities();
	}, []);

	const handleWalletLinked = (walletAddress: string) => {
		if (user) {
			setUser({
				...user,
				walletAddress,
			});
		}
	};

	// 검색 기능 처리
	const handleSearch = (searchTerm: string) => {
		if (!searchTerm.trim()) {
			setFilteredCommunitys(communitys);
			return;
		}

		const searchLower = searchTerm.toLowerCase();
		const filtered = communitys.filter((community) => {
			const name = community.name.toLowerCase();

			// 연속된 문자열로 먼저 검색
			if (name.includes(searchLower)) {
				return true;
			}

			// 연속되지 않은 문자열 검색
			let currentIndex = 0;
			for (const char of searchLower) {
				const index = name.indexOf(char, currentIndex);
				if (index === -1) {
					return false;
				}
				currentIndex = index + 1;
			}
			return true;
		});

		setFilteredCommunitys(filtered);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950">
			<div className="container mx-auto px-4 py-8">
				<Toaster position="top-right" />
				<div className="flex justify-between items-center mb-8">
					<div className="flex items-center gap-4">
						<h1 className="text-4xl font-extrabold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FF69B4] to-purple-500 dark:from-[#FF1493] dark:to-purple-400">
							MEME COMMUNITIES
						</h1>
						{user && (
							<button
								onClick={() => setIsCreateDialogOpen(true)}
								className="flex items-center gap-2 bg-[#FF69B4] hover:bg-[#FF1493] text-white px-5 py-3 border-4 border-dashed border-white dark:border-gray-700 rounded-full text-sm font-extrabold transition-all transform hover:scale-105 shadow-lg"
							>
								<span className="text-xl">+</span>
								<span>CREATE DANK MEME COMMUNITY</span>
							</button>
						)}
					</div>
				</div>

				<div className="flex-1">
					{/* 커뮤니티 목록 직접 표시 */}
					<div className="bg-white dark:bg-gray-800 border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] p-8 rounded-xl shadow-xl">
						<div className="mb-6 flex items-center">
							<span className="w-8 h-8 bg-[#FF69B4] rounded-full mr-3"></span>
							<h2 className="text-3xl font-extrabold tracking-widest uppercase mb-0 text-[#FF69B4] dark:text-[#FF69B4]">
								Trending Meme Communities
							</h2>
							<span className="w-8 h-8 bg-[#FF69B4] rounded-full ml-3"></span>
						</div>
						<hr className="border-[#FF69B4] dark:border-[#FF1493] border-2 border-dashed mb-6" />

						<SearchCommunities onSearch={handleSearch} />

						{communityLoading ? (
							<div className="flex justify-center items-center h-40">
								<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#FF69B4] dark:border-[#FF1493]"></div>
							</div>
						) : communityError ? (
							<div className="bg-red-100 dark:bg-red-900/30 border-4 border-dashed border-red-400 dark:border-red-600 p-6 text-red-800 dark:text-red-300 rounded-xl text-center font-bold">
								{communityError}
							</div>
						) : filteredCommunitys.length === 0 ? (
							<div className="text-center py-12">
								<p className="text-xl text-gray-600 dark:text-gray-300 font-bold mb-4">
									No meme communities found yet!
								</p>
								<p className="text-lg text-[#FF69B4] dark:text-[#FF69B4] font-extrabold">
									Be the first to create a dank meme community!
								</p>
								<div className="mt-4 text-5xl">🤔 → 💯 → 🚀</div>
							</div>
						) : (
							<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8 mt-8">
								{filteredCommunitys.map((community) => (
									<CommunityCard
										key={community.id}
										id={community.id}
										name={community.name}
										description={community.description}
										createdAt={community.createdAt}
										creatorId={community.creatorId}
										bountyAmount={community.bountyAmount}
										timeLimit={community.timeLimit}
										baseFeePercentage={community.baseFeePercentage}
										lastMessageTime={community.lastMessageTime}
										imageURL={community.imageURL}
									/>
								))}
							</div>
						)}
					</div>
				</div>

				<CreateCommunityDialog
					isOpen={isCreateDialogOpen}
					onClose={() => setIsCreateDialogOpen(false)}
					userWalletAddress={user?.walletAddress}
				/>
			</div>
		</div>
	);
}
