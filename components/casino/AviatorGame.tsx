import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { casinoAudio } from './CasinoAudio';
import { 
  Plane, 
  Flame, 
  Coins, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  ArrowLeft,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  X,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface AviatorGameProps {
  user: User;
  onGameResult: (win: boolean, customAmount?: number, customDesc?: string, skipAlert?: boolean) => void;
  onExit: () => void;
  onDeposit?: () => void;
}

export const AviatorGame: React.FC<AviatorGameProps> = ({ user, onGameResult, onExit, onDeposit }) => {
  // Game state
  const [gameState, setGameState] = useState<'countdown' | 'flying' | 'crashed'>('countdown');
  const [countdown, setCountdown] = useState<number>(4);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [crashPoint, setCrashPoint] = useState<number>(2.20);
  const [history, setHistory] = useState<number[]>([1.42, 3.85, 1.15, 7.20, 2.05, 12.44, 1.88, 4.10]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fund Wallet Modal state
  const [showFundWalletModal, setShowFundWalletModal] = useState(false);

  // User balance sanitized (strictly non-NaN)
  const safeBalance = typeof user?.balance === 'number' && !isNaN(user.balance)
    ? Math.max(0, user.balance)
    : Math.max(0, Number(user?.balance) || 0);

  // User Bet state
  const [betAmount, setBetAmount] = useState<string>('500');
  const parsedBet = parseInt(betAmount, 10);
  const safeBetVal = isNaN(parsedBet) || parsedBet <= 0 ? 0 : parsedBet;

  const [isBetPlaced, setIsBetPlaced] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [cashedOutAt, setCashedOutAt] = useState<number | null>(null);
  const [cashedOutWinAmount, setCashedOutWinAmount] = useState<number | null>(null);
  const [queuedNextRoundBet, setQueuedNextRoundBet] = useState(false);
  
  // Auto cashout setting (strictly 1.50x upwards)
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(false);
  const [autoCashoutTarget, setAutoCashoutTarget] = useState<string>('1.50');

  // Canvas ref for airplane & flight curve
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const flightStartTimeRef = useRef<number>(0);

  // Trailing stardust particles ref for flight visual splendor
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([]);

  // Sync sound setting with engine
  useEffect(() => {
    casinoAudio.enabled = soundEnabled;
  }, [soundEnabled]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      casinoAudio.stopEngine();
    };
  }, []);

  // Generate fair crash point
  const generateCrashPoint = (): number => {
    const rand = Math.random();
    // 8% instant crash under 1.20x
    if (rand < 0.08) {
      return Number((1.01 + Math.random() * 0.18).toFixed(2));
    }
    // 50% 1.20x - 2.50x
    if (rand < 0.58) {
      return Number((1.20 + Math.random() * 1.30).toFixed(2));
    }
    // 27% 2.50x - 6.00x
    if (rand < 0.85) {
      return Number((2.50 + Math.random() * 3.50).toFixed(2));
    }
    // 10% 6.00x - 18.00x
    if (rand < 0.95) {
      return Number((6.00 + Math.random() * 12.00).toFixed(2));
    }
    // 5% Mega Soar up to 80x
    return Number((18.00 + Math.random() * 62.00).toFixed(2));
  };

  // Start a new round loop (Single Player)
  const startNewRound = () => {
    setGameState('countdown');
    setCountdown(4);
    setMultiplier(1.00);
    setHasCashedOut(false);
    setCashedOutAt(null);
    setCashedOutWinAmount(null);
    particlesRef.current = [];

    const targetCrash = generateCrashPoint();
    setCrashPoint(targetCrash);

    // If a bet was queued for the next round, check balance and place it
    if (queuedNextRoundBet) {
      if (safeBalance >= safeBetVal && safeBetVal >= 200) {
        setIsBetPlaced(true);
        // Deduct wager from balance immediately
        onGameResult(false, safeBetVal, `Aviator Wager Placed (Round #AV-${targetCrash.toString().replace('.', '')})`, true);
      } else {
        setShowFundWalletModal(true);
      }
      setQueuedNextRoundBet(false);
    }
  };

  // Initial round start
  useEffect(() => {
    startNewRound();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (gameState !== 'countdown') return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            casinoAudio.playTick();
            return 0;
          }
          casinoAudio.playTick();
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished -> launch flight!
      launchFlight();
    }
  }, [gameState, countdown]);

  // Launch Flight handler
  const launchFlight = () => {
    setGameState('flying');
    flightStartTimeRef.current = performance.now();
    // Beautiful melodious flight engine sound
    casinoAudio.startEngine(220);

    // If user bet was placed, validate balance immediately
    if (isBetPlaced) {
      if (safeBetVal < 200 || safeBetVal > safeBalance) {
        setIsBetPlaced(false);
      }
    }
  };

  // Flying loop using requestAnimationFrame
  useEffect(() => {
    if (gameState !== 'flying') return;

    let isRunning = true;

    const tickFlight = (currentTime: number) => {
      if (!isRunning) return;

      const elapsedMs = currentTime - flightStartTimeRef.current;
      const elapsedSec = elapsedMs / 1000;

      // Multiplier accelerates smoothly along curve
      // 1.00 + (t / 3)^1.65
      const currentMult = Number((1.00 + Math.pow(elapsedSec / 3.0, 1.65)).toFixed(2));
      setMultiplier(currentMult);
      
      // Beautiful harmonic audio glissando
      casinoAudio.updateEnginePitch(currentMult);

      // Check auto cashout (Strictly 1.50x upwards)
      const targetAutoMult = Math.max(1.50, parseFloat(autoCashoutTarget) || 1.50);
      if (
        isBetPlaced && 
        !hasCashedOut && 
        autoCashoutEnabled && 
        targetAutoMult <= currentMult
      ) {
        handleCashOut(currentMult);
      }

      // Check if reached crash point
      if (currentMult >= crashPoint) {
        handleCrash(crashPoint);
        return;
      }

      // Draw dark gold canvas with particles
      drawAviatorCanvas(currentMult, elapsedSec);

      animFrameRef.current = requestAnimationFrame(tickFlight);
    };

    animFrameRef.current = requestAnimationFrame(tickFlight);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, crashPoint, isBetPlaced, hasCashedOut, autoCashoutEnabled, autoCashoutTarget]);

  // Handle Crash
  const handleCrash = (finalCrash: number) => {
    setGameState('crashed');
    setMultiplier(finalCrash);
    casinoAudio.playCrash();

    // Add to multiplier history
    setHistory((prev) => [finalCrash, ...prev.slice(0, 9)]);

    // If user was betting and didn't cash out -> LOST
    if (isBetPlaced && !hasCashedOut) {
      setIsBetPlaced(false);
      casinoAudio.playLossWhammy();
    }

    // Draw final crash state on canvas
    drawCrashCanvas(finalCrash);

    // Auto start next round after 3.5s delay
    setTimeout(() => {
      startNewRound();
    }, 3500);
  };

  // Auto cashout target change and blur handlers (enforcing min 1.50x)
  const handleAutoCashoutChange = (val: string) => {
    setAutoCashoutTarget(val);
  };

  const handleAutoCashoutBlur = () => {
    const num = parseFloat(autoCashoutTarget);
    if (isNaN(num) || num < 1.50) {
      setAutoCashoutTarget('1.50');
    } else {
      setAutoCashoutTarget(num.toFixed(2));
    }
  };

  // Handle User Cash Out
  const handleCashOut = (cashMult: number) => {
    if (!isBetPlaced || hasCashedOut || gameState !== 'flying') return;

    if (safeBetVal <= 0) return;

    const safeMult = typeof cashMult === 'number' && !isNaN(cashMult) && isFinite(cashMult) ? cashMult : 1.0;
    const grossWin = Math.round(safeBetVal * safeMult);

    setHasCashedOut(true);
    setCashedOutAt(safeMult);
    setCashedOutWinAmount(grossWin);
    casinoAudio.playKaChing();
    casinoAudio.playCoinShower(10);
    casinoAudio.playCashout();

    // Credit full winnings directly to user's main dashboard balance
    onGameResult(true, grossWin, `Aviator Win Cashout @ ${safeMult.toFixed(2)}x (Gross: ₦${grossWin.toLocaleString()})`, true);
  };

  // Place Bet
  const handlePlaceBet = () => {
    if (safeBalance < 200 || safeBetVal > safeBalance) {
      setShowFundWalletModal(true);
      return;
    }
    if (safeBetVal < 200) {
      alert('Minimum bet is ₦200!');
      return;
    }

    casinoAudio.playChip();
    setIsBetPlaced(true);
    setHasCashedOut(false);
    setCashedOutAt(null);
    setCashedOutWinAmount(null);
    // Deduct wager immediately so user cannot double-spend and balance reflects immediately on dashboard
    onGameResult(false, safeBetVal, `Aviator Wager Placed (Round #AV-${crashPoint.toString().replace('.', '')})`, true);
  };

  // Cancel Bet (only allowed during countdown)
  const handleCancelBet = () => {
    if (gameState === 'countdown' && isBetPlaced) {
      setIsBetPlaced(false);
      casinoAudio.playChip();
      if (safeBetVal > 0) {
        // Refund wager back to dashboard balance
        onGameResult(true, safeBetVal, 'Aviator Wager Cancelled & Refunded', true);
      }
    }
  };

  // Canvas Drawing for Dark Gold Flight Animation
  const drawAviatorCanvas = (currentMult: number, elapsedSec: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Dark Gold Fine Coordinate Grid
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 42) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Origin at bottom-left: (x0, y0) = (28, h - 28)
    const progress = Math.min(1, elapsedSec / 10);
    const startX = 28;
    const startY = h - 28;

    // Smooth flight target coordinates
    const currentX = startX + progress * (w - 115);
    const currentY = startY - Math.pow(progress, 0.76) * (h - 75);

    // 2. Rich Dark Gold Shaded Area under Flight Curve
    const goldAreaGrad = ctx.createLinearGradient(0, currentY, 0, h);
    goldAreaGrad.addColorStop(0, 'rgba(245, 158, 11, 0.42)');
    goldAreaGrad.addColorStop(0.4, 'rgba(217, 119, 6, 0.16)');
    goldAreaGrad.addColorStop(0.8, 'rgba(180, 83, 9, 0.05)');
    goldAreaGrad.addColorStop(1, 'rgba(180, 83, 9, 0.0)');

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(startX + (currentX - startX) * 0.52, startY, currentX, currentY);
    ctx.lineTo(currentX, startY);
    ctx.closePath();
    ctx.fillStyle = goldAreaGrad;
    ctx.fill();

    // 3. Glowing Radiant Pure Gold Flight Path
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(startX + (currentX - startX) * 0.52, startY, currentX, currentY);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Stardust Particles Generation & Update
    if (Math.random() < 0.6) {
      const colors = ['#fbbf24', '#f59e0b', '#38bdf8', '#10b981', '#ffffff'];
      particlesRef.current.push({
        x: currentX - 10,
        y: currentY + (Math.random() * 6 - 3),
        vx: -1.5 - Math.random() * 2,
        vy: (Math.random() - 0.5) * 1.5,
        life: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    // Render & Decay particles
    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      if (p.life > 0) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1.0;
    particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

    // 5. Draw Sleek Dark Gold Jet Airplane at (currentX, currentY)
    ctx.save();
    ctx.translate(currentX, currentY);

    // Airplane nose angle
    const angle = -Math.PI / 8 - (1 - progress) * 0.08;
    ctx.rotate(angle);

    // Multi-Color Jet Thruster Flame (White, Gold, Fiery Orange)
    const flameLen = 14 + Math.random() * 8;
    const flameGrad = ctx.createLinearGradient(-flameLen, 0, 0, 0);
    flameGrad.addColorStop(0, 'rgba(234, 88, 12, 0)');
    flameGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.85)');
    flameGrad.addColorStop(0.7, '#fef08a');
    flameGrad.addColorStop(1, '#ffffff');

    ctx.beginPath();
    ctx.moveTo(-flameLen, 0);
    ctx.lineTo(0, -3.8);
    ctx.lineTo(0, 3.8);
    ctx.closePath();
    ctx.fillStyle = flameGrad;
    ctx.fill();

    // Jet Airplane Body - Dark Metallic Gold
    const bodyGrad = ctx.createLinearGradient(0, -5, 0, 5);
    bodyGrad.addColorStop(0, '#fef08a'); // Gold metallic shine
    bodyGrad.addColorStop(0.4, '#d97706'); // Deep dark gold
    bodyGrad.addColorStop(1, '#78350f'); // Dark bronze shadow
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(8, 0, 17, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Polished gold trim line
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, -1);
    ctx.lineTo(16, -1);
    ctx.stroke();

    // Cockpit Window - Vibrant Electric Sapphire/Cyan
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(12, -1.5, 5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cockpit glare
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(13, -2, 1, 0, Math.PI * 2);
    ctx.fill();

    // Top Wing - Deep Gold Bronze with yellow-gold highlight
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(6, -15);
    ctx.lineTo(13, 0);
    ctx.lineTo(2, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(6, -15);
    ctx.lineTo(13, 0);
    ctx.stroke();

    // Bottom Wing
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(6, 15);
    ctx.lineTo(13, 0);
    ctx.lineTo(2, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(6, 15);
    ctx.lineTo(13, 0);
    ctx.stroke();

    // Tail Fin - Dark Gold with Amber Accent
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(-6, -10);
    ctx.lineTo(1, 0);
    ctx.lineTo(-7, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Canvas drawing on crash
  const drawCrashCanvas = (finalCrash: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark smoke overlay
    ctx.fillStyle = 'rgba(10, 8, 4, 0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Color helper for recent multiplier pills
  const getPillColor = (mult: number) => {
    if (mult >= 10.0) return 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
    if (mult >= 2.0) return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
    return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
  };

  return (
    <div className="min-h-screen bg-[#060d20] text-white pb-24 font-sans select-none relative overflow-hidden">
      {/* Background ambient dark blue / indigo halo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-80 bg-blue-600/10 blur-[110px] pointer-events-none" />

      {/* Top Header Navigation */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a142e]/90 backdrop-blur-md border-b border-blue-500/20 sticky top-0 z-30">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-xs font-bold text-zinc-300 hover:text-white transition-colors bg-black/50 hover:bg-black/80 px-3 py-1.5 rounded-xl border border-amber-500/30 shadow-sm"
        >
          <ArrowLeft size={16} className="text-amber-400" />
          <span>Casino Hub</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Bankroll indicator */}
          <button
            type="button"
            onClick={() => {
              if (safeBalance < 200) {
                setShowFundWalletModal(true);
              } else if (onDeposit) {
                onDeposit();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 rounded-full text-xs font-mono font-bold text-amber-300 transition-all cursor-pointer"
          >
            <Coins size={13} className="text-amber-400" />
            <span>₦{safeBalance.toLocaleString()}</span>
            {safeBalance < 200 && (
              <span className="text-[10px] bg-amber-500 text-black font-extrabold px-1.5 py-0.2 rounded-full uppercase ml-1">
                + Fund
              </span>
            )}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-black/50 hover:bg-black/80 rounded-xl text-zinc-300 hover:text-white border border-amber-500/30 transition-colors"
          >
            {soundEnabled ? <Volume2 size={16} className="text-amber-400" /> : <VolumeX size={16} className="text-zinc-500" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-xl mx-auto px-4 py-3 space-y-3">
        {/* Multiplier History Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar">
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400/70 uppercase tracking-widest pl-1 pr-2">
            <Clock size={12} />
            <span>Flights:</span>
          </div>
          {history.map((m, idx) => (
            <span
              key={`${idx}-${m}`}
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border shrink-0 transition-all ${getPillColor(m)}`}
            >
              {m.toFixed(2)}x
            </span>
          ))}
        </div>

        {/* The Dark Gold Flight Radar Display Screen */}
        <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-[#181308] via-[#100d05] to-[#080602] rounded-3xl border-2 border-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.2)] overflow-hidden flex flex-col justify-between p-4">
          {/* Canvas for animated dark gold flight curve */}
          <canvas
            ref={canvasRef}
            width={520}
            height={280}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Top radar status indicators */}
          <div className="relative z-10 flex justify-between items-center text-[10px] font-mono text-zinc-400">
            <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-amber-300 font-bold">ROUND #AV-{crashPoint.toString().replace('.', '')}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <ShieldCheck size={13} className="text-amber-400" />
              <span className="text-amber-300 font-bold tracking-wider">SINGLE PLAYER</span>
            </div>
          </div>

          {/* Center Multiplier Display */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
            {gameState === 'countdown' && (
              <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Plane size={14} className="animate-bounce text-amber-400" />
                  <span>PREPARING TAKEOFF</span>
                </div>
                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                  NEXT IN <span className="text-amber-400">{countdown}s</span>
                </div>
                <div className="w-48 h-1.5 bg-black/80 rounded-full mx-auto overflow-hidden border border-amber-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                    style={{ width: `${(countdown / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {gameState === 'flying' && (
              <div className="space-y-1">
                <div className="text-6xl sm:text-7xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.6)] animate-pulse">
                  {multiplier.toFixed(2)}x
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-amber-300 flex items-center justify-center gap-1.5">
                  <Flame size={14} className="animate-spin text-orange-400" />
                  <span>MULTIPLIER SOARING</span>
                </div>
              </div>
            )}

            {gameState === 'crashed' && (
              <div className="space-y-2 animate-in zoom-in-95 duration-200">
                <div className="text-red-400 font-black text-xs uppercase tracking-widest px-3 py-1 bg-red-950/80 border border-red-500/50 rounded-full inline-block shadow-sm">
                  FLEW AWAY!
                </div>
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.7)]">
                  {multiplier.toFixed(2)}x
                </div>
                <div className="text-xs text-amber-400/80 font-mono">
                  Preparing next flight...
                </div>
              </div>
            )}
          </div>

          {/* User's Cashout Overlay Banner if cashed out */}
          {hasCashedOut && cashedOutWinAmount && (
            <div className="absolute inset-x-4 bottom-4 z-20 bg-gradient-to-r from-emerald-600/95 to-teal-700/95 text-white p-3 rounded-2xl border border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-between animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-amber-300" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-200">Cashed Out Successfully!</div>
                  <div className="text-base font-black font-mono">₦{cashedOutWinAmount.toLocaleString()}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold bg-black/30 px-2.5 py-1 rounded-lg border border-white/20">
                  @{cashedOutAt?.toFixed(2)}x
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Insufficient Balance Friendly Notice - Allows viewing freely, prompts funding when desired */}
        {safeBalance < 200 && (
          <div className="bg-[#1a1408] border border-amber-500/40 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Wallet size={16} className="text-amber-400" />
              </div>
              <div>
                <div className="font-bold text-white text-[11px]">Free Flight View Active</div>
                <div className="text-[10px] text-amber-300/80">
                  Balance: <strong className="font-mono text-white">₦{safeBalance.toLocaleString()}</strong> • Min ₦200 needed to cash out real money
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowFundWalletModal(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shrink-0 ml-2 shadow-sm"
            >
              Fund Wallet
            </button>
          </div>
        )}

        {/* Betting Terminal Station in Dark Gold Theme */}
        <div className="bg-gradient-to-b from-[#181308] to-[#0e0b04] rounded-3xl p-4 border border-amber-500/30 shadow-xl space-y-3">
          {/* User Wallet Bar */}
          <div className="flex justify-between items-center text-xs pb-2 border-b border-amber-500/15">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Coins size={14} className="text-amber-400" />
              <span>Wallet Balance:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-400 text-sm">
                ₦{safeBalance.toLocaleString()}
              </span>
              {safeBalance < 200 && (
                <button
                  type="button"
                  onClick={() => setShowFundWalletModal(true)}
                  className="text-[10px] font-black text-amber-400 hover:underline uppercase"
                >
                  + Fund Wallet
                </button>
              )}
            </div>
          </div>

          {/* Bet Amount Input & Quick Chips */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-amber-200/70">
              <span>Bet Amount (₦)</span>
              <span>Min: ₦200</span>
            </div>

            <div className="relative">
              <input
                type="number"
                disabled={isBetPlaced && gameState === 'flying'}
                value={betAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setBetAmount('');
                  } else {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      setBetAmount(num.toString());
                    }
                  }
                }}
                placeholder="Amount to bet"
                className="w-full py-3 px-4 bg-black/80 border border-amber-500/30 rounded-2xl font-black font-mono text-xl text-center text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all disabled:opacity-60"
              />
            </div>

            {/* Quick Casino Chip Buttons */}
            <div className="grid grid-cols-5 gap-1.5 pt-0.5">
              {['200', '500', '1000', '2500', '5000'].map((val) => {
                const chipNum = parseInt(val, 10);
                const disabled = isBetPlaced && gameState === 'flying';
                return (
                  <button
                    key={val}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      casinoAudio.playChip();
                      setBetAmount(val);
                      if (chipNum > safeBalance) {
                        setShowFundWalletModal(true);
                      }
                    }}
                    className={`py-1.5 border rounded-xl font-mono text-[11px] font-bold transition-all ${
                      chipNum > safeBalance
                        ? 'bg-amber-950/20 border-amber-500/20 text-amber-400/50'
                        : 'bg-black/60 hover:bg-amber-950/40 border-amber-500/30 text-amber-200 hover:text-white active:scale-95'
                    }`}
                  >
                    ₦{chipNum.toLocaleString()}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <button
                type="button"
                disabled={isBetPlaced && gameState === 'flying'}
                onClick={() => {
                  casinoAudio.playChip();
                  const cur = safeBetVal || 500;
                  setBetAmount(Math.max(200, Math.floor(cur / 2)).toString());
                }}
                className="py-1 bg-black/50 hover:bg-black/80 border border-amber-500/25 text-zinc-300 hover:text-white text-[10px] font-bold rounded-lg font-mono uppercase disabled:opacity-50"
              >
                1/2 Bet
              </button>
              <button
                type="button"
                disabled={isBetPlaced && gameState === 'flying'}
                onClick={() => {
                  casinoAudio.playChip();
                  const cur = safeBetVal || 500;
                  const nextVal = cur * 2;
                  setBetAmount(Math.max(200, nextVal).toString());
                  if (nextVal > safeBalance) {
                    setShowFundWalletModal(true);
                  }
                }}
                className="py-1 bg-black/50 hover:bg-black/80 border border-amber-500/25 text-zinc-300 hover:text-white text-[10px] font-bold rounded-lg font-mono uppercase disabled:opacity-50"
              >
                2X Bet
              </button>
              <button
                type="button"
                disabled={isBetPlaced && gameState === 'flying'}
                onClick={() => {
                  casinoAudio.playChip();
                  if (safeBalance < 200) {
                    setShowFundWalletModal(true);
                  } else {
                    setBetAmount(Math.max(200, safeBalance).toString());
                  }
                }}
                className="py-1 bg-black/50 hover:bg-black/80 border border-amber-500/25 text-amber-400 hover:text-amber-300 text-[10px] font-bold rounded-lg font-mono uppercase disabled:opacity-50"
              >
                Max Bet
              </button>
            </div>
          </div>

          {/* Auto Cashout / Auto Withdrawal Controls (Min 1.50x) */}
          <div className="pt-2.5 border-t border-amber-500/15 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoCashoutToggle"
                  checked={autoCashoutEnabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setAutoCashoutEnabled(enabled);
                    if (enabled) {
                      const cur = parseFloat(autoCashoutTarget);
                      if (isNaN(cur) || cur < 1.50) {
                        setAutoCashoutTarget('1.50');
                      }
                    }
                  }}
                  className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="autoCashoutToggle" className="text-xs text-zinc-300 cursor-pointer font-bold flex items-center gap-1.5">
                  <span>Auto Withdrawal</span>
                  <span className="text-[10px] font-mono font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                    Min 1.50x
                  </span>
                </label>
              </div>

              {autoCashoutEnabled && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.05"
                    min="1.50"
                    max="100"
                    value={autoCashoutTarget}
                    onChange={(e) => handleAutoCashoutChange(e.target.value)}
                    onBlur={handleAutoCashoutBlur}
                    placeholder="1.50"
                    className="w-20 py-1 px-2 bg-black border border-amber-500/50 rounded-lg text-xs font-mono font-bold text-center text-amber-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                  <span className="text-xs text-amber-400 font-bold">x</span>
                </div>
              )}
            </div>

            {/* Quick Multiplier Presets for Auto Cashout (all >= 1.50x) */}
            {autoCashoutEnabled && (
              <div className="space-y-1 pt-0.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[10px] text-amber-300/80 font-mono">
                  <span>Preset Targets (≥ 1.50x):</span>
                  <span>Withdrawal starts @ 1.50x</span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {['1.50', '2.00', '3.00', '5.00', '10.00'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        casinoAudio.playChip();
                        setAutoCashoutTarget(val);
                      }}
                      className={`py-1 rounded-lg text-[11px] font-mono font-bold border transition-all ${
                        autoCashoutTarget === val
                          ? 'bg-amber-500 text-black border-amber-400 shadow-sm font-black'
                          : 'bg-black/60 hover:bg-amber-950/40 border-amber-500/30 text-amber-200 hover:text-white'
                      }`}
                    >
                      {val}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MAIN BETTING ACTION BUTTON (Conditions) */}
          <div className="pt-1">
            {/* Condition 1: Flying and user is in flight */}
            {gameState === 'flying' && isBetPlaced && !hasCashedOut && (
              <button
                type="button"
                onClick={() => handleCashOut(multiplier)}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-lg uppercase tracking-wider rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.5)] active:scale-95 transition-all flex flex-col items-center justify-center animate-pulse cursor-pointer"
              >
                <span className="text-xs uppercase font-extrabold tracking-widest text-black/80">
                  CASH OUT NOW
                </span>
                <span className="text-2xl font-mono font-black">
                  ₦{Math.round(safeBetVal * multiplier).toLocaleString()}
                </span>
              </button>
            )}

            {/* Condition 2: Flying and user already cashed out */}
            {gameState === 'flying' && isBetPlaced && hasCashedOut && (
              <div className="w-full py-3.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 rounded-2xl font-black text-center font-mono text-sm uppercase">
                Banked ₦{(cashedOutWinAmount || 0).toLocaleString()} @ {(cashedOutAt || 1).toFixed(2)}x 🎉
              </div>
            )}

            {/* Condition 3: Flying and user did not bet */}
            {gameState === 'flying' && !isBetPlaced && (
              safeBalance < 200 || safeBetVal > safeBalance ? (
                <button
                  type="button"
                  onClick={() => setShowFundWalletModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-amber-500/90 to-yellow-500/90 hover:from-amber-400 hover:to-yellow-400 text-black font-black rounded-2xl text-xs uppercase tracking-wider border border-amber-400 shadow-[0_5px_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Wallet size={16} className="text-black" />
                  <span>FUND WALLET TO BET (₦{safeBetVal.toLocaleString()})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setQueuedNextRoundBet(!queuedNextRoundBet);
                    casinoAudio.playChip();
                  }}
                  className={`w-full py-4 font-black rounded-2xl text-sm uppercase tracking-wider border transition-all cursor-pointer ${
                    queuedNextRoundBet
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                      : 'bg-black/80 text-amber-300 border-amber-500/30 hover:border-amber-400'
                  }`}
                >
                  {queuedNextRoundBet ? `QUEUED FOR NEXT ROUND (₦${safeBetVal.toLocaleString()})` : `BET FOR NEXT ROUND (₦${safeBetVal.toLocaleString()})`}
                </button>
              )
            )}

            {/* Condition 4: Countdown state and bet NOT placed yet */}
            {gameState === 'countdown' && !isBetPlaced && (
              safeBalance < 200 || safeBetVal > safeBalance ? (
                <button
                  type="button"
                  onClick={() => setShowFundWalletModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_10px_25px_rgba(245,158,11,0.35)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wallet size={18} className="text-black" />
                  <span>FUND WALLET TO BET (₦{safeBetVal.toLocaleString()})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePlaceBet}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-lg uppercase tracking-wider rounded-2xl shadow-[0_10px_25px_rgba(245,158,11,0.35)] active:scale-95 transition-all cursor-pointer"
                >
                  BET ₦{safeBetVal.toLocaleString()}
                </button>
              )
            )}

            {/* Condition 5: Countdown state and bet IS placed (can cancel) */}
            {gameState === 'countdown' && isBetPlaced && (
              <button
                type="button"
                onClick={handleCancelBet}
                className="w-full py-4 bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 font-black text-sm uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>CANCEL BET (₦{safeBetVal.toLocaleString()})</span>
              </button>
            )}

            {/* Condition 6: Crashed state */}
            {gameState === 'crashed' && (
              <div className="w-full py-4 bg-black/60 border border-amber-500/20 text-zinc-400 font-bold rounded-2xl text-center text-xs uppercase tracking-wider font-mono">
                Round Finished • Next Flight Launching...
              </div>
            )}
          </div>
        </div>

        {/* Single Player Flight Terminal & Flight Telemetry */}
        <div className="bg-gradient-to-b from-[#0a142e] to-[#060d20] rounded-3xl p-4 border border-blue-500/20 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-amber-300/80 px-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-amber-400" />
              <span>Single Player Flight Terminal</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              SOLO MODE
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-black/50 p-2.5 rounded-xl border border-amber-500/15">
              <div className="text-[10px] text-zinc-400 uppercase font-sans">Active Wager</div>
              <div className="text-sm font-black text-white mt-0.5">
                {isBetPlaced ? `₦${safeBetVal.toLocaleString()}` : 'None'}
              </div>
            </div>

            <div className="bg-black/50 p-2.5 rounded-xl border border-amber-500/15">
              <div className="text-[10px] text-zinc-400 uppercase font-sans">Auto Withdrawal</div>
              <div className="text-sm font-black text-amber-400 mt-0.5">
                {autoCashoutEnabled ? `${Math.max(1.50, parseFloat(autoCashoutTarget) || 1.50).toFixed(2)}x` : 'Manual'}
              </div>
            </div>

            <div className="bg-black/50 p-2.5 rounded-xl border border-amber-500/15">
              <div className="text-[10px] text-zinc-400 uppercase font-sans">Live Multiplier</div>
              <div className="text-sm font-black text-yellow-300 mt-0.5">
                {multiplier.toFixed(2)}x
              </div>
            </div>

            <div className="bg-black/50 p-2.5 rounded-xl border border-amber-500/15">
              <div className="text-[10px] text-zinc-400 uppercase font-sans">Target Return</div>
              <div className="text-sm font-black text-emerald-400 mt-0.5">
                {isBetPlaced ? `₦${Math.round(safeBetVal * (autoCashoutEnabled ? Math.max(1.50, parseFloat(autoCashoutTarget) || 1.50) : multiplier)).toLocaleString()}` : '—'}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/15 flex items-center justify-between text-[11px] text-amber-200/90">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-amber-400 shrink-0" />
              <span>Auto withdrawal rule: minimum target threshold starts at <strong>1.50x</strong> upwards.</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">100% Solo Play</span>
          </div>
        </div>
      </div>

      {/* FUND WALLET MODAL: Tells user to fund their wallet to play, while letting them view freely */}
      {showFundWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-[#1c1608] to-[#0c0903] border-2 border-amber-500/50 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.3)] relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowFundWalletModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/60 text-zinc-400 hover:text-white border border-amber-500/30"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-2 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                <Coins size={32} className="text-black" />
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-tight">
                Fund Your Wallet To Play
              </h3>
              <p className="text-xs text-amber-200/80">
                You can watch live flights freely! To place bets and cash out up to 100X real money, fund your wallet.
              </p>
            </div>

            <div className="bg-black/60 rounded-2xl p-3 border border-amber-500/25 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Current Balance:</span>
                <span className="font-bold text-amber-400">₦{safeBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Minimum Bet Required:</span>
                <span className="font-bold text-emerald-400">₦200</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-amber-500/15">
                <span className="text-zinc-400">Selected Bet:</span>
                <span className="font-bold text-white">₦{safeBetVal.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowFundWalletModal(false);
                  if (onDeposit) {
                    onDeposit();
                  } else {
                    onExit();
                  }
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_5px_20px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <CreditCard size={18} />
                <span>Deposit / Fund Wallet Now</span>
                <ArrowUpRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => setShowFundWalletModal(false)}
                className="w-full py-2.5 bg-black/60 hover:bg-black text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-amber-500/25 transition-all cursor-pointer"
              >
                Keep Watching Live Flights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
