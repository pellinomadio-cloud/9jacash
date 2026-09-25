import React from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface ServicesPageProps {
  user: User;
  onActionClick: (actionId: string) => void;
  onBack: () => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ user, onActionClick, onBack }) => {
  const categories = [
    {
      title: "Wallet & Transfers",
      items: [
        { id: "deposit", label: "Fund Wallet", icon: Icons.ArrowUpRight, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Top up your wallet balance instantly" },
        { id: "bank", label: "Withdraw", icon: Icons.Send, color: "text-emerald-700", bg: "bg-emerald-50", desc: "Withdraw to bank account" },
        { id: "transfer", label: "Transfer Money", icon: Icons.ArrowLeftRight, color: "text-blue-600", bg: "bg-blue-50", desc: "Send to any Nigerian bank" },
        { id: "transaction_history", label: "History", icon: Icons.Clock, color: "text-slate-700", bg: "bg-slate-100", desc: "View all previous payments" },
      ]
    },
    {
      title: "Telecom & Utilities",
      items: [
        { id: "buy_airtime", label: "Buy Airtime", icon: Icons.Airtime, color: "text-[#16a34a]", bg: "bg-[#dcfce7]", desc: "MTN, Airtel, Glo, 9mobile" },
        { id: "buy_data", label: "Buy Data", icon: Icons.Globe, color: "text-[#16a34a]", bg: "bg-[#dcfce7]", desc: "Cheap daily, weekly & monthly bundles" },
      ]
    },
    {
      title: "Earn & Rewards",
      items: [
        { id: "promo", label: "Promo Deals", icon: Icons.Gift, color: "text-amber-600", bg: "bg-amber-50", badge: "HOT", desc: "Exclusive promotional perks & bonuses" },
        { id: "referrals", label: "Refer & Earn", icon: Icons.Users, color: "text-teal-600", bg: "bg-teal-50", badge: "₦15,000", desc: "Earn for inviting friends" },
        { id: "rewards", label: "Rewards & Spin", icon: Icons.Reward, color: "text-amber-500", bg: "bg-amber-50", desc: "Spin fortune wheel daily" },
        { id: "tasks", label: "Daily Tasks", icon: Icons.Calendar, color: "text-orange-600", bg: "bg-orange-50", desc: "Complete tasks for cash" },
        { id: "quiz_game", label: "Gaming Hub", icon: Icons.Gamepad2, color: "text-fuchsia-600", bg: "bg-fuchsia-50", desc: "Play trivia quiz to win" },
      ]
    },
    {
      title: "Community & Membership",
      items: [
        { id: "community", label: "Message Service", icon: Icons.MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Chat with active members" },
        { id: "invest", label: "Investment", icon: Icons.Invest, color: "text-indigo-600", bg: "bg-indigo-50", desc: "Fixed return yield programs" },
        { id: "upgrade", label: "VIP Club", icon: Icons.Upgrade, color: "text-amber-600", bg: "bg-amber-50", desc: "Priority support and limits" },
        { id: "advertise", label: "Advertise", icon: Icons.Megaphone, color: "text-rose-600", bg: "bg-rose-50", desc: "Place sponsored banner ads" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f6] pb-24 text-slate-900 animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="bg-[#013d26] text-white px-4 py-4 sticky top-0 z-40 shadow-md flex items-center space-x-3">
        <button 
          onClick={onBack}
          className="p-1 hover:bg-emerald-900/50 rounded-full cursor-pointer active:scale-95"
        >
          <Icons.ArrowLeft size={22} className="text-white" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">All Services</h1>
      </div>

      <div className="p-4 space-y-6">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              {cat.title}
            </h3>
            <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
              {cat.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onActionClick(item.id)}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer group active:bg-slate-100"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-11 h-11 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                        <Icon size={22} strokeWidth={2.2} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                          {item.badge && (
                            <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.2 rounded-full shadow-xs uppercase">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <Icons.ChevronRight size={18} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;
