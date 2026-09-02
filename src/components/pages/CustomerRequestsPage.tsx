import React, { useState } from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Calendar,
  BadgeIndianRupee,
  MapPin,
  Sparkles,
  ArrowRight,
  Eye,
  Check,
  X,
  AlertCircle,
  FileText,
  Lock,
  Store,
  Send,
  Building,
  Package,
  IndianRupee,
  Truck,
} from 'lucide-react';
import { CustomerRequest, LanguageCode, PageTab, RequestStatus, B2BQuoteRequest, B2BRequestStatus } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { useAuth } from '../../context/AuthContext';
import { updateRequestStatusInDb } from '../../services/customerRequestService';
import { saveConversationToDb } from '../../services/conversationService';
import { saveOrderToDb } from '../../services/orderService';

interface CustomerRequestsPageProps {
  requests: CustomerRequest[];
  setRequests: React.Dispatch<React.SetStateAction<CustomerRequest[]>>;
  setCurrentTab: (tab: PageTab) => void;
  currentLang: LanguageCode;
  b2bRequests?: B2BQuoteRequest[];
  onOpenSendOffer?: (request: B2BQuoteRequest) => void;
  onUpdateB2BStatus?: (requestId: string, status: B2BRequestStatus, details?: any) => Promise<void> | void;
}

export const CustomerRequestsPage: React.FC<CustomerRequestsPageProps> = ({
  requests,
  setRequests,
  setCurrentTab,
  currentLang,
  b2bRequests = [],
  onOpenSendOffer,
  onUpdateB2BStatus,
}) => {
  const { user, artisan } = useAuth();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [requestChannel, setRequestChannel] = useState<'b2b' | 'commissions'>('b2b');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);

  // Filter commission requests
  const filteredCommissionRequests = requests.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.status === activeFilter;
  });

  // Filter B2B wholesale requests
  const filteredB2BRequests = b2bRequests.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return r.status === 'New' || r.status === 'Viewed';
    if (activeFilter === 'accepted') return r.status === 'Accepted' || r.status === 'Offer Sent';
    if (activeFilter === 'rejected') return r.status === 'Rejected';
    return true;
  });

  const pendingCommissionsCount = requests.filter((r) => r.status === 'pending').length;
  const newB2BCount = b2bRequests.filter((r) => r.status === 'New' || r.status === 'Viewed').length;

  const handleAcceptRequest = async (req: CustomerRequest) => {
    setActionProcessingId(req.id);
    const artistId = user?.uid || 'sample-artist';
    const artistName = artisan?.name || 'Artisan';

    try {
      // 1. Create linked custom order
      const newOrder = await saveOrderToDb(artistId, {
        requestId: req.id,
        orderNumber: `KC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        customerName: req.customerName,
        customerEmail: req.customerEmail,
        customerPhone: req.customerPhone,
        customerLocation: req.customerLocation,
        artworkTitle: req.title,
        craftType: artisan?.craftType || 'Traditional Handicrafts',
        description: req.description,
        referenceImages: req.referenceImages || [],
        totalPrice: req.budget,
        advanceAmount: Math.round(req.budget * 0.2),
        deadlineDate: req.deliveryDateRequested,
        status: 'accepted',
        progressUpdates: [
          {
            id: `p-${Date.now()}`,
            stageTitle: 'Order Accepted by Artisan',
            description: `Commission accepted by ${artistName}. Preparing workshop materials and requirements confirmation.`,
            timestamp: new Date().toISOString(),
            completed: true,
          }
        ],
        paymentMilestones: [
          { id: `m-1`, title: 'Advance Booking Token (20%)', amount: Math.round(req.budget * 0.2), percentage: 20, status: 'pending' },
          { id: `m-2`, title: 'Artwork Mid-Progress (40%)', amount: Math.round(req.budget * 0.4), percentage: 40, status: 'pending' },
          { id: `m-3`, title: 'Final Finishing & Packaging (40%)', amount: Math.round(req.budget * 0.4), percentage: 40, status: 'pending' },
        ],
        deliveryTracking: {
          status: 'confirmed',
          carrier: 'India Post Speed Post / Local Logistics',
        }
      });

      // 2. Create linked Conversation in Messages
      const newConv = await saveConversationToDb(artistId, {
        requestId: req.id,
        customerName: req.customerName,
        customerAvatar: req.customerAvatar,
        customerLocation: req.customerLocation,
        artworkTitle: req.title,
        budget: req.budget,
        status: 'active',
        lastMessage: `Commission request accepted! Order #${newOrder.orderNumber} initiated.`,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderId: artistId,
            senderRole: 'artist',
            senderName: artistName,
            text: `Namaste ${req.customerName} ji. I have accepted your custom commission request for "${req.title}". Let me know if you have any special instructions before I begin shaping the base materials.`,
            createdAt: new Date().toISOString(),
          }
        ]
      });

      // 3. Update Request status
      await updateRequestStatusInDb(req.id, artistId, 'accepted', newOrder.id, newConv.id);

      // 4. Update local state
      setRequests((prev) =>
        prev.map((r) =>
          r.id === req.id
            ? { ...r, status: 'accepted', linkedOrderId: newOrder.id, linkedConversationId: newConv.id }
            : r
        )
      );
    } catch (err) {
      console.error('Error accepting request:', err);
    } finally {
      setActionProcessingId(null);
    }
  };

  const handleOpenReject = (req: CustomerRequest) => {
    setSelectedRequest(req);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest) return;
    const artistId = user?.uid || 'sample-artist';
    setActionProcessingId(selectedRequest.id);

    try {
      await updateRequestStatusInDb(selectedRequest.id, artistId, 'rejected');
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: 'rejected', rejectionReason: rejectionReason || 'Unavailable for requested timeframe.' }
            : r
        )
      );
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error('Error rejecting request:', err);
    } finally {
      setActionProcessingId(null);
    }
  };

  const handleB2BAccept = async (req: B2BQuoteRequest) => {
    if (onUpdateB2BStatus) {
      await onUpdateB2BStatus(req.id || req.requestId, 'Accepted');
    }
  };

  const handleB2BReject = async (req: B2BQuoteRequest) => {
    if (onUpdateB2BStatus) {
      await onUpdateB2BStatus(req.id || req.requestId, 'Rejected', { rejectionReason: 'Declined by artisan' });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200" id="artisan-requests-page">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C25E3E]/10 text-[#C25E3E] border border-[#C25E3E]/20 flex items-center gap-1">
              <Inbox className="w-3.5 h-3.5" />
              Artisan Inquiries & Orders
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {newB2BCount} B2B pending • {pendingCommissionsCount} commissions
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-serif">
            Artisan Requests & Quotations
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-xl">
            Review B2B wholesale quotation RFQs, send counter-offers with bulk pricing, and manage custom client commissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTab('b2b-marketplace')}
            className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#C25E3E] border border-amber-200 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Store className="w-4 h-4" />
            <span>Open B2B Marketplace →</span>
          </button>
        </div>
      </div>

      {/* Channel Switcher (B2B Wholesale vs Custom Commissions) */}
      <div className="flex items-center gap-3 bg-stone-100 p-1.5 rounded-2xl max-w-md border border-stone-200">
        <button
          onClick={() => setRequestChannel('b2b')}
          id="requests-tab-b2b"
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            requestChannel === 'b2b'
              ? 'bg-[#C25E3E] text-white shadow-sm'
              : 'text-stone-700 hover:text-slate-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>B2B Wholesale RFQs</span>
          {b2bRequests.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#C25E3E]">
              {b2bRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setRequestChannel('commissions')}
          id="requests-tab-commissions"
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            requestChannel === 'commissions'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-stone-700 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Custom Commissions</span>
          {requests.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-slate-800">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* SECTION 1: B2B WHOLESALE REQUESTS */}
      {requestChannel === 'b2b' && (
        <div className="space-y-4">
          {filteredB2BRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-stone-200 p-12 text-center max-w-xl mx-auto space-y-3">
              <Store className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No B2B wholesale requests</h3>
              <p className="text-sm text-stone-500 max-w-md mx-auto">
                When retail chains or corporate buyers request quotations from the B2B Marketplace, they will appear here.
              </p>
              <button
                onClick={() => setCurrentTab('b2b-marketplace')}
                className="px-4 py-2 rounded-xl bg-[#C25E3E] text-white text-xs font-bold"
              >
                Go to B2B Marketplace
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredB2BRequests.map((req) => {
                const isOfferSent = req.status === 'Offer Sent';
                const isAccepted = req.status === 'Accepted';
                const isRejected = req.status === 'Rejected';

                return (
                  <div
                    key={req.id || req.requestId}
                    className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4"
                    id={`artisan-b2b-request-${req.id || req.requestId}`}
                  >
                    {/* Top Row: Buyer info & Status badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-[#C25E3E] flex items-center justify-center font-bold text-base shadow-inner">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              Buyer: {req.buyerOrg || req.buyerName}
                            </h3>
                            <span className="text-stone-300">•</span>
                            <span className="text-xs text-stone-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-stone-400" />
                              {req.buyerLocation || req.deliveryLocation}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400">
                            Requested: {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2">
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
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                            Status: Offer Sent
                          </span>
                        )}
                        {req.status === 'Accepted' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Status: Accepted
                          </span>
                        )}
                        {req.status === 'Rejected' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Status: Rejected
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

                      {/* Request Quantity & Target Price */}
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between text-stone-600">
                          <span>Quantity Requested:</span>
                          <strong className="text-slate-900 text-sm">{req.quantity} units</strong>
                        </div>
                        <div className="flex items-center justify-between text-stone-600">
                          <span>Target Price / Unit:</span>
                          <strong className="text-[#C25E3E] text-sm">₹{req.targetPrice}/unit</strong>
                        </div>
                        <div className="flex items-center justify-between text-stone-600">
                          <span>Delivery Location:</span>
                          <strong className="text-slate-800">{req.deliveryLocation}</strong>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="text-xs space-y-1">
                        <span className="text-stone-500 font-semibold block">Buyer Message:</span>
                        <p className="text-stone-700 italic bg-white p-2.5 rounded-xl border border-stone-200">
                          &quot;{req.message}&quot;
                        </p>
                      </div>
                    </div>

                    {/* Sent Offer Summary (if Offer Sent) */}
                    {isOfferSent && (
                      <div className="bg-purple-50/70 border border-purple-200/80 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-purple-950 font-medium">
                          <Sparkles className="w-4 h-4 text-purple-700" />
                          <span>
                            You sent a wholesale offer of <strong className="text-purple-900 font-bold">₹{req.offeredPrice}/unit</strong> with <strong className="text-purple-900 font-bold">{req.offeredDeliveryDays || 7} days lead time</strong>.
                          </span>
                        </div>
                        {req.artisanOfferMessage && (
                          <span className="text-purple-800 italic truncate max-w-sm">
                            &quot;{req.artisanOfferMessage}&quot;
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bottom Actions Row: [ Accept ] [ Send Offer ] [ Reject ] */}
                    <div className="flex items-center justify-end gap-3 pt-2 flex-wrap">
                      <button
                        onClick={() => handleB2BReject(req)}
                        disabled={isRejected}
                        id={`reject-b2b-${req.id || req.requestId}`}
                        className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors disabled:opacity-40"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => {
                          if (onOpenSendOffer) onOpenSendOffer(req);
                        }}
                        disabled={isRejected || isAccepted}
                        id={`send-offer-${req.id || req.requestId}`}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-[#C25E3E] hover:from-amber-700 hover:to-[#A94B2E] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-40"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isOfferSent ? 'Edit Offer' : 'Send Offer'}</span>
                      </button>

                      <button
                        onClick={() => handleB2BAccept(req)}
                        disabled={isAccepted || isRejected}
                        id={`accept-b2b-${req.id || req.requestId}`}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-40"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isAccepted ? 'Accepted' : 'Accept Request'}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: CUSTOM COMMISSION REQUESTS */}
      {requestChannel === 'commissions' && (
        <div className="space-y-4">
          {filteredCommissionRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-stone-200 p-12 text-center max-w-xl mx-auto space-y-3">
              <Inbox className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No commission requests found</h3>
              <p className="text-sm text-stone-500 max-w-md mx-auto">
                Custom commission requests sent by individual art collectors will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCommissionRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{req.title}</h3>
                      <p className="text-xs text-stone-500">From: {req.customerName} ({req.customerLocation})</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600">{req.description}</p>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="font-bold text-[#C25E3E]">Budget: ₹{req.budget}</span>
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenReject(req)}
                          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 text-xs font-bold"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAcceptRequest(req)}
                          className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                        >
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
