import React from 'react';
import { ToolPart } from '@/lib/hooks/use-chat';
import { cn } from '@/lib/utils';
import MessageToolCreateImages from './MessageToolCreateImages';
import MessageToolEditImage from './MessageToolEditImage';

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

interface MessageToolCallProps {
  part: ToolPart;
}

const MessageToolCall: React.FC<MessageToolCallProps> = ({ part }) => {
  const isInProgress =
    part.status === 'tool-input-start' ||
    part.status === 'tool-input-streaming' ||
    part.status === 'tool-input-available';

  const isCompleted = part.status === 'tool-output-available';
  const displayText = getToolDisplayText(part.toolName, part.status);

  // Handle create_images tool with completed output
  if (part.toolName === 'create_images' && isCompleted) {
    return (
      <div className="py-1">
        <div className="text-gray-500 text-sm mb-2">{displayText}</div>
        <MessageToolCreateImages part={part} />
      </div>
    );
  }

  // Handle edit_image tool with completed output
  if (part.toolName === 'edit_image' && isCompleted) {
    return (
      <div className="py-1">
        <div className="text-gray-500 text-sm mb-2">{displayText}</div>
        <MessageToolEditImage part={part} />
      </div>
    );
  }

  return (
    <div className="text-gray-500 text-sm py-1">
      <span className={cn(isInProgress && 'text-shine')}>{displayText}</span>
    </div>
  );
};

export default MessageToolCall;
