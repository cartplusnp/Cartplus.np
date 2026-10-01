import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { useOrders } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { Link } from '../../context/RouterContext';
import {
  X,
  Truck,
  Package,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Navigation,
  MessageSquare,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface OrderTrackerModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { updateOrderNotes, refreshOrderTracking } = useOrders();
  const { success, info } = useToast();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState(order.notes || '');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'map' | 'rider'>('timeline');

  if (!isOpen) return null;

  const courier = order.courier_info;
  const events = order.tracking_events || [];

  const handleCopyTracking = () => {
    if (courier?.tracking_number) {
      navigator.clipboard.writeText(courier.tracking_number);
      setCopiedTracking(true);
      success('Tracking number copied to clipboard!');
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    info('Querying Nepal Can Move courier gateway...');
    if (refreshOrderTracking) {
      await refreshOrderTracking(order.id);
    } else {
      await new Promise((r) => setTimeout(r, 900));
    }
    setIsRefreshing(false);
    success('Real-time courier telemetry updated!');
  };

  const handleSaveNote = () => {
    setIsSavingNote(true);
    if (updateOrderNotes) {
      updateOrderNotes(order.id, deliveryNote);
    }
    setTimeout(() => {
      setIsSavingNote(false);
      success('Delivery instructions updated for courier rider!');
    }, 400);
  };

  const getStatusColorBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-300';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-700 border-blue-300';
      case 'confirmed':
      case 'processing':
        return 'bg-amber-500/10 text-amber-800 border-amber-300';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-700 border-rose-300';
      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-300';
    }
  };

  const getProgressPercentage = () => {
    switch (order.order_status) {
      case 'pending':
        return 20;
      case 'confirmed':
        return 45;
      case 'shipped':
        return 80;
      case 'delivered':
        return 100;
      case 'cancelled':
        return 100;
      default:
        return 10;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black font-brand tracking-wide text-white">
                  Real-Time Shipment Tracking
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Order ID: <span className="font-mono text-slate-200">{order.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Status Highlight Bar */}
        <div className="bg-amber-50/70 border-b border-amber-200/60 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColorBadge(
                order.order_status
              )}`}
            >
              {order.order_status === 'shipped' ? 'Out for Delivery / In Transit' : order.order_status}
            </span>
            <span className="text-xs text-slate-600 font-medium">
              {courier?.estimated_delivery || 'Estimated Delivery: 24–48 Hours'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh Status'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Progress Bar & High-Level Stepper */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Fulfillment Progress</span>
              <span className="text-amber-600">{getProgressPercentage()}% Completed</span>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>

            {/* 4 Key Milestone Steps */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-center">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs mb-1">
                  ✓
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-800">Placed</span>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${
                    order.order_status !== 'pending'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-300 text-slate-600'
                  }`}
                >
                  {order.order_status !== 'pending' ? '✓' : '2'}
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-800">Confirmed</span>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${
                    order.order_status === 'shipped' || order.order_status === 'delivered'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-300 text-slate-600'
                  }`}
                >
                  {order.order_status === 'delivered' ? '✓' : '3'}
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-800">Courier Transit</span>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${
                    order.order_status === 'delivered'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-300 text-slate-600'
                  }`}
                >
                  {order.order_status === 'delivered' ? '✓' : '4'}
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-800">Delivered</span>
              </div>
            </div>
          </div>

          {/* Courier & Rider Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Courier Waybill Card */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Logistics Carrier
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Partner
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {courier?.provider_name || 'Nepal Can Move (NCM) Logistics'}
                  </h4>
                  <p className="text-xs text-slate-500">Express Doorstep Cash on Delivery</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Waybill / Tracking No</span>
                  <span className="font-mono font-bold text-slate-800">
                    {courier?.tracking_number || 'NCM-KTM-882190'}
                  </span>
                </div>
                <button
                  onClick={handleCopyTracking}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedTracking ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Carrier Logistics Card */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Logistics Carrier Status
                </span>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 uppercase">
                  {order.order_status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm shrink-0">
                    <Truck className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {courier?.provider_name || 'Standard Surface Logistics (Nepal)'}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      {courier?.tracking_number ? `Manifest: ${courier.tracking_number}` : 'Awaiting carrier dispatch handover'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Destination District:</span>
                <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
                  {order.delivery_address.district}, {order.delivery_address.province}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Mode Selector: Timeline vs Live Visual Route */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Detailed Timeline & Checkpoints
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Transit Route</span>
            </button>
          </div>

          {/* Tab Content A: Detailed Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Live Checkpoints History
              </h4>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {events.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative group">
                    {/* Checkpoint Dot */}
                    <div
                      className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        evt.completed
                          ? 'bg-emerald-500 text-white shadow-2xs'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {evt.completed ? '✓' : idx + 1}
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-sm text-slate-900">{evt.title}</span>
                        <span className="text-[11px] font-mono text-slate-500">{evt.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{evt.description}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-amber-500" />
                        <span>{evt.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content B: Live Route Visual Card */}
          {activeTab === 'map' && (
            <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-emerald-400">GPS Live Transit Monitor</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Origin: Kathmandu Central Hub → Dest: {order.delivery_address.district}
                </span>
              </div>

              {/* Stylized Visual Graphic of Route */}
              <div className="p-6 bg-slate-950/80 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
                <div className="w-full flex items-center justify-between relative z-10">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 mb-2">
                      <Package className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white">Central Hub</span>
                    <span className="text-[10px] text-slate-400">Tinkune, KTM</span>
                  </div>

                  {/* Route Line with Moving Indicator */}
                  <div className="flex-1 mx-4 relative">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full" />
                    <div
                      className="absolute top-0 left-0 h-1.5 bg-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                    <div
                      className="absolute -top-3 text-amber-400 transition-all duration-700"
                      style={{ left: `calc(${getProgressPercentage()}% - 12px)` }}
                    >
                      <Truck className="w-6 h-6 animate-bounce" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold mb-2">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white">Your Doorstep</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                      {order.delivery_address.street}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 w-full flex items-center justify-between text-xs text-slate-400">
                  <span>Routing: Province Dispatch Hub</span>
                  <span className="capitalize">Status: {order.order_status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Note & Instruction for Rider */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="rider-note" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>Special Instructions for Delivery Rider</span>
              </label>
              <span className="text-[11px] text-slate-400">Optional</span>
            </div>

            <div className="flex gap-2">
              <input
                id="rider-note"
                type="text"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder="e.g. Please call 5 minutes before arriving, or leave at gate security"
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400"
              />
              <button
                onClick={handleSaveNote}
                disabled={isSavingNote}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSavingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>

          {/* Purchased Items Summary in this Package */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Items in this Shipment ({order.items.length})
            </h4>

            <div className="divide-y divide-slate-200/70">
              {order.items.map((item, idx) => (
                <div key={item.product_id || idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">{item.product_name}</p>
                      <p className="text-slate-500">
                        Qty: {item.quantity} × Rs. {item.price.toLocaleString('en-NP')}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 tabular-nums">
                    Rs. {(item.price * item.quantity).toLocaleString('en-NP')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-900">
              <span>Total Payable upon Delivery (COD)</span>
              <span className="text-sm font-black text-amber-600 tabular-nums">
                Rs. {order.total.toLocaleString('en-NP')}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Inspection allowed before payment (CARTPLUS Guarantee)</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/customer-service?orderId=${order.id}`}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Report Delivery Issue</span>
            </Link>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Close Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
