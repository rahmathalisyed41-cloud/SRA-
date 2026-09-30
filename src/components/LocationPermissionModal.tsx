import React, { useState } from 'react';
import { MapPin, Navigation, Check, X, ShieldAlert } from 'lucide-react';
import { HYDERABAD_AREAS } from '../data/initialBreeds';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentArea: string;
  onSelectArea: (area: string, coords?: { lat: number; lng: number }) => void;
}

export const LocationPermissionModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentArea,
  onSelectArea,
}) => {
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isDetecting, setIsDetecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleRequestGPS = (type: 'always' | 'once') => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetecting(false);
        setPermissionState('granted');
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        // Detect closest Hyderabad zone or use current coords
        onSelectArea('Current GPS Location (Hyderabad)', coords);
        if (type === 'always') {
          localStorage.setItem('sra_location_permission', 'always');
        }
        onClose();
      },
      (error) => {
        setIsDetecting(false);
        setPermissionState('denied');
        console.warn('Geolocation error:', error);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const filteredAreas = HYDERABAD_AREAS.filter((a) =>
    a.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-6 text-stone-100 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-100">Select Location</h2>
              <p className="text-xs text-stone-400">Discover live goats & sheep near you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Permission Request Prompt */}
        <div className="my-4 p-4 rounded-xl bg-stone-950/80 border border-stone-800">
          <div className="flex items-start gap-3">
            <Navigation className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-stone-200">Device Location Permission</h4>
              <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                Allow SRA Goat to access device location to calculate approximate distance from nearby farmer pens.
              </p>
            </div>
          </div>

          {permissionState === 'denied' && (
            <div className="mt-3 p-2.5 rounded-lg bg-red-950/40 border border-red-800/50 flex items-center gap-2 text-xs text-red-300">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Permission was denied. You can manually select your area below or retry.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-3.5">
            <button
              onClick={() => handleRequestGPS('always')}
              disabled={isDetecting}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-medium text-xs text-white shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-1.5"
            >
              {isDetecting ? 'Locating...' : 'Allow while using app'}
            </button>
            <button
              onClick={() => handleRequestGPS('once')}
              disabled={isDetecting}
              className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 font-medium text-xs text-stone-200 transition flex items-center justify-center gap-1.5"
            >
              Allow once
            </button>
          </div>
        </div>

        {/* Search Hyderabad Areas */}
        <div className="mb-2">
          <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block mb-1.5">
            Or Choose Hyderabad / Telangana Area
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Charminar, Mehdipatnam, Shamshabad..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-950 border border-stone-800 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Areas List */}
        <div className="overflow-y-auto space-y-1.5 pr-1 flex-1">
          {filteredAreas.map((area) => {
            const isSelected = currentArea === area;
            return (
              <button
                key={area}
                onClick={() => {
                  onSelectArea(area);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition ${
                  isSelected
                    ? 'bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 font-medium'
                    : 'bg-stone-950/50 hover:bg-stone-800/60 border border-stone-800/40 text-stone-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-stone-500'}`} />
                  <span>{area}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
          <span>SRA Group HYD • Precise location is never shared</span>
          <button onClick={onClose} className="text-stone-400 hover:text-white underline">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
