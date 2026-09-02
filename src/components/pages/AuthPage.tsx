import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Phone,
  MapPin,
  Building2,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SAMPLE_CRAFT_TYPES } from '../../data/mockData';
import { LanguageCode, UserRole, BuyerBusinessType } from '../../types';

interface AuthPageProps {
  initialRole?: UserRole;
  onSuccess?: (role?: UserRole) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialRole = 'artisan', onSuccess }) => {
  const { login, signup, signupBuyer } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [activeRole, setActiveRole] = useState<'artisan' | 'buyer'>(
    initialRole === 'buyer' ? 'buyer' : 'artisan'
  );

  // Common Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Artisan Signup form state
  const [artisanName, setArtisanName] = useState('');
  const [artisanEmail, setArtisanEmail] = useState('');
  const [artisanPassword, setArtisanPassword] = useState('');
  const [artisanCraftType, setArtisanCraftType] = useState(SAMPLE_CRAFT_TYPES[0]);
  const [artisanPhone, setArtisanPhone] = useState('');
  const [artisanLocation, setArtisanLocation] = useState('Jaipur, Rajasthan');
  const [artisanLanguage, setArtisanLanguage] = useState<LanguageCode>('en');

  // Buyer Signup form state
  const [buyerBusinessName, setBuyerBusinessName] = useState('');
  const [buyerContactPerson, setBuyerContactPerson] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerBusinessType, setBuyerBusinessType] = useState<BuyerBusinessType>('Retailer');
  const [buyerCityState, setBuyerCityState] = useState('');
  const [buyerPassword, setBuyerPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const buyerBusinessTypes: BuyerBusinessType[] = [
    'Retailer',
    'Distributor',
    'Hotel',
    'Corporate',
    'Exporter',
    'Other',
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both your Name / Email and password.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await login(loginIdentifier.trim(), loginPassword, activeRole);
      onSuccess?.(res.role);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Login failed. Please check your credentials or create an account.');
    } finally {
      setLoading(false);
    }
  };

  const handleArtisanSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artisanName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!artisanEmail.trim() || !artisanPassword.trim()) {
      setErrorMsg('Please enter an email and password.');
      return;
    }
    if (artisanPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      await signup(artisanEmail.trim(), artisanPassword, {
        name: artisanName.trim(),
        craftType: artisanCraftType,
        phone: artisanPhone.trim(),
        location: artisanLocation.trim(),
        preferredLanguage: artisanLanguage,
      });
      onSuccess?.('artisan');
    } catch (err: any) {
      console.error('Artisan signup error:', err);
      setErrorMsg(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyerSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerBusinessName.trim() && !buyerContactPerson.trim()) {
      setErrorMsg('Please enter your Business Name or Contact Person name.');
      return;
    }
    if (!buyerEmail.trim() || !buyerPassword.trim()) {
      setErrorMsg('Please enter an Email and Password.');
      return;
    }
    if (buyerPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      await signupBuyer(buyerEmail.trim(), buyerPassword, {
        businessName: buyerBusinessName.trim() || buyerContactPerson.trim(),
        contactPerson: buyerContactPerson.trim() || buyerBusinessName.trim(),
        phone: buyerPhone.trim(),
        businessType: buyerBusinessType,
        cityState: buyerCityState.trim() || 'India',
      });
      onSuccess?.('buyer');
    } catch (err: any) {
      console.error('Buyer signup error:', err);
      setErrorMsg(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-4 sm:py-8 px-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl relative overflow-hidden">
        {/* Decorative Indian Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#C25E3E] via-amber-500 to-[#1E293B]" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#C25E3E]/10 text-[#C25E3E] mx-auto flex items-center justify-center font-bold text-xl mb-3">
            {activeRole === 'buyer' ? '🏢' : '👩‍🎨'}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            {mode === 'login'
              ? `Log In to ${activeRole === 'buyer' ? 'Buyer Account' : 'Artisan Account'}`
              : activeRole === 'buyer'
              ? 'Create B2B Buyer Account'
              : 'Create Master Artisan Account'}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {mode === 'login'
              ? `Access your personalized ${activeRole === 'buyer' ? 'B2B wholesale sourcing' : 'artisan studio & catalog'} dashboard`
              : activeRole === 'buyer'
              ? 'Direct bulk sourcing from verified master artisans across India'
              : 'Sign up to build and manage your digital craft business'}
          </p>
        </div>

        {/* Role Switcher (Artisan vs B2B Buyer) */}
        <div className="mb-5 space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Account Type:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveRole('artisan');
                setErrorMsg(null);
              }}
              id="auth-role-artisan-btn"
              className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 ${
                activeRole === 'artisan'
                  ? 'border-[#C25E3E] bg-[#C25E3E]/5 text-[#C25E3E] shadow-xs'
                  : 'border-stone-200 text-stone-600 hover:border-stone-300 bg-stone-50/50'
              }`}
            >
              <span className="text-xl">👩‍🎨</span>
              <div>
                <p className="text-xs font-bold text-slate-900">Artisan</p>
                <p className="text-[10px] text-stone-500">Sell handmade crafts</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveRole('buyer');
                setErrorMsg(null);
              }}
              id="auth-role-buyer-btn"
              className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-2.5 ${
                activeRole === 'buyer'
                  ? 'border-slate-900 bg-slate-900/5 text-slate-900 shadow-xs'
                  : 'border-stone-200 text-stone-600 hover:border-stone-300 bg-stone-50/50'
              }`}
            >
              <span className="text-xl">🏢</span>
              <div>
                <p className="text-xs font-bold text-slate-900">B2B Buyer</p>
                <p className="text-[10px] text-stone-500">Buy in bulk</p>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Toggle (Log In / Create Account) */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            id="auth-mode-login-tab"
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            id="auth-mode-signup-tab"
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'signup' ? 'bg-white text-slate-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Name, Username, or Email *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. Sam or sam@example.com"
                  id="login-email-input"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#C25E3E] outline-hidden bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  id="login-password-input"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#C25E3E] outline-hidden bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit-btn"
              className={`w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 ${
                activeRole === 'buyer' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-[#C25E3E] hover:bg-[#A94B2E]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging In...</span>
                </>
              ) : (
                <>
                  <span>Log In as {activeRole === 'buyer' ? 'B2B Buyer' : 'Artisan'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. ARTISAN SIGNUP FORM */}
        {mode === 'signup' && activeRole === 'artisan' && (
          <form onSubmit={handleArtisanSignupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Artisan Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={artisanName}
                  onChange={(e) => setArtisanName(e.target.value)}
                  placeholder="e.g. Sam"
                  id="artisan-signup-name"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:border-[#C25E3E] outline-hidden bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={artisanEmail}
                  onChange={(e) => setArtisanEmail(e.target.value)}
                  placeholder="sam@example.com"
                  id="artisan-signup-email"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:border-[#C25E3E] outline-hidden bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={artisanPassword}
                  onChange={(e) => setArtisanPassword(e.target.value)}
                  placeholder="••••••••"
                  id="artisan-signup-password"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:border-[#C25E3E] outline-hidden bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Traditional Craft Specialization *
              </label>
              <select
                value={artisanCraftType}
                onChange={(e) => setArtisanCraftType(e.target.value)}
                id="artisan-signup-craft"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:border-[#C25E3E] outline-hidden bg-white"
              >
                {SAMPLE_CRAFT_TYPES.map((craft) => (
                  <option key={craft} value={craft}>
                    {craft}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={artisanPhone}
                  onChange={(e) => setArtisanPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  id="artisan-signup-phone"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  City / State
                </label>
                <input
                  type="text"
                  value={artisanLocation}
                  onChange={(e) => setArtisanLocation(e.target.value)}
                  placeholder="e.g. Jaipur, Rajasthan"
                  id="artisan-signup-location"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="artisan-signup-submit-btn"
              className="w-full py-3.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Free Artisan Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 3. B2B BUYER SIGNUP FORM */}
        {mode === 'signup' && activeRole === 'buyer' && (
          <form onSubmit={handleBuyerSignupSubmit} className="space-y-3.5">
            {/* Business / Organization Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Business / Organization Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={buyerBusinessName}
                  onChange={(e) => setBuyerBusinessName(e.target.value)}
                  placeholder="e.g. Sam Wholesale Traders"
                  id="buyer-signup-business-name"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:border-slate-900 outline-hidden bg-white"
                />
              </div>
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Contact Person Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={buyerContactPerson}
                  onChange={(e) => setBuyerContactPerson(e.target.value)}
                  placeholder="e.g. Sam"
                  id="buyer-signup-contact-person"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:border-slate-900 outline-hidden bg-white"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="sam@buyer.com"
                  id="buyer-signup-email"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:border-slate-900 outline-hidden bg-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={buyerPassword}
                  onChange={(e) => setBuyerPassword(e.target.value)}
                  placeholder="••••••••"
                  id="buyer-signup-password"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:border-slate-900 outline-hidden bg-white"
                />
              </div>
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                Business Type *
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <select
                  value={buyerBusinessType}
                  onChange={(e) => setBuyerBusinessType(e.target.value as BuyerBusinessType)}
                  id="buyer-signup-business-type"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:border-slate-900 outline-hidden bg-white"
                >
                  {buyerBusinessTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* City / State & Mobile Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Mobile Phone
                </label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  id="buyer-signup-phone"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  City / State
                </label>
                <input
                  type="text"
                  value={buyerCityState}
                  onChange={(e) => setBuyerCityState(e.target.value)}
                  placeholder="e.g. Mumbai, MH"
                  id="buyer-signup-city-state"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="buyer-signup-submit-btn"
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Buyer Account...</span>
                </>
              ) : (
                <>
                  <span>Create Buyer Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
