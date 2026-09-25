import React from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: User | null;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, user }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Icons.Home },
    { id: 'transfer', label: 'Transfer', icon: Icons.ArrowLeftRight },
    { id: 'services', label: 'Services', icon: Icons.LayoutGrid },
    { id: 'profile', label: 'Profile', icon: Icons.User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe-area z-50">
      <div className="max-w-md mx-auto flex justify-around items-center px-4 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center py-1 flex-1 relative transition-colors cursor-pointer group active:scale-95"
            >
              <div className="relative mb-0.5">
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 1.8} 
                  className={`transition-colors ${
                    isActive ? 'text-[#008751]' : 'text-slate-400 group-hover:text-slate-600'
                  }`} 
                />
              </div>

              <span className={`text-[11px] font-medium transition-colors ${
                isActive ? 'text-[#008751] font-bold' : 'text-slate-400 group-hover:text-slate-600'
              }`}>
                {tab.label}
              </span>

              {/* Active Indicator Bar (Underneath Home in the uploaded screenshot) */}
              {isActive && (
                <div className="w-6 h-[3px] bg-[#008751] rounded-full mt-1 transition-all"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;