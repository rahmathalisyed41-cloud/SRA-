import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Heart,
  ClipboardList,
  HelpCircle,
  FileText,
  LogOut,
  Edit2,
  ShieldCheck,
  Volume2,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { AnimalListing, UserProfile } from '../types';
import { updateUserProfile, logoutUser } from '../services/auth';
import { playGoatBleatSound } from '../services/audio';

interface ProfileViewProps {
  currentUser: UserProfile | null;
  listings: AnimalListing[];
  favorites: string[];
  onOpenMyListings: () => void;
  onOpenHelp: () => void;
  onOpenLegal: () => void;
  onOpenAuth: () => void;
  onListingDetail: (listing: AnimalListing) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  listings,
  favorites,
  onOpenMyListings,
  onOpenHelp,
  onOpenLegal,
  onOpenAuth,
  onListingDetail,
  onLogout,
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [farmerName, setFarmerName] = useState(currentUser?.farmerName || '');
  const [villageArea, setVillageArea] = useState(currentUser?.villageArea || 'Hyderabad');
  const [saving, setSaving] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-stone-900 border border-stone-800 mx-auto flex items-center justify-center text-3xl mb-4">
          👤
        </div>
        <h2 className="text-xl font-black text-white">Farmer & Buyer Account</h2>
        <p className="text-xs text-stone-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
          Sign in using your mobile number and SMS OTP to create animal ads, post reels, save favorite animals, and track deals.
        </p>
        <button
          onClick={onOpenAuth}
          className="mt-6 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition"
        >
          Sign In with Mobile OTP
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(currentUser.id, {
        name: name.trim() || currentUser.name,
        farmerName: farmerName.trim() || name.trim(),
        villageArea: villageArea.trim(),
      });
      currentUser.name = name.trim() || currentUser.name;
      currentUser.farmerName = farmerName.trim() || currentUser.name;
      currentUser.villageArea = villageArea.trim();
      setEditing(false);
    } catch (err) {
      console.warn('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const myListingCount = listings.filter((l) => l.sellerId === currentUser.id && l.status !== 'deleted').length;
  const favoritedListings = listings.filter((l) => favorites.includes(l.id));

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Card */}
      <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500/60 flex items-center justify-center text-emerald-300 font-extrabold text-2xl shadow-lg shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-extrabold text-white">{currentUser.name}</h2>
                {currentUser.role === 'ADMIN' ? (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    ADMIN
                  </span>
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
              </div>

              <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-emerald-500" />
                <span>{currentUser.phoneNumber}</span>
              </p>

              <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-500" />
                <span>{currentUser.villageArea || 'Hyderabad, Telangana'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
            title="Edit Profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Edit Profile Form Drawer */}
        {editing && (
          <form onSubmit={handleSaveProfile} className="mt-4 pt-4 border-t border-stone-800 space-y-3 text-xs">
            <div>
              <label className="font-semibold text-stone-300 block mb-1">Your Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-300 block mb-1">Farm / Trader Trade Name</label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="e.g. Hyderabad Goat Breeders Farm"
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-300 block mb-1">Village / Colony in Hyderabad</label>
              <input
                type="text"
                value={villageArea}
                onChange={(e) => setVillageArea(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="py-2 px-3 rounded-xl bg-stone-800 text-stone-300 text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Account Shortcuts */}
      <div className="space-y-2">
        {/* My Listings */}
        <button
          onClick={onOpenMyListings}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-left transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">My Animal Listings</span>
              <span className="text-[11px] text-stone-400">{myListingCount} listings published</span>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-semibold">Manage &gt;</span>
        </button>

        {/* Bleat Sound Tester */}
        <button
          onClick={() => playGoatBleatSound()}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-left transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Test App Sound (Goat Bleat)</span>
              <span className="text-[11px] text-stone-400">Tap to hear short goat sound</span>
            </div>
          </div>
          <span className="text-xs text-amber-400 font-semibold">Play sound</span>
        </button>

        {/* Help Center */}
        <button
          onClick={onOpenHelp}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-left transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-950 text-blue-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Help Center & FAQ</span>
              <span className="text-[11px] text-stone-400">Selling tips, contact SRA Admin</span>
            </div>
          </div>
          <span className="text-xs text-stone-400 font-semibold">&gt;</span>
        </button>

        {/* Legal, Disclaimer & Privacy */}
        <button
          onClick={onOpenLegal}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-left transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-stone-800 text-stone-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Marketplace Disclaimer & Terms</span>
              <span className="text-[11px] text-stone-400">Live animal discovery policies</span>
            </div>
          </div>
          <span className="text-xs text-stone-400 font-semibold">&gt;</span>
        </button>

        {/* Logout */}
        <button
          onClick={async () => {
            await logoutUser();
            onLogout();
          }}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-left transition text-red-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-950 text-red-400">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs">Sign Out (Logout)</span>
          </div>
        </button>
      </div>

      {/* Saved / Favorited Animals Section */}
      {favoritedListings.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-stone-800">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">
              Saved Favorite Animals ({favoritedListings.length})
            </h3>
          </div>

          <div className="space-y-2">
            {favoritedListings.map((l) => (
              <div
                key={l.id}
                onClick={() => onListingDetail(l)}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800 hover:border-emerald-600/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={l.photos?.[0] || '/logo.jpg'}
                    alt={l.breed}
                    className="w-12 h-12 rounded-lg object-cover bg-stone-950"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{l.breed}</h4>
                    <p className="text-[11px] text-emerald-400 font-extrabold">
                      ₹{l.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-stone-400">{l.villageArea}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
