import React from 'react';
import { MapPin, Search, Volume2, ShieldCheck, UserCheck, LogIn, Plus } from 'lucide-react';
import { UserProfile } from '../types';
import { playGoatBleatSound } from '../services/audio';

interface NavbarProps {
  currentArea: string;
  onOpenLocationModal: () => void;
  onOpenSearchModal: () => void;
  onOpenSellModal: () => void;
  onOpenAuthModal: () => void;
  currentUser: UserProfile | null;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentArea,
  onOpenLocationModal,
  onOpenSearchModal,
  onOpenSellModal,
  onOpenAuthModal,
  currentUser,
  onOpenProfile,
  onOpenAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80 transition">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img
            src="/logo.jpg"
            alt="SRA Goat for Sale Hyderabad"
            className="w-10 h-10 rounded-full border border-emerald-500/50 shadow-md shadow-emerald-950/40 object-cover"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                SRA GOAT
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                HYD
              </span>
            </div>
            <span className="text-[10px] text-stone-400 font-medium -mt-0.5 hidden xs:inline">
              For Sale Hyderabad
            </span>
          </div>
        </div>

        {/* Location Selector Pill */}
        <button
          onClick={onOpenLocationModal}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-stone-900 hover:bg-stone-800/80 border border-stone-800 text-stone-200 transition text-xs max-w-[160px] sm:max-w-[220px] truncate"
          title="Change location"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate font-medium">{currentArea}</span>
        </button>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Bleat Sound Button */}
          <button
            onClick={() => playGoatBleatSound()}
            title="Play Goat Sound"
            className="p-2 rounded-xl text-stone-400 hover:text-emerald-400 hover:bg-stone-900 border border-transparent hover:border-stone-800 transition"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Search Button */}
          <button
            onClick={onOpenSearchModal}
            title="Search Animals"
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-900 border border-transparent hover:border-stone-800 transition"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Admin Dashboard shortcut if admin */}
          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={onOpenAdmin}
              title="Admin Dashboard"
              className="py-1.5 px-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Post Ad Button (Desktop) */}
          <button
            onClick={onOpenSellModal}
            className="hidden md:flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Sell Animal</span>
          </button>

          {/* Auth Button / Profile */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 p-1.5 sm:px-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 transition text-xs font-medium text-stone-200"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-700/60 text-emerald-200 flex items-center justify-center font-bold text-[11px] border border-emerald-500/40">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.name}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-emerald-400 text-xs font-semibold transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
