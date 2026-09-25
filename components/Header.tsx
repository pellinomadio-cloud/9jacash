import React from 'react';
import { Icons } from './Icons';

interface HeaderProps {
  userName?: string;
  profileImage?: string;
  onLogout?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  pageTitle?: string;
  onNotificationClick?: () => void;
  onInfoClick?: () => void;
  hasUnread?: boolean;
  isSubscribed?: boolean;
  isVIP?: boolean;
  isAppInstalled?: boolean;
  onAppIconClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  userName = "Pellino", 
  profileImage, 
  onLogout,
  showBack = false,
  onBack,
  pageTitle,
  onNotificationClick,
  onInfoClick,
  hasUnread = true,
  isSubscribed = false,
  isVIP = false,
  isAppInstalled = false,
  onAppIconClick
}) => {
  // If showing a back navigation page (like profile or settings sub-pages)
  if (showBack) {
    return (
      <div className="bg-[#013d26] px-4 py-3.5 flex justify-between items-center sticky top-0 z-50 text-white shadow-md">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack} 
            className="p-1.5 -ml-1 hover:bg-emerald-900/60 rounded-full transition-colors active:scale-95 cursor-pointer"
          >
            <Icons.ArrowLeft size={22} className="text-white" />
          </button>
          <span className="font-bold text-white text-lg tracking-tight">{pageTitle}</span>
        </div>
        {onNotificationClick && (
          <button 
            onClick={onNotificationClick}
            className="p-2 hover:bg-emerald-900/50 rounded-full transition-colors relative cursor-pointer"
          >
            <Icons.Notification size={20} className="text-white" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#013d26]"></span>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#013a24] pt-4 pb-2 px-4 flex justify-between items-center relative z-20 text-white">
      {/* Left: Gold Circular Badge + User Greeting */}
      <div className="flex items-center space-x-3">
        {/* Stylized Gold Crest Emblem matching image */}
        <div className="w-12 h-12 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 shadow-md flex items-center justify-center shrink-0">
          <div className="w-full h-full rounded-full bg-[#013a24] flex items-center justify-center relative overflow-hidden border border-amber-300/40">
            {profileImage ? (
              <img src={profileImage} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <svg viewBox="0 0 100 100" className="w-7 h-7" fill="none">
                <defs>
                  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                {/* Stylized 'G' / wing swirl crest emblem from screenshot */}
                <path 
                  d="M50 14 C30 14 15 29 15 49 C15 69 30 84 50 84 C66 84 79 73 83 58 L66 58 C63 67 57 71 50 71 C38 71 28 61 28 49 C28 37 38 27 50 27 C59 27 66 32 70 40 L84 31 C77 20 65 14 50 14 Z" 
                  fill="url(#goldGrad)" 
                />
                <path 
                  d="M48 42 L78 42 L65 55 L38 55 Z" 
                  fill="#ffffff" 
                  opacity="0.9"
                />
                <circle cx="58" cy="48" r="4" fill="url(#goldGrad)" />
              </svg>
            )}
          </div>
        </div>

        {/* Text Greeting */}
        <div className="flex flex-col">
          <span className="text-[11px] text-emerald-100/80 font-normal leading-tight">
            Welcome Back
          </span>
          <span className="text-xl font-bold text-white tracking-tight leading-snug">
            {userName}
          </span>
          <span className="text-[11px] text-emerald-200/80 font-normal leading-tight">
            Your success is our priority
          </span>
        </div>
      </div>

      {/* Right: Notification Bell */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={onNotificationClick}
          className="relative p-2.5 hover:bg-emerald-900/60 rounded-full transition-colors cursor-pointer active:scale-95"
          title="Notifications"
        >
          <Icons.Notification size={22} className="text-white" strokeWidth={2} />
          {hasUnread && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#013a24] animate-pulse"></span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Header;
