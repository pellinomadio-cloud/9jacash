import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { User } from '../types';
import { quizQuestions, QuizQuestion } from './quizQuestions';
import { useAppChannels } from '../firebase';
import { AviatorGame } from './casino/AviatorGame';
import { casinoAudio } from './casino/CasinoAudio';
import { 
  Plane, 
  Flame, 
  Coins, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RotateCcw, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Users, 
  ArrowLeft,
  Zap,
  Crown,
  Trophy,
  Dices,
  CircleDollarSign,
  Gamepad2,
  CheckCircle2
} from 'lucide-react';

interface TaskPageProps {
  user: User;
  onTelegramClaim: () => void;
  onTelegramClaim2: () => void;
  onWhatsAppClaim: () => void;
  onDailyWaitlistJoin?: () => void;
  onDailyWaitlistClaim?: () => void;
  onBiggyWinClaim: () => void;
  onGameRewardsClaim: () => void;
  onGameResult: (win: boolean, customAmount?: number, customDesc?: string, skipAlert?: boolean) => void;
  onBack: () => void;
  onDeposit?: () => void;
  mode?: 'quiz' | 'telegram' | 'all';
}

const CASINO_WINNERS = [
  { name: 'Emeka_O', game: 'Aviator', win: '₦58,400', mult: '5.84x' },
  { name: 'Tunde_Vip', game: 'Coin Flip', win: '₦30,000', mult: '2.00x' },
  { name: 'Amina_Gold', game: 'Color Spin', win: '₦62,500', mult: '5.00x' },
  { name: 'David_Pro', game: 'Aviator', win: '₦142,000', mult: '14.20x' },
  { name: 'Blessing_X', game: 'Aviator', win: '₦85,000', mult: '8.50x' },
  { name: 'Ibrahim_K', game: 'Coin Flip', win: '₦40,000', mult: '2.00x' }
];

const TaskPage: React.FC<TaskPageProps> = ({ 
  user, 
  onTelegramClaim, 
  onTelegramClaim2, 
  onWhatsAppClaim, 
  onDailyWaitlistJoin,
  onDailyWaitlistClaim,
  onBiggyWinClaim,
  onGameRewardsClaim,
  onGameResult, 
  onBack, 
  onDeposit,
  mode = 'all' 
}) => {
  const { channels } = useAppChannels();

  // Strict sanitization of user balance to eradicate NaN
  const safeUserBalance = typeof user?.balance === 'number' && !isNaN(user.balance) ? Math.max(0, user.balance) : Math.max(0, Number(user?.balance) || 0);

  // Ticker for live countdown timer
  const [now, setNow] = useState<number>(Date.now());
  const [jackpotAmount, setJackpotAmount] = useState<number>(18450250);
  const [casinoCategory, setCasinoCategory] = useState<'all' | 'crash' | 'table' | 'trivia'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      // Increment jackpot randomly for live casino thrill
      setJackpotAmount(prev => prev + Math.floor(Math.random() * 45) + 10);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync sound
  useEffect(() => {
    casinoAudio.enabled = soundEnabled;
  }, [soundEnabled]);

  // Active Game State: 'none' (Casino Hub Lobby) or chosen game ID
  const [activeGame, setActiveGame] = useState<'none' | 'aviator' | 'quiz' | 'coinflip' | 'colorspin'>('none');

  // Brain Quiz States
  const [gameStep, setGameStep] = useState<'intro' | 'playing' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isWin, setIsWin] = useState(false);

  // Coin Flip States
  const [coinChoice, setCoinChoice] = useState<'head' | 'tail' | null>(null);
  const [coinBet, setCoinBet] = useState<string>('500');
  const [coinFlipping, setCoinFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<'head' | 'tail' | null>(null);
  const [coinGameOutcome, setCoinGameOutcome] = useState<'win' | 'lose' | null>(null);

  // Color Spin States
  const [colorChoice, setColorChoice] = useState<'red' | 'blue' | 'gold' | null>(null);
  const [colorBet, setColorBet] = useState<string>('500');
  const [colorSpinning, setColorSpinning] = useState(false);
  const [colorResult, setColorResult] = useState<'red' | 'blue' | 'gold' | null>(null);
  const [colorGameOutcome, setColorGameOutcome] = useState<'win' | 'lose' | null>(null);
  const [wheelRotation, setWheelRotation] = useState<number>(0);

  // Daily limits and checks
  const getEffectiveQuizCount = () => {
    const today = new Date();
    const lastQuiz = user.lastQuizTimestamp ? new Date(user.lastQuizTimestamp) : null;
    if (!lastQuiz || today.toDateString() !== lastQuiz.toDateString()) {
      return 0;
    }
    return user.dailyQuizCount || 0;
  };

  const canPlayQuiz = () => {
    return getEffectiveQuizCount() < 20;
  };

  const canClaimTelegram = () => {
    const nowTs = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const lastClaim = user.lastTelegramClaimTimestamp || 0;
    return nowTs - lastClaim >= twentyFourHours;
  };

  const canClaimWhatsApp = () => {
    const nowTs = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const lastClaim = user.lastWhatsAppClaimTimestamp || 0;
    return nowTs - lastClaim >= twentyFourHours;
  };

  // Brain Quiz flow
  const startQuiz = () => {
    const randomIndex = Math.floor(Math.random() * quizQuestions.length);
    setCurrentQuestion(quizQuestions[randomIndex]);
    setGameStep('playing');
    setSelectedOption(null);
    casinoAudio.playChipStack();
  };

  const handleQuizAnswer = (option: string) => {
    if (!currentQuestion) return;
    
    setSelectedOption(option);
    const win = option === currentQuestion.answer;
    setIsWin(win);
    
    setTimeout(() => {
      setGameStep('result');
      if (win) {
        casinoAudio.playKaChing();
        casinoAudio.playCashout();
      } else {
        casinoAudio.playLossWhammy();
      }
      onGameResult(win, undefined, undefined, true);
    }, 600);
  };

  // Coin Flip Flow
  const startCoinFlip = () => {
    if (!coinChoice) {
      alert("Please choose Head or Tail first!");
      return;
    }
    const betAmount = parseInt(coinBet, 10);
    if (isNaN(betAmount) || betAmount < 200) {
      alert("Minimum bet is ₦200!");
      return;
    }
    if (betAmount > safeUserBalance) {
      alert("You do not have enough balance for this bet!");
      return;
    }

    casinoAudio.playChipStack();
    casinoAudio.playCoinToss();
    setCoinFlipping(true);
    setCoinResult(null);
    setCoinGameOutcome(null);

    // Roll result after 2s of spinning coin animation
    setTimeout(() => {
      const rolledCoin = Math.random() < 0.5 ? 'head' : 'tail';
      const win = rolledCoin === coinChoice;
      
      setCoinResult(rolledCoin);
      setCoinFlipping(false);
      setCoinGameOutcome(win ? 'win' : 'lose');
      
      if (win) {
        casinoAudio.playKaChing();
        casinoAudio.playCoinShower(10);
      } else {
        casinoAudio.playLossWhammy();
      }

      onGameResult(win, betAmount, win ? "Coin Flip Double or Nothing Win" : "Coin Flip Loss Penalty", true);
    }, 2000);
  };

  // Lucky Color Spin Flow
  const startColorSpin = () => {
    if (!colorChoice) {
      alert("Please select a color first!");
      return;
    }
    const betAmount = parseInt(colorBet, 10);
    if (isNaN(betAmount) || betAmount < 200) {
      alert("Minimum bet is ₦200!");
      return;
    }
    if (betAmount > safeUserBalance) {
      alert("You do not have enough balance for this bet!");
      return;
    }

    casinoAudio.playChipStack();
    casinoAudio.playRouletteBall();
    setColorSpinning(true);
    setColorResult(null);
    setColorGameOutcome(null);

    // Red: 45% (0-0.45), Blue: 45% (0.45-0.90), Gold: 10% (0.90-1.0)
    const r = Math.random();
    let rolledColor: 'red' | 'blue' | 'gold';
    let targetPhi = 0;

    if (r < 0.45) {
      rolledColor = 'red';
      targetPhi = 15 + Math.floor(Math.random() * 132);
    } else if (r < 0.90) {
      rolledColor = 'blue';
      targetPhi = 177 + Math.floor(Math.random() * 132);
    } else {
      rolledColor = 'gold';
      targetPhi = 329 + Math.floor(Math.random() * 26);
    }

    const segmentDeg = (360 - targetPhi) % 360;
    const currentRotBase = wheelRotation - (wheelRotation % 360);
    const newRot = currentRotBase + 1440 + segmentDeg;
    setWheelRotation(newRot);

    // Wait for the transition to finish (2.5s)
    setTimeout(() => {
      const win = rolledColor === colorChoice;
      let wonAmount = betAmount; // Payout is 2x for Red/Blue (net profit is betAmount)
      if (rolledColor === 'gold') {
        wonAmount = betAmount * 4; // Payout is 5x for Gold (net profit is 4x betAmount)
      }

      setColorResult(rolledColor);
      setColorSpinning(false);
      setColorGameOutcome(win ? 'win' : 'lose');

      if (win) {
        casinoAudio.playCasinoBell(3);
        casinoAudio.playCoinShower(12);
      } else {
        casinoAudio.playLossWhammy();
      }

      onGameResult(win, win ? wonAmount : betAmount, win ? `Lucky Color Spin Win - ${rolledColor.toUpperCase()}` : `Lucky Color Spin Loss - ${rolledColor.toUpperCase()}`, true);
    }, 2500);
  };

  // If Aviator game is chosen, render full-screen immersive Aviator view
  if (activeGame === 'aviator') {
    return (
      <AviatorGame 
        user={user} 
        onGameResult={onGameResult} 
        onExit={() => setActiveGame('none')} 
        onDeposit={onDeposit}
      />
    );
  }

  return (
    <div className="px-4 py-4 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 text-zinc-100 font-sans">
      
      {/* 1. DAILY TASKS VIEW (Telegram & WhatsApp joining) */}
      {(mode === 'telegram' || mode === 'all') && (
        <div className="space-y-5">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-full text-emerald-400 mb-1">
              <Icons.Star size={30} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Daily Rewards & Tasks</h2>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Complete simple community check-ins to earn daily real cash bonuses.
            </p>
          </div>

          <div className="space-y-3.5">
            {/* Telegram task */}
            <div className="bg-zinc-900/90 rounded-2xl p-4 shadow-sm border border-zinc-800 space-y-3">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                  <Icons.Send size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-sm">Join Telegram Channel</h3>
                  <p className="text-xs text-zinc-400">Earn ₦2,000 daily member reward.</p>
                </div>
                {canClaimTelegram() ? (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase">Available</span>
                ) : (
                  <span className="text-[10px] font-bold bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded uppercase">Claimed</span>
                )}
              </div>

              <button 
                onClick={() => {
                  window.open(channels.telegramChannel, '_blank');
                  onTelegramClaim();
                }}
                disabled={!canClaimTelegram()}
                className={`w-full py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95 text-xs uppercase tracking-wider ${canClaimTelegram() ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
              >
                <Icons.Send size={16} />
                <span>{canClaimTelegram() ? 'Join & Claim ₦2,000' : 'Already Claimed Today'}</span>
              </button>
            </div>

            {/* WhatsApp task */}
            <div className="bg-zinc-900/90 rounded-2xl p-4 shadow-sm border border-zinc-800 space-y-3">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                  <Icons.MessageCircle size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-sm">Join WhatsApp Channel</h3>
                  <p className="text-xs text-zinc-400">Earn ₦9,600 daily member reward.</p>
                </div>
                {canClaimWhatsApp() ? (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase">Available</span>
                ) : (
                  <span className="text-[10px] font-bold bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded uppercase">Claimed</span>
                )}
              </div>

              <button 
                onClick={() => {
                  window.open(channels.whatsappChannel, '_blank');
                  onWhatsAppClaim();
                }}
                disabled={!canClaimWhatsApp()}
                className={`w-full py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95 text-xs uppercase tracking-wider ${canClaimWhatsApp() ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
              >
                <Icons.MessageCircle size={16} />
                <span>{canClaimWhatsApp() ? 'Join & Claim ₦9,600' : 'Already Claimed Today'}</span>
              </button>
            </div>

            {/* Users Promo Waitlist Card */}
            {(() => {
              const ONE_HOUR = 60 * 60 * 1000;
              const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
              const joinedAt = user.dailyWaitlistJoinedAt || 0;
              const claimedAt = user.dailyWaitlistClaimedAt || 0;
              const timeSinceJoin = now - joinedAt;
              
              const isJoined = joinedAt > 0;
              const isHourElapsed = isJoined && timeSinceJoin >= ONE_HOUR;
              const isClaimedThisWeek = isJoined && claimedAt >= joinedAt;
              const canJoinNew = !isJoined || timeSinceJoin >= ONE_WEEK;

              const remainingWaitMs = Math.max(0, ONE_HOUR - timeSinceJoin);
              const remainingCooldownMs = Math.max(0, ONE_WEEK - timeSinceJoin);

              const minutesLeft = Math.floor(remainingWaitMs / (1000 * 60));
              const secondsLeft = Math.floor((remainingWaitMs % (1000 * 60)) / 1000);
              const timerStr = `${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;

              const daysCooldown = Math.floor(remainingCooldownMs / (24 * 60 * 60 * 1000));
              const hoursCooldown = Math.floor((remainingCooldownMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

              return (
                <div className="bg-gradient-to-b from-amber-950/40 via-zinc-900 to-zinc-900 rounded-2xl p-4 shadow-lg border border-amber-500/40 space-y-3 relative overflow-hidden">
                  <div className="flex items-center space-x-3.5 relative z-10">
                    <div className="w-11 h-11 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 border border-amber-500/30">
                      <Icons.Sparkles size={22} className="animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-white text-xs uppercase tracking-wide">Users Promo Waitlist</h3>
                        {canJoinNew ? (
                          <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase">Available</span>
                        ) : isClaimedThisWeek ? (
                          <span className="text-[10px] font-black bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded uppercase">Claimed</span>
                        ) : isHourElapsed ? (
                          <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400 px-2 py-0.5 rounded uppercase animate-bounce">Reward Ready!</span>
                        ) : (
                          <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded uppercase animate-pulse">Waitlist Active</span>
                        )}
                      </div>
                      <p className="text-xs text-amber-200/90 font-medium mt-0.5">
                        Wait for 1 hour to receive <strong className="text-yellow-300 font-bold">₦500,000</strong>.
                      </p>
                    </div>
                  </div>

                  {isJoined && !isHourElapsed && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between items-center text-[11px] font-mono font-bold">
                        <span className="text-amber-300 flex items-center gap-1">
                          <Icons.Clock size={12} />
                          Waitlist Timer
                        </span>
                        <span className="text-yellow-300 font-bold">{timerStr}</span>
                      </div>
                      <div className="w-full bg-zinc-950 h-2 rounded-full border border-amber-500/20 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
                          style={{ width: `${Math.min(100, (timeSinceJoin / ONE_HOUR) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-1">
                    {canJoinNew ? (
                      <button 
                        onClick={() => onDailyWaitlistJoin && onDailyWaitlistJoin()}
                        className="w-full py-3 rounded-xl font-black shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black hover:brightness-110 text-xs uppercase tracking-wider"
                      >
                        <Icons.Sparkles size={16} />
                        <span>Join Users Promo Waitlist (₦500,000)</span>
                      </button>
                    ) : isClaimedThisWeek ? (
                      <button 
                        disabled
                        className="w-full py-3 rounded-xl font-bold bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed flex items-center justify-center space-x-2 text-xs"
                      >
                        <Icons.CheckCircle size={16} className="text-emerald-500" />
                        <span>Claimed this week (Unlocks in {daysCooldown}d {hoursCooldown}h)</span>
                      </button>
                    ) : isHourElapsed ? (
                      <button 
                        onClick={() => onDailyWaitlistClaim && onDailyWaitlistClaim()}
                        className="w-full py-3 rounded-xl font-black shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-95 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-black text-xs uppercase tracking-wider animate-pulse"
                      >
                        <Icons.Gift size={16} />
                        <span>Claim ₦500,000 Dashboard Reward!</span>
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="w-full py-3 rounded-xl font-bold bg-amber-950/60 border border-amber-500/30 text-amber-300 cursor-not-allowed flex items-center justify-center space-x-2 text-xs font-mono"
                      >
                        <Icons.Clock size={16} />
                        <span>Waitlist Active — {timerStr} left</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 2. CASINO & GAMING ARENA VIEW */}
      {mode === 'quiz' && (
        <div className="space-y-5">
          
          {/* CASINO LOBBY VIEW */}
          {activeGame === 'none' && (
            <>
              {/* Grand Casino Header Banner */}
              <div className="relative rounded-3xl p-5 bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.12)] overflow-hidden space-y-4">
                {/* Decorative neon casino flare */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-mono">
                      LIVE CASINO ARENA
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const next = !soundEnabled;
                        setSoundEnabled(next);
                        if (next) {
                          casinoAudio.enabled = true;
                          casinoAudio.playKaChing();
                        }
                      }}
                      className="p-1.5 bg-zinc-800/80 hover:bg-zinc-700 rounded-xl text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
                      title={soundEnabled ? 'Mute Casino Sound FX' : 'Enable Casino Sound FX'}
                    >
                      {soundEnabled ? <Volume2 size={15} className="text-amber-400" /> : <VolumeX size={15} className="text-zinc-500" />}
                    </button>
                    <div className="text-[10px] font-bold text-zinc-400 bg-zinc-900/90 px-2.5 py-1 rounded-full border border-zinc-800 font-mono">
                      7,420 PLAYERS
                    </div>
                  </div>
                </div>

                {/* Grand Title with Casino Crest */}
                <div className="text-center space-y-1 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-[11px] font-extrabold uppercase tracking-widest">
                    <Crown size={14} className="text-amber-400" />
                    <span>CHIX9JA ROYAL CASINO</span>
                    <Dices size={14} className="text-amber-400" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)]">
                    PLAY & WIN BIG
                  </h1>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Instant automated payouts directly into your balance. Provably fair 98.4% RTP.
                  </p>
                </div>

                {/* Progressive Mega Jackpot Display */}
                <div className="relative z-10 bg-gradient-to-r from-amber-950/60 via-zinc-900/90 to-amber-950/60 p-3.5 rounded-2xl border border-amber-500/30 text-center shadow-[inset_0_1px_15px_rgba(245,158,11,0.15)]">
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400">
                    <Sparkles size={12} className="animate-spin text-yellow-300" />
                    <span>PROGRESSIVE CASINO JACKPOT</span>
                    <Sparkles size={12} className="animate-spin text-yellow-300" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 tracking-wider mt-0.5">
                    ₦{jackpotAmount.toLocaleString()}
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                    Drops on any round across all games
                  </div>
                </div>

                {/* User Balance & Chips Bar */}
                <div className="flex justify-between items-center text-xs pt-1 px-1 text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <Coins size={15} className="text-amber-400" />
                    <span className="text-zinc-400">Your Bankroll:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ₦{safeUserBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                    VIP HIGH ROLLER
                  </div>
                </div>
              </div>

              {/* Real-Time Live Winners Marquee Ticker */}
              <div className="bg-zinc-900/90 rounded-2xl p-2.5 border border-zinc-800 flex items-center gap-2 overflow-hidden shadow-inner">
                <div className="flex items-center gap-1 text-[10px] font-black text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-1 rounded-lg shrink-0 border border-amber-500/20">
                  <Trophy size={12} />
                  <span>HOT WINS</span>
                </div>
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar whitespace-nowrap text-xs font-mono">
                  {CASINO_WINNERS.map((w, i) => (
                    <div key={i} className="flex items-center gap-1.5 shrink-0 text-zinc-300">
                      <span className="text-zinc-400 font-bold">{w.name}</span>
                      <span className="text-zinc-500">in {w.game}:</span>
                      <span className="text-emerald-400 font-bold">{w.win}</span>
                      <span className="text-purple-400 text-[10px]">({w.mult})</span>
                      {i < CASINO_WINNERS.length - 1 && <span className="text-zinc-700">•</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Casino Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'all', label: '🔥 All Games' },
                  { id: 'crash', label: '🚀 Aviator & Crash' },
                  { id: 'table', label: '🪙 Table & Coins' },
                  { id: 'trivia', label: '🧠 VIP Trivia' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCasinoCategory(cat.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider border ${
                      casinoCategory === cat.id
                        ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Casino Sound FX Soundboard Bar */}
              <div className="bg-zinc-950/80 p-3 rounded-2xl border border-amber-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Volume2 size={13} className="text-amber-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">Casino Sound FX</span>
                  </div>
                  <span className="text-[9px] text-zinc-400 font-mono">Tap to trigger authentic audio</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  <button
                    type="button"
                    onClick={() => { casinoAudio.enabled = true; casinoAudio.playKaChing(); }}
                    className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-amber-300 transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <span>💰 Ka-Ching</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { casinoAudio.enabled = true; casinoAudio.playCoinShower(14); }}
                    className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-amber-300 transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <span>🪙 Coin Shower</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { casinoAudio.enabled = true; casinoAudio.playSlotLeverPull(); }}
                    className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-amber-300 transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <span>🎰 Slot Spin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { casinoAudio.enabled = true; casinoAudio.playBigWinSirens(); }}
                    className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-amber-300 transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <span>🚨 Big Win Siren</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { casinoAudio.enabled = true; casinoAudio.playDiceRoll(); }}
                    className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-amber-300 transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <span>🎲 Dice Roll</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { casinoAudio.enabled = true; casinoAudio.playCardShuffle(); }}
                    className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 rounded-xl text-[10px] font-bold text-zinc-300 hover:text-amber-300 transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <span>🃏 Card Shuffle</span>
                  </button>
                </div>
              </div>

              {/* FEATURED GAME 1: AVIATOR CRASH GAME (Dark Gold Casino Edition) */}
              {(casinoCategory === 'all' || casinoCategory === 'crash') && (
                <div className="relative rounded-3xl p-5 bg-gradient-to-br from-[#1c1608] via-zinc-900 to-black border-2 border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.25)] space-y-4 overflow-hidden group hover:border-amber-400 transition-all duration-300">
                  {/* Glowing dark gold background aura */}
                  <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/25 transition-all" />

                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-700 flex items-center justify-center text-black shadow-[0_0_25px_rgba(245,158,11,0.6)] group-hover:scale-105 transition-transform">
                        <Plane size={28} className="animate-pulse text-black" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                            <span>Aviator Arena</span>
                            <span className="text-amber-400 text-xs">★ GOLD</span>
                          </h3>
                          <span className="text-[10px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            🔥 TOP EARNING
                          </span>
                        </div>
                        <p className="text-xs text-amber-200/80 font-medium mt-0.5">
                          Dark Gold Flight Radar • Multiplier climbs up to 100X • Cash out anytime!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Multiplier Feature Stats in Dark Gold & Accents */}
                  <div className="grid grid-cols-3 gap-2 relative z-10">
                    <div className="bg-black/60 p-2 rounded-xl border border-amber-500/25 text-center">
                      <div className="text-[10px] text-zinc-400 uppercase font-mono">Max Multiplier</div>
                      <div className="text-sm font-black font-mono text-amber-400">100.00x</div>
                    </div>
                    <div className="bg-black/60 p-2 rounded-xl border border-amber-500/25 text-center">
                      <div className="text-[10px] text-zinc-400 uppercase font-mono">Live Flight</div>
                      <div className="text-sm font-black font-mono text-emerald-400">Real-Time</div>
                    </div>
                    <div className="bg-black/60 p-2 rounded-xl border border-amber-500/25 text-center">
                      <div className="text-[10px] text-zinc-400 uppercase font-mono">Audio Mode</div>
                      <div className="text-sm font-black font-mono text-cyan-400">Melodic Synth</div>
                    </div>
                  </div>

                  {/* Launch CTA: Always accessible to view, tells user to fund wallet if balance < 200 */}
                  <div className="space-y-2 relative z-10">
                    <button
                      onClick={() => {
                        casinoAudio.playChip();
                        setActiveGame('aviator');
                      }}
                      className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-base uppercase tracking-wider rounded-2xl shadow-[0_10px_25px_rgba(245,158,11,0.35)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plane size={20} className="text-black" />
                      <span>{safeUserBalance < 200 ? 'ENTER AVIATOR (WATCH & PLAY)' : 'PLAY AVIATOR GOLD RADAR'}</span>
                    </button>
                    {safeUserBalance < 200 && (
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                        <span>Balance: <strong className="text-amber-400 font-mono">₦{safeUserBalance.toLocaleString()}</strong> (View Mode)</span>
                        {onDeposit ? (
                          <button
                            type="button"
                            onClick={onDeposit}
                            className="text-amber-400 font-bold underline hover:text-amber-300 transition-colors"
                          >
                            Fund Wallet to Bet
                          </button>
                        ) : (
                          <span className="text-amber-400">Min ₦200 required to place bets</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* GAME GRID: COIN FLIP, COLOR SPIN, AND QUIZ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Game 2: Double or Nothing (Vegas Coin Flip) */}
                {(casinoCategory === 'all' || casinoCategory === 'table') && (
                  <button 
                    onClick={() => {
                      casinoAudio.playChip();
                      setActiveGame('coinflip');
                      setCoinChoice(null);
                      setCoinResult(null);
                      setCoinGameOutcome(null);
                    }}
                    className="bg-zinc-900/90 rounded-3xl p-5 shadow-lg border border-amber-500/30 hover:border-amber-400 hover:bg-zinc-900 transition-all duration-300 group flex flex-col justify-between text-left space-y-4 cursor-pointer"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
                        <Coins size={24} />
                      </div>
                      <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        2X MULTIPLIER
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-black text-white uppercase text-base tracking-tight">Double or Nothing</h3>
                      <p className="text-xs text-zinc-400">
                        Predict Head or Tail to instantly double your bet! Fast 2-second flip.
                      </p>
                    </div>

                    <div className="w-full flex items-center justify-between text-xs font-mono pt-2 border-t border-zinc-800 text-zinc-500">
                      <span>RTP: 98.0%</span>
                      <span className="text-amber-400 font-bold group-hover:underline">Play Coin Flip →</span>
                    </div>
                  </button>
                )}

                {/* Game 3: Lucky Color Roulette Spin */}
                {(casinoCategory === 'all' || casinoCategory === 'table') && (
                  <button 
                    onClick={() => {
                      casinoAudio.playChip();
                      setActiveGame('colorspin');
                      setColorChoice(null);
                      setColorResult(null);
                      setColorGameOutcome(null);
                    }}
                    className="bg-zinc-900/90 rounded-3xl p-5 shadow-lg border border-emerald-500/30 hover:border-emerald-400 hover:bg-zinc-900 transition-all duration-300 group flex flex-col justify-between text-left space-y-4 cursor-pointer"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                        <RotateCcw size={24} />
                      </div>
                      <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        UP TO 5X MEGA
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-black text-white uppercase text-base tracking-tight">Roulette Color Spin</h3>
                      <p className="text-xs text-zinc-400">
                        Wager on Red (2x), Blue (2x), or Gold (5x) for mega wheel spins!
                      </p>
                    </div>

                    <div className="w-full flex items-center justify-between text-xs font-mono pt-2 border-t border-zinc-800 text-zinc-500">
                      <span>RTP: 97.6%</span>
                      <span className="text-emerald-400 font-bold group-hover:underline">Spin Wheel →</span>
                    </div>
                  </button>
                )}

                {/* Game 4: Brain Quiz Challenge */}
                {(casinoCategory === 'all' || casinoCategory === 'trivia') && (
                  <button 
                    onClick={() => {
                      casinoAudio.playChip();
                      setActiveGame('quiz');
                      setGameStep('intro');
                    }}
                    className="bg-zinc-900/90 rounded-3xl p-5 shadow-lg border border-fuchsia-500/30 hover:border-fuchsia-400 hover:bg-zinc-900 transition-all duration-300 group flex flex-col justify-between text-left space-y-4 cursor-pointer"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-fuchsia-400 border border-fuchsia-500/30 group-hover:scale-110 transition-transform">
                        <Gamepad2 size={24} />
                      </div>
                      <span className="text-[10px] font-black bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        ₦2,000 PER WIN
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-black text-white uppercase text-base tracking-tight">VIP Trivia Arena</h3>
                      <p className="text-xs text-zinc-400">
                        Answer trivia to win ₦2,000 per correct answer. 20 plays daily limit.
                      </p>
                    </div>

                    <div className="w-full flex items-center justify-between text-xs font-mono pt-2 border-t border-zinc-800 text-zinc-500">
                      <span>Plays Today: {getEffectiveQuizCount()}/20</span>
                      <span className="text-fuchsia-400 font-bold group-hover:underline">Play Trivia →</span>
                    </div>
                  </button>
                )}

              </div>
            </>
          )}

          {/* ACTIVE GAME 1: BRAIN QUIZ CHALLENGE */}
          {activeGame === 'quiz' && (
            <div className="bg-zinc-900 rounded-3xl p-6 border border-fuchsia-500/30 space-y-6 shadow-xl">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <span className="text-xs font-black text-fuchsia-400 font-mono uppercase tracking-wider">VIP Trivia Challenge</span>
                <button 
                  onClick={() => setActiveGame('none')}
                  className="text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-800 px-3 py-1 rounded-xl"
                >
                  Exit Game
                </button>
              </div>

              {gameStep === 'intro' && (
                <div className="text-center py-4 space-y-5">
                  <div className="inline-flex items-center justify-center p-4 bg-fuchsia-500/10 rounded-full text-fuchsia-400 border border-fuchsia-500/30">
                    <Gamepad2 size={36} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-white uppercase">Brain Quiz Challenge</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                      Test your knowledge! Correct answers credit you <span className="text-emerald-400 font-bold">₦2,000</span>, while incorrect ones deduct <span className="text-red-400 font-bold">₦1,000</span>.
                    </p>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
                    <div className="flex justify-between items-center text-xs text-zinc-400 font-medium">
                      <span>Daily Quiz Progress</span>
                      <span className="font-mono font-bold text-fuchsia-400">{getEffectiveQuizCount()}/20</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-fuchsia-600 to-blue-600 h-full transition-all duration-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]" 
                        style={{ width: `${Math.min((getEffectiveQuizCount() / 20) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={startQuiz}
                    disabled={!canPlayQuiz()}
                    className={`w-full py-4 font-black rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-sm ${
                      canPlayQuiz() 
                        ? 'bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white shadow-[0_10px_20px_rgba(217,70,239,0.25)]' 
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {canPlayQuiz() ? 'Start Quiz Challenge' : 'Daily Limit Reached'}
                  </button>
                </div>
              )}

              {gameStep === 'playing' && currentQuestion && (
                <div className="space-y-5 py-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 text-center">
                    <p className="text-white font-bold text-base leading-relaxed">{currentQuestion.question}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(option)}
                        disabled={selectedOption !== null}
                        className={`w-full py-3.5 px-5 text-left rounded-2xl font-medium transition-all transform active:scale-[0.98] border-2 flex items-center ${
                          selectedOption === option 
                            ? (option === currentQuestion.answer ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-red-500/20 border-red-500 text-red-400')
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-fuchsia-500 hover:bg-zinc-850'
                        }`}
                      >
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800 text-[11px] font-bold mr-3 border border-zinc-700">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm">{option}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {gameStep === 'result' && (
                <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-300">
                  <div className={`text-3xl font-black uppercase tracking-wider ${isWin ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-bounce' : 'text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}>
                    {isWin ? 'CORRECT! 🎉 +₦2,000' : 'WRONG! 😢 -₦1,000'}
                  </div>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                    {isWin 
                      ? 'Congratulations! ₦2,000 prize has been banked to your balance.' 
                      : `Nice attempt! The correct answer was "${currentQuestion?.answer}".`}
                  </p>
                  
                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center text-xs text-zinc-500 font-medium">
                      <span>Daily Quiz Progress</span>
                      <span className="font-mono font-bold text-fuchsia-400">{getEffectiveQuizCount()}/20</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-fuchsia-600 to-blue-600 h-full transition-all duration-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]" 
                        style={{ width: `${Math.min((getEffectiveQuizCount() / 20) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={startQuiz}
                    disabled={!canPlayQuiz()}
                    className={`w-full py-4 font-black rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-sm ${
                      canPlayQuiz() 
                        ? 'bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white shadow-[0_10px_20px_rgba(217,70,239,0.25)]' 
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {canPlayQuiz() ? 'Next Question' : 'Daily Limit Reached'}
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ACTIVE GAME 2: COIN FLIP (DOUBLE OR NOTHING) */}
          {activeGame === 'coinflip' && (
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-3xl p-6 border border-amber-500/30 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <span className="text-xs font-black text-amber-400 font-mono uppercase tracking-wider">Double or Nothing • Coin Flip</span>
                <button 
                  onClick={() => setActiveGame('none')}
                  disabled={coinFlipping}
                  className="text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-800 px-3 py-1 rounded-xl disabled:opacity-50"
                >
                  Exit Game
                </button>
              </div>

              <div className="flex flex-col items-center space-y-5 py-2">
                <style>{`
                  @keyframes flipY {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                  }
                  .animate-flip-y {
                    animation: flipY 0.35s linear infinite;
                    transform-style: preserve-3d;
                    perspective: 1000px;
                  }
                `}</style>
                
                {/* Simulated spinning coin */}
                <div className="relative h-32 flex items-center justify-center">
                  <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-300 ${
                    coinFlipping 
                      ? 'animate-flip-y bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 border-yellow-300 shadow-[0_0_35px_rgba(245,158,11,0.6)] text-black' 
                      : (coinResult === 'tail'
                          ? 'bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 border-blue-400 shadow-[0_0_35px_rgba(37,99,235,0.6)] text-white'
                          : 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.6)] text-black')
                  }`}>
                    <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center bg-transparent ${
                      coinFlipping ? 'border-yellow-200/50' : (coinResult === 'tail' ? 'border-blue-300/40' : 'border-amber-200/60')
                    }`}>
                      <span className="font-black text-2xl uppercase tracking-tighter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                        {coinFlipping ? '💰' : (coinResult ? (coinResult === 'head' ? 'HEAD' : 'TAIL') : 'GOLD')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coin Option Selection */}
                <div className="w-full space-y-2 text-center">
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Select Your Outcome (2X Payout)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={coinFlipping}
                      onClick={() => {
                        casinoAudio.playChip();
                        setCoinChoice('head');
                      }}
                      className={`py-3.5 rounded-2xl font-black text-sm uppercase transition-all tracking-wider border-2 ${coinChoice === 'head' ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-amber-500/40'}`}
                    >
                      👑 Head (2X)
                    </button>
                    <button
                      type="button"
                      disabled={coinFlipping}
                      onClick={() => {
                        casinoAudio.playChip();
                        setCoinChoice('tail');
                      }}
                      className={`py-3.5 rounded-2xl font-black text-sm uppercase transition-all tracking-wider border-2 ${coinChoice === 'tail' ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-amber-500/40'}`}
                    >
                      🛡️ Tail (2X)
                    </button>
                  </div>
                </div>

                {/* Bet Inputs */}
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase">
                    <span>Wager amount (₦)</span>
                    <span className="text-emerald-400 font-mono">Wallet: ₦{safeUserBalance.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    disabled={coinFlipping}
                    value={coinBet}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setCoinBet('');
                      } else {
                        const num = parseInt(val, 10);
                        if (!isNaN(num)) setCoinBet(num.toString());
                      }
                    }}
                    placeholder="Wager amount"
                    className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center font-black font-mono text-white text-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                  <div className="flex justify-between gap-1.5 pt-1">
                    {['200', '500', '1000', '2500', '5000'].map((val) => {
                      const chipNum = parseInt(val, 10);
                      const disabled = coinFlipping || chipNum > safeUserBalance;
                      return (
                        <button
                          key={val}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            casinoAudio.playChip();
                            setCoinBet(val);
                          }}
                          className={`flex-1 py-1.5 border rounded-xl font-mono text-[11px] font-bold transition-all ${
                            disabled 
                              ? 'bg-zinc-950/40 border-zinc-900 text-zinc-600 cursor-not-allowed'
                              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300 active:scale-95'
                          }`}
                        >
                          ₦{chipNum.toLocaleString()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Flip Coin Trigger */}
                <div className="w-full pt-1">
                  {coinGameOutcome ? (
                    <div className="text-center py-2 space-y-3 animate-in zoom-in-95">
                      <div className={`text-xl font-black uppercase tracking-tight ${coinGameOutcome === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {coinGameOutcome === 'win' 
                          ? `Double Win! Landed on ${coinResult?.toUpperCase()}! 🎉 (+₦${(parseInt(coinBet, 10) || 0).toLocaleString()})` 
                          : `Landed on ${coinResult?.toUpperCase()}! Deducted from wallet 😢`}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCoinResult(null);
                          setCoinGameOutcome(null);
                        }}
                        className="w-full py-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all"
                      >
                        Flip Again
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={coinFlipping || (!coinChoice && safeUserBalance >= 200 && (parseInt(coinBet, 10) || 0) <= safeUserBalance)}
                      onClick={() => {
                        if (safeUserBalance < 200 || (parseInt(coinBet, 10) || 0) > safeUserBalance) {
                          if (onDeposit) {
                            onDeposit();
                          } else {
                            alert(`Insufficient wallet balance! You have ₦${safeUserBalance.toLocaleString()}. Please fund your wallet to play.`);
                          }
                          return;
                        }
                        startCoinFlip();
                      }}
                      className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-md transition-all active:scale-95 cursor-pointer ${
                        coinFlipping 
                          ? 'bg-amber-500/20 text-amber-500 cursor-not-allowed animate-pulse' 
                          : safeUserBalance < 200 || (parseInt(coinBet, 10) || 0) > safeUserBalance
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:from-amber-400 hover:to-yellow-300'
                          : coinChoice 
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 shadow-[0_10px_20px_rgba(245,158,11,0.25)]' 
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      {coinFlipping 
                        ? 'Spinning Gold Coin...' 
                        : safeUserBalance < 200 
                        ? 'Fund Wallet to Flip (Min ₦200)' 
                        : (parseInt(coinBet, 10) || 0) > safeUserBalance 
                        ? `Fund Wallet for ₦${(parseInt(coinBet, 10) || 0).toLocaleString()} Bet` 
                        : 'Flip Coin (Double 2X)'}
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ACTIVE GAME 3: LUCKY COLOR SPIN */}
          {activeGame === 'colorspin' && (
            <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-3xl p-6 border border-emerald-500/30 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <span className="text-xs font-black text-emerald-400 font-mono uppercase tracking-wider">Roulette Color Spin • Up to 5X</span>
                <button 
                  onClick={() => setActiveGame('none')}
                  disabled={colorSpinning}
                  className="text-xs font-bold text-zinc-400 hover:text-white transition-colors bg-zinc-800 px-3 py-1 rounded-xl disabled:opacity-50"
                >
                  Exit Game
                </button>
              </div>

              <div className="flex flex-col items-center space-y-5 py-2">
                
                {/* CSS Wheel of Fortune Spinner */}
                <div className="relative flex flex-col items-center justify-center p-2">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-white z-20 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)] animate-bounce" />
                  
                  <div 
                    className="w-40 h-40 rounded-full border-4 border-zinc-800 shadow-[0_0_40px_rgba(0,0,0,0.7)] relative flex items-center justify-center overflow-hidden transition-all duration-[2.5s] ease-out"
                    style={{ 
                      transform: `rotate(${wheelRotation}deg)`,
                      background: `conic-gradient(#ef4444 0% 45%, #3b82f6 45% 90%, #f59e0b 90% 100%)` 
                    }}
                  >
                    <div className="absolute font-black text-[9px] text-white select-none whitespace-nowrap" style={{ transform: 'rotate(81deg) translateY(-52px) rotate(-81deg)' }}>RED (2x)</div>
                    <div className="absolute font-black text-[9px] text-white select-none whitespace-nowrap" style={{ transform: 'rotate(243deg) translateY(-52px) rotate(-243deg)' }}>BLUE (2x)</div>
                    <div className="absolute font-black text-[9px] text-black select-none whitespace-nowrap" style={{ transform: 'rotate(342deg) translateY(-52px) rotate(-342deg)' }}>GOLD (5x)</div>
                    
                    <div className="absolute w-9 h-9 rounded-full bg-zinc-950 border-2 border-zinc-700 z-10 flex items-center justify-center shadow-md">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Color Selector */}
                <div className="w-full space-y-2 text-center">
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Select Winning Color</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={colorSpinning}
                      onClick={() => {
                        casinoAudio.playChip();
                        setColorChoice('red');
                      }}
                      className={`py-3 rounded-2xl font-black text-xs uppercase border-2 transition-all ${colorChoice === 'red' ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-red-500/40'}`}
                    >
                      Red (2X)
                    </button>
                    <button
                      type="button"
                      disabled={colorSpinning}
                      onClick={() => {
                        casinoAudio.playChip();
                        setColorChoice('blue');
                      }}
                      className={`py-3 rounded-2xl font-black text-xs uppercase border-2 transition-all ${colorChoice === 'blue' ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.25)]' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-blue-500/40'}`}
                    >
                      Blue (2X)
                    </button>
                    <button
                      type="button"
                      disabled={colorSpinning}
                      onClick={() => {
                        casinoAudio.playChip();
                        setColorChoice('gold');
                      }}
                      className={`py-3 rounded-2xl font-black text-xs uppercase border-2 transition-all ${colorChoice === 'gold' ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-amber-500/40'}`}
                    >
                      Gold (5X)
                    </button>
                  </div>
                </div>

                {/* Bet Input */}
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase">
                    <span>Wager amount (₦)</span>
                    <span className="text-emerald-400 font-mono">Wallet: ₦{safeUserBalance.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    disabled={colorSpinning}
                    value={colorBet}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setColorBet('');
                      } else {
                        const num = parseInt(val, 10);
                        if (!isNaN(num)) setColorBet(num.toString());
                      }
                    }}
                    placeholder="Wager amount"
                    className="w-full py-3 px-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-center font-black font-mono text-white text-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <div className="flex justify-between gap-1.5 pt-1">
                    {['200', '500', '1000', '2500', '5000'].map((val) => {
                      const chipNum = parseInt(val, 10);
                      const disabled = colorSpinning || chipNum > safeUserBalance;
                      return (
                        <button
                          key={val}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            casinoAudio.playChip();
                            setColorBet(val);
                          }}
                          className={`flex-1 py-1.5 border rounded-xl font-mono text-[11px] font-bold transition-all ${
                            disabled 
                              ? 'bg-zinc-950/40 border-zinc-900 text-zinc-600 cursor-not-allowed'
                              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300 active:scale-95'
                          }`}
                        >
                          ₦{chipNum.toLocaleString()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Spin Wheel Button */}
                <div className="w-full pt-1">
                  {colorGameOutcome ? (
                    <div className="text-center py-2 space-y-3 animate-in zoom-in-95">
                      <div className={`text-lg font-black uppercase tracking-tight ${colorGameOutcome === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {colorGameOutcome === 'win' 
                          ? `MULTIPLIER CLEARED! Landed on ${colorResult?.toUpperCase()}! 🎉` 
                          : `Landed on ${colorResult?.toUpperCase()}! No match 😢`}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setColorResult(null);
                          setColorGameOutcome(null);
                        }}
                        className="w-full py-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all"
                      >
                        Spin Again
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={colorSpinning || (!colorChoice && safeUserBalance >= 200 && (parseInt(colorBet, 10) || 0) <= safeUserBalance)}
                      onClick={() => {
                        if (safeUserBalance < 200 || (parseInt(colorBet, 10) || 0) > safeUserBalance) {
                          if (onDeposit) {
                            onDeposit();
                          } else {
                            alert(`Insufficient wallet balance! You have ₦${safeUserBalance.toLocaleString()}. Please fund your wallet to play.`);
                          }
                          return;
                        }
                        startColorSpin();
                      }}
                      className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-md transition-all active:scale-95 cursor-pointer ${
                        colorSpinning 
                          ? 'bg-emerald-500/20 text-emerald-500 cursor-not-allowed animate-pulse' 
                          : safeUserBalance < 200 || (parseInt(colorBet, 10) || 0) > safeUserBalance
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:from-amber-400 hover:to-yellow-300'
                          : colorChoice 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:from-emerald-600 hover:to-teal-600 shadow-[0_10px_20px_rgba(16,185,129,0.25)]' 
                          : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      {colorSpinning 
                        ? 'Spinning Roulette Wheel...' 
                        : safeUserBalance < 200 
                        ? 'Fund Wallet to Spin (Min ₦200)' 
                        : (parseInt(colorBet, 10) || 0) > safeUserBalance 
                        ? `Fund Wallet for ₦${(parseInt(colorBet, 10) || 0).toLocaleString()} Bet` 
                        : 'Spin Roulette Wheel'}
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* Main Back Button */}
      <button 
        onClick={onBack} 
        disabled={coinFlipping || colorSpinning}
        className="w-full py-3 text-zinc-500 font-medium hover:text-emerald-400 text-sm transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
      >
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

    </div>
  );
};

export default TaskPage;
