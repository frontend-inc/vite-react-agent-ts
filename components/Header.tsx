import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showBack }) => {
  const location = useLocation();
  const isOnChatPage = location.pathname.startsWith('/chats/');

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-white border-b border-gray-200 py-3 px-6 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(showBack || isOnChatPage) && (
            <Link to="/" className="p-1 hover:bg-gray-100 rounded-md transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Link>
          )}
          <Link to="/">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">OpenAI Chatbot</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
