import React, { useState } from 'react';
import {
  X,
  Camera,
  Video,
  Upload,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RotateCw,
  Trash2,
  MapPin,
  IndianRupee,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { AnimalCategory, AnimalListing, AnimalSubcategory, UserProfile } from '../types';
import { INITIAL_BREEDS, HYDERABAD_AREAS } from '../data/initialBreeds';
import { createListing, updateListing } from '../services/db';
import { generateListingDescription } from '../services/gemini';

interface SellAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onListingCreated: (listing: AnimalListing) => void;
  editingListing?: AnimalListing | null;
  onRequireAuth: () => void;
}

export const SellAnimalModal: React.FC<SellAnimalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onListingCreated,
  editingListing,
  onRequireAuth,
}) => {
  const [category, setCategory] = useState<AnimalCategory>(editingListing?.category || 'goat');
  const [subcategory, setSubcategory] = useState<AnimalSubcategory>(
    editingListing?.subcategory || 'male_goat'
  );
  const [breed, setBreed] = useState(editingListing?.breed || 'Jamnapari');
  const [customBreed, setCustomBreed] = useState('');
  const [title, setTitle] = useState(editingListing?.title || '');
  const [name, setName] = useState(editingListing?.name || '');
  const [gender, setGender] = useState<'male' | 'female'>(editingListing?.gender || 'male');
  const [ageMonths, setAgeMonths] = useState<number>(editingListing?.ageMonths || 12);
  const [teethCount, setTeethCount] = useState<number>(editingListing?.teethCount ?? 2);
  const [weightKg, setWeightKg] = useState<number | ''>(editingListing?.weightKg || '');
  const [price, setPrice] = useState<number | ''>(editingListing?.price || '');
  const [isNegotiable, setIsNegotiable] = useState(editingListing?.isNegotiable ?? true);
  const [location, setLocation] = useState(editingListing?.location || 'Hyderabad, Telangana');
  const [villageArea, setVillageArea] = useState(editingListing?.villageArea || 'Shamshabad');
  const [description, setDescription] = useState(editingListing?.description || '');
  const [farmerName, setFarmerName] = useState(
    editingListing?.farmerName || currentUser?.farmerName || currentUser?.name || ''
  );
  const [phoneNumber, setPhoneNumber] = useState(
    editingListing?.phoneNumber || currentUser?.phoneNumber || ''
  );
  const [whatsAppNumber, setWhatsAppNumber] = useState(
    editingListing?.whatsAppNumber || currentUser?.phoneNumber || ''
  );

  // Photos & Media
  const [photos, setPhotos] = useState<string[]>(editingListing?.photos || []);
  const [videoUrl, setVideoUrl] = useState<string>(editingListing?.videoUrl || '');
  const [farmerPhotoUrl, setFarmerPhotoUrl] = useState(editingListing?.farmerPhotoUrl || '');
  const [farmPhotoUrl, setFarmPhotoUrl] = useState(editingListing?.farmPhotoUrl || '');

  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter breeds matching category
  const availableBreeds = INITIAL_BREEDS.filter((b) => b.category === category);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 8MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        if (base64) {
          setPhotos((prev) => [...prev, base64]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('Video exceeds 25MB maximum limit. Please choose a short 15-30s video.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      if (base64) {
        setVideoUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAiDescription = async () => {
    setAiGenerating(true);
    try {
      const text = await generateListingDescription({
        category,
        breed: customBreed.trim() || breed,
        gender,
        ageMonths,
        teethCount,
        weightKg: Number(weightKg) || undefined,
        location: villageArea || location,
      });
      setDescription(text);
    } catch (err) {
      console.warn('AI generation error:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentUser) {
      onRequireAuth();
      return;
    }

    const selectedBreed = customBreed.trim() || breed;
    if (!selectedBreed) {
      setErrorMsg('Please select or specify the animal breed.');
      return;
    }

    if (!price || Number(price) <= 0) {
      setErrorMsg('Please enter a valid price in INR.');
      return;
    }

    if (!phoneNumber || phoneNumber.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit seller contact phone number.');
      return;
    }

    setLoading(true);

    try {
      const generatedTitle = title.trim() || `${selectedBreed} ${category === 'goat' ? 'Goat' : 'Sheep'} (${gender})`;

      const payload = {
        category,
        subcategory,
        breed: selectedBreed,
        title: generatedTitle,
        name: name.trim() || undefined,
        gender,
        ageMonths: Number(ageMonths),
        teethCount: Number(teethCount),
        weightKg: weightKg ? Number(weightKg) : undefined,
        price: Number(price),
        isNegotiable,
        location: location.trim() || 'Hyderabad, Telangana',
        villageArea: villageArea.trim() || 'Hyderabad',
        city: 'Hyderabad',
        description: description.trim() || `Healthy ${selectedBreed} available for sale in Hyderabad.`,
        sellerId: currentUser.id,
        sellerName: currentUser.name || 'SRA Farmer',
        farmerName: farmerName.trim() || currentUser.name || 'SRA Farmer',
        phoneNumber: phoneNumber.trim(),
        whatsAppNumber: (whatsAppNumber || phoneNumber).trim(),
        farmerPhotoUrl: farmerPhotoUrl || currentUser.photoUrl,
        farmPhotoUrl: farmPhotoUrl || currentUser.farmPhotoUrl,
        photos: photos.length > 0 ? photos : ['/logo.jpg'],
        videoUrl: videoUrl || undefined,
        status: (editingListing?.status || 'available') as 'available',
      };

      if (editingListing) {
        await updateListing(editingListing.id, payload);
        onListingCreated({ ...editingListing, ...payload });
      } else {
        const created = await createListing(payload);
        onListingCreated(created);
      }

      setLoading(false);
      onClose();
    } catch (err: unknown) {
      setLoading(false);
      setErrorMsg(err instanceof Error ? err.message : 'Error publishing listing. Please retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950/80">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {editingListing ? 'Edit Animal Listing' : 'Post Animal For Sale (Sell)'}
            </h2>
            <p className="text-xs text-emerald-400 font-medium">
              SRA Goat for Sale Hyderabad • Direct Farmer Post
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-6 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 flex items-start gap-2 text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Animal Category & Type */}
          <div className="space-y-3">
            <label className="font-bold text-stone-300 uppercase tracking-wider block">
              1. Select Animal Species (Goat or Sheep)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setCategory('goat');
                  setSubcategory('male_goat');
                  setBreed('Jamnapari');
                }}
                className={`p-3 rounded-xl border text-center font-bold text-sm transition ${
                  category === 'goat'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-800'
                }`}
              >
                🐐 GOAT (Bakri / Bakra)
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('sheep');
                  setSubcategory('ram');
                  setBreed('Nellore Jodipi');
                }}
                className={`p-3 rounded-xl border text-center font-bold text-sm transition ${
                  category === 'sheep'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-800'
                }`}
              >
                🐑 SHEEP (Mendha / Bhed)
              </button>
            </div>
          </div>

          {/* Section 2: Breed & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-300 block mb-1">
                Breed Name
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
              >
                {availableBreeds.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} {b.isExotic ? '(Exotic)' : '(Indian)'}
                  </option>
                ))}
                <option value="Other">Other / Custom Breed</option>
              </select>
            </div>

            {breed === 'Other' && (
              <div>
                <label className="font-semibold text-stone-300 block mb-1">
                  Specify Custom Breed
                </label>
                <input
                  type="text"
                  value={customBreed}
                  onChange={(e) => setCustomBreed(e.target.value)}
                  placeholder="e.g. Dumba Cross, Sirohi x Boer"
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="font-semibold text-stone-300 block mb-1">
                Subcategory / Classification
              </label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value as AnimalSubcategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
              >
                {category === 'goat' ? (
                  <>
                    <option value="male_goat">Male Goat (Bakra / Khassi / Buck)</option>
                    <option value="female_goat">Female Goat (Bakri / Doe)</option>
                    <option value="kid">Kid / Pathda (Under 6 months)</option>
                    <option value="indian_breed">Indian Native Goat Breed</option>
                    <option value="exotic_goat">Exotic Goat Breed</option>
                  </>
                ) : (
                  <>
                    <option value="ram">Ram (Male Sheep / Mendha / Potla)</option>
                    <option value="ewe">Ewe (Female Sheep / Bhed)</option>
                    <option value="lamb">Lamb (Baby Sheep under 6 months)</option>
                    <option value="indian_breed">Indian Native Sheep Breed</option>
                    <option value="exotic_sheep">Exotic Sheep Breed (Dorper / Dumba)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Section 3: Physical Traits (Gender, Age, Teeth, Weight) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-semibold text-stone-300 block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-300 block mb-1">Age (Months)</label>
              <input
                type="number"
                min={1}
                max={120}
                value={ageMonths}
                onChange={(e) => setAgeMonths(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-300 block mb-1">Teeth (Dant)</label>
              <select
                value={teethCount}
                onChange={(e) => setTeethCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
              >
                <option value={0}>Adant (0 Teeth / Milk)</option>
                <option value={2}>2 Dant</option>
                <option value={4}>4 Dant</option>
                <option value={6}>6 Dant</option>
                <option value={8}>8 Dant (Full)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-300 block mb-1">Live Weight (kg)</label>
              <input
                type="number"
                min={5}
                max={250}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 45"
                className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 4: Pricing & Negotiability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-950 border border-stone-800">
            <div>
              <label className="font-semibold text-stone-300 block mb-1">
                Asking Price (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min={100}
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 25000"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-stone-900 border-stone-700"
                />
                <span className="text-xs font-medium text-stone-200">
                  Price is Negotiable (Thoda kam hoga)
                </span>
              </label>
            </div>
          </div>

          {/* Section 5: Location in Hyderabad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-300 block mb-1">
                Hyderabad / Telangana Area *
              </label>
              <select
                value={villageArea}
                onChange={(e) => setVillageArea(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
              >
                {HYDERABAD_AREAS.filter((a) => !a.startsWith('All')).map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-stone-300 block mb-1">
                Specific Farm / Pen / Landmark
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Near Shamshabad Toll Plaza, Hyderabad"
                className="w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 6: Photos & Video Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-300 uppercase tracking-wider block">
                Animal Photos & Video
              </label>
              <span className="text-[11px] text-stone-500">Live animals only</span>
            </div>

            {/* Photos Preview Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {photos.map((p, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-stone-700 bg-stone-950 group">
                  <img src={p} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-600/90 text-white opacity-90 hover:opacity-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] text-emerald-400 font-bold">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {/* Upload Photo Button */}
              <label className="aspect-square rounded-xl border-2 border-dashed border-stone-800 hover:border-emerald-500/80 bg-stone-950 flex flex-col items-center justify-center gap-1 cursor-pointer transition text-stone-400 hover:text-emerald-400">
                <Camera className="w-5 h-5" />
                <span className="text-[10px] font-medium">+ Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {/* Upload Video Button */}
              <label className="aspect-square rounded-xl border-2 border-dashed border-stone-800 hover:border-emerald-500/80 bg-stone-950 flex flex-col items-center justify-center gap-1 cursor-pointer transition text-stone-400 hover:text-emerald-400">
                <Video className="w-5 h-5" />
                <span className="text-[10px] font-medium">
                  {videoUrl ? 'Replace Video' : '+ Add Video'}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {videoUrl && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-xs text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Video clip loaded successfully! (Plays on listing & animal shorts)
                </span>
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="text-red-400 hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Section 7: Description with Gemini AI Helper */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-300">
                Animal Health, Vaccination & Diet Description
              </label>
              <button
                type="button"
                onClick={handleAiDescription}
                disabled={aiGenerating}
                className="py-1 px-2.5 rounded-lg bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-700/60 font-medium text-[11px] transition flex items-center gap-1 disabled:opacity-50"
              >
                {aiGenerating ? <RotateCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Write with AI
              </button>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention vaccination status, deworming, daily diet (jowar, green leaves, mineral mix), and lineage..."
              className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Section 8: Farmer Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-stone-950 border border-stone-800">
            <div>
              <label className="font-semibold text-stone-300 block mb-1">Farmer / Seller Name</label>
              <input
                type="text"
                required
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="e.g. Syed Rahmath Ali"
                className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-300 block mb-1">Direct Call Phone Number *</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-300 block mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsAppNumber}
                onChange={(e) => setWhatsAppNumber(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Important Safe Livestock Notice */}
          <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 text-[11px] text-stone-400 leading-relaxed">
            <span className="font-bold text-emerald-400">Strict Marketplace Policy:</span> This platform is strictly for live animals. Listings for food, slaughtered meat, or delivery services are prohibited and will be removed immediately.
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/80 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Publishing Listing to Firestore...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {editingListing ? 'Save & Update Listing' : 'Publish Live Animal Listing'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
