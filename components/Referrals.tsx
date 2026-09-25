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
  const referralLink = `https://chix9ja.online?ref=${referralCode}`;

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
    <div className="px-4 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-900 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <Icons.ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-white text-center flex-1 pr-8">Refer & Earn Program</h2>
      </div>

      {/* Main Stats Card */}
      <div className="bg-gradient-to-br from-green-glow/20 via-black to-gray-900 border border-green-glow/30 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-glow/5 rounded-full blur-2xl"></div>
        
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-green-glow/20 rounded-2xl flex items-center justify-center text-green-glow">
            <Icons.Users size={24} />
          </div>
          <div>
            <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Your Referral Network</h3>
            <p className="text-sm font-medium text-gray-300">Share with family & friends and earn ₦15,000 for each referral</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-800">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Friends Invited</span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-black text-white">{user.referralCount || 0}</span>
              <span className="text-xs text-gray-500 font-medium">citizens</span>
            </div>
          </div>
          <div className="bg-gray-900/60 p-4 rounded-2xl border border-gray-800">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Commission</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-black text-green-glow">₦{(user.referralEarnings || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copy Actions Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">My Invitation Code</label>
          <div className="flex items-center space-x-2 bg-black border border-gray-800 rounded-xl p-2 pl-3">
            <span className="text-lg font-mono font-black text-green-glow tracking-widest flex-1">{referralCode}</span>
            <button
              onClick={handleCopyCode}
              className="py-2 px-4 rounded-lg bg-green-glow hover:bg-green-dark text-black text-xs font-black uppercase tracking-tight transition-all active:scale-95 flex items-center space-x-1"
            >
              {copiedCode ? (
                <>
                  <Icons.Check size={14} />
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
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Official Referral Link</label>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">chix9ja.online</span>
          </div>
          <div className="flex items-center space-x-2 bg-black border border-gray-800 rounded-xl p-2 pl-3">
            <span className="text-xs text-emerald-300 truncate flex-1 font-mono font-bold">{referralLink}</span>
            <button
              onClick={handleCopyLink}
              className="py-2 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-tight transition-all active:scale-95 flex items-center space-x-1 cursor-pointer shadow-md"
            >
              {copiedLink ? (
                <>
                  <Icons.Check size={14} className="text-black" />
                  <span className="text-black">Copied</span>
                </>
              ) : (
                <>
                  <Icons.Share2 size={14} />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
          <div className="mt-2.5">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Join me on Chix9ja and get ₦10,000 instant bonus! Sign up using my official link: https://chix9ja.online?ref=${referralCode}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Icons.Send size={14} className="text-emerald-400" />
              <span>Share via WhatsApp (chix9ja.online)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Program Benefits Rule Book */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2 flex items-center space-x-2">
          <span>🎁 Referral Program rules</span>
        </h4>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
            <div>
              <h5 className="text-xs font-bold text-white">Share invite</h5>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">Share your distinct invitation code or dynamic signup link with friends online.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-amber-900/30 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
            <div>
              <h5 className="text-xs font-bold text-white">Friend joins & signs up (₦2,500 Gift)</h5>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">Your invites start with a starting balance of <span className="text-amber-400 font-bold">₦12,500</span> instead of standard ₦10,000.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-emerald-950 text-green-glow flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
            <div>
              <h5 className="text-xs font-bold text-white">Receive Instant Credit (₦15,000 commission)</h5>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5">We immediately add a premium <span className="text-green-glow font-bold">₦15,000.00</span> commission to your primary dashboard balance!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recruited Friends list */}
      <div className="space-y-3">
        <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Referred Cadets</span>
        
        {user.referredUsers && user.referredUsers.length > 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800 overflow-hidden">
            {user.referredUsers.map((invitedEmail, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-800/40 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-green-glow/10 rounded-full flex items-center justify-center text-green-glow font-mono text-xs font-bold">
                    {invitedEmail[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white font-mono">{invitedEmail}</p>
                    <p className="text-[10px] text-gray-500">Joined successfully</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-green-glow font-bold font-mono">+₦15,000.00</span>
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wide">Paid Out</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border-2 border-dashed border-gray-800 rounded-2xl p-8 text-center">
            <Icons.Users className="mx-auto text-gray-700 mb-2" size={32} />
            <p className="text-xs text-gray-400 font-bold">No referrals yet</p>
            <p className="text-[10px] text-gray-500 mt-1">Get started by copying your invitation link above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;
