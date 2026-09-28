import React, { useState, useRef } from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onUpdateProfile: (updatedUser: Partial<User>) => void;
  onLinkAccountClick: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
  vendorTelegramLink?: string;
  onOpenAiSupport?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  user, 
  onUpdateProfile, 
  onLinkAccountClick, 
  darkMode, 
  toggleDarkMode, 
  onLogout, 
  vendorTelegramLink,
  onOpenAiSupport 
}) => {
  const [name, setName] = useState(user.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const referralCode = user.referralCode || user.email.split('@')[0].toUpperCase();
  const accountId = `9JC-${referralCode.slice(0, 8)}`;

  // Withdrawal bank account button only appears when user has made their first withdrawal
  const hasMadeFirstWithdrawal = Boolean(
    user.isAccountLinkedVerified ||
    user.linkedAccountNumber ||
    user.pendingWithdrawal ||
    (user.transactions && user.transactions.some(t => 
      t.type === 'debit' || 
      t.isFirstWithdrawal ||
      t.description?.toLowerCase().includes('withdraw') ||
      t.description?.toLowerCase().includes('transfer') ||
      t.description?.toLowerCase().includes('cashout')
    ))
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({ profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    const trimmed = name.trim().replace(/\s+/g, ' ');
    if (trimmed.length >= 2) {
      onUpdateProfile({ name: trimmed });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
    setIsEditingName(false);
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  return (
    <div className="px-4 py-4 space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300 pb-20">
      
      {/* 1. Premium 9jacash Identity Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#013a24] via-[#024a2e] to-[#008751] text-white p-6 shadow-xl shadow-emerald-950/15 border border-emerald-600/30">
        {/* Background Decorative Rings */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-52 h-52 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />

        {/* Top Tier Label */}
        <div className="flex items-center justify-between relative z-10 mb-5">
          <div className="flex items-center space-x-2 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
              {user.isSubscribed ? 'Subscribed Member' : 'Standard Member'}
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-200/90">
            {accountId}
          </span>
        </div>

        {/* User Info with Avatar */}
        <div className="flex items-center space-x-4 relative z-10">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/30 shadow-md flex items-center justify-center backdrop-blur-sm">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-black tracking-tight">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 bg-amber-400 text-black p-1.5 rounded-xl shadow-lg hover:bg-amber-300 transition-transform active:scale-95 cursor-pointer"
              title="Change profile picture"
            >
              <Icons.Camera size={13} className="stroke-[2.5]" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="sr-only" 
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <h2 className="text-xl font-black text-white tracking-tight truncate">
                {user.name}
              </h2>
              <Icons.ShieldCheck size={18} className="text-emerald-300 shrink-0" />
            </div>
            <p className="text-xs text-emerald-100/80 truncate font-medium mt-0.5">
              {user.email}
            </p>
            <div className="mt-2 inline-flex items-center space-x-1 text-[10px] font-bold bg-white/15 px-2.5 py-0.5 rounded-lg text-emerald-50">
              <span>Tier:</span>
              <span className="text-amber-300 font-extrabold">{user.isSubscribed ? 'PRO ACTIVE' : 'FREE TIER'}</span>
            </div>
          </div>
        </div>

        {/* Balance Preview inside Card */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
          <div>
            <p className="text-[10px] font-semibold text-emerald-200/90 uppercase tracking-wider">
              Available Balance
            </p>
            <p className="text-2xl font-black text-white tracking-tight font-sans">
              ₦{user.balance.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold text-emerald-200/90 uppercase tracking-wider">
              Referrals
            </p>
            <p className="text-base font-black text-amber-300">
              {user.referralCount || 0} Members
            </p>
          </div>
        </div>
      </div>

      {/* 2. Referral & Invite Quick Box */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-slate-700">
            <Icons.Users size={14} className="text-[#008751]" />
            Your Referral Code
          </span>
          <span className="text-[10px] text-emerald-600 bg-emerald-50 font-bold px-2 py-0.5 rounded-full">
            Earn ₦15,000 / ref
          </span>
        </div>
        <div className="flex items-center justify-between bg-[#f8faf9] p-3 rounded-2xl border border-slate-200/70">
          <span className="font-mono font-black text-slate-900 tracking-wider text-base">
            {referralCode}
          </span>
          <button
            onClick={handleCopyReferral}
            className="flex items-center space-x-1 px-3 py-1.5 bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <Icons.Copy size={13} />
            <span>{copiedReferral ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* 3. Account Settings & Details */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Account Profile & Information
        </h3>

        {/* Name Editor */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="p-2.5 bg-emerald-50 rounded-2xl text-[#008751] shrink-0">
              <Icons.User size={18} />
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-[11px] font-semibold text-slate-400">Display Name</p>
              {isEditingName ? (
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 p-2 border border-emerald-300 rounded-xl text-xs bg-slate-50 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                  placeholder="Enter full name"
                />
              ) : (
                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => isEditingName ? handleSaveName() : setIsEditingName(true)}
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700"
          >
            {isEditingName ? 'Save' : 'Edit'}
          </button>
        </div>

        {/* Email Address */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="p-2.5 bg-blue-50 rounded-2xl text-blue-600 shrink-0">
              <Icons.Mail size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-400">Email Address</p>
              <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            Verified
          </span>
        </div>

        {/* Security PIN Status */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600 shrink-0">
              <Icons.Lock size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Security PIN</p>
              <p className="text-sm font-bold text-slate-800">4-Digit Security Active</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Protected
          </span>
        </div>

        {/* Withdrawal Bank Account Link Action - ONLY appears when user has made their first withdrawal */}
        {hasMadeFirstWithdrawal && (
          <div className="pt-1">
            <button 
              onClick={onLinkAccountClick}
              className="w-full p-4 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between group transition-all active:scale-[0.98] text-left cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-[#008751] text-white rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                  <Icons.Building size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 leading-tight">
                    Withdrawal Bank Account
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                    {user.isAccountLinkedVerified ? 'Verified Payout Account' : 'Link Payout Account'}
                  </p>
                </div>
              </div>
              <Icons.ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-700 transition-colors" />
            </button>
          </div>
        )}

        {/* Official 24/7 AI Support & Vendor Desk Link */}
        <div>
          <button 
            onClick={() => {
              if (onOpenAiSupport) {
                onOpenAiSupport();
              } else if (vendorTelegramLink) {
                window.open(vendorTelegramLink, "_blank");
              } else {
                window.open("https://t.me/9jacash_support", "_blank");
              }
            }}
            className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between group transition-all active:scale-[0.98] text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-tr from-[#013a24] to-[#025636] text-white rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                <Icons.Bot size={18} className="text-amber-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-xs font-black text-slate-900 leading-tight">
                    24/7 AI Support & Assistance
                  </p>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full border border-emerald-300">
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Instant help with withdrawals, quick codes & account
                </p>
              </div>
            </div>
            <Icons.ChevronRight size={18} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>
        </div>
      </div>

      {/* 4. Logout Section */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
        <button 
          onClick={onLogout}
          className="w-full p-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 rounded-2xl flex items-center justify-center space-x-2 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
        >
          <Icons.LogOut size={16} />
          <span>Sign Out of Account</span>
        </button>
      </div>

      {/* 5. Trust & Compliance Footer */}
      <div className="text-center pt-2 pb-4 space-y-1">
        <div className="flex items-center justify-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Icons.ShieldCheck size={13} className="text-emerald-600" />
          <span>9jacash Verified Partner Protocols</span>
        </div>
        <p className="text-[9px] text-slate-400 font-medium">
          Licensed Payouts • 256-bit Secure Encryption
        </p>
      </div>

    </div>
  );
};

export default Profile;