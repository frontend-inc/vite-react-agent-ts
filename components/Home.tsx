import React from 'react';
import Header from '@/components/Header';
import Agent from '@/components/Agent';
import { Message } from '@/lib/hooks/use-chat';

// Re-export Message type for backwards compatibility
export type { Message };

const Home: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <Header />
      <main className="flex-1 pt-14 overflow-hidden flex flex-col">
        <Agent />
      </main>
    </div>
  );
};

export default Home;
