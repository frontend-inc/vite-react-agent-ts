import React from 'react';
import { Message, MessagePart, ToolPart, FilePart } from '@/lib/hooks/use-chat';
import Markdown from '@/components/Markdown';
import { cn } from '@/lib/utils';

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const getToolDisplayText = (
  toolName: string,
  status: ToolPart['status']
): string => {
  const isStarted = status === 'tool-input-start' || status === 'tool-input-streaming';
  const isInputAvailable = status === 'tool-input-available';
  const isCompleted = status === 'tool-output-available';

  switch (toolName) {
    case 'exa_web_search':
      if (isStarted) return 'Preparing web search...';
      if (isInputAvailable) return 'Searching the web...';
      if (isCompleted) return 'Web search complete';
      break;

    case 'firecrawl_scrape':
      if (isStarted) return 'Preparing to scrape page...';
      if (isInputAvailable) return 'Scraping page...';
      if (isCompleted) return 'Page scraped';
      break;

    case 'create_images':
      if (isStarted) return 'Preparing to create images...';
      if (isInputAvailable) return 'Creating images...';
      if (isCompleted) return 'Images created';
      break;

    case 'edit_image':
      if (isStarted) return 'Preparing to edit image...';
      if (isInputAvailable) return 'Editing image...';
      if (isCompleted) return 'Image edited';
      break;

    case 'shopify_fetch_products':
      if (isStarted) return 'Preparing to fetch products...';
      if (isInputAvailable) return 'Fetching products...';
      if (isCompleted) return 'Products fetched';
      break;

    case 'shopify_fetch_collections':
      if (isStarted) return 'Preparing to fetch collections...';
      if (isInputAvailable) return 'Fetching collections...';
      if (isCompleted) return 'Collections fetched';
      break;

    case 'fetch_assets':
      if (isStarted) return 'Preparing to fetch assets...';
      if (isInputAvailable) return 'Fetching assets...';
      if (isCompleted) return 'Assets fetched';
      break;

    case 'fetch_documents':
      if (isStarted) return 'Preparing to fetch documents...';
      if (isInputAvailable) return 'Fetching documents...';
      if (isCompleted) return 'Documents fetched';
      break;

    case 'create_document':
      if (isStarted) return 'Preparing to create document...';
      if (isInputAvailable) return 'Creating document...';
      if (isCompleted) return 'Document created';
      break;

    case 'create_contact':
      if (isStarted) return 'Preparing to create contact...';
      if (isInputAvailable) return 'Creating contact...';
      if (isCompleted) return 'Contact created';
      break;

    default:
      // Fallback for unknown tools
      if (isStarted) return `Starting ${toolName}...`;
      if (isInputAvailable) return `Running ${toolName}...`;
      if (isCompleted) return `Completed ${toolName}`;
      break;
  }

  return toolName;
};

const ToolCallDisplay: React.FC<{ part: ToolPart }> = ({ part }) => {
  const isInProgress =
    part.status === 'tool-input-start' ||
    part.status === 'tool-input-streaming' ||
    part.status === 'tool-input-available';

  const displayText = getToolDisplayText(part.toolName, part.status);

  return (
    <div className="text-gray-500 text-sm py-1">
      <span className={cn(isInProgress && 'text-shine')}>{displayText}</span>
    </div>
  );
};

const MessagePartRenderer: React.FC<{ part: MessagePart }> = ({ part }) => {
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
      return <ToolCallDisplay part={part} />;

    default:
      return null;
  }
};

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
            <div
              key={message.id}
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
                            <MessagePartRenderer key={index} part={part} />
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
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default MessagesList;
