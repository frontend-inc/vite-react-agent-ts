import React from 'react';
import { MessagePart as MessagePartType } from '@/lib/hooks/use-chat';
import Markdown from '@/components/Markdown';
import MessageToolCall from './MessageToolCall';
import { cn } from '@/lib/utils';

interface MessagePartsProps {
  part: MessagePartType;
}

const MessageParts: React.FC<MessagePartsProps> = ({ part }) => {
  switch (part.type) {
    case 'text':
      return (
        <Markdown
          content={part.text}
          className="text-sm leading-relaxed break-words"
        />
      );

    case 'reasoning':
      return (
        <div className="py-1">
          <div className="text-gray-500 text-sm mb-1">
            <span className={cn(part.status === 'streaming' && 'text-shine')}>
              Reasoning
            </span>
          </div>
          <div className="text-gray-500 text-sm italic border-l-2 border-gray-200 pl-3">
            {part.text}
          </div>
        </div>
      );

    case 'tool':
      return <MessageToolCall part={part} />;

    default:
      return null;
  }
};

export default MessageParts;
