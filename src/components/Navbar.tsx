import React, { useState } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Globe, 
  Bell, 
  ShieldCheck, 
  ChevronDown, 
  LogIn, 
  LogOut, 
  User, 
  Building2, 
  FileText 
} from 'lucide-react';
import { ArtisanProfile, LanguageCode, PageTab } from '../types';
import { LANGUAGES } from '../data/mockData';
import { TRANSLATIONS } from '../utils/translations';
import { speakText, stopSpeech } from '../utils/audioSpeech';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: PageTab;
  setCurrentTab: (tab: PageTab) => void;
  artisan: ArtisanProfile | null;
  currentLang: LanguageCode;
  setCurrentLang: (lang: LanguageCode) => void;
  voiceActive?: boolean;
  setVoiceActive?: React.Dispatch<React.SetStateAction<boolean>>;
  unreadInquiriesCount?: number;
  onOpenVoiceHelper?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  artisan,
  currentLang,
  setCurrentLang,
  voiceActive = false,
  setVoiceActive,
  unreadInquiriesCount = 0,
  onOpenVoiceHelper,
}) => {
  const { user, role, buyerProfile, logout } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const toggleVoice = () => {
    if (onOpenVoiceHelper) {
      onOpenVoiceHelper();
      return;
    }
    if (setVoiceActive) {
      if (voiceActive) {
        stopSpeech();
        setVoiceActive(false);
      } else {
        setVoiceActive(true);
        const prompt = currentLang === 'hi' 
          ? 'कलाकनेक्ट में आपका स्वागत है। पारंपरिक शिल्प को नए बाज़ार से जोड़ने का सरल डिजिटल मंच।'
          : 'Welcome to KalaConnect. Connecting tradition to digital opportunities for artisans and buyers.';
        speakText(prompt, currentLang, () => setVoiceActive(false));
      }
    }
  };

  const activeLangInfo = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab(user ? 'dashboard' : 'auth')}
              className="flex items-center gap-3 text-left group focus:outline-hidden"
              id="brand-logo-btn"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#C25E3E] to-[#9E3E20] text-white flex items-center justify-center shadow-md shadow-[#C25E3E]/20 group-hover:scale-105 transition-transform duration-200">
                <span className="font-bold text-xl tracking-tight">क</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-serif">
                    Kala<span className="text-[#C25E3E]">Connect</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#C25E3E]/10 text-[#C25E3E] border border-[#C25E3E]/20">
                    <Sparkles className="w-3 h-3" />
                    {user && role === 'buyer' ? 'B2B Sourcing' : 'Craft Platform'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500 font-medium tracking-wide">
                  Connecting Tradition to Opportunity
                </p>
              </div>
            </button>
          </div>

          {/* Center Badges — Strictly ONLY shown when authenticated */}
          <div className="hidden lg:flex items-center gap-2">
            {user && role === 'buyer' && buyerProfile ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-800 font-medium">
                <Building2 className="w-4 h-4 text-slate-700" />
                <span>Verified B2B Buyer</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-emerald-700 font-semibold">{buyerProfile.businessType || 'Retailer'}</span>
              </div>
            ) : user && role === 'artisan' && artisan ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#C25E3E]" />
                <span>Pehchan ID: {artisan.pehchanId}</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-emerald-700 font-semibold">CraftMark Verified</span>
              </div>
            ) : null}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Audio Voice Helper Button */}
            <button
              onClick={toggleVoice}
              id="voice-helper-toggle-btn"
              title={voiceActive ? t.stopVoice : t.listenVoice}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                voiceActive
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-[#C25E3E]/10 text-[#C25E3E] hover:bg-[#C25E3E]/20 border border-[#C25E3E]/30'
              }`}
            >
              {voiceActive ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.stopVoice}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.listenVoice}</span>
                </>
              )}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                id="language-menu-btn"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 text-xs sm:text-sm font-medium border border-stone-200 transition-colors"
              >
                <Globe className="w-4 h-4 text-stone-600" />
                <span className="font-semibold">{activeLangInfo.nativeName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
              </button>

              {langMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  id="language-dropdown"
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-600 border-b border-stone-100">
                    Select Your Language / भाषा चुनें
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors ${
                        currentLang === lang.code
                          ? 'bg-[#C25E3E]/10 text-[#C25E3E] font-bold'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      <span className="text-xs text-stone-600 font-normal">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Buyer Inquiries / Requests Notification — Only for authenticated users */}
            {user && (
              <button
                onClick={() => {
                  if (role === 'buyer') {
                    setCurrentTab('requests');
                  } else {
                    setCurrentTab('market');
                  }
                }}
                id="notifications-btn"
                title={role === 'buyer' ? 'My Quotation Requests' : 'B2B Buyer Inquiries'}
                className="relative p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadInquiriesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C25E3E] text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadInquiriesCount}
                  </span>
                )}
              </button>
            )}

            {/* Dynamic User Profile or Log In CTA */}
            {user && (role === 'buyer' ? buyerProfile : artisan) ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  id="user-profile-header-btn"
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl hover:bg-stone-100 transition-colors border border-transparent hover:border-stone-200"
                >
                  {role === 'buyer' ? (
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold ring-1 ring-stone-200">
                      🏢
                    </div>
                  ) : (
                    <img
                      src={artisan?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'}
                      alt={artisan?.name || 'Artisan'}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-stone-200"
                    />
                  )}
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-stone-900 leading-tight truncate max-w-[110px]">
                      {role === 'buyer'
                        ? buyerProfile?.businessName?.split(' ')[0] || user.name || 'Buyer'
                        : artisan?.name?.split(' ')[0] || user.name || 'Artisan'}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate max-w-[110px]">
                      {role === 'buyer'
                        ? buyerProfile?.cityState || 'B2B Sourcing'
                        : artisan?.location || 'India'}
                    </p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {role === 'buyer' ? buyerProfile?.businessName || user.name : artisan?.name || user.name}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email || user.name}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C25E3E]/10 text-[#C25E3E]">
                        {role === 'buyer' ? '🏢 B2B Buyer' : '👩‍🎨 Master Artisan'}
                      </span>
                    </div>

                    {role === 'buyer' ? (
                      <>
                        <button
                          onClick={() => {
                            setCurrentTab('dashboard');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                        >
                          <Building2 className="w-3.5 h-3.5 text-stone-500" />
                          <span>Buyer Dashboard</span>
                        </button>
                        <button
                          onClick={() => {
                            setCurrentTab('requests');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                        >
                          <FileText className="w-3.5 h-3.5 text-stone-500" />
                          <span>My Quotations & RFQs</span>
                        </button>
                        <button
                          onClick={() => {
                            setCurrentTab('profile');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                        >
                          <User className="w-3.5 h-3.5 text-stone-500" />
                          <span>Buyer Profile</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setCurrentTab('profile');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                        >
                          <User className="w-3.5 h-3.5 text-stone-500" />
                          <span>Artisan Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            setCurrentTab('settings');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
                          <span>Settings & Account</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                        setCurrentTab('auth');
                      }}
                      id="header-logout-btn"
                      className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-stone-100"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('auth')}
                id="header-login-btn"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In / Sign Up</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
