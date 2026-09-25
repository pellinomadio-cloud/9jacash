import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { User } from '../types';
import { FortuneWheel, SpinPrize } from './FortuneWheel';
import { casinoAudio } from './casino/CasinoAudio';

interface RewardsProps {
  user: User;
  currentDay: number;
  canClaim: boolean;
  onClaim: () => void;
  lastClaimedTimestamp: number;
  onSpinWin: (amount: number, prizeLabel: string) => void;
  onBack: () => void;
}

const LIVE_WINNERS = [
  { id: 'w1', name: 'Emeka O.', state: 'Lagos', prize: '₦500,000', badge: 'JACKPOT', time: '2m ago' },
  { id: 'w2', name: 'Amina K.', state: 'Kano', prize: '₦200,000', badge: 'High Roller', time: '5m ago' },
  { id: 'w3', name: 'David P.', state: 'Abuja', prize: '₦100,000', badge: 'Mega Cash', time: '11m ago' },
  { id: 'w4', name: 'Blessing U.', state: 'Port Harcourt', prize: '₦75,000', badge: 'Royal Win', time: '16m ago' },
  { id: 'w5', name: 'Ibrahim S.', state: 'Kaduna', prize: '₦50,000', badge: 'Gold Cash', time: '23m ago' },
  { id: 'w6', name: 'Chioma N.', state: 'Enugu', prize: '₦35,000', badge: 'Diamond', time: '31m ago' },
  { id: 'w7', name: 'Tunde B.', state: 'Ogun', prize: '₦200,000', badge: 'High Roller', time: '42m ago' },
  { id: 'w8', name: 'Ngozi A.', state: 'Asaba', prize: '₦500,000', badge: 'JACKPOT', time: '1h ago' },
];

export const Rewards: React.FC<RewardsProps> = ({
  user,
  currentDay,
  canClaim,
  onClaim,
  lastClaimedTimestamp,
  onSpinWin,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'spin' | 'streak' | 'winners'>('spin');
  const [streakTimeLeft, setStreakTimeLeft] = useState('');
  const [spinTimeLeft, setSpinTimeLeft] = useState('');
  const [soundMuted, setSoundMuted] = useState(!casinoAudio.enabled);

  // Generate days 1 to 100 for milestone streak
  const days = Array.from({ length: 100 }, (_, i) => i + 1);

  // 100-Day Streak Timer countdown
  useEffect(() => {
    if (canClaim) {
      setStreakTimeLeft('00:00:00');
      return;
    }

    const updateStreakTimer = () => {
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const nextClaimTime = (lastClaimedTimestamp || 0) + twentyFourHours;
      const diff = nextClaimTime - now;

      if (diff <= 0) {
        setStreakTimeLeft('00:00:00');
        return;
      }

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setStreakTimeLeft(`${h.toString().padStart(2, '0')}h : ${m.toString().padStart(2, '0')}m : ${s.toString().padStart(2, '0')}s`);
    };

    updateStreakTimer();
    const interval = setInterval(updateStreakTimer, 1000);
    return () => clearInterval(interval);
  }, [canClaim, lastClaimedTimestamp]);

  // Daily Spin 24-Hour Timer countdown
  const canSpin = !user.lastDailySpinTimestamp || (Date.now() - user.lastDailySpinTimestamp >= 24 * 60 * 60 * 1000);

  useEffect(() => {
    if (canSpin) {
      setSpinTimeLeft('00:00:00');
      return;
    }

    const updateSpinTimer = () => {
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const nextSpinTime = (user.lastDailySpinTimestamp || 0) + twentyFourHours;
      const diff = nextSpinTime - now;

      if (diff <= 0) {
        setSpinTimeLeft('00:00:00');
        return;
      }

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setSpinTimeLeft(`${h.toString().padStart(2, '0')}h : ${m.toString().padStart(2, '0')}m : ${s.toString().padStart(2, '0')}s`);
    };

    updateSpinTimer();
    const interval = setInterval(updateSpinTimer, 1000);
    return () => clearInterval(interval);
  }, [canSpin, user.lastDailySpinTimestamp]);

  const handleToggleSound = () => {
    casinoAudio.enabled = !casinoAudio.enabled;
    setSoundMuted(!casinoAudio.enabled);
  };

  const handleWheelWin = (prize: SpinPrize) => {
    onSpinWin(prize.amount, prize.badge);
  };

  const progressPercentage = Math.min(((currentDay - 1) / 100) * 100, 100);

  return (
    <div className="bg-black min-h-screen text-white pb-28 animate-in fade-in duration-500">
      
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              casinoAudio.playButtonClick();
              onBack();
            }}
            className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
          >
            <Icons.ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Rewards & Fortune</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                DAILY
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400">Spin the wheel & claim your daily bonus</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mute/Unmute toggle */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {soundMuted ? <Icons.VolumeX size={16} /> : <Icons.Volume2 size={16} className="text-amber-400" />}
          </button>

          {/* User Balance Capsule */}
          <div className="bg-zinc-900 border border-amber-500/30 px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-inner">
            <Icons.Banknote size={13} className="text-amber-400" />
            <span className="text-xs font-mono font-black text-amber-300">
              ₦{user.balance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-5">
        
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800/80 shadow-inner">
          <button
            onClick={() => {
              casinoAudio.playButtonClick();
              setActiveTab('spin');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center ${
              activeTab === 'spin'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-[1.02]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1">
              <span>🎡 Daily Spin</span>
              {canSpin && (
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
              )}
            </span>
            <span className={`text-[9px] font-bold ${activeTab === 'spin' ? 'text-amber-950' : 'text-amber-400'}`}>
              WIN ₦500K
            </span>
          </button>

          <button
            onClick={() => {
              casinoAudio.playButtonClick();
              setActiveTab('streak');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center ${
              activeTab === 'streak'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-[1.02]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1">
              <span>📅 Check-in</span>
              {canClaim && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              )}
            </span>
            <span className={`text-[9px] font-bold ${activeTab === 'streak' ? 'text-emerald-950' : 'text-emerald-400'}`}>
              ₦30,000/DAY
            </span>
          </button>

          <button
            onClick={() => {
              casinoAudio.playButtonClick();
              setActiveTab('winners');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center ${
              activeTab === 'winners'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700 scale-[1.02]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🏆 Winners</span>
            <span className="text-[9px] font-bold text-zinc-400">LIVE FEED</span>
          </button>
        </div>

        {/* TAB 1: REAL MATURE DAILY FORTUNE WHEEL */}
        {activeTab === 'spin' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            
            {/* Header Description Card */}
            <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-3.5 text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-center space-x-1.5 mb-1 text-amber-300">
                <Icons.Sparkles size={14} className="animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-glow-gold">
                  CERTIFIED CASINO FORTUNE RADAR
                </span>
                <Icons.Sparkles size={14} className="animate-pulse" />
              </div>
              <p className="text-xs text-zinc-300 leading-snug">
                Spin the wheel once every 24 hours to win guaranteed instant cash prizes up to <span className="font-black text-amber-300 font-mono">₦500,000</span> directly deposited to your Available Balance!
              </p>
            </div>

            {/* The Realistic Fortune Wheel Component */}
            <div className="bg-zinc-950 border border-zinc-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
              <FortuneWheel
                user={user}
                canSpin={canSpin}
                timeUntilNextSpin={spinTimeLeft}
                onSpinWin={handleWheelWin}
              />
            </div>

            {/* How It Works & Guarantees */}
            <div className="grid grid-cols-2 gap-2.5 text-[11px]">
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 space-y-1">
                <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
                  <Icons.ShieldCheck size={14} className="text-amber-400" />
                  <span>Fair & Verified</span>
                </div>
                <p className="text-zinc-400 text-[10px] leading-relaxed">
                  Real physics engine with authentic peg clicks and random weighted odds.
                </p>
              </div>

              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 space-y-1">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                  <Icons.Zap size={14} className="text-emerald-400" />
                  <span>Instant Payout</span>
                </div>
                <p className="text-zinc-400 text-[10px] leading-relaxed">
                  Prizes credit immediately to your chix9ja account with zero delay.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: 100-DAY CHECK-IN STREAK */}
        {activeTab === 'streak' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            
            {/* Progress Card */}
            <div className="bg-zinc-900 border border-emerald-500/30 rounded-2xl p-4 shadow-lg space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <Icons.Trophy size={14} className="text-emerald-400" />
                  100-Day Streak Progress
                </span>
                <span className="font-mono font-black text-emerald-400">
                  {currentDay - 1} / 100 Days ({Math.round(progressPercentage)}%)
                </span>
              </div>
              <div className="w-full bg-black rounded-full h-3.5 border border-zinc-800 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Daily ₦30,000 Action Card */}
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-emerald-500/40 rounded-2xl p-5 text-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-400/50 mx-auto flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <Icons.Calendar size={22} className="text-emerald-400" />
              </div>

              {!canClaim ? (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-400 block">
                    Today's ₦30,000 already collected. Next check-in in:
                  </span>
                  <div className="bg-black/80 border border-zinc-800 rounded-xl py-2.5 px-4 inline-block shadow-inner">
                    <span className="text-2xl font-mono font-black text-emerald-400 tracking-wider">
                      {streakTimeLeft}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Streak will unlock Day {currentDay} once the countdown expires.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    Day {currentDay} Bonus Ready!
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-black text-white">
                    ₦30,000 Cash
                  </div>
                  <button
                    onClick={() => {
                      casinoAudio.playButtonClick();
                      casinoAudio.playKaChing();
                      casinoAudio.playCoinShower(10);
                      onClaim();
                      casinoAudio.playCashout();
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 hover:from-emerald-300 hover:to-green-400 text-black font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all cursor-pointer active:scale-95"
                  >
                    Claim ₦30,000 for Day {currentDay} 🎉
                  </button>
                </div>
              )}
            </div>

            {/* Days Milestone Matrix */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span className="font-bold text-zinc-300">100-Day Milestones</span>
                <span className="text-[10px]">Tap to inspect day payout</span>
              </div>

              <div className="grid grid-cols-4 gap-2 pb-6 max-h-96 overflow-y-auto pr-1">
                {days.map((day) => {
                  const isClaimed = day < currentDay;
                  const isCurrent = day === currentDay;

                  return (
                    <div
                      key={day}
                      className={`aspect-[4/5] rounded-xl flex flex-col items-center justify-center p-1.5 border transition-all ${
                        isClaimed
                          ? 'bg-zinc-950 border-emerald-500/40 text-emerald-300'
                          : isCurrent && canClaim
                            ? 'bg-zinc-900 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)] scale-105 z-10'
                            : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-500'
                      }`}
                    >
                      <span className="text-[10px] font-semibold mb-0.5">Day {day}</span>
                      <span className={`text-[10px] font-mono font-black ${isClaimed || isCurrent ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        ₦30,000
                      </span>
                      {isClaimed ? (
                        <span className="mt-1 text-[8px] bg-emerald-950 text-emerald-300 font-bold px-1.5 py-0.2 rounded-full border border-emerald-500/40">
                          ✓ Claimed
                        </span>
                      ) : isCurrent ? (
                        <span className={`mt-1 text-[8px] font-bold px-1.5 py-0.2 rounded-full ${canClaim ? 'bg-emerald-400 text-black animate-pulse' : 'bg-zinc-800 text-zinc-400'}`}>
                          {canClaim ? 'READY' : 'WAIT'}
                        </span>
                      ) : (
                        <Icons.Lock size={11} className="mt-1 text-zinc-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: LIVE REWARDS & CASHOUT AUDIT */}
        {activeTab === 'winners' && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Icons.Trophy size={14} className="text-amber-400" />
                  Verified Spin & Rewards Payouts
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  LIVE AUTOMATED
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Transparent live stream of high-roller daily spin drops and daily streak cashouts.
              </p>
            </div>

            <div className="space-y-2">
              {LIVE_WINNERS.map((winner) => (
                <div
                  key={winner.id}
                  className="bg-zinc-950 border border-zinc-800/90 rounded-xl p-3 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-400/40 flex items-center justify-center font-black text-amber-300 text-xs">
                      {winner.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{winner.name}</span>
                        <span className="text-[10px] text-zinc-500 font-normal">({winner.state})</span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-bold">
                        {winner.badge}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black font-mono text-emerald-400">
                      +{winner.prize}
                    </div>
                    <span className="text-[9px] text-zinc-500 font-medium">
                      {winner.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default Rewards;
