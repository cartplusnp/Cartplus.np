import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from '../context/RouterContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const AdminLoginPage: React.FC = () => {
  const { login, isAuthenticated, isAdmin, logout } = useAuth();
  const { navigate } = useRouter();

  const [staffEmail, setStaffEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, redirect to admin backoffice
  if (isAuthenticated && isAdmin) {
    navigate('/admin');
    return null;
  }

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = staffEmail.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please provide your administrator email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(cleanEmail, password);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please verify credentials.');
        setLoading(false);
        return;
      }

      // Check authoritative database role
      if (isSupabaseConfigured) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status')
          .eq('email', cleanEmail)
          .single();

        if (!profile || profile.role !== 'admin' || profile.status !== 'active') {
          await logout();
          setError('Access Denied: This account does not possess active administrator privileges in the database.');
          setLoading(false);
          return;
        }
      }

      setLoading(false);
      navigate('/admin');
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <ShieldCheck className="w-9 h-9 text-amber-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-brand text-white tracking-tight">
          CARTPLUS Operations Backoffice
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Authorized Internal Operations, Catalog & Marketplace Management.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-6 rounded-3xl border border-slate-800 sm:px-10 space-y-6 shadow-2xl">
          {error && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="p-3.5 bg-amber-400/10 border border-amber-400/20 rounded-xl text-xs space-y-1 text-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Restricted Administrative Portal</span>
            </div>
            <p className="text-[11px] text-slate-300">
              This area is restricted to authorized CARTPLUS staff. Roles and permissions are strictly enforced by database access policies.
            </p>
          </div>

          <form onSubmit={handleStaffLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating Role...' : 'Sign In to Operations Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs space-y-2">
            <Link to="/" className="text-slate-400 hover:text-slate-200">
              &larr; Return to CARTPLUS Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
