import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '@/components/Home';
import ChatPage from '@/components/ChatPage';
import Header from '@/components/Header';
import { ChatProvider } from '@/contexts/chat-context';

const App: React.FC = () => {
  return (
    <ChatProvider>
      <BrowserRouter>
        <div className="w-screen h-screen flex flex-col">
          <Header />
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chats/:chatId" element={<ChatPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ChatProvider>
  );
};

export default App;
