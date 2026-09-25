import React, { useState } from 'react';
import { Icons } from './Icons';
import { Wallet, Coins, Trash2, AlertCircle, RefreshCw, AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { User, Transaction } from '../types';
import { useBankDetails, db, sanitizeForFirestore, syncUserFromLocalToFirestore, recordPaymentProof, doc, setDoc, addDoc, collection } from '../firebase';
import { compressReceiptImage } from '../imageCompressor';

interface DepositPageProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onViewHistory?: () => void;
}

export const DepositPage: React.FC<DepositPageProps> = ({
  user,
  onBack,
  onUpdateUser,
  onViewHistory
}) => {
  const { bankDetails } = useBankDetails();
  const [depositAmount, setDepositAmount] = useState<string>('5000');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(!!user?.pendingDeposit && user.pendingDeposit.status === 'pending');
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const minDeposit = 5000;
  const numAmount = Number(depositAmount) || 0;
  const isAmountValid = numAmount >= minDeposit;

  // Preset deposit options
  const presetAmounts = [5000, 10000, 20000, 50000, 100000];

  const handleCopyAccount = () => {
    if (bankDetails.accountNumber) {
      navigator.clipboard.writeText(bankDetails.accountNumber);
      setCopiedAccount(true);
      setShowWarningModal(true);
      setTimeout(() => setCopiedAccount(false), 2500);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setErrorMessage('');
      try {
        const compressed = await compressReceiptImage(file);
        setProofImage(compressed);
      } catch (err) {
        console.error("Error compressing deposit receipt:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setProofImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAmountValid) {
      setErrorMessage(`Minimum deposit amount is ₦${minDeposit.toLocaleString()}`);
      return;
    }
    if (!proofImage) {
      setErrorMessage('Please upload proof of payment receipt before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const depositId = `dep_${Date.now()}`;
      const timestamp = Date.now();
      const isoDate = new Date().toISOString();

      // Guarantee the image is compressed before pushing to Firestore
      let finalProof = proofImage;
      try {
        finalProof = await compressReceiptImage(proofImage);
      } catch {}

      // 1. Create a pending transaction record in user's transactions history
      const newTransaction: Transaction = {
        id: depositId,
        type: 'credit',
        amount: numAmount,
        description: 'Chix9ja Account Deposit (Pending Approval)',
        date: isoDate,
        status: 'pending'
      };

      const updatedTransactions = [newTransaction, ...(user.transactions || [])];

      // 2. Persist to payment_proofs, deposits, and user profile
      const updatedUser = await recordPaymentProof({
        userEmail: user.email,
        userName: user.name,
        amount: numAmount,
        type: 'deposit',
        paymentProof: finalProof,
        depositId: depositId,
        extraUserFields: {
          transactions: updatedTransactions,
        },
      });

      onUpdateUser(updatedUser);
      setIsSuccess(true);
    } catch (error) {
      console.error("Deposit submission error:", error);
      setErrorMessage("An error occurred while submitting your deposit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-4 sm:p-6 pb-24">
      <div className="max-w-md mx-auto space-y-5 animate-in fade-in duration-300">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-200 transition-all active:scale-95"
          >
            <Icons.ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black text-white uppercase tracking-tight">
              Deposit Funds
            </h1>
            <p className="text-[10px] font-bold text-amber-400 tracking-wider uppercase font-mono">
              Chix9ja Account Transfer
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Icons.ShieldCheck size={20} />
          </div>
        </div>

        {/* Current Available Balance Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 rounded-2xl p-5 text-black shadow-lg shadow-amber-300/20 border border-amber-300/40 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/20 rounded-full blur-xl pointer-events-none"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-amber-950/80">
                Available Chix9ja Balance
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight mt-1">
                ₦{(user.balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="bg-black/10 backdrop-blur-sm p-3 rounded-2xl border border-black/10">
              <Wallet size={28} className="text-black" />
            </div>
          </div>
        </div>

        {/* Successful Pending State Card */}
        {isSuccess ? (
          <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 shadow-xl space-y-5 text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400 shadow-inner">
              <Icons.Clock size={32} className="animate-spin-slow" />
            </div>

            <div>
              <span className="inline-block bg-amber-500/20 text-amber-300 text-[10px] font-black px-3 py-1 rounded-full border border-amber-500/40 uppercase tracking-wider mb-2">
                ⏳ Deposit Pending Approval
              </span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                Deposit Under Review
              </h3>
              <p className="text-xs text-zinc-300 font-medium leading-relaxed mt-2">
                Your deposit request of{' '}
                <span className="font-extrabold text-amber-400 text-sm">
                  ₦{(user.pendingDeposit?.amount || numAmount).toLocaleString()}
                </span>{' '}
                has been submitted to the Chix9ja Treasury Admin Desk. Once approved, your account balance will be credited automatically!
              </p>
            </div>

            <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 text-left space-y-2 font-mono text-xs">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400 font-bold uppercase">Status:</span>
                <span className="text-amber-400 font-black uppercase">PENDING APPROVAL</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400 font-bold uppercase">Submitted Amount:</span>
                <span className="text-white font-black">₦{(user.pendingDeposit?.amount || numAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 font-bold uppercase">Account User:</span>
                <span className="text-white font-bold">{user.name}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={onBack}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-extrabold rounded-2xl shadow-lg shadow-amber-300/50 transition-all active:scale-95 uppercase tracking-wider text-xs"
              >
                Return To Dashboard
              </button>
              {onViewHistory && (
                <button
                  onClick={onViewHistory}
                  className="w-full py-3 bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold rounded-2xl hover:bg-zinc-700 transition-all text-xs uppercase"
                >
                  View Transaction Receipts
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Deposit Input & Transfer Form */
          <form onSubmit={handleSubmitDeposit} className="space-y-5">
            
            {/* Amount Selection Section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Coins size={16} className="text-amber-400" />
                  Deposit Amount
                </label>
                <span className="text-[10px] font-extrabold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30 uppercase">
                  Min Deposit: ₦5,000
                </span>
              </div>

              {/* Input Box */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-amber-400">
                  ₦
                </span>
                <input
                  type="number"
                  min="5000"
                  step="500"
                  value={depositAmount}
                  onChange={(e) => {
                    setDepositAmount(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="5000"
                  className="w-full pl-10 pr-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl text-xl font-black text-white outline-none focus:border-amber-500 focus:bg-zinc-900 transition-all"
                  required
                />
              </div>

              {/* Minimum Deposit Error Warning */}
              {!isAmountValid && numAmount > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold p-3 rounded-xl flex items-center space-x-2">
                  <Icons.AlertTriangle size={16} className="text-red-400 shrink-0" />
                  <span>Minimum deposit requirement is ₦5,000 Naira.</span>
                </div>
              )}

              {/* Quick Amount Selector Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Quick Amount Presets:
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setDepositAmount(amt.toString());
                        setErrorMessage('');
                      }}
                      className={`py-2 rounded-xl text-xs font-black transition-all border ${
                        numAmount === amt
                          ? 'bg-amber-400 text-black border-amber-300 shadow-sm'
                          : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      ₦{(amt / 1000)}k
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Official Company Bank Transfer Account Details */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
                    🏛️
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-white">
                      Company Payment Account
                    </h3>
                    <p className="text-[10px] font-semibold text-zinc-400">
                      Pay into official Chix9ja account below
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                  Verified
                </span>
              </div>

              {/* Bank Details Table */}
              <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400 font-bold uppercase">Bank Name:</span>
                  <span className="text-white font-black uppercase text-sm">
                    {bankDetails.bankName || 'Loading...'}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400 font-bold uppercase">Account No:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-400 font-black text-base tracking-wider">
                      {bankDetails.accountNumber || '---------'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      disabled={!bankDetails.accountNumber}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-black font-extrabold text-[10px] rounded-lg shadow-sm transition-all active:scale-95 flex items-center space-x-1"
                    >
                      <Icons.Copy size={12} />
                      <span>{copiedAccount ? 'COPIED!' : 'COPY'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-bold uppercase">Account Name:</span>
                  <span className="text-white font-bold uppercase text-right">
                    {bankDetails.accountName || 'Loading...'}
                  </span>
                </div>
              </div>

              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-[11px] text-amber-200 font-medium flex items-start space-x-2">
                <Icons.Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Please transfer exact deposit amount (<span className="font-extrabold text-amber-300">₦{numAmount > 0 ? numAmount.toLocaleString() : '5,000'}</span>) to the bank account above, then attach your receipt screenshot below.
                </p>
              </div>
            </div>

            {/* Payment Proof Receipt Upload Section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Icons.Upload size={16} className="text-amber-400" />
                Upload Payment Receipt Proof
              </label>

              {proofImage ? (
                <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <img
                      src={proofImage}
                      alt="Payment receipt proof"
                      className="w-14 h-14 object-cover rounded-xl border border-zinc-700 shadow-sm shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate">
                        {fileName || 'Payment_Receipt.jpg'}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1 border border-emerald-500/20">
                        ✓ Image Ready
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProofImage(null);
                      setFileName('');
                    }}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-zinc-700 hover:border-amber-400 bg-zinc-950/50 hover:bg-zinc-950 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Icons.Camera size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-zinc-200">
                      Tap to select or upload payment receipt
                    </p>
                    <p className="text-[10px] font-semibold text-zinc-400 mt-0.5">
                      Supports JPG, PNG, WEBP screenshots (Max 8MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </label>
              )}
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold p-3.5 rounded-2xl flex items-center space-x-2">
                <AlertCircle size={18} className="text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Deposit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isAmountValid || !proofImage}
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold rounded-2xl shadow-xl shadow-amber-300/60 transition-all active:scale-95 uppercase tracking-wider text-xs flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={18} className="animate-spin text-black" />
                  <span>Submitting Deposit...</span>
                </>
              ) : (
                <>
                  <Icons.CheckCircle size={18} className="text-black" />
                  <span>SUBMIT DEPOSIT FOR APPROVAL</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>

      {/* Warning Modal for OPay / PalmPay Transfers */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-center relative overflow-hidden">
            
            {/* Top Close Button */}
            <button
              onClick={() => setShowWarningModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-all"
            >
              <X size={18} />
            </button>

            {/* Warning Icon Badge */}
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-red-400 shadow-md">
              <ShieldAlert size={34} className="animate-bounce-short" />
            </div>

            {/* Header Title */}
            <div className="space-y-1">
              <span className="bg-red-500/20 text-red-300 text-[10px] font-black px-3 py-1 rounded-full border border-red-500/30 uppercase tracking-widest inline-block">
                ⚠️ CRITICAL PAYMENT NOTICE
              </span>
              <h3 className="text-lg font-black text-white uppercase tracking-tight pt-1">
                Do Not Pay With OPay or PalmPay
              </h3>
            </div>

            {/* Details Box */}
            <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-2xl text-left space-y-2 text-xs text-zinc-300">
              <p className="font-semibold leading-relaxed text-zinc-200">
                Account details copied successfully!
              </p>
              <p className="text-red-400 font-extrabold leading-relaxed">
                🚫 Please DO NOT send payment from OPay or PalmPay accounts.
              </p>
              <p className="text-zinc-400 font-medium leading-relaxed">
                Transfers originating from OPay or PalmPay cannot be verified by our automated treasury node.
              </p>
              <p className="text-emerald-400 font-bold leading-relaxed pt-1 border-t border-zinc-800">
                ✅ Please use traditional commercial banks (e.g. Moniepoint, GTBank, Zenith, Access, Kuda, First Bank, UBA, etc.)
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-extrabold rounded-2xl shadow-lg shadow-amber-300/50 transition-all active:scale-95 uppercase tracking-wider text-xs"
            >
              I UNDERSTAND & AGREE
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default DepositPage;
