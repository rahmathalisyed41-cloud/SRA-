import React from 'react';
import {
  X,
  Phone,
  MessageCircle,
  MapPin,
  ShieldCheck,
  CheckCircle,
  Eye,
  PlaySquare,
} from 'lucide-react';
import { AnimalListing, AnimalShort, UserProfile } from '../types';
import { ListingCard } from './ListingCard';

interface FarmerProfileModalProps {
  sellerId: string | null;
  onClose: () => void;
  listings: AnimalListing[];
  shorts: AnimalShort[];
  onOpenListing: (listing: AnimalListing) => void;
}

export const FarmerPublicProfileModal: React.FC<FarmerProfileModalProps> = ({
  sellerId,
  onClose,
  listings,
  shorts,
  onOpenListing,
}) => {
  if (!sellerId) return null;

  const sellerListings = listings.filter((l) => l.sellerId === sellerId && l.status !== 'deleted');
  const sellerShorts = shorts.filter((s) => s.sellerId === sellerId && s.status === 'active');

  const firstListing = sellerListings[0];
  const farmerName = firstListing?.farmerName || firstListing?.sellerName || 'Verified SRA Farmer';
  const location = firstListing?.villageArea || firstListing?.location || 'Hyderabad, Telangana';
  const phoneNumber = firstListing?.phoneNumber;
  const whatsAppNumber = firstListing?.whatsAppNumber || phoneNumber;
  const availableCount = sellerListings.filter((l) => l.status === 'available').length;
  const soldCount = sellerListings.filter((l) => l.status === 'sold').length;

  const handleCall = () => {
    if (phoneNumber) window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = () => {
    if (whatsAppNumber) {
      const clean = whatsAppNumber.replace(/[^0-9]/g, '');
      const text = encodeURIComponent(`Hello ${farmerName}, I am contacting you from SRA Goat for Sale Hyderabad.`);
      window.open(`https://wa.me/${clean}?text=${text}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
              Verified Seller
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-6 flex-1 text-xs">
          {/* Farm & Farmer Banner */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500/60 text-emerald-300 font-extrabold text-2xl flex items-center justify-center shadow-lg shrink-0">
              {farmerName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <h2 className="text-base font-extrabold text-white">{farmerName}</h2>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1 text-stone-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{location}</span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-stone-300">
                <div className="text-center sm:text-left">
                  <span className="font-extrabold text-sm text-emerald-400 block">{availableCount}</span>
                  <span className="text-[10px] text-stone-500 uppercase">Available</span>
                </div>
                <div className="text-center sm:text-left">
                  <span className="font-extrabold text-sm text-stone-300 block">{soldCount}</span>
                  <span className="text-[10px] text-stone-500 uppercase">Sold</span>
                </div>
                <div className="text-center sm:text-left">
                  <span className="font-extrabold text-sm text-amber-400 block">{sellerShorts.length}</span>
                  <span className="text-[10px] text-stone-500 uppercase">Reels</span>
                </div>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
              {phoneNumber && (
                <button
                  onClick={handleCall}
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call Farmer</span>
                </button>
              )}

              {whatsAppNumber && (
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </button>
              )}
            </div>
          </div>

          {/* Available Animals Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              Animals for Sale by this Farmer ({sellerListings.length})
            </h3>

            {sellerListings.length === 0 ? (
              <p className="text-stone-500 py-4 text-center">No active listings available right now.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sellerListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClick={() => {
                      onOpenListing(listing);
                      onClose();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
