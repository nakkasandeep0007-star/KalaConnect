import React, { useState } from 'react';
import {
  Building2,
  Store,
  FileText,
  MessageSquare,
  Search,
  SlidersHorizontal,
  IndianRupee,
  Package,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Send,
  CheckCircle2,
  Clock,
  Eye,
  Tag,
  MapPin,
  Truck,
  Check,
  AlertCircle
} from 'lucide-react';
import { BuyerProfile, Product, B2BQuoteRequest, LanguageCode, PageTab } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';

interface BuyerDashboardPageProps {
  buyerProfile: BuyerProfile | null;
  products: Product[];
  b2bRequests: B2BQuoteRequest[];
  setCurrentTab: (tab: PageTab) => void;
  onOpenRequestQuote: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  currentLang?: LanguageCode;
  onUpdateB2BRequestStatus?: (requestId: string, status: any, details?: any) => Promise<void> | void;
}

export const BuyerDashboardPage: React.FC<BuyerDashboardPageProps> = ({
  buyerProfile,
  products,
  b2bRequests,
  setCurrentTab,
  onOpenRequestQuote,
  onSelectProduct,
  currentLang = 'en',
  onUpdateB2BRequestStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter quotation requests specific to this buyer
  const buyerRequests = b2bRequests.filter(
    (r) =>
      !buyerProfile?.id ||
      r.buyerId === buyerProfile.id ||
      r.buyerOrg === buyerProfile.businessName ||
      r.buyerName === buyerProfile.contactPerson
  );

  const activeRFQsCount = buyerRequests.filter((r) => r.status === 'New' || r.status === 'Viewed').length;
  const offersReceivedCount = buyerRequests.filter((r) => r.status === 'Offer Sent').length;
  const completedDealsCount = buyerRequests.filter((r) => r.status === 'Accepted').length;

  // Filter products for quick showcase
  const wholesaleProducts = products.filter(
    (p) => p.isB2BListed || (p.wholesalePrice && p.wholesalePrice > 0)
  );

  const filteredFeaturedProducts = wholesaleProducts.filter((p) => {
    const titleMatch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const craftMatch = (p.craftType || '').toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = selectedCategory === 'All' || p.category === selectedCategory;
    return (titleMatch || craftMatch) && categoryMatch;
  });

  const categories = ['All', 'Home Decor & Pottery', 'Kitchenware & Living', 'Handloom & Textiles', 'Metalcraft & Dhokra'];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200" id="buyer-dashboard-view">
      
      {/* 1. Buyer Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#C25E3E]/30 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C25E3E] text-white flex items-center gap-1.5 shadow-xs">
                <Building2 className="w-3.5 h-3.5" />
                B2B Wholesale Sourcing Hub
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-amber-300 border border-white/15 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Artisan Sourcing
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight text-white">
              Welcome, {buyerProfile?.contactPerson || 'Wholesale Buyer'}!
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed font-sans">
              <strong className="text-amber-200">{buyerProfile?.businessName || 'Your Organization'}</strong> • {buyerProfile?.businessType || 'Retailer & Wholesale Partner'} ({buyerProfile?.cityState || 'India'}). Source authentic GI-tagged handcrafted goods directly from master artisans with transparent pricing.
            </p>

            {/* Quick Sourcing Search Input */}
            <div className="pt-2">
              <div className="relative max-w-lg">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by craft, material (e.g. Terracotta, Blue Pottery)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="buyer-quick-search-input"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md text-white placeholder-stone-400 text-xs sm:text-sm border border-white/20 focus:outline-hidden focus:ring-2 focus:ring-[#C25E3E] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Sourcing Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2 text-stone-300 text-xs font-medium">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Active RFQs</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1 font-serif">{activeRFQsCount}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl">
              <div className="flex items-center gap-2 text-stone-300 text-xs font-medium">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Offers Received</span>
              </div>
              <p className="text-2xl font-bold text-amber-300 mt-1 font-serif">{offersReceivedCount}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-stone-300 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Deals Closed</span>
              </div>
              <p className="text-2xl font-bold text-emerald-300 mt-1 font-serif">{completedDealsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setCurrentTab('b2b-marketplace')}
          id="buyer-explore-marketplace-btn"
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-[#C25E3E] hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#C25E3E] flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#C25E3E] group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Browse Wholesale Catalog</h3>
          <p className="text-xs text-stone-500 mt-0.5">Explore {wholesaleProducts.length} verified artisan products with MOQ & bulk pricing</p>
        </button>

        <button
          onClick={() => setCurrentTab('requests')}
          id="buyer-view-rfqs-btn"
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-[#C25E3E] hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-blue-700 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">My Quotation Requests</h3>
          <p className="text-xs text-stone-500 mt-0.5">Track {buyerRequests.length} active wholesale RFQs, quotes and artisan counter-offers</p>
        </button>

        <button
          onClick={() => setCurrentTab('messages')}
          id="buyer-messages-btn"
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-[#C25E3E] hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-purple-700 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Artisan Direct Chat</h3>
          <p className="text-xs text-stone-500 mt-0.5">Discuss custom bulk specifications and logistics with master craftsmen</p>
        </button>
      </div>

      {/* 3. Featured Wholesale Listings Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C25E3E]" />
              <span>Direct Wholesale Catalog</span>
            </h2>
            <p className="text-xs text-stone-500">
              Browse master artisan handmade goods ready for bulk procurement and quotation requests
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#C25E3E] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeaturedProducts.slice(0, 6).map((prod) => {
            const retailPrice = prod.actualPrice || prod.suggestedPrice || 0;
            const wholesalePrice = prod.b2bWholesalePrice || prod.wholesalePrice || Math.round(retailPrice * 0.75);
            const moq = prod.b2bMOQ || prod.wholesaleMOQ || 5;
            const stock = prod.b2bStock || prod.inventory || 15;
            const deliveryDays = prod.b2bDeliveryDays || 7;
            const marginDiscount = retailPrice > 0 
              ? Math.round(((retailPrice - wholesalePrice) / retailPrice) * 100)
              : 0;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                id={`buyer-featured-product-${prod.id}`}
              >
                <div>
                  {/* Product Image Header */}
                  <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                    <img
                      src={prod.enhancedImage || prod.originalImage}
                      alt={prod.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Craft Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/40 shadow-xs">
                        {prod.craftType || 'Authentic Craft'}
                      </span>
                    </div>

                    {/* Wholesale Discount Badge */}
                    {marginDiscount > 0 && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#C25E3E] text-white shadow-md">
                        {marginDiscount}% Bulk Off
                      </div>
                    )}

                    {/* Bottom Bar on Image: Artisan & Location */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-semibold truncate">{prod.artisanName || 'Master Artisan'}</span>
                      </div>
                      <span className="text-[11px] text-stone-300 shrink-0 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-300" />
                        {prod.originRegion || prod.artisanLocation || 'Jaipur'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#C25E3E]">
                        {prod.category}
                      </p>
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-[#C25E3E] transition-colors mt-0.5">
                        {prod.title}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                        {prod.b2bDescription || prod.description}
                      </p>
                    </div>

                    {/* Key Wholesale Specs Box */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-center">
                      <div>
                        <p className="text-[10px] text-stone-500 font-medium">Wholesale</p>
                        <p className="text-sm font-extrabold text-[#C25E3E] font-serif">
                          ₹{wholesalePrice}
                        </p>
                        <span className="text-[9px] text-stone-400 line-through">₹{retailPrice}</span>
                      </div>
                      <div className="border-x border-amber-200/80">
                        <p className="text-[10px] text-stone-500 font-medium">MOQ</p>
                        <p className="text-sm font-bold text-slate-900">
                          {moq} pcs
                        </p>
                        <span className="text-[9px] text-stone-500">Min. order</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone-500 font-medium">Stock / Lead</p>
                        <p className="text-sm font-bold text-slate-900">
                          {stock} units
                        </p>
                        <span className="text-[9px] text-stone-500">{deliveryDays}d dispatch</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => onSelectProduct(prod)}
                    className="p-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenRequestQuote(prod)}
                    id={`buyer-request-quote-btn-${prod.id}`}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C25E3E] to-[#9E3E20] hover:from-[#B14E2E] hover:to-[#8E2E10] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Request Quote</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center pt-2">
          <button
            onClick={() => setCurrentTab('b2b-marketplace')}
            className="px-6 py-3 rounded-2xl bg-white hover:bg-stone-50 text-slate-900 border border-stone-200 text-xs font-bold shadow-xs transition-all inline-flex items-center gap-2"
          >
            <span>Explore All {wholesaleProducts.length} Wholesale Listings in Marketplace</span>
            <ArrowRight className="w-4 h-4 text-[#C25E3E]" />
          </button>
        </div>
      </div>

      {/* 4. Recent Quotation Requests Preview */}
      {buyerRequests.length > 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">Recent Quotation Requests</h3>
              <p className="text-xs text-stone-500">Track status of your bulk orders and responses from artisans</p>
            </div>
            <button
              onClick={() => setCurrentTab('requests')}
              className="text-xs font-bold text-[#C25E3E] hover:underline flex items-center gap-1"
            >
              <span>View All ({buyerRequests.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {buyerRequests.slice(0, 3).map((req) => (
              <div
                key={req.id || req.requestId}
                className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  {req.productImage && (
                    <img
                      src={req.productImage}
                      alt={req.productName}
                      className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{req.productName}</h4>
                    <p className="text-stone-500 text-xs">
                      Artisan: <strong className="text-slate-800">{req.artisanName || 'Master Artisan'}</strong> • Quantity: <strong className="text-slate-800">{req.quantity} pcs</strong> • Target: <strong className="text-[#C25E3E]">₹{req.targetPrice}/unit</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {req.status === 'New' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Status: New
                    </span>
                  )}
                  {req.status === 'Viewed' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Status: Viewed
                    </span>
                  )}
                  {req.status === 'Offer Sent' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      Offer Received: ₹{req.offeredPrice}/unit
                    </span>
                  )}
                  {req.status === 'Accepted' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Deal Accepted
                    </span>
                  )}
                  {req.status === 'Rejected' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Declined
                    </span>
                  )}

                  <button
                    onClick={() => setCurrentTab('requests')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-bold"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
