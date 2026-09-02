import React, { useState } from 'react';
import {
  Store,
  Building2,
  Search,
  Filter,
  ShieldCheck,
  Package,
  MessageSquare,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Volume2
} from 'lucide-react';
import { BuyerInquiry, LanguageCode, PageTab, Product } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { speakText } from '../../utils/audioSpeech';

interface KalaMarketPageProps {
  products: Product[];
  inquiries: BuyerInquiry[];
  setInquiries: React.Dispatch<React.SetStateAction<BuyerInquiry[]>>;
  setSelectedInquiry: (inquiry: BuyerInquiry | null) => void;
  setCurrentTab: (tab: PageTab) => void;
  currentLang: LanguageCode;
}

export const KalaMarketPage: React.FC<KalaMarketPageProps> = ({
  products,
  inquiries,
  setInquiries,
  setSelectedInquiry,
  setCurrentTab,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [activeTab, setActiveTab] = useState<'listings' | 'inquiries'>('inquiries');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inquirySearch, setInquirySearch] = useState<string>('');

  const publishedProducts = products.filter((p) => p.status === 'published');

  const filteredInquiries = inquiries.filter((inq) => {
    return (
      inq.buyerName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.buyerOrg.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.productName.toLowerCase().includes(inquirySearch.toLowerCase())
    );
  });

  const updateInquiryStatus = (id: string, status: 'accepted' | 'declined' | 'negotiating') => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                KalaMarket — B2B & Wholesale Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                ONDC & TRIFED Syndicated
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Connecting traditional craftspeople with verified retail chains, export houses, and government portals.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'inquiries'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-stone-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Buyer Inquiries ({inquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'listings'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-stone-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>B2B Live Showcase</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Buyer Inquiries (Wholesale Leads) */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">
                Direct Buyer Requests for Your Handicrafts
              </h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                placeholder="Search buyer or company..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-300 text-xs focus:border-[#C25E3E] outline-hidden bg-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredInquiries.map((inq) => {
              const statusColors = {
                new: 'bg-amber-100 text-amber-900 border-amber-300',
                negotiating: 'bg-indigo-100 text-indigo-900 border-indigo-300',
                accepted: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                declined: 'bg-stone-100 text-stone-700 border-stone-300',
              }[inq.status];

              const totalOrderValue = inq.quantityRequested * inq.offerPricePerUnit;

              return (
                <div
                  key={inq.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs hover:shadow-md transition-shadow space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    <div className="flex items-center gap-3">
                      <img
                        src={inq.productImage}
                        alt={inq.productName}
                        className="w-14 h-14 rounded-2xl object-cover border border-stone-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 font-serif">
                            {inq.buyerOrg}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600">
                            {inq.buyerType}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          Contact: <strong>{inq.buyerName}</strong> • {inq.buyerLocation}
                        </p>
                        <p className="text-xs font-semibold text-[#C25E3E] mt-0.5">
                          Target Craft: {inq.productName}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors}`}>
                        {inq.status.toUpperCase()}
                      </span>
                      <p className="text-base font-extrabold text-slate-900 font-serif mt-1">
                        ₹{totalOrderValue.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {inq.quantityRequested} units @ ₹{inq.offerPricePerUnit}/unit
                      </p>
                    </div>

                  </div>

                  {/* Message Body */}
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed">
                    "{inq.message}"
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100">
                    <span className="text-[11px] text-stone-400">
                      Received on {inq.receivedDate}
                    </span>

                    <div className="flex items-center gap-2">
                      {inq.status !== 'accepted' && (
                        <button
                          onClick={() => updateInquiryStatus(inq.id, 'accepted')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                        >
                          Accept Bulk Order (स्वीकार करें)
                        </button>
                      )}

                      {inq.status !== 'negotiating' && inq.status !== 'accepted' && (
                        <button
                          onClick={() => updateInquiryStatus(inq.id, 'negotiating')}
                          className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition-colors"
                        >
                          Negotiate Price
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedInquiry(inq)}
                        className="px-3.5 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold"
                      >
                        View Full Thread
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Live B2B Wholesale Showcase */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C25E3E]" />
              <span className="font-bold text-amber-900">
                Your listings are visible to 1,400+ verified corporate gift buyers, export buyers, and ONDC channels.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-stone-600">Zero Middlemen Commission</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {publishedProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-stone-100">
                    <img
                      src={p.enhancedImage || p.originalImage}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      MOQ: {p.wholesaleMOQ} Units
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 bg-[#C25E3E] text-white font-extrabold text-xs px-2.5 py-1 rounded-lg">
                      ₹{p.wholesalePrice} / Wholesale
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <span className="text-[10px] font-bold text-[#C25E3E] uppercase tracking-wider">
                      {p.craftType}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 font-serif">
                      {p.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2">
                      {p.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between text-xs mt-2">
                  <span className="text-stone-500">
                    Retail Price: <strong>₹{p.actualPrice}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                    Instant Delivery Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
