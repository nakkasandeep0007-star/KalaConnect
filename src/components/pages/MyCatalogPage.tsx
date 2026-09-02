import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  ShoppingBag,
  Sparkles,
  Eye,
  Trash2,
  Edit3,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  TrendingUp,
  X,
  AlertTriangle,
  BadgeIndianRupee,
  Store,
} from 'lucide-react';
import { LanguageCode, PageTab, Product, ProductStatus } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { useAuth } from '../../context/AuthContext';
import { deleteProductFromDb, saveProductToDb } from '../../services/productService';

interface MyCatalogPageProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setSelectedProduct: (p: Product | null) => void;
  setCurrentTab: (tab: PageTab) => void;
  currentLang: LanguageCode;
  onEditPrice?: (product: Product) => void;
  onListB2B?: (product: Product) => void;
}

export const MyCatalogPage: React.FC<MyCatalogPageProps> = ({
  products,
  setProducts,
  setSelectedProduct,
  setCurrentTab,
  currentLang,
  onEditPrice,
  onListB2B,
}) => {
  const { user } = useAuth();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'published' | 'draft' | 'out_of_stock'>('all');

  // Product pending deletion state for confirmation modal
  const [productPendingDeletion, setProductPendingDeletion] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.craftType && p.craftType.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'published') return p.status === 'published';
    if (selectedFilter === 'draft') return p.status === 'draft' || p.status === 'ai_ready';
    if (selectedFilter === 'out_of_stock') return (p.inventory || 0) === 0;

    return true;
  });

  const handleToggleStatus = async (product: Product) => {
    const nextStatus: ProductStatus = product.status === 'published' ? 'draft' : 'published';
    const updated: Product = { ...product, status: nextStatus };

    setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
    const effectiveUserId = user?.uid || 'guest-artisan';
    try {
      await saveProductToDb(effectiveUserId, updated);
    } catch (err) {
      console.warn('Failed to update product status:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productPendingDeletion) return;
    const prodIdToDelete = productPendingDeletion.id;
    const effectiveUserId = user?.uid || 'guest-artisan';

    setIsDeleting(true);
    try {
      // 1. Delete from persistent data store (Firestore and localStorage cache)
      await deleteProductFromDb(prodIdToDelete, effectiveUserId);

      // 2. Remove product from React state so it immediately disappears everywhere
      setProducts((prev) => prev.filter((p) => p.id !== prodIdToDelete));

      // 3. Clear preview if the currently selected modal product is this one
      setSelectedProduct(null);

      // 4. Close dialog and notify success
      setProductPendingDeletion(null);
      setToast({
        type: 'success',
        message: 'Product deleted successfully.',
      });
    } catch (err) {
      // 5. Log actual technical error for debugging and notify failure
      console.error('Unable to delete product technical error:', err);
      setProductPendingDeletion(null);
      setToast({
        type: 'error',
        message: 'Unable to delete product. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const publishedCount = products.filter((p) => p.status === 'published').length;
  const draftCount = products.filter((p) => p.status === 'draft' || p.status === 'ai_ready').length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 relative">
      
      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-900/95 text-white border-emerald-700 shadow-emerald-950/20'
              : 'bg-rose-900/95 text-white border-rose-700 shadow-rose-950/20'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />
          )}
          <span className="text-sm font-medium leading-snug">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-auto text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {productPendingDeletion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150">
            {/* Header Icon */}
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            {/* Title and Message */}
            <h2 id="delete-dialog-title" className="text-xl font-bold text-slate-900 font-serif">
              Delete this product?
            </h2>
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">
              This product and its catalog information will be removed. This action cannot be undone.
            </p>

            {/* Item Preview Card */}
            <div className="mt-4 p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-200">
                <img
                  src={productPendingDeletion.enhancedImage || productPendingDeletion.originalImage}
                  alt={productPendingDeletion.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {productPendingDeletion.title}
                </p>
                <p className="text-[11px] text-stone-500 font-medium">
                  {productPendingDeletion.craftType || productPendingDeletion.category} • ₹
                  {(productPendingDeletion.actualPrice || productPendingDeletion.suggestedPrice || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                id="cancel-delete-btn"
                onClick={() => setProductPendingDeletion(null)}
                disabled={isDeleting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-product-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-rose-600/20 transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C25E3E]/10 text-[#C25E3E] border border-[#C25E3E]/20 flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              Live Inventory
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {publishedCount} live • {draftCount} drafts
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-serif">
            My Catalog
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-xl">
            Manage your verified craft listings, inventory stock, and pricing across marketplaces.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('add-product')}
          id="catalog-add-product-btn"
          className="px-5 py-3 rounded-2xl bg-[#C25E3E] hover:bg-[#a94e32] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-[#C25E3E]/25 transition-colors self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add New Product</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, craft..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-[#C25E3E]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setSelectedFilter('published')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              selectedFilter === 'published'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setSelectedFilter('draft')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              selectedFilter === 'draft'
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-stone-200 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#C25E3E]/10 text-[#C25E3E] flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No products match your filter</h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            {products.length === 0
              ? 'You have not added any products to your catalog yet. Use the 5-step guided wizard to create your first verified craft listing.'
              : 'Try changing your search query or status filter above.'}
          </p>
          <button
            onClick={() => setCurrentTab('add-product')}
            className="px-5 py-2.5 rounded-xl bg-[#C25E3E] text-white text-sm font-bold hover:bg-[#a94e32] shadow-xs"
          >
            + Create New Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="group bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Product Image */}
                <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                  <img
                    src={prod.enhancedImage || prod.originalImage}
                    alt={prod.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <button
                      onClick={() => handleToggleStatus(prod)}
                      title="Click to toggle status"
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border transition-all flex items-center gap-1.5 shadow-xs ${
                        prod.status === 'published'
                          ? 'bg-emerald-600/90 text-white border-emerald-400'
                          : 'bg-amber-500/90 text-white border-amber-300'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {prod.status === 'published' ? 'Published' : 'Draft / Private'}
                    </button>
                  </div>

                  {/* Inventory Badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-800 border border-stone-200">
                    Stock: {prod.inventory || 0}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#C25E3E]">
                      {prod.craftType || prod.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base line-clamp-2 group-hover:text-[#C25E3E] transition-colors">
                    {prod.title}
                  </h3>

                  <p className="text-xs text-stone-500 line-clamp-2">
                    {prod.description}
                  </p>

                  <div className="pt-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-stone-400 block font-medium">Selling Price</span>
                      <span className="text-lg font-bold text-slate-900 font-serif">
                        ₹{(prod.actualPrice || prod.suggestedPrice || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-stone-400 block font-medium">Market Views</span>
                      <span className="text-xs font-bold text-stone-700">
                        {prod.viewsCount || 0} views
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedProduct(prod)}
                    className="text-xs font-bold text-slate-700 hover:text-[#C25E3E] flex items-center gap-1 py-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onEditPrice) {
                        onEditPrice(prod);
                      } else {
                        setCurrentTab('pricing');
                      }
                    }}
                    id={`edit-price-${prod.id}`}
                    className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#C25E3E] text-xs font-bold flex items-center gap-1 border border-amber-200 transition-colors shadow-2xs"
                    title="Edit Price with KalaPrice"
                  >
                    <BadgeIndianRupee className="w-3.5 h-3.5" />
                    <span>{currentLang === 'hi' ? 'मूल्य संपादित करें' : 'Edit Price'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onListB2B) {
                        onListB2B(prod);
                      } else {
                        setCurrentTab('b2b-marketplace');
                      }
                    }}
                    id={`list-b2b-${prod.id}`}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all shadow-2xs ${
                      prod.isB2BListed
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-stone-100 hover:bg-amber-100/70 text-slate-800 hover:text-[#9E3E20] border-stone-300 hover:border-amber-300'
                    }`}
                    title="List or configure for B2B Wholesale Marketplace"
                  >
                    <Store className="w-3.5 h-3.5 text-[#C25E3E]" />
                    <span>
                      {prod.isB2BListed 
                        ? `B2B: ₹${prod.b2bWholesalePrice || prod.wholesalePrice}` 
                        : (currentLang === 'hi' ? 'B2B में जोड़ें' : 'List for B2B')}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setCurrentTab('studio');
                    }}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-slate-900 hover:bg-stone-200 transition-colors"
                    title="KalaStudio Enhancement"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </button>
                  <button
                    onClick={() => setProductPendingDeletion(prod)}
                    id={`delete-product-${prod.id}`}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete product"
                    aria-label={`Delete ${prod.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
