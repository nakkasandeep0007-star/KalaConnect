import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  IndianRupee, 
  Truck, 
  Package, 
  CheckCircle2, 
  Building, 
  MessageSquare,
  Info,
  Sparkles
} from 'lucide-react';
import { B2BQuoteRequest } from '../../types';

interface SendOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: B2BQuoteRequest | null;
  onSendOffer: (
    requestId: string,
    offerData: {
      offeredPrice: number;
      offeredDeliveryDays: number;
      artisanOfferMessage: string;
    }
  ) => Promise<void> | void;
}

export const SendOfferModal: React.FC<SendOfferModalProps> = ({
  isOpen,
  onClose,
  request,
  onSendOffer,
}) => {
  const [offeredPrice, setOfferedPrice] = useState<number | string>('315');
  const [offeredDeliveryDays, setOfferedDeliveryDays] = useState<number | string>('7');
  const [artisanOfferMessage, setArtisanOfferMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (request) {
      // Default to target price or custom offer
      const initialPrice = request.offeredPrice || request.targetPrice || 315;
      setOfferedPrice(initialPrice);
      setOfferedDeliveryDays(request.offeredDeliveryDays || 7);
      setArtisanOfferMessage(
        request.artisanOfferMessage ||
        `Namaste ${request.buyerName || 'Buyer'}. We can fulfill your bulk order of ${request.quantity} units within 7 working days with master craftsmanship and secure export packaging.`
      );
      setErrorMsg('');
      setIsSuccess(false);
    }
  }, [request, isOpen]);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = Number(offeredPrice);
    const numDays = Number(offeredDeliveryDays);

    if (!numPrice || numPrice <= 0) {
      setErrorMsg('Please enter a valid offer price per unit.');
      return;
    }
    if (!numDays || numDays < 1) {
      setErrorMsg('Please specify estimated delivery lead time in days.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSendOffer(request.id || request.requestId, {
        offeredPrice: numPrice,
        offeredDeliveryDays: numDays,
        artisanOfferMessage: artisanOfferMessage.trim(),
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg('Failed to send offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalValue = Number(offeredPrice) * (request.quantity || 1);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      id="send-offer-modal-overlay"
    >
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        id="send-offer-modal-content"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#9E3E20] via-[#C25E3E] to-amber-700 text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight font-serif text-white">
                Send Wholesale Offer
              </h2>
              <p className="text-xs text-amber-100">
                Provide custom bulk pricing & lead time to {request.buyerName || request.buyerOrg}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            id="close-send-offer-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request Context Summary */}
        <div className="bg-amber-50/70 border-b border-amber-200/70 px-5 sm:px-6 py-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-600">
            <span className="flex items-center gap-1.5 font-semibold text-slate-900">
              <Building className="w-3.5 h-3.5 text-[#C25E3E]" />
              {request.buyerName || request.buyerOrg} ({request.buyerLocation || request.deliveryLocation})
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
              Target: ₹{request.targetPrice}/unit
            </span>
          </div>

          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-amber-200/60 shadow-2xs text-xs">
            {request.productImage && (
              <img
                src={request.productImage}
                alt={request.productName}
                className="w-10 h-10 rounded-lg object-cover border border-stone-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate">{request.productName}</p>
              <p className="text-stone-500 text-[11px]">
                Requested Quantity: <strong className="text-slate-800">{request.quantity} units</strong> • Delivery: <strong>{request.deliveryLocation}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Offer sent successfully to buyer!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Offered Price Per Unit */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                Your Offer Price / Unit (₹) *
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
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  placeholder="e.g. 315"
                  id="offer-price-input"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-sm font-bold text-slate-900 bg-white"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Buyer requested ₹{request.targetPrice}/unit.
              </p>
            </div>

            {/* Estimated Delivery Time */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                Estimated Delivery (Days) *
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
                  value={offeredDeliveryDays}
                  onChange={(e) => setOfferedDeliveryDays(e.target.value)}
                  placeholder="e.g. 7"
                  id="offer-delivery-days-input"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-sm font-semibold text-slate-900 bg-white"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Time needed to produce & dispatch.
              </p>
            </div>
          </div>

          {/* Offer Message */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
              Message to Buyer
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none text-stone-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <textarea
                rows={3}
                value={artisanOfferMessage}
                onChange={(e) => setArtisanOfferMessage(e.target.value)}
                placeholder="Details on customization, payment terms, or shipping notes..."
                id="offer-message-textarea"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 focus:border-[#C25E3E] focus:ring-2 focus:ring-[#C25E3E]/20 text-xs sm:text-sm text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Total Offer Calculation */}
          {Number(offeredPrice) > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between text-xs">
              <span className="text-amber-900 font-medium">Total Deal Value ({request.quantity} units @ ₹{offeredPrice}):</span>
              <span className="text-base font-extrabold text-[#C25E3E]">
                ₹{totalValue.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              id="cancel-send-offer-btn"
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs sm:text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              id="submit-send-offer-btn"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C25E3E] to-[#9E3E20] hover:from-[#B14E2E] hover:to-[#8E2E10] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#C25E3E]/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending Offer...' : 'Send Offer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
