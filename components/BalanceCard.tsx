import React, { useState } from 'react';
import { Icons } from './Icons';

interface BalanceCardProps {
  balance: number;
  isSubscribed?: boolean;
  isVIP?: boolean;
  subscriptionPlan?: string;
  onAdminClick?: () => void;
  onHistoryClick?: () => void;
  onDepositClick?: () => void;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ 
  balance = 0, 
  onHistoryClick, 
  onDepositClick 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const formatCurrency = (amount: number) => {
    const safeAmount = typeof amount === 'number' && !isNaN(amount) && isFinite(amount) ? amount : (Number(amount) || 0);
    return '₦' + safeAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#014026] via-[#014e2f] to-[#00331d] p-5 text-white shadow-lg border border-emerald-800/40">
      {/* Background Decorative Gold Waves Swoosh (Matching Uploaded Image) */}
      <div className="absolute right-0 bottom-0 pointer-events-none w-64 h-48 overflow-hidden z-0 opacity-90">
        <svg viewBox="0 0 250 180" className="w-full h-full" fill="none">
          <defs>
            <linearGradient id="goldWave1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="goldWave2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b45309" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path 
            d="M 20 180 C 100 160, 160 110, 250 10 L 250 180 Z" 
            fill="url(#goldWave1)" 
          />
          <path 
            d="M 70 180 C 140 165, 190 120, 250 35 L 250 75 C 190 145, 120 175, 70 180 Z" 
            fill="url(#goldWave2)" 
          />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Top Header Row: Wallet icon + "Total Balance" and Eye Icon */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            {/* Gold Wallet Badge */}
            <div className="w-7 h-7 rounded-lg bg-amber-400/90 flex items-center justify-center text-amber-950 shadow-sm">
              <Icons.Loan size={16} className="text-emerald-950 fill-emerald-950/20" />
            </div>
            <span className="text-sm font-medium text-emerald-50 tracking-wide">
              Total Balance
            </span>
          </div>

          <button 
            onClick={() => setIsVisible(!isVisible)}
            className="p-1 text-emerald-100 hover:text-white transition-colors cursor-pointer active:scale-95"
            title={isVisible ? "Hide Balance" : "Show Balance"}
          >
            {isVisible ? (
              <Icons.Eye size={20} strokeWidth={1.8} className="text-emerald-100" />
            ) : (
              <Icons.EyeOff size={20} strokeWidth={1.8} className="text-emerald-100" />
            )}
          </button>
        </div>

        {/* Balance Amount */}
        <div className="mb-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
            {isVisible ? formatCurrency(balance) : '₦••••••••'}
          </h1>
        </div>

        {/* Subtitle */}
        <div className="mb-5">
          <span className="text-xs text-emerald-200/80 font-normal">
            Wallet Balance
          </span>
        </div>

        {/* Floating White Pill Action Bar */}
        <div className="bg-white rounded-full py-2.5 px-4 shadow-md flex items-center justify-between text-slate-900">
          {/* Fund Wallet Button */}
          <button 
            onClick={onDepositClick}
            className="flex-1 flex items-center justify-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer group py-0.5"
          >
            <div className="w-8 h-8 rounded-full bg-[#014026] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <Icons.ArrowUpRight size={17} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight whitespace-nowrap">
              Fund Wallet
            </span>
          </button>

          {/* Vertical Divider */}
          <div className="w-[1px] h-6 bg-slate-200 mx-2"></div>

          {/* Transaction History Button */}
          <button 
            onClick={onHistoryClick}
            className="flex-1 flex items-center justify-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer group py-0.5"
          >
            <div className="w-8 h-8 rounded-full bg-[#d97706] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <Icons.Repeat size={16} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight whitespace-nowrap">
              Transaction History
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;