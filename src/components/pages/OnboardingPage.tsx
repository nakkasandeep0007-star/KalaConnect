import React, { useState } from 'react';
import {
  User,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Palette,
  Check,
  ArrowRight,
  ShieldCheck,
  Volume2,
  CheckCircle2
} from 'lucide-react';
import { ArtisanProfile, LanguageCode, PageTab } from '../../types';
import { LANGUAGES, SAMPLE_CRAFT_TYPES } from '../../data/mockData';
import { TRANSLATIONS } from '../../utils/translations';
import { speakText } from '../../utils/audioSpeech';

interface OnboardingPageProps {
  artisan: ArtisanProfile;
  setArtisan: React.Dispatch<React.SetStateAction<ArtisanProfile>>;
  setCurrentTab: (tab: PageTab) => void;
  currentLang: LanguageCode;
  setCurrentLang: (lang: LanguageCode) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  artisan,
  setArtisan,
  setCurrentTab,
  currentLang,
  setCurrentLang,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [formData, setFormData] = useState({
    name: artisan.name || '',
    businessName: artisan.businessName || '',
    craftType: artisan.craftType || SAMPLE_CRAFT_TYPES[0],
    experienceYears: artisan.experienceYears || 15,
    location: artisan.location || '',
    state: artisan.state || 'Rajasthan',
    phone: artisan.phone || '',
    email: artisan.email || '',
    preferredLanguage: currentLang,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleVoiceHelp = () => {
    const speech = currentLang === 'hi'
      ? 'कृपया अपना नाम, अपनी कला का प्रकार, और अपना मोबाइल नंबर दर्ज करें। यह बहुत सरल है।'
      : 'Please enter your name, craft type, and phone number to set up your virtual artisan shop.';
    speakText(speech, currentLang);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setArtisan((prev) => ({
      ...prev,
      name: formData.name || 'Master Artisan',
      businessName: formData.businessName || `${formData.name}'s Craft Studio`,
      craftType: formData.craftType,
      experienceYears: Number(formData.experienceYears) || 10,
      location: formData.location || 'Jaipur',
      state: formData.state || 'Rajasthan',
      phone: formData.phone || '+91 98000 00000',
      email: formData.email || 'artisan@kalaconnect.org',
      preferredLanguage: formData.preferredLanguage,
    }));
    setCurrentLang(formData.preferredLanguage);
    setSubmitted(true);
    setTimeout(() => {
      setCurrentTab('dashboard');
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-2 sm:px-4 animate-in fade-in duration-300">
      
      {/* Progress Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl relative overflow-hidden">
        
        {/* Decorative Indian Pattern Header Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#C25E3E] via-amber-500 to-[#1E293B]" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C25E3E]/10 text-[#C25E3E] flex items-center justify-center font-bold text-xl">
              क
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                {currentLang === 'hi' ? 'कारीगर प्रोफ़ाइल सेटअप' : 'Artisan Onboarding'}
              </h2>
              <p className="text-xs text-stone-500">
                {currentLang === 'hi' ? '2 मिनट में अपना डिजिटल शिल्प खाता बनाएं' : 'Set up your AI Virtual Business Manager in 2 minutes'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleVoiceHelp}
            id="onboarding-voice-guide-btn"
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span>{currentLang === 'hi' ? 'आवाज़ में सुनें' : 'Listen Instructions'}</span>
          </button>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 font-serif">
              {currentLang === 'hi' ? 'स्वागत है! खाता तैयार हो गया है' : 'Welcome! Profile Created Successfully'}
            </h3>
            <p className="text-xs text-stone-500">Redirecting to your Artisan Dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Language Preference (Large Touch Friendly) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                1. Choose Preferred Language / भाषा चुनें *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, preferredLanguage: lang.code });
                      setCurrentLang(lang.code);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      formData.preferredLanguage === lang.code
                        ? 'bg-[#C25E3E]/10 border-[#C25E3E] text-[#C25E3E] font-bold shadow-xs'
                        : 'bg-stone-50/80 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold">{lang.nativeName}</p>
                      <p className="text-[11px] text-stone-500">{lang.name}</p>
                    </div>
                    {formData.preferredLanguage === lang.code && (
                      <Check className="w-4 h-4 text-[#C25E3E]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Artisan Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Artisan Full Name / आपका नाम *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    id="input-artisan-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rameshwar Lal Kumhar"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#C25E3E] focus:ring-1 focus:ring-[#C25E3E] outline-hidden bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Workshop / Studio Name (Optional)
                </label>
                <input
                  type="text"
                  id="input-business-name"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g. Mitti Kala Handloom Creations"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#C25E3E] focus:ring-1 focus:ring-[#C25E3E] outline-hidden bg-white"
                />
              </div>
            </div>

            {/* Step 3: Craft Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                2. Select Your Traditional Craft / अपनी कला का चयन करें *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_CRAFT_TYPES.map((craft) => (
                  <button
                    key={craft}
                    type="button"
                    onClick={() => setFormData({ ...formData, craftType: craft })}
                    className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-all ${
                      formData.craftType === craft
                        ? 'bg-[#C25E3E] text-white border-[#C25E3E] shadow-sm font-bold'
                        : 'bg-stone-50 border-stone-200/80 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{craft}</span>
                    {formData.craftType === craft && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Contact & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  City / Cluster *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    id="input-artisan-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Jaipur, Sanganer"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#C25E3E] focus:ring-1 focus:ring-[#C25E3E] outline-hidden bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Mobile Number (for Orders) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    id="input-artisan-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98290 XXXXX"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#C25E3E] focus:ring-1 focus:ring-[#C25E3E] outline-hidden bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Years of Experience
                </label>
                <input
                  type="number"
                  id="input-artisan-experience"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:border-[#C25E3E] focus:ring-1 focus:ring-[#C25E3E] outline-hidden bg-white"
                />
              </div>
            </div>

            {/* Pehchan Card / Craft Verification Badge info */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#C25E3E] shrink-0" />
              <p className="text-xs text-amber-900">
                <strong>Pehchan ID & CraftMark integration:</strong> Your handicrafts will automatically receive the official authentic craft trust stamp on national marketplaces.
              </p>
            </div>

            {/* Submit Action */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentTab('welcome')}
                className="px-5 py-3 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-100 transition-colors"
              >
                Back to Home
              </button>

              <button
                type="submit"
                id="onboarding-submit-btn"
                className="px-8 py-3.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-[#C25E3E]/20 transition-all hover:scale-105 active:scale-95"
              >
                <span>Complete Setup & Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
