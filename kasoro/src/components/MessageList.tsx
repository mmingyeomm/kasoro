export type Message = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    username: string;
  };
};

type MessageListProps = {
  messages: Message[];
  currentUserId?: string;
};

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No messages yet. Be the first to send a message!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isCurrentUser = currentUserId === message.userId;
        
        return (
          <div 
            key={message.id}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[75%] rounded-lg px-4 py-2 ${isCurrentUser 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700'}`}
            >
              {!isCurrentUser && (
                <div className="font-medium text-xs text-gray-500 dark:text-gray-400 mb-1">
                  @{message.user.username}
                </div>
              )}
              <div>{message.content}</div>
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
