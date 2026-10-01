import React, { useState } from 'react';
import { useSeller } from '../context/SellerContext';
import { useRouter, Link } from '../context/RouterContext';
import { Store, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const SellerLoginPage: React.FC = () => {
  const { loginSeller, isAuthenticatedSeller } = useSeller();
  const { navigate } = useRouter();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticatedSeller) {
    navigate('/seller/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!emailOrPhone.trim()) {
      setErrorMsg('Please enter your merchant email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your merchant account password.');
      return;
    }

    setLoading(true);
    const res = await loginSeller(emailOrPhone, password);
    setLoading(false);

    if (res.success) {
      navigate('/seller/dashboard');
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black font-brand text-slate-900">
            CARTPLUS Seller Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your merchant portal, product listings, orders, and sales performance.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Merchant Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="seller@yourstore.np"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating Merchant...' : 'Sign In to Merchant Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration Prompt */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-2 text-xs">
            <p className="text-slate-600">Want to sell your products on CARTPLUS?</p>
            <Link
              to="/become-seller"
              className="inline-flex items-center gap-1.5 font-bold text-amber-600 hover:text-amber-700"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Register Your Store for Free</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
