import React from 'react';
import { Icons } from './Icons';

interface BannerProps {
  onCheckPromo?: () => void;
}

const Banner: React.FC<BannerProps> = ({ onCheckPromo }) => {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[#013f26] via-[#025634] to-[#01341e] p-4 text-white shadow-md border border-emerald-800/30">
      {/* Background Decorative Gold Ribbon Waves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
        <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none" fill="none">
          <path 
            d="M 120 160 C 220 150, 260 70, 400 40 L 400 160 Z" 
            fill="url(#bannerGoldWave)" 
            opacity="0.3" 
          />
          <defs>
            <linearGradient id="bannerGoldWave" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        {/* Left Copy & CTA */}
        <div className="max-w-[62%] flex flex-col items-start">
          {/* Special Offer Pill */}
          <div className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-slate-950 text-[11px] font-black px-3 py-0.5 rounded-full shadow-sm border border-amber-300/80">
            <span>🎁</span>
            <span className="uppercase tracking-wider">Promo Deals</span>
          </div>

          {/* Heading */}
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight mt-2 drop-shadow-sm">
            Get Amazing Deals &amp; Exciting Rewards!
          </h3>

          {/* Subtitle */}
          <p className="text-xs text-emerald-100/90 font-normal mt-1 leading-snug">
            Buy data, airtime and more at the best rates.
          </p>

          {/* Check Promo Button */}
          <button 
            onClick={onCheckPromo}
            className="mt-3.5 bg-white hover:bg-emerald-50 text-[#013a24] font-extrabold text-xs px-4 py-2 rounded-full inline-flex items-center space-x-1.5 shadow-md active:scale-95 transition-all cursor-pointer group"
          >
            <span>Check Promo</span>
            <Icons.ChevronRight size={14} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Right 3D Gift Box with Red Ribbon & Floating Gold Coins */}
        <div className="w-[38%] flex items-center justify-end relative">
          <svg viewBox="0 0 160 150" className="w-full h-28 max-w-[130px]" fill="none">
            <defs>
              <radialGradient id="sparkleGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="70%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
              <linearGradient id="ribbonRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
            </defs>

            {/* Sparkle background glow */}
            <circle cx="95" cy="85" r="55" fill="url(#sparkleGlow)" />

            {/* Floating Gold Coin Top Left */}
            <g transform="translate(18, 25) rotate(-15)">
              <ellipse cx="16" cy="16" rx="14" ry="10" fill="url(#coinGrad)" stroke="#fef08a" strokeWidth="1.5" />
              <text x="12" y="19" fontSize="10" fontWeight="bold" fill="#78350f">₦</text>
            </g>

            {/* Floating Gold Coin Top Right */}
            <g transform="translate(115, 10) rotate(20)">
              <ellipse cx="14" cy="14" rx="12" ry="9" fill="url(#coinGrad)" stroke="#fef08a" strokeWidth="1.5" />
              <text x="10" y="17" fontSize="9" fontWeight="bold" fill="#78350f">₦</text>
            </g>

            {/* Floating Gold Coin Bottom Left */}
            <g transform="translate(30, 95) rotate(-25)">
              <ellipse cx="18" cy="18" rx="16" ry="12" fill="url(#coinGrad)" stroke="#fef08a" strokeWidth="2" />
              <text x="13" y="22" fontSize="12" fontWeight="bold" fill="#78350f">₦</text>
            </g>

            {/* Floating Gold Coin Bottom Right */}
            <g transform="translate(110, 85) rotate(15)">
              <ellipse cx="16" cy="16" rx="14" ry="11" fill="url(#coinGrad)" stroke="#fef08a" strokeWidth="1.5" />
              <text x="12" y="20" fontSize="11" fontWeight="bold" fill="#78350f">₦</text>
            </g>

            {/* 3D Gift Box Body (White with realistic shading) */}
            <g transform="translate(45, 45)">
              {/* Box Lower Base */}
              <path d="M 12 35 L 42 20 L 72 35 L 72 70 L 42 85 L 12 70 Z" fill="url(#boxGrad)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />
              {/* Left Shadow Side */}
              <path d="M 12 35 L 42 20 L 42 85 L 12 70 Z" fill="#e2e8f0" />
              {/* Right Shaded Side */}
              <path d="M 42 20 L 72 35 L 72 70 L 42 85 Z" fill="#cbd5e1" />

              {/* Red Ribbon Wrapping Vertical */}
              <path d="M 23 29 L 31 25 L 31 79 L 23 75 Z" fill="url(#ribbonRed)" />
              <path d="M 53 25 L 61 29 L 61 75 L 53 79 Z" fill="url(#ribbonRed)" />

              {/* Red Ribbon Wrapping Horizontal */}
              <path d="M 12 50 L 42 35 L 72 50 L 72 58 L 42 43 L 12 58 Z" fill="url(#ribbonRed)" />

              {/* Box Lid */}
              <path d="M 8 28 L 42 12 L 76 28 L 76 38 L 42 22 L 8 38 Z" fill="#ffffff" />
              <path d="M 8 28 L 42 12 L 42 22 L 8 38 Z" fill="#f8fafc" />
              <path d="M 42 12 L 76 28 L 76 38 L 42 22 Z" fill="#e2e8f0" />

              {/* Bow Left Loop */}
              <path d="M 42 12 C 28 -5, 15 5, 36 14 Z" fill="url(#ribbonRed)" stroke="#b91c1c" strokeWidth="0.5" />
              {/* Bow Right Loop */}
              <path d="M 42 12 C 56 -5, 69 5, 48 14 Z" fill="url(#ribbonRed)" stroke="#b91c1c" strokeWidth="0.5" />
              {/* Bow Center Knot */}
              <circle cx="42" cy="12" r="5" fill="#dc2626" />
              {/* Bow Ribbon Ends */}
              <path d="M 39 15 Q 30 25 32 32 Q 38 28 41 18 Z" fill="#b91c1c" />
              <path d="M 45 15 Q 54 25 52 32 Q 46 28 43 18 Z" fill="#b91c1c" />
            </g>

            {/* Star Sparkles */}
            <path d="M 30 18 Q 32 23 37 23 Q 32 23 30 28 Q 28 23 23 23 Q 28 23 30 18 Z" fill="#fef08a" />
            <path d="M 130 50 Q 132 54 136 54 Q 132 54 130 58 Q 128 54 124 54 Q 128 54 130 50 Z" fill="#fef08a" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Banner;
