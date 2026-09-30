import React from 'react';
import { X, HelpCircle, Phone, MessageCircle, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { AdminSettings } from '../types';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({
  isOpen,
  onClose,
  adminSettings,
}) => {
  if (!isOpen) return null;

  const handleCallAdmin = () => {
    window.location.href = `tel:${adminSettings.contactPhone}`;
  };

  const handleWhatsAppAdmin = () => {
    const clean = adminSettings.contactWhatsApp.replace(/[^0-9]/g, '');
    const text = encodeURIComponent('Hello SRA Group HYD Admin, I need assistance with the SRA Goat for Sale Hyderabad platform.');
    window.open(`https://wa.me/${clean}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Help Center & Farmer Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1 text-xs text-stone-300">
          {/* Contact Support Banner */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-emerald-300">Contact SRA Group HYD Support</h3>
              <p className="text-stone-400 mt-0.5">Need help verifying your farm or managing listings?</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCallAdmin}
                className="py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-semibold flex items-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call</span>
              </button>
              <button
                onClick={handleWhatsAppAdmin}
                className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
              <h4 className="font-bold text-white flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                How do I list a goat or sheep for sale?
              </h4>
              <p className="text-stone-400 leading-relaxed">
                Tap the "+ Sell" button on the bottom navigation bar. Authenticate with your mobile number via SMS OTP, choose whether your animal is a Goat or Sheep, select breed and age, set your asking price, upload photos/videos, and tap Publish.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
              <h4 className="font-bold text-white flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                How do Animal Shorts work?
              </h4>
              <p className="text-stone-400 leading-relaxed">
                Animal Shorts are 9:16 vertical full-screen video reels showcasing active animals. When creating a listing, upload a vertical video clip to automatically feature your livestock on the high-engagement Shorts feed.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
              <h4 className="font-bold text-white flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                How do I mark an animal as sold?
              </h4>
              <p className="text-stone-400 leading-relaxed">
                Go to "My Listings" from the bottom bar, find the animal, and click "Mark Sold". The listing will display a prominent "SOLD" badge and can be relisted at any time if a buyer backs out.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800">
              <h4 className="font-bold text-white flex items-center gap-2 mb-1">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Are payments and delivery handled by SRA Goat?
              </h4>
              <p className="text-stone-400 leading-relaxed">
                No. SRA Goat for Sale Hyderabad is purely an animal discovery marketplace. Buyers and sellers contact each other directly via Call or WhatsApp and meet at the farm/pen to inspect the animal before completing cash or UPI payment. We do not provide animal transport or meat delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
