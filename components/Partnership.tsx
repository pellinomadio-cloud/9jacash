import React, { useState } from 'react';
import { Icons } from './Icons';
import { User } from '../types';

interface PartnershipProps {
  user: User;
  vendorTelegramLink?: string;
  onUpdateUser: (updatedData: Partial<User>) => void;
  onGoToSubscribe: () => void;
  onBack: () => void;
}

export const Partnership: React.FC<PartnershipProps> = ({
  user,
  vendorTelegramLink,
  onUpdateUser,
  onGoToSubscribe,
  onBack,
}) => {
  const [channelName, setChannelName] = useState(user.partnershipApplication?.channelName || '');
  const [channelLink, setChannelLink] = useState(user.partnershipApplication?.channelLink || '');
  const [platform, setPlatform] = useState(user.partnershipApplication?.platform || 'telegram');
  const [audienceSize, setAudienceSize] = useState(user.partnershipApplication?.audienceSize || '');
  const [contactHandle, setContactHandle] = useState(user.partnershipApplication?.contactHandle || '');
  const [notes, setNotes] = useState(user.partnershipApplication?.notes || '');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formError, setFormError] = useState('');

  const vendorUrl = vendorTelegramLink || 'https://t.me/chix9ja_vendor';

  const isSubscribed = Boolean(user.isSubscribed);
  const hasApplication = Boolean(user.partnershipApplication);

  // Unsubscribed user qualification gate
  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-black text-white pb-24 animate-in fade-in duration-300">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
            >
              <Icons.ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                <Icons.Handshake size={18} className="text-amber-400" />
                Partnership
              </h1>
              <p className="text-[11px] text-zinc-400">Chix9ja Partner Program</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-sm mx-auto p-4 pt-16 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-500/5 rounded-3xl border border-red-500/30 flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,0.2)]">
            <Icons.ShieldAlert size={38} className="text-red-400" />
          </div>

          <div className="space-y-3 pt-1">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Qualifications Not Matched
            </h2>
            <div className="p-4 bg-zinc-900/80 border border-red-500/30 rounded-2xl">
              <p className="text-sm font-medium text-zinc-300 leading-relaxed">
                Your Chix9ja account has not matched the qualifications to partner.
              </p>
            </div>
          </div>

          <div className="w-full pt-4">
            <button
              onClick={onBack}
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider border border-zinc-800 shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isSubscribed) {
      setFormError('You must be an active subscribed member to apply for partnership. Please subscribe first.');
      return;
    }

    if (!channelName.trim()) {
      setFormError('Please enter your promotional channel or group name.');
      return;
    }

    if (!channelLink.trim()) {
      setFormError('Please provide the direct link (URL) to your promotional channel or group.');
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const application = {
        channelName: channelName.trim(),
        channelLink: channelLink.trim(),
        platform,
        audienceSize: audienceSize.trim() || 'New Channel',
        contactHandle: contactHandle.trim() || user.email,
        notes: notes.trim(),
        appliedAt: new Date().toISOString(),
        status: 'pending' as const,
      };

      onUpdateUser({
        partnershipApplication: application,
      });

      setSubmitting(false);
      setShowSuccessModal(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 animate-in fade-in duration-300">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
          >
            <Icons.ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <Icons.Handshake size={18} className="text-amber-400" />
              Partnership Program
            </h1>
            <p className="text-[11px] text-zinc-400">Official Chix9ja Brand Ambassador Network</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-mono font-black uppercase tracking-wider">
          EARN WITH CHIX9JA
        </span>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-amber-500/30 p-5 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Icons.Briefcase size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                  EXCLUSIVE OPPORTUNITY
                </span>
                <h2 className="text-lg font-black text-white tracking-tight leading-snug">
                  Become an Official Chix9ja Partner
                </h2>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Earn generous recurring commissions, unlock daily promotional creative kits, enjoy priority withdrawal channels, and receive dedicated one-on-one vendor guidance to scale your earnings.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-black/60 border border-zinc-800/80 rounded-2xl p-2.5">
                <p className="text-[10px] text-zinc-400 font-medium">Commission</p>
                <p className="text-sm font-black text-amber-400 font-mono mt-0.5">Up to 25%</p>
              </div>
              <div className="bg-black/60 border border-zinc-800/80 rounded-2xl p-2.5">
                <p className="text-[10px] text-zinc-400 font-medium">Payouts</p>
                <p className="text-sm font-black text-emerald-400 font-mono mt-0.5">Instant</p>
              </div>
              <div className="bg-black/60 border border-zinc-800/80 rounded-2xl p-2.5">
                <p className="text-[10px] text-zinc-400 font-medium">Partner Desk</p>
                <p className="text-sm font-black text-yellow-400 font-mono mt-0.5">Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Qualification Requirements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Icons.ShieldCheck size={14} className="text-amber-400" />
              Partnership Qualification Checklist
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">3 MANDATORY STEPS</span>
          </div>

          {/* Requirement 1: Active Subscription */}
          <div className={`rounded-2xl border p-4 transition-all ${
            isSubscribed 
              ? 'bg-emerald-950/20 border-emerald-500/40' 
              : 'bg-zinc-900/60 border-amber-500/30'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isSubscribed 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {isSubscribed ? <Icons.CheckCircle size={18} /> : <Icons.Lock size={18} />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-white">Step 1: Subscribed Member Status</span>
                    {isSubscribed ? (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-black rounded-full uppercase border border-emerald-500/30">
                        Qualified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[9px] font-black rounded-full uppercase border border-red-500/30">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Only verified subscribed members are eligible to hold a Chix9ja partnership badge and receive partner commission payouts.
                  </p>
                  {isSubscribed && (
                    <p className="text-[11px] font-mono text-emerald-400 font-semibold pt-0.5">
                      ✓ Active Plan: {user.subscriptionPlan || 'Subscribed Member'}
                    </p>
                  )}
                </div>
              </div>

              {!isSubscribed && (
                <button
                  type="button"
                  onClick={onGoToSubscribe}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs rounded-xl uppercase tracking-wider transition-all active:scale-95 flex-shrink-0 cursor-pointer shadow-md"
                >
                  Subscribe
                </button>
              )}
            </div>
          </div>

          {/* Requirement 2: Promotional Channel */}
          <div className="rounded-2xl border bg-zinc-900/60 border-zinc-800/90 p-4 space-y-2">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icons.Megaphone size={18} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-white">Step 2: Create a Promotional Channel</span>
                  {hasApplication ? (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-black rounded-full uppercase border border-emerald-500/30">
                      Channel Submitted
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[9px] font-black rounded-full uppercase border border-blue-500/30">
                      Channel Needed
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  You must create an active public or private channel (e.g. Telegram Channel, WhatsApp Group/Channel, YouTube, or TikTok) where you will regularly promote Chix9ja and share proof of payments.
                </p>
              </div>
            </div>
          </div>

          {/* Requirement 3: Contact Vendor */}
          <div className="rounded-2xl border bg-zinc-900/60 border-zinc-800/90 p-4 space-y-2.5">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icons.Support size={18} />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-white">Step 3: Contact Vendor for Rules & Onboarding</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] font-black rounded-full uppercase border border-amber-500/30">
                    Official Guide
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Contact an official Chix9ja Verified Vendor on Telegram. The vendor will inspect your channel, give you the complete partnership rules & promotional banner packs, and authorize your partner rate.
                </p>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => window.open(vendorUrl, '_blank')}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <Icons.MessageCircle size={16} className="text-amber-400" />
                <span>Contact Verified Vendor on Telegram</span>
                <Icons.ArrowUpRight size={14} className="text-zinc-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Existing Application Status if already submitted */}
        {hasApplication && (
          <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-emerald-500/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-black text-white uppercase tracking-tight">
                  Your Partnership Application is Active
                </h3>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase rounded-full border border-emerald-500/30">
                {user.partnershipApplication?.status || 'Pending Review'}
              </span>
            </div>

            <div className="bg-black/60 rounded-2xl p-4 border border-zinc-800/80 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-400">Channel Name:</span>
                <span className="font-bold text-white">{user.partnershipApplication?.channelName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-400">Platform:</span>
                <span className="font-bold text-amber-400 uppercase font-mono">{user.partnershipApplication?.platform}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-400">Audience:</span>
                <span className="font-bold text-zinc-200">{user.partnershipApplication?.audienceSize || 'Active'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Channel Link:</span>
                <a
                  href={user.partnershipApplication?.channelLink}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-400 hover:underline max-w-[180px] truncate"
                >
                  {user.partnershipApplication?.channelLink}
                </a>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-200 leading-relaxed flex items-start space-x-2">
              <Icons.Info size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                Please message our verified vendor now to submit your channel link for approval and receive your partner rulebook & creative banners.
              </span>
            </div>

            <button
              onClick={() => window.open(vendorUrl, '_blank')}
              className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Icons.Support size={16} />
              <span>Finalize Onboarding with Vendor</span>
            </button>
          </div>
        )}

        {/* Application Form */}
        <div className="rounded-3xl bg-zinc-950 border border-zinc-800/90 p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Icons.FileText size={16} className="text-amber-400" />
              {hasApplication ? 'Update Channel Application' : 'Apply for Partnership'}
            </h3>
            <p className="text-xs text-zinc-400">
              Provide the details of the promotional channel you created to promote Chix9ja.
            </p>
          </div>

          {formError && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-2xl text-xs text-red-300 flex items-start space-x-2">
              <Icons.AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Platform selection */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                Promotion Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'telegram', label: 'Telegram', icon: Icons.Send },
                  { id: 'whatsapp', label: 'WhatsApp', icon: Icons.MessageCircle },
                  { id: 'other', label: 'Social Media', icon: Icons.Share2 },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPlatform(item.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      platform === item.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <item.icon size={14} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Channel Name */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1">
                Channel / Group Name *
              </label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g. Chix9ja Earners Club, Wealth Builders Hub"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                required
              />
            </div>

            {/* Channel Link */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1">
                Channel Link (URL) *
              </label>
              <input
                type="text"
                value={channelLink}
                onChange={(e) => setChannelLink(e.target.value)}
                placeholder="e.g. https://t.me/your_channel or https://chat.whatsapp.com/..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                required
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Must be an active, accessible link where our vendor can verify your promotion activity.
              </p>
            </div>

            {/* Estimated audience size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1">
                  Audience Size
                </label>
                <input
                  type="text"
                  value={audienceSize}
                  onChange={(e) => setAudienceSize(e.target.value)}
                  placeholder="e.g. 50+ members"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1">
                  Telegram Username
                </label>
                <input
                  type="text"
                  value={contactHandle}
                  onChange={(e) => setContactHandle(e.target.value)}
                  placeholder="@your_telegram_id"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1">
                Promotion Strategy (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Briefly describe how you plan to promote Chix9ja (daily posts, proof videos, etc.)"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg ${
                isSubscribed
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black shadow-[0_0_25px_rgba(245,158,11,0.35)] active:scale-95'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
              }`}
            >
              {submitting ? (
                <>
                  <Icons.RefreshCw size={16} className="animate-spin text-black" />
                  <span>Submitting Channel Details...</span>
                </>
              ) : (
                <>
                  <Icons.CheckCircle size={16} />
                  <span>{hasApplication ? 'Update Channel Details' : 'Submit Channel for Partnership'}</span>
                </>
              )}
            </button>

            {!isSubscribed && (
              <p className="text-center text-[11px] text-amber-400/90 font-medium">
                Note: An active subscription is strictly required before your application can be approved.
              </p>
            )}
          </form>
        </div>

        {/* Partnership Rules Card */}
        <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800/80 p-5 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Icons.FileText size={14} className="text-amber-400" />
            Partnership Code & Guidelines
          </h3>

          <div className="space-y-2.5 text-xs text-zinc-400 leading-relaxed">
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-mono text-[10px] flex items-center justify-center flex-shrink-0 font-bold">1</span>
              <p><strong className="text-zinc-200">Continuous Promotion:</strong> Post verified Chix9ja banners, withdrawal receipts, and announcements at least once every 48 hours in your channel.</p>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-mono text-[10px] flex items-center justify-center flex-shrink-0 font-bold">2</span>
              <p><strong className="text-zinc-200">Authentic Content:</strong> Only use official creative packs provided by your assigned vendor. Misleading claims are strictly prohibited.</p>
            </div>
            <div className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-mono text-[10px] flex items-center justify-center flex-shrink-0 font-bold">3</span>
              <p><strong className="text-zinc-200">Vendor Verification:</strong> Any change in channel link or ownership must be reported directly to your verified vendor for re-authorization.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-amber-500/40 rounded-3xl p-6 w-full max-w-sm text-center space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Icons.CheckCircle size={32} />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-0.5 bg-amber-500/20 text-amber-300 font-black text-[10px] rounded-full uppercase tracking-wider border border-amber-500/30">
                APPLICATION SUBMITTED
              </span>
              <h3 className="text-lg font-black text-white tracking-tight">
                Channel Registered Successfully
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Your promotional channel has been recorded. Now, connect with an official verified vendor on Telegram to review your channel and receive the official partnership rules.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  window.open(vendorUrl, '_blank');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black font-black rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
              >
                <Icons.MessageCircle size={16} />
                <span>Contact Vendor for Partnership Rules</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold rounded-xl text-xs transition-all border border-zinc-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partnership;
