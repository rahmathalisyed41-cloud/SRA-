import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Phone,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ExternalLink,
  Plus,
  Send,
  X,
  MapPin,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { AnimalShort, ShortComment, UserProfile } from '../types';
import {
  toggleShortLike,
  checkUserLikedShort,
  subscribeToShortComments,
  addShortComment,
} from '../services/db';

interface ShortsFeedProps {
  shorts: AnimalShort[];
  currentUser: UserProfile | null;
  onOpenListing: (listingId: string) => void;
  onOpenUploadShort: () => void;
  onRequireAuth: () => void;
}

export const ShortsFeed: React.FC<ShortsFeedProps> = ({
  shorts,
  currentUser,
  onOpenListing,
  onOpenUploadShort,
  onRequireAuth,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [commentsDrawerOpen, setCommentsDrawerOpen] = useState(false);
  const [comments, setComments] = useState<ShortComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentShort = shorts[currentIndex];

  // Track user like state for current short
  useEffect(() => {
    if (currentShort && currentUser) {
      checkUserLikedShort(currentShort.id, currentUser.id).then((isLiked) => {
        setLikedMap((prev) => ({ ...prev, [currentShort.id]: isLiked }));
      });
    }
  }, [currentIndex, currentShort, currentUser]);

  // Subscribe to comments when drawer opens
  useEffect(() => {
    if (commentsDrawerOpen && currentShort) {
      const unsub = subscribeToShortComments(currentShort.id, (list) => {
        setComments(list);
      });
      return () => unsub();
    }
  }, [commentsDrawerOpen, currentShort]);

  // Handle video playback on index change
  useEffect(() => {
    setProgress(0);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked if unmuted
        setIsPlaying(false);
      });
    }
  }, [currentIndex]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleToggleLike = async () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!currentShort) return;

    const currentLiked = !!likedMap[currentShort.id];
    // Optimistic toggle
    setLikedMap((prev) => ({ ...prev, [currentShort.id]: !currentLiked }));
    if (currentLiked) {
      currentShort.likesCount = Math.max(0, currentShort.likesCount - 1);
    } else {
      currentShort.likesCount += 1;
    }

    try {
      const newStatus = await toggleShortLike(currentShort.id, currentUser.id, currentLiked);
      setLikedMap((prev) => ({ ...prev, [currentShort.id]: newStatus }));
    } catch {
      // Revert on error
      setLikedMap((prev) => ({ ...prev, [currentShort.id]: currentLiked }));
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!currentShort || !newCommentText.trim()) return;

    setSubmittingComment(true);
    try {
      await addShortComment(
        currentShort.id,
        currentUser.id,
        currentUser.name || 'SRA Farmer',
        newCommentText.trim(),
        currentUser.photoUrl
      );
      setNewCommentText('');
    } catch (err) {
      console.warn('Comment post error:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCall = () => {
    if (!currentShort) return;
    window.location.href = `tel:${currentShort.phoneNumber}`;
  };

  const handleWhatsApp = () => {
    if (!currentShort) return;
    const cleanNumber = (currentShort.whatsAppNumber || currentShort.phoneNumber).replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${currentShort.sellerName}, I saw your animal video reel for ${currentShort.breed} on SRA Goat for Sale Hyderabad.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  const handleShare = async () => {
    if (!currentShort) return;
    const shareData = {
      title: `${currentShort.breed} Video Reel - SRA Goat Hyderabad`,
      text: `Watch this ${currentShort.breed} reel on SRA Goat for Sale Hyderabad:`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // fallback
      }
    }
    navigator.clipboard.writeText(window.location.href);
    alert('Reel link copied to clipboard!');
  };

  const handleNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // If no shorts exist yet
  if (!shorts || shorts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-3xl shadow-xl shadow-emerald-950/40 mb-4 animate-pulse">
          🐐
        </div>
        <h2 className="text-xl font-bold text-stone-100">Live Animal Shorts Feed</h2>
        <p className="text-xs text-stone-400 max-w-sm mt-1 leading-relaxed">
          Be the first Hyderabad farmer or breeder to upload a 9:16 vertical animal video showcasing your goats or sheep!
        </p>
        <button
          onClick={onOpenUploadShort}
          className="mt-5 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Animal Short</span>
        </button>
      </div>
    );
  }

  const isLiked = !!likedMap[currentShort.id];

  return (
    <div className="relative w-full max-w-md mx-auto h-[calc(100vh-8rem)] sm:h-[80vh] bg-black rounded-none sm:rounded-2xl overflow-hidden border border-stone-800/80 shadow-2xl flex flex-col select-none">
      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3.5 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black tracking-wider uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
            SHORTS
          </span>
          <span className="text-xs text-stone-300 font-medium truncate max-w-[150px]">
            {currentShort.breed}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute/Unmute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Upload Short Button */}
          <button
            onClick={onOpenUploadShort}
            className="p-1.5 px-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post</span>
          </button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div
        className="relative flex-1 w-full h-full flex items-center justify-center bg-stone-950 cursor-pointer"
        onClick={handleTogglePlay}
      >
        <video
          ref={videoRef}
          src={currentShort.videoUrl}
          poster={currentShort.thumbnailUrl || '/logo.jpg'}
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover"
        />

        {/* Play/Pause Center Indicator when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <div className="p-4 rounded-full bg-black/60 text-white backdrop-blur-md">
              <Play className="w-8 h-8 fill-white" />
            </div>
          </div>
        )}

        {/* Progress Bar Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-800/60 z-30">
          <div
            className="h-full bg-emerald-500 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Vertical Swipe Navigation Arrows (Desktop / Touch assist) */}
        <div className="absolute right-3 top-16 flex flex-col gap-2 z-20">
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
          {currentIndex < shorts.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Floating Action Icons */}
        <div
          className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Like */}
          <button
            onClick={handleToggleLike}
            className="flex flex-col items-center gap-1 text-white group"
          >
            <div
              className={`p-2.5 rounded-full backdrop-blur-md transition ${
                isLiked ? 'bg-red-600/90 text-white scale-110' : 'bg-black/60 group-hover:bg-black/80'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
            </div>
            <span className="text-[11px] font-bold shadow-sm">{currentShort.likesCount || 0}</span>
          </button>

          {/* Comments */}
          <button
            onClick={() => setCommentsDrawerOpen(true)}
            className="flex flex-col items-center gap-1 text-white group"
          >
            <div className="p-2.5 rounded-full bg-black/60 group-hover:bg-black/80 backdrop-blur-md transition">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold shadow-sm">{currentShort.commentsCount || 0}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 text-white group"
          >
            <div className="p-2.5 rounded-full bg-black/60 group-hover:bg-black/80 backdrop-blur-md transition">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Share</span>
          </button>

          {/* Call Seller */}
          <button
            onClick={handleCall}
            className="flex flex-col items-center gap-1 text-white group"
            title="Call Farmer"
          >
            <div className="p-2.5 rounded-full bg-emerald-600/90 hover:bg-emerald-500 backdrop-blur-md transition shadow-lg shadow-emerald-950/80">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-300">Call</span>
          </button>

          {/* WhatsApp Seller */}
          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center gap-1 text-white group"
            title="WhatsApp Farmer"
          >
            <div className="p-2.5 rounded-full bg-green-600/90 hover:bg-green-500 backdrop-blur-md transition shadow-lg shadow-green-950/80">
              <span className="text-xs font-black">WA</span>
            </div>
            <span className="text-[10px] font-bold text-green-300">Chat</span>
          </button>
        </div>

        {/* Bottom Overlay Info */}
        <div
          className="absolute bottom-3 left-3 right-16 z-20 flex flex-col gap-1.5 text-left text-white drop-shadow-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Farmer & Location */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-700/80 border border-emerald-400/80 flex items-center justify-center font-bold text-xs">
              {currentShort.sellerName.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-xs text-stone-100 flex items-center gap-1">
              {currentShort.sellerName}
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="flex items-center gap-0.5 text-[11px] text-stone-300">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span className="truncate max-w-[120px]">{currentShort.location}</span>
            </div>
          </div>

          {/* Breed & Caption */}
          <p className="text-xs font-semibold text-emerald-300 leading-snug">
            {currentShort.breed} {currentShort.category === 'goat' ? '🐐' : '🐑'}
          </p>
          <p className="text-xs text-stone-200 line-clamp-2 leading-relaxed">
            {currentShort.caption || 'Live animal showcase on SRA Goat for Sale Hyderabad.'}
          </p>

          {/* Link to Animal Listing */}
          {currentShort.listingId && (
            <button
              onClick={() => onOpenListing(currentShort.listingId!)}
              className="mt-1 self-start flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Full Listing & Price</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Comments Drawer */}
      {commentsDrawerOpen && (
        <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md p-4 flex flex-col animate-slideUp">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <h3 className="text-sm font-bold text-white">Comments ({comments.length})</h3>
            <button
              onClick={() => setCommentsDrawerOpen(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {comments.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-6">
                No comments yet. Ask the farmer a question about this animal!
              </p>
            ) : (
              comments.map((cm) => (
                <div key={cm.id} className="text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-200">{cm.userName}</span>
                    <span className="text-[10px] text-stone-500">
                      {new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-stone-300 leading-relaxed">{cm.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="pt-2 border-t border-stone-800 flex items-center gap-2">
            <input
              type="text"
              required
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={currentUser ? 'Write a comment or ask price...' : 'Login to comment'}
              disabled={!currentUser || submittingComment}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-800 text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!currentUser || !newCommentText.trim() || submittingComment}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
