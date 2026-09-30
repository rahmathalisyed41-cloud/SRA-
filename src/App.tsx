import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeFeed } from './components/HomeFeed';
import { ShortsFeed } from './components/ShortsFeed';
import { ListingDetailModal } from './components/ListingDetailModal';
import { SellAnimalModal } from './components/SellAnimalModal';
import { UploadShortModal } from './components/UploadShortModal';
import { MyListingsView } from './components/MyListingsView';
import { ProfileView } from './components/ProfileView';
import { SearchFilterModal } from './components/SearchFilterModal';
import { AuthModal } from './components/AuthModal';
import { LocationPermissionModal } from './components/LocationPermissionModal';
import { FarmerPublicProfileModal } from './components/FarmerPublicProfileModal';
import { AdminDashboard } from './components/AdminDashboard';
import { HelpCenterModal } from './components/HelpCenterModal';
import { LegalModal } from './components/LegalModal';

import {
  AnimalCategory,
  AnimalListing,
  AnimalShort,
  AnimalBreed,
  AdminSettings,
  SearchFilterState,
  UserProfile,
} from './types';
import { INITIAL_BREEDS } from './data/initialBreeds';
import {
  subscribeToListings,
  subscribeToShorts,
  getBreedsCatalog,
  getAdminSettings,
  toggleFavorite,
  fetchUserFavorites,
  getCachedListings,
  getCachedShorts,
} from './services/db';
import { playBleatOnceOnSession } from './services/audio';
import { testConnection } from './config/firebase';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'home' | 'shorts' | 'sell' | 'my-listings' | 'profile'>('home');
  const [currentArea, setCurrentArea] = useState('Hyderabad & Telangana');

  // Core Data
  const [listings, setListings] = useState<AnimalListing[]>(() => getCachedListings());
  const [shorts, setShorts] = useState<AnimalShort[]>(() => getCachedShorts());
  const [breeds, setBreeds] = useState<AnimalBreed[]>(INITIAL_BREEDS);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    id: 'global',
    contactPhone: '+919876543210',
    contactWhatsApp: '+919876543210',
    contactEmail: 'rahmathalisyed41@gmail.com',
    announcementText: 'Welcome to SRA Goat for Sale Hyderabad. Verified livestock farmers only. Direct farmer-buyer deals!',
    showAnnouncement: true,
    adSenseClientId: 'ca-pub-test-sra-hyd-12345',
    adSenseSlotId: '1234567890',
    adMobBannerId: 'ca-app-pub-3940256099942544/6300978111',
    adMobInterstitialId: 'ca-app-pub-3940256099942544/1033173712',
    adsEnabled: true,
  });

  // Current User Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('sra_active_user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Favorites
  const [favorites, setFavorites] = useState<string[]>([]);

  // Category & Filter State
  const [selectedCategory, setSelectedCategory] = useState<AnimalCategory | 'all'>('all');
  const [selectedBreed, setSelectedBreed] = useState<string>('');
  const [searchFilters, setSearchFilters] = useState<SearchFilterState>({
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
  });

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [uploadShortModalOpen, setUploadShortModalOpen] = useState(false);
  const [activeListingDetail, setActiveListingDetail] = useState<AnimalListing | null>(null);
  const [editingListing, setEditingListing] = useState<AnimalListing | null>(null);
  const [publicFarmerId, setPublicFarmerId] = useState<string | null>(null);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);

  // Initialize once on boot: audio bleat trigger & test connection
  useEffect(() => {
    testConnection();
    playBleatOnceOnSession();

    // Load dynamic breeds and settings
    getBreedsCatalog().then(setBreeds);
    getAdminSettings().then(setAdminSettings);
  }, []);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubListings = subscribeToListings(searchFilters, (items) => {
      setListings(items);
    });

    const unsubShorts = subscribeToShorts((items) => {
      setShorts(items);
    });

    return () => {
      unsubListings();
      unsubShorts();
    };
  }, [searchFilters]);

  // Load user favorites
  useEffect(() => {
    if (currentUser) {
      fetchUserFavorites(currentUser.id).then(setFavorites);
    } else {
      setFavorites([]);
    }
  }, [currentUser]);

  // Handle Tab Switch
  const handleTabChange = (tab: 'home' | 'shorts' | 'sell' | 'my-listings' | 'profile') => {
    if (tab === 'sell') {
      if (!currentUser) {
        setAuthModalOpen(true);
      } else {
        setEditingListing(null);
        setSellModalOpen(true);
      }
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = async (listingId: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    const isCurrently = favorites.includes(listingId);
    // Optimistic
    setFavorites((prev) => (isCurrently ? prev.filter((id) => id !== listingId) : [...prev, listingId]));
    try {
      await toggleFavorite(currentUser.id, listingId, isCurrently);
    } catch {
      // Revert on fail
      setFavorites((prev) => (isCurrently ? [...prev, listingId] : prev.filter((id) => id !== listingId)));
    }
  };

  // Applied Search / Filters handler
  const handleApplyFilters = (filters: SearchFilterState) => {
    setSearchFilters(filters);
    setSelectedCategory(filters.category);
    setSelectedBreed(filters.breed);
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        currentArea={currentArea}
        onOpenLocationModal={() => setLocationModalOpen(true)}
        onOpenSearchModal={() => setSearchModalOpen(true)}
        onOpenSellModal={() => {
          if (!currentUser) {
            setAuthModalOpen(true);
          } else {
            setEditingListing(null);
            setSellModalOpen(true);
          }
        }}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        currentUser={currentUser}
        onOpenProfile={() => setActiveTab('profile')}
        onOpenAdmin={() => setAdminDashboardOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full">
        {activeTab === 'home' && (
          <HomeFeed
            listings={listings}
            shorts={shorts}
            breeds={breeds}
            adminSettings={adminSettings}
            currentArea={currentArea}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            selectedBreed={selectedBreed}
            onSelectBreed={(breed) => setSelectedBreed(breed)}
            onOpenListing={(listing) => setActiveListingDetail(listing)}
            onOpenShortsFeed={() => setActiveTab('shorts')}
            onOpenSellModal={() => {
              if (!currentUser) {
                setAuthModalOpen(true);
              } else {
                setEditingListing(null);
                setSellModalOpen(true);
              }
            }}
            onOpenSearchModal={() => setSearchModalOpen(true)}
            onOpenLocationModal={() => setLocationModalOpen(true)}
            onOpenFarmerProfile={(sellerId) => setPublicFarmerId(sellerId)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === 'shorts' && (
          <div className="py-2 sm:py-6 px-0 sm:px-4">
            <ShortsFeed
              shorts={shorts}
              currentUser={currentUser}
              onOpenListing={(listingId) => {
                const found = listings.find((l) => l.id === listingId);
                if (found) {
                  setActiveListingDetail(found);
                }
              }}
              onOpenUploadShort={() => {
                if (!currentUser) {
                  setAuthModalOpen(true);
                } else {
                  setUploadShortModalOpen(true);
                }
              }}
              onRequireAuth={() => setAuthModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'my-listings' && (
          <MyListingsView
            listings={listings}
            currentUser={currentUser}
            onOpenSellModal={() => {
              setEditingListing(null);
              setSellModalOpen(true);
            }}
            onEditListing={(listing) => {
              setEditingListing(listing);
              setSellModalOpen(true);
            }}
            onListingDetail={(listing) => setActiveListingDetail(listing)}
            onRequireAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            listings={listings}
            favorites={favorites}
            onOpenMyListings={() => setActiveTab('my-listings')}
            onOpenHelp={() => setHelpCenterOpen(true)}
            onOpenLegal={() => setLegalModalOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
            onListingDetail={(listing) => setActiveListingDetail(listing)}
            onLogout={() => {
              setCurrentUser(null);
              setActiveTab('home');
            }}
          />
        )}
      </main>

      {/* 2030 Modern Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        unreadShortsCount={shorts.length}
      />

      {/* MODALS */}
      {/* 1. Phone Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user: UserProfile) => {
          setCurrentUser(user);
          setAuthModalOpen(false);
        }}
      />

      {/* 2. Location Permission Modal */}
      <LocationPermissionModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        currentArea={currentArea}
        onSelectArea={(area) => setCurrentArea(area)}
      />

      {/* 3. Search & Filter Modal */}
      <SearchFilterModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        filters={searchFilters}
        onApplyFilters={handleApplyFilters}
      />

      {/* 4. Sell Animal Form Modal */}
      <SellAnimalModal
        isOpen={sellModalOpen}
        onClose={() => {
          setSellModalOpen(false);
          setEditingListing(null);
        }}
        currentUser={currentUser}
        editingListing={editingListing}
        onListingCreated={(newListing) => {
          setListings((prev) => {
            const exists = prev.some((l) => l.id === newListing.id);
            if (exists) {
              return prev.map((l) => (l.id === newListing.id ? newListing : l));
            }
            return [newListing, ...prev];
          });
          setActiveListingDetail(newListing);
        }}
        onRequireAuth={() => setAuthModalOpen(true)}
      />

      {/* 5. Upload Animal Short Modal */}
      <UploadShortModal
        isOpen={uploadShortModalOpen}
        onClose={() => setUploadShortModalOpen(false)}
        currentUser={currentUser}
        userListings={listings.filter((l) => l.sellerId === currentUser?.id)}
        onShortCreated={(newShort) => {
          setShorts((prev) => [newShort, ...prev]);
          setActiveTab('shorts');
        }}
        onRequireAuth={() => setAuthModalOpen(true)}
      />

      {/* 6. Animal Detail Modal */}
      <ListingDetailModal
        listing={activeListingDetail}
        onClose={() => setActiveListingDetail(null)}
        isFavorited={activeListingDetail ? favorites.includes(activeListingDetail.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onOpenFarmerProfile={(sellerId) => setPublicFarmerId(sellerId)}
      />

      {/* 7. Public Farmer Profile Modal */}
      <FarmerPublicProfileModal
        sellerId={publicFarmerId}
        onClose={() => setPublicFarmerId(null)}
        listings={listings}
        shorts={shorts}
        onOpenListing={(listing) => setActiveListingDetail(listing)}
      />

      {/* 8. Admin Dashboard */}
      <AdminDashboard
        isOpen={adminDashboardOpen}
        onClose={() => setAdminDashboardOpen(false)}
        currentUser={currentUser}
        listings={listings}
        shorts={shorts}
        breeds={breeds}
        adminSettings={adminSettings}
        onRefreshData={() => {
          getBreedsCatalog().then(setBreeds);
          getAdminSettings().then(setAdminSettings);
        }}
        onRequireAuth={() => setAuthModalOpen(true)}
      />

      {/* 9. Help Center Modal */}
      <HelpCenterModal
        isOpen={helpCenterOpen}
        onClose={() => setHelpCenterOpen(false)}
        adminSettings={adminSettings}
      />

      {/* 10. Legal & Disclaimer Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
      />
    </div>
  );
}
