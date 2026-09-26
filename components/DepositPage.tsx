import React, { useState } from 'react';
import { Icons } from './Icons';
import { Wallet, Coins, Trash2, AlertCircle, RefreshCw, AlertTriangle, ShieldAlert, X, ShieldCheck } from 'lucide-react';
import { User, Transaction } from '../types';
import { useBankDetails, recordPaymentProof } from '../firebase';
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
      const isoDate = new Date().toISOString();

      let finalProof = proofImage;
      try {
        finalProof = await compressReceiptImage(proofImage);
      } catch {}

      const newTransaction: Transaction = {
        id: depositId,
        type: 'credit',
        amount: numAmount,
        description: '9jacash Account Deposit (Pending Approval)',
        date: isoDate,
        status: 'pending'
      };

      const updatedTransactions = [newTransaction, ...(user.transactions || [])];

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
    <div className="min-h-screen bg-[#f4f7f6] text-slate-900 font-sans pb-28">
      {/* Top Header */}
      <div className="bg-[#013a24] text-white pt-4 pb-8 px-4 rounded-b-[2.2rem] shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer"
          >
            <Icons.ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-base font-extrabold uppercase tracking-wide">
              Fund Wallet
            </h1>
            <p className="text-[10px] text-emerald-200 font-semibold uppercase tracking-wider">
              9jacash Instant Top-up
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-5 space-y-4">
        {/* Available Balance Card matching 9jacash Design */}
        <div className="bg-gradient-to-r from-[#013a24] via-[#09573c] to-[#013a24] rounded-3xl p-5 text-white shadow-lg border border-emerald-800/40 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-200/90">
                Current Wallet Balance
              </p>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">
                ₦{(user.balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </h2>
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                Verified Account
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-emerald-200 border border-white/10">
              <Wallet size={26} />
            </div>
          </div>
        </div>

        {/* Successful Pending State Card */}
        {isSuccess ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md space-y-5 text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-sm">
              <Icons.Clock size={32} className="animate-spin-slow" />
            </div>

            <div>
              <span className="inline-block bg-amber-50 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider mb-2">
                ⏳ Deposit Pending Approval
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Deposit Under Review
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">
                Your deposit request of{' '}
                <span className="font-extrabold text-[#013a24] text-sm">
                  ₦{(user.pendingDeposit?.amount || numAmount).toLocaleString()}
                </span>{' '}
                has been submitted to the 9jacash Treasury Desk. Once approved, your account balance will be credited automatically!
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-bold uppercase">Status:</span>
                <span className="text-amber-600 font-black uppercase">PENDING APPROVAL</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-bold uppercase">Submitted Amount:</span>
                <span className="text-slate-900 font-black">₦{(user.pendingDeposit?.amount || numAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold uppercase">Account User:</span>
                <span className="text-slate-800 font-bold">{user.name}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={onBack}
                className="w-full py-3.5 bg-gradient-to-r from-[#013a24] via-[#09573c] to-[#013a24] hover:from-[#012f1d] hover:to-[#012718] text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-[0.98] uppercase tracking-wider text-xs cursor-pointer"
              >
                Return To Dashboard
              </button>
              {onViewHistory && (
                <button
                  onClick={onViewHistory}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all text-xs uppercase cursor-pointer"
                >
                  View Transaction Receipts
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Deposit Input & Transfer Form */
          <form onSubmit={handleSubmitDeposit} className="space-y-4">
            
            {/* Amount Selection Section */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Coins size={16} className="text-[#008751]" />
                  Deposit Amount
                </label>
                <span className="text-[10px] font-extrabold bg-emerald-50 text-[#008751] px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
                  Min Deposit: ₦5,000
                </span>
              </div>

              {/* Input Box */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400">
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
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-black text-slate-900 outline-none focus:border-[#013a24] focus:ring-2 focus:ring-[#013a24]/10 transition-all"
                  required
                />
              </div>

              {/* Minimum Deposit Error Warning */}
              {!isAmountValid && numAmount > 0 && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-xl flex items-center space-x-2">
                  <Icons.AlertTriangle size={16} className="text-rose-600 shrink-0" />
                  <span>Minimum deposit requirement is ₦5,000 Naira.</span>
                </div>
              )}

              {/* Quick Amount Selector Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
                      className={`py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                        numAmount === amt
                          ? 'bg-[#013a24] text-white border-[#013a24] shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      ₦{(amt / 1000)}k
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Official Company Bank Transfer Account Details */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#013a24] font-black text-lg">
                    🏛️
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-900">
                      Company Deposit Account
                    </h3>
                    <p className="text-[10px] font-medium text-slate-500">
                      Pay into official 9jacash account below
                    </p>
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-emerald-50 text-[#008751] px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                  Verified
                </span>
              </div>

              {/* Bank Details Table */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-bold uppercase">Bank Name:</span>
                  <span className="text-slate-900 font-black uppercase text-sm">
                    {bankDetails.bankName || 'Loading...'}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-bold uppercase">Account No:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#013a24] font-mono font-black text-base tracking-wider">
                      {bankDetails.accountNumber || '---------'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      disabled={!bankDetails.accountNumber}
                      className="px-2.5 py-1 bg-[#013a24] hover:bg-[#09573c] disabled:opacity-40 text-white font-extrabold text-[10px] rounded-lg shadow-sm transition-all active:scale-95 flex items-center space-x-1 cursor-pointer"
                    >
                      <Icons.Copy size={12} />
                      <span>{copiedAccount ? 'COPIED!' : 'COPY'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase">Account Name:</span>
                  <span className="text-slate-900 font-bold uppercase text-right">
                    {bankDetails.accountName || 'Loading...'}
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-950 font-medium flex items-start space-x-2">
                <Icons.Info size={16} className="text-[#008751] shrink-0 mt-0.5" />
                <p>
                  Please transfer exact deposit amount (<span className="font-extrabold text-[#013a24]">₦{numAmount > 0 ? numAmount.toLocaleString() : '5,000'}</span>) to the bank account above, then attach your receipt screenshot below.
                </p>
              </div>
            </div>

            {/* Payment Proof Receipt Upload Section */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Icons.Upload size={16} className="text-[#008751]" />
                Upload Payment Receipt Proof
              </label>

              {proofImage ? (
                <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <img
                      src={proofImage}
                      alt="Payment receipt proof"
                      className="w-14 h-14 object-cover rounded-xl border border-slate-300 shadow-sm shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {fileName || 'Payment_Receipt.jpg'}
                      </p>
                      <span className="text-[10px] font-bold text-[#008751] bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1 border border-emerald-200">
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
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-[#008751] bg-slate-50/50 hover:bg-emerald-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#008751]">
                    <Icons.Camera size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">
                      Tap to select or upload payment receipt
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
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
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3.5 rounded-2xl flex items-center space-x-2">
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Deposit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isAmountValid || !proofImage}
              className="w-full py-4 bg-gradient-to-r from-[#013a24] via-[#09573c] to-[#013a24] hover:from-[#012f1d] hover:to-[#012718] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-950/20 transition-all active:scale-[0.98] uppercase tracking-wider text-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={18} className="animate-spin text-white" />
                  <span>Submitting Deposit...</span>
                </>
              ) : (
                <>
                  <Icons.CheckCircle size={18} className="text-white" />
                  <span>SUBMIT DEPOSIT FOR APPROVAL</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>

      {/* Warning Modal for OPay / PalmPay Transfers */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-center relative overflow-hidden border border-gray-100">
            
            {/* Top Close Button */}
            <button
              onClick={() => setShowWarningModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Warning Icon Badge */}
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-600 shadow-sm">
              <ShieldAlert size={34} />
            </div>

            {/* Header Title */}
            <div className="space-y-1">
              <span className="bg-amber-50 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full border border-amber-200 uppercase tracking-widest inline-block">
                ⚠️ CRITICAL PAYMENT NOTICE
              </span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight pt-1">
                Do Not Pay With OPay or PalmPay
              </h3>
            </div>

            {/* Details Box */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-left space-y-2 text-xs text-slate-700">
              <p className="font-semibold leading-relaxed text-slate-900">
                Account details copied successfully!
              </p>
              <p className="text-rose-600 font-extrabold leading-relaxed">
                🚫 Please DO NOT send payment from OPay or PalmPay accounts.
              </p>
              <p className="text-slate-500 font-medium leading-relaxed">
                Transfers originating from OPay or PalmPay cannot be verified by our automated treasury node.
              </p>
              <p className="text-[#008751] font-bold leading-relaxed pt-1 border-t border-slate-200">
                ✅ Please use traditional commercial banks (e.g. Moniepoint, GTBank, Zenith, Access, Kuda, First Bank, UBA, etc.)
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-3.5 bg-gradient-to-r from-[#013a24] via-[#09573c] to-[#013a24] hover:from-[#012f1d] hover:to-[#012718] text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-[0.98] uppercase tracking-wider text-xs cursor-pointer"
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
