import React, { useState } from 'react';
import { Icons } from './Icons';
import { auth, db, doc, getDoc, collection, query, where, getDocs, createUserWithEmailAndPassword } from '../firebase';
import { validateEmailClient } from '../clientServices';

interface RegisterProps {
  onRegister: (name: string, email: string, referredBy?: string) => void;
  onSwitchToLogin: () => void;
  defaultReferralCode?: string;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin, defaultReferralCode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referredByInput, setReferredByInput] = useState(defaultReferralCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and max 4 digits
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPassword(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim().replace(/\s+/g, ' ');
    if (!trimmedName || trimmedName.length < 2) {
      setError('Please enter a valid name (at least 2 characters).');
      return;
    }

    if (password.length !== 4) {
      setError('Password/PIN must be exactly 4 digits.');
      return;
    }

    const emailKey = email.toLowerCase().trim();
    if (emailKey === referredByInput.toLowerCase().trim()) {
      setError('You cannot refer yourself.');
      return;
    }

    setIsLoading(true);

    const emailValidation = validateEmailClient(emailKey);
    if (!emailValidation.valid) {
      setError(emailValidation.reason || 'Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    const securePassword = `${password}_chix9ja_secure_salt`;

    // Check device registration limit (Max 5 accounts per device)
    let deviceAccounts: string[] = [];
    try {
      const stored = localStorage.getItem('9jacash_device_registered_accounts') || localStorage.getItem('chix9ja_device_registered_accounts');
      if (stored) {
        deviceAccounts = JSON.parse(stored);
      }
    } catch (e) {
      deviceAccounts = [];
    }

    if (!deviceAccounts.includes(emailKey) && deviceAccounts.length >= 5) {
      setError('Registration limit exceeded. You cannot create more than 5 9jacash accounts on this device.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Check if user already exists
      const docSnap = await getDoc(doc(db, 'users', emailKey));
      if (docSnap.exists()) {
        setError('An account with this email already exists.');
        setIsLoading(false);
        return;
      }

      // 2. Resolve referrer email (if provided)
      let resolvedReferrerEmail: string | undefined = undefined;
      if (referredByInput.trim()) {
        const cleanedRef = referredByInput.trim();
        const selfCodeHandle = emailKey.split('@')[0].toUpperCase();
        if (cleanedRef.toUpperCase() === selfCodeHandle || cleanedRef.toLowerCase() === emailKey) {
          setError('You cannot refer yourself.');
          setIsLoading(false);
          return;
        }

        if (cleanedRef.includes('@')) {
          const refEmailKey = cleanedRef.toLowerCase();
          const refSnap = await getDoc(doc(db, 'users', refEmailKey));
          if (refSnap.exists()) {
            resolvedReferrerEmail = refEmailKey;
          } else {
            setError('Referrer account email not found.');
            setIsLoading(false);
            return;
          }
        } else {
          const refCode = cleanedRef.toUpperCase();
          const q = query(collection(db, 'users'), where('referralCode', '==', refCode));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            resolvedReferrerEmail = querySnap.docs[0].id;
          } else {
            setError('Referral code not found.');
            setIsLoading(false);
            return;
          }
        }
      }

      // 3. Create User session
      await createUserWithEmailAndPassword(auth, emailKey, securePassword);

      // Update registered accounts list on this device
      if (!deviceAccounts.includes(emailKey)) {
        deviceAccounts.push(emailKey);
        localStorage.setItem('9jacash_device_registered_accounts', JSON.stringify(deviceAccounts));
        localStorage.setItem('chix9ja_device_registered_accounts', JSON.stringify(deviceAccounts));
      }

      // 4. Fire callback with resolved referrer
      onRegister(trimmedName, emailKey, resolvedReferrerEmail);
      setIsLoading(false);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/weak-password') {
        setError('PIN must be 4 digits.');
      } else {
        setError(err.message || 'Error creating account.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex flex-col justify-between relative overflow-x-hidden selection:bg-emerald-200">
      {/* Top Hero Section matching Dashboard */}
      <div className="bg-[#013a24] pt-8 pb-16 px-4 rounded-b-[2.5rem] shadow-md text-white relative overflow-hidden">
        {/* Decorative Gold Ribbon Curves */}
        <div className="absolute top-0 right-0 w-80 h-80 opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full text-amber-300" fill="currentColor">
            <path d="M45,-78.3C58.3,-71.1,69.1,-59.4,76.5,-45.8C83.9,-32.1,87.9,-16.1,86.6,-0.8C85.2,14.6,78.5,29.1,69.9,41.9C61.4,54.7,51,65.7,38.1,72.3C25.3,78.9,10,81,-5.1,79.8C-20.2,78.7,-35.1,74.2,-48.6,66.4C-62.1,58.5,-74.2,47.2,-81.4,33.1C-88.6,18.9,-91,1.9,-86.6,-13.3C-82.2,-28.5,-71.1,-41.9,-58.5,-49.8C-45.9,-57.8,-31.8,-60.2,-18.2,-67.2C-4.6,-74.2,8.5,-85.7,22.7,-86.3C36.9,-87,41.7,-76.8,45,-78.3Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="max-w-md mx-auto flex flex-col items-center text-center space-y-3 relative z-10">
          {/* Gold Crest Emblem matching Dashboard Header */}
          <div className="w-16 h-16 rounded-full p-[3px] bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 shadow-xl flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full bg-[#013a24] flex items-center justify-center relative overflow-hidden border border-amber-300/40">
              <svg viewBox="0 0 100 100" className="w-9 h-9" fill="none">
                <defs>
                  <linearGradient id="regGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                <path 
                  d="M50 14 C30 14 15 29 15 49 C15 69 30 84 50 84 C66 84 79 73 83 58 L66 58 C63 67 57 71 50 71 C38 71 28 61 28 49 C28 37 38 27 50 27 C59 27 66 32 70 40 L84 31 C77 20 65 14 50 14 Z" 
                  fill="url(#regGoldGrad)" 
                />
                <path 
                  d="M48 42 L78 42 L65 55 L38 55 Z" 
                  fill="#ffffff" 
                  opacity="0.9"
                />
                <circle cx="58" cy="48" r="4" fill="url(#regGoldGrad)" />
              </svg>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center space-x-1">
              <span>9jacash</span>
            </h1>
            <p className="text-xs text-emerald-200/90 font-medium">
              Smart, Instant Financial Solutions & Daily Rewards
            </p>
          </div>
        </div>
      </div>

      {/* Main Registration Form Card - Overlapping Hero Section */}
      <div className="max-w-md w-full mx-auto px-4 -mt-10 relative z-20 pb-8 flex-1 flex flex-col justify-start">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100/80 space-y-5">
          
          {/* Welcome Bonus Callout */}
          <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center space-x-3 text-emerald-950">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-lg">
              🎁
            </div>
            <div className="flex-1 text-xs">
              <span className="font-extrabold text-[#013a24] block text-[13px]">₦43,000 Welcome Bonus</span>
              <span className="text-emerald-700 font-medium">Create your 9jacash profile to activate your bonus immediately!</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="border-b border-gray-100 pb-2">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Create Account</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in your information to get started in seconds.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 text-rose-700 text-xs p-3.5 rounded-xl border border-rose-200 font-medium flex items-start space-x-2">
              <Icons.AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#013a24]">
                  <Icons.User className="h-4 w-4" />
                </div>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  required
                  className="w-full pl-10 pr-3.5 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#013a24]/15 focus:border-[#013a24] focus:bg-white transition-all shadow-sm"
                  placeholder="e.g. Pellino Madio"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 pl-1">
                Enter your full legal name as registered on your bank account.
              </p>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#013a24]">
                  <Icons.Mail className="h-4 w-4" />
                </div>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  required
                  className="w-full pl-10 pr-3.5 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#013a24]/15 focus:border-[#013a24] focus:bg-white transition-all shadow-sm"
                  placeholder="e.g. name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* 4-digit PIN */}
            <div>
              <label htmlFor="reg-pin" className="block text-xs font-semibold text-gray-700 mb-1">
                Security PIN (4 Digits)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#013a24]">
                  <Icons.Lock className="h-4 w-4" />
                </div>
                <input
                  id="reg-pin"
                  name="password"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  required
                  className="w-full pl-10 pr-3.5 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#013a24]/15 focus:border-[#013a24] focus:bg-white transition-all tracking-[0.25em] font-mono shadow-sm"
                  placeholder="••••"
                  value={password}
                  onChange={handlePasswordChange}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 pl-1">
                Used to authorize transfers, claims, and dashboard access.
              </p>
            </div>

            {/* Referral Code (Optional) */}
            <div>
              <label htmlFor="reg-ref" className="block text-xs font-semibold text-gray-700 mb-1">
                Referral Code or Sponsor Email <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#013a24]">
                  <Icons.Users className="h-4 w-4" />
                </div>
                <input
                  id="reg-ref"
                  name="referredByInput"
                  type="text"
                  className="w-full pl-10 pr-3.5 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#013a24]/15 focus:border-[#013a24] focus:bg-white transition-all shadow-sm"
                  placeholder="Referral Code or Sponsor Email"
                  value={referredByInput}
                  onChange={(e) => setReferredByInput(e.target.value)}
                />
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start pt-1">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-0.5 text-[#013a24] focus:ring-[#013a24] border-gray-300 rounded cursor-pointer accent-[#013a24]"
              />
              <label htmlFor="terms" className="ml-2 block text-xs text-gray-600 leading-snug cursor-pointer">
                I agree to the{' '}
                <span className="text-[#013a24] font-bold hover:underline">
                  9jacash User Terms
                </span>{' '}
                and{' '}
                <span className="text-[#013a24] font-bold hover:underline">
                  Privacy Policy
                </span>
                .
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#013a24] via-[#09573c] to-[#013a24] hover:from-[#012f1d] hover:to-[#012718] text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-950/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-sm uppercase tracking-wider cursor-pointer disabled:opacity-70"
              >
                <span>{isLoading ? 'Creating 9jacash Account...' : 'Get Started & Claim ₦43,000'}</span>
                {!isLoading && <Icons.ArrowRight className="w-4 h-4 ml-1" />}
              </button>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="text-center border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-600">
              Already have a 9jacash account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="font-bold text-[#013a24] hover:text-emerald-700 underline transition-colors cursor-pointer"
              >
                Sign In here
              </button>
            </p>
          </div>
        </div>

        {/* Security / Verification Badge */}
        <div className="mt-6 flex items-center justify-center space-x-2 text-[11px] text-gray-500 font-medium">
          <Icons.ShieldCheck className="w-4 h-4 text-[#013a24]" />
          <span>256-Bit Bank-Grade Security • 9jacash Verified Network</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
