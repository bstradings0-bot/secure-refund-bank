'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiShield, FiArrowLeft } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState('');

  const handleSendOtp = async () => {
    if (!email) return toast.error('Enter your email');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/forgot-password', { email });
      setOtpSent(data.data.otpCode);
      setStep(2);
      toast.success('Reset code sent!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error sending code');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!otpCode || !newPassword) return toast.error('Fill all fields');
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { email, otpCode, newPassword });
      toast.success('Password reset! Redirecting...');
      setTimeout(() => window.location.href = '/login', 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error resetting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-grid">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900/30" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="glass-card p-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
            <FiArrowLeft className="w-4 h-4" /> Back to login
          </Link>
          <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-400 text-sm mb-6">{step === 1 ? 'Enter your email to receive a reset code' : 'Enter the code and your new password'}</p>

          {step === 1 ? (
            <div className="space-y-4">
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-12" placeholder="you@example.com" />
              </div>
              <button onClick={handleSendOtp} disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Code'}</button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 bg-white/5 p-2 rounded-lg">Demo OTP: {otpSent || 'Check console'}</p>
              <div className="relative">
                <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="input-field pl-12" placeholder="Enter 6-digit code" maxLength={6} />
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field pl-12" placeholder="New password (min 8 chars)" />
              </div>
              <button onClick={handleReset} disabled={loading} className="btn-primary w-full">{loading ? 'Resetting...' : 'Reset Password'}</button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
