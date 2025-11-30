import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Chat {
  id: string;
}

interface PendingPrompt {
  role: 'user' | 'assistant';
  parts: Array<{ type: string; text?: string; url?: string }>;
}

interface ChatContextType {
  currentChat: Chat | null;
  setCurrentChat: (chat: Chat | null) => void;
  pendingPrompt: PendingPrompt | null;
  setPendingPrompt: (prompt: PendingPrompt | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<PendingPrompt | null>(null);

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        setCurrentChat,
        pendingPrompt,
        setPendingPrompt,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
