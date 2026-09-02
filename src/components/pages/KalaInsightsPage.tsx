import React from 'react';
import {
  TrendingUp,
  BadgeIndianRupee,
  ShoppingBag,
  Eye,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Award,
  Calendar,
  Layers
} from 'lucide-react';
import { InsightMetric, LanguageCode, PageTab, Product } from '../../types';
import { INSIGHTS_MONTHLY_DATA } from '../../data/mockData';
import { TRANSLATIONS } from '../../utils/translations';

interface KalaInsightsPageProps {
  products: Product[];
  currentLang: LanguageCode;
}

export const KalaInsightsPage: React.FC<KalaInsightsPageProps> = ({
  products,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const totalViews = products.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  const totalSales = products.reduce((acc, p) => acc + (p.salesCount || 0), 0);
  const totalRevenue = products.reduce((acc, p) => acc + (p.salesCount * p.actualPrice), 0);
  
  // Fair wage direct impact: estimated 42% extra income by bypassing commission agents
  const directArtisanSavings = Math.round(totalRevenue * 0.42);

  const maxRevenue = Math.max(...INSIGHTS_MONTHLY_DATA.map((d) => d.revenue));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                KalaInsights — Growth & Fair Wage Analytics
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900">
                Direct Earnings
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Track catalog performance, buyer views, revenue growth, and fair artisan wage impact.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-stone-100 text-xs font-semibold text-stone-700">
          <Calendar className="w-4 h-4 text-stone-500" />
          <span>Last 6 Months (Apr - Sep 2026)</span>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold text-stone-500">Total Revenue</span>
            <BadgeIndianRupee className="w-4 h-4 text-[#C25E3E]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-serif text-[#C25E3E]">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" /> +28% this month
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold text-stone-500">Orders Delivered</span>
            <ShoppingBag className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900">
            {totalSales} Units
          </p>
          <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-0.5">
            Across 14 cities
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-bold text-stone-500">Catalog Views</span>
            <Eye className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900">
            {totalViews}
          </p>
          <span className="text-[11px] font-bold text-amber-700">
            18% buyer conversion
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-bold">Fair Wage Gain</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold font-serif text-emerald-800">
            +₹{directArtisanSavings.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] font-bold text-emerald-700">
            Retained by bypassing middlemen
          </span>
        </div>

      </div>

      {/* Monthly Revenue Trend & Forecast Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              Monthly Revenue Growth & Festive Forecast (₹)
            </h2>
            <p className="text-xs text-stone-500">
              Direct-to-consumer and wholesale sales processed through KalaConnect
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="w-3 h-3 rounded-md bg-[#C25E3E]"></span> Revenue
            </span>
            <span className="flex items-center gap-1.5 text-stone-500 font-semibold">
              <span className="w-3 h-3 rounded-md bg-amber-400"></span> Orders
            </span>
          </div>
        </div>

        {/* Custom Responsive SVG / Bar Chart */}
        <div className="pt-4">
          <div className="grid grid-cols-6 gap-2 sm:gap-4 h-56 items-end border-b border-stone-200 pb-3">
            {INSIGHTS_MONTHLY_DATA.map((item, idx) => {
              const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
              const isProjected = item.month.includes('Proj');
              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] sm:text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{(item.revenue / 1000).toFixed(1)}k
                  </div>
                  
                  <div className="w-full max-w-[48px] relative flex flex-col justify-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 relative ${
                        isProjected
                          ? 'bg-gradient-to-t from-amber-400 to-amber-300 border-2 border-dashed border-amber-500'
                          : 'bg-gradient-to-t from-[#9E3E20] to-[#C25E3E] shadow-sm'
                      }`}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        {item.orders} orders
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] sm:text-xs font-bold truncate max-w-full ${
                    isProjected ? 'text-amber-700 font-extrabold' : 'text-stone-600'
                  }`}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Best-Performing Products Ranking */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 font-serif">
          Top Craft Bestsellers (सर्वाधिक बिकने वाले उत्पाद)
        </h2>

        <div className="space-y-3">
          {products.slice(0, 3).map((p, rank) => {
            const revenue = p.salesCount * p.actualPrice;
            return (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-stone-200 text-slate-900 flex items-center justify-center font-bold text-xs">
                    #{rank + 1}
                  </div>
                  <img
                    src={p.enhancedImage || p.originalImage}
                    alt={p.title}
                    className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                  />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-serif line-clamp-1">
                      {p.title}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      {p.craftType} • Unit: ₹{p.actualPrice}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-left sm:text-right">
                  <div>
                    <p className="text-stone-400 text-[10px]">Sales</p>
                    <p className="font-bold text-slate-800">{p.salesCount} sold</p>
                  </div>
                  <div>
                    <p className="text-stone-400 text-[10px]">Total Earned</p>
                    <p className="font-extrabold text-[#C25E3E] font-serif text-sm">
                      ₹{revenue.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
