import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat, Message } from '@/lib/hooks/use-chat';
import { useChatContext } from '@/contexts/chat-context';
import MessageHero from '@/components/MessageHero';
import MessagesList from '@/components/MessagesList';
import MessageInput from '@/components/MessageInput';

const CHAT_ENDPOINT = '/api/v1/chat';
const CHATS_ENDPOINT = '/api/v1/chats';
const STORAGE_ENDPOINT = '/api/v1/storage';

interface Chat {
  id: string;
}

interface CreateChatResponse {
  chat: Chat;
}

interface AgentProps {
  chatId?: string;
}

const Agent: React.FC<AgentProps> = ({ chatId }) => {
  const navigate = useNavigate();
  const { currentChat, setCurrentChat, pendingPrompt, setPendingPrompt } = useChatContext();
  const [chat, setChat] = useState<Chat | null>(chatId ? { id: chatId } : null);
  const [userMessage, setUserMessage] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingPromptSubmittedRef = useRef(false);

  const {
    messages,
    setMessages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  } = useChat({
    api: CHAT_ENDPOINT,
    headers: { 'X-Chat-Id': chat?.id || '' },
    onFinish: ({ message }) => {
      console.log('[Agent] Message complete:', message.id);
    },
    onError: (err) => {
      console.error('[Agent] Chat error:', err);
    },
  });

  // Fetch chat messages when chatId is provided (on page load)
  useEffect(() => {
    if (chatId) {
      setChat({ id: chatId });
      setCurrentChat({ id: chatId });
      fetchChatMessages(chatId);
    }
  }, [chatId]);

  // Handle pending prompt after chat is ready
  useEffect(() => {
    if (chatId && pendingPrompt && chat?.id === chatId && !pendingPromptSubmittedRef.current) {
      pendingPromptSubmittedRef.current = true;
      console.log('[Agent] Submitting pending prompt:', pendingPrompt);
      sendMessage(pendingPrompt);
      setPendingPrompt(null);
    }
  }, [chatId, pendingPrompt, chat?.id]);

  const fetchChatMessages = async (id: string) => {
    try {
      const response = await fetch(`${CHATS_ENDPOINT}/${id}/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat messages');
      }
      const data = await response.json();
      // Transform API messages to our Message format
      const transformedMessages: Message[] = (data.messages || []).map((msg: any) => {
        // Transform parts to our format with status
        const transformedParts = (msg.parts || []).map((p: any) => ({
          ...p,
          status: 'complete' as const,
        }));

        return {
          id: msg.id || `msg-${Date.now()}-${msg.role}`,
          role: msg.role,
          parts: transformedParts.length > 0 ? transformedParts : [{ type: 'text', text: '', status: 'complete' }],
          timestamp: msg.created_at || msg.timestamp || new Date().toISOString(),
        };
      });
      setMessages(transformedMessages);
    } catch (err) {
      console.error('[Agent] Failed to fetch chat messages:', err);
    }
  };

  const createChat = async (): Promise<CreateChatResponse> => {
    const response = await fetch(CHATS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error('Failed to create chat');
    }
    const data = await response.json();
    return data;
  };

  // Auto-scroll to bottom when new messages arrive or while loading
  useEffect(() => {
    if (isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadError(null);

    if (!file.type.match('image.*')) {
      setUploadError('Please upload an image file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(STORAGE_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Upload failed');
      }

      const data = await response.json();
      setUploadedImageUrl(data.url);
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Error uploading image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedImageUrl && !userMessage.trim()) {
      setUploadError('Please enter a message or upload an image');
      return;
    }

    // Clear input immediately
    const messageToSend = userMessage || 'Please analyze this image';
    const imageToSend = uploadedImageUrl;
    setUserMessage('');
    setUploadedImageUrl(null);
    setUploadError(null);

    // If no chat exists, create one first and navigate
    if (!chat) {
      try {
        setIsCreatingChat(true);

        // Build message parts
        const parts: Array<{ type: string; text?: string; url?: string }> = [];
        if (imageToSend) {
          // Add image as markdown in a text part
          parts.push({ type: 'text', text: `![Image](${imageToSend})` });
          parts.push({
            type: 'file',
            url: imageToSend,
          });
        }
        parts.push({ type: 'text', text: messageToSend });

        // Create chat without message
        const response = await createChat();
        console.log('[Agent] Created chat:', response);

        // Set pending prompt to be submitted after navigation
        setPendingPrompt({ role: 'user', parts });
        setCurrentChat(response.chat);

        // Navigate to the chat page
        navigate(`/chats/${response.chat.id}`);
      } catch (err: any) {
        console.error('[Agent] Failed to create chat:', err);
        setUploadError(err.message || 'Failed to create chat');
      } finally {
        setIsCreatingChat(false);
      }
      return;
    }

    // Build message parts
    const parts: Array<{ type: string; text?: string; url?: string }> = [];
    if (imageToSend) {
      // Add image as markdown in a text part
      parts.push({ type: 'text', text: `![Image](${imageToSend})` });
      parts.push({ type: 'file', url: imageToSend });
    }
    parts.push({ type: 'text', text: messageToSend });

    await sendMessage({
      role: 'user',
      parts,
    });
  };

  const handleClearHistory = () => {
    clearMessages();
    setUserMessage('');
    setUploadedImageUrl(null);
    setUploadError(null);
    localStorage.removeItem('chatMessages');
    console.log('[LocalStorage] Messages cleared from localStorage');
  };

  // Combine errors from hook and upload
  const displayError = error || uploadError;

  return (
    <div className="w-full flex-1 bg-white flex flex-col relative overflow-hidden">
      {/* Messages Area - Full screen scrollable */}
      {messages.length === 0 && !isLoading ? (
        <MessageHero
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onSuggestionClick={setUserMessage}
        />
      ) : (
        <MessagesList
          messages={messages}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />
      )}

      {/* Input Section - Fixed to bottom */}
      <MessageInput
        messages={messages}
        userMessage={userMessage}
        onMessageChange={setUserMessage}
        onFileSelect={handleImageUpload}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        isSubmitting={isCreatingChat}
        error={displayError}
        isDragActive={isDragActive}
        uploadedImageUrl={uploadedImageUrl}
        onImageRemove={() => setUploadedImageUrl(null)}
        onClearHistory={handleClearHistory}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      />
    </div>
  );
};

export default Agent;
