import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  onSnapshot,
  QueryConstraint,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../config/firebase';
import {
  AnimalListing,
  AnimalShort,
  ShortComment,
  UserFavorite,
  AnimalBreed,
  AdminSettings,
  SearchFilterState,
  ListingStatus,
} from '../types';
import { INITIAL_BREEDS } from '../data/initialBreeds';

// Local storage key for offline/fallback caching
const LISTINGS_CACHE_KEY = 'sra_listings_cache_v2';
const SHORTS_CACHE_KEY = 'sra_shorts_cache_v2';

// -------------------------------------------------------------
// LISTINGS SERVICES
// -------------------------------------------------------------

export async function createListing(listingData: Omit<AnimalListing, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount'>): Promise<AnimalListing> {
  const listingId = 'list_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const newListing: AnimalListing = {
    ...listingData,
    id: listingId,
    viewsCount: 0,
    status: listingData.status || 'available',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const listingRef = doc(db, 'listings', listingId);
    await setDoc(listingRef, newListing);
    cacheSingleListing(newListing);
    return newListing;
  } catch (error) {
    console.error('Failed to create listing in Firestore:', error);
    // Persist in local storage so user never loses their listing
    cacheSingleListing(newListing);
    handleFirestoreError(error, OperationType.CREATE, `listings/${listingId}`);
    return newListing;
  }
}

export async function updateListing(listingId: string, updates: Partial<AnimalListing>): Promise<void> {
  try {
    const listingRef = doc(db, 'listings', listingId);
    const dataWithTimestamp = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(listingRef, dataWithTimestamp);
    updateCachedListing(listingId, dataWithTimestamp);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `listings/${listingId}`);
  }
}

export async function deleteListing(listingId: string): Promise<void> {
  try {
    const listingRef = doc(db, 'listings', listingId);
    // Mark as deleted for safety or deleteDoc
    await updateDoc(listingRef, {
      status: 'deleted',
      updatedAt: new Date().toISOString(),
    });
    removeCachedListing(listingId);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `listings/${listingId}`);
  }
}

export async function getListingById(listingId: string): Promise<AnimalListing | null> {
  try {
    const listingRef = doc(db, 'listings', listingId);
    const snap = await getDoc(listingRef);
    if (snap.exists()) {
      return snap.data() as AnimalListing;
    }
    // Check local cache
    const cached = getCachedListings();
    return cached.find((l) => l.id === listingId) || null;
  } catch (error) {
    console.warn('Error reading listing, checking cache:', error);
    const cached = getCachedListings();
    return cached.find((l) => l.id === listingId) || null;
  }
}

export async function incrementListingViews(listingId: string): Promise<void> {
  const viewedKey = `viewed_listing_${listingId}`;
  if (sessionStorage.getItem(viewedKey)) return;
  sessionStorage.setItem(viewedKey, '1');

  try {
    const listingRef = doc(db, 'listings', listingId);
    await updateDoc(listingRef, {
      viewsCount: increment(1),
    });
  } catch (err) {
    // Non-critical, ignore
  }
}

export function subscribeToListings(
  filter: Partial<SearchFilterState>,
  callback: (listings: AnimalListing[]) => void
): Unsubscribe {
  const listingsCol = collection(db, 'listings');
  const constraints: QueryConstraint[] = [];

  // Exclude deleted by default unless specified
  if (filter.status && filter.status !== 'all') {
    constraints.push(where('status', '==', filter.status));
  } else {
    constraints.push(where('status', 'in', ['available', 'sold', 'published']));
  }

  if (filter.category && filter.category !== 'all') {
    constraints.push(where('category', '==', filter.category));
  }

  // Order by createdAt descending
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(100));

  const q = query(listingsCol, ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: AnimalListing[] = [];
      snapshot.forEach((d) => items.push(d.data() as AnimalListing));
      saveCachedListings(items);
      callback(items);
    },
    (error) => {
      console.warn('Listing snapshot subscription fallback:', error);
      callback(getCachedListings());
    }
  );
}

export async function fetchUserListings(userId: string): Promise<AnimalListing[]> {
  try {
    const listingsCol = collection(db, 'listings');
    const q = query(listingsCol, where('sellerId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const items: AnimalListing[] = [];
    snapshot.forEach((d) => items.push(d.data() as AnimalListing));
    return items;
  } catch (err) {
    console.warn('User listings query fallback:', err);
    return getCachedListings().filter((l) => l.sellerId === userId);
  }
}

// -------------------------------------------------------------
// SHORTS / REELS SERVICES
// -------------------------------------------------------------

export async function createShort(shortData: Omit<AnimalShort, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'viewsCount'>): Promise<AnimalShort> {
  const shortId = 'short_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const newShort: AnimalShort = {
    ...shortData,
    id: shortId,
    likesCount: 0,
    commentsCount: 0,
    viewsCount: 0,
    status: 'active',
    createdAt: now,
  };

  try {
    const shortRef = doc(db, 'shorts', shortId);
    await setDoc(shortRef, newShort);
    cacheSingleShort(newShort);
    return newShort;
  } catch (error) {
    cacheSingleShort(newShort);
    handleFirestoreError(error, OperationType.CREATE, `shorts/${shortId}`);
    return newShort;
  }
}

export function subscribeToShorts(callback: (shorts: AnimalShort[]) => void): Unsubscribe {
  const shortsCol = collection(db, 'shorts');
  const q = query(shortsCol, where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: AnimalShort[] = [];
      snapshot.forEach((d) => items.push(d.data() as AnimalShort));
      saveCachedShorts(items);
      callback(items);
    },
    (error) => {
      console.warn('Shorts listener fallback:', error);
      callback(getCachedShorts());
    }
  );
}

export async function toggleShortLike(shortId: string, userId: string, isCurrentlyLiked: boolean): Promise<boolean> {
  const likeDocId = `${shortId}_${userId}`;
  const likeRef = doc(db, 'likes', likeDocId);
  const shortRef = doc(db, 'shorts', shortId);

  try {
    if (isCurrentlyLiked) {
      await deleteDoc(likeRef);
      await updateDoc(shortRef, { likesCount: increment(-1) });
      return false;
    } else {
      await setDoc(likeRef, {
        id: likeDocId,
        shortId,
        userId,
        createdAt: new Date().toISOString(),
      });
      await updateDoc(shortRef, { likesCount: increment(1) });
      return true;
    }
  } catch (error) {
    console.warn('Like toggle error:', error);
    return !isCurrentlyLiked;
  }
}

export async function checkUserLikedShort(shortId: string, userId: string): Promise<boolean> {
  try {
    const likeDocId = `${shortId}_${userId}`;
    const snap = await getDoc(doc(db, 'likes', likeDocId));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function addShortComment(shortId: string, userId: string, userName: string, text: string, userPhotoUrl?: string): Promise<ShortComment> {
  const commentId = 'cm_' + Date.now();
  const comment: ShortComment = {
    id: commentId,
    shortId,
    userId,
    userName,
    userPhotoUrl,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    const commentRef = doc(db, 'shorts', shortId, 'comments', commentId);
    await setDoc(commentRef, comment);
    const shortRef = doc(db, 'shorts', shortId);
    await updateDoc(shortRef, { commentsCount: increment(1) });
    return comment;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `shorts/${shortId}/comments/${commentId}`);
    return comment;
  }
}

export function subscribeToShortComments(shortId: string, callback: (comments: ShortComment[]) => void): Unsubscribe {
  const commentsCol = collection(db, 'shorts', shortId, 'comments');
  const q = query(commentsCol, orderBy('createdAt', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: ShortComment[] = [];
      snapshot.forEach((d) => list.push(d.data() as ShortComment));
      callback(list);
    },
    (err) => {
      console.warn('Comments subscriber error:', err);
      callback([]);
    }
  );
}

// -------------------------------------------------------------
// FAVORITES SERVICES
// -------------------------------------------------------------

export async function toggleFavorite(userId: string, listingId: string, isFavorited: boolean): Promise<boolean> {
  const favId = `${userId}_${listingId}`;
  const favRef = doc(db, 'favorites', favId);

  try {
    if (isFavorited) {
      await deleteDoc(favRef);
      return false;
    } else {
      await setDoc(favRef, {
        id: favId,
        userId,
        listingId,
        createdAt: new Date().toISOString(),
      });
      return true;
    }
  } catch (error) {
    console.warn('Favorite toggle error:', error);
    return !isFavorited;
  }
}

export async function checkListingFavorited(userId: string, listingId: string): Promise<boolean> {
  try {
    const favId = `${userId}_${listingId}`;
    const snap = await getDoc(doc(db, 'favorites', favId));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function fetchUserFavorites(userId: string): Promise<string[]> {
  try {
    const favCol = collection(db, 'favorites');
    const q = query(favCol, where('userId', '==', userId));
    const snap = await getDocs(q);
    const ids: string[] = [];
    snap.forEach((d) => ids.push((d.data() as UserFavorite).listingId));
    return ids;
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// BREEDS & ADMIN SETTINGS
// -------------------------------------------------------------

export async function getBreedsCatalog(): Promise<AnimalBreed[]> {
  try {
    const snap = await getDocs(collection(db, 'breeds'));
    if (!snap.empty) {
      const list: AnimalBreed[] = [];
      snap.forEach((d) => list.push(d.data() as AnimalBreed));
      return list;
    }
  } catch (err) {
    console.warn('Could not read breeds from Firestore, using initial dataset:', err);
  }
  return INITIAL_BREEDS;
}

export async function saveBreedToCatalog(breed: AnimalBreed): Promise<void> {
  try {
    const breedRef = doc(db, 'breeds', breed.id);
    await setDoc(breedRef, breed);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `breeds/${breed.id}`);
  }
}

export async function deleteBreedFromCatalog(breedId: string): Promise<void> {
  try {
    const breedRef = doc(db, 'breeds', breedId);
    await deleteDoc(breedRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `breeds/${breedId}`);
  }
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const defaultSettings: AdminSettings = {
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
  };

  try {
    const snap = await getDoc(doc(db, 'adminSettings', 'global'));
    if (snap.exists()) {
      return { ...defaultSettings, ...(snap.data() as AdminSettings) };
    }
  } catch (err) {
    console.warn('Admin settings fetch fallback:', err);
  }
  return defaultSettings;
}

export async function updateAdminSettings(settings: Partial<AdminSettings>): Promise<void> {
  try {
    const docRef = doc(db, 'adminSettings', 'global');
    await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'adminSettings/global');
  }
}

// -------------------------------------------------------------
// LOCAL CACHING HELPERS
// -------------------------------------------------------------

function saveCachedListings(listings: AnimalListing[]): void {
  try {
    localStorage.setItem(LISTINGS_CACHE_KEY, JSON.stringify(listings));
  } catch {
    // ignore quota
  }
}

export function getCachedListings(): AnimalListing[] {
  try {
    const raw = localStorage.getItem(LISTINGS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function cacheSingleListing(item: AnimalListing): void {
  const list = getCachedListings().filter((l) => l.id !== item.id);
  list.unshift(item);
  saveCachedListings(list);
}

function updateCachedListing(id: string, updates: Partial<AnimalListing>): void {
  const list = getCachedListings().map((l) => (l.id === id ? { ...l, ...updates } : l));
  saveCachedListings(list);
}

function removeCachedListing(id: string): void {
  const list = getCachedListings().filter((l) => l.id !== id);
  saveCachedListings(list);
}

function saveCachedShorts(shorts: AnimalShort[]): void {
  try {
    localStorage.setItem(SHORTS_CACHE_KEY, JSON.stringify(shorts));
  } catch {
    // ignore quota
  }
}

export function getCachedShorts(): AnimalShort[] {
  try {
    const raw = localStorage.getItem(SHORTS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function cacheSingleShort(short: AnimalShort): void {
  const list = getCachedShorts().filter((s) => s.id !== short.id);
  list.unshift(short);
  saveCachedShorts(list);
}
