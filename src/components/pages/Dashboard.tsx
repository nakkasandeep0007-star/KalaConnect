import React from 'react';
import {
  PlusCircle,
  Camera,
  Mic,
  Sparkles,
  BadgeIndianRupee,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Volume2,
  ChevronRight,
  Eye,
  FolderHeart,
  FileText,
  Inbox,
  MessageSquare,
  Package,
  Store,
} from 'lucide-react';
import {
  ArtisanProfile,
  Conversation,
  CustomOrder,
  CustomerRequest,
  LanguageCode,
  PageTab,
  PreviousWork,
  Product,
} from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { speakText } from '../../utils/audioSpeech';

interface DashboardProps {
  artisan: ArtisanProfile;
  products: Product[];
  previousWorks: PreviousWork[];
  requests: CustomerRequest[];
  orders: CustomOrder[];
  conversations: Conversation[];
  setCurrentTab: (tab: PageTab) => void;
  setSelectedProduct: (product: Product | null) => void;
  currentLang: LanguageCode;
}

export const Dashboard: React.FC<DashboardProps> = ({
  artisan,
  products,
  previousWorks,
  requests,
  orders,
  conversations,
  setCurrentTab,
  setSelectedProduct,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const totalProducts = products.length;
  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'delivered');
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  let totalRevenue = artisan.totalEarnings || 0;
  orders.forEach((o) => {
    o.paymentMilestones.forEach((m) => {
      if (m.status === 'paid') totalRevenue += m.amount;
    });
  });
  products.forEach((p) => {
    totalRevenue += (p.salesCount || 0) * (p.actualPrice || p.suggestedPrice || 0);
  });

  const playDashboardSpeech = () => {
    const text =
      currentLang === 'hi'
        ? `नमस्ते ${artisan.name} जी। आपके पास ${totalProducts} उत्पाद सूचीबद्ध हैं, और ${pendingRequests.length} नए ग्राहक अनुरोध समीक्षा के लिए लंबित हैं। नया उत्पाद जोड़ने के लिए '+ Add New Product' बटन दबाएं।`
        : `Welcome back, ${artisan.name}. You have ${totalProducts} products in catalog, ${activeOrders.length} active custom orders, and ${pendingRequests.length} pending customer requests.`;
    speakText(text, currentLang);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      
      {/* Top Welcome & Most Prominent CTA Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2D1B16] via-[#3D251E] to-[#1E232E] text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-stone-800">
        
        {/* Glow accents */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#C25E3E]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E07A5F]/20 text-[#E07A5F] border border-[#E07A5F]/30">
                {artisan.craftType}
              </span>
              <span className="text-xs text-stone-400">
                📍 {artisan.location}, {artisan.state}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight font-serif text-white">
              {currentLang === 'hi' ? `नमस्ते, ${artisan.name}` : `Welcome back, ${artisan.name}`}
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
              {currentLang === 'hi'
                ? 'कला कनेक्ट में आपका स्वागत है। अपनी पारंपरिक हस्तकला का पोर्टफोलियो दिखाएं, नए उत्पाद जोड़ें और ग्राहकों से सीधे ऑर्डर प्राप्त करें।'
                : 'Showcase your heritage craft, manage your verified product catalog, and collaborate with buyers on custom commissions.'}
            </p>
          </div>

          {/* Prominent High-Impact Add Product Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentTab('add-product')}
              id="dashboard-main-add-product-cta"
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-extrabold text-sm sm:text-base flex items-center gap-3 shadow-xl shadow-[#C25E3E]/30 transition-all hover:scale-105 active:scale-95 group"
            >
              <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>+ Add New Product</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={playDashboardSpeech}
              id="dashboard-audio-briefing-btn"
              className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15 transition-colors"
              title="Daily Voice Briefing"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

        </div>
      </section>

      {/* 4 Standardized Artist Stats Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Products */}
        <div
          onClick={() => setCurrentTab('catalog')}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-4 cursor-pointer hover:border-[#C25E3E] transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Total Products</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">{totalProducts}</p>
            <span className="text-[10px] text-emerald-600 font-semibold">Catalog Live</span>
          </div>
        </div>

        {/* Active Orders */}
        <div
          onClick={() => setCurrentTab('orders')}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-4 cursor-pointer hover:border-[#C25E3E] transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Active Orders</p>
            <p className="text-xl sm:text-2xl font-bold text-indigo-700 font-serif">{activeOrders.length}</p>
            <span className="text-[10px] text-stone-500">In Workshop</span>
          </div>
        </div>

        {/* Pending Requests */}
        <div
          onClick={() => setCurrentTab('requests')}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-4 cursor-pointer hover:border-[#C25E3E] transition-all relative overflow-hidden"
        >
          {pendingRequests.length > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          )}
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Pending Requests</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">{pendingRequests.length}</p>
            <span className="text-[10px] text-amber-600 font-semibold">Needs Review</span>
          </div>
        </div>

        {/* Revenue */}
        <div
          onClick={() => setCurrentTab('earnings')}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center gap-4 cursor-pointer hover:border-[#C25E3E] transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-[#C25E3E]/10 text-[#C25E3E] flex items-center justify-center shrink-0">
            <BadgeIndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Total Earnings</p>
            <p className="text-xl sm:text-2xl font-bold text-[#C25E3E] font-serif">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">Direct UPI Settled</span>
          </div>
        </div>

      </section>

      {/* Quick Artist Action Hub */}
      <section className="p-4 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C25E3E]" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Artist Management Hub
            </h2>
          </div>
          <span className="text-xs text-stone-500">Quick Access</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <button
            onClick={() => setCurrentTab('b2b-marketplace')}
            id="hub-b2b-marketplace-btn"
            className="p-3.5 rounded-2xl border border-stone-200 bg-gradient-to-br from-amber-50/50 to-white hover:border-[#C25E3E] hover:shadow-md transition-all text-left group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#C25E3E]/10 text-[#C25E3E] flex items-center justify-center font-bold text-xs">
                <Store className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-[#C25E3E] bg-[#C25E3E]/10 px-1.5 py-0.5 rounded">
                B2B
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#C25E3E]">B2B Wholesale</h3>
              <p className="text-[10px] text-stone-500">Bulk Listings & RFQs</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('previous-work')}
            id="hub-previous-work-btn"
            className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 hover:bg-white hover:border-[#C25E3E] hover:shadow-md transition-all text-left group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                <FolderHeart className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-stone-500 bg-stone-200/70 px-1.5 py-0.5 rounded">
                {previousWorks.length}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#C25E3E]">Previous Work</h3>
              <p className="text-[10px] text-stone-500">Portfolio & Gallery</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('catalog')}
            id="hub-catalog-btn"
            className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 hover:bg-white hover:border-[#C25E3E] hover:shadow-md transition-all text-left group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-stone-500 bg-stone-200/70 px-1.5 py-0.5 rounded">
                {totalProducts}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#C25E3E]">My Catalog</h3>
              <p className="text-[10px] text-stone-500">Live Inventory</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('requests')}
            id="hub-requests-btn"
            className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 hover:bg-white hover:border-[#C25E3E] hover:shadow-md transition-all text-left group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                <Inbox className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                {pendingRequests.length} new
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#C25E3E]">Customer Requests</h3>
              <p className="text-[10px] text-stone-500">Review & Accept</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('orders')}
            id="hub-orders-btn"
            className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 hover:bg-white hover:border-[#C25E3E] hover:shadow-md transition-all text-left group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-stone-500 bg-stone-200/70 px-1.5 py-0.5 rounded">
                {orders.length}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#C25E3E]">Custom Orders</h3>
              <p className="text-[10px] text-stone-500">Progress & Milestones</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('messages')}
            id="hub-messages-btn"
            className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 hover:bg-white hover:border-[#C25E3E] hover:shadow-md transition-all text-left group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-stone-500 bg-stone-200/70 px-1.5 py-0.5 rounded">
                {conversations.length}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#C25E3E]">Messages</h3>
              <p className="text-[10px] text-stone-500">Client Chat</p>
            </div>
          </button>

        </div>
      </section>

      {/* Pending Customer Requests Preview */}
      {pendingRequests.length > 0 && (
        <section className="p-6 rounded-3xl bg-amber-50/60 border border-amber-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-amber-700" />
              <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                Pending Commission Requests ({pendingRequests.length})
              </h3>
            </div>
            <button
              onClick={() => setCurrentTab('requests')}
              className="text-xs font-bold text-[#C25E3E] hover:underline"
            >
              View All Requests →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingRequests.slice(0, 2).map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-white border border-amber-200/60 flex items-start justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 block">{req.title}</span>
                  <p className="text-xs text-stone-500">From: {req.customerName} • {req.customerLocation}</p>
                  <p className="text-xs font-bold text-emerald-700">Budget: ₹{req.budget.toLocaleString('en-IN')}</p>
                </div>
                <button
                  onClick={() => setCurrentTab('requests')}
                  className="px-3 py-1.5 rounded-xl bg-[#C25E3E] text-white text-xs font-bold shrink-0 hover:bg-[#a94e32]"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Craft Products */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
              {currentLang === 'hi' ? 'हाल ही के उत्पाद (Recent Crafts)' : 'Recent Craft Listings'}
            </h2>
            <p className="text-xs text-stone-500">Manage, preview, and update your catalog</p>
          </div>
          <button
            onClick={() => setCurrentTab('catalog')}
            id="view-all-products-link"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#C25E3E] hover:underline"
          >
            <span>{t.viewCatalog} ({products.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-stone-200 p-8 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-xs font-bold text-slate-800">No products created yet</p>
            <button
              onClick={() => setCurrentTab('add-product')}
              className="px-4 py-2 rounded-xl bg-[#C25E3E] text-white text-xs font-bold"
            >
              + Create First Product Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.slice(0, 3).map((product) => {
              const statusConfig = {
                published: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Live Published' },
                ai_ready: { bg: 'bg-blue-100 text-blue-800 border-blue-200', label: 'AI Ready' },
                draft: { bg: 'bg-stone-100 text-stone-700 border-stone-200', label: 'Draft' },
              }[product.status];

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 bg-stone-100 overflow-hidden">
                      <img
                        src={product.enhancedImage || product.originalImage}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusConfig.bg}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-xs text-white font-extrabold text-xs">
                        ₹{(product.actualPrice || product.suggestedPrice || 0).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <p className="text-[10px] font-bold text-[#C25E3E] uppercase tracking-wider">
                        {product.craftType}
                      </p>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {currentLang === 'hi' ? product.titleHindi || product.title : product.title}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {currentLang === 'hi' ? product.descriptionHindi || product.description : product.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between text-xs mt-2">
                    <span className="text-stone-500">
                      Views: <strong>{product.viewsCount || 0}</strong> • Sold: <strong>{product.salesCount || 0}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setCurrentTab('catalog');
                      }}
                      className="font-bold text-[#C25E3E] hover:underline"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};
