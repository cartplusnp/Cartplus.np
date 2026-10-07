import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { useSupport } from '../context/SupportContext';
import { useToast } from '../context/ToastContext';
import { useRouter, Link } from '../context/RouterContext';
import { supabase } from '../lib/supabase';
import { EmptyState } from '../components/common/EmptyState';
import { OrderTrackerModal } from '../components/account/OrderTrackerModal';
import { AnimatedNumber } from '../components/motion/AnimatedNumber';
import { NEPAL_PROVINCES } from '../data/nepalLocations';
import {
  validateGenuineName,
  validateGenuineEmail,
  validateGenuinePhone,
} from '../utils/genuineValidation';
import { Address, SupportRequest, Order, OrderStatus } from '../types';
import {
  User,
  Package,
  MapPin,
  Heart,
  Bell,
  Lock,
  Headphones,
  Edit3,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  LogOut,
  Truck,
  Navigation,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  ShoppingBag,
  ArrowRight,
  Check,
  X,
  KeyRound,
  Tag,
  Sparkles,
  Info,
} from 'lucide-react';

interface AccountPageProps {
  initialTab?:
    | 'overview'
    | 'orders'
    | 'addresses'
    | 'wishlist'
    | 'profile'
    | 'notifications'
    | 'security'
    | 'support';
}

type TabType =
  | 'overview'
  | 'orders'
  | 'addresses'
  | 'wishlist'
  | 'profile'
  | 'notifications'
  | 'security'
  | 'support';

export const AccountPage: React.FC<AccountPageProps> = ({ initialTab = 'overview' }) => {
  const { user, isAuthenticated, logout, isAdmin, updateProfile, updateEmail, changePassword } = useAuth();
  const {
    orders,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    cancelOrder,
  } = useOrders();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { getUserRequests } = useSupport();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Sync tab with initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Auth User verification state (from Supabase Auth)
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(false);

  useEffect(() => {
    async function checkAuthMetadata() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setIsEmailVerified(Boolean(data.user.email_confirmed_at));
        }
      } catch {
        // default to true
      }
    }
    if (isAuthenticated) {
      checkAuthMetadata();
    }
  }, [isAuthenticated, user?.email]);

  // Real-time tracking modal state
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Order status filter in orders tab
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');

  // Cancel order confirmation modal
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Edit Profile Modal state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Address Modal state (supports both Add & Edit)
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrProvince, setAddrProvince] = useState(NEPAL_PROVINCES[0].name);
  const [addrDistrict, setAddrDistrict] = useState(NEPAL_PROVINCES[0].districts[0]);
  const [addrMunicipality, setAddrMunicipality] = useState('');
  const [addrWard, setAddrWard] = useState('Ward 1');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Address delete confirmation
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  // Security: Password Change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Update profile fields whenever user updates
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  // Generate clean Initials Avatar from customer's real name
  const initials = useMemo(() => {
    if (!user?.name) return 'CP';
    const clean = user.name.trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [user?.name]);

  // Formatted member since date
  const memberSince = useMemo(() => {
    if (!user?.created_at) return 'Recent Member';
    try {
      const d = new Date(user.created_at);
      return `Member since ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    } catch {
      return 'Member since 2026';
    }
  }, [user?.created_at]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return orders;
    if (orderFilter === 'pending') {
      return orders.filter((o) => o.order_status === 'pending');
    }
    if (orderFilter === 'processing') {
      return orders.filter((o) => o.order_status === 'confirmed' || o.order_status === 'processing');
    }
    if (orderFilter === 'shipped') {
      return orders.filter((o) => o.order_status === 'shipped' || o.order_status === 'out_for_delivery');
    }
    if (orderFilter === 'delivered') {
      return orders.filter((o) => o.order_status === 'delivered');
    }
    if (orderFilter === 'cancelled') {
      return orders.filter((o) => o.order_status === 'cancelled' || o.order_status === 'rejected');
    }
    return orders;
  }, [orders, orderFilter]);

  // Active in-transit shipment (if any)
  const activeInTransitOrder = useMemo(() => {
    return orders.find(
      (o) =>
        o.order_status === 'shipped' ||
        o.order_status === 'out_for_delivery' ||
        o.order_status === 'confirmed' ||
        o.order_status === 'processing'
    );
  }, [orders]);

  // Default address
  const defaultAddress = useMemo(() => {
    return addresses.find((a) => a.is_default) || addresses[0];
  }, [addresses]);

  // User's support tickets
  const userTickets = getUserRequests(user?.email);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <EmptyState
          icon={<User className="w-12 h-12 stroke-1 text-slate-400" />}
          title="Sign In to Access Your Account"
          description="Sign in to your CARTPLUS customer account to view orders, track packages across Nepal, manage saved addresses, and view your saved items."
          actionText="Sign In to CARTPLUS"
          actionHref="/login"
        />
      </div>
    );
  }

  // --- Handlers ---

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrName(user?.name || '');
    setAddrPhone(user?.phone || '');
    setAddrProvince(NEPAL_PROVINCES[0].name);
    setAddrDistrict(NEPAL_PROVINCES[0].districts[0]);
    setAddrMunicipality('');
    setAddrWard('Ward 1');
    setAddrStreet('');
    setAddrLandmark('');
    setAddrIsDefault(addresses.length === 0);
    setAddressErrors({});
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddrName(addr.full_name);
    setAddrPhone(addr.phone);
    setAddrProvince(addr.province);
    setAddrDistrict(addr.district);
    setAddrMunicipality(addr.municipality);
    setAddrWard(addr.ward || 'Ward 1');
    setAddrStreet(addr.street);
    setAddrLandmark(addr.landmark || '');
    setAddrIsDefault(addr.is_default);
    setAddressErrors({});
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const nameCheck = validateGenuineName(addrName, 'Full Name');
    if (!nameCheck.isValid && nameCheck.error) {
      errors.name = nameCheck.error;
    }

    const phoneCheck = validateGenuinePhone(addrPhone);
    if (!phoneCheck.isValid && phoneCheck.error) {
      errors.phone = phoneCheck.error;
    }

    if (!addrMunicipality.trim()) {
      errors.municipality = 'Municipality / City is required.';
    }

    if (!addrStreet.trim()) {
      errors.street = 'Street address / Area is required.';
    }

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      return;
    }

    setIsSavingAddress(true);
    setAddressErrors({});

    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, {
          full_name: addrName.trim(),
          phone: addrPhone.trim(),
          province: addrProvince,
          district: addrDistrict,
          municipality: addrMunicipality.trim(),
          ward: addrWard.trim() || undefined,
          street: addrStreet.trim(),
          landmark: addrLandmark.trim() || undefined,
          is_default: addrIsDefault,
        });
        if (addrIsDefault) {
          await setDefaultAddress(editingAddressId);
        }
      } else {
        const newAddr = await addAddress({
          full_name: addrName.trim(),
          phone: addrPhone.trim(),
          province: addrProvince,
          district: addrDistrict,
          municipality: addrMunicipality.trim(),
          ward: addrWard.trim() || undefined,
          street: addrStreet.trim(),
          landmark: addrLandmark.trim() || undefined,
          is_default: addrIsDefault || addresses.length === 0,
        });
        if (addrIsDefault && newAddr.id) {
          await setDefaultAddress(newAddr.id);
        }
      }
      setShowAddressModal(false);
    } catch {
      setAddressErrors({ submit: 'Failed to save address. Please try again.' });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleConfirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      await deleteAddress(addressToDelete.id);
      setAddressToDelete(null);
    } catch {
      toastError('Could not delete address.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const nameCheck = validateGenuineName(editName, 'Full Name');
    if (!nameCheck.isValid && nameCheck.error) {
      errors.name = nameCheck.error;
    }

    if (editPhone.trim()) {
      const phoneCheck = validateGenuinePhone(editPhone);
      if (!phoneCheck.isValid && phoneCheck.error) {
        errors.phone = phoneCheck.error;
      }
    }

    const emailCheck = validateGenuineEmail(editEmail);
    if (!emailCheck.isValid && emailCheck.error) {
      errors.email = emailCheck.error;
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setIsSavingProfile(true);
    setProfileErrors({});
    setProfileSuccessMsg('');

    try {
      let emailChanged = false;

      // 1. Update Profile (Name & Phone)
      const res = await updateProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
      });

      if (!res.success) {
        setProfileErrors({ submit: res.error || 'Failed to update profile.' });
        setIsSavingProfile(false);
        return;
      }

      // 2. Email verification flow if email changed
      if (editEmail.trim().toLowerCase() !== user?.email.toLowerCase()) {
        emailChanged = true;
        const emailRes = await updateEmail(editEmail.trim());
        if (!emailRes.success) {
          setProfileErrors({ email: emailRes.error || 'Failed to update email address.' });
          setIsSavingProfile(false);
          return;
        }
      }

      if (emailChanged) {
        setProfileSuccessMsg(
          'Profile details updated. A verification link has been sent to confirm your new email address.'
        );
      } else {
        setProfileSuccessMsg('Profile updated successfully.');
      }

      setTimeout(() => {
        setShowEditProfileModal(false);
        setProfileSuccessMsg('');
      }, 1500);
    } catch {
      setProfileErrors({ submit: 'An error occurred while updating profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(newPassword);
      if (res.success) {
        setPasswordSuccess('Password changed successfully.');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.error || 'Failed to update password.');
      }
    } catch {
      setPasswordError('An unexpected error occurred while changing password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExecuteCancelOrder = async () => {
    if (!orderToCancel) return;
    setIsCancelling(true);
    try {
      const ok = await cancelOrder(orderToCancel.id);
      if (ok) {
        toastSuccess(`Order ${orderToCancel.id} has been cancelled.`);
        setOrderToCancel(null);
      }
    } catch {
      toastError('Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusColor = (status: OrderStatus | string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
      case 'processing':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* ======================================================== */}
      {/* 1. PROFESSIONAL PROFILE HEADER */}
      {/* ======================================================== */}
      <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Customer Avatar & Credentials */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Initials Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 text-amber-400 font-black text-2xl sm:text-3xl flex items-center justify-center font-brand shadow-sm select-none">
                {initials}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active Account" />
            </div>

            {/* Information */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 font-brand leading-tight">
                  {user.name}
                </h1>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isAdmin
                      ? 'bg-amber-100 text-amber-900 border-amber-200'
                      : user.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isAdmin ? 'Staff Admin' : user.status === 'active' ? 'Active Customer' : user.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{user.email}</span>
                  {isEmailVerified ? (
                    <span className="text-[10px] text-emerald-600 font-bold ml-0.5" title="Email Verified">
                      ✓
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-bold ml-0.5" title="Unconfirmed">
                      (Unverified)
                    </span>
                  )}
                </span>

                {user.phone ? (
                  <span className="flex items-center gap-1.5 text-slate-700 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{user.phone}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setShowEditProfileModal(true);
                    }}
                    className="flex items-center gap-1 text-amber-600 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add phone number</span>
                  </button>
                )}

                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{memberSince}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
            <button
              onClick={() => {
                setProfileErrors({});
                setProfileSuccessMsg('');
                setShowEditProfileModal(true);
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit Profile</span>
            </button>

            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}

            <button
              onClick={logout}
              className="px-3.5 py-2.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer shadow-2xs"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="border-t border-slate-200/80 bg-slate-50/70 px-4 sm:px-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2 py-1.5 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`relative px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap cursor-pointer z-10 flex items-center gap-2 ${
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
                  className="absolute inset-0 bg-white rounded-xl -z-10 shadow-2xs border border-slate-200/90"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`relative px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap cursor-pointer z-10 flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'text-slate-950 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Orders</span>
              {orders.length > 0 && (
                <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {orders.length}
                </span>
              )}
              {activeTab === 'orders' && (
                <motion.div
                  layoutId="accountTabUnderline"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-white rounded-xl -z-10 shadow-2xs border border-slate-200/90"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`relative px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap cursor-pointer z-10 flex items-center gap-2 ${
                activeTab === 'wishlist'
                  ? 'text-slate-950 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {wishlist.length}
                </span>
              )}
              {activeTab === 'wishlist' && (
                <motion.div
                  layoutId="accountTabUnderline"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-white rounded-xl -z-10 shadow-2xs border border-slate-200/90"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`relative px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap cursor-pointer z-10 flex items-center gap-2 ${
                activeTab === 'addresses'
                  ? 'text-slate-950 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
              {addresses.length > 0 && (
                <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {addresses.length}
                </span>
              )}
              {activeTab === 'addresses' && (
                <motion.div
                  layoutId="accountTabUnderline"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-white rounded-xl -z-10 shadow-2xs border border-slate-200/90"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`relative px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap cursor-pointer z-10 flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'text-slate-950 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Personal Info</span>
              {activeTab === 'profile' && (
                <motion.div
                  layoutId="accountTabUnderline"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-white rounded-xl -z-10 shadow-2xs border border-slate-200/90"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`relative px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap cursor-pointer z-10 flex items-center gap-2 ${
                activeTab === 'notifications'
                  ? 'text-slate-950 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {unreadCount}
                </span>
              )}
              {activeTab === 'notifications' && (
                <motion.div
                  layoutId="accountTabUnderline"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-white rounded-xl -z-10 shadow-2xs border border-slate-200/90"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`relative px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap cursor-pointer z-10 flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'text-slate-950 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Security</span>
              {activeTab === 'security' && (
                <motion.div
                  layoutId="accountTabUnderline"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-white rounded-xl -z-10 shadow-2xs border border-slate-200/90"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className={`relative px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap cursor-pointer z-10 flex items-center gap-2 ${
                activeTab === 'support'
                  ? 'text-slate-950 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>Help & Support</span>
              {userTickets.length > 0 && (
                <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {userTickets.length}
                </span>
              )}
              {activeTab === 'support' && (
                <motion.div
                  layoutId="accountTabUnderline"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-white rounded-xl -z-10 shadow-2xs border border-slate-200/90"
                />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. TAB CONTENT PANELS */}
      {/* ======================================================== */}

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button
              onClick={() => setActiveTab('orders')}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
                <Package className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 font-brand tabular-nums">
                <AnimatedNumber value={orders.length} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>Cash on Delivery</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Saved Items</span>
                <Heart className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 font-brand tabular-nums">
                <AnimatedNumber value={wishlist.length} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>In your Wishlist</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Addresses</span>
                <MapPin className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 font-brand tabular-nums">
                <AnimatedNumber value={addresses.length} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>Delivery locations</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </button>

            <button
              onClick={() => setActiveTab('support')}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Support</span>
                <Headphones className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-950 font-brand tabular-nums">
                <AnimatedNumber value={userTickets.length} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                <span>Customer inquiries</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </button>
          </div>

          {/* Active In-Transit Shipment Banner */}
          {activeInTransitOrder && (
            <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-2xl sm:rounded-3xl border border-slate-800 shadow-md relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live Courier Tracking
                    </span>
                    <span className="text-xs text-slate-400">
                      Waybill:{' '}
                      <span className="font-mono text-slate-200 font-bold">
                        {activeInTransitOrder.courier_info?.tracking_number || activeInTransitOrder.id}
                      </span>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white font-brand">
                    {activeInTransitOrder.order_status === 'shipped' || activeInTransitOrder.order_status === 'out_for_delivery'
                      ? 'Package is in transit / out for delivery'
                      : 'Order confirmed and packing in warehouse'}
                  </h3>

                  <p className="text-xs text-slate-300">
                    {activeInTransitOrder.courier_info?.provider_name || 'Express Courier Nepal'} •{' '}
                    <span className="text-amber-400 font-semibold">
                      {activeInTransitOrder.courier_info?.estimated_delivery || 'Delivering shortly'}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setTrackingOrder(activeInTransitOrder)}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm shrink-0 self-start md:self-auto"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track Package Live</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Overview Split: Recent Orders + Primary Address */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Recent Orders Preview */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recent Orders
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>View All ({orders.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <Package className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-1" />
                  <p className="font-semibold text-slate-700">No orders placed yet</p>
                  <p className="text-slate-400 mt-1">Discover popular products with Cash on Delivery.</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    <span>Browse Products</span>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold font-mono text-slate-900 truncate">
                            {order.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusColor(
                              order.order_status
                            )}`}
                          >
                            {order.order_status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {order.items.length} item(s) •{' '}
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-950 tabular-nums">
                          Rs. {order.total.toLocaleString('en-NP')}
                        </span>
                        <div className="mt-1">
                          <button
                            onClick={() => setTrackingOrder(order)}
                            className="text-[11px] font-bold text-amber-600 hover:underline cursor-pointer"
                          >
                            Track
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Default Shipping Address & Quick Actions */}
            <div className="lg:col-span-5 space-y-6">
              {/* Default Address Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-700" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Default Delivery Address
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                  >
                    Manage
                  </button>
                </div>

                {defaultAddress ? (
                  <div className="text-xs space-y-1 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{defaultAddress.full_name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Default
                      </span>
                    </div>
                    <p className="text-slate-600">
                      {defaultAddress.street}, {defaultAddress.ward && `${defaultAddress.ward}, `}
                      {defaultAddress.municipality}
                    </p>
                    <p className="text-slate-600">
                      {defaultAddress.district}, {defaultAddress.province}
                    </p>
                    <p className="text-slate-500 font-mono pt-1">Phone: {defaultAddress.phone}</p>
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500">
                    <p>No address saved yet.</p>
                    <button
                      onClick={handleOpenAddAddress}
                      className="mt-2 text-xs font-bold text-amber-600 hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add primary address</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Links Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Account Shortcuts
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-left transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Order History</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-left transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Saved Wishlist</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-left transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Security & Password</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <Link
                    to="/customer-service"
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-left transition-colors flex items-center justify-between"
                  >
                    <span>Kathmandu Help Desk</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY ORDERS WITH FILTER SHORTCUTS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-950 font-brand">My Orders & Shipments</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track status, view official dispatch slips, and monitor live courier delivery across Nepal.
              </p>
            </div>

            {/* Order Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-semibold">
              {(
                [
                  { id: 'all', label: 'All Orders' },
                  { id: 'pending', label: 'Pending' },
                  { id: 'processing', label: 'Processing' },
                  { id: 'shipped', label: 'In Transit' },
                  { id: 'delivered', label: 'Delivered' },
                  { id: 'cancelled', label: 'Cancelled' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-xs ${
                    orderFilter === tab.id
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <EmptyState
              icon={<Package className="w-10 h-10 stroke-1 text-slate-400" />}
              title={orderFilter === 'all' ? 'You haven’t placed any orders yet' : `No ${orderFilter} orders`}
              description={
                orderFilter === 'all'
                  ? 'All your purchases on CARTPLUS with Cash on Delivery will appear here.'
                  : `You currently have no orders in ${orderFilter} status.`
              }
              actionText="Browse Marketplace"
              actionHref="/products"
            />
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const canCancel = order.order_status === 'pending' || order.order_status === 'confirmed';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden"
                  >
                    {/* Order Bar Header */}
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Order ID
                          </span>
                          <span className="font-mono font-bold text-slate-900">{order.id}</span>
                        </div>
                        <div className="border-l border-slate-200 pl-3">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Order Placed
                          </span>
                          <span className="text-slate-700">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase flex items-center gap-1.5 ${getStatusColor(
                            order.order_status
                          )}`}
                        >
                          {(order.order_status === 'shipped' || order.order_status === 'out_for_delivery') && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                          )}
                          <span>
                            {order.order_status === 'shipped' || order.order_status === 'out_for_delivery'
                              ? 'In Transit / Courier'
                              : order.order_status}
                          </span>
                        </span>
                        <span className="text-sm font-black text-slate-950 tabular-nums">
                          Rs. {order.total.toLocaleString('en-NP')}
                        </span>
                      </div>
                    </div>

                    {/* Real-Time Logistics Row */}
                    <div className="px-4 py-3 bg-amber-50/30 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {order.courier_info?.provider_name || 'Nepal Express Logistics'}
                            </span>
                            {order.courier_info?.tracking_number && (
                              <span className="text-[10px] text-slate-400 font-mono font-bold">
                                • Waybill: {order.courier_info.tracking_number}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {order.courier_info?.estimated_delivery && (
                              <span className="text-amber-800 font-semibold">
                                {order.courier_info.estimated_delivery}
                              </span>
                            )}
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

                    {/* Purchased Items List */}
                    <div className="p-4 divide-y divide-slate-100">
                      {order.items.map((item, idx) => (
                        <div
                          key={item.product_id || idx}
                          className="py-3 flex items-center justify-between gap-4 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 line-clamp-1">{item.product_name}</p>
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

                    {/* Order Footer & Actions */}
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">
                          Destination: {order.delivery_address.street},{' '}
                          {order.delivery_address.district}, {order.delivery_address.province}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => setOrderToCancel(order)}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                          >
                            Cancel Order
                          </button>
                        )}
                        <span className="text-slate-300">·</span>
                        <Link
                          to={`/customer-service?orderId=${order.id}`}
                          className="text-xs font-bold text-slate-600 hover:text-amber-600"
                        >
                          Need Assistance?
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-950 font-brand">Saved Wishlist</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Items you saved for later. Move them directly to your shopping bag.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600">{wishlist.length} saved</span>
          </div>

          {wishlist.length === 0 ? (
            <EmptyState
              icon={<Heart className="w-10 h-10 stroke-1 text-slate-400" />}
              title="Your Wishlist is Empty"
              description="Explore trending items across Nepal and tap the heart icon to save them here."
              actionText="Explore Products"
              actionHref="/products"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-4 flex gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                      <img
                        src={item.thumbnail || item.images[0]}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-sm font-black text-slate-950 tabular-nums">
                          Rs. {item.price.toLocaleString('en-NP')}
                        </span>
                        {item.discount > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600">
                            {item.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => {
                        addToCart(item, 1);
                        toastSuccess(`Added "${item.name}" to your bag.`);
                      }}
                      className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded-xl hover:bg-rose-50"
                      title="Remove from wishlist"
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

      {/* TAB 4: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-950 font-brand">Saved Delivery Addresses</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your home, workplace, and regional addresses for 1-click Cash on Delivery checkout.
              </p>
            </div>
            <button
              onClick={handleOpenAddAddress}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          {addresses.length === 0 ? (
            <EmptyState
              icon={<MapPin className="w-10 h-10 stroke-1 text-slate-400" />}
              title="Add your first delivery address"
              description="Save your shipping address now to breeze through checkout when placing orders."
              actionText="Add New Address"
              onAction={handleOpenAddAddress}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-5 bg-white rounded-2xl border shadow-2xs flex flex-col justify-between transition-all ${
                    addr.is_default
                      ? 'border-amber-400 ring-1 ring-amber-400/30'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{addr.full_name}</span>
                      {addr.is_default ? (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                          Default Delivery
                        </span>
                      ) : (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-[11px] font-bold text-slate-500 hover:text-amber-600 cursor-pointer"
                        >
                          Make Default
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5">
                      <p className="font-medium text-slate-800">
                        {addr.street}{addr.ward ? `, ${addr.ward}` : ''}
                      </p>
                      <p>
                        {addr.municipality}, {addr.district}
                      </p>
                      <p className="text-slate-500 font-semibold">{addr.province}</p>
                      {addr.landmark && (
                        <p className="text-[11px] text-slate-400 pt-1">Landmark: {addr.landmark}</p>
                      )}
                    </div>

                    <p className="text-xs font-mono font-medium text-slate-700 pt-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{addr.phone}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleOpenEditAddress(addr)}
                      className="font-bold text-slate-700 hover:text-amber-600 cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setAddressToDelete(addr)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
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

      {/* TAB 5: PERSONAL INFORMATION */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-950 font-brand">Personal Information</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your account identity, primary contact phone number, and verified email.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
            {profileSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {profileErrors.submit && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileErrors.submit}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Full Name (Real Identity)
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Milan Subedi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs text-slate-900 font-medium"
                required
              />
              {profileErrors.name && (
                <p className="text-[11px] text-rose-600 mt-1">{profileErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Primary Mobile Phone (+977 Nepal)
              </label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="e.g. 9841234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs text-slate-900 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Used for courier delivery dispatch and verification.</p>
              {profileErrors.phone && (
                <p className="text-[11px] text-rose-600 mt-1">{profileErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="e.g. yourname@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs text-slate-900"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Note: Updating your email sends a verification link via Supabase Auth before the change is finalized.
              </p>
              {profileErrors.email && (
                <p className="text-[11px] text-rose-600 mt-1">{profileErrors.email}</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{memberSince}</span>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
              >
                {isSavingProfile ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-950 font-brand">Notifications & Alerts</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time price drops on saved items, restock notices, and order status events.
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <EmptyState
              icon={<Bell className="w-10 h-10 stroke-1 text-slate-400" />}
              title="No Notifications Yet"
              description="Add products to your wishlist or place orders to receive instant alerts when prices drop or shipments dispatch."
              actionText="Browse Deals"
              actionHref="/products?filter=deals"
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markAsRead(n.id);
                    if (n.product_slug) {
                      navigate(`/products/${n.product_slug}`);
                    }
                  }}
                  className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                    n.is_read ? 'hover:bg-slate-50' : 'bg-amber-50/40 hover:bg-amber-50/70'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    {n.type === 'price_drop' ? <Tag className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {n.type === 'price_drop' ? 'Price Drop Alert' : 'Marketplace Notice'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    <p className="text-xs text-slate-600">{n.message}</p>

                    {n.new_price && (
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <span className="font-extrabold text-slate-950 tabular-nums">
                          Rs. {n.new_price.toLocaleString('en-NP')}
                        </span>
                        {n.previous_price && (
                          <span className="text-slate-400 line-through tabular-nums text-[11px]">
                            Rs. {n.previous_price.toLocaleString('en-NP')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: ACCOUNT SECURITY */}
      {activeTab === 'security' && (
        <div className="max-w-2xl space-y-6">
          {/* Email Verification Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Email Verification Status
              </h3>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <p className="font-bold text-slate-900">{user.email}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Managed securely through Supabase Authentication.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  isEmailVerified
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {isEmailVerified ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Unconfirmed</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-5">
            <div className="pb-3 border-b border-slate-100 flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-slate-800" />
              <div>
                <h3 className="text-sm font-bold text-slate-950 font-brand">Change Password</h3>
                <p className="text-[11px] text-slate-500">
                  Protect your orders and account credentials with a strong password.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 pr-10 text-xs font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 pr-10 text-xs font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword || !newPassword}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Session Sign Out */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Sign Out of All Sessions</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Clear active session tokens on this browser.
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors border border-rose-200 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* TAB 8: HELP & SUPPORT */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-950 font-brand">Support & Help Desk</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                View your open support tickets or chat with our Kathmandu customer support team.
              </p>
            </div>
            <Link
              to="/customer-service"
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Ticket</span>
            </Link>
          </div>

          {userTickets.length === 0 ? (
            <EmptyState
              icon={<Headphones className="w-10 h-10 stroke-1 text-slate-400" />}
              title="No Support Requests Logged"
              description="Have questions about delivery dispatch, address changes, or product specifications? We're here to help."
              actionText="Open Customer Desk"
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
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        ticket.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ticket.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{ticket.subject}</h4>
                  <p className="text-xs text-slate-600">{ticket.message}</p>

                  {/* Messages Thread Preview */}
                  {ticket.messages.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Response Thread ({ticket.messages.length}):
                      </span>
                      {ticket.messages.slice(-2).map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-xl text-xs ${
                            msg.sender === 'support'
                              ? 'bg-amber-50 border border-amber-200 text-slate-900'
                              : 'bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1 font-bold text-[11px]">
                            <span>
                              {msg.sender_name} ({msg.sender === 'support' ? 'Support Specialist' : 'You'})
                            </span>
                            <span className="text-slate-400 tabular-nums font-normal">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p>{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 text-right">
                    <Link
                      to={`/customer-service`}
                      className="text-xs font-bold text-amber-600 hover:underline"
                    >
                      Reply to Ticket →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MODALS */}
      {/* ======================================================== */}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-950 font-brand">Edit Profile Details</h3>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrors.submit && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileErrors.submit}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Milan Subedi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs text-slate-900"
                  required
                />
                {profileErrors.name && (
                  <p className="text-[11px] text-rose-600 mt-1">{profileErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number (+977)</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. 9841234567"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-mono text-slate-900"
                />
                {profileErrors.phone && (
                  <p className="text-[11px] text-rose-600 mt-1">{profileErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. user@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs text-slate-900"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Changing email sends verification links to confirm.
                </p>
                {profileErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{profileErrors.email}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingProfile ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-950 font-brand">
                {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              {addressErrors.submit && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addressErrors.submit}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    placeholder="Recipient name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                  {addressErrors.name && (
                    <p className="text-[11px] text-rose-600 mt-1">{addressErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile (+977)</label>
                  <input
                    type="tel"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                    required
                  />
                  {addressErrors.phone && (
                    <p className="text-[11px] text-rose-600 mt-1">{addressErrors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Province</label>
                  <select
                    value={addrProvince}
                    onChange={(e) => {
                      const newP = e.target.value;
                      setAddrProvince(newP);
                      const found = NEPAL_PROVINCES.find((x) => x.name === newP);
                      if (found && found.districts.length > 0) {
                        setAddrDistrict(found.districts[0]);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {NEPAL_PROVINCES.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">District</label>
                  <select
                    value={addrDistrict}
                    onChange={(e) => setAddrDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {NEPAL_PROVINCES.find((p) => p.name === addrProvince)?.districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                  {addressErrors.municipality && (
                    <p className="text-[11px] text-rose-600 mt-1">{addressErrors.municipality}</p>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ward</label>
                  <input
                    type="text"
                    value={addrWard}
                    onChange={(e) => setAddrWard(e.target.value)}
                    placeholder="e.g. Ward 4"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Street Address / Area</label>
                <input
                  type="text"
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  placeholder="e.g. Baluwatar Marg, House 24"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
                {addressErrors.street && (
                  <p className="text-[11px] text-rose-600 mt-1">{addressErrors.street}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={addrLandmark}
                  onChange={(e) => setAddrLandmark(e.target.value)}
                  placeholder="e.g. Near Russian Embassy"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addrIsDefault}
                    onChange={(e) => setAddrIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                  />
                  <span className="font-semibold text-slate-700">
                    Set as default delivery address
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingAddress ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Address</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Address Confirmation Modal */}
      {addressToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Remove Address?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to remove the address for{' '}
              <strong>{addressToDelete.full_name}</strong> at {addressToDelete.street}?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAddress}
                className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-2xs cursor-pointer"
              >
                Delete Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Cancel Order {orderToCancel.id}?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel this order? If it has not left the fulfillment warehouse, cancellation will take effect immediately.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleExecuteCancelOrder}
                className="px-4 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-2xs cursor-pointer"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
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
