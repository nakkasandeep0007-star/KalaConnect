import React, { useState } from 'react';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Save,
  Tag,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { BuyerProfile, BuyerBusinessType, LanguageCode, PageTab } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface BuyerProfilePageProps {
  buyerProfile: BuyerProfile | null;
  setCurrentTab: (tab: PageTab) => void;
  currentLang?: LanguageCode;
}

export const BuyerProfilePage: React.FC<BuyerProfilePageProps> = ({
  buyerProfile,
  setCurrentTab,
  currentLang = 'en',
}) => {
  const { updateBuyerProfile } = useAuth();

  const [businessName, setBusinessName] = useState(buyerProfile?.businessName || 'ABC Handicrafts Pvt Ltd');
  const [contactPerson, setContactPerson] = useState(buyerProfile?.contactPerson || 'Rakesh Sharma');
  const [phone, setPhone] = useState(buyerProfile?.phone || '+91 98110 54321');
  const [email, setEmail] = useState(buyerProfile?.email || 'sourcing@abchandicrafts.com');
  const [businessType, setBusinessType] = useState<BuyerBusinessType | string>(buyerProfile?.businessType || 'Retailer');
  const [cityState, setCityState] = useState(buyerProfile?.cityState || 'New Delhi, Delhi');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const businessTypes: BuyerBusinessType[] = [
    'Retailer',
    'Distributor',
    'Hotel',
    'Corporate',
    'Exporter',
    'Other',
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateBuyerProfile({
        businessName: businessName.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        businessType,
        cityState: cityState.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update buyer profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200" id="buyer-profile-page">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-stone-800 text-white flex items-center justify-center text-2xl font-bold shadow-md">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
                  {buyerProfile?.businessName || businessName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Buyer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                {buyerProfile?.businessType || businessType} • {buyerProfile?.cityState || cityState}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                Contact: <strong className="text-slate-700">{buyerProfile?.contactPerson || contactPerson}</strong> ({buyerProfile?.email || email})
              </p>
            </div>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 shrink-0 space-y-0.5">
            <p className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C25E3E]" />
              Direct Master Sourcing
            </p>
            <p className="text-[11px] text-stone-600">Zero middleman commission</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-serif">
            Organization & Contact Details
          </h2>
          <p className="text-xs text-stone-500">
            Keep your business details up to date so artisans can accurately quote logistics and wholesale tariffs.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Buyer profile updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Business / Organization Name */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">
              Business / Organization Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                id="buyer-profile-business-name"
                placeholder="e.g. ABC Handicrafts Pvt Ltd"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C25E3E]"
              />
            </div>
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">
              Contact Person <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                id="buyer-profile-contact-person"
                placeholder="e.g. Rakesh Sharma"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C25E3E]"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                id="buyer-profile-phone"
                placeholder="+91 98110 54321"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C25E3E]"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                disabled
                value={email}
                id="buyer-profile-email"
                placeholder="sourcing@business.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 text-xs sm:text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">
              Business Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as BuyerBusinessType)}
                id="buyer-profile-business-type"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C25E3E] bg-white"
              >
                {businessTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* City / State */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1.5">
              City / State <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                id="buyer-profile-city-state"
                placeholder="e.g. New Delhi, Delhi"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C25E3E]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            id="buyer-save-profile-btn"
            className="px-6 py-2.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#C25E3E]/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

    </div>
  );
};
