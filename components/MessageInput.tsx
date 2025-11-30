import React from 'react';
import ErrorAlert from '@/components/ErrorAlert';
import ChatInput from '@/components/ChatInput';
import ImagePreviewContainer from '@/components/ImagePreviewContainer';
import { Message } from '@/lib/hooks/use-chat';

interface MessageInputProps {
  messages: Message[];
  userMessage: string;
  onMessageChange: (message: string) => void;
  onFileSelect: (file: File) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isSubmitting?: boolean;
  error: string | null;
  isDragActive: boolean;
  uploadedImageUrl: string | null;
  onImageRemove: () => void;
  onClearHistory: () => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  messages,
  userMessage,
  onMessageChange,
  onFileSelect,
  onSubmit,
  isLoading,
  isSubmitting = false,
  error,
  isDragActive,
  uploadedImageUrl,
  onImageRemove,
  onClearHistory,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  return (
    <div
      className="fixed bottom-0 left-0 w-screen bg-transparent z-40"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="max-w-4xl mx-auto w-full px-6 py-6">
        {/* Error Display */}
        <ErrorAlert error={error} />

        {/* Image Preview - Always appears above input when attached */}
        {uploadedImageUrl && (
          <div className="mb-6">
            <ImagePreviewContainer
              uploadedImageUrl={uploadedImageUrl}
              onRemove={onImageRemove}
            />
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <ChatInput
            messages={messages}
            userMessage={userMessage}
            onMessageChange={onMessageChange}
            onFileSelect={onFileSelect}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            isDragActive={isDragActive}
            uploadedImageUrl={uploadedImageUrl}
            onClearHistory={onClearHistory}
            placeholder="Ask me anything..."
          />
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
