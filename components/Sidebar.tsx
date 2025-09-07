
import React from 'react';
import { AppPage } from '../types';

interface SidebarProps {
  currentPage: AppPage;
  setPage: (page: AppPage) => void;
  onLogout: () => void;
  userEmail: string;
}

const NavItem: React.FC<{
  label: string;
  page: AppPage;
  currentPage: AppPage;
  setPage: (page: AppPage) => void;
  children: React.ReactNode;
}> = ({ label, page, currentPage, setPage, children }) => {
  const isActive = currentPage === page;
  return (
    <li>
      <button
        onClick={() => setPage(page)}
        className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-blue-800 text-white shadow-md'
            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        {children}
        <span className="ml-3 font-medium">{label}</span>
      </button>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage, onLogout, userEmail }) => {
  return (
    <aside className="w-64 bg-gray-800 bg-opacity-50 p-4 flex flex-col justify-between border-r border-gray-700 shadow-lg">
      <div>
        <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-yellow-400">
                Seek Beyond Realty
            </h1>
            <p className="text-xs text-blue-200 mt-1">AI Video Suite</p>
        </div>
        <nav>
          <ul>
            <NavItem label="Dashboard" page={AppPage.DASHBOARD} currentPage={currentPage} setPage={setPage}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            </NavItem>
            <NavItem label="Avatar Studio" page={AppPage.AVATAR_STUDIO} currentPage={currentPage} setPage={setPage}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </NavItem>
            <NavItem label="Project Manager" page={AppPage.PROJECT_MANAGER} currentPage={currentPage} setPage={setPage}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </NavItem>
            <NavItem label="Video Generator" page={AppPage.VIDEO_GENERATOR} currentPage={currentPage} setPage={setPage}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </NavItem>
          </ul>
        </nav>
      </div>
      <div>
        <div className="border-t border-gray-700 pt-4">
            <NavItem label="User Profile" page={AppPage.PROFILE} currentPage={currentPage} setPage={setPage}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </NavItem>
             <NavItem label="Settings" page={AppPage.SETTINGS} currentPage={currentPage} setPage={setPage}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </NavItem>
        </div>
        <div className="border-t border-gray-700 mt-2 pt-2">
            <button
            onClick={onLogout}
            className="flex items-center w-full p-3 rounded-lg text-gray-400 hover:bg-red-800 hover:text-white transition-colors duration-200"
            >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span className="ml-3 font-medium">Logout</span>
            </button>
        </div>
      </div>
    </aside>
  );
};
