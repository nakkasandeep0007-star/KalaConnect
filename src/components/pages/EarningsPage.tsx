import React, { useState } from 'react';
import {
  BadgeIndianRupee,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  QrCode,
  Download,
  Calendar,
} from 'lucide-react';
import { CustomOrder, LanguageCode, PageTab, Product } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { useAuth } from '../../context/AuthContext';

interface EarningsPageProps {
  orders: CustomOrder[];
  products: Product[];
  currentLang: LanguageCode;
  setCurrentTab: (tab: PageTab) => void;
}

export const EarningsPage: React.FC<EarningsPageProps> = ({
  orders,
  products,
  currentLang,
  setCurrentTab,
}) => {
  const { artisan, updateProfileData } = useAuth();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [upiId, setUpiId] = useState(artisan?.upiId || 'rameshwar.craft@okhdfcbank');
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Calculate order milestone earnings
  let totalOrderEarnings = 0;
  let pendingMilestoneEarnings = 0;

  orders.forEach((o) => {
    o.paymentMilestones.forEach((m) => {
      if (m.status === 'paid') {
        totalOrderEarnings += m.amount;
      } else {
        pendingMilestoneEarnings += m.amount;
      }
    });
  });

  const catalogSalesRevenue = products.reduce(
    (acc, p) => acc + (p.salesCount || 0) * (p.actualPrice || p.suggestedPrice || 0),
    0
  );

  const totalGrossEarnings = totalOrderEarnings + catalogSalesRevenue + (artisan?.totalEarnings || 0);

  const handleSaveUpi = async () => {
    try {
      await updateProfileData({ upiId: upiId.trim() });
      setSaveSuccess(true);
      setIsEditingBank(false);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Error saving UPI:', err);
    }
  };

  const payoutHistory = [
    { id: 'tx-1', date: '2026-08-30', amount: 5400, desc: 'Commission Milestone: 4 Heritage Clay Planters', status: 'Credited' },
    { id: 'tx-2', date: '2026-08-28', amount: 3600, desc: 'Advance Token: Order KC-2026-881', status: 'Credited' },
    { id: 'tx-3', date: '2026-08-22', amount: 16500, desc: 'Direct Marketplace Sales Payout (10 Vase units)', status: 'Credited' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <BadgeIndianRupee className="w-3.5 h-3.5" />
              Direct Artisan Bank Payouts
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Zero Platform Commission
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-serif">
            Earnings & Payouts
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-xl">
            Track your fair artisan wages, completed commission milestones, and direct-to-bank UPI disbursements.
          </p>
        </div>

        <button
          onClick={() => alert('Downloading official GST/Fair Trade Earnings Statement for the current fiscal period.')}
          className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center gap-2 transition-colors self-start sm:self-auto shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Statement (PDF)</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#2D1B16] via-[#3D251E] to-[#1E232E] text-white shadow-lg space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E07A5F]">Total Gross Earnings</span>
          <div className="text-3xl sm:text-4xl font-bold font-serif text-white">
            ₹{totalGrossEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-stone-400">
            100% credited to your linked verified bank account
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending Milestone Escrow</span>
          <div className="text-3xl sm:text-4xl font-bold font-serif text-slate-900">
            ₹{pendingMilestoneEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-stone-500">
            To be unlocked upon completing active workshop stages
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Catalog Sales Revenue</span>
          <div className="text-3xl sm:text-4xl font-bold font-serif text-slate-900">
            ₹{catalogSalesRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-stone-500">
            From {products.reduce((a, b) => a + (b.salesCount || 0), 0)} verified handicraft unit sales
          </p>
        </div>

      </div>

      {/* Linked Bank & UPI Information */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Direct Payout Account</h3>
              <p className="text-xs text-stone-500">Instant settlements via National Unified Payments Interface (UPI)</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingBank(!isEditingBank)}
            className="text-xs font-bold text-[#C25E3E] hover:underline"
          >
            {isEditingBank ? 'Cancel' : 'Change UPI'}
          </button>
        </div>

        {isEditingBank ? (
          <div className="flex items-center gap-3 max-w-md">
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. name@upi"
              className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#C25E3E]"
            />
            <button
              onClick={handleSaveUpi}
              className="px-4 py-2 rounded-xl bg-[#C25E3E] text-white text-xs font-bold hover:bg-[#a94e32]"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <QrCode className="w-5 h-5 text-stone-600" />
              <div>
                <span className="text-xs text-stone-400 block font-medium">Registered UPI VPA</span>
                <span className="text-sm font-bold text-slate-900">{upiId}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified & Active</span>
            </div>
          </div>
        )}
      </div>

      {/* Recent Payout Disbursements */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Recent Disbursements</h3>
        
        <div className="divide-y divide-stone-100">
          {payoutHistory.map((tx) => (
            <div key={tx.id} className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{tx.desc}</p>
                <p className="text-[11px] text-stone-400">{tx.date}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-700 font-serif block">
                  +₹{tx.amount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-bold text-emerald-600">✓ {tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
