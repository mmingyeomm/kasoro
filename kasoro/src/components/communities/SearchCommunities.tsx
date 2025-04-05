'use client';

import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';

interface SearchCommunitiesProps {
	onSearch: (term: string) => void;
}

export default function SearchCommunities({ onSearch }: SearchCommunitiesProps) {
	const [searchTerm, setSearchTerm] = useState('');

	const handleSearch = () => {
		onSearch(searchTerm);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	return (
		<div className="w-full mb-8">
			<div className="relative">
				<input
					type="text"
					placeholder="Find dank meme communities..."
					value={searchTerm}
					onChange={(e) => {
						setSearchTerm(e.target.value);
						onSearch(e.target.value); // 실시간 검색을 위해 즉시 검색어 전달
					}}
					onKeyPress={handleKeyPress}
					className="w-full px-4 py-4 pl-14 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 
					border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] 
					focus:border-[#FF1493] focus:outline-none focus:ring-2 focus:ring-[#FF69B4] dark:focus:ring-[#FF1493] 
					shadow-inner text-gray-700 dark:text-gray-200 font-medium placeholder-gray-500 dark:placeholder-gray-400 
					transform hover:scale-[1.01] transition-all text-lg"
				/>
				<div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FF69B4] dark:text-[#FF1493]">
					<Search size={22} className="animate-pulse" />
				</div>
				<button
					onClick={handleSearch}
					className="absolute right-3 top-1/2 -translate-y-1/2 
					bg-gradient-to-r from-[#FF69B4] to-[#FF1493] dark:from-[#FF1493] dark:to-[#FF69B4] 
					text-white px-6 py-2 text-base font-bold rounded-full shadow-md 
					hover:shadow-lg transition-all hover:opacity-90 transform hover:scale-105 
					border-2 border-white dark:border-gray-700 flex items-center"
				>
					<Sparkles size={16} className="mr-1" />
					Find
				</button>
			</div>
		</div>
	);
}
