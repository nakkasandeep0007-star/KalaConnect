import React, { useState } from 'react';
import {
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Send,
  Sparkles
} from 'lucide-react';
import { BuyerInquiry } from '../../types';

interface InquiryDetailModalProps {
  inquiry: BuyerInquiry | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'accepted' | 'declined' | 'negotiating') => void;
}

export const InquiryDetailModal: React.FC<InquiryDetailModalProps> = ({
  inquiry,
  onClose,
  onUpdateStatus,
}) => {
  if (!inquiry) return null;

  const [counterPrice, setCounterPrice] = useState(inquiry.offerPricePerUnit.toString());
  const [replyMessage, setReplyMessage] = useState(
    `Namaste ${inquiry.buyerName}, we are pleased to accept your request for ${inquiry.quantityRequested} pieces of ${inquiry.productName}. We can dispatch within 10 business days.`
  );
  const [sentNotice, setSentNotice] = useState(false);

  const handleSendResponse = (newStatus: 'accepted' | 'negotiating') => {
    onUpdateStatus(inquiry.id, newStatus);
    setSentNotice(true);
    setTimeout(() => {
      setSentNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-5 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif text-slate-900">
              {inquiry.buyerOrg}
            </h2>
            <p className="text-xs text-stone-500">
              {inquiry.buyerName} • {inquiry.buyerType} • {inquiry.buyerLocation}
            </p>
          </div>
        </div>

        {/* Product & Quantity Box */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
          <img
            src={inquiry.productImage}
            alt={inquiry.productName}
            className="w-14 h-14 rounded-xl object-cover border border-stone-200"
          />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-900">{inquiry.productName}</p>
            <p className="text-xs text-[#C25E3E] font-semibold">
              Requested Quantity: <strong>{inquiry.quantityRequested} units</strong>
            </p>
            <p className="text-xs text-emerald-700 font-bold">
              Offered Rate: ₹{inquiry.offerPricePerUnit} / unit (Total ₹{(inquiry.quantityRequested * inquiry.offerPricePerUnit).toLocaleString('en-IN')})
            </p>
          </div>
        </div>

        {/* Original Buyer Message */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
            Inquiry Message from Buyer:
          </span>
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            "{inquiry.message}"
          </div>
        </div>

        {/* Response Composer */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Your Direct Reply / Counter Proposal:
            </span>
            <div className="flex items-center gap-1 text-xs">
              <span>Unit Rate: ₹</span>
              <input
                type="number"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                className="w-20 px-2 py-0.5 border border-stone-300 rounded font-bold"
              />
            </div>
          </div>

          <textarea
            rows={3}
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            className="w-full p-3 rounded-xl border border-stone-300 text-xs text-slate-800 outline-hidden focus:border-[#C25E3E]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
          <button
            onClick={() => {
              onUpdateStatus(inquiry.id, 'declined');
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold"
          >
            Decline
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSendResponse('negotiating')}
              className="px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold"
            >
              Send Counter Offer
            </button>

            <button
              onClick={() => handleSendResponse('accepted')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
            >
              {sentNotice ? 'Order Accepted! ✓' : 'Accept Bulk Order'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
