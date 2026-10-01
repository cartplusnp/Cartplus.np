import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { NEPAL_PROVINCES } from '../data/nepalLocations';
import {
  validateGenuineName,
  validateGenuineEmail,
  validateGenuinePhone,
  validateGenuineShippingAddress,
} from '../utils/genuineValidation';
import { Address, PaymentMethod } from '../types';
import { useAdminSettings } from '../context/AdminSettingsContext';
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Mail,
  AlertCircle,
  Plus,
  CreditCard,
  Wallet,
  Smartphone,
  Check,
  Lock,
  Clock,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, clearCart, getCartSubtotal, getDeliveryFee, getCartTotal } = useCart();
  const { addresses, createOrder, addAddress } = useOrders();
  const { user, isAuthenticated } = useAuth();
  const { payoutSettings } = useAdminSettings();
  const { navigate } = useRouter();

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Selected saved address ID or 'new'
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.length > 0 ? addresses[0].id : 'new'
  );

  // Form fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  // Address fields
  const [province, setProvince] = useState(NEPAL_PROVINCES[0].name);
  const [district, setDistrict] = useState(NEPAL_PROVINCES[0].districts[0]);
  const [municipality, setMunicipality] = useState('');
  const [ward, setWard] = useState('Ward 1');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);

  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update district options when province changes
  const currentProvinceData = NEPAL_PROVINCES.find((p) => p.name === province);

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    const pData = NEPAL_PROVINCES.find((p) => p.name === newProvince);
    if (pData && pData.districts.length > 0) {
      setDistrict(pData.districts[0]);
    }
  };

  // If saved address selected, populate view
  const activeAddress: Address | undefined =
    selectedAddressId !== 'new'
      ? addresses.find((a) => a.id === selectedAddressId)
      : undefined;

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    // 1. Genuine Recipient Name
    const nameCheck = validateGenuineName(fullName, 'Recipient Full Name');
    if (!nameCheck.isValid && nameCheck.error) {
      errs.fullName = nameCheck.error;
    }

    // 2. Genuine Email
    const emailCheck = validateGenuineEmail(email);
    if (!emailCheck.isValid && emailCheck.error) {
      errs.email = emailCheck.error;
    }

    // 3. Genuine Nepal Mobile Phone
    const phoneCheck = validateGenuinePhone(phone);
    if (!phoneCheck.isValid && phoneCheck.error) {
      errs.phone = phoneCheck.error;
    }

    // 4. Genuine Shipping Address
    if (selectedAddressId === 'new') {
      const addrCheck = validateGenuineShippingAddress({
        fullName,
        phone,
        province,
        district,
        municipality,
        ward,
        street,
        landmark,
      });

      if (!addrCheck.isValid) {
        Object.assign(errs, addrCheck.errors);
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const executeOrderPlacement = async (transactionRef?: string, paidToAccount?: string) => {
    if (paymentMethod !== 'Cash on Delivery') {
      setErrors({ submit: 'Payment method is currently unavailable. Only Cash on Delivery is supported.' });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalDeliveryAddress: Address;

      if (selectedAddressId !== 'new' && activeAddress) {
        finalDeliveryAddress = activeAddress;
      } else {
        const newAddr: Omit<Address, 'id'> = {
          full_name: fullName.trim(),
          phone: phone.trim(),
          province,
          district,
          municipality: municipality.trim(),
          ward: ward.trim(),
          street: street.trim(),
          landmark: landmark.trim(),
          is_default: addresses.length === 0,
        };

        if (saveAddressForFuture && isAuthenticated) {
          finalDeliveryAddress = await addAddress(newAddr);
        } else {
          finalDeliveryAddress = { ...newAddr, id: `addr-${Date.now()}` };
        }
      }

      // Prepare order items
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const res = await createOrder({
        userId: user?.id,
        customerName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        deliveryAddress: finalDeliveryAddress,
        items: orderItems,
        notes: notes.trim(),
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'cod_pending',
      });

      if (res.success && res.orderId) {
        clearCart();
        navigate(`/order-success?orderId=${res.orderId}`);
      } else {
        setErrors({ submit: res.error || 'Failed to place order. Please try again.' });
      }
    } catch {
      setErrors({ submit: 'An unexpected error occurred while creating your order.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (paymentMethod !== 'Cash on Delivery') {
      setErrors({
        submit: `${paymentMethod} online gateway integration is coming soon. Please select Cash on Delivery to place your order today.`,
      });
      return;
    }

    await executeOrderPlacement();
  };

  const subtotal = getCartSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getCartTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-brand">
          Checkout & Delivery
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your delivery details. Pay in cash when your parcel arrives.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Columns: Forms */}
        <div className="lg:col-span-8 space-y-6">
          {errors.submit && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Section 1: Customer Information */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Customer Contact Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Saroj Shrestha"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
                {errors.fullName && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nepal Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                    +977
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-13 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 tabular-nums font-medium"
                    required
                  />
                </div>
                {errors.phone ? (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">Must start with 98, 97, or 96 (10 digits)</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com (For order receipt & tracking)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. Delivery Address in Nepal
                </h2>
              </div>
            </div>

            {/* Saved addresses options if available */}
            {addresses.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-xs font-bold text-slate-700">Choose a saved address:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs ${
                        selectedAddressId === addr.id
                          ? 'border-amber-500 bg-amber-50/50 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                        <span>{addr.full_name}</span>
                        {addr.is_default && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 line-clamp-1">{addr.street}, {addr.ward}</p>
                      <p className="text-slate-500">{addr.district}, {addr.province}</p>
                      <p className="text-slate-400 mt-1 tabular-nums font-mono">{addr.phone}</p>
                    </div>
                  ))}

                  {/* Add New Address Radio */}
                  <div
                    onClick={() => setSelectedAddressId('new')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs flex items-center justify-center gap-2 font-bold ${
                      selectedAddressId === 'new'
                        ? 'border-amber-500 bg-amber-50/50 text-slate-950'
                        : 'border-dashed border-slate-300 hover:border-slate-400 text-slate-600'
                    }`}
                  >
                    <Plus className="w-4 h-4 text-amber-500" />
                    <span>Enter a Different Address</span>
                  </div>
                </div>
              </div>
            )}

            {/* New Address Fields */}
            {selectedAddressId === 'new' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Province <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  >
                    {NEPAL_PROVINCES.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                  >
                    {currentProvinceData?.districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Municipality / City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    placeholder="e.g. Kathmandu Metropolitan City"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                  {errors.municipality && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.municipality}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ward No.
                  </label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="e.g. Ward 10"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Area / Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. Shankhamul Marg, New Baneshwor"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                  {errors.street && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.street}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nearby Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Opposite Prabhu Bank ATM"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddressForFuture}
                      onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                      className="rounded accent-slate-900"
                    />
                    <span>Save this address to my account for faster future checkouts</span>
                  </label>
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Order Delivery Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Call before delivery, deliver after 2 PM"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Wallet className="w-5 h-5 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  3. Payment Method
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Select your preferred payment</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className="p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between border-amber-500 bg-amber-50/40 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-amber-600 bg-amber-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">Cash on Delivery</span>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Active & Enabled
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Pay our courier rider in cash upon receiving your parcel at your doorstep anywhere across Nepal.
                  </p>
                </div>
              </div>

              {/* Option 2: eSewa (Disabled until real server-side production integration exists) */}
              <div
                aria-disabled="true"
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed flex flex-col justify-between select-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-slate-300 bg-slate-200 flex items-center justify-center" />
                      <span className="text-xs font-bold text-slate-500">eSewa Mobile Wallet</span>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                      Disabled · In Development
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    eSewa direct server-to-server gateway pending API merchant credential setup. Disabled for checkout.
                  </p>
                </div>
              </div>

              {/* Option 3: Khalti (Disabled until real server-side production integration exists) */}
              <div
                aria-disabled="true"
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed flex flex-col justify-between select-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-slate-300 bg-slate-200 flex items-center justify-center" />
                      <span className="text-xs font-bold text-slate-500">Khalti Digital Wallet</span>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                      Disabled · In Development
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Khalti EPAY gateway integration pending production API keys. Disabled for checkout.
                  </p>
                </div>
              </div>

              {/* Option 4: Bank Card / Mobile Banking */}
              <div
                aria-disabled="true"
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed flex flex-col justify-between select-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-slate-300 bg-slate-200 flex items-center justify-center" />
                      <span className="text-xs font-bold text-slate-500">Bank Card / Mobile Banking</span>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                      Disabled · In Development
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    PCI-DSS compliant acquiring gateway in development. Disabled for checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-4 space-y-4 sticky top-28">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">
              Order Items ({cart.length})
            </h2>

            {/* Compact item list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1 no-scrollbar">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="py-2.5 flex items-center gap-3 text-xs">
                  <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                    <img
                      src={product.thumbnail || product.images[0]}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                    <p className="text-slate-500 tabular-nums">Qty: {quantity}</p>
                  </div>
                  <div className="text-right font-bold text-slate-900 tabular-nums">
                    Rs. {(product.price * quantity).toLocaleString('en-NP')}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  Rs. {subtotal.toLocaleString('en-NP')}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold tabular-nums">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-extrabold uppercase">FREE</span>
                  ) : (
                    `Rs. ${deliveryFee.toLocaleString('en-NP')}`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-slate-900">
                  Total Due ({paymentMethod === 'Cash on Delivery' ? 'COD' : paymentMethod})
                </span>
                <span className="text-2xl font-black text-slate-950 font-brand tabular-nums">
                  Rs. {total.toLocaleString('en-NP')}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 cursor-pointer uppercase tracking-wider bg-amber-400 hover:bg-amber-500 shadow-amber-500/20"
            >
              {isSubmitting ? (
                <span>Validating & Processing Order...</span>
              ) : (
                <span>CONFIRM & PLACE ORDER (CASH ON DELIVERY)</span>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Free returns within 7 days if defective</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
