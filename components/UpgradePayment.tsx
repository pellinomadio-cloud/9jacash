import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { User } from '../types';
import { syncUserFromLocalToFirestore, useBankDetails, recordPaymentProof } from '../firebase';
import { compressReceiptImage } from '../imageCompressor';
import { motion, AnimatePresence } from 'motion/react';
import { Vip2CountdownTimer } from './UpgradeProposal';
import { ArrowLeft, ShieldCheck, Copy, Check, AlertTriangle, Upload, CheckCircle, RefreshCw, Star, Ban } from 'lucide-react';

interface UpgradePaymentProps {
  userEmail: string;
  selectedVipTier?: 'vip1' | 'vip2' | 'vip3';
  user?: User;
  onPaymentComplete: () => void;
  onUpdateUser?: (u: User) => void;
  onBack?: () => void;
}

const VIP_TIER_DETAILS = {
  vip1: {
    name: 'VIP 1 — Instant Cashout',
    price: '₦20,000',
    amount: 20000,
    badge: '⚡ INSTANT CASHOUT',
    timeline: 'Instant (0 Days)',
    desc: 'Immediately removes withdrawal from pending and credits account.',
  },
  vip2: {
    name: 'VIP 2 — Express Cashout',
    price: '₦15,000',
    amount: 15000,
    badge: '⏱️ 2 WORKING DAYS',
    timeline: '2 Working Days (3-Day Countdown)',
    desc: 'Withdrawal cleared from pending after 2 working days. 3-day live countdown active on VIP page.',
  },
  vip3: {
    name: 'VIP 3 — Standard VIP Cashout',
    price: '₦9,850',
    amount: 9850,
    badge: '🗓️ 7 WORKING DAYS',
    timeline: '7 Working Days',
    desc: 'Standard cashout processing tier completed within 7 working days.',
  },
};

const UpgradePayment: React.FC<UpgradePaymentProps> = ({
  userEmail,
  selectedVipTier = 'vip1',
  user,
  onPaymentComplete,
  onUpdateUser,
  onBack,
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'failed' | 'success'>('idle');
  const [isFetching, setIsFetching] = useState(true);
  const [showWarning, setShowWarning] = useState(true);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [showOpayWarning, setShowOpayWarning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { bankDetails } = useBankDetails();

  const currentTier: 'vip1' | 'vip2' | 'vip3' = (selectedVipTier === 'vip2' || selectedVipTier === 'vip3') ? selectedVipTier : 'vip1';
  const tier = VIP_TIER_DETAILS[currentTier];

  const handleCopy = () => {
    navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowOpayWarning(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFetching(false);
    }, 2000);

    const warningInterval = setInterval(() => {
      setShowWarning(prev => !prev);
      setTimeout(() => setShowWarning(true), 500);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(warningInterval);
    };
  }, []);

  const handleVerify = async () => {
    const existingUsersStr = localStorage.getItem('chix9ja_users');
    const existingUsers = existingUsersStr ? JSON.parse(existingUsersStr) : {};
    const currentUser: User = existingUsers[userEmail.toLowerCase()];

    if (currentUser && currentUser.pendingPaymentProof) {
      alert("You already have a pending payment proof awaiting administrator verification. You cannot upload another receipt until it is approved or declined.");
      return;
    }

    const oneHour = 60 * 60 * 1000;
    if (currentUser && currentUser.lastUploadTimestamp && (Date.now() - currentUser.lastUploadTimestamp < oneHour)) {
      const remainingMinutes = Math.ceil((oneHour - (Date.now() - currentUser.lastUploadTimestamp)) / (60 * 1000));
      alert(`You can only upload a receipt once every hour. Please wait ${remainingMinutes} minutes before attempting another upload.`);
      return;
    }

    if (currentUser && !currentUser.isSubscribed) {
      alert("Only subscribed accounts can upgrade to VIP. Please subscribe first.");
      return;
    }

    if (!proofFile) {
      alert("Please upload payment proof first.");
      return;
    }
    setStatus('loading');

    try {
      const base64Data = await compressReceiptImage(proofFile);

      setTimeout(() => {
        const freshUsersStr = localStorage.getItem('chix9ja_users');
        const freshUsers = freshUsersStr ? JSON.parse(freshUsersStr) : {};
        const freshUser: User = freshUsers[userEmail.toLowerCase()];
        
        const canUseVMode = freshUser && freshUser.isVMode && !freshUser.vModeVipUsed;
        
        if (canUseVMode) {
          // VMode instant activation
          freshUser.isVIP = true;
          freshUser.vipTier = currentTier;
          freshUser.vipActivationTimestamp = Date.now();
          freshUser.vipBalance = 1000000;
          freshUser.vModeVipUsed = true;
          
          if (freshUser.vModeSubscriptionUsed) {
            freshUser.isVMode = false;
          }
          
          freshUser.pendingActivation = null;
          freshUser.pendingPaymentProof = undefined;
          freshUser.pendingPaymentAmount = undefined;
          freshUser.pendingPaymentDate = undefined;
          
          if (freshUser.transactions) {
            freshUser.transactions = freshUser.transactions.map(t => {
              if (t.type === 'debit' && (t.status === 'pending' || t.status === 'awaiting_cbn_tax')) {
                return { ...t, status: 'awaiting_cbn_tax' };
              }
              return t;
            });
          }

          freshUser.showVipWithdrawalNotice = true;
          freshUser.persistentVipNotice = true;

          freshUsers[userEmail.toLowerCase()] = freshUser;
          localStorage.setItem('chix9ja_users', JSON.stringify(freshUsers));
          
          syncUserFromLocalToFirestore(userEmail, freshUser).then(() => {
            if (onUpdateUser) {
              onUpdateUser(freshUser);
            }
            setStatus('success');
            setShowSuccessModal(true);
          }).catch((e) => {
            console.error("Firestore sync error", e);
            setStatus('success');
            setShowSuccessModal(true);
          });
        } else {
          if (freshUser) {
            recordPaymentProof({
              userEmail: userEmail,
              userName: freshUser.name,
              amount: tier.amount,
              type: currentTier,
              paymentProof: base64Data,
              extraUserFields: {
                vipTier: currentTier,
              }
            }).then((updatedUser) => {
              if (onUpdateUser) {
                onUpdateUser(updatedUser);
              }
              setStatus('success');
              setShowSuccessModal(true);
            }).catch((e) => {
              console.error("Firestore sync error", e);
              setStatus('success');
              setShowSuccessModal(true);
            });
          } else {
            setStatus('failed');
          }
        }
      }, 1500);
    } catch (e) {
      console.error("Error reading proof file", e);
      setStatus('failed');
      alert("Error reading payment proof. Please try uploading again.");
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 space-y-4 text-white">
        <RefreshCw size={36} className="text-amber-400 animate-spin" />
        <p className="text-amber-400 font-black uppercase tracking-wider text-xs animate-pulse">
          Fetching Management Bank Account Details...
        </p>
      </div>
    );
  }

  const existingUsersTemp = JSON.parse(localStorage.getItem('chix9ja_users') || '{}');
  const currentUserTemp: User = existingUsersTemp[userEmail.toLowerCase()] || user;

  if (currentUserTemp && !currentUserTemp.isSubscribed) {
    return (
      <div className="min-h-screen bg-black text-white font-sans p-4 sm:p-6 pb-24">
        <div className="max-w-md mx-auto space-y-5 animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400 shadow-md">
              <Ban size={36} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">
                Subscription Required
              </h2>
              <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
                <p className="text-zinc-300 font-bold text-xs leading-relaxed">
                  Only subscribed accounts can upgrade to VIP. Please activate a subscription plan first.
                </p>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-extrabold rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-wider text-xs"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isVip2Active = selectedVipTier === 'vip2' || currentUserTemp?.vipTier === 'vip2' || currentUserTemp?.pendingActivation === 'vip2';

  return (
    <div className="min-h-screen bg-black text-white font-sans p-4 sm:p-6 pb-24">
      <div className="max-w-md mx-auto space-y-5 animate-in fade-in duration-300">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg">
          <button
            type="button"
            onClick={onBack || (() => window.history.back())}
            className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-200 transition-all active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black text-white uppercase tracking-tight">
              Confirm VIP Status
            </h1>
            <p className="text-[10px] font-bold text-amber-400 tracking-wider uppercase font-mono">
              Chix9ja Official Payment Node
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck size={20} />
          </div>
        </div>

        {/* Selected Tier Summary Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 rounded-3xl p-5 text-black shadow-lg shadow-amber-300/20 border border-amber-300/40 flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 bg-black text-amber-400 rounded-full text-[9px] font-black uppercase tracking-widest inline-block mb-1">
              {tier.badge}
            </span>
            <h3 className="text-xl font-black text-black tracking-tight uppercase">
              {tier.name}
            </h3>
            <p className="text-xs text-amber-950 font-bold mt-0.5">
              Timeline: {tier.timeline}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-black tracking-tight block">
              {tier.price}
            </span>
            <span className="text-[10px] font-extrabold uppercase text-black/80">
              Selected Fee
            </span>
          </div>
        </div>

        {/* Render 3-Day Countdown Timer if VIP 2 */}
        {isVip2Active && (
          <Vip2CountdownTimer timestamp={currentUserTemp?.vipActivationTimestamp || currentUserTemp?.lastUploadTimestamp} />
        )}

        {/* Bank Warning Banner */}
        <div className={`bg-red-600 text-white p-3.5 rounded-2xl text-center font-black text-xs uppercase tracking-tight transition-all duration-500 shadow-md ${showWarning ? 'opacity-100 scale-100' : 'opacity-80 scale-95'}`}>
          ⚠️ DO NOT USE OPAY OR PALMPAY TO PAY FOR VIP ACTIVATION. ONLY BANKS LIKE GTBANK, MONIEPOINT, ZENITH, ETC. ARE ALLOWED.
        </div>

        {/* Step 1: Account Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
          <p className="text-xs font-black uppercase tracking-wider text-zinc-200 text-center flex items-center justify-center gap-1.5">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            Step 1: Transfer Exact Amount (₦{tier.amount.toLocaleString()})
          </p>
          
          <div className="bg-zinc-950/80 rounded-2xl p-4 border border-zinc-800 space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase">Account Number</span>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-white tracking-wider font-mono">
                  {bankDetails.accountNumber || '---------'}
                </span>
                <button 
                  onClick={handleCopy}
                  disabled={!bankDetails.accountNumber}
                  className={`p-2 rounded-xl border transition-all ${copied ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-zinc-800 disabled:opacity-40 text-zinc-200 border-zinc-700 hover:bg-zinc-700'}`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase">Bank Name</span>
              <span className="text-base font-black text-white uppercase">
                {bankDetails.bankName || 'Loading...'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-400 uppercase">Account Name</span>
              <span className="text-sm font-black text-white uppercase">
                {bankDetails.accountName || 'Loading...'}
              </span>
            </div>
          </div>
        </div>

        {/* Step 2: Upload Payment Proof */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
          <p className="text-xs font-black uppercase tracking-wider text-zinc-200 text-center flex items-center justify-center gap-1.5">
            <Upload size={14} className="text-amber-400" />
            Step 2: Upload Payment Receipt
          </p>
          
          <div className="relative">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              className="sr-only" 
              id="vip-proof-upload"
            />
            <label 
              htmlFor="vip-proof-upload"
              className={`w-full py-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${
                proofFile 
                  ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300' 
                  : 'border-zinc-700 bg-zinc-950/60 hover:border-amber-500 text-zinc-400'
              }`}
            >
              {proofFile ? (
                <>
                  <CheckCircle size={36} className="text-emerald-400" />
                  <span className="text-xs font-black text-emerald-300 uppercase tracking-wider text-center px-4">
                    Receipt Selected: {proofFile.name}
                  </span>
                </>
              ) : (
                <>
                  <Upload size={36} className="text-amber-400" />
                  <span className="text-xs font-black text-zinc-300 uppercase tracking-wider">
                    Click to upload receipt photo
                  </span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Step 3: Verification Button */}
        <div className="space-y-3">
          <button 
            onClick={handleVerify}
            disabled={status === 'loading'}
            className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 disabled:opacity-60 disabled:cursor-not-allowed text-black font-extrabold rounded-2xl shadow-xl shadow-amber-300/60 transition-all active:scale-95 uppercase tracking-wider text-xs flex items-center justify-center space-x-2"
          >
            {status === 'loading' ? (
              <>
                <RefreshCw size={18} className="animate-spin text-black" />
                <span>Submitting Verification...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Verify {tier.name} Payment</span>
              </>
            )}
          </button>
        </div>

        {/* OPay / PalmPay Warning Overlay */}
        <AnimatePresence>
          {showOpayWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOpayWarning(false)}
              className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.92, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-3xl p-6 border border-red-500/50 text-center space-y-4 bg-zinc-900 shadow-2xl relative overflow-hidden"
              >
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 animate-bounce">
                  <AlertTriangle size={36} />
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 font-black text-[10px] rounded-full uppercase tracking-wider border border-red-500/30">
                    CRITICAL WARNING
                  </span>
                  <h3 className="text-base font-black text-white uppercase tracking-tight">
                    Do Not Use OPay or PalmPay
                  </h3>
                </div>

                <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                  Payments made through OPay or PalmPay accounts are NOT supported by our automatic bank synchronization. Please use Zenith, GTBank, Moniepoint, Access, UBA, etc.
                </p>

                <button
                  type="button"
                  onClick={() => setShowOpayWarning(false)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-extrabold rounded-2xl shadow-lg transition-all text-xs uppercase"
                >
                  I Understand, Proceed
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-sm rounded-3xl p-6 border border-emerald-500/50 text-center space-y-5 bg-zinc-900 shadow-2xl relative overflow-hidden"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle size={38} />
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 font-black text-[10px] rounded-full uppercase tracking-wider border border-amber-500/30">
                    PENDING ADMIN VERIFICATION
                  </span>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    {tier.name} Proof Submitted
                  </h3>
                </div>

                <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 text-left space-y-2">
                  <p className="text-xs text-white font-bold leading-relaxed">
                    Your payment receipt for <span className="text-amber-400 underline">{tier.name} ({tier.price})</span> has been submitted to admin for verification.
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Please allow a short moment for administrative review. Once approved, your VIP status and withdrawal processing will be updated on your dashboard.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuccessModal(false);
                      onPaymentComplete();
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default UpgradePayment;
