import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { NotificationPreferences } from '../types';

interface LiveNotificationsProps {
  preferences: NotificationPreferences;
}

interface CashoutData {
  firstName: string;
  initial: string;
  amountStr: string;
  bank: string;
  txRef: string;
}

// Nigerian names & standard initials
const firstNames = [
  "Mary", "John", "Chioma", "Emeka", "Olamide", "Sarah", "Grace", "David", 
  "Adewale", "Fatima", "Zainab", "Musa", "Blessing", "Emmanuel", "Amina", 
  "Chidi", "Tunde", "Bisi", "Kelechi", "Ngozi", "Yusuf", "Daniel", "Joy", 
  "Rita", "Florence", "Victor", "Babatunde", "Ifeanyi", "Nneka", "Amaka", 
  "Suleiman", "Ibrahim", "Tochukwu", "Kazeem", "Aisha", "Olumide", "Chinedu",
  "Uchenna", "Efe", "Tari", "Kufre", "Tobiloba", "Funmilayo", "Yetunde"
];

const initials = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "R", "S", "T", "U", "V", "W", "Y", "Z"];

const banks = [
  "Access Bank", "Kuda Bank", "GTBank", "Zenith Bank", "OPay", 
  "PalmPay", "First Bank", "UBA", "Fidelity Bank", "Wema Bank", 
  "Moniepoint"
];

const LiveNotifications: React.FC<LiveNotificationsProps> = ({ preferences }) => {
  const [cashout, setCashout] = useState<CashoutData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show random cashout testimony notification function
    const showRandomNotification = () => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const initial = initials[Math.floor(Math.random() * initials.length)];
      const bank = banks[Math.floor(Math.random() * banks.length)];
      
      // Random realistic withdrawal amount between 15,000 and 950,000 naira
      const amountVal = Math.floor(Math.random() * (950000 - 15000 + 1) + 15000);
      const amountStr = amountVal.toLocaleString();
      const randomRef = Math.floor(100000 + Math.random() * 900000);

      setCashout({
        firstName,
        initial,
        amountStr,
        bank,
        txRef: `CHX-${randomRef}`
      });
      setIsVisible(true);

      // Hide after 5.5 seconds
      setTimeout(() => setIsVisible(false), 5500);
    };

    // Initial delay before first notification
    const initialTimeout = setTimeout(showRandomNotification, 2500);

    // Loop interval (every 11 seconds)
    const interval = setInterval(() => {
      showRandomNotification();
    }, 11000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [preferences]);

  if (!cashout) return null;

  return (
    <div className={`fixed bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 z-[70] w-[88%] max-w-[290px] sm:max-w-[310px] transition-all duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95 pointer-events-none'}`}>
      
      {/* Outer Shining Metallic Gold Frame */}
      <div className="p-[1.5px] rounded-xl bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-600 shadow-[0_6px_20px_rgba(234,179,8,0.4),0_0_12px_rgba(250,204,21,0.25)] animate-gold-glow relative overflow-hidden">
        
        {/* Continuous Diagonal Gold Light Sweep Reflection */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100/30 to-transparent -skew-x-12 animate-gold-sweep pointer-events-none z-30" />

        {/* Inner Money / Banknote Card Container */}
        <div className="bg-gradient-to-b from-[#1c1303] via-[#2a1b04] to-[#120a01] text-white p-2 rounded-[10px] relative overflow-hidden border border-amber-400/60 shadow-xl">
          
          {/* Subtle Banknote Watermark Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#facc15_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.08] pointer-events-none" />

          {/* Money Banknote Inner Guilloché Border Frame */}
          <div className="border border-dashed border-amber-400/50 rounded-lg p-1.5 relative z-10 bg-gradient-to-b from-amber-950/40 via-yellow-950/20 to-black/60 backdrop-blur-sm">
            
            {/* Top Micro Header Row */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-1 bg-gradient-to-r from-amber-950 to-yellow-900 border border-amber-400/50 px-1.5 py-0.2 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-wider text-amber-200">
                  CASHOUT PROOF
                </span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[8px] font-mono text-amber-300/80 font-bold bg-black/70 px-1 py-0.2 rounded border border-amber-500/30">
                  {cashout.txRef}
                </span>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-amber-300/60 hover:text-white p-0.5 rounded cursor-pointer"
                  aria-label="Close"
                >
                  <Icons.X size={11} />
                </button>
              </div>
            </div>

            {/* Main Content: Single Row Layout for maximum compactness */}
            <div className="flex items-center space-x-2">
              {/* Mini Gold Medallion Stamp */}
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600 p-[1px] shadow-[0_0_8px_rgba(250,204,21,0.6)] flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gradient-to-b from-amber-950 via-yellow-900 to-amber-950 flex items-center justify-center border border-yellow-300/70 relative">
                    <Icons.Banknote size={13} className="text-yellow-300" />
                  </div>
                </div>
              </div>

              {/* User Name & Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 leading-none">
                  <span className="text-[10px] font-black text-amber-100 truncate">
                    {cashout.firstName} {cashout.initial}.
                  </span>
                  <span className="text-[8px] font-black text-emerald-400 bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-500/40">
                    PAID
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5 leading-none">
                  <span className="text-[11px] font-black font-mono text-yellow-300 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">
                    ₦{cashout.amountStr}
                  </span>
                  <span className="text-[8px] font-semibold text-amber-300/80 truncate max-w-[90px]">
                    {cashout.bank}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Glowing Metallic Gold Progress Bar */}
          {isVisible && (
            <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 shadow-[0_0_8px_rgba(250,204,21,0.9)] rounded-b-xl animate-progress-bar" />
          )}

        </div>
      </div>

      <style>{`
        @keyframes progress-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes gold-sweep {
          0% { transform: translateX(-120%) skewX(-12deg); }
          100% { transform: translateX(220%) skewX(-12deg); }
        }
        @keyframes gold-glow {
          0%, 100% {
            box-shadow: 0 10px 30px rgba(234, 179, 8, 0.45), 0 0 18px rgba(250, 204, 21, 0.3);
          }
          50% {
            box-shadow: 0 14px 45px rgba(234, 179, 8, 0.75), 0 0 28px rgba(250, 204, 21, 0.6);
          }
        }
        @keyframes pulse-gentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-progress-bar {
          animation: progress-bar 5.5s linear forwards;
        }
        .animate-gold-sweep {
          animation: gold-sweep 3.5s infinite ease-in-out;
        }
        .animate-gold-glow {
          animation: gold-glow 2.5s infinite ease-in-out;
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 2s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LiveNotifications;
