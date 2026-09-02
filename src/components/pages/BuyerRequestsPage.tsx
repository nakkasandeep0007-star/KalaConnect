import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  MapPin,
  Building,
  Package,
  IndianRupee,
  Truck,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Send,
  AlertCircle,
  Eye
} from 'lucide-react';
import { B2BQuoteRequest, B2BRequestStatus, BuyerProfile, LanguageCode, PageTab } from '../../types';

interface BuyerRequestsPageProps {
  b2bRequests: B2BQuoteRequest[];
  buyerProfile: BuyerProfile | null;
  setCurrentTab: (tab: PageTab) => void;
  onUpdateB2BStatus?: (requestId: string, status: B2BRequestStatus, details?: any) => Promise<void> | void;
  currentLang?: LanguageCode;
}

export const BuyerRequestsPage: React.FC<BuyerRequestsPageProps> = ({
  b2bRequests,
  buyerProfile,
  setCurrentTab,
  onUpdateB2BStatus,
  currentLang = 'en',
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'offers' | 'closed'>('all');
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);

  // Filter requests for this buyer
  const buyerRequests = b2bRequests.filter(
    (r) =>
      !buyerProfile?.id ||
      r.buyerId === buyerProfile.id ||
      r.buyerOrg === buyerProfile.businessName ||
      r.buyerName === buyerProfile.contactPerson
  );

  const filteredRequests = buyerRequests.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return r.status === 'New' || r.status === 'Viewed';
    if (activeFilter === 'offers') return r.status === 'Offer Sent';
    if (activeFilter === 'closed') return r.status === 'Accepted' || r.status === 'Rejected';
    return true;
  });

  const handleAcceptOffer = async (req: B2BQuoteRequest) => {
    const reqId = req.id || req.requestId;
    if (!reqId || !onUpdateB2BStatus) return;
    setActionProcessingId(reqId);
    try {
      await onUpdateB2BStatus(reqId, 'Accepted');
    } finally {
      setActionProcessingId(null);
    }
  };

  const handleRejectOffer = async (req: B2BQuoteRequest) => {
    const reqId = req.id || req.requestId;
    if (!reqId || !onUpdateB2BStatus) return;
    setActionProcessingId(reqId);
    try {
      await onUpdateB2BStatus(reqId, 'Rejected', { rejectionReason: 'Declined by buyer' });
    } finally {
      setActionProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="buyer-requests-page">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#C25E3E]/10 text-[#C25E3E] border border-[#C25E3E]/20">
              Wholesale Sourcing
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {buyerRequests.length} Total RFQs Submitted
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
            My Quotation Requests
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Manage your bulk RFQs, negotiate directly with master artisans, and accept fair offers.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('b2b-marketplace')}
          id="buyer-rfq-new-quote-btn"
          className="px-5 py-2.5 rounded-2xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white text-xs font-bold shadow-md shadow-[#C25E3E]/20 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Package className="w-4 h-4" />
          <span>+ Request New Wholesale Quote</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          All Requests ({buyerRequests.length})
        </button>

        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Pending Review ({buyerRequests.filter((r) => r.status === 'New' || r.status === 'Viewed').length})
        </button>

        <button
          onClick={() => setActiveFilter('offers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'offers'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Offers Received ({buyerRequests.filter((r) => r.status === 'Offer Sent').length})
        </button>

        <button
          onClick={() => setActiveFilter('closed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeFilter === 'closed'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          Closed Deals ({buyerRequests.filter((r) => r.status === 'Accepted' || r.status === 'Rejected').length})
        </button>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-stone-200 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#C25E3E] flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No quotation requests found</h3>
          <p className="text-xs sm:text-sm text-stone-500">
            {activeFilter === 'all'
              ? 'You have not submitted any wholesale quote requests yet. Explore the marketplace to send RFQs.'
              : `No requests currently match the "${activeFilter}" filter.`}
          </p>
          <button
            onClick={() => setCurrentTab('b2b-marketplace')}
            className="px-5 py-2.5 rounded-xl bg-[#C25E3E] text-white text-xs font-bold hover:bg-[#A94B2E] transition-colors"
          >
            Explore B2B Marketplace
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const reqId = req.id || req.requestId;
            const isOfferSent = req.status === 'Offer Sent';
            const isAccepted = req.status === 'Accepted';
            const isRejected = req.status === 'Rejected';
            const isProcessing = actionProcessingId === reqId;

            return (
              <div
                key={reqId}
                className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4"
                id={`buyer-rfq-card-${reqId}`}
              >
                {/* Top Row: Artisan info & Status badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-[#C25E3E] flex items-center justify-center font-bold text-base shadow-inner">
                      👨‍🎨
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          Artisan: {req.artisanName || 'Master Craftsman'}
                        </h3>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {req.artisanLocation || 'Jaipur, Rajasthan'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">
                        Submitted: {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2">
                    {req.status === 'New' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Status: New (Awaiting Artisan Review)
                      </span>
                    )}
                    {req.status === 'Viewed' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        Status: Viewed by Artisan
                      </span>
                    )}
                    {req.status === 'Offer Sent' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        Status: Wholesale Offer Received!
                      </span>
                    )}
                    {req.status === 'Accepted' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Status: Order Accepted
                      </span>
                    )}
                    {req.status === 'Rejected' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Status: Declined
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Row: Product & Request Specs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-50/70 p-4 rounded-2xl border border-stone-200/60">
                  {/* Product Preview */}
                  <div className="flex items-center gap-3">
                    {req.productImage && (
                      <img
                        src={req.productImage}
                        alt={req.productName}
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-[#C25E3E] uppercase">{req.craftType || 'Artisan Craft'}</span>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{req.productName}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">Product ID: {req.productId}</p>
                    </div>
                  </div>

                  {/* Quantity & Target Price */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-stone-600">
                      <span>Quantity Requested:</span>
                      <strong className="text-slate-900 text-sm">{req.quantity} units</strong>
                    </div>
                    <div className="flex items-center justify-between text-stone-600">
                      <span>Your Target Price:</span>
                      <strong className="text-[#C25E3E] text-sm">₹{req.targetPrice}/unit</strong>
                    </div>
                    <div className="flex items-center justify-between text-stone-600">
                      <span>Delivery Location:</span>
                      <strong className="text-slate-800">{req.deliveryLocation}</strong>
                    </div>
                  </div>

                  {/* Buyer Message */}
                  <div className="text-xs space-y-1">
                    <span className="text-stone-500 font-semibold block">Your Notes / Specifications:</span>
                    <p className="text-stone-700 italic bg-white p-2.5 rounded-xl border border-stone-200">
                      &quot;{req.message}&quot;
                    </p>
                  </div>
                </div>

                {/* Artisan Counter-Offer Box */}
                {isOfferSent && (
                  <div className="bg-purple-50/90 border border-purple-200 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-purple-950 font-bold text-sm">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>Artisan Counter-Offer Details</span>
                      </div>
                      <span className="text-xs font-semibold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-md">
                        Direct Wholesale Response
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-xl border border-purple-100">
                        <span className="text-stone-500 block text-[11px]">Offered Wholesale Price:</span>
                        <strong className="text-lg font-extrabold text-purple-950 font-serif">₹{req.offeredPrice} / unit</strong>
                        <span className="text-[10px] text-stone-400 block mt-0.5">Total: ₹{(req.offeredPrice || 0) * (req.quantity || 1)}</span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-purple-100">
                        <span className="text-stone-500 block text-[11px]">Estimated Lead Time:</span>
                        <strong className="text-base font-bold text-slate-900">{req.offeredDeliveryDays || 7} Days</strong>
                        <span className="text-[10px] text-stone-400 block mt-0.5">Direct studio dispatch</span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-purple-100">
                        <span className="text-stone-500 block text-[11px]">Artisan Note:</span>
                        <p className="text-stone-700 italic mt-0.5 truncate">
                          &quot;{req.artisanOfferMessage || 'We are ready to craft this batch with master quality standards.'}&quot;
                        </p>
                      </div>
                    </div>

                    {/* Offer Decision Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleRejectOffer(req)}
                        disabled={isProcessing}
                        id={`buyer-reject-offer-${reqId}`}
                        className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors disabled:opacity-40"
                      >
                        Decline Offer
                      </button>

                      <button
                        onClick={() => handleAcceptOffer(req)}
                        disabled={isProcessing}
                        id={`buyer-accept-offer-${reqId}`}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-40"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Offer & Confirm Bulk Deal</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Actions Row */}
                <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                  <span className="text-xs text-stone-400">
                    RFQ ID: <code className="text-stone-600">{reqId}</code>
                  </span>

                  <button
                    onClick={() => setCurrentTab('messages')}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-stone-600" />
                    <span>Message Artisan</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
