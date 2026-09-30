import React from 'react';
import { Phone, MessageCircle, MapPin, Eye, Camera, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import { AnimalListing } from '../types';

interface ListingCardProps {
  listing: AnimalListing;
  onClick: (listing: AnimalListing) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (listingId: string) => void;
  onSellerProfileClick?: (sellerId: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onClick,
  isFavorited = false,
  onToggleFavorite,
  onSellerProfileClick,
}) => {
  const isGoat = listing.category === 'goat';
  const isSold = listing.status === 'sold';

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanNumber = listing.phoneNumber.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleanNumber}`;
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanNumber = (listing.whatsAppNumber || listing.phoneNumber).replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${listing.farmerName || listing.sellerName}, I am contacting you regarding your ${listing.breed} (${listing.gender}) listed for ₹${listing.price.toLocaleString('en-IN')} on SRA Goat for Sale Hyderabad.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(listing.id);
    }
  };

  // Thumbnail photo fallback
  const mainPhoto = listing.photos && listing.photos.length > 0 ? listing.photos[0] : '/logo.jpg';

  return (
    <div
      onClick={() => onClick(listing)}
      className="group relative flex flex-col rounded-2xl bg-stone-900/90 border border-stone-800/90 hover:border-emerald-600/50 shadow-md hover:shadow-xl hover:shadow-emerald-950/20 transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Media Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950">
        <img
          src={mainPhoto}
          alt={listing.title || `${listing.breed} ${listing.category}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {/* Category & Status */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                isGoat
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
              }`}
            >
              {listing.category}
            </span>

            {isSold ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-950/90 text-red-300 border border-red-800">
                SOLD
              </span>
            ) : listing.isFeatured ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
                FEATURED
              </span>
            ) : null}
          </div>

          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              onClick={handleFav}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition pointer-events-auto"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-stone-300'}`} />
            </button>
          )}
        </div>

        {/* Photos Count & Views Pill (Bottom of Image) */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-stone-200">
          {listing.photos && listing.photos.length > 1 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px]">
              <Camera className="w-3 h-3 text-stone-400" />
              {listing.photos.length} Photos
            </span>
          )}

          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] text-stone-300">
            <Eye className="w-3 h-3 text-stone-400" />
            {listing.viewsCount || 0}
          </span>
        </div>
      </div>

      {/* Body Information */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Price & Breed */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-lg font-extrabold text-white tracking-tight">
            ₹{listing.price.toLocaleString('en-IN')}
            {listing.isNegotiable && (
              <span className="text-[10px] font-medium text-emerald-400 ml-1.5 px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-800/40">
                Neg.
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-stone-400 capitalize">
            {listing.gender}
          </span>
        </div>

        <h3 className="font-bold text-sm text-stone-100 mt-1 line-clamp-1 group-hover:text-emerald-300 transition-colors">
          {listing.breed} {listing.name ? `• ${listing.name}` : ''}
        </h3>

        {/* Specs: Age & Teeth */}
        <div className="flex items-center gap-2 text-xs text-stone-400 mt-1.5 font-medium">
          <span>{listing.ageMonths} Mos</span>
          <span className="text-stone-600">•</span>
          <span>
            {listing.teethCount !== undefined
              ? listing.teethCount === 0
                ? 'Adant'
                : `${listing.teethCount} Dant`
              : 'Sound health'}
          </span>
          {listing.weightKg && (
            <>
              <span className="text-stone-600">•</span>
              <span>{listing.weightKg} kg</span>
            </>
          )}
        </div>

        {/* Location & Seller */}
        <div className="mt-2 pt-2 border-t border-stone-800/60 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1 text-[11px] truncate text-stone-300">
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{listing.villageArea || listing.location}</span>
          </div>

          <div
            onClick={(e) => {
              if (onSellerProfileClick) {
                e.stopPropagation();
                onSellerProfileClick(listing.sellerId);
              }
            }}
            className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-emerald-400 truncate max-w-[90px]"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
            <span className="truncate">{listing.farmerName || listing.sellerName}</span>
          </div>
        </div>

        {/* Call & WhatsApp Quick Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2">
          <button
            onClick={handleCall}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Call</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
