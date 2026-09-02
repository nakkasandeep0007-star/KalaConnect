import React, { useState, useEffect } from 'react';
import { 
  X, 
  Store, 
  IndianRupee, 
  Package, 
  Boxes, 
  Truck, 
  CheckCircle2, 
  Building2, 
  Sparkles,
  Info
} from 'lucide-react';
import { Product, LanguageCode } from '../../types';

interface B2BListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (updatedProduct: Product) => void;
  currentLang?: LanguageCode;
}

const BUYER_TYPE_OPTIONS = [
  'Retailer',
  'Distributor',
  'Hotel / Hospitality',
  'Corporate Gifting',
  'Exporter',
  'Boutique Curator',
];

export const B2BListingModal: React.FC<B2BListingModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  currentLang = 'en',
}) => {
  const [wholesalePrice, setWholesalePrice] = useState<number | string>('');
  const [moq, setMoq] = useState<number | string>('');
  const [stock, setStock] = useState<number | string>('');
  const [deliveryDays, setDeliveryDays] = useState<number | string>('');
  const [selectedBuyerTypes, setSelectedBuyerTypes] = useState<string[]>([]);
  const [b2bDescription, setB2bDescription] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    if (product) {
      setWholesalePrice(product.b2bWholesalePrice || product.wholesalePrice || Math.round(product.actualPrice * 0.7) || '');
      setMoq(product.b2bMOQ || product.wholesaleMOQ || 5);
      setStock(product.b2bStock || product.inventory || 20);
      setDeliveryDays(product.b2bDeliveryDays || 7);
      setSelectedBuyerTypes(product.b2bBuyerTypes || ['Retailer', 'Distributor', 'Hotel / Hospitality', 'Corporate Gifting']);
      setB2bDescription(
        product.b2bDescription ||
        `Bulk supply of authentic ${product.title} crafted using traditional ${product.craftType || 'artisanal'} techniques. Ideal for wholesale, corporate gifting, and luxury retail curation.`
      );
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const toggleBuyerType = (type: string) => {
    setSelectedBuyerTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = Number(wholesalePrice);
    const parsedMoq = Number(moq);
    const parsedStock = Number(stock);
    const parsedDays = Number(deliveryDays);

    if (!parsedPrice || parsedPrice <= 0) {
      setErrorMsg('Please enter a valid wholesale price per unit.');
      return;
    }
    if (!parsedMoq || parsedMoq < 1) {
      setErrorMsg('Minimum Order Quantity (MOQ) must be at least 1.');
      return;
    }
    if (parsedStock < 0) {
      setErrorMsg('Available stock cannot be negative.');
      return;
    }

    const updated: Product = {
      ...product,
      isB2BListed: true,
      publishedToB2B: true,
      status: 'published',
      retailPrice: product.retailPrice || product.actualPrice || product.suggestedPrice || 0,
      wholesalePrice: parsedPrice,
      b2bWholesalePrice: parsedPrice,
      wholesaleMOQ: parsedMoq,
      b2bMOQ: parsedMoq,
      moq: parsedMoq,
      stock: parsedStock || parsedMoq * 2,
      b2bStock: parsedStock || parsedMoq * 2,
      b2bDeliveryDays: parsedDays || 7,
      b2bBuyerTypes: selectedBuyerTypes,
      b2bDescription: b2bDescription.trim(),
      updatedAt: new Date().toISOString(),
    };

    setSuccessMsg('Successfully published to B2B Marketplace!');
    setTimeout(() => {
      onSave(updated);
      onClose();
    }, 600);
  };

  const retailPrice = product.actualPrice || product.suggestedPrice || 0;
  const numWholesale = Number(wholesalePrice) || 0;
  const discountPercent = retailPrice > 0 && numWholesale > 0 
    ? Math.round(((retailPrice - numWholesale) / retailPrice) * 100)
    : 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      id="b2b-listing-modal-overlay"
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        id="b2b-listing-modal-content"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C25E3E] text-white flex items-center justify-center shadow-inner">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight font-serif text-amber-100">
                  List for B2B Marketplace
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Wholesale
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Publish wholesale pricing & bulk fulfillment terms to verified buyers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            id="close-b2b-listing-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Snapshot Info */}
        <div className="bg-stone-50 border-b border-stone-200 px-5 sm:px-6 py-3 flex items-center gap-3">
          <img
            src={product.enhancedImage || product.originalImage || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80'}
            alt={product.title}
            className="w-14 h-14 rounded-xl object-cover border border-stone-200 shadow-xs shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              {product.category || 'Handicraft'} • {product.craftType}
            </p>
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {product.title}
            </h3>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-stone-600">
              <span>Retail Price: <strong className="text-slate-900">₹{retailPrice}</strong></span>
              <span>•</span>
              <span>Current Stock: <strong>{product.inventory || 1} units</strong></span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePublish} className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-200px)] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Pricing & MOQ Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Wholesale Price */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                Wholesale Price / Unit (₹) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value)}
                  placeholder="e.g. 338"
                  id="b2b-wholesale-price-input"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-sm font-semibold text-slate-900 bg-white"
                />
              </div>
              {discountPercent > 0 && (
                <p className="text-[11px] text-emerald-600 font-medium mt-1">
                  Offers a {discountPercent}% wholesale bulk discount vs retail ₹{retailPrice}.
                </p>
              )}
            </div>

            {/* Minimum Order Quantity */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                Minimum Order Quantity (MOQ) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Package className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                  placeholder="e.g. 5"
                  id="b2b-moq-input"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-sm font-semibold text-slate-900 bg-white"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Minimum units a buyer must order for wholesale rates.
              </p>
            </div>
          </div>

          {/* Stock & Delivery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Available Wholesale Stock */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                Available Wholesale Stock (Units) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Boxes className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="e.g. 10"
                  id="b2b-stock-input"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-sm font-semibold text-slate-900 bg-white"
                />
              </div>
            </div>

            {/* Expected Delivery Time */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                Expected Delivery Time (Days) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Truck className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  placeholder="e.g. 7"
                  id="b2b-delivery-days-input"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-sm font-semibold text-slate-900 bg-white"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Typical lead time to craft and dispatch bulk orders.
              </p>
            </div>
          </div>

          {/* Target Buyer Types Multi-select */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
              Target Buyer Categories
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BUYER_TYPE_OPTIONS.map((type) => {
                const isSelected = selectedBuyerTypes.includes(type);
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => toggleBuyerType(type)}
                    id={`b2b-buyer-type-${type.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#C25E3E]/10 border-[#C25E3E] text-[#9E3E20] font-bold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{type}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#C25E3E] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* B2B Description */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
              B2B Wholesale Description & Terms
            </label>
            <textarea
              rows={3}
              value={b2bDescription}
              onChange={(e) => setB2bDescription(e.target.value)}
              placeholder="Describe bulk customization, packaging options, sample policy, or craft authenticity details..."
              id="b2b-description-textarea"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-xs sm:text-sm text-slate-900 bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              id="cancel-b2b-listing-btn"
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs sm:text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="publish-b2b-listing-btn"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C25E3E] to-[#9E3E20] hover:from-[#B14E2E] hover:to-[#8E2E10] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#C25E3E]/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish to B2B Marketplace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
