import React from 'react';
import { Palette, Building2, Sparkles, ArrowRight, ShieldCheck, Gem, Store } from 'lucide-react';
import { UserRole } from '../../types';

interface RoleSelectionPageProps {
  onSelectRole: (role: UserRole) => void;
  selectedRole?: UserRole | null;
}

export const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 text-slate-800">
      {/* Brand Header */}
      <div className="max-w-4xl mx-auto w-full text-center pt-4 sm:pt-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C25E3E]/10 border border-[#C25E3E]/20 text-[#C25E3E] text-xs sm:text-sm font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          <span>India's Heritage Artisan & B2B Commerce Platform</span>
        </div>

        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C25E3E] to-[#9E3E20] text-white flex items-center justify-center shadow-lg shadow-[#C25E3E]/25 text-2xl font-bold font-serif">
            क
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 font-serif">
            Kala<span className="text-[#C25E3E]">Connect</span>
          </h1>
        </div>

        <p className="text-base sm:text-xl text-stone-600 font-medium tracking-wide max-w-xl mx-auto">
          Connecting Tradition to Opportunity
        </p>

        <div className="mt-8 sm:mt-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
            How will you use KalaConnect?
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Choose your journey to access personalized tools and features
          </p>
        </div>
      </div>

      {/* Two Large Role Cards */}
      <div className="max-w-4xl mx-auto w-full my-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* 1. ARTISAN CARD */}
        <div
          onClick={() => onSelectRole('artisan')}
          id="select-role-artisan-card"
          className="group relative cursor-pointer rounded-3xl bg-white border-2 border-stone-200 hover:border-[#C25E3E] p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
        >
          {/* Top highlight pill */}
          <div className="flex items-center justify-between mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C25E3E]/10 text-[#C25E3E] border border-[#C25E3E]/20 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              Creator & Artisan Suite
            </span>
            <span className="text-4xl" role="img" aria-label="Artisan">👩‍🎨</span>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-[#C25E3E] transition-colors">
              ARTISAN
            </h3>
            <p className="text-stone-600 text-base leading-relaxed">
              Sell handmade products and connect with buyers
            </p>
            <p className="text-xs text-stone-400">
              AI studio tools, fair KalaPrice calculator, Pehchan ID verification, and wholesale listings.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Pehchan ID & Studio</span>
            </div>
            <button className="px-4 py-2.5 rounded-xl bg-[#C25E3E] text-white text-sm font-bold flex items-center gap-2 group-hover:bg-[#a94e32] shadow-md shadow-[#C25E3E]/20 transition-colors">
              <span>Enter as Artisan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* 2. B2B BUYER CARD */}
        <div
          onClick={() => onSelectRole('buyer')}
          id="select-role-buyer-card"
          className="group relative cursor-pointer rounded-3xl bg-white border-2 border-stone-200 hover:border-slate-900 p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
        >
          {/* Top highlight pill */}
          <div className="flex items-center justify-between mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-900 border border-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Wholesale & Direct Sourcing
            </span>
            <span className="text-4xl" role="img" aria-label="B2B Buyer">🏢</span>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-[#C25E3E] transition-colors">
              B2B BUYER
            </h3>
            <p className="text-stone-600 text-base leading-relaxed">
              Discover artisan products and purchase in bulk
            </p>
            <p className="text-xs text-stone-400">
              Direct master artisan RFQs, wholesale quotations, verified GI-crafts, and zero middleman markups.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <Store className="w-4 h-4 text-slate-700" />
              <span>Bulk RFQs & Marketplace</span>
            </div>
            <button className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-2 group-hover:bg-slate-800 shadow-md transition-colors">
              <span>Enter as B2B Buyer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center text-xs text-stone-400 py-4 border-t border-stone-200/60 max-w-4xl mx-auto w-full">
        KalaConnect • Empowering Traditional Indian Artisans with Fair Digital Commerce
      </div>
    </div>
  );
};

