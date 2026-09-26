import React, { useState } from 'react';
import { Icons } from './Icons';

interface ActionGridProps {
  onActionClick?: (id: string) => void;
  balance?: number;
  onViewAll?: () => void;
}

const ActionGrid: React.FC<ActionGridProps> = ({ 
  onActionClick, 
  onViewAll 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const primaryActions = [
    {
      id: 'community',
      title: 'Message',
      subtitle: 'Service',
      icon: Icons.MessageSquare,
      iconBg: 'bg-[#dcfce7]',
      iconColor: 'text-[#16a34a]',
      badge: 'dot',
    },
    {
      id: 'buy_data',
      title: 'Buy',
      subtitle: 'Data',
      icon: Icons.Globe,
      iconBg: 'bg-[#dcfce7]',
      iconColor: 'text-[#16a34a]',
    },
    {
      id: 'buy_airtime',
      title: 'Buy',
      subtitle: 'Airtime',
      icon: Icons.Airtime,
      iconBg: 'bg-[#dcfce7]',
      iconColor: 'text-[#16a34a]',
    },
    {
      id: 'promo',
      title: 'Promo',
      subtitle: '',
      icon: Icons.Gift,
      iconBg: 'bg-emerald-50 border border-emerald-200/80',
      iconColor: 'text-[#008751]',
      isHot: true,
    }
  ];

  const secondaryActions = [
    { id: 'bank', label: 'Withdraw', icon: Icons.Send, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'transfer', label: 'Transfer', icon: Icons.ArrowLeftRight, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'referrals', label: 'Refer & Earn', icon: Icons.Users, color: 'text-teal-600', bg: 'bg-teal-50', badge: '₦15k' },
    { id: 'rewards', label: 'Rewards', icon: Icons.Reward, color: 'text-amber-500', bg: 'bg-amber-50', badge: 'Spin' },
    { id: 'tasks', label: 'Daily Tasks', icon: Icons.Calendar, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'invest', label: 'Invest', icon: Icons.Invest, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'quiz_game', label: 'Gaming Hub', icon: Icons.Gamepad2, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50' },
    { id: 'advertise', label: 'Advertise', icon: Icons.Megaphone, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const handleViewAllToggle = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex justify-between items-center px-1">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Quick Actions
        </h3>
        <button 
          onClick={handleViewAllToggle}
          className="text-[#008751] hover:text-[#00663d] font-semibold text-sm flex items-center space-x-1 cursor-pointer transition-colors active:scale-95"
        >
          <span>View All</span>
          <Icons.ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* 4 Cards Grid - Exactly Matching Uploaded Image */}
      <div className="grid grid-cols-4 gap-2.5">
        {primaryActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onActionClick?.(action.id)}
              className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col items-center justify-between text-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all active:scale-95 cursor-pointer min-h-[110px] group"
            >
              {/* Circular Icon with Badge */}
              <div className="relative mb-2">
                <div className={`w-12 h-12 rounded-full ${action.iconBg} ${action.iconColor} flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs`}>
                  <Icon size={24} strokeWidth={2.2} />
                </div>
                {action.badge === 'dot' && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-xs"></span>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="flex flex-col items-center justify-center leading-tight">
                <span className="text-xs font-semibold text-slate-800">
                  {action.title}
                </span>
                {action.subtitle && (
                  <span className="text-xs font-semibold text-slate-800">
                    {action.subtitle}
                  </span>
                )}
                {action.isHot && (
                  <span className="mt-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider shadow-xs uppercase border border-amber-300">
                    HOT
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Actions Drawer if View All clicked */}
      {isExpanded && (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">More Services</span>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {secondaryActions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onActionClick?.(item.id)}
                  className="flex flex-col items-center justify-center text-center space-y-1.5 p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all cursor-pointer relative"
                >
                  {item.badge && (
                    <span className="absolute -top-1 right-1 bg-amber-400 text-slate-900 font-extrabold text-[8px] px-1.5 py-0.2 rounded-full shadow-xs">
                      {item.badge}
                    </span>
                  )}
                  <div className={`w-10 h-10 rounded-full ${item.bg} ${item.color} flex items-center justify-center shadow-xs`}>
                    <Icon size={20} strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700 leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionGrid;
