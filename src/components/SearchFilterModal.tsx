import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  SlidersHorizontal,
  RotateCcw,
  Clock,
  Sparkles,
  MapPin,
  Check,
} from 'lucide-react';
import { SearchFilterState } from '../types';
import { INITIAL_BREEDS, HYDERABAD_AREAS } from '../data/initialBreeds';

interface SearchFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilterState;
  onApplyFilters: (filters: SearchFilterState) => void;
}

const RECENT_SEARCHES_KEY = 'sra_recent_searches_v1';

export const SearchFilterModal: React.FC<SearchFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFilterState>(filters);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setLocalFilters(filters);
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    // Save to recents if keyword entered
    if (localFilters.keyword.trim()) {
      const clean = localFilters.keyword.trim();
      const updated = [clean, ...recentSearches.filter((s) => s !== clean)].slice(0, 8);
      setRecentSearches(updated);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const defaultState: SearchFilterState = {
      keyword: '',
      category: 'all',
      subcategory: '',
      breed: '',
      gender: 'all',
      minPrice: 0,
      maxPrice: 300000,
      maxAgeMonths: 60,
      location: '',
      status: 'all',
      sortBy: 'newest',
    };
    setLocalFilters(defaultState);
  };

  const handleClearRecents = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const handleSelectRecent = (term: string) => {
    setLocalFilters((prev) => ({ ...prev, keyword: term }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Search & Filter Animals</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="py-1 px-2.5 rounded-lg text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-800 transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1 text-xs">
          {/* Keyword Search Input */}
          <div>
            <label className="font-bold text-stone-300 uppercase tracking-wider block mb-1.5">
              Global Search
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={localFilters.keyword}
                onChange={(e) => setLocalFilters((prev) => ({ ...prev, keyword: e.target.value }))}
                placeholder="Search breed (Jamnapari, Boer), farmer name, area..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
              {localFilters.keyword && (
                <button
                  onClick={() => setLocalFilters((prev) => ({ ...prev, keyword: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5 text-[11px] text-stone-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  Recent Searches
                </span>
                <button onClick={handleClearRecents} className="hover:text-red-400 underline">
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectRecent(term)}
                    className="px-2.5 py-1 rounded-full bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div>
            <label className="font-bold text-stone-300 uppercase tracking-wider block mb-1.5">
              Animal Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Animals' },
                { id: 'goat', label: '🐐 Goats' },
                { id: 'sheep', label: '🐑 Sheep' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setLocalFilters((prev) => ({ ...prev, category: cat.id as any }))}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition ${
                    localFilters.category === cat.id
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="font-bold text-stone-300 uppercase tracking-wider block mb-1.5">
              Gender
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Any Gender' },
                { id: 'male', label: 'Male (Bakra / Ram)' },
                { id: 'female', label: 'Female (Bakri / Ewe)' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setLocalFilters((prev) => ({ ...prev, gender: g.id as any }))}
                  className={`py-2 px-3 rounded-xl border text-center font-semibold transition ${
                    localFilters.gender === g.id
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Breed Selection */}
          <div>
            <label className="font-bold text-stone-300 uppercase tracking-wider block mb-1.5">
              Filter by Breed
            </label>
            <select
              value={localFilters.breed}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, breed: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none"
            >
              <option value="">All Breeds</option>
              {INITIAL_BREEDS.filter(
                (b) => localFilters.category === 'all' || b.category === localFilters.category
              ).map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name} ({b.category})
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-stone-300 uppercase tracking-wider">
                Max Price: ₹{localFilters.maxPrice.toLocaleString('en-IN')}
              </label>
            </div>
            <input
              type="range"
              min={5000}
              max={300000}
              step={5000}
              value={localFilters.maxPrice}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-stone-500 mt-1">
              <span>₹5,000</span>
              <span>₹1,50,000</span>
              <span>₹3,00,000+</span>
            </div>
          </div>

          {/* Location Area Filter */}
          <div>
            <label className="font-bold text-stone-300 uppercase tracking-wider block mb-1.5">
              Hyderabad Area
            </label>
            <select
              value={localFilters.location}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none"
            >
              <option value="">All Areas across Hyderabad</option>
              {HYDERABAD_AREAS.filter((a) => !a.startsWith('All')).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="font-bold text-stone-300 uppercase tracking-wider block mb-1.5">
              Sort Listings By
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'newest', label: 'Newest First' },
                { id: 'price_low', label: 'Price: Low to High' },
                { id: 'price_high', label: 'Price: High to Low' },
                { id: 'views', label: 'Most Viewed' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setLocalFilters((prev) => ({ ...prev, sortBy: s.id as any }))}
                  className={`py-2 px-3 rounded-xl border text-center font-semibold transition ${
                    localFilters.sortBy === s.id
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center gap-3">
          <button
            onClick={handleApply}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/80 transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
