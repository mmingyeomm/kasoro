export type Message = {
	id: string;
	content: string;
	createdAt: string;
	senderId?: string;
	userId?: string; // For backwards compatibility
	imageURL?: string; // Add support for image URL
	sender?: {
		id: string;
		username: string;
	};
	user?: {
		id: string;
		username: string;
	};
};

type MessageListProps = {
	messages: Message[];
	currentUserId?: string;
};

export default function MessageList({ messages, currentUserId }: MessageListProps) {
	if (!messages || messages.length === 0) {
		return (
			<div className="text-center py-8 text-gray-500 dark:text-gray-400">
				No messages yet. Be the first to send a message!
			</div>
		);
	}

	console.log('Messages:', messages);
	console.log('Current user ID:', currentUserId);
	
	// Check if any messages have images
	const messagesWithImages = messages.filter(msg => msg.imageURL);
	console.log('Messages with images:', messagesWithImages.length, messagesWithImages);

	return (
		<div className="space-y-4">
			{[...messages]
				.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				.map((message) => {
					// Get user info regardless of field structure
					const messageUser = message.sender || message.user;
					const messageUserId = message.senderId || message.userId;
					const username = messageUser?.username || 'unknown';

					const isCurrentUser = currentUserId === messageUserId;

					return (
						<div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
							<div
								className={`max-w-[75%] rounded-lg px-4 py-2 ${
									isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'
								}`}
							>
								{!isCurrentUser && (
									<div className="font-medium text-xs text-gray-500 dark:text-gray-400 mb-1">@{username}</div>
								)}
								<div>{message.content}</div>
								
								{/* Display image if message has imageURL */}
								{message.imageURL && (
									<div className="mt-2">
										<a href={message.imageURL} target="_blank" rel="noopener noreferrer">
											<img 
												src={message.imageURL} 
												alt="Message attachment" 
												className="max-w-full rounded-md max-h-60 object-contain hover:opacity-90 transition-opacity"
												loading="lazy"
											/>
										</a>
									</div>
								)}
								
								<div className="text-xs text-right mt-1 opacity-70">
									{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
								</div>
							</div>
						</div>
					);
				})}
		</div>
	);
}
