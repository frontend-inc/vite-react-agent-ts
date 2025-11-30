import React from 'react';

interface MessageHeroProps {
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onSuggestionClick: (suggestion: string) => void;
}

const MessageHero: React.FC<MessageHeroProps> = ({
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onSuggestionClick,
}) => {
  const promptSuggestions = [
    'Help me write a business plan',
    'Explain quantum computing simply',
    'Debug my Python code',
    'Create a weekly meal plan',
  ];

  return (
    <div
      className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white pt-[80px] pb-[260px] flex items-center justify-center"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="max-w-4xl mx-auto w-full">
        <div className="px-6 py-4">
          <div className="py-4 flex flex-col items-center justify-center text-center min-h-[60vh]">
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                How can I help you today?
              </h1>
              <p className="text-gray-500 text-lg mb-8">
                Your AI assistant for any task
              </p>
            </div>
            {/* Prompt Suggestions */}
            <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
              {promptSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageHero;
