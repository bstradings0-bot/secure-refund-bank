'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiShield, FiEye, FiEyeOff, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if already logged in as admin
  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (stored && token) {
      try {
        const user = JSON.parse(stored);
        if (user.role === 'ADMIN') {
          router.replace('/admin');
          return;
        }
        // Non-admin has admin token somehow — clear and stay
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } catch {}
    }
  }, [router]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Admin email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    if (password && password.length < 8) errs.password = 'Minimum 8 characters';
    if (show2FA && !otpCode.trim()) errs.otpCode = '2FA code is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post('/api/admin/login', {
        email: email.trim(),
        password,
        otpCode: otpCode || undefined,
      });

      if (data.data?.requires2FA) {
        setShow2FA(true);
        toast.success('2FA code generated. Check your admin device.');
        setLoading(false);
        return;
      }

      if (data.success) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        toast.success('Admin access granted');
        router.replace('/admin');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Admin authentication failed';
      toast.error(msg);
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-navy-950 to-red-950/30" />

      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(239,68,68,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Animated orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-red-500/20 blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.12, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-orange-500/20 blur-[120px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md z-10"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 mb-4 relative"
          >
            <FiShield className="w-10 h-10 text-red-400" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 animate-pulse" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Panel</span>
          </h1>
          <p className="text-gray-400 mt-2">SecureRefund Bank — Administrative Access</p>
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
            <FiAlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs text-red-300 font-medium">Restricted Area — Authorized Personnel Only</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 border-red-500/10">
          {/* Form error */}
          {errors.form && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 flex items-start gap-3"
            >
              <FiAlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
              <span>{errors.form}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Admin Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                  className="input-field pl-12"
                  placeholder="admin@securebank.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                  className="input-field pl-12 pr-12"
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* 2FA Code (conditional) */}
            {show2FA && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  2FA Code
                </label>
                <div className="relative">
                  <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" />
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => { setOtpCode(e.target.value); setErrors({}); }}
                    className="input-field pl-12 border-red-500/30 focus:border-red-400"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                {errors.otpCode && <p className="text-red-400 text-xs mt-1">{errors.otpCode}</p>}
                <p className="text-xs text-gray-500 mt-1">Enter the one-time code sent to your admin device</p>
              </motion.div>
            )}

            {/* Actions Row */}
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-600 bg-transparent accent-red-500" />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3.5 text-base font-semibold rounded-xl text-white overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 group-hover:from-red-500 group-hover:to-orange-400 transition-all duration-300" />
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <FiShield className="w-5 h-5" />
                    Access Admin Panel
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-navy-900 text-gray-500">or</span>
            </div>
          </div>

          {/* Back to user login */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Return to user login
            </Link>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-center text-xs text-gray-500">
            <span className="text-gray-400 font-medium">Demo admin account:</span>{' '}
            <span className="text-red-400/80">admin@securebank.com</span>{' '}
            <span className="text-gray-600">/</span>{' '}
            <span className="text-red-400/80">Admin123!</span>
          </p>
        </div>

        {/* Security notice */}
        <p className="text-center text-[10px] text-gray-600 mt-4">
          All admin access attempts are logged and monitored. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </div>
  );
}
