import React, { useState } from 'react';
import { Icons } from './Icons';
import { auth, db, doc, getDoc, signInWithEmailAndPassword } from '../firebase';

interface LoginProps {
  onLogin: (email: string, name: string) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and max 4 digits
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPassword(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password.length !== 4) {
      setError('Please enter your 4-digit PIN');
      setIsLoading(false);
      return;
    }
    
    const emailKey = email.toLowerCase().trim();
    const securePassword = `${password}_chix9ja_secure_salt`;

    signInWithEmailAndPassword(auth, emailKey, securePassword)
      .then(async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', emailKey));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            onLogin(emailKey, userData.name || 'Member');
          } else {
            // Default login if new session
            onLogin(emailKey, emailKey.split('@')[0]);
          }
        } catch (err: any) {
          setError(err.message || 'Error loading profile from database.');
        }
        setIsLoading(false);
      })
      .catch((err: any) => {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          setError('Account not registered or invalid 4-digit PIN.');
        } else {
          setError(err.message || 'Error validating credentials.');
        }
        setIsLoading(false);
      });
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
                  <linearGradient id="loginGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                <path 
                  d="M50 14 C30 14 15 29 15 49 C15 69 30 84 50 84 C66 84 79 73 83 58 L66 58 C63 67 57 71 50 71 C38 71 28 61 28 49 C28 37 38 27 50 27 C59 27 66 32 70 40 L84 31 C77 20 65 14 50 14 Z" 
                  fill="url(#loginGoldGrad)" 
                />
                <path 
                  d="M48 42 L78 42 L65 55 L38 55 Z" 
                  fill="#ffffff" 
                  opacity="0.9"
                />
                <circle cx="58" cy="48" r="4" fill="url(#loginGoldGrad)" />
              </svg>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              9jacash
            </h1>
            <p className="text-xs text-emerald-200/90 font-medium">
              Welcome Back • Sign in to your financial dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Main Login Form Card - Overlapping Hero Section */}
      <div className="max-w-md w-full mx-auto px-4 -mt-10 relative z-20 pb-8 flex-1 flex flex-col justify-start">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100/80 space-y-5">
          
          <div className="border-b border-gray-100 pb-2">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Sign In</h2>
            <p className="text-xs text-gray-500 mt-0.5">Enter your email and 4-digit PIN to continue.</p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-700 text-xs p-3.5 rounded-xl border border-rose-200 font-medium flex items-start space-x-2">
              <Icons.AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#013a24]">
                  <Icons.Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email"
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

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="login-pin" className="block text-xs font-semibold text-gray-700">
                  4-Digit Security PIN
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#013a24]">
                  <Icons.Lock className="h-4 w-4" />
                </div>
                <input
                  id="login-pin"
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
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#013a24] via-[#09573c] to-[#013a24] hover:from-[#012f1d] hover:to-[#012718] text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-950/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-sm uppercase tracking-wider cursor-pointer disabled:opacity-70"
              >
                <span>{isLoading ? 'Signing in...' : 'Sign In to 9jacash'}</span>
                {!isLoading && <Icons.ArrowRight className="w-4 h-4 ml-1" />}
              </button>
            </div>
          </form>

          <div className="text-center border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="font-bold text-[#013a24] hover:text-emerald-700 underline transition-colors cursor-pointer"
              >
                Register now
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center space-x-2 text-[11px] text-gray-500 font-medium">
          <Icons.ShieldCheck className="w-4 h-4 text-[#013a24]" />
          <span>256-Bit Bank-Grade Security • 9jacash Verified Network</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
