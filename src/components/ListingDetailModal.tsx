import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Share2,
  Heart,
  MapPin,
  Calendar,
  Eye,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play,
  RotateCw,
  ExternalLink,
} from 'lucide-react';
import { AnimalListing } from '../types';
import { incrementListingViews } from '../services/db';
import { identifyAnimalBreed } from '../services/gemini';

interface ListingDetailModalProps {
  listing: AnimalListing | null;
  onClose: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: (listingId: string) => void;
  onOpenFarmerProfile?: (sellerId: string) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  isFavorited = false,
  onToggleFavorite,
  onOpenFarmerProfile,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<{
    breedName: string;
    characteristics: string[];
    recommendation: string;
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (listing) {
      setActivePhotoIdx(0);
      setShowVideo(false);
      setAiAdvice(null);
      incrementListingViews(listing.id);
    }
  }, [listing]);

  if (!listing) return null;

  const photos = listing.photos && listing.photos.length > 0 ? listing.photos : ['/logo.jpg'];

  const handleCall = () => {
    const cleanNumber = listing.phoneNumber.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleanNumber}`;
  };

  const handleWhatsApp = () => {
    const cleanNumber = (listing.whatsAppNumber || listing.phoneNumber).replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Assalamu Alaikum / Namaste ${listing.farmerName || listing.sellerName},\nI am interested in buying your ${listing.breed} (${listing.gender}, ${listing.ageMonths} mos) listed for ₹${listing.price.toLocaleString('en-IN')} on SRA Goat for Sale Hyderabad.\nIs the animal available for visit at ${listing.villageArea || listing.location}?`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: `${listing.breed} ${listing.category} for sale in Hyderabad`,
      text: `Check out this ${listing.breed} for ₹${listing.price.toLocaleString('en-IN')} on SRA Goat for Sale Hyderabad:`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleAskAIAdvisor = async () => {
    if (loadingAi) return;
    setLoadingAi(true);
    try {
      const result = await identifyAnimalBreed(
        undefined,
        `Animal category: ${listing.category}, Breed: ${listing.breed}, Age: ${listing.ageMonths} months, Location: ${listing.location} Hyderabad.`
      );
      setAiAdvice(result);
    } catch (err) {
      console.warn('AI Advisor error:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Sticky Modal Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 bg-stone-950/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-700/60">
              {listing.category}
            </span>
            <span className="text-xs font-semibold text-stone-300 truncate max-w-[180px] sm:max-w-xs">
              {listing.breed} {listing.name ? `• ${listing.name}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(listing.id)}
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 transition"
                title="Favorite"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 transition"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Main Media Viewer */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-stone-950">
            {showVideo && listing.videoUrl ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <video
                  src={listing.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setShowVideo(false)}
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 text-xs text-white backdrop-blur-md"
                >
                  Back to Photos
                </button>
              </div>
            ) : (
              <>
                <img
                  src={photos[activePhotoIdx]}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />

                {/* Left/Right Carousel Controls */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Video Switch Button */}
                {listing.videoUrl && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-black/80 backdrop-blur-md transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Play Animal Video
                  </button>
                )}

                {/* Photo Pagination Indicator */}
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-xs text-stone-300 font-mono">
                  {activePhotoIdx + 1} / {photos.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {photos.length > 1 && !showVideo && (
            <div className="flex gap-2 p-3 bg-stone-950/60 overflow-x-auto border-b border-stone-800">
              {photos.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                    activePhotoIdx === idx ? 'border-emerald-500 scale-105' : 'border-stone-800 opacity-60'
                  }`}
                >
                  <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Details Body */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Price & Primary Headline */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    ₹{listing.price.toLocaleString('en-IN')}
                  </span>
                  {listing.isNegotiable && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                      Price Negotiable
                    </span>
                  )}
                  {listing.status === 'sold' && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-red-950 text-red-300 border border-red-800">
                      SOLD OUT
                    </span>
                  )}
                </div>

                <h1 className="text-lg font-bold text-stone-100 mt-1">
                  {listing.breed} {listing.category === 'goat' ? 'Goat' : 'Sheep'}
                  {listing.name ? ` (${listing.name})` : ''}
                </h1>
              </div>

              <div className="flex items-center gap-3 text-xs text-stone-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-stone-500" />
                  {listing.viewsCount || 0} views
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  {new Date(listing.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Key Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80">
                <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold block">
                  Category
                </span>
                <span className="text-sm font-bold text-stone-200 capitalize mt-0.5 block">
                  {listing.category}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80">
                <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold block">
                  Gender
                </span>
                <span className="text-sm font-bold text-stone-200 capitalize mt-0.5 block">
                  {listing.gender}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80">
                <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold block">
                  Age
                </span>
                <span className="text-sm font-bold text-stone-200 mt-0.5 block">
                  {listing.ageMonths} Months
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80">
                <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold block">
                  Teeth Count
                </span>
                <span className="text-sm font-bold text-stone-200 mt-0.5 block">
                  {listing.teethCount !== undefined
                    ? listing.teethCount === 0
                      ? 'Adant (Milk)'
                      : `${listing.teethCount} Dant`
                    : 'Sound'}
                </span>
              </div>

              {listing.weightKg && (
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80">
                  <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold block">
                    Live Weight
                  </span>
                  <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                    ~ {listing.weightKg} kg
                  </span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80 col-span-2">
                <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold block">
                  Subcategory
                </span>
                <span className="text-sm font-semibold text-stone-200 capitalize mt-0.5 block truncate">
                  {listing.subcategory?.replace(/_/g, ' ') || listing.breed}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Animal Health & Diet Description
              </h3>
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-stone-300 text-sm leading-relaxed whitespace-pre-line">
                {listing.description ||
                  `Pure ${listing.breed} ${listing.gender} raised with natural stall feed in Hyderabad. Disease-free and healthy.`}
              </div>
            </div>

            {/* Location Section */}
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/50 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-200">
                  {listing.villageArea || listing.location}
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  {listing.city || 'Hyderabad'}, Telangana • Farm / Pen Location
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Exact farm address is confirmed with seller upon phone/WhatsApp contact for buyer security.
                </p>
              </div>
            </div>

            {/* Gemini AI Breed Advisor */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-stone-950 to-teal-950/30 border border-emerald-800/40">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Gemini AI Breed & Care Advisor
                  </span>
                </div>
                {!aiAdvice && (
                  <button
                    onClick={handleAskAIAdvisor}
                    disabled={loadingAi}
                    className="py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs font-semibold text-white transition flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {loadingAi ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Analyze Breed
                  </button>
                )}
              </div>

              {aiAdvice && (
                <div className="mt-3 pt-3 border-t border-emerald-800/40 text-xs text-stone-300 space-y-2">
                  <p className="font-semibold text-emerald-200">
                    Breed: {aiAdvice.breedName}
                  </p>
                  <p className="leading-relaxed">{aiAdvice.recommendation}</p>
                </div>
              )}
            </div>

            {/* Farmer / Seller Profile Card */}
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-300 font-bold text-lg">
                  {listing.farmerPhotoUrl ? (
                    <img src={listing.farmerPhotoUrl} alt={listing.farmerName} className="w-full h-full object-cover" />
                  ) : (
                    (listing.farmerName || listing.sellerName || 'F').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-stone-100">
                      {listing.farmerName || listing.sellerName}
                    </span>
                    <span title="Verified Livestock Farmer">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    Livestock Seller • SRA Group HYD Network
                  </p>
                </div>
              </div>

              {onOpenFarmerProfile && (
                <button
                  onClick={() => onOpenFarmerProfile(listing.sellerId)}
                  className="py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-medium text-stone-200 flex items-center gap-1"
                >
                  <span>Farm Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Marketplace Safe Disclaimer */}
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/60 text-[11px] text-stone-500 leading-relaxed">
              <strong className="text-stone-400">SRA Marketplace Notice:</strong> SRA Goat for Sale Hyderabad connects buyers and sellers directly. We do not provide physical animal transport, slaughter, or meat delivery. Please inspect the live animal personally prior to payment.
            </div>
          </div>
        </div>

        {/* Bottom Action Sticky Bar */}
        <div className="p-3 sm:p-4 border-t border-stone-800 bg-stone-950/95 backdrop-blur-md flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleCall}
            className="flex-1 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Call Seller</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/80 flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Seller</span>
          </button>
        </div>
      </div>
    </div>
  );
};
