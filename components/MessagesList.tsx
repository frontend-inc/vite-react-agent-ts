import React from 'react';
import { Message } from '@/lib/hooks/use-chat';
import MessageItem from './MessageItem';

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  isLoading,
  messagesEndRef,
}) => {
  return (
    <div className="flex-1 h-0 overflow-y-auto bg-gradient-to-br from-gray-50 to-white pt-6 pb-32">
      <div className="max-w-4xl mx-auto w-full px-6">
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isLoading={isLoading}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default MessagesList;
