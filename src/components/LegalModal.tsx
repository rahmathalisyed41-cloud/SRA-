import React, { useState } from 'react';
import { X, ShieldAlert, FileText, Lock } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'disclaimer' | 'terms' | 'privacy'>('disclaimer');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Policies, Disclaimer & Terms</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center border-b border-stone-800 px-5 pt-3 gap-2 bg-stone-950/60">
          <button
            onClick={() => setTab('disclaimer')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              tab === 'disclaimer'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Marketplace Disclaimer
          </button>
          <button
            onClick={() => setTab('terms')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              tab === 'terms'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Terms & Conditions
          </button>
          <button
            onClick={() => setTab('privacy')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              tab === 'privacy'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-white'
            }`}
          >
            Privacy Policy
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1 text-xs text-stone-300 leading-relaxed">
          {tab === 'disclaimer' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-start gap-2.5 text-amber-200">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sm font-bold text-amber-300">
                    Important Marketplace Disclaimer
                  </strong>
                  SRA Goat for Sale Hyderabad (SRA Group HYD) operates exclusively as a discovery and communication portal connecting animal buyers and sellers.
                </div>
              </div>

              <p>
                <strong>1. No Transaction Guarantees:</strong> The platform does NOT guarantee animal health, live weight, teeth count, physical defects, veterinary vaccination status, lineage certificates, ownership titles, or breed authenticity.
              </p>
              <p>
                <strong>2. No Delivery or Transport:</strong> SRA Group HYD does not provide, manage, or arrange animal transport, courier, or delivery services. Buyers and sellers must arrange their own legal animal transportation adhering to Prevention of Cruelty to Animals (Transport of Animals) Rules.
              </p>
              <p>
                <strong>3. Not a Food or Meat Application:</strong> This platform is solely for live animal farming and breeding. Advertisements for slaughtered meat, raw mutton, cooked dishes, or food delivery are strictly banned and will be immediately removed.
              </p>
              <p>
                <strong>4. Due Diligence:</strong> All prospective buyers are advised to inspect the animal in person at the farm or pen location in Hyderabad or Telangana before making any financial commitment.
              </p>
            </div>
          )}

          {tab === 'terms' && (
            <div className="space-y-3">
              <h3 className="font-bold text-white text-sm">Terms of Service</h3>
              <p>
                By using SRA Goat for Sale Hyderabad, you warrant that you are at least 18 years of age and authorized to buy or sell livestock under applicable Indian laws.
              </p>
              <p>
                <strong>Seller Conduct:</strong> Sellers must only post accurate, unedited photographs and videos of live animals actually in their possession. Fraudulent advertisements, duplicate spam listings, and misleading price points will lead to immediate account suspension.
              </p>
              <p>
                <strong>Prohibited Content:</strong> No illegal wildlife, endangered species, stolen livestock, animal cruelty videos, or animal slaughter footage is permitted.
              </p>
            </div>
          )}

          {tab === 'privacy' && (
            <div className="space-y-3">
              <h3 className="font-bold text-white text-sm">Privacy & Data Handling</h3>
              <p>
                We value the privacy of Telangana farmers and buyers. We only collect phone numbers for SMS OTP verification and listing contact purposes.
              </p>
              <p>
                <strong>Phone Number & WhatsApp:</strong> When you publish a listing, your contact number is made available to prospective buyers on the listing card for direct phone calls and WhatsApp chats. We never sell your personal information to third-party telemarketers.
              </p>
              <p>
                <strong>Location Data:</strong> Device location is only used to compute approximate distance from farm pens. Precise GPS coordinates are never made public.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
