import React, { useState } from 'react';
import { X, Video, Upload, AlertCircle, RotateCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AnimalCategory, AnimalListing, AnimalShort, UserProfile } from '../types';
import { createShort } from '../services/db';
import { INITIAL_BREEDS, HYDERABAD_AREAS } from '../data/initialBreeds';

interface UploadShortModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  userListings: AnimalListing[];
  onShortCreated: (short: AnimalShort) => void;
  onRequireAuth: () => void;
}

export const UploadShortModal: React.FC<UploadShortModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userListings,
  onShortCreated,
  onRequireAuth,
}) => {
  const [selectedListingId, setSelectedListingId] = useState('');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<AnimalCategory>('goat');
  const [breed, setBreed] = useState('Jamnapari');
  const [location, setLocation] = useState('Hyderabad');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectListing = (listingId: string) => {
    setSelectedListingId(listingId);
    const found = userListings.find((l) => l.id === listingId);
    if (found) {
      setTitle(`${found.breed} ${found.gender}`);
      setCategory(found.category);
      setBreed(found.breed);
      setLocation(found.villageArea || found.location);
      if (found.videoUrl) {
        setVideoUrl(found.videoUrl);
      }
      setCaption(`Check out this healthy ${found.breed} available in ${found.villageArea}! Direct farmer deal.`);
    }
  };

  const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      alert('Video file size exceeds 30MB limit. Please choose a 15-45s vertical video clip.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvt) => {
      const base64 = uploadEvt.target?.result as string;
      if (base64) {
        setVideoUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (!videoUrl) {
      setErrorMsg('Please upload a 9:16 vertical animal video.');
      return;
    }

    setLoading(true);

    try {
      const newShort = await createShort({
        title: title.trim() || `${breed} Reel`,
        caption: caption.trim() || `Live ${breed} showcase in ${location}`,
        videoUrl,
        thumbnailUrl: currentUser.farmPhotoUrl || '/logo.jpg',
        listingId: selectedListingId || undefined,
        sellerId: currentUser.id,
        sellerName: currentUser.farmerName || currentUser.name || 'SRA Farmer',
        farmerPhotoUrl: currentUser.photoUrl,
        breed,
        category,
        location,
        phoneNumber: currentUser.phoneNumber || '+919876543210',
        whatsAppNumber: currentUser.phoneNumber || '+919876543210',
        status: 'active',
      });

      onShortCreated(newShort);
      setLoading(false);
      onClose();
    } catch (err: unknown) {
      setLoading(false);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to publish Animal Short. Please retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950/80">
          <div>
            <h2 className="text-base font-bold text-white">Upload Animal Short Reel</h2>
            <p className="text-xs text-emerald-400 font-medium">9:16 Vertical Video Feed</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 flex items-start gap-2 text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Connect to Existing Listing (Optional) */}
          {userListings.length > 0 && (
            <div>
              <label className="font-semibold text-stone-300 block mb-1">
                Link to Your Existing Animal Listing (Optional)
              </label>
              <select
                value={selectedListingId}
                onChange={(e) => handleSelectListing(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Standalone Short Reel --</option>
                {userListings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.breed} ({l.gender}, ₹{l.price.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Video Upload Area */}
          <div>
            <label className="font-semibold text-stone-300 block mb-1">
              Select Vertical 9:16 Animal Video (Max 30MB) *
            </label>

            {videoUrl ? (
              <div className="relative aspect-[9/12] w-48 mx-auto rounded-xl overflow-hidden border border-emerald-500/50 bg-black">
                <video src={videoUrl} controls autoPlay loop muted className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-stone-800 hover:border-emerald-500/80 rounded-2xl bg-stone-950 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition text-stone-400 hover:text-emerald-400 text-center">
                <Video className="w-8 h-8 text-emerald-500" />
                <span className="font-bold text-stone-200">Tap to choose 9:16 video</span>
                <span className="text-[11px] text-stone-500">Short video showing the live animal active in the pen</span>
                <input type="file" accept="video/*" onChange={handleVideoFile} className="hidden" />
              </label>
            )}
          </div>

          {/* Animal Category & Breed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-stone-300 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AnimalCategory)}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none"
              >
                <option value="goat">Goat (Bakri / Bakra)</option>
                <option value="sheep">Sheep (Mendha / Bhed)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-300 block mb-1">Breed Name</label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none"
              >
                {INITIAL_BREEDS.filter((b) => b.category === category).map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Area */}
          <div>
            <label className="font-semibold text-stone-300 block mb-1">Hyderabad Area</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none"
            >
              {HYDERABAD_AREAS.filter((a) => !a.startsWith('All')).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Caption */}
          <div>
            <label className="font-semibold text-stone-300 block mb-1">Caption / Short Description</label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Pure Boer cross buckling showing excellent active health. Call for farm visit."
              className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Strict Content Notice */}
          <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Real animal videos only. The animal must remain visually an animal. Videos depicting animal cruelty, slaughter, cooked meat, or human faces masked as animals are prohibited.
            </span>
          </div>

          {/* Publish Action */}
          <button
            type="submit"
            disabled={loading || !videoUrl}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/80 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                Publishing Reel...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Publish Animal Short
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
