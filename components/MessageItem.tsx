import React from 'react';
import { Message, FilePart } from '@/lib/hooks/use-chat';
import MessageParts from './MessageParts';
import { cn } from '@/lib/utils';

interface MessageItemProps {
  message: Message;
  isLoading: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isLoading }) => {
  return (
    <div
      className={cn(
        'flex',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-md lg:max-w-lg px-6 py-3',
          message.role === 'user'
            ? 'bg-black text-white rounded-lg rounded-tr-sm'
            : 'bg-white text-gray-900 rounded-lg rounded-tl-sm border border-gray-300 shadow-sm'
        )}
      >
        {/* Message content */}
        {message.role === 'assistant' ? (
          <>
            {/* Show loading dots ONLY when parts are empty AND isLoading is true */}
            {(!message.parts || message.parts.length === 0) && isLoading ? (
              <div className="flex items-center gap-2 py-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></span>
              </div>
            ) : (
              <>
                {/* Render message parts */}
                <div className="space-y-2">
                  {message.parts.map((part, index) => (
                    <MessageParts key={index} part={part} />
                  ))}
                </div>
                {/* Timestamp */}
                <p className="text-xs mt-2 text-gray-600">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </>
            )}
          </>
        ) : (
          <>
            {/* User message - render parts */}
            {message.parts.map((part, index) => {
              if (part.type === 'text') {
                return (
                  <p key={index} className="text-sm leading-relaxed whitespace-pre-wrap break-words text-white">
                    {part.text}
                  </p>
                );
              }
              if (part.type === 'file') {
                return (
                  <div key={index} className="mb-2">
                    <img
                      src={(part as FilePart).url}
                      alt="Uploaded"
                      className="rounded-lg w-full max-w-xs object-cover max-h-48 border border-white/30"
                    />
                  </div>
                );
              }
              return null;
            })}
            {/* Timestamp */}
            <p className="text-xs mt-2 text-white/70">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
