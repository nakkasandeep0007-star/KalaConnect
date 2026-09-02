import React, { useState, useMemo } from 'react';
import { 
  Store, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  IndianRupee, 
  Package, 
  Boxes, 
  Truck, 
  MapPin, 
  Building2, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  Tag, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  X,
  Eye,
  Check,
  Ban
} from 'lucide-react';
import { Product, B2BQuoteRequest, LanguageCode, PageTab, ArtisanProfile } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { useAuth } from '../../context/AuthContext';

interface B2BMarketplacePageProps {
  products: Product[];
  b2bRequests: B2BQuoteRequest[];
  onOpenRequestQuote: (product: Product) => void;
  onOpenSendOffer?: (request: B2BQuoteRequest) => void;
  onOpenB2BListingModal?: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
  setCurrentTab: (tab: PageTab) => void;
  currentLang?: LanguageCode;
  artisan?: ArtisanProfile | null;
  onUpdateB2BRequestStatus?: (requestId: string, status: any, details?: any) => Promise<void> | void;
}

export const B2BMarketplacePage: React.FC<B2BMarketplacePageProps> = ({
  products,
  b2bRequests,
  onOpenRequestQuote,
  onOpenSendOffer,
  onOpenB2BListingModal,
  onSelectProduct,
  setCurrentTab,
  currentLang = 'en',
  artisan,
  onUpdateB2BRequestStatus,
}) => {
  const { role, user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'marketplace' | 'buyer_requests' | 'artisan_overview'>('marketplace');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCraft, setSelectedCraft] = useState<string>('All');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [maxMoq, setMaxMoq] = useState<number>(100);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Extract unique filter facets from products
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  const craftTypes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.craftType && set.add(p.craftType));
    return ['All', ...Array.from(set)];
  }, [products]);

  const materials = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.material) set.add(p.material);
      if (p.materials) p.materials.forEach((m) => set.add(m));
    });
    return ['All', ...Array.from(set).slice(0, 8)];
  }, [products]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const loc = p.originRegion || p.artisanLocation;
      if (loc) set.add(loc);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filter products for B2B wholesale marketplace
  // (Include all canonical published products listed for B2B)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Must be published and listed for B2B
      const isPublished = p.status === 'published' || p.status === undefined;
      const isB2B = p.publishedToB2B === true || p.isB2BListed === true || (p.wholesalePrice !== undefined && p.wholesalePrice > 0);
      if (!isPublished || !isB2B) return false;

      const titleMatch = (p.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      const catMatch = (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const craftMatch = (p.craftType || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matMatch = (p.materials || []).some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.material || '').toLowerCase().includes(searchQuery.toLowerCase());
      const locMatch = (p.originRegion || p.artisanLocation || '').toLowerCase().includes(searchQuery.toLowerCase());

      const queryMatches = !searchQuery || titleMatch || catMatch || craftMatch || matMatch || locMatch;
      if (!queryMatches) return false;

      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (selectedCraft !== 'All' && p.craftType !== selectedCraft) return false;
      if (selectedMaterial !== 'All') {
        const hasMat = (p.materials && p.materials.includes(selectedMaterial)) || p.material === selectedMaterial;
        if (!hasMat) return false;
      }
      if (selectedLocation !== 'All') {
        const loc = p.originRegion || p.artisanLocation || '';
        if (!loc.includes(selectedLocation)) return false;
      }

      const wholesalePrice = p.b2bWholesalePrice || p.wholesalePrice || p.actualPrice || p.suggestedPrice || 0;
      if (wholesalePrice > maxPrice) return false;

      const moq = p.b2bMOQ || p.wholesaleMOQ || p.moq || 1;
      if (moq > maxMoq) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedCraft, selectedMaterial, selectedLocation, maxPrice, maxMoq]);

  // Statistics for Artisan / Marketplace Overview
  const activeB2BListingsCount = products.filter(
    (p) => (p.status === 'published' || p.status === undefined) && (p.publishedToB2B === true || p.isB2BListed === true || (p.wholesalePrice && p.wholesalePrice > 0))
  ).length;
  const totalB2BRequestsCount = b2bRequests.length;
  const newB2BRequestsCount = b2bRequests.filter((r) => r.status === 'New').length;
  const offersSentCount = b2bRequests.filter((r) => r.status === 'Offer Sent').length;
  const acceptedDealsCount = b2bRequests.filter((r) => r.status === 'Accepted').length;

  const handleBuyerAcceptOffer = async (req: B2BQuoteRequest) => {
    if (onUpdateB2BRequestStatus) {
      await onUpdateB2BRequestStatus(req.id || req.requestId, 'Accepted');
    }
  };

  const handleBuyerRejectOffer = async (req: B2BQuoteRequest) => {
    if (onUpdateB2BRequestStatus) {
      await onUpdateB2BRequestStatus(req.id || req.requestId, 'Rejected', { rejectionReason: 'Declined by buyer' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="b2b-marketplace-page">
      
      {/* Top Banner & Mode Selector */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#C25E3E]/30 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C25E3E] text-white flex items-center gap-1.5 shadow-xs">
                <Store className="w-3.5 h-3.5" />
                B2B Wholesale Marketplace
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Direct-from-Artisan Sourcing
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-amber-100">
              Bulk Artisanal Commerce & Direct Quotations
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Connect retail chains, boutique curators, hotels, and corporate gifting buyers directly with verified Indian master artisans. Verified craft authenticity, fair wholesale rates, and transparent RFQs.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 bg-stone-800/80 p-1.5 rounded-2xl border border-stone-700/80 self-start md:self-auto backdrop-blur-xs flex-wrap">
            <button
              onClick={() => setActiveSubTab('marketplace')}
              id="subtab-browse-marketplace-btn"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'marketplace'
                  ? 'bg-[#C25E3E] text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Browse Marketplace ({filteredProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('buyer_requests')}
              id="subtab-buyer-requests-btn"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 relative ${
                activeSubTab === 'buyer_requests'
                  ? 'bg-[#C25E3E] text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Buyer RFQs & Quotes</span>
              {b2bRequests.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950">
                  {b2bRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('artisan_overview')}
              id="subtab-artisan-overview-btn"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeSubTab === 'artisan_overview'
                  ? 'bg-[#C25E3E] text-white shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>B2B Sales Stats</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-stone-800">
          <div className="bg-stone-800/60 p-3 rounded-2xl border border-stone-700/60">
            <p className="text-[11px] text-stone-400 font-medium">Active B2B Products</p>
            <p className="text-xl font-bold text-white mt-0.5">{activeB2BListingsCount} listings</p>
          </div>
          <div className="bg-stone-800/60 p-3 rounded-2xl border border-stone-700/60">
            <p className="text-[11px] text-stone-400 font-medium">B2B Quotation RFQs</p>
            <p className="text-xl font-bold text-amber-300 mt-0.5">{totalB2BRequestsCount} inquiries</p>
          </div>
          <div className="bg-stone-800/60 p-3 rounded-2xl border border-stone-700/60">
            <p className="text-[11px] text-stone-400 font-medium">Active Offers Sent</p>
            <p className="text-xl font-bold text-[#C25E3E] mt-0.5">{offersSentCount} live offers</p>
          </div>
          <div className="bg-stone-800/60 p-3 rounded-2xl border border-stone-700/60">
            <p className="text-[11px] text-stone-400 font-medium">Accepted Bulk Deals</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{acceptedDealsCount} completed</p>
          </div>
        </div>
      </div>

      {/* TAB 1: BROWSE MARKETPLACE */}
      {activeSubTab === 'marketplace' && (
        <div className="space-y-6">
          {/* Search & Quick Filter Bar */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search wholesale products, craft types, raw materials, or artisan locations..."
                  id="b2b-marketplace-search-input"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-sm font-medium text-slate-900 bg-stone-50/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                id="toggle-filters-btn"
                className="md:hidden px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-700 text-xs font-bold flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#C25E3E]" />
                <span>Filters & Facets</span>
              </button>

              {/* Category Pill Filters */}
              <div className="hidden md:flex items-center gap-1.5 overflow-x-auto pb-1 max-w-xl">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#C25E3E] text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Filter Selectors (Category, Craft, Material, Location, Price, MOQ) */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-stone-100 ${showMobileFilters ? 'block' : 'hidden md:grid'}`}>
              {/* Category Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-500 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  id="filter-category-select"
                  className="w-full text-xs py-2 px-2.5 rounded-xl border border-stone-300 bg-white font-medium text-slate-800 focus:border-[#C25E3E]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Craft Type Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-500 mb-1">Craft Type</label>
                <select
                  value={selectedCraft}
                  onChange={(e) => setSelectedCraft(e.target.value)}
                  id="filter-craft-select"
                  className="w-full text-xs py-2 px-2.5 rounded-xl border border-stone-300 bg-white font-medium text-slate-800 focus:border-[#C25E3E]"
                >
                  {craftTypes.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Material Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-500 mb-1">Material</label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  id="filter-material-select"
                  className="w-full text-xs py-2 px-2.5 rounded-xl border border-stone-300 bg-white font-medium text-slate-800 focus:border-[#C25E3E]"
                >
                  {materials.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-500 mb-1">Origin Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  id="filter-location-select"
                  className="w-full text-xs py-2 px-2.5 rounded-xl border border-stone-300 bg-white font-medium text-slate-800 focus:border-[#C25E3E]"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Max Price Filter */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase text-stone-500">Max Wholesale ₹</label>
                  <span className="text-[11px] font-bold text-slate-900">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="15000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  id="filter-price-slider"
                  className="w-full accent-[#C25E3E] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Max MOQ Filter */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase text-stone-500">Max MOQ</label>
                  <span className="text-[11px] font-bold text-slate-900">{maxMoq} units</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="5"
                  value={maxMoq}
                  onChange={(e) => setMaxMoq(Number(e.target.value))}
                  id="filter-moq-slider"
                  className="w-full accent-[#C25E3E] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-stone-200 p-12 text-center max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#C25E3E] flex items-center justify-center mx-auto">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No wholesale listings match your filters</h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Try resetting your search query, price bounds, or location parameters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedCraft('All');
                  setSelectedMaterial('All');
                  setSelectedLocation('All');
                  setMaxPrice(10000);
                  setMaxMoq(100);
                }}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => {
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
                    id={`b2b-product-card-${prod.id}`}
                  >
                    <div>
                      {/* Image Header with Wholesale Badges */}
                      <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                        <img
                          src={prod.enhancedImage || prod.originalImage}
                          alt={prod.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Top Left: GI / Craft Badge */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/40 shadow-xs">
                            {prod.craftType || 'Authentic Craft'}
                          </span>
                        </div>

                        {/* Top Right: Wholesale Discount Badge */}
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

                      {/* Content Details */}
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

                        {/* Materials Tag */}
                        {prod.materials && prod.materials.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-stone-400 font-semibold">Materials:</span>
                            {prod.materials.slice(0, 3).map((m) => (
                              <span key={m} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-700">
                                {m}
                              </span>
                            ))}
                          </div>
                        )}

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

                        {/* Buyer types tags */}
                        {prod.b2bBuyerTypes && prod.b2bBuyerTypes.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {prod.b2bBuyerTypes.map((b) => (
                              <span key={b} className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-stone-100 text-stone-600">
                                • {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-4 pt-0 flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onSelectProduct) onSelectProduct(prod);
                        }}
                        className="p-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Check if current user is the artisan who owns this product */}
                      {(() => {
                        const isOwnProduct =
                          role === 'artisan' &&
                          ((artisan?.id && prod.userId === artisan.id) ||
                            (artisan?.name && prod.artisanName === artisan.name) ||
                            (user?.uid && prod.userId === user.uid));

                        if (isOwnProduct) {
                          return (
                            <div className="flex-1 flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                Your Listing
                              </span>
                              <button
                                onClick={() => setActiveSubTab('buyer_requests')}
                                id={`view-buyer-requests-btn-${prod.id}`}
                                className="flex-1 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>View Buyer Requests</span>
                              </button>
                            </div>
                          );
                        }

                        return (
                          /* Request Quote Button for Buyers and external visitors */
                          <button
                            onClick={() => onOpenRequestQuote(prod)}
                            id={`request-quote-btn-${prod.id}`}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C25E3E] to-[#9E3E20] hover:from-[#B14E2E] hover:to-[#8E2E10] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Request Quote</span>
                          </button>
                        );
                      })()}

                      {/* Artisan Configure B2B Action (Hidden for buyers) */}
                      {role !== 'buyer' && onOpenB2BListingModal && (
                        <button
                          onClick={() => onOpenB2BListingModal(prod)}
                          className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#C25E3E] border border-amber-200 text-xs font-bold transition-colors"
                          title="Configure Wholesale Listing Terms"
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BUYER RFQs & RECEIVED QUOTES */}
      {activeSubTab === 'buyer_requests' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-serif">
                  B2B Quotation Requests & Artisan Offers
                </h2>
                <p className="text-xs text-stone-500">
                  Track bulk order negotiation with master artisans across India
                </p>
              </div>

              <button
                onClick={() => setActiveSubTab('marketplace')}
                className="px-4 py-2 rounded-xl bg-[#C25E3E] text-white text-xs font-bold hover:bg-[#A94B2E] transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
              >
                <Store className="w-4 h-4" />
                <span>+ Request New Quotation</span>
              </button>
            </div>

            {b2bRequests.length === 0 ? (
              <div className="py-12 text-center max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">No Quotation Requests Yet</h3>
                <p className="text-xs text-stone-500">
                  Browse products in the marketplace and click &quot;Request Quote&quot; to begin direct bulk inquiries with artisans.
                </p>
                <button
                  onClick={() => setActiveSubTab('marketplace')}
                  className="px-4 py-2 rounded-xl bg-[#C25E3E] text-white text-xs font-bold"
                >
                  Explore Wholesale Catalog
                </button>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 mt-4 space-y-4">
                {b2bRequests.map((req) => {
                  const isOfferSent = req.status === 'Offer Sent';
                  const isAccepted = req.status === 'Accepted';
                  const isRejected = req.status === 'Rejected';

                  return (
                    <div
                      key={req.id || req.requestId}
                      className="pt-4 first:pt-0 bg-stone-50/70 p-4 sm:p-5 rounded-2xl border border-stone-200/80 space-y-4"
                      id={`b2b-rfq-item-${req.id || req.requestId}`}
                    >
                      {/* Top status & header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-stone-500 font-mono">
                            RFQ #{req.requestId || req.id}
                          </span>
                          <span className="text-stone-300">•</span>
                          <span className="text-xs text-stone-600">
                            {new Date(req.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {req.status === 'New' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              Status: New RFQ
                            </span>
                          )}
                          {req.status === 'Viewed' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Status: Viewed by Artisan
                            </span>
                          )}
                          {req.status === 'Offer Sent' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 animate-pulse">
                              Status: Offer Sent by Artisan
                            </span>
                          )}
                          {req.status === 'Accepted' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Status: Deal Accepted
                            </span>
                          )}
                          {req.status === 'Rejected' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              Status: Request Declined
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Request and Product Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-3.5 rounded-xl border border-stone-200 text-xs">
                        {/* Product Info */}
                        <div className="flex items-center gap-3">
                          {req.productImage && (
                            <img
                              src={req.productImage}
                              alt={req.productName}
                              className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-[#C25E3E] uppercase">{req.craftType || req.category}</p>
                            <h4 className="font-bold text-slate-900 truncate">{req.productName}</h4>
                            <p className="text-stone-500 text-[11px]">
                              Artisan: <strong>{req.artisanName || 'Master Artisan'}</strong> ({req.artisanLocation || 'Jaipur'})
                            </p>
                          </div>
                        </div>

                        {/* Request Terms */}
                        <div className="space-y-1">
                          <p className="text-stone-500 font-medium">Buyer Requirements:</p>
                          <p className="text-slate-800 font-bold">
                            {req.quantity} units @ ₹{req.targetPrice}/unit
                          </p>
                          <p className="text-stone-600 text-[11px]">
                            Delivery: <strong>{req.deliveryLocation}</strong>
                          </p>
                          <p className="text-stone-500 text-[11px]">
                            Required By: {req.requiredBy}
                          </p>
                        </div>

                        {/* Buyer Info & Message */}
                        <div className="space-y-1">
                          <p className="text-stone-500 font-medium">Buyer Organization:</p>
                          <p className="text-slate-900 font-bold">{req.buyerOrg || req.buyerName}</p>
                          <p className="text-stone-600 italic line-clamp-2">&quot;{req.message}&quot;</p>
                        </div>
                      </div>

                      {/* Artisan Offer Box if Offer Sent */}
                      {isOfferSent && (
                        <div className="bg-purple-50/90 border border-purple-200 p-4 rounded-xl space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-purple-700" />
                              <span className="font-bold text-purple-950 text-xs">
                                Artisan Counter-Offer Received:
                              </span>
                            </div>
                            <span className="text-[11px] text-purple-700">
                              Offered {req.offeredAt ? new Date(req.offeredAt).toLocaleDateString() : 'recently'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-purple-100 text-xs">
                            <div>
                              <p className="text-[10px] text-stone-500">Offered Price</p>
                              <p className="text-sm font-extrabold text-purple-900 font-serif">
                                ₹{req.offeredPrice}/unit
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-stone-500">Lead Time</p>
                              <p className="text-sm font-bold text-slate-800">
                                {req.offeredDeliveryDays || 7} working days
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-stone-500">Total Order Value</p>
                              <p className="text-sm font-bold text-emerald-700 font-serif">
                                ₹{((req.offeredPrice || req.targetPrice) * req.quantity).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>

                          {req.artisanOfferMessage && (
                            <p className="text-xs text-purple-900 italic bg-white/60 p-2.5 rounded-lg border border-purple-100">
                              &quot;{req.artisanOfferMessage}&quot;
                            </p>
                          )}

                          {/* Buyer Actions for Offer */}
                          <div className="flex items-center justify-end gap-3 pt-1">
                            <button
                              onClick={() => handleBuyerRejectOffer(req)}
                              id={`reject-offer-${req.id || req.requestId}`}
                              className="px-4 py-2 rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold transition-colors"
                            >
                              Decline Offer
                            </button>
                            <button
                              onClick={() => handleBuyerAcceptOffer(req)}
                              id={`accept-offer-${req.id || req.requestId}`}
                              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                            >
                              <Check className="w-4 h-4" />
                              <span>Accept Offer & Proceed</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Artisan Controls on this page for testing convenience */}
                      {onOpenSendOffer && !isAccepted && !isRejected && (
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            onClick={() => onOpenSendOffer(req)}
                            id={`send-offer-action-btn-${req.id || req.requestId}`}
                            className="px-4 py-2 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isOfferSent ? 'Update Offer' : 'Send Offer as Artisan'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ARTISAN B2B OVERVIEW */}
      {activeSubTab === 'artisan_overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Col: B2B Overview & Benefits */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Artisan B2B Wholesale Pipeline
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Wholesale enables predictable recurring revenue without packaging individual single-retail parcels. By setting clear MOQs and wholesale lead times, corporate buyers and boutique curators can place bulk orders directly with you.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-[#C25E3E]" />
                      <span>Zero Intermediary Commissions</span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      You receive 100% of the agreed unit wholesale price directly to your Pehchan UPI/Bank account.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>GI Tag & CraftMark Trust</span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      Wholesale buyers filter for verified regional craftsmanship to stock in luxury airport lounges and boutique chains.
                    </p>
                  </div>
                </div>
              </div>

              {/* Your B2B Listed Products */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    Your Current B2B Catalog ({activeB2BListingsCount})
                  </h3>
                  <button
                    onClick={() => setCurrentTab('catalog')}
                    className="text-xs font-bold text-[#C25E3E] hover:underline"
                  >
                    Manage in My Catalog &rarr;
                  </button>
                </div>

                <div className="divide-y divide-stone-100">
                  {products.filter((p) => p.isB2BListed || p.wholesalePrice).map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.enhancedImage || p.originalImage}
                          alt={p.title}
                          className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 truncate max-w-xs">{p.title}</p>
                          <p className="text-stone-500 text-[11px]">
                            Wholesale: <strong className="text-[#C25E3E]">₹{p.b2bWholesalePrice || p.wholesalePrice}</strong> • MOQ: <strong>{p.b2bMOQ || p.wholesaleMOQ || 5} pcs</strong>
                          </p>
                        </div>
                      </div>

                      {onOpenB2BListingModal && (
                        <button
                          onClick={() => onOpenB2BListingModal(p)}
                          className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 font-bold text-stone-700"
                        >
                          Edit B2B
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Quick Actions & Help */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-amber-500/10 to-[#C25E3E]/10 rounded-3xl p-6 border border-[#C25E3E]/20 space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-[#C25E3E] text-white flex items-center justify-center shadow-md">
                  <Package className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Want to list more items for B2B?
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Go to <strong>My Catalog</strong>, find any existing product, and click <strong>[ List for B2B ]</strong> to set wholesale prices and minimum order limits.
                </p>
                <button
                  onClick={() => setCurrentTab('catalog')}
                  className="w-full py-2.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Open My Catalog
                </button>
              </div>

              <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl space-y-3">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Upcoming Buyer Inquiries
                </p>
                <p className="text-xs text-stone-300">
                  You have <strong>{newB2BRequestsCount} new quotation requests</strong> pending response. Fast responses within 24 hours increase deal conversion by 70%.
                </p>
                <button
                  onClick={() => setActiveSubTab('buyer_requests')}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                >
                  View RFQ Inquiries
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
