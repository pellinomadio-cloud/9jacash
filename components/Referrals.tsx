import React, { useState } from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface ReferralsProps {
  user: User;
  onBack: () => void;
}

const Referrals: React.FC<ReferralsProps> = ({ user, onBack }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = user.referralCode || user.email.split('@')[0].toUpperCase();
  const currentOrigin = typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null'
    ? window.location.origin
    : 'https://9jacash.online';
  const referralLink = `${currentOrigin}?ref=${referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
      .then(() => {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      })
      .catch((err) => console.error("Could not copy code", err));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      })
      .catch((err) => console.error("Could not copy link", err));
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-900 font-sans pb-28">
      {/* Top Header - Matching Dashboard Forest Green (#013a24) */}
      <div className="bg-[#013a24] text-white pt-6 pb-8 px-5 rounded-b-[2.2rem] shadow-lg relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md mx-auto relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-emerald-900/60 rounded-full transition-colors text-white active:scale-95 cursor-pointer"
              aria-label="Back to dashboard"
            >
              <Icons.ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">Refer & Earn Program</h1>
              <p className="text-[11px] text-emerald-200/80 font-medium">Earn ₦15,000 for each friend you invite</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 bg-emerald-900/60 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-300">
            <Icons.Users size={12} />
            <span>₦15k / Invite</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        {/* Main Stats Card - Matching Dashboard Emerald Gradient */}
        <div className="bg-gradient-to-br from-[#013a24] via-[#025636] to-[#013a24] border border-emerald-600/30 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-amber-300 shadow-inner">
              <Icons.Users size={24} />
            </div>
            <div>
              <h3 className="text-[10px] text-emerald-200/80 font-black uppercase tracking-wider">Your Referral Network</h3>
              <p className="text-xs font-semibold text-white/95">Instant ₦15,000 direct payout commission</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-emerald-200/70 font-bold uppercase tracking-wider">Friends Invited</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-2xl font-black text-white">{user.referralCount || 0}</span>
                <span className="text-xs text-emerald-300/80 font-medium">citizens</span>
              </div>
            </div>
            <div className="bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-emerald-200/70 font-bold uppercase tracking-wider">Total Commission</span>
              <div className="flex items-baseline space-x-1 mt-1">
                <span className="text-2xl font-black text-amber-300">₦{(user.referralEarnings || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copy Actions Card - Clean White Card Matching Dashboard */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-sm">
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
              My Invitation Code
            </label>
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 pl-3.5 focus-within:border-emerald-600 transition-all">
              <span className="text-base font-mono font-black text-slate-900 tracking-widest flex-1">
                {referralCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="py-2.5 px-4 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-xs font-black uppercase tracking-tight transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                {copiedCode ? (
                  <>
                    <Icons.Check size={14} className="text-white" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Icons.Copy size={14} />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">
                Official Referral Link
              </label>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                9jacash.online
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 pl-3.5 focus-within:border-emerald-600 transition-all">
              <span className="text-xs text-slate-700 truncate flex-1 font-mono font-bold">
                {referralLink}
              </span>
              <button
                onClick={handleCopyLink}
                className="py-2.5 px-4 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-xs font-black uppercase tracking-tight transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                {copiedLink ? (
                  <>
                    <Icons.Check size={14} className="text-white" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Icons.Share2 size={14} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Join me on 9jacash and get ₦43,000 instant bonus! Sign up using my official link: https://9jacash.online?ref=${referralCode}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-2xl text-xs font-black text-emerald-800 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xs"
              >
                <Icons.Send size={15} className="text-emerald-700" />
                <span>Share via WhatsApp (9jacash.online)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Program Benefits Rule Book */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <span className="text-amber-500">🎁</span>
              <span>Referral Program Rules</span>
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Verified Terms
            </span>
          </h4>
          <div className="space-y-3.5">
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/70 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Share your invite</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Share your invitation code or dynamic link with friends and on social channels.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/70 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Friend joins & signs up (₦2,500 Gift)</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  Your invited friends receive a starting balance of <span className="text-amber-700 font-bold">₦12,500</span> instead of standard ₦10,000.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Receive Instant Credit (₦15,000 Commission)</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                  We immediately credit <span className="text-emerald-700 font-bold">₦15,000.00</span> commission into your primary 9jacash balance!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recruited Friends list */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Referred Friends ({user.referredUsers?.length || 0})
            </span>
          </div>
          
          {user.referredUsers && user.referredUsers.length > 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl divide-y divide-slate-100 shadow-sm overflow-hidden">
              {user.referredUsers.map((invitedEmail, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-700 font-mono text-xs font-black">
                      {invitedEmail[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 font-mono">{invitedEmail}</p>
                      <p className="text-[10px] text-slate-400">Joined successfully</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-700 font-bold font-mono">+₦15,000.00</span>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">Credited</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center shadow-xs">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <Icons.Users size={24} />
              </div>
              <p className="text-xs text-slate-700 font-bold">No referrals yet</p>
              <p className="text-[11px] text-slate-400 mt-1">Get started by copying your invitation link above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Referrals;
