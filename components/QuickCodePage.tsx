import React, { useState } from 'react';
import { Icons } from './Icons';
import { User } from '../types';
import { useBankDetails, recordPaymentProof } from '../firebase';
import { compressReceiptImage } from '../imageCompressor';
import { motion, AnimatePresence } from 'motion/react';

interface QuickCodePageProps {
  user: User;
  onBack: () => void;
  onUpdateUser?: (updatedUser: User) => void;
  onGoToWithdraw?: () => void;
}

export interface QuickCodePlan {
  id: string;
  name: string;
  price: number;
  withdrawals: number; // 999999 for unlimited
  withdrawalsLabel: string;
  badge: string;
  tag: string;
  isSpecial?: boolean;
  desc: string;
}

export const QUICK_CODE_PLANS: QuickCodePlan[] = [
  {
    id: 'plan_7500',
    name: 'Starter Quick Code',
    price: 7500,
    withdrawals: 1,
    withdrawalsLabel: 'Valid for 1 withdrawal',
    badge: 'Single Payout',
    tag: 'STARTER',
    desc: 'Instant single withdrawal clearance pass for your bank payout'
  },
  {
    id: 'plan_10250',
    name: 'Standard Quick Code',
    price: 10250,
    withdrawals: 3,
    withdrawalsLabel: 'Valid for 3 withdrawals',
    badge: 'Popular',
    tag: 'STANDARD',
    desc: '3 automated consecutive withdrawals without delay'
  },
  {
    id: 'plan_19000',
    name: 'Pro Active Quick Code',
    price: 19000,
    withdrawals: 10,
    withdrawalsLabel: 'Valid for 10 active withdrawals',
    badge: 'Best Value',
    tag: 'PRO ACTIVE',
    desc: '10 active withdrawals with priority automated clearance'
  },
  {
    id: 'plan_30000',
    name: 'Unlimited Quick Code',
    price: 30000,
    withdrawals: 999999,
    withdrawalsLabel: 'Unlimited withdrawals',
    badge: 'Lifetime Pass',
    tag: 'UNLIMITED VIP',
    isSpecial: true,
    desc: 'Unlimited lifetime direct payouts to any Nigerian bank'
  }
];

export const QuickCodePage: React.FC<QuickCodePageProps> = ({
  user,
  onBack,
  onUpdateUser,
  onGoToWithdraw
}) => {
  const { bankDetails } = useBankDetails();
  
  // Steps: 'selection' -> 'loading' -> 'payment' -> 'upload' -> 'completed'
  const [step, setStep] = useState<'selection' | 'loading' | 'payment' | 'upload' | 'completed'>('selection');
  const [selectedPlan, setSelectedPlan] = useState<QuickCodePlan | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');

  const handleSelectPlan = (plan: QuickCodePlan) => {
    setSelectedPlan(plan);
    setStep('loading');
    
    // 3-second loader before showing company payment account
    setTimeout(() => {
      setStep('payment');
    }, 3000);
  };

  const handleCopyAccount = () => {
    if (bankDetails.accountNumber) {
      navigator.clipboard.writeText(bankDetails.accountNumber);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async () => {
    if (!proofFile || !selectedPlan) {
      alert("Please select a clear screenshot of your transfer payment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const base64Data = await compressReceiptImage(proofFile);
      
      // Generate realistic Quick Code for the user
      const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const numStr = Math.floor(1000 + Math.random() * 9000);
      const codeGenerated = `QC-${selectedPlan.price}-${randStr}${numStr}`;
      setGeneratedCode(codeGenerated);

      // Save user state with newly purchased Quick Code
      const currentPurchased = user.purchasedQuickCodes || [];
      const newEntry = {
        code: codeGenerated,
        planAmount: selectedPlan.price,
        withdrawalsAllowed: selectedPlan.withdrawals,
        withdrawalsRemaining: selectedPlan.withdrawals,
        purchasedAt: new Date().toISOString()
      };

      const updatedUser: User = {
        ...user,
        activeQuickCode: codeGenerated,
        quickCodeRemainingWithdrawals: selectedPlan.withdrawals,
        purchasedQuickCodes: [newEntry, ...currentPurchased],
        pendingActivation: 'quick_code',
        pendingPaymentAmount: selectedPlan.price,
        pendingPaymentDate: new Date().toISOString(),
        pendingPaymentProof: base64Data
      };

      // Record in system storage / Firestore
      await recordPaymentProof({
        userEmail: user.email,
        userName: user.name,
        amount: selectedPlan.price,
        type: 'quick_code',
        paymentProof: base64Data,
        extraUserFields: {
          activeQuickCode: codeGenerated,
          quickCodeRemainingWithdrawals: selectedPlan.withdrawals,
          purchasedQuickCodes: [newEntry, ...currentPurchased]
        }
      });

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      setIsSubmitting(false);
      setStep('completed');
    } catch (err) {
      console.error("Error submitting quick code proof:", err);
      setIsSubmitting(false);
      alert("Could not process receipt. Please try uploading again.");
    }
  };

  // 1. STEP: SELECTION (Directly show plans to select as requested)
  if (step === 'selection') {
    return (
      <div className="min-h-screen bg-[#f4f5f8] text-slate-900 font-sans pb-28">
        {/* Luxury Black & Gold Header */}
        <div className="bg-gradient-to-b from-black via-[#0d0f14] to-[#12151c] text-white pt-5 pb-9 px-4 rounded-b-[2.2rem] border-b border-amber-500/30 shadow-md relative overflow-hidden">
          <div className="max-w-md mx-auto flex items-center justify-between relative z-10">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-amber-400/30 flex items-center justify-center text-amber-400 transition-all active:scale-95 cursor-pointer"
            >
              <Icons.ArrowLeft size={20} />
            </button>
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-0.5">
                <Icons.Zap size={12} className="text-amber-400 animate-pulse" />
                <span>Quick Code Terminal</span>
              </div>
              <h1 className="text-base font-black uppercase tracking-wide text-white">
                Select Quick Code Plan
              </h1>
            </div>
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
          {/* Active Code Status if user already has one */}
          {user.activeQuickCode && (
            <div className="p-3.5 bg-zinc-950 border border-amber-500/40 rounded-2xl flex items-center justify-between text-xs text-white shadow-md">
              <div>
                <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Active Code on Record</p>
                <p className="font-mono font-black text-amber-400 text-sm tracking-wider">{user.activeQuickCode}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Remaining</p>
                <p className="font-black text-amber-300 text-xs">
                  {user.quickCodeRemainingWithdrawals && user.quickCodeRemainingWithdrawals > 5000 
                    ? 'UNLIMITED' 
                    : `${user.quickCodeRemainingWithdrawals || 0} left`}
                </p>
              </div>
            </div>
          )}

          <div className="text-center pb-1">
            <p className="text-xs text-slate-500 font-medium">
              Choose your clearance tier below to generate your official withdrawal code:
            </p>
          </div>

          {/* 4 Cards (Gold, White, Black, Grey) */}
          <div className="space-y-3.5">
            {QUICK_CODE_PLANS.map((plan) => {
              const isUnlimited = plan.isSpecial;

              return (
                <motion.button
                  key={plan.id}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full text-left p-5 rounded-3xl transition-all shadow-md relative overflow-hidden cursor-pointer group ${
                    isUnlimited
                      ? 'bg-gradient-to-br from-zinc-950 via-black to-zinc-900 text-white border-2 border-amber-400 shadow-xl shadow-amber-500/15'
                      : 'bg-white text-slate-900 border border-slate-200/90 hover:border-amber-400 hover:shadow-lg'
                  }`}
                >
                  {isUnlimited && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-yellow-500 text-black text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
                      ★ TOP RECOMMENDED
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                          isUnlimited 
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {plan.badge}
                        </span>
                        <span className={`text-[10px] font-extrabold font-mono ${
                          isUnlimited ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {plan.tag}
                        </span>
                      </div>
                      <h3 className={`text-base font-black tracking-tight ${
                        isUnlimited ? 'text-white' : 'text-slate-900 group-hover:text-amber-700'
                      } transition-colors`}>
                        {plan.name}
                      </h3>
                    </div>

                    <div className="text-right">
                      <p className={`text-xl font-black font-mono tracking-tight ${
                        isUnlimited ? 'text-amber-400' : 'text-amber-600 group-hover:text-amber-700'
                      }`}>
                        ₦{plan.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className={`mt-3.5 pt-3 border-t flex items-center justify-between ${
                    isUnlimited ? 'border-zinc-800' : 'border-slate-100'
                  }`}>
                    <div className={`flex items-center space-x-2 text-xs font-bold ${
                      isUnlimited ? 'text-amber-300' : 'text-amber-700'
                    }`}>
                      <Icons.CheckCircle size={15} className={isUnlimited ? 'text-amber-400' : 'text-amber-600'} />
                      <span>{plan.withdrawalsLabel}</span>
                    </div>
                    <div className={`flex items-center space-x-1 text-xs font-bold transition-colors ${
                      isUnlimited ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-amber-700'
                    }`}>
                      <span>Select</span>
                      <Icons.ChevronRight size={15} />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onBack}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. STEP: LOADING 3 SECONDS (Gold & Black Luxury Loader)
  if (step === 'loading' && selectedPlan) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icons.Zap size={32} className="text-amber-400 animate-pulse" />
          </div>
        </div>

        <div className="mt-8 space-y-2 max-w-sm relative z-10">
          <h2 className="text-xl font-black text-white tracking-tight">
            Connecting to Treasury Node...
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Generating direct company payment account for <strong className="text-amber-300">{selectedPlan.name}</strong> (₦{selectedPlan.price.toLocaleString()}).
          </p>
          <div className="pt-4 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-yellow-300 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  // 4. STEP: COMPANY ACCOUNT PAYMENT PAGE (Gold, White, Black & Grey)
  if (step === 'payment' && selectedPlan) {
    return (
      <div className="min-h-screen bg-[#f4f5f8] text-slate-900 font-sans pb-28">
        {/* Luxury Black & Gold Header */}
        <div className="bg-gradient-to-b from-black via-[#0d0f14] to-[#12151c] text-white pt-5 pb-9 px-4 rounded-b-[2.2rem] border-b border-amber-500/30 shadow-md relative overflow-hidden">
          <div className="max-w-md mx-auto flex items-center justify-between relative z-10">
            <button
              type="button"
              onClick={() => setStep('selection')}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-amber-400/30 flex items-center justify-center text-amber-400 transition-all active:scale-95 cursor-pointer"
            >
              <Icons.ArrowLeft size={20} />
            </button>
            <div className="text-center">
              <h1 className="text-base font-black uppercase tracking-wide text-white">
                Company Payment Account
              </h1>
              <p className="text-[11px] text-amber-300 font-medium">Make exact transfer to activate</p>
            </div>
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl shadow-amber-950/5 space-y-5 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

            {/* Selected Plan Summary Banner (Grey & Gold Card) */}
            <div className="flex items-center justify-between bg-[#f8f9fb] border border-slate-200 rounded-2xl p-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Selected Plan</span>
                <p className="text-sm font-black text-slate-900">{selectedPlan.name}</p>
                <p className="text-[11px] text-slate-500 font-medium">{selectedPlan.withdrawalsLabel}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Pay Exact Amount</span>
                <p className="text-2xl font-mono font-black text-amber-600">₦{selectedPlan.price.toLocaleString()}</p>
              </div>
            </div>

            {/* Strict Notice: Make Exact Pay */}
            <div className="bg-amber-50 border border-amber-300/80 p-3.5 rounded-2xl text-center space-y-1">
              <div className="inline-flex items-center space-x-1 text-amber-800 font-black text-xs uppercase tracking-wider">
                <Icons.AlertTriangle size={15} />
                <span>Exact Payment Required</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                Please make sure you transfer exactly <strong className="text-black font-mono">₦{selectedPlan.price.toLocaleString()}</strong> to the official company account below.
              </p>
            </div>

            {/* Official Company Bank Account Card (Luxury Black & Gold Card) */}
            <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-900 border-2 border-amber-400/50 text-white rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Company Bank Name</p>
                  <p className="text-base font-black text-white">{bankDetails.bankName || 'Access Bank'}</p>
                </div>
                <div className="p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-400">
                  <Icons.Building size={20} />
                </div>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Company Account Number</p>
                  <p className="text-2xl font-mono font-black tracking-wider text-amber-400">
                    {bankDetails.accountNumber || '---------'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-black rounded-xl font-black text-xs flex items-center space-x-1 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  <Icons.Copy size={13} />
                  <span>{copiedAccount ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Company Account Name</p>
                <p className="text-sm font-black text-slate-200 uppercase tracking-wide">
                  {bankDetails.accountName || '9jacash Global Operations'}
                </p>
              </div>
            </div>

            {/* Action to proceed to upload receipt (Gold Button) */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] uppercase tracking-wider text-xs cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>I Have Made Payment (Upload Receipt)</span>
                <Icons.ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => setStep('selection')}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all active:scale-[0.98] uppercase tracking-wider text-xs cursor-pointer border border-slate-200"
              >
                Choose Different Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 5. STEP: UPLOAD PAYMENT PROOF (Gold, White, Black & Grey)
  if (step === 'upload' && selectedPlan) {
    return (
      <div className="min-h-screen bg-[#f4f5f8] text-slate-900 font-sans pb-28">
        {/* Luxury Black & Gold Header */}
        <div className="bg-gradient-to-b from-black via-[#0d0f14] to-[#12151c] text-white pt-5 pb-9 px-4 rounded-b-[2.2rem] border-b border-amber-500/30 shadow-md relative overflow-hidden">
          <div className="max-w-md mx-auto flex items-center justify-between relative z-10">
            <button
              type="button"
              onClick={() => setStep('payment')}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-amber-400/30 flex items-center justify-center text-amber-400 transition-all active:scale-95 cursor-pointer"
            >
              <Icons.ArrowLeft size={20} />
            </button>
            <div className="text-center">
              <h1 className="text-base font-black uppercase tracking-wide text-white">
                Upload Payment Proof
              </h1>
              <p className="text-[11px] text-amber-300 font-medium">Verify your exact transfer</p>
            </div>
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl shadow-amber-950/5 space-y-5">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Final Step
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight pt-1">
                Attach Transfer Receipt
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Upload screenshot of your <strong className="text-black font-mono">₦{selectedPlan.price.toLocaleString()}</strong> transfer.
              </p>
            </div>

            {/* Dropzone (Grey & Gold border) */}
            <div className="border-2 border-dashed border-amber-300/80 rounded-3xl p-6 text-center bg-amber-50/20">
              {proofPreview ? (
                <div className="space-y-3">
                  <img
                    src={proofPreview}
                    alt="Receipt preview"
                    className="max-h-56 mx-auto rounded-2xl object-contain border border-slate-200 shadow-md"
                  />
                  <p className="text-xs font-bold text-slate-700 truncate">{proofFile?.name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setProofFile(null);
                      setProofPreview(null);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Change Receipt Photo
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-3 py-4">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-700 border border-amber-300 rounded-2xl flex items-center justify-center shadow-sm">
                    <Icons.Upload size={30} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-wide">Tap to Upload Receipt</p>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Supports PNG, JPG, or JPEG screenshots</p>
                  </div>
                </label>
              )}
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                disabled={!proofFile || isSubmitting}
                onClick={handleSubmitProof}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-wider text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  proofFile && !isSubmitting
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black shadow-lg shadow-amber-500/20 active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Icons.CheckCircle size={16} />
                    <span>Submit Payment & Generate Code</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('payment')}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all active:scale-[0.98] uppercase tracking-wider text-xs cursor-pointer border border-slate-200"
              >
                Back to Bank Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. STEP: COMPLETED / CODE ISSUED (Gold, White, Black & Grey)
  return (
    <div className="min-h-screen bg-[#f4f5f8] text-slate-900 font-sans pb-28">
      {/* Luxury Black & Gold Header */}
      <div className="bg-gradient-to-b from-black via-[#0d0f14] to-[#12151c] text-white pt-5 pb-9 px-4 rounded-b-[2.2rem] border-b border-amber-500/30 shadow-md relative overflow-hidden">
        <div className="max-w-md mx-auto flex items-center justify-between relative z-10">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-amber-400/30 flex items-center justify-center text-amber-400 transition-all active:scale-95 cursor-pointer"
          >
            <Icons.ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-base font-black uppercase tracking-wide text-white">
              Quick Code Generated
            </h1>
            <p className="text-[11px] text-amber-300 font-medium">Ready for withdrawal verification</p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl shadow-amber-950/5 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
            <Icons.CheckCircle size={36} />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Clearance Code Activated
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
              Payment Received!
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Your quick code has been assigned to your profile and is ready to authorize withdrawals.
            </p>
          </div>

          {/* Generated Code Display Box (Luxury Black & Gold Display) */}
          <div className="bg-zinc-950 border-2 border-amber-400 rounded-2xl p-5 space-y-2 relative overflow-hidden shadow-xl text-white">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
              Your Purchased Quick Code
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-amber-400 drop-shadow-md">
                {generatedCode || user.activeQuickCode || 'QC-ACTIVE-SECURE'}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode || user.activeQuickCode || '');
                  alert('Quick Code copied to clipboard!');
                }}
                className="p-2 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 rounded-xl transition-all cursor-pointer"
                title="Copy Quick Code"
              >
                <Icons.Copy size={16} />
              </button>
            </div>
            <p className="text-[11px] text-amber-300 font-bold">
              ✓ {selectedPlan?.withdrawalsLabel || 'Active for withdrawal'}
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {onGoToWithdraw ? (
              <button
                type="button"
                onClick={onGoToWithdraw}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 uppercase tracking-wider text-xs cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Proceed to Withdraw Page</span>
                <Icons.ArrowRight size={16} />
              </button>
            ) : null}

            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all active:scale-95 uppercase tracking-wider text-xs cursor-pointer border border-slate-200"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickCodePage;
