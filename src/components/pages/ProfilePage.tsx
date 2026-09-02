import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Award,
  Globe,
  MapPin,
  Phone,
  Mail,
  BadgeIndianRupee,
  CheckCircle2,
  Bell,
  Volume2,
  LogOut,
  Save,
  QrCode,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { ArtisanProfile, LanguageCode, PageTab } from '../../types';
import { LANGUAGES, SAMPLE_CRAFT_TYPES } from '../../data/mockData';
import { TRANSLATIONS } from '../../utils/translations';
import { speakText } from '../../utils/audioSpeech';
import { useAuth } from '../../context/AuthContext';

interface ProfilePageProps {
  artisan: ArtisanProfile | null;
  setArtisan: React.Dispatch<React.SetStateAction<ArtisanProfile>>;
  currentLang: LanguageCode;
  setCurrentLang: (lang: LanguageCode) => void;
  setCurrentTab: (tab: PageTab) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  artisan,
  setArtisan,
  currentLang,
  setCurrentLang,
  setCurrentTab,
}) => {
  const { user, updateProfileData, logout } = useAuth();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [name, setName] = useState(artisan?.name || '');
  const [businessName, setBusinessName] = useState(artisan?.businessName || '');
  const [craftType, setCraftType] = useState(artisan?.craftType || SAMPLE_CRAFT_TYPES[0]);
  const [specialization, setSpecialization] = useState(artisan?.specialization || 'Handcrafted Blue Pottery & Glazed Ceramics');
  const [experienceYears, setExperienceYears] = useState<string>(artisan?.experienceYears?.toString() || '24');
  const [location, setLocation] = useState(artisan?.location || '');
  const [state, setState] = useState(artisan?.state || 'Rajasthan');
  const [phone, setPhone] = useState(artisan?.phone || '');
  const [email, setEmail] = useState(artisan?.email || user?.email || '');
  const [upiId, setUpiId] = useState(artisan?.upiId || '');
  const [bio, setBio] = useState(artisan?.bio || '');
  const [availableForCustomOrders, setAvailableForCustomOrders] = useState<boolean>(
    artisan?.availableForCustomOrders ?? true
  );
  
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Name cannot be empty.');
      return;
    }
    setErrorMsg(null);
    setSaving(true);

    try {
      const updates: Partial<ArtisanProfile> = {
        name: name.trim(),
        businessName: businessName.trim(),
        craftType,
        specialization: specialization.trim(),
        experienceYears: parseInt(experienceYears, 10) || 0,
        location: location.trim(),
        state: state.trim(),
        phone: phone.trim(),
        email: email.trim(),
        upiId: upiId.trim(),
        bio: bio.trim(),
        availableForCustomOrders,
      };

      if (user) {
        await updateProfileData(updates);
      }
      setArtisan((prev) => ({
        ...prev,
        ...updates,
      }));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setErrorMsg('Failed to update profile. Please check connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const playProfileSpeech = () => {
    const text =
      currentLang === 'hi'
        ? `कारीगर प्रोफ़ाइल: ${name || 'कारीगर'}। पहचान आईडी ${artisan?.pehchanId || 'प्रामाणिक'}। क्राफ्टमार्क प्रमाणित।`
        : `Artisan Profile of ${name || 'Artisan'}. Pehchan ID: ${artisan?.pehchanId || 'Verified'}. CraftMark India certified.`;
    speakText(text, currentLang);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header Profile Identity Card */}
      <div className="bg-gradient-to-br from-[#291A16] to-[#1E232E] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  artisan?.avatarUrl ||
                  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'
                }
                alt={name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-xs">
                ✓
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-white">{name || 'Artisan Profile'}</h1>
                <span className="p-1 rounded-full bg-[#E07A5F]/20 text-[#E07A5F]">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-amber-200 font-medium">
                {businessName || 'Independent Studio'} • {craftType}
              </p>
              <p className="text-[11px] text-stone-400">
                📍 {location || 'India'}, {state} • {user ? `Signed in as ${user.email}` : 'Guest Mode'}
              </p>
            </div>
          </div>

          {/* Pehchan ID Badge */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5 self-start sm:self-auto">
            <div className="flex items-center justify-between text-[10px] text-stone-300 font-mono">
              <span>MINISTRY OF TEXTILES</span>
              <span className="text-emerald-400 font-bold">VERIFIED</span>
            </div>
            <p className="text-xs font-bold text-white font-mono tracking-wider">
              {artisan?.pehchanId || 'IND-ART-AUTHENTIC'}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-200">
              <Award className="w-3.5 h-3.5" />
              <span>National CraftMark Certified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form & Settings */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                Artisan Information & Direct Payment Settings
              </h2>
              <p className="text-xs text-stone-500">
                Your business credentials and payment receiver for marketplace settlements.
              </p>
            </div>

            <button
              type="button"
              onClick={playProfileSpeech}
              className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4 text-[#C25E3E]" />
              <span>Listen Info</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Full Name / नाम *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Studio / Workshop Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Craft Specialty
              </label>
              <select
                value={craftType}
                onChange={(e) => setCraftType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold bg-white"
              >
                {SAMPLE_CRAFT_TYPES.map((craft) => (
                  <option key={craft} value={craft}>
                    {craft}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Specialization / Art Style
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Cobalt blue hand-painted pottery"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Years of Craft Experience
              </label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="25"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Cluster / City
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Phone Number (WhatsApp for Orders)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Direct UPI ID (Instant Bank Settlement)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="artisan@upi"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold font-mono"
              />
            </div>
          </div>

          {/* Custom Commissions Toggle */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Available for Custom Artwork Commissions</span>
              <span className="text-[11px] text-stone-500">Allow customers to send custom milestone-based commission requests</span>
            </div>
            <input
              type="checkbox"
              checked={availableForCustomOrders}
              onChange={(e) => setAvailableForCustomOrders(e.target.checked)}
              className="w-5 h-5 text-[#C25E3E] rounded-md focus:ring-[#C25E3E] cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Artisan Story / Heritage Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-300 text-xs sm:text-sm text-slate-800 leading-relaxed outline-hidden"
            />
          </div>

          {/* Language Selection inside settings */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Default App Language / भाषा प्राथमिकता
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setCurrentLang(lang.code);
                    if (user) {
                      updateProfileData({ preferredLanguage: lang.code });
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between ${
                    currentLang === lang.code
                      ? 'bg-[#C25E3E] text-white border-[#C25E3E]'
                      : 'bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <span>{lang.nativeName}</span>
                  {currentLang === lang.code && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            {user ? (
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  setCurrentTab('auth');
                }}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentTab('auth')}
                className="px-4 py-2.5 rounded-xl bg-[#C25E3E] text-white text-xs font-bold hover:bg-[#A94B2E] flex items-center gap-1.5"
              >
                <span>Create / Log In to Account</span>
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              id="profile-save-btn"
              className="px-6 py-3 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all hover:scale-105 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{savedSuccess ? 'Saved to Database! ✓' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
