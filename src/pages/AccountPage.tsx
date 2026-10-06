import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useSupport } from '../context/SupportContext';
import { useRouter, Link } from '../context/RouterContext';
import { EmptyState } from '../components/common/EmptyState';
import { OrderTrackerModal } from '../components/account/OrderTrackerModal';
import { AnimatedNumber } from '../components/motion/AnimatedNumber';
import { NEPAL_PROVINCES } from '../data/nepalLocations';
import { Address, SupportRequest, SupportMessage, Order } from '../types';
import {
  User,
  Package,
  MapPin,
  Headphones,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  LogOut,
  Truck,
  Navigation,
  Copy,
  ChevronRight,
  ExternalLink,
  Phone,
  Radio,
} from 'lucide-react';

interface AccountPageProps {
  initialTab?: 'overview' | 'orders' | 'addresses' | 'support';
}

export const AccountPage: React.FC<AccountPageProps> = ({ initialTab = 'overview' }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { orders, addresses, addAddress, deleteAddress, setDefaultAddress } = useOrders();
  const { getUserRequests } = useSupport();
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'support'>(
    initialTab
  );

  // Selected order for real-time tracking modal
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addrName, setAddrName] = useState(user?.name || '');
  const [addrPhone, setAddrPhone] = useState(user?.phone || '');
  const [addrProvince, setAddrProvince] = useState(NEPAL_PROVINCES[0].name);
  const [addrDistrict, setAddrDistrict] = useState(NEPAL_PROVINCES[0].districts[0]);
  const [addrMunicipality, setAddrMunicipality] = useState('');
  const [addrWard, setAddrWard] = useState('Ward 1');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={<User className="w-10 h-10 stroke-1 text-slate-400" />}
          title="Sign In to Access Your Account"
          description="You must be signed in to view your orders, manage delivery addresses, and submit customer service tickets."
          actionText="Sign In Now"
          actionHref="/login"
        />
      </div>
    );
  }

  const userTickets = getUserRequests(user?.email);

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrMunicipality || !addrStreet) return;

    addAddress({
      full_name: addrName,
      phone: addrPhone,
      province: addrProvince,
      district: addrDistrict,
      municipality: addrMunicipality,
      ward: addrWard,
      street: addrStreet,
      landmark: addrLandmark,
      is_default: addresses.length === 0,
    });

    setShowAddressModal(false);
    setAddrMunicipality('');
    setAddrStreet('');
    setAddrLandmark('');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
      case 'processing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 font-black text-2xl flex items-center justify-center font-brand shadow-sm">
            {user?.name.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-bold text-amber-600 mb-0.5">Welcome back 👋</div>
            <h1 className="text-2xl font-black text-slate-900 font-brand">
              {user?.name}
            </h1>
            <p className="text-xs text-slate-500">
              {user?.email} • {user?.phone || 'Nepal'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              to="/admin"
              className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs hover:bg-amber-100/70 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Admin Console</span>
            </Link>
          )}

          <button
            onClick={logout}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="mt-6 flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'overview'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Overview</span>
          {activeTab === 'overview' && (
            <motion.div
              layoutId="accountTabUnderline"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'orders'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
          {activeTab === 'orders' && (
            <motion.div
              layoutId="accountTabUnderline"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'addresses'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Addresses ({addresses.length})</span>
          {activeTab === 'addresses' && (
            <motion.div
              layoutId="accountTabUnderline"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`relative pb-3 px-4 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer z-10 ${
            activeTab === 'support'
              ? 'text-slate-950 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Support Tickets ({userTickets.length})</span>
          {activeTab === 'support' && (
            <motion.div
              layoutId="accountTabUnderline"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
            />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Orders
                </span>
                <div className="text-3xl font-black text-slate-950 font-brand mt-1 tabular-nums">
                  <AnimatedNumber value={orders.length} />
                </div>
                <p className="text-xs text-slate-500 mt-1">Cash on delivery orders placed</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Saved Addresses
                </span>
                <div className="text-3xl font-black text-slate-950 font-brand mt-1 tabular-nums">
                  <AnimatedNumber value={addresses.length} />
                </div>
                <p className="text-xs text-slate-500 mt-1">Ready for 1-click checkout</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Support Inquiries
                </span>
                <div className="text-3xl font-black text-slate-950 font-brand mt-1 tabular-nums">
                  <AnimatedNumber value={userTickets.length} />
                </div>
                <p className="text-xs text-slate-500 mt-1">Help desk requests logged</p>
              </div>
            </div>

            {/* Real-Time Active Shipment Callout Card */}
            {orders.find((o) => o.order_status === 'shipped' || o.order_status === 'confirmed') && (() => {
              const activeOrder = orders.find((o) => o.order_status === 'shipped' || o.order_status === 'confirmed')!;
              return (
                <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Live Courier Tracking
                        </span>
                        <span className="text-xs text-slate-400">
                          Waybill: <span className="font-mono text-slate-200 font-bold">{activeOrder.courier_info?.tracking_number}</span>
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-black font-brand text-white">
                        {activeOrder.order_status === 'shipped'
                          ? 'Your package is out for delivery!'
                          : 'Order confirmed & being prepared'}
                      </h3>

                      <p className="text-xs text-slate-300">
                        {activeOrder.courier_info?.current_location || 'Kathmandu Central Sorting Center'} •{' '}
                        <span className="text-amber-400 font-semibold">{activeOrder.courier_info?.estimated_delivery}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => setTrackingOrder(activeOrder)}
                      className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shrink-0"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Track Package Live</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Recent Orders Preview */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                >
                  View All Orders
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">
                  You have not placed any orders yet. Check out our Flash Deals!
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-slate-900">{order.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusColor(order.order_status)}`}>
                            {order.order_status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {order.items.length} item(s) • {new Date(order.created_at).toLocaleDateString('en-NP')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 tabular-nums">
                          Rs. {order.total.toLocaleString('en-NP')}
                        </span>
                        <p className="text-[10px] text-slate-400">Cash on Delivery</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <EmptyState
                icon={<Package className="w-10 h-10 stroke-1 text-slate-400" />}
                title="No Orders Found"
                description="When you place orders with CARTPLUS, they will appear here with live tracking status."
                actionText="Start Shopping"
                actionHref="/products"
              />
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden"
                  >
                    {/* Order header */}
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Order ID</span>
                          <span className="font-mono font-bold text-slate-900">{order.id}</span>
                        </div>
                        <div className="border-l border-slate-200 pl-3">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Placed On</span>
                          <span className="text-slate-700">
                            {new Date(order.created_at).toLocaleDateString('en-NP', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase flex items-center gap-1.5 ${getStatusColor(order.order_status)}`}>
                          {order.order_status === 'shipped' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                          )}
                          <span>{order.order_status === 'shipped' ? 'In Transit / Out for Delivery' : order.order_status}</span>
                        </span>
                        <span className="text-sm font-black text-slate-950 tabular-nums">
                          Rs. {order.total.toLocaleString('en-NP')}
                        </span>
                      </div>
                    </div>

                    {/* Real-Time Shipping Bar */}
                    <div className="px-4 py-3 bg-amber-50/40 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {order.courier_info?.provider_name || 'Nepal Can Move (NCM) Logistics'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-bold">
                              • Waybill: {order.courier_info?.tracking_number}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            <span className="text-amber-800 font-semibold">{order.courier_info?.estimated_delivery}</span>
                            {order.courier_info?.current_location && (
                              <span> • {order.courier_info.current_location}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setTrackingOrder(order)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Track Package Live</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                        </button>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="p-4 divide-y divide-slate-100">
                      {order.items.map((item, idx) => (
                        <div key={item.product_id || idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{item.product_name}</p>
                              <p className="text-slate-500 tabular-nums">
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

                    {/* Order footer */}
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>
                          Delivering to: {order.delivery_address.street}, {order.delivery_address.district}, {order.delivery_address.province}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setTrackingOrder(order)}
                          className="font-bold text-slate-900 hover:text-amber-600 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5 text-amber-500" />
                          <span>View Live Tracking</span>
                        </button>
                        <span className="text-slate-300">·</span>
                        <Link
                          to={`/customer-service?orderId=${order.id}`}
                          className="text-xs font-bold text-slate-500 hover:text-amber-600"
                        >
                          Need Help?
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Saved Delivery Addresses
              </h3>
              <button
                onClick={() => setShowAddressModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            {addresses.length === 0 ? (
              <EmptyState
                icon={<MapPin className="w-10 h-10 stroke-1 text-slate-400" />}
                title="No Saved Addresses"
                description="Save your home, office, or family delivery addresses for faster checkout."
                actionText="Add Address"
                onAction={() => setShowAddressModal(true)}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-slate-900">{addr.full_name}</span>
                        {addr.is_default && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                            Default Address
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        {addr.street}, {addr.ward}
                      </p>
                      <p className="text-xs text-slate-600">
                        {addr.municipality}, {addr.district}, {addr.province}
                      </p>
                      {addr.landmark && (
                        <p className="text-[11px] text-slate-400 mt-1">Landmark: {addr.landmark}</p>
                      )}
                      <p className="text-xs font-mono text-slate-500 mt-2">Phone: {addr.phone}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      {!addr.is_default ? (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="font-bold text-slate-700 hover:text-amber-600 cursor-pointer"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Default Delivery
                        </span>
                      )}

                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Support */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                My Customer Support Requests
              </h3>
              <Link
                to="/customer-service"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>New Ticket</span>
              </Link>
            </div>

            {userTickets.length === 0 ? (
              <EmptyState
                icon={<Headphones className="w-10 h-10 stroke-1 text-slate-400" />}
                title="No Support Requests Logged"
                description="Need help with delivery, returns, or order modifications? Our support team is ready."
                actionText="Open Support Desk"
                actionHref="/customer-service"
              />
            ) : (
              <div className="space-y-4">
                {userTickets.map((ticket: SupportRequest) => (
                  <div
                    key={ticket.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{ticket.id}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {ticket.category}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        ticket.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ticket.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{ticket.subject}</h4>
                    <p className="text-xs text-slate-600">{ticket.message}</p>

                    {/* Messages thread */}
                    {ticket.messages.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Response Thread:</span>
                        {ticket.messages.map((reply: SupportMessage) => (
                          <div
                            key={reply.id}
                            className={`p-3 rounded-xl text-xs ${
                              reply.sender === 'support'
                                ? 'bg-amber-50 border border-amber-200 text-slate-900'
                                : 'bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1 font-bold text-[11px]">
                              <span>{reply.sender_name} ({reply.sender === 'support' ? 'Support Specialist' : 'You'})</span>
                              <span className="text-slate-400 tabular-nums">
                                {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p>{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 font-brand mb-4">
              Add New Delivery Address
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone (+977)</label>
                  <input
                    type="tel"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Province</label>
                  <select
                    value={addrProvince}
                    onChange={(e) => {
                      setAddrProvince(e.target.value);
                      const p = NEPAL_PROVINCES.find((x) => x.name === e.target.value);
                      if (p && p.districts.length > 0) setAddrDistrict(p.districts[0]);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  >
                    {NEPAL_PROVINCES.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District</label>
                  <select
                    value={addrDistrict}
                    onChange={(e) => setAddrDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  >
                    {NEPAL_PROVINCES.find((p) => p.name === addrProvince)?.districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Municipality / City</label>
                  <input
                    type="text"
                    value={addrMunicipality}
                    onChange={(e) => setAddrMunicipality(e.target.value)}
                    placeholder="e.g. Kathmandu"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ward</label>
                  <input
                    type="text"
                    value={addrWard}
                    onChange={(e) => setAddrWard(e.target.value)}
                    placeholder="e.g. Ward 4"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Street Address / Area</label>
                <input
                  type="text"
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  placeholder="e.g. Baluwatar Marg"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Landmark</label>
                <input
                  type="text"
                  value={addrLandmark}
                  onChange={(e) => setAddrLandmark(e.target.value)}
                  placeholder="e.g. Near Russian Embassy"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white font-bold rounded-lg shadow-2xs cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-time Order Tracking Modal */}
      {trackingOrder && (
        <OrderTrackerModal
          order={trackingOrder}
          isOpen={!!trackingOrder}
          onClose={() => setTrackingOrder(null)}
        />
      )}
    </div>
  );
};
