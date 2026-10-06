import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from '../context/RouterContext';
import { Logo } from '../components/common/Logo';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { validateGenuineName, validateGenuineEmail, validateGenuinePhone } from '../utils/genuineValidation';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { navigate } = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Real-time password requirements calculation
  const pwdReqs = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const strengthCount = Object.values(pwdReqs).filter(Boolean).length;
  const strengthPercentage = (strengthCount / 5) * 100;

  const strengthLabel =
    strengthCount <= 2 ? 'Weak' : strengthCount <= 4 ? 'Good' : 'Strong';
  const strengthColor =
    strengthCount <= 2 ? 'bg-rose-500' : strengthCount <= 4 ? 'bg-amber-500' : 'bg-emerald-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Genuine Name Verification
    const nameCheck = validateGenuineName(name, 'Full Name');
    if (!nameCheck.isValid) {
      setError(nameCheck.error || 'Please enter a genuine full name.');
      return;
    }

    // 2. Genuine Email Verification
    const emailCheck = validateGenuineEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error || 'Please enter a valid personal email.');
      return;
    }

    // 3. Genuine Nepal Mobile Phone Verification
    const phoneCheck = validateGenuinePhone(phone);
    if (!phoneCheck.isValid) {
      setError(phoneCheck.error || 'Please enter a valid Nepal mobile number.');
      return;
    }

    // 4. Password validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters with a mix of letters and numbers.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await register(name.trim(), email.trim(), phone.trim(), password);
    setIsLoading(false);

    if (res.success) {
      navigate('/account');
    } else {
      setError(res.error || 'Failed to register account.');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
        className="sm:mx-auto sm:w-full sm:max-w-md text-center"
      >
        <div className="inline-flex justify-center mb-4">
          <Logo size="lg" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 font-brand">
          Create Your CARTPLUS Account
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Join shoppers across Nepal for simple Cash on Delivery checkout and order tracking.
        </p>
      </motion.div>

      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] as const }}
        className="mt-6 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-6 shadow-md rounded-3xl border border-slate-200/90 sm:px-8 space-y-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Thapa"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nepal Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 tabular-nums font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                {password && (
                  <span className={`text-[10px] font-bold ${strengthCount >= 4 ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {strengthLabel}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Real-time strength meter bar */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${strengthPercentage}%` }}
                      transition={{ duration: 0.2 }}
                      className={`h-full ${strengthColor}`}
                    />
                  </div>

                  {/* Requirements checks */}
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 pt-1">
                    <span className={`flex items-center gap-1 ${pwdReqs.length ? 'text-emerald-600 font-semibold' : ''}`}>
                      <Check className={`w-3 h-3 ${pwdReqs.length ? 'opacity-100' : 'opacity-30'}`} />
                      8+ characters
                    </span>
                    <span className={`flex items-center gap-1 ${pwdReqs.hasUpper ? 'text-emerald-600 font-semibold' : ''}`}>
                      <Check className={`w-3 h-3 ${pwdReqs.hasUpper ? 'opacity-100' : 'opacity-30'}`} />
                      Uppercase letter
                    </span>
                    <span className={`flex items-center gap-1 ${pwdReqs.hasLower ? 'text-emerald-600 font-semibold' : ''}`}>
                      <Check className={`w-3 h-3 ${pwdReqs.hasLower ? 'opacity-100' : 'opacity-30'}`} />
                      Lowercase letter
                    </span>
                    <span className={`flex items-center gap-1 ${pwdReqs.hasNumber ? 'text-emerald-600 font-semibold' : ''}`}>
                      <Check className={`w-3 h-3 ${pwdReqs.hasNumber ? 'opacity-100' : 'opacity-30'}`} />
                      Number digit
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-slate-900 hover:underline">
              Sign In here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
