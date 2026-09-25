import React, { useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { casinoAudio } from './casino/CasinoAudio';
import { User } from '../types';

export interface SpinPrize {
  id: number;
  label: string;
  amount: number;
  badge: string;
  colorDark: string;
  colorLight: string;
  textColor: string;
  probabilityWeight: number; // for realistic weighted casino drops
}

export const SPIN_PRIZES: SpinPrize[] = [
  { id: 0, label: '₦50,000', amount: 50000, badge: 'Gold Cash', colorDark: '#064e3b', colorLight: '#10b981', textColor: '#ecfdf5', probabilityWeight: 18 },
  { id: 1, label: '₦100,000', amount: 100000, badge: 'Mega Cash', colorDark: '#78350f', colorLight: '#f59e0b', textColor: '#fef3c7', probabilityWeight: 12 },
  { id: 2, label: '₦25,000', amount: 25000, badge: 'Star Cash', colorDark: '#1e1b4b', colorLight: '#6366f1', textColor: '#e0e7ff', probabilityWeight: 22 },
  { id: 3, label: '₦200,000', amount: 200000, badge: 'High Roller', colorDark: '#831843', colorLight: '#ec4899', textColor: '#fdf2f8', probabilityWeight: 8 },
  { id: 4, label: '₦15,000', amount: 15000, badge: 'Lucky Cash', colorDark: '#581c87', colorLight: '#a855f7', textColor: '#faf5ff', probabilityWeight: 24 },
  { id: 5, label: '₦500,000', amount: 500000, badge: 'JACKPOT', colorDark: '#713f12', colorLight: '#eab308', textColor: '#fef9c3', probabilityWeight: 4 },
  { id: 6, label: '₦35,000', amount: 35000, badge: 'Diamond', colorDark: '#134e4a', colorLight: '#14b8a6', textColor: '#f0fdfa', probabilityWeight: 20 },
  { id: 7, label: '₦75,000', amount: 75000, badge: 'Royal Win', colorDark: '#7c2d12', colorLight: '#f97316', textColor: '#fff7ed', probabilityWeight: 14 },
];

interface FortuneWheelProps {
  user: User;
  canSpin: boolean;
  timeUntilNextSpin: string;
  onSpinWin: (prize: SpinPrize) => void;
}

export const FortuneWheel: React.FC<FortuneWheelProps> = ({
  user,
  canSpin,
  timeUntilNextSpin,
  onSpinWin,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [flapperDeflect, setFlapperDeflect] = useState(false);
  const [wonPrize, setWonPrize] = useState<SpinPrize | null>(null);
  const [showWinCelebration, setShowWinCelebration] = useState(false);
  const [ledFlashIndex, setLedFlashIndex] = useState(0);

  const wheelRef = useRef<SVGSVGElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentRotRef = useRef<number>(0);
  const lastPegIndexRef = useRef<number>(-1);

  // Subtle perimeter LED chasing light effect
  useEffect(() => {
    const timer = setInterval(() => {
      setLedFlashIndex((prev) => (prev + 1) % 24);
    }, isSpinning ? 70 : 350);
    return () => clearInterval(timer);
  }, [isSpinning]);

  const spinTheWheel = () => {
    if (isSpinning || !canSpin) return;

    casinoAudio.playButtonClick();
    setIsSpinning(true);
    setWonPrize(null);
    setShowWinCelebration(false);

    // Weighted selection of prize
    const totalWeight = SPIN_PRIZES.reduce((sum, p) => sum + p.probabilityWeight, 0);
    let randomThreshold = Math.random() * totalWeight;
    let selectedPrize = SPIN_PRIZES[0];
    for (const prize of SPIN_PRIZES) {
      if (randomThreshold <= prize.probabilityWeight) {
        selectedPrize = prize;
        break;
      }
      randomThreshold -= prize.probabilityWeight;
    }

    // Exact geometric target angle:
    // Segment i covers [i*45, (i+1)*45]. Center is i*45 + 22.5
    // To position under top pointer (270 deg): theta0 = (270 - (i*45 + 22.5)) mod 360
    const segCenter = selectedPrize.id * 45 + 22.5;
    let targetOffset = (270 - segCenter) % 360;
    if (targetOffset < 0) targetOffset += 360;

    // Small random jitter between -12 and +12 degrees for real-world variation
    const jitter = (Math.random() - 0.5) * 22;

    const startRot = currentRotRef.current;
    const startNormalized = startRot % 360;
    const diffToTarget = (targetOffset - startNormalized + 360) % 360;

    // 7 full turns (2520 deg) + angle delta
    const fullSpins = 360 * 7;
    const finalRot = startRot + fullSpins + diffToTarget + jitter;

    const spinDuration = 5600; // 5.6 seconds of authentic suspense
    const startTime = performance.now();

    // Custom cubic ease-out function: rapid acceleration then long, smooth physical coast down
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3.2);

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / spinDuration);
      const easedProgress = easeOutCubic(progress);

      const currentAngle = startRot + (finalRot - startRot) * easedProgress;
      currentRotRef.current = currentAngle;
      setRotationDegree(currentAngle);

      // Sound calculation: each 45-degree wedge has peg boundaries
      const normalizedAngle = (currentAngle % 360 + 360) % 360;
      const currentPeg = Math.floor((normalizedAngle + 22.5) / 45) % 8;

      if (currentPeg !== lastPegIndexRef.current) {
        lastPegIndexRef.current = currentPeg;
        casinoAudio.playWheelPeg();
        setFlapperDeflect(true);
        setTimeout(() => setFlapperDeflect(false), 45);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateSpin);
      } else {
        // Spin finished!
        setIsSpinning(false);
        setWonPrize(selectedPrize);
        setShowWinCelebration(true);
        casinoAudio.playKaChing();
        casinoAudio.playCoinShower(14);
        casinoAudio.playJackpotWin();
        onSpinWin(selectedPrize);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateSpin);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const perimeterLeds = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 360) / 24;
    const rad = (angle * Math.PI) / 180;
    const r = 142; // Distance from center
    const cx = 150 + r * Math.cos(rad);
    const cy = 150 + r * Math.sin(rad);
    const isLit = (i + ledFlashIndex) % 3 === 0;
    return { cx, cy, isLit, id: i };
  });

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* Golden Stage Ambient Glow */}
      <div className="absolute -top-10 w-72 h-72 bg-amber-500/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Wheel Cabinet Frame */}
      <div className="relative w-[320px] h-[320px] sm:w-[350px] sm:h-[350px] flex items-center justify-center">
        
        {/* Outer Heavy Brass / Titanium Bezel */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f59e0b] via-[#d97706] to-[#78350f] p-1.5 shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.35)]">
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1c1917] via-[#0c0a09] to-[#000000] p-1.5 border border-amber-400/40 relative">
            
            {/* Embedded Chasing Perimeter LED Studs */}
            <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {perimeterLeds.map((led) => (
                <circle
                  key={led.id}
                  cx={led.cx}
                  cy={led.cy}
                  r="3.5"
                  className="transition-colors duration-150"
                  fill={led.isLit ? '#fef08a' : '#78350f'}
                  stroke={led.isLit ? '#ffffff' : '#451a03'}
                  strokeWidth="0.75"
                  filter={led.isLit ? 'drop-shadow(0 0 4px #facc15)' : undefined}
                />
              ))}
            </svg>

            {/* Rotating Wheel Core */}
            <svg
              ref={wheelRef}
              viewBox="0 0 300 300"
              style={{
                transform: `rotate(${rotationDegree}deg)`,
                transformOrigin: '150px 150px',
              }}
              className="w-full h-full rounded-full drop-shadow-md"
            >
              <defs>
                {SPIN_PRIZES.map((prize) => (
                  <radialGradient
                    key={`grad-${prize.id}`}
                    id={`wheel-grad-${prize.id}`}
                    cx="50%"
                    cy="50%"
                    r="50%"
                    fx="50%"
                    fy="20%"
                  >
                    <stop offset="0%" stopColor={prize.colorLight} />
                    <stop offset="65%" stopColor={prize.colorDark} />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
                  </radialGradient>
                ))}
                
                {/* Center Chrome Bevel */}
                <linearGradient id="center-gold-hub" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="30%" stopColor="#f59e0b" />
                  <stop offset="70%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#fef08a" />
                </linearGradient>

                <filter id="hub-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.8" />
                </filter>
              </defs>

              {/* 8 Distinct Luxury Wedges */}
              {SPIN_PRIZES.map((prize, idx) => {
                const startAngle = idx * 45;
                const endAngle = (idx + 1) * 45;
                const r = 135;
                const cx = 150;
                const cy = 150;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = cx + r * Math.cos(startRad);
                const y1 = cy + r * Math.sin(startRad);
                const x2 = cx + r * Math.cos(endRad);
                const y2 = cy + r * Math.sin(endRad);

                // Wedge SVG Path
                const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

                // Middle angle of wedge for text placement
                const midAngle = startAngle + 22.5;

                return (
                  <g key={prize.id}>
                    {/* Wedge Segment */}
                    <path
                      d={pathD}
                      fill={`url(#wheel-grad-${prize.id})`}
                      stroke="#facc15"
                      strokeWidth="1.2"
                      opacity="0.95"
                    />

                    {/* Radial Decorative Line */}
                    <line
                      x1={cx}
                      y1={cy}
                      x2={x1}
                      y2={y1}
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      strokeOpacity="0.7"
                    />

                    {/* Perimeter Brass Pin/Peg that ticks the flapper */}
                    <circle
                      cx={x1}
                      cy={y1}
                      r="2.5"
                      fill="#fef08a"
                      stroke="#78350f"
                      strokeWidth="1"
                    />

                    {/* Text and Icon in Segment */}
                    <g transform={`rotate(${midAngle}, ${cx}, ${cy})`}>
                      <text
                        x={cx + 84}
                        y={cy + 4}
                        fill={prize.textColor}
                        fontSize="12.5"
                        fontWeight="900"
                        fontFamily="monospace, system-ui, sans-serif"
                        textAnchor="middle"
                        letterSpacing="-0.2px"
                        filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
                      >
                        {prize.label}
                      </text>

                      <text
                        x={cx + 42}
                        y={cy + 3.5}
                        fill="#fde68a"
                        fontSize="7"
                        fontWeight="800"
                        textAnchor="middle"
                        letterSpacing="0.5px"
                        opacity="0.9"
                      >
                        {prize.badge}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Inner Decorative Golden Concentric Ring */}
              <circle
                cx="150"
                cy="150"
                r="38"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />
            </svg>

            {/* Central Luxury Dome Hub (Static on top of rotating disc) */}
            <div 
              onClick={canSpin && !isSpinning ? spinTheWheel : undefined}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-100 via-amber-400 to-yellow-700 p-1 shadow-[0_0_20px_rgba(245,158,11,0.8),inset_0_2px_4px_rgba(255,255,255,0.6)] z-20 transition-transform ${
                canSpin && !isSpinning ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
              }`}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1c1917] via-[#0c0a09] to-[#000000] border border-amber-300/80 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                
                {isSpinning ? (
                  <div className="flex flex-col items-center">
                    <Icons.RefreshCw size={18} className="text-amber-400 animate-spin" />
                    <span className="text-[8px] font-black text-amber-300 uppercase tracking-wider mt-0.5">LUCKY</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-[12px] font-black tracking-wider text-amber-300 text-glow-gold">SPIN</span>
                    <span className="text-[7px] font-bold text-gray-300 uppercase tracking-tight -mt-0.5">WIN CASH</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Realistic Top Flapper / Ratchet Needle (Mounted at 12 o'clock pointing down) */}
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-transform duration-75 origin-top"
          style={{
            transform: `translateX(-50%) rotate(${flapperDeflect ? '14deg' : '0deg'})`,
          }}
        >
          {/* Sculpted Metallic Golden Flapper */}
          <div className="relative flex flex-col items-center filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
            {/* Top Pivot Pin */}
            <div className="w-4 h-4 rounded-full bg-gradient-to-b from-yellow-100 via-amber-400 to-amber-700 border border-yellow-200 shadow-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-950" />
            </div>
            {/* Downward Needle Tip */}
            <div 
              className="w-0 h-0 -mt-1"
              style={{
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: '18px solid #fbbf24',
                filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))',
              }}
            />
          </div>
        </div>

      </div>

      {/* Dynamic Action Controls & Timer */}
      <div className="w-full max-w-sm mt-5 space-y-3 px-2">
        {canSpin ? (
          <button
            onClick={spinTheWheel}
            disabled={isSpinning}
            className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all duration-300 shadow-xl cursor-pointer ${
              isSpinning
                ? 'bg-amber-950/60 border border-amber-500/30 text-amber-300 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-[0.98]'
            }`}
          >
            {isSpinning ? (
              <>
                <Icons.RefreshCw size={18} className="animate-spin text-amber-400 mr-1" />
                <span>Spinning Fortune Wheel...</span>
              </>
            ) : (
              <>
                <Icons.Sparkles size={18} className="animate-pulse" />
                <span>SPIN TO WIN (1 FREE SPIN READY)</span>
              </>
            )}
          </button>
        ) : (
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 text-center shadow-lg">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                <Icons.Clock size={13} className="text-amber-400" />
                Next Free Spin:
              </span>
              <span className="font-mono font-black text-amber-300 bg-black/60 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                {timeUntilNextSpin}
              </span>
            </div>

            <p className="text-[11px] text-gray-400 leading-snug">
              You've completed today's free spin. Daily spins replenish every 24 hours.
            </p>

            {user.lastDailySpinPrize && (
              <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500 font-medium">Last Prize Collected:</span>
                <span className="font-black text-emerald-400 font-mono">
                  +₦{user.lastDailySpinPrize.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Live High-Roller Ticker Feed */}
        <div className="bg-black/60 border border-zinc-800/80 rounded-xl px-3 py-2 flex items-center space-x-2 overflow-hidden shadow-inner">
          <span className="flex h-2 w-2 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex-shrink-0">
            LIVE WINNERS:
          </span>
          <div className="text-[11px] text-zinc-300 truncate font-medium">
            <span className="text-emerald-400 font-bold">Chisom E.</span> won <span className="text-amber-300 font-black">₦200,000</span> • <span className="text-emerald-400 font-bold">Tunde B.</span> won <span className="text-amber-300 font-black">₦500,000 Jackpot</span> • <span className="text-emerald-400 font-bold">Zainab A.</span> won <span className="text-amber-300 font-black">₦100,000</span>
          </div>
        </div>
      </div>

      {/* Win Celebration Modal */}
      {showWinCelebration && wonPrize && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          
          {/* Confetti Particles Shower */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-3 rounded-sm animate-confetti-drop"
                style={{
                  left: `${(i * 3.3) + Math.random() * 2}%`,
                  top: `-${Math.random() * 20}%`,
                  backgroundColor: ['#facc15', '#10b981', '#6366f1', '#ec4899', '#f97316'][i % 5],
                  animationDuration: `${2 + (i % 3) * 0.8}s`,
                  animationDelay: `${(i % 5) * 0.2}s`,
                  transform: `rotate(${i * 24}deg)`,
                }}
              />
            ))}
          </div>

          <div className="bg-gradient-to-b from-zinc-900 via-black to-zinc-950 border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-5 shadow-[0_0_60px_rgba(245,158,11,0.5)] relative overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Top Shine Accent */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            
            {/* Golden Trophy Medallion */}
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-200 via-amber-400 to-amber-600 p-1 shadow-[0_0_25px_rgba(245,158,11,0.8)] flex items-center justify-center animate-bounce-gentle">
              <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center border border-amber-300">
                <Icons.Trophy size={28} className="text-amber-300" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                LUCKY DAILY SPIN JACKPOT
              </span>
              <h3 className="text-xl font-black text-white">
                CONGRATULATIONS!
              </h3>
              <p className="text-xs text-zinc-400">
                You landed on the {wonPrize.badge} segment!
              </p>
            </div>

            {/* Prize Highlight Box */}
            <div className="bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-amber-950/40 border border-amber-400/50 p-4 rounded-2xl shadow-inner">
              <span className="text-xs font-bold text-amber-200/90 block mb-1 uppercase tracking-wider">
                CASH PRIZE WON:
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-mono text-yellow-300 tracking-tight drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]">
                {wonPrize.label}
              </h2>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-1.5 flex items-center justify-center gap-1">
                <Icons.Check size={12} className="stroke-[3]" />
                Directly added to your Available Balance
              </span>
            </div>

            <button
              onClick={() => {
                setShowWinCelebration(false);
                casinoAudio.playButtonClick();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer active:scale-95"
            >
              Collect & Continue
            </button>

          </div>
        </div>
      )}

      <style>{`
        @keyframes confetti-drop {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-drop {
          animation: confetti-drop linear infinite;
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
