import React from 'react';

interface HeaderProps {
  welcomeUser?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ welcomeUser, onLogout }) => {
  return (
    <header className="text-center relative">
      <div>
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-yellow-400">
          Seek Beyond Realty
        </h1>
        <p className="mt-2 text-lg text-blue-200">
          {welcomeUser ? `Welcome, ${welcomeUser}!` : 'AI-Powered Video Generator'}
        </p>
      </div>
      {onLogout && (
         <button
          onClick={onLogout}
          className="absolute top-0 right-0 flex items-center p-2 rounded-lg text-gray-400 hover:bg-red-800 hover:text-white transition-colors duration-200"
          title="Logout"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        </button>
      )}
    </header>
  );
};