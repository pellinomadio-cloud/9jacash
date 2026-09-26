import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { 
  Zap, 
  ShieldCheck, 
  Check, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Star, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Lock, 
  Crown, 
  CreditCard,
  ChevronRight,
  AlertCircle,
  Banknote,
  CheckCircle2
} from 'lucide-react';

interface UpgradeProposalProps {
  onProceed: (tier: 'vip1' | 'vip2' | 'vip3') => void;
  onBack: () => void;
  onGoToSubscribe?: () => void;
  onGoToWithdraw?: () => void;
  user?: User;
}

export const Vip2CountdownTimer: React.FC<{ timestamp?: number }> = ({ timestamp }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 2,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    // 3 days in milliseconds = 3 * 24 * 60 * 60 * 1000 = 259,200,000 ms
    const durationMs = 3 * 24 * 60 * 60 * 1000;
    const startTime = timestamp || Date.now();
    const endTime = startTime + durationMs;

    const updateTimer = () => {
      const now = Date.now();
      const difference = Math.max(0, endTime - now);

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 rounded-3xl p-5 sm:p-6 text-black shadow-2xl shadow-amber-300/60 border-2 border-amber-300 relative overflow-hidden space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-black/15 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping shrink-0" />
          <span className="text-xs font-black uppercase tracking-widest text-black">
            LIVE VIP 2 CASHOUT COUNTDOWN
          </span>
        </div>
        <span className="px-3 py-1 bg-black text-amber-400 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
          2 Working Days
        </span>
      </div>

      <div className="text-center space-y-2">
        <p className="text-xs font-black text-black/90 uppercase tracking-wider">
          Time Remaining Before Withdrawal Clears From Pending
        </p>
        
        {/* BIG Digital Clock Display */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center pt-1">
          <div className="bg-amber-950 text-amber-400 rounded-2xl p-2.5 sm:p-3.5 border-2 border-amber-300 shadow-xl">
            <span className="text-2xl sm:text-4xl font-black font-mono tracking-tight block">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-amber-200/80 block mt-1">
              Days
            </span>
          </div>
          <div className="bg-amber-950 text-amber-400 rounded-2xl p-2.5 sm:p-3.5 border-2 border-amber-300 shadow-xl">
            <span className="text-2xl sm:text-4xl font-black font-mono tracking-tight block">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-amber-200/80 block mt-1">
              Hours
            </span>
          </div>
          <div className="bg-amber-950 text-amber-400 rounded-2xl p-2.5 sm:p-3.5 border-2 border-amber-300 shadow-xl">
            <span className="text-2xl sm:text-4xl font-black font-mono tracking-tight block">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-amber-200/80 block mt-1">
              Minutes
            </span>
          </div>
          <div className="bg-amber-950 text-amber-400 rounded-2xl p-2.5 sm:p-3.5 border-2 border-amber-300 shadow-xl">
            <span className="text-2xl sm:text-4xl font-black font-mono tracking-tight block">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-amber-200/80 block mt-1">
              Seconds
            </span>
          </div>
        </div>

        <p className="text-[11px] font-extrabold text-amber-950/90 leading-tight pt-1">
          ⚡ VIP 2 Active: Your withdrawal will be credited automatically upon countdown completion!
        </p>
      </div>
    </div>
  );
};

const UpgradeProposal: React.FC<UpgradeProposalProps> = ({ 
  onProceed, 
  onBack, 
  onGoToSubscribe,
  onGoToWithdraw,
  user 
}) => {
  const [selectedTier, setSelectedTier] = useState<'vip1' | 'vip2' | 'vip3'>('vip1');
  const [showPreviewAnyway, setShowPreviewAnyway] = useState(false);

  const isSubscribed = !!user?.isSubscribed;
  const hasPendingWithdrawal = user?.transactions?.some(t => t.type === 'debit' && t.status === 'pending');
  const isVip2Active = user?.vipTier === 'vip2' || user?.pendingActivation === 'vip2';

  const vipTiers = [
    {
      id: 'vip1' as const,
      name: 'VIP 1 — Instant Cashout',
      price: '₦20,000',
      badge: '⚡ INSTANT CASHOUT (BEST)',
      badgeBg: 'bg-emerald-500 text-white',
      timeline: 'Instant (0 Days)',
      description: 'Clears pending cashout immediately & credits your bank account without delay.',
      features: [
        'Instant withdrawal removal from pending',
        'Immediate bank payout credit',
        'Unlimited daily transaction limit',
        '₦1,000,000 VIP Business Fund access',
      ],
      color: 'border-emerald-500 bg-emerald-50/40',
    },
    {
      id: 'vip2' as const,
      name: 'VIP 2 — Express Cashout',
      price: '₦15,000',
      badge: '⏱️ 2 WORKING DAYS',
      badgeBg: 'bg-amber-500 text-black',
      timeline: '2 Working Days (3-Day Countdown)',
      description: 'Wait 2 working days before your withdrawal is removed from pending and credited.',
      features: [
        '3-Day Live Countdown displayed on VIP page',
        'Cashout removed from pending in 2 working days',
        'Priority queue processing',
        'Dedicated VIP support link',
      ],
      color: 'border-amber-400 bg-amber-50/40',
    },
    {
      id: 'vip3' as const,
      name: 'VIP 3 — Standard VIP Cashout',
      price: '₦9,850',
      badge: '🗓️ 7 WORKING DAYS',
      badgeBg: 'bg-amber-800 text-white',
      timeline: '7 Working Days',
      description: 'Economical VIP tier for scheduled cashout within 7 working days.',
      features: [
        'Cashout processed within 7 working days',
        'Verified VIP Status badge',
        'Zero hidden fees',
        'Budget-friendly VIP entry',
      ],
      color: 'border-amber-300 bg-white',
    },
  ];

  // SCENARIO: USER HAS NO PENDING WITHDRAWALS (AND IS NOT VIP / SHOW PREVIEW)
  if (!hasPendingWithdrawal && !user?.isVIP && !isVip2Active && !showPreviewAnyway) {
    return (
      <div className="min-h-screen bg-black text-white font-sans p-4 sm:p-6 pb-24">
        <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-200 transition-all active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-black text-white uppercase tracking-tight">
                VIP Cashout Accelerator
              </h1>
              <p className="text-[10px] font-bold text-amber-400 tracking-wider uppercase font-mono">
                9jacash VIP Privilege
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Star size={20} className="fill-amber-500" />
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 rounded-3xl p-6 text-black shadow-xl shadow-amber-300/20 border border-amber-300/40 text-center space-y-3">
            <div className="w-14 h-14 bg-black/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto text-black border border-black/10">
              <Banknote size={32} />
            </div>
            <div>
              <span className="px-3 py-0.5 bg-black text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest inline-block mb-1">
                9jacash Account Active
              </span>
              <h2 className="text-xl font-black text-black tracking-tight uppercase">
                No Pending Withdrawals
              </h2>
              <p className="text-xs font-semibold text-amber-950 leading-relaxed max-w-xs mx-auto mt-1">
                VIP Tier upgrades are specifically designed to clear pending cashout requests into direct bank credit.
              </p>
            </div>
          </div>

          {/* Notice Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-amber-400 border-b border-zinc-800 pb-3">
              <AlertCircle size={20} className="text-amber-400 shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                How VIP Cashout Works
              </h3>
            </div>

            <p className="text-xs text-zinc-300 font-medium leading-relaxed">
              When you initiate a withdrawal, your transaction status becomes <strong className="text-amber-400">Pending</strong>. You can then select a VIP package on this page to remove your cashout from pending:
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="p-3 bg-zinc-950/80 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-emerald-400 uppercase block">VIP 1 — ₦20,000</span>
                  <span className="text-[10px] text-zinc-400 font-semibold">Instant Cashout from pending</span>
                </div>
                <span className="px-2 py-1 bg-emerald-600 text-white font-extrabold text-[9px] rounded-lg uppercase">Instant</span>
              </div>

              <div className="p-3 bg-zinc-950/80 rounded-2xl border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-amber-400 uppercase block">VIP 2 — ₦15,000</span>
                  <span className="text-[10px] text-zinc-400 font-semibold">2 Working Days (Live 3-Day Countdown)</span>
                </div>
                <span className="px-2 py-1 bg-amber-500 text-black font-extrabold text-[9px] rounded-lg uppercase">2 Days</span>
              </div>

              <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-zinc-200 uppercase block">VIP 3 — ₦9,850</span>
                  <span className="text-[10px] text-zinc-400 font-semibold">7 Working Days standard cashout</span>
                </div>
                <span className="px-2 py-1 bg-zinc-700 text-white font-extrabold text-[9px] rounded-lg uppercase">7 Days</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={onGoToWithdraw || onBack}
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-extrabold rounded-2xl shadow-xl shadow-amber-300/60 transition-all active:scale-95 uppercase tracking-wider text-xs flex items-center justify-center space-x-2"
            >
              <span>Make a Cashout Request</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => setShowPreviewAnyway(true)}
              className="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-extrabold rounded-2xl transition-all text-xs uppercase tracking-wider"
            >
              Preview VIP Tier Packages
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full py-2.5 text-zinc-400 font-bold uppercase tracking-wider text-xs hover:text-white transition-colors"
            >
              Return to Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  // SCENARIO 3: SUBSCRIBED USER WITH PENDING WITHDRAWALS (OR IS VIP / PREVIEW)
  return (
    <div className="min-h-screen bg-black text-white font-sans p-4 sm:p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-200 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black text-white uppercase tracking-tight">
              VIP Membership Tiers
            </h1>
            <p className="text-[10px] font-bold text-amber-400 tracking-wider uppercase font-mono">
              9jacash Cashout Accelerator
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Star size={20} className="fill-amber-500" />
          </div>
        </div>

        {/* VIP 2 Countdown Timer (If VIP 2 active or pending) */}
        {isVip2Active && (
          <Vip2CountdownTimer timestamp={user?.vipActivationTimestamp || user?.lastUploadTimestamp} />
        )}

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 rounded-3xl p-6 text-black shadow-xl shadow-amber-300/20 border border-amber-300/40 relative overflow-hidden text-center space-y-3">
          <div className="w-16 h-16 bg-black/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto text-black border border-black/10">
            <Zap size={36} fill="currentColor" />
          </div>
          <div>
            <span className="px-3 py-1 bg-black text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-1">
              Select Cashout Speed
            </span>
            <h2 className="text-2xl font-black text-black tracking-tight uppercase">
              Upgrade Your VIP Cashout
            </h2>
            <p className="text-xs text-amber-950 font-semibold leading-relaxed max-w-xs mx-auto mt-1">
              Choose your VIP package to clear pending withdrawals and credit your bank account.
            </p>
          </div>
        </div>

        {/* VIP Tiers List */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 ml-1">
            <ShieldCheck size={16} className="text-amber-400" />
            Available VIP Tiers
          </h3>

          {vipTiers.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`cursor-pointer rounded-3xl p-5 border-2 transition-all shadow-md relative overflow-hidden ${
                  isSelected
                    ? 'border-amber-500 bg-zinc-900 shadow-amber-300/20 ring-2 ring-amber-500'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Header of Tier Card */}
                <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${tier.badgeBg}`}>
                      {tier.badge}
                    </span>
                    <h4 className="text-lg font-black text-white mt-1 uppercase tracking-tight">
                      {tier.name}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black text-amber-400 tracking-tight block">
                      {tier.price}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">
                      One-time fee
                    </span>
                  </div>
                </div>

                {/* Description & Timeline */}
                <div className="py-3 space-y-2">
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800 flex items-center space-x-2 text-xs font-extrabold text-amber-300">
                    <Clock size={16} className="text-amber-400 shrink-0" />
                    <span>Cashout Timeline: {tier.timeline}</span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-1.5 pt-1">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-xs text-zinc-300 font-semibold">
                        <Check size={14} className="text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Selection Radio / Indicator */}
                <div className="pt-2 flex items-center justify-between border-t border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-amber-500 bg-amber-400' : 'border-zinc-700'}`}>
                      {isSelected && <Check size={12} className="text-black font-bold" />}
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-200">
                      {isSelected ? 'Selected Package' : 'Click to Select'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={() => onProceed(selectedTier)}
            className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-extrabold rounded-2xl shadow-xl shadow-amber-300/60 transition-all active:scale-95 uppercase tracking-wider text-xs flex items-center justify-center space-x-2"
          >
            <span>Proceed to Pay {vipTiers.find(t => t.id === selectedTier)?.price}</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 text-zinc-400 font-bold uppercase tracking-wider text-xs hover:text-white transition-colors"
          >
            Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default UpgradeProposal;
