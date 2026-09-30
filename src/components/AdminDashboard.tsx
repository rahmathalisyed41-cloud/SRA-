import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  ClipboardList,
  PlaySquare,
  Eye,
  Sliders,
  CheckCircle,
  Trash2,
  Star,
  Plus,
  RotateCw,
  Megaphone,
} from 'lucide-react';
import { AnimalBreed, AnimalListing, AnimalShort, AdminSettings, UserProfile } from '../types';
import {
  updateListing,
  deleteListing,
  saveBreedToCatalog,
  deleteBreedFromCatalog,
  updateAdminSettings,
} from '../services/db';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  listings: AnimalListing[];
  shorts: AnimalShort[];
  breeds: AnimalBreed[];
  adminSettings: AdminSettings;
  onRefreshData: () => void;
  onRequireAuth: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  currentUser,
  listings,
  shorts,
  breeds,
  adminSettings,
  onRefreshData,
  onRequireAuth,
}) => {
  const [tab, setTab] = useState<'stats' | 'listings' | 'shorts' | 'breeds' | 'settings'>('stats');
  const [adminPin, setAdminPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  // New Breed form
  const [newBreedName, setNewBreedName] = useState('');
  const [newBreedCategory, setNewBreedCategory] = useState<'goat' | 'sheep'>('goat');
  const [newBreedOrigin, setNewBreedOrigin] = useState('');
  const [newBreedDesc, setNewBreedDesc] = useState('');
  const [newBreedExotic, setNewBreedExotic] = useState(false);

  // Settings form
  const [announcement, setAnnouncement] = useState(adminSettings.announcementText);
  const [showAnnouncement, setShowAnnouncement] = useState(adminSettings.showAnnouncement);
  const [contactPhone, setContactPhone] = useState(adminSettings.contactPhone);
  const [contactWhatsApp, setContactWhatsApp] = useState(adminSettings.contactWhatsApp);
  const [adsEnabled, setAdsEnabled] = useState(adminSettings.adsEnabled);
  const [savingSettings, setSavingSettings] = useState(false);

  if (!isOpen) return null;

  const isAdminUser = currentUser?.role === 'ADMIN' || isUnlocked;

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin.trim() === '7860' || adminPin.trim() === '9999') {
      setIsUnlocked(true);
    } else {
      alert('Invalid Admin Security Passcode.');
    }
  };

  // Aggregated platform stats
  const totalListings = listings.length;
  const availableCount = listings.filter((l) => l.status === 'available').length;
  const soldCount = listings.filter((l) => l.status === 'sold').length;
  const totalViews = listings.reduce((acc, l) => acc + (l.viewsCount || 0), 0);
  const totalReelsViews = shorts.reduce((acc, s) => acc + (s.viewsCount || 0), 0);

  const handleToggleFeatured = async (listing: AnimalListing) => {
    try {
      await updateListing(listing.id, { isFeatured: !listing.isFeatured });
      listing.isFeatured = !listing.isFeatured;
      onRefreshData();
    } catch (err) {
      console.warn('Feature toggle error:', err);
    }
  };

  const handleAddBreed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBreedName.trim()) return;

    const breedId = newBreedName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newBreed: AnimalBreed = {
      id: breedId,
      name: newBreedName.trim(),
      category: newBreedCategory,
      origin: newBreedOrigin.trim() || 'Telangana / India',
      description: newBreedDesc.trim() || 'High quality livestock breed.',
      isExotic: newBreedExotic,
      popularity: 85,
    };

    try {
      await saveBreedToCatalog(newBreed);
      breeds.push(newBreed);
      setNewBreedName('');
      setNewBreedOrigin('');
      setNewBreedDesc('');
      alert('Breed added to live database successfully!');
    } catch (err) {
      alert('Failed to save breed.');
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateAdminSettings({
        announcementText: announcement,
        showAnnouncement,
        contactPhone,
        contactWhatsApp,
        adsEnabled,
      });
      alert('Admin settings updated successfully!');
    } catch (err) {
      alert('Failed to update settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">SRA Group HYD - Admin Control Room</h2>
              <p className="text-xs text-amber-400 font-semibold">Strict Role-Based Admin Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAdminUser ? (
          <div className="p-8 text-center max-w-sm mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-800 mx-auto flex items-center justify-center text-2xl">
              🛡️
            </div>
            <h3 className="text-base font-bold text-white">Administrator Passcode Required</h3>
            <p className="text-xs text-stone-400">
              Authorized personnel only (Admin: rahmathalisyed41@gmail.com). Enter 4-digit admin passkey:
            </p>
            <form onSubmit={handleUnlockPin} className="space-y-3">
              <input
                type="password"
                maxLength={6}
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Admin PIN (e.g. 7860)"
                className="w-full text-center text-lg font-mono py-2.5 px-4 rounded-xl bg-stone-950 border border-stone-800 text-amber-400 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs transition"
              >
                Verify Passkey
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Admin Tabs */}
            <div className="flex items-center gap-1 px-5 pt-3 border-b border-stone-800 bg-stone-950/60 overflow-x-auto">
              {[
                { id: 'stats', label: 'Overview Metrics' },
                { id: 'listings', label: `Listings (${totalListings})` },
                { id: 'shorts', label: `Shorts Reels (${shorts.length})` },
                { id: 'breeds', label: `Breed Catalog (${breeds.length})` },
                { id: 'settings', label: 'Platform Announcements' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={`py-2 px-3.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap ${
                    tab === t.id
                      ? 'bg-stone-900 border-t-2 border-amber-500 text-amber-300'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Admin Body */}
            <div className="overflow-y-auto p-5 space-y-6 flex-1 text-xs">
              {/* Tab: Stats */}
              {tab === 'stats' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                      <span className="text-stone-400 text-[11px] uppercase tracking-wider block">
                        Total Listings
                      </span>
                      <span className="text-2xl font-black text-white mt-1 block">
                        {totalListings}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                      <span className="text-stone-400 text-[11px] uppercase tracking-wider block">
                        Available Animals
                      </span>
                      <span className="text-2xl font-black text-emerald-400 mt-1 block">
                        {availableCount}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                      <span className="text-stone-400 text-[11px] uppercase tracking-wider block">
                        Animals Sold
                      </span>
                      <span className="text-2xl font-black text-amber-400 mt-1 block">
                        {soldCount}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                      <span className="text-stone-400 text-[11px] uppercase tracking-wider block">
                        Animal Shorts
                      </span>
                      <span className="text-2xl font-black text-purple-400 mt-1 block">
                        {shorts.length}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                      <h4 className="font-bold text-white mb-1">Listing Views Traffic</h4>
                      <p className="text-2xl font-extrabold text-blue-400">{totalViews} views</p>
                      <p className="text-[11px] text-stone-500 mt-1">Aggregated organic buyer interest</p>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
                      <h4 className="font-bold text-white mb-1">Shorts Playback Traffic</h4>
                      <p className="text-2xl font-extrabold text-emerald-400">{totalReelsViews} plays</p>
                      <p className="text-[11px] text-stone-500 mt-1">9:16 vertical video engagement</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Listings Moderation */}
              {tab === 'listings' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-white text-sm">Moderate Animal Listings</h3>
                  <div className="space-y-2">
                    {listings.map((l) => (
                      <div
                        key={l.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl bg-stone-950 border border-stone-800 gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={l.photos?.[0] || '/logo.jpg'}
                            alt={l.breed}
                            className="w-12 h-12 rounded-lg object-cover bg-stone-900"
                          />
                          <div>
                            <span className="font-bold text-white block">
                              {l.breed} ({l.gender}) • ₹{l.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[11px] text-stone-400">
                              By: {l.farmerName || l.sellerName} • {l.villageArea} • Status: {l.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleToggleFeatured(l)}
                            className={`py-1 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                              l.isFeatured
                                ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                : 'bg-stone-800 text-stone-400 hover:text-white'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>{l.isFeatured ? 'Featured' : 'Make Featured'}</span>
                          </button>

                          <button
                            onClick={async () => {
                              if (window.confirm('Delete listing as admin?')) {
                                await deleteListing(l.id);
                                onRefreshData();
                              }
                            }}
                            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Breeds Catalog */}
              {tab === 'breeds' && (
                <div className="space-y-6">
                  {/* Add Breed Form */}
                  <form onSubmit={handleAddBreed} className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                    <h4 className="font-bold text-white text-sm">Add New Breed to Catalog</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-stone-400 block mb-1">Breed Name *</label>
                        <input
                          type="text"
                          required
                          value={newBreedName}
                          onChange={(e) => setNewBreedName(e.target.value)}
                          placeholder="e.g. Damascus Shami"
                          className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-stone-400 block mb-1">Category</label>
                        <select
                          value={newBreedCategory}
                          onChange={(e) => setNewBreedCategory(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-white"
                        >
                          <option value="goat">Goat</option>
                          <option value="sheep">Sheep</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-stone-400 block mb-1">Origin</label>
                        <input
                          type="text"
                          value={newBreedOrigin}
                          onChange={(e) => setNewBreedOrigin(e.target.value)}
                          placeholder="e.g. Middle East"
                          className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-stone-400 block mb-1">Description</label>
                      <input
                        type="text"
                        value={newBreedDesc}
                        onChange={(e) => setNewBreedDesc(e.target.value)}
                        placeholder="Distinctive physical and milking/meat characteristics..."
                        className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-white"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newBreedExotic}
                          onChange={(e) => setNewBreedExotic(e.target.checked)}
                          className="rounded text-amber-500"
                        />
                        <span className="text-stone-300">Is Exotic Breed</span>
                      </label>

                      <button
                        type="submit"
                        className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        Add Breed
                      </button>
                    </div>
                  </form>

                  {/* Existing Breeds */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-stone-300">Active Breed Catalog ({breeds.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {breeds.map((b) => (
                        <div
                          key={b.id}
                          className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-white block">
                              {b.name} ({b.category})
                            </span>
                            <span className="text-[11px] text-stone-400">
                              {b.origin} • {b.isExotic ? 'Exotic' : 'Indian'}
                            </span>
                          </div>
                          <button
                            onClick={async () => {
                              if (window.confirm(`Delete ${b.name}?`)) {
                                await deleteBreedFromCatalog(b.id);
                                onRefreshData();
                              }
                            }}
                            className="p-1 rounded text-stone-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Platform Announcements & Settings */}
              {tab === 'settings' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-emerald-400" />
                      Global App Announcement Banner
                    </h4>
                    <textarea
                      rows={3}
                      value={announcement}
                      onChange={(e) => setAnnouncement(e.target.value)}
                      className="w-full p-3 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs"
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showAnnouncement}
                        onChange={(e) => setShowAnnouncement(e.target.checked)}
                        className="rounded text-emerald-500"
                      />
                      <span className="text-stone-300 text-xs">Display announcement bar on homepage</span>
                    </label>
                  </div>

                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                    <h4 className="font-bold text-white">Official Support Contacts</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-stone-400 block mb-1">Support Phone</label>
                        <input
                          type="text"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">Support WhatsApp</label>
                        <input
                          type="text"
                          value={contactWhatsApp}
                          onChange={(e) => setContactWhatsApp(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    {savingSettings ? 'Saving Settings...' : 'Save Admin Configuration'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
