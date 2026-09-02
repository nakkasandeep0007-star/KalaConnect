import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Store, 
  Search, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Building, 
  Package, 
  MapPin, 
  SlidersHorizontal,
  IndianRupee,
  Eye,
  Check,
  X
} from 'lucide-react';
import { Product, B2BQuoteRequest, LanguageCode } from '../../types';
import { B2BMarketplacePage } from './B2BMarketplacePage';

interface CustomerPortalPageProps {
  products: Product[];
  b2bRequests: B2BQuoteRequest[];
  onOpenRequestQuote: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
  onBackToRoleSelection: () => void;
  onUpdateB2BRequestStatus?: (requestId: string, status: any, details?: any) => Promise<void> | void;
}

export const CustomerPortalPage: React.FC<CustomerPortalPageProps> = ({
  products,
  b2bRequests,
  onOpenRequestQuote,
  onSelectProduct,
  onBackToRoleSelection,
  onUpdateB2BRequestStatus,
}) => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 flex flex-col justify-between">
      {/* Buyer Portal Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToRoleSelection}
              id="buyer-back-role-btn"
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Back to Role Selection"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Role Selection</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C25E3E] to-[#9E3E20] text-white flex items-center justify-center font-bold text-lg">
                क
              </div>
              <div>
                <span className="font-bold text-base sm:text-lg font-serif text-slate-900">
                  Kala<span className="text-[#C25E3E]">Connect</span>
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Buyer & Procurement Portal
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Artisan Direct • Zero Middleman Markup</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        <B2BMarketplacePage
          products={products}
          b2bRequests={b2bRequests}
          onOpenRequestQuote={onOpenRequestQuote}
          onSelectProduct={onSelectProduct}
          setCurrentTab={() => {}}
          onUpdateB2BRequestStatus={onUpdateB2BRequestStatus}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-stone-500">
          KalaConnect B2B Marketplace • Direct Artisanal Procurement Platform
        </div>
      </footer>
    </div>
  );
};
