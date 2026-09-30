import React from 'react';
import { Home, PlaySquare, PlusCircle, ClipboardList, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'shorts' | 'sell' | 'my-listings' | 'profile';
  onChangeTab: (tab: 'home' | 'shorts' | 'sell' | 'my-listings' | 'profile') => void;
  unreadShortsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  unreadShortsCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-lg border-t border-stone-800/80 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {/* Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'home' ? 'text-emerald-400 font-semibold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
        </button>

        {/* Shorts */}
        <button
          onClick={() => onChangeTab('shorts')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'shorts' ? 'text-emerald-400 font-semibold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <PlaySquare className={`w-5 h-5 ${activeTab === 'shorts' ? 'scale-110 text-emerald-400' : ''} transition-transform`} />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Shorts</span>
        </button>

        {/* Sell Animal (Center Highlighted Action) */}
        <button
          onClick={() => onChangeTab('sell')}
          className="flex flex-col items-center justify-center -mt-5 flex-1 group"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white flex items-center justify-center shadow-lg shadow-emerald-950/80 border-2 border-stone-950 group-hover:scale-105 transition-all">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] mt-1 text-emerald-300 font-bold tracking-tight">Sell</span>
        </button>

        {/* My Listings */}
        <button
          onClick={() => onChangeTab('my-listings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'my-listings' ? 'text-emerald-400 font-semibold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <ClipboardList className={`w-5 h-5 ${activeTab === 'my-listings' ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[10px] mt-1 tracking-tight">My Listings</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'profile' ? 'text-emerald-400 font-semibold' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <User className={`w-5 h-5 ${activeTab === 'profile' ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[10px] mt-1 tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
