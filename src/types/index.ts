export type AnimalCategory = 'goat' | 'sheep';

export type GoatSubcategory =
  | 'indian_breed'
  | 'female_goat'
  | 'male_goat'
  | 'exotic_goat'
  | 'kid';

export type SheepSubcategory =
  | 'indian_breed'
  | 'ram'
  | 'ewe'
  | 'exotic_sheep'
  | 'lamb';

export type AnimalSubcategory = GoatSubcategory | SheepSubcategory;

export type AnimalGender = 'male' | 'female';

export type ListingStatus = 'draft' | 'published' | 'available' | 'sold' | 'deleted';

export type UserRole = 'USER' | 'ADMIN';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED';

export interface UserProfile {
  id: string; // Auth UID
  phoneNumber: string;
  name: string;
  farmerName?: string;
  farmName?: string;
  photoUrl?: string;
  farmPhotoUrl?: string;
  villageArea?: string;
  city?: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AnimalListing {
  id: string;
  category: AnimalCategory;
  subcategory: AnimalSubcategory;
  breed: string;
  title: string;
  name?: string;
  gender: AnimalGender;
  ageMonths: number;
  teethCount?: number; // 0=Adant, 2, 4, 6, 8=Full
  weightKg?: number;
  price: number;
  isNegotiable: boolean;
  location: string;
  villageArea: string;
  city: string;
  lat?: number;
  lng?: number;
  description: string;
  sellerId: string;
  sellerName: string;
  farmerName?: string;
  phoneNumber: string;
  whatsAppNumber: string;
  farmerPhotoUrl?: string;
  farmPhotoUrl?: string;
  photos: string[];
  videoUrl?: string;
  status: ListingStatus;
  viewsCount: number;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnimalShort {
  id: string;
  title: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl?: string;
  listingId?: string;
  sellerId: string;
  sellerName: string;
  farmerPhotoUrl?: string;
  breed: string;
  category: AnimalCategory;
  location: string;
  phoneNumber: string;
  whatsAppNumber: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isFeatured?: boolean;
  status: 'active' | 'hidden' | 'deleted';
  createdAt: string;
}

export interface ShortComment {
  id: string;
  shortId: string;
  userId: string;
  userName: string;
  userPhotoUrl?: string;
  text: string;
  createdAt: string;
}

export interface ShortLike {
  id: string; // `${shortId}_${userId}`
  shortId: string;
  userId: string;
  createdAt: string;
}

export interface UserFavorite {
  id: string; // `${userId}_${listingId}`
  userId: string;
  listingId: string;
  createdAt: string;
}

export interface AnimalBreed {
  id: string;
  name: string;
  category: AnimalCategory;
  origin: string;
  description: string;
  isExotic: boolean;
  popularity: number;
}

export interface AdminSettings {
  id: string;
  contactPhone: string;
  contactWhatsApp: string;
  contactEmail: string;
  announcementText: string;
  showAnnouncement: boolean;
  adSenseClientId: string;
  adSenseSlotId: string;
  adMobBannerId: string;
  adMobInterstitialId: string;
  adsEnabled: boolean;
  updatedAt?: string;
}

export interface SearchFilterState {
  keyword: string;
  category: AnimalCategory | 'all';
  subcategory: string;
  breed: string;
  gender: 'all' | 'male' | 'female';
  minPrice: number;
  maxPrice: number;
  maxAgeMonths: number;
  location: string;
  status: 'all' | 'available' | 'sold';
  sortBy: 'newest' | 'price_low' | 'price_high' | 'views' | 'nearby';
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
  areaName: string;
  permissionGranted: boolean;
}
