import React, { useState } from 'react';
import { useSeller } from '../context/SellerContext';
import { useRouter, Link } from '../context/RouterContext';
import { NEPAL_PROVINCES } from '../data/nepalLocations';
import {
  Store,
  Building2,
  MapPin,
  CreditCard,
  Lock,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { validateGenuineSellerRegistration } from '../utils/genuineValidation';

const POPULAR_NEPAL_BANKS = [
  'NIC Asia Bank',
  'Nabil Bank',
  'Global IME Bank',
  'Himalayan Bank',
  'Everest Bank',
  'Nepal Investment Mega Bank',
  'Sanima Bank',
  'Prabhu Bank',
  'Siddhartha Bank',
  'Kumari Bank',
  'Prime Commercial Bank',
  'Rastriya Banijya Bank',
];

export const SellerRegisterPage: React.FC = () => {
  const { registerSeller, isAuthenticatedSeller } = useSeller();
  const { navigate } = useRouter();

  // Form State
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [panVatNumber, setPanVatNumber] = useState('');
  const [province, setProvince] = useState(NEPAL_PROVINCES[2].name); // Bagmati Province
  const [district, setDistrict] = useState('Kathmandu');
  const [city, setCity] = useState('Kathmandu');
  const [address, setAddress] = useState('');
  const [bankName, setBankName] = useState(POPULAR_NEPAL_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in
  if (isAuthenticatedSeller) {
    navigate('/seller/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Comprehensive Genuine Verification
    const validation = validateGenuineSellerRegistration({
      storeName,
      ownerName,
      email,
      phone,
      panVatNumber,
      city,
      address,
      bankName,
      accountNumber,
      accountHolder,
      password,
    });

    if (!validation.isValid) {
      const firstErrorKey = Object.keys(validation.errors)[0];
      setErrorMsg(validation.errors[firstErrorKey]);
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');

    setLoading(true);
    const result = await registerSeller({
      store_name: storeName.trim(),
      owner_name: ownerName.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      pan_vat_number: panVatNumber.trim(),
      province,
      district,
      city: city.trim(),
      address: address.trim(),
      bank_name: bankName,
      account_number: accountNumber.trim(),
      account_holder: accountHolder.trim(),
      password,
    });
    setLoading(false);

    if (result.success) {
      navigate('/seller/dashboard');
    } else if (result.error) {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Store className="w-4 h-4 text-amber-600" />
            <span>Seller Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-brand text-slate-900">
            Register Your Store on CARTPLUS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
            Join Nepal's premier marketplace. Benefit from low 5% commission, nationwide Cash on Delivery coverage, and direct merchant bank settlements.
          </p>
        </div>


        {/* Error message */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Registration Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
          {/* Section 1: Store & Owner Details */}
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Store className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                1. Business & Store Identity
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Store / Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Himalayan Gadgets"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Owner / Representative Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Bikash Shrestha"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Merchant Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seller@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nepal Contact Phone (+977) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs font-mono"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  PAN / VAT / Business Registration No. <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={panVatNumber}
                  onChange={(e) => setPanVatNumber(e.target.value)}
                  placeholder="9-digit Inland Revenue Department (IRD) PAN or Business DDC No."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Store Physical Location (For Courier Pickups) */}
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <MapPin className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                2. Store Physical Location (Courier Pickup Address)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Province <span className="text-rose-500">*</span>
                </label>
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    const p = NEPAL_PROVINCES.find((x) => x.name === e.target.value);
                    if (p && p.districts.length > 0) setDistrict(p.districts[0]);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 text-xs"
                >
                  {NEPAL_PROVINCES.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  District <span className="text-rose-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 text-xs"
                >
                  {NEPAL_PROVINCES.find((p) => p.name === province)?.districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  City / Area <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kathmandu / New Road"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Detailed Street Address & Landmark <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House 42, Pako New Road, Near Ranjana Mall"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Bank Payout Account Details */}
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <CreditCard className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                3. Nepal Bank Details (For Weekly COD Sales Remittance)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bank Name <span className="text-rose-500">*</span>
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 text-xs"
                >
                  {POPULAR_NEPAL_BANKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bank Account Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Account Holder Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="As written on chequebook"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: Password */}
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Lock className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                4. Account Security
              </h2>
            </div>

            <div className="max-w-md text-xs">
              <label className="block font-bold text-slate-700 mb-1">
                Create Seller Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                required
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/seller/login" className="font-bold text-amber-600 hover:underline">
                Sign In to Seller Hub
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <span>{loading ? 'Registering Store...' : 'Complete Registration & Open Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
