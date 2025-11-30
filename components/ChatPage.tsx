import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Agent from '@/components/Agent';

const ChatPage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();

  return (
    <div className="w-full h-full flex flex-col">
      <Header />
      <main className="flex-1 pt-14 overflow-hidden flex flex-col">
        <Agent chatId={chatId} />
      </main>
    </div>
  );
};

export default ChatPage;
