import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  BadgeIndianRupee,
  Calendar,
  Layers,
  Sparkles,
  Camera,
  Upload,
  PlusCircle,
  ArrowRight,
  Eye,
  X,
  MessageSquare,
  Package,
  MapPin,
  Check,
} from 'lucide-react';
import { CustomOrder, LanguageCode, OrderStatus, PageTab } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { useAuth } from '../../context/AuthContext';
import {
  addOrderProgressUpdate,
  togglePaymentMilestoneStatus,
  updateOrderStatus,
} from '../../services/orderService';
import { compressDataUrl } from '../../utils/imageCompression';

interface OrdersPageProps {
  orders: CustomOrder[];
  setOrders: React.Dispatch<React.SetStateAction<CustomOrder[]>>;
  setCurrentTab: (tab: PageTab) => void;
  currentLang: LanguageCode;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  orders,
  setOrders,
  setCurrentTab,
  currentLang,
}) => {
  const { user } = useAuth();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  // New Progress Update form state
  const [isAddProgressOpen, setIsAddProgressOpen] = useState(false);
  const [stageTitle, setStageTitle] = useState('');
  const [stageDesc, setStageDesc] = useState('');
  const [stageImage, setStageImage] = useState<string | null>(null);
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  const filteredOrders拼 = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'in_progress') return o.status !== 'completed' && o.status !== 'delivered';
    if (statusFilter === 'completed') return o.status === 'completed' || o.status === 'delivered';
    return true;
  });

  const handleStageImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = reader.result as string;
      try {
        const compressed = await compressDataUrl(raw, 1000, 0.75);
        setStageImage(compressed);
      } catch {
        setStageImage(raw);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !stageTitle.trim()) return;

    setIsSavingProgress(true);
    const artistId = user?.uid || 'sample-artist';
    const newUpdate = {
      id: `prog-${Date.now()}`,
      stageTitle: stageTitle.trim(),
      description: stageDesc.trim() || 'Work in progress stage completed by artisan.',
      imageUrl: stageImage || undefined,
      timestamp: new Date().toISOString(),
      completed: true,
    };

    try {
      await addOrderProgressUpdate(selectedOrder.id, artistId, newUpdate);
      const updatedOrder: CustomOrder = {
        ...selectedOrder,
        status: 'progress_update',
        progressUpdates: [...selectedOrder.progressUpdates, newUpdate],
      };

      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? updatedOrder : o))
      );
      setSelectedOrder(updatedOrder);
      setStageTitle('');
      setStageDesc('');
      setStageImage(null);
      setIsAddProgressOpen(false);
    } catch (err) {
      console.error('Error adding progress update:', err);
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleToggleMilestone = async (milestoneId: string) => {
    if (!selectedOrder) return;
    const artistId = user?.uid || 'sample-artist';
    try {
      await togglePaymentMilestoneStatus(selectedOrder.id, artistId, milestoneId);
      const updatedMilestones = selectedOrder.paymentMilestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              status: m.status === 'paid' ? ('pending' as const) : ('paid' as const),
              paidAt: m.status === 'paid' ? undefined : new Date().toISOString(),
            }
          : m
      );
      const updatedOrder = { ...selectedOrder, paymentMilestones: updatedMilestones };
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? updatedOrder : o)));
      setSelectedOrder(updatedOrder);
    } catch (err) {
      console.error('Error toggling milestone:', err);
    }
  };

  const handleAdvanceOrderStatus = async (nextStatus: OrderStatus) => {
    if (!selectedOrder) return;
    const artistId = user?.uid || 'sample-artist';
    try {
      await updateOrderStatus(selectedOrder.id, artistId, nextStatus);
      const updatedOrder = { ...selectedOrder, status: nextStatus };
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? updatedOrder : o)));
      setSelectedOrder(updatedOrder);
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const deliverySteps = [
    { key: 'confirmed', label: 'Order Confirmed' },
    { key: 'in_progress', label: 'Artwork In Progress' },
    { key: 'completed', label: 'Artwork Completed' },
    { key: 'packed', label: 'Securely Packed' },
    { key: 'shipped', label: 'Dispatched / Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C25E3E]/10 text-[#C25E3E] border border-[#C25E3E]/20 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              Commission Contracts
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {orders.length} custom commission{orders.length === 1 ? '' : 's'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-serif">
            Orders & Custom Progress
          </h1>
          <p className="text-sm text-stone-500 mt-1 max-w-xl">
            Track commission lifecycle from raw shaping to kiln curing, share progress photos with clients, and manage milestone payments.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'in_progress' ? 'bg-white text-slate-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            In Progress ({orders.filter((o) => o.status !== 'completed' && o.status !== 'delivered').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-stone-600'
            }`}
          >
            Delivered
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders拼.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-stone-200 p-12 text-center max-w-xl mx-auto space-y-3">
          <FileText className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No custom orders found</h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            When you accept customer commission requests from the Requests page, custom orders with progress and milestone trackers will be created here.
          </p>
          <button
            onClick={() => setCurrentTab('requests')}
            className="px-4 py-2 rounded-xl bg-[#C25E3E] text-white text-xs font-bold hover:bg-[#a94e32]"
          >
            View Customer Requests
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders拼.map((order) => {
            const paidMilestones = order.paymentMilestones.filter((m) => m.status === 'paid');
            const totalPaid = paidMilestones.reduce((acc, m) => acc + m.amount, 0);
            const percentPaid = Math.round((totalPaid / (order.totalPrice || 1)) * 100);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top line */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#C25E3E] bg-[#C25E3E]/10 px-2.5 py-0.5 rounded-full">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-stone-400 ml-2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Artwork & Customer */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {order.artworkTitle}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Client: <span className="font-semibold text-slate-700">{order.customerName}</span> ({order.customerLocation})
                    </p>
                  </div>

                  {/* Progress updates count */}
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-600">Artwork Progress Stages:</span>
                    <span className="font-bold text-slate-900">
                      {order.progressUpdates.length} update{order.progressUpdates.length === 1 ? '' : 's'} recorded
                    </span>
                  </div>

                  {/* Payment status bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 font-medium">Milestones Paid:</span>
                      <span className="font-bold text-slate-900">
                        ₹{totalPaid.toLocaleString('en-IN')} / ₹{order.totalPrice.toLocaleString('en-IN')} ({percentPaid}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentPaid}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-6 border-t border-stone-100 flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Target: {order.deadlineDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage Order</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail & Progress Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 my-auto animate-in zoom-in-95 duration-200 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#C25E3E] bg-[#C25E3E]/10 px-2.5 py-0.5 rounded-full">
                    {selectedOrder.orderNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase">
                    {selectedOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                  {selectedOrder.artworkTitle}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Client: <span className="font-semibold text-slate-800">{selectedOrder.customerName}</span> • {selectedOrder.customerLocation}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-slate-900 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Control Bar */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-stone-500 font-medium block">Current Contract State:</span>
                <span className="text-sm font-bold text-slate-900 capitalize">
                  {selectedOrder.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAdvanceOrderStatus('in_progress')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleAdvanceOrderStatus('ready_for_delivery')}
                  className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100"
                >
                  Ready for Delivery
                </button>
                <button
                  onClick={() => handleAdvanceOrderStatus('completed')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                >
                  Mark Completed
                </button>
              </div>
            </div>

            {/* 1. CHRONOLOGICAL ARTWORK PROGRESS TRACKER */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#C25E3E]" />
                    <span>Artwork Progress Log & Photos</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Upload stage photos and notes as you craft the artwork.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddProgressOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#C25E3E] text-white text-xs font-bold hover:bg-[#a94e32] flex items-center gap-1.5 shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Add Progress Stage</span>
                </button>
              </div>

              {/* Add Progress Form Overlay */}
              {isAddProgressOpen && (
                <form onSubmit={handleSaveProgress} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">New Artwork Progress Update</span>
                    <button
                      type="button"
                      onClick={() => setIsAddProgressOpen(false)}
                      className="text-stone-400 hover:text-slate-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    value={stageTitle}
                    onChange={(e) => setStageTitle(e.target.value)}
                    placeholder="e.g. Day 5: Kiln Firing & Natural Oxide Glaze"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs"
                  />

                  <textarea
                    rows={2}
                    value={stageDesc}
                    onChange={(e) => setStageDesc(e.target.value)}
                    placeholder="Describe craftsmanship details, technique applied, or current readiness..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs"
                  />

                  <div className="flex items-center gap-3">
                    <label className="px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-bold cursor-pointer hover:bg-stone-50 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-stone-500" />
                      <span>{stageImage ? 'Change Photo' : 'Upload Stage Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleStageImageUpload}
                        className="hidden"
                      />
                    </label>
                    {stageImage && (
                      <span className="text-xs font-bold text-emerald-600">✓ Photo Attached</span>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddProgressOpen(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingProgress}
                      className="px-4 py-1.5 rounded-xl bg-[#C25E3E] text-white text-xs font-bold"
                    >
                      {isSavingProgress ? 'Saving...' : 'Post Progress Update'}
                    </button>
                  </div>
                </form>
              )}

              {/* Progress Timeline Stream */}
              <div className="space-y-3">
                {selectedOrder.progressUpdates.map((update, idx) => (
                  <div
                    key={update.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200/80 flex flex-col sm:flex-row gap-4"
                  >
                    {update.imageUrl && (
                      <div className="w-full sm:w-28 h-28 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                        <img
                          src={update.imageUrl}
                          alt={update.stageTitle}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {update.stageTitle}
                        </h4>
                        <span className="text-[10px] text-stone-400">
                          {new Date(update.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {update.description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 pt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Workshop Stage
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. MILESTONE PAYMENTS UI */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BadgeIndianRupee className="w-4 h-4 text-emerald-600" />
                <span>Milestone Payment Schedule (Total: ₹{selectedOrder.totalPrice.toLocaleString('en-IN')})</span>
              </h3>

              <div className="space-y-2">
                {selectedOrder.paymentMilestones.map((m) => {
                  const isPaid = m.status === 'paid';
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                        isPaid
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleMilestone(m.id)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                            isPaid
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-stone-300 hover:border-emerald-500'
                          }`}
                        >
                          {isPaid && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            {m.title}
                          </span>
                          <span className="text-[11px] text-stone-500">
                            {m.percentage}% of total {isPaid ? `• Paid on ${new Date(m.paidAt || Date.now()).toLocaleDateString()}` : '• Pending client release'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900 font-serif block">
                          ₹{m.amount.toLocaleString('en-IN')}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            isPaid ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {isPaid ? '✓ Paid' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. VISUAL DELIVERY TRACKING */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Delivery & Logistics Stepper</span>
              </h3>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {deliverySteps.map((step, idx) => (
                    <div
                      key={step.key}
                      className="p-2.5 rounded-xl bg-white border border-stone-200 text-center space-y-1"
                    >
                      <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold flex items-center justify-center mx-auto">
                        {idx + 1}
                      </span>
                      <p className="text-[10px] font-bold text-slate-800 leading-tight">
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 text-xs text-stone-500 flex flex-wrap items-center justify-between">
                  <span>Carrier: {selectedOrder.deliveryTracking?.carrier || 'India Post Speed Post'}</span>
                  <span>Tracking Code: {selectedOrder.deliveryTracking?.trackingNumber || `KC-TRK-${selectedOrder.orderNumber}`}</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Close */}
            <div className="pt-4 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close Manager
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
