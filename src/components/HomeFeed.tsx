import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  Flame,
  PlusCircle,
  PlaySquare,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Compass,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { AnimalCategory, AnimalListing, AnimalShort, AnimalBreed, AdminSettings } from '../types';
import { ListingCard } from './ListingCard';
import { AdSenseBanner } from './AdSenseBanner';

interface HomeFeedProps {
  listings: AnimalListing[];
  shorts: AnimalShort[];
  breeds: AnimalBreed[];
  adminSettings: AdminSettings;
  currentArea: string;
  selectedCategory: AnimalCategory | 'all';
  onSelectCategory: (cat: AnimalCategory | 'all') => void;
  selectedBreed: string;
  onSelectBreed: (breed: string) => void;
  onOpenListing: (listing: AnimalListing) => void;
  onOpenShortsFeed: () => void;
  onOpenSellModal: () => void;
  onOpenSearchModal: () => void;
  onOpenLocationModal: () => void;
  onOpenFarmerProfile: (sellerId: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  listings,
  shorts,
  breeds,
  adminSettings,
  currentArea,
  selectedCategory,
  onSelectCategory,
  selectedBreed,
  onSelectBreed,
  onOpenListing,
  onOpenShortsFeed,
  onOpenSellModal,
  onOpenSearchModal,
  onOpenLocationModal,
  onOpenFarmerProfile,
  favorites,
  onToggleFavorite,
}) => {
  const [subFilter, setSubFilter] = useState<'all' | 'goat' | 'sheep'>('all');

  // Filter listings based on category & breed
  const availableListings = listings.filter((l) => l.status !== 'deleted');

  const filteredListings = availableListings.filter((l) => {
    if (selectedCategory !== 'all' && l.category !== selectedCategory) return false;
    if (selectedBreed && l.breed.toLowerCase() !== selectedBreed.toLowerCase()) return false;
    return true;
  });

  const featuredListings = availableListings.filter((l) => l.isFeatured);
  const latestListings = [...filteredListings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 space-y-6 pb-24">
      {/* Global Announcement Banner */}
      {adminSettings.showAnnouncement && adminSettings.announcementText && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-stone-900 to-emerald-950/70 border border-emerald-800/50 flex items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2 text-emerald-300 font-medium">
            <span className="p-1 rounded-md bg-emerald-900 text-emerald-300 font-bold text-[10px]">
              NOTICE
            </span>
            <span className="truncate">{adminSettings.announcementText}</span>
          </div>
        </div>
      )}

      {/* Hero 2030 Banner & Quick Actions */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-900/40 bg-gradient-to-br from-emerald-950 via-stone-950 to-stone-900 p-5 sm:p-7 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-600/50 text-[11px] font-bold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Hyderabad Verified Live Livestock Marketplace</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              SRA Goat for Sale <span className="text-emerald-400">Hyderabad</span>
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
              Direct connection between Telangana livestock farmers, goat breeders, and serious buyers. Discover pure Jamnapari, Boer, Sirohi, Nellore Jodipi and Dorper sheep with zero intermediary commissions.
            </p>

            {/* Hero Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenSellModal}
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/80 transition flex items-center gap-2 group cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Animal For Sale (Sell)</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onOpenSearchModal}
                className="py-3 px-4 rounded-2xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-stone-200 font-bold text-xs sm:text-sm transition flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-emerald-400" />
                <span>Find Animals in Hyderabad</span>
              </button>
            </div>
          </div>

          {/* Official Emblem Logo Presentation */}
          <div className="hidden md:flex flex-col items-center justify-center shrink-0">
            <div className="relative group cursor-pointer" onClick={onOpenLocationModal}>
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 opacity-60 blur-md group-hover:opacity-100 transition duration-500"></div>
              <img
                src="/logo.jpg"
                alt="SRA Goat Brand Emblem"
                className="relative w-36 h-36 rounded-full border-2 border-emerald-400 shadow-2xl object-cover"
              />
            </div>
            <span className="text-[11px] font-bold text-emerald-400 mt-2">
              SRA Group HYD
            </span>
          </div>
        </div>
      </div>

      {/* Search Input Bar (Sticky trigger) */}
      <div
        onClick={onOpenSearchModal}
        className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 hover:border-emerald-600/60 shadow-lg transition cursor-pointer group"
      >
        <div className="flex items-center gap-3 text-stone-400 group-hover:text-stone-300">
          <Search className="w-5 h-5 text-emerald-400" />
          <span className="text-xs sm:text-sm">
            Search goat or sheep breeds, farmer name, Shamshabad, Charminar...
          </span>
        </div>
        <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold">
          <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
          <span className="hidden sm:inline">Filters</span>
        </div>
      </div>

      {/* ANIMAL SHORTS HORIZONTAL PREVIEW STRIP */}
      {shorts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                <PlaySquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-tight">
                  Animal Shorts Reels
                </h2>
                <p className="text-[10px] text-stone-400">9:16 vertical animal video previews</p>
              </div>
            </div>

            <button
              onClick={onOpenShortsFeed}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              <span>Watch Feed</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal Reel Cards */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {shorts.map((short) => (
              <div
                key={short.id}
                onClick={onOpenShortsFeed}
                className="relative aspect-[9/14] w-28 sm:w-32 rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 hover:border-emerald-500 shrink-0 cursor-pointer shadow-lg group transition-transform hover:scale-105"
              >
                <video
                  src={short.videoUrl}
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase truncate">
                    {short.breed}
                  </span>
                  <p className="text-[11px] font-semibold text-white truncate leading-tight">
                    {short.title || short.sellerName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORIES SELECTION (Goats vs Sheep) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Animal Categories
          </h2>
          {selectedBreed && (
            <button
              onClick={() => onSelectBreed('')}
              className="text-xs text-amber-400 hover:underline"
            >
              Clear Breed Filter ({selectedBreed})
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <button
            onClick={() => {
              onSelectCategory('all');
              onSelectBreed('');
            }}
            className={`py-3 px-3 rounded-2xl border text-center font-bold text-xs sm:text-sm transition flex flex-col items-center justify-center gap-1 ${
              selectedCategory === 'all'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-850'
            }`}
          >
            <span className="text-lg">🌿</span>
            <span>All Animals</span>
          </button>

          <button
            onClick={() => {
              onSelectCategory('goat');
              onSelectBreed('');
            }}
            className={`py-3 px-3 rounded-2xl border text-center font-bold text-xs sm:text-sm transition flex flex-col items-center justify-center gap-1 ${
              selectedCategory === 'goat'
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-850'
            }`}
          >
            <span className="text-lg">🐐</span>
            <span>Goats (Bakri)</span>
          </button>

          <button
            onClick={() => {
              onSelectCategory('sheep');
              onSelectBreed('');
            }}
            className={`py-3 px-3 rounded-2xl border text-center font-bold text-xs sm:text-sm transition flex flex-col items-center justify-center gap-1 ${
              selectedCategory === 'sheep'
                ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40'
                : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-850'
            }`}
          >
            <span className="text-lg">🐑</span>
            <span>Sheep (Mendha)</span>
          </button>
        </div>
      </div>

      {/* POPULAR BREEDS QUICK FILTER PILLS */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
          Popular Breeds in Hyderabad
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {breeds
            .filter((b) => selectedCategory === 'all' || b.category === selectedCategory)
            .slice(0, 12)
            .map((breed) => {
              const isSelected = selectedBreed.toLowerCase() === breed.name.toLowerCase();
              return (
                <button
                  key={breed.id}
                  onClick={() => onSelectBreed(isSelected ? '' : breed.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                      : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  {breed.name} {breed.isExotic ? '★' : ''}
                </button>
              );
            })}
        </div>
      </div>

      {/* FEATURED LISTINGS CAROUSEL / ROW */}
      {featuredListings.length > 0 && !selectedBreed && selectedCategory === 'all' && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-extrabold text-white tracking-tight uppercase">
              Featured Animals in Hyderabad
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredListings.slice(0, 3).map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={onOpenListing}
                isFavorited={favorites.includes(listing.id)}
                onToggleFavorite={onToggleFavorite}
                onSellerProfileClick={onOpenFarmerProfile}
              />
            ))}
          </div>
        </div>
      )}

      {/* Native Ad Banner Placement */}
      <AdSenseBanner placement="feed" />

      {/* LATEST ANIMAL LISTINGS FEED */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-extrabold text-white tracking-tight uppercase">
              {selectedBreed
                ? `${selectedBreed} Listings`
                : selectedCategory === 'goat'
                ? 'All Goats for Sale'
                : selectedCategory === 'sheep'
                ? 'All Sheep for Sale'
                : 'Latest Live Animals'}
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">
            {latestListings.length} {latestListings.length === 1 ? 'animal' : 'animals'}
          </span>
        </div>

        {latestListings.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-stone-900/60 border border-stone-800 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-700/60 mx-auto flex items-center justify-center text-3xl shadow-xl">
              🐐
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Listings Found Yet</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                {selectedBreed
                  ? `No ${selectedBreed} listings match right now. Clear breed filter or post your animal.`
                  : 'Be the first Hyderabad farmer or livestock owner to list your goat or sheep!'}
              </p>
            </div>
            <button
              onClick={onOpenSellModal}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs shadow-xl shadow-emerald-950/80 transition flex items-center gap-2 mx-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Your Animal Listing (+ Sell)</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {latestListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={onOpenListing}
                isFavorited={favorites.includes(listing.id)}
                onToggleFavorite={onToggleFavorite}
                onSellerProfileClick={onOpenFarmerProfile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
