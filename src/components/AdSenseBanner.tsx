import React from 'react';
import { adService } from '../services/ads';

interface AdBannerProps {
  placement?: 'top' | 'feed' | 'sidebar' | 'shorts';
  className?: string;
}

export const AdSenseBanner: React.FC<AdBannerProps> = ({ placement = 'feed', className = '' }) => {
  if (!adService.isEnabled()) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-stone-800 bg-stone-900/60 p-3 text-center my-3 transition-all ${className}`}
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
        <span>Sponsor Advertisement</span>
        <span>AdSense / AdMob</span>
      </div>

      <div className="flex flex-col items-center justify-center py-2 px-3 border border-dashed border-stone-700/60 rounded-lg bg-stone-950/40 min-h-[60px]">
        <p className="text-xs font-medium text-emerald-400">
          SRA Goat & Sheep Livestock Marketplace
        </p>
        <p className="text-[11px] text-stone-400 mt-0.5">
          Verified Hyderabad farms • Direct farmer deals • No middlemen
        </p>
      </div>
    </div>
  );
};
