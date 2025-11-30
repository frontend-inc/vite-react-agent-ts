import React, { useRef } from 'react';
import { Message } from '@/lib/hooks/use-chat';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  messages: Message[];
  userMessage: string;
  onMessageChange: (message: string) => void;
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  isSubmitting?: boolean;
  isDragActive: boolean;
  uploadedImageUrl: string | null;
  onClearHistory: () => void;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  messages,
  userMessage,
  onMessageChange,
  onFileSelect,
  isLoading,
  isSubmitting = false,
  isDragActive,
  uploadedImageUrl,
  onClearHistory,
  placeholder = 'Ask me anything...',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter key (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <>
      <div
        className={cn(
          'flex bg-white items-center border rounded-full p-2 pl-4 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition-all',
          isDragActive
            ? 'border-gray-900 bg-gray-50 ring-2 ring-gray-900'
            : 'border-gray-200'
        )}
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(            
            'flex items-center justify-center flex-shrink-0 mr-2 transition-colors',
            isDragActive ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
          )}
          title="Upload image or drag and drop"
        >
          <i className="ri-image-add-line text-xl"></i>
        </button>

        <textarea
          value={userMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent focus:outline-none resize-none"
          rows={1}
        />

        <button
          type="submit"
          disabled={isLoading || isSubmitting || (!uploadedImageUrl && !userMessage.trim())}
          className="w-10 h-10 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 ml-2"
        >
          {isLoading || isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <i className="ri-arrow-up-line text-xl"></i>
          )}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
        accept="image/*"
      />

      <p className="text-xs text-gray-500 text-center">
        Drag and drop an image or click the image button to upload
        {messages.length > 0 && (
          <>
            {' - '}
            <button
              onClick={onClearHistory}
              className="text-gray-400 hover:text-gray-600 transition-colors underline"
            >
              clear messages
            </button>
          </>
        )}
      </p>
    </>
  );
};

export default ChatInput;
