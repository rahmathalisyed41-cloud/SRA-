import React, { useState } from 'react';
import {
  PlusCircle,
  Eye,
  CheckCircle,
  RotateCcw,
  Edit3,
  Trash2,
  Calendar,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { AnimalListing, UserProfile } from '../types';
import { updateListing, deleteListing } from '../services/db';

interface MyListingsViewProps {
  listings: AnimalListing[];
  currentUser: UserProfile | null;
  onOpenSellModal: () => void;
  onEditListing: (listing: AnimalListing) => void;
  onListingDetail: (listing: AnimalListing) => void;
  onRequireAuth: () => void;
}

export const MyListingsView: React.FC<MyListingsViewProps> = ({
  listings,
  currentUser,
  onOpenSellModal,
  onEditListing,
  onListingDetail,
  onRequireAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'available' | 'sold'>('all');
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-2xl mb-4">
          🔒
        </div>
        <h2 className="text-lg font-bold text-white">Login to View Your Listings</h2>
        <p className="text-xs text-stone-400 max-w-xs mt-1">
          Farmers and sellers can track animal views, mark animals as sold, and manage ads after SMS OTP login.
        </p>
        <button
          onClick={onRequireAuth}
          className="mt-4 py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg transition"
        >
          Login with Mobile OTP
        </button>
      </div>
    );
  }

  // Filter user's listings
  const myListings = listings.filter((l) => l.sellerId === currentUser.id);

  const filtered = myListings.filter((l) => {
    if (activeTab === 'all') return l.status !== 'deleted';
    if (activeTab === 'available') return l.status === 'available' || l.status === 'published';
    if (activeTab === 'sold') return l.status === 'sold';
    return true;
  });

  const handleToggleSold = async (listing: AnimalListing, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = listing.status === 'sold' ? 'available' : 'sold';
    setLoadingActionId(listing.id);
    try {
      await updateListing(listing.id, { status: newStatus });
      listing.status = newStatus;
    } catch (err) {
      console.warn('Status toggle error:', err);
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleDelete = async (listingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this animal listing?')) return;
    setLoadingActionId(listingId);
    try {
      await deleteListing(listingId);
    } catch (err) {
      console.warn('Delete error:', err);
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">My Animal Listings</h1>
          <p className="text-xs text-emerald-400 font-medium mt-0.5">
            Manage your goats & sheep live marketplace advertisements
          </p>
        </div>

        <button
          onClick={onOpenSellModal}
          className="self-start sm:self-auto flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Animal</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
        {[
          { id: 'all', label: `All (${myListings.length})` },
          { id: 'available', label: `Available (${myListings.filter((l) => l.status === 'available').length})` },
          { id: 'sold', label: `Sold (${myListings.filter((l) => l.status === 'sold').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings List */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-stone-900/60 border border-stone-800">
          <div className="w-12 h-12 rounded-full bg-stone-800/80 mx-auto flex items-center justify-center text-xl mb-3">
            🐐
          </div>
          <p className="text-sm font-bold text-stone-200">No listings found in this tab</p>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            You haven't posted any animal under this status. Tap the button below to list a goat or sheep for sale.
          </p>
          <button
            onClick={onOpenSellModal}
            className="mt-4 py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs transition"
          >
            Post Animal Ad
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((listing) => {
            const isSold = listing.status === 'sold';
            const photo = listing.photos?.[0] || '/logo.jpg';
            const isLoading = loadingActionId === listing.id;

            return (
              <div
                key={listing.id}
                onClick={() => onListingDetail(listing)}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 hover:border-emerald-600/40 shadow-md transition cursor-pointer gap-4"
              >
                {/* Image & Basic Info */}
                <div className="flex items-center gap-3.5">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-950 shrink-0 border border-stone-800">
                    <img src={photo} alt={listing.breed} className="w-full h-full object-cover" />
                    {isSold && (
                      <span className="absolute inset-0 bg-red-950/80 flex items-center justify-center text-[10px] font-black text-red-300">
                        SOLD
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                        {listing.category}
                      </span>
                      <span className="text-xs text-stone-400 capitalize">{listing.gender}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white mt-1">
                      {listing.breed} {listing.name ? `• ${listing.name}` : ''}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-stone-400 mt-1 font-semibold">
                      <span className="text-emerald-400 font-extrabold text-sm">
                        ₹{listing.price.toLocaleString('en-IN')}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px] text-stone-400">
                        <Eye className="w-3 h-3" />
                        {listing.viewsCount || 0} views
                      </span>
                    </div>
                  </div>
                </div>

                {/* Management Action Buttons */}
                <div
                  className="flex items-center gap-2 self-end sm:self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Mark Sold / Relist */}
                  <button
                    onClick={(e) => handleToggleSold(listing, e)}
                    disabled={isLoading}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      isSold
                        ? 'bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-300'
                        : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300'
                    }`}
                  >
                    {isSold ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    <span>{isSold ? 'Relist Animal' : 'Mark Sold'}</span>
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => onEditListing(listing)}
                    disabled={isLoading}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition"
                    title="Edit Listing"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => handleDelete(listing.id, e)}
                    disabled={isLoading}
                    className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 transition"
                    title="Delete Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
