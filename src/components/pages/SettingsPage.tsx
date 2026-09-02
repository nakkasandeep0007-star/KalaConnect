import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  ShieldCheck,
  Bell,
  LogOut,
  Users,
  CheckCircle2,
  Lock,
  Save,
  QrCode,
  Award,
} from 'lucide-react';
import { LanguageCode, PageTab } from '../../types';
import { LANGUAGES } from '../../data/mockData';
import { TRANSLATIONS } from '../../utils/translations';
import { useAuth } from '../../context/AuthContext';

interface SettingsPageProps {
  currentLang: LanguageCode;
  setCurrentLang: (lang: LanguageCode) => void;
  setCurrentTab: (tab: PageTab) => void;
  onSwitchRole: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentLang,
  setCurrentLang,
  setCurrentTab,
  onSwitchRole,
}) => {
  const { artisan, logout } = useAuth();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [smsUpdates, setSmsUpdates] = useState(true);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C25E3E]/10 text-[#C25E3E] border border-[#C25E3E]/20 flex items-center gap-1">
            <SettingsIcon className="w-3.5 h-3.5" />
            Preferences & Verification
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-serif">
          Settings & Account
        </h1>
        <p className="text-sm text-stone-500 mt-1 max-w-xl">
          Manage your interface language, government artisan certification, notification channels, and account security.
        </p>
      </div>

      {/* Role Switching Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Switch User Role</h3>
              <p className="text-xs text-stone-500">
                Currently operating in <span className="font-bold text-[#C25E3E]">Artist / Artisan</span> suite.
              </p>
            </div>
          </div>

          <button
            onClick={onSwitchRole}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold transition-colors"
          >
            Change Role / Re-select
          </button>
        </div>
      </div>

      {/* Preferred Language */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Interface Language</h3>
            <p className="text-xs text-stone-500">Select your preferred Indian vernacular language</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setCurrentLang(lang.code)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                currentLang === lang.code
                  ? 'border-[#C25E3E] bg-[#C25E3E]/5 ring-2 ring-[#C25E3E]/20'
                  : 'border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span className="text-lg block mb-1">{lang.flag}</span>
              <span className="text-xs font-bold text-slate-900 block">{lang.nativeName}</span>
              <span className="text-[10px] text-stone-400">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pehchan ID & Craftmark Certification */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Official Government Certification</h3>
            <p className="text-xs text-stone-500">Ministry of Textiles, Development Commissioner (Handicrafts)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-xs text-stone-400 block font-medium">National Pehchan Artisan ID</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 font-mono">
                {artisan?.pehchanId || 'IND-ART-RAJ-2024-8841'}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Verified
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-xs text-stone-400 block font-medium">Craftmark & Silk Mark Status</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">
                100% Genuine Handcrafted GI Tag
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Alerts & Commission Notifications</h3>
            <p className="text-xs text-stone-500">Receive instant updates when buyers send custom artwork inquiries</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 block">WhatsApp & SMS Order Alerts</span>
              <span className="text-[11px] text-stone-500">Receive SMS notifications for high-priority commissions</span>
            </div>
            <input
              type="checkbox"
              checked={smsUpdates}
              onChange={(e) => setSmsUpdates(e.target.checked)}
              className="w-4 h-4 text-[#C25E3E] rounded-md focus:ring-[#C25E3E]"
            />
          </label>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Sign Out</h3>
          <p className="text-xs text-stone-500">End your current session on this device</p>
        </div>

        <button
          onClick={async () => {
            await logout();
            onSwitchRole();
          }}
          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
};
