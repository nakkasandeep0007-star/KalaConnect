import React, { useState } from 'react';
import {
  ShoppingBag,
  PlusCircle,
  Search,
  Eye,
  Share2,
  Volume2,
  Trash2,
  AlertCircle,
  Loader2,
  LogIn,
} from 'lucide-react';
import { LanguageCode, PageTab, Product, ProductStatus } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { speakText } from '../../utils/audioSpeech';
import { deleteProductFromDb } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';

interface MyKalaPageProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setSelectedProduct: (product: Product | null) => void;
  setCurrentTab: (tab: PageTab) => void;
  currentLang: LanguageCode;
}

export const MyKalaPage: React.FC<MyKalaPageProps> = ({
  products,
  setProducts,
  setSelectedProduct,
  setCurrentTab,
  currentLang,
}) => {
  const { user } = useAuth();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [filterStatus, setFilterStatus] = useState<'all' | ProductStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.titleHindi && p.titleHindi.includes(searchQuery)) ||
      (p.craftType && p.craftType.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product from your catalog?')) {
      setDeletingId(productId);
      try {
        await deleteProductFromDb(productId);
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } catch (err) {
        console.error('Failed to delete product from database:', err);
        // Also remove client side as fallback
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C25E3E]/10 text-[#C25E3E] flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                {currentLang === 'hi' ? 'मेरी कला — उत्पाद सूची' : 'My Kala — Craft Catalog'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
                {products.length} Items
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {user
                ? `Manage, edit, and view your verified artisan inventory saved in your account.`
                : `Viewing catalog items. Log in to permanently sync and save your products.`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentTab('add-product')}
          id="mykala-add-product-btn"
          className="px-6 py-3 rounded-2xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Guest Notice Banner if not logged in */}
      {!user && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Create a free artisan account or log in so your products stay saved in your personal database.</span>
          </div>
          <button
            onClick={() => setCurrentTab('auth')}
            className="px-4 py-1.5 rounded-xl bg-amber-800 text-white text-xs font-bold shrink-0 self-start sm:self-auto hover:bg-amber-900"
          >
            Log In / Sign Up
          </button>
        </div>
      )}

      {/* Filters & Search Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Items', count: products.length },
            { id: 'published', label: 'Published (Live)', count: products.filter((p) => p.status === 'published').length },
            { id: 'ai_ready', label: 'AI Ready', count: products.filter((p) => p.status === 'ai_ready').length },
            { id: 'draft', label: 'Drafts', count: products.filter((p) => p.status === 'draft').length },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterStatus(item.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterStatus === item.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterStatus === item.id ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search craft, name, tag..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:border-[#C25E3E] outline-hidden"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No products in this view</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {products.length === 0
                ? 'Your catalog is empty. Click "+ Add Product" to publish your first handcrafted item.'
                : 'Try adjusting your search keywords or filter.'}
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('add-product')}
            className="px-6 py-2.5 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white font-bold text-xs shadow-sm inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Your First Product</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const statusBadge = {
              published: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: '● Live Published' },
              ai_ready: { bg: 'bg-indigo-100 text-indigo-800 border-indigo-300', label: '✨ AI Ready' },
              draft: { bg: 'bg-stone-100 text-stone-700 border-stone-300', label: '📝 Draft' },
            }[product.status] || { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: '● Live Published' };

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative h-52 bg-stone-100 overflow-hidden flex items-center justify-center">
                    <img
                      src={product.enhancedImage || product.originalImage}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusBadge.bg} shadow-xs`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-amber-300 font-extrabold text-sm px-3 py-1 rounded-xl shadow-md font-serif">
                      ₹{product.actualPrice?.toLocaleString('en-IN') || 0}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#C25E3E] uppercase tracking-wider">
                        {product.craftType || product.category || 'Handicraft'}
                      </span>
                      <span className="text-stone-400">{product.inventory || 1} in stock</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 font-serif">
                      {currentLang === 'hi' ? product.titleHindi || product.title : product.title}
                    </h3>

                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {currentLang === 'hi' ? product.descriptionHindi || product.description : product.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {product.materials?.slice(0, 2).map((m, mIdx) => (
                        <span key={mIdx} className="px-2 py-0.5 rounded bg-stone-100 text-[10px] text-stone-600 font-medium">
                          {m}
                        </span>
                      ))}
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[10px] text-emerald-700 font-bold">
                        Margin: {product.profitMarginPercent || 35}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="p-4 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      title="View Details"
                      className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-slate-900 hover:border-stone-400 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        const shareUrl = `https://kalaconnect.org/craft/${product.id}`;
                        const shareMsg = `Check out handcrafted ${product.title} by master artisan on KalaConnect: ${shareUrl}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}`, '_blank');
                      }}
                      title="Share to WhatsApp"
                      className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        const text = currentLang === 'hi' ? product.titleHindi || product.title : product.title;
                        speakText(text, currentLang);
                      }}
                      title="Listen Name"
                      className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deletingId === product.id}
                      title="Delete Product"
                      className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {deletingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <span className="text-[11px] font-semibold text-stone-500">
                    MOQ: {product.wholesaleMOQ || 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
