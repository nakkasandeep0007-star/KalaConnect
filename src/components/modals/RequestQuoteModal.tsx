import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  IndianRupee, 
  Package, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  User, 
  Building, 
  Info,
  Sparkles
} from 'lucide-react';
import { Product, B2BQuoteRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface RequestQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSubmitQuote: (quoteData: Omit<B2BQuoteRequest, 'id' | 'requestId' | 'createdAt' | 'status'>) => Promise<void> | void;
}

export const RequestQuoteModal: React.FC<RequestQuoteModalProps> = ({
  isOpen,
  onClose,
  product,
  onSubmitQuote,
}) => {
  const { user, buyerProfile } = useAuth();

  const [buyerName, setBuyerName] = useState<string>(
    buyerProfile?.contactPerson || 'ABC Handicrafts Pvt Ltd'
  );
  const [buyerOrg, setBuyerOrg] = useState<string>(
    buyerProfile?.businessName || 'ABC Handicrafts Pvt Ltd'
  );
  const [quantity, setQuantity] = useState<number | string>('50');
  const [targetPrice, setTargetPrice] = useState<number | string>('320');
  const [deliveryLocation, setDeliveryLocation] = useState<string>(
    buyerProfile?.cityState || 'Delhi'
  );
  const [requiredBy, setRequiredBy] = useState<string>('2026-09-25');
  const [message, setMessage] = useState<string>('Interested in bulk purchase.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Sync with current buyer profile when modal opens or profile changes
  useEffect(() => {
    if (buyerProfile) {
      if (buyerProfile.contactPerson) setBuyerName(buyerProfile.contactPerson);
      if (buyerProfile.businessName) setBuyerOrg(buyerProfile.businessName);
      if (buyerProfile.cityState) setDeliveryLocation(buyerProfile.cityState);
    }
  }, [buyerProfile, isOpen]);

  if (!isOpen || !product) return null;

  const retailPrice = product.actualPrice || product.suggestedPrice || 0;
  const wholesalePrice = product.b2bWholesalePrice || product.wholesalePrice || Math.round(retailPrice * 0.75);
  const moq = product.b2bMOQ || product.wholesaleMOQ || 5;
  const stock = product.b2bStock || product.inventory || 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numQty = Number(quantity);
    const numTargetPrice = Number(targetPrice);

    if (!numQty || numQty < 1) {
      setErrorMsg('Please enter a valid quantity.');
      return;
    }
    if (!numTargetPrice || numTargetPrice <= 0) {
      setErrorMsg('Please enter your target price per unit.');
      return;
    }
    if (!deliveryLocation.trim()) {
      setErrorMsg('Please specify the delivery location.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const effectiveBuyerId = user?.uid || buyerProfile?.id || 'buyer_' + Date.now();
      const effectiveArtisanId = product.artisanId || product.userId || 'sample-artist';

      await onSubmitQuote({
        productId: product.id,
        productName: product.title,
        productImage: product.enhancedImage || product.originalImage || product.image || '',
        category: product.category,
        craftType: product.craftType,
        artisanId: effectiveArtisanId,
        artisanName: product.artisanName || 'Master Artisan',
        artisanLocation: product.originRegion || product.artisanLocation || 'Jaipur, Rajasthan',
        buyerId: effectiveBuyerId,
        buyerName: buyerName.trim() || buyerProfile?.contactPerson || 'Verified Buyer',
        buyerOrg: buyerOrg.trim() || buyerProfile?.businessName || 'Wholesale Buyer',
        buyerLocation: deliveryLocation.trim() || 'Delhi',
        quantity: numQty,
        targetPrice: numTargetPrice,
        deliveryLocation: deliveryLocation.trim(),
        requiredBy: requiredBy || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        message: message.trim() || 'Interested in bulk purchase.',
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg('Failed to send quote request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      id="request-quote-modal-overlay"
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        id="request-quote-modal-content"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C25E3E] text-white flex items-center justify-center shadow-inner">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight font-serif text-amber-100">
                  Request Wholesale Quotation
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  B2B Direct
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Send your RFQ directly to the master artisan. No middleman markup.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            id="close-request-quote-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Product Summary Banner */}
        <div className="bg-amber-50/70 border-b border-amber-200/70 px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={product.enhancedImage || product.originalImage || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80'}
              alt={product.title}
              className="w-14 h-14 rounded-xl object-cover border border-amber-200 shadow-xs shrink-0"
            />
            <div>
              <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                {product.craftType || 'Authentic Craft'}
              </p>
              <h3 className="text-sm font-bold text-slate-900 truncate max-w-sm">
                {product.title}
              </h3>
              <p className="text-xs text-stone-600">
                Artisan: <strong className="text-slate-800">{product.artisanName || 'Rameshwar Lal Kumhar'}</strong> ({product.originRegion || product.artisanLocation || 'Jaipur'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 bg-white px-3.5 py-2 rounded-xl border border-amber-200/80 shadow-2xs self-start sm:self-auto text-xs">
            <div>
              <p className="text-[10px] text-stone-500 font-medium">Retail Price</p>
              <p className="font-semibold text-stone-700">₹{retailPrice}</p>
            </div>
            <div className="w-px h-6 bg-stone-200" />
            <div>
              <p className="text-[10px] text-stone-500 font-medium">Wholesale Price</p>
              <p className="font-bold text-[#C25E3E]">₹{wholesalePrice}</p>
            </div>
            <div className="w-px h-6 bg-stone-200" />
            <div>
              <p className="text-[10px] text-stone-500 font-medium">MOQ / Stock</p>
              <p className="font-semibold text-stone-800">{moq} / {stock} units</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-220px)] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Quotation request sent successfully to the artisan!</span>
            </div>
          )}

          {/* Buyer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                Buyer Organization / Business Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={buyerOrg}
                  onChange={(e) => {
                    setBuyerOrg(e.target.value);
                    setBuyerName(e.target.value);
                  }}
                  placeholder="e.g. ABC Handicrafts Pvt Ltd"
                  id="rfq-buyer-org-input"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-sm font-semibold text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                Contact Person Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Procurement Team / Rahul Verma"
                  id="rfq-buyer-name-input"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-sm font-semibold text-slate-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Quantity & Target Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                Required Quantity (Units) *
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
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 50"
                  id="rfq-quantity-input"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-sm font-semibold text-slate-900 bg-white"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                MOQ for this item is {moq} units.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                Target Price / Unit (₹) *
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
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="e.g. 320"
                  id="rfq-target-price-input"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-sm font-semibold text-slate-900 bg-white"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Artisan wholesale price is ₹{wholesalePrice}.
              </p>
            </div>
          </div>

          {/* Delivery Location & Required By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                Delivery Location (City / State) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="e.g. Delhi"
                  id="rfq-delivery-location-input"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-sm font-semibold text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                Required By (Target Date)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={requiredBy}
                  onChange={(e) => setRequiredBy(e.target.value)}
                  id="rfq-required-by-input"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-sm font-semibold text-slate-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
              Message / Bulk Requirements Details
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none text-stone-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Interested in bulk purchase. Provide custom packaging and sample details if any."
                id="rfq-message-textarea"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-xs sm:text-sm text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Estimated Total Summary */}
          {Number(quantity) > 0 && Number(targetPrice) > 0 && (
            <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-between text-xs">
              <span className="text-stone-600">Estimated Total Order Value (Target):</span>
              <span className="text-sm font-bold text-slate-900">
                ₹{(Number(quantity) * Number(targetPrice)).toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              id="cancel-quote-request-btn"
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs sm:text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              id="submit-quote-request-btn"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C25E3E] to-[#9E3E20] hover:from-[#B14E2E] hover:to-[#8E2E10] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#C25E3E]/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending RFQ...' : 'Send Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
