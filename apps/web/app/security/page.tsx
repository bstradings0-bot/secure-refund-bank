'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import {
  FiLock, FiShield, FiActivity, FiKey, FiToggleLeft, FiToggleRight,
  FiEye, FiEyeOff, FiCheck, FiAlertCircle, FiClock, FiGlobe,
  FiMonitor, FiSmartphone, FiSave
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function SecurityPage() {
  const { user } = useAuth();

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => { const { data } = await api.get('/api/auth/me'); return data.data; },
  });

  const passwordMutation = useMutation({
    mutationFn: async (body: { currentPassword: string; newPassword: string }) => {
      const { data } = await api.patch('/api/auth/change-password', body);
      return data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  const twoFaMutation = useMutation({
    mutationFn: async (enable: boolean) => {
      const endpoint = enable ? '/api/auth/2fa/setup' : '/api/auth/2fa/disable';
      const { data } = await api.post(endpoint);
      return data;
    },
    onSuccess: (_, enable) => toast.success(`2FA ${enable ? 'enabled' : 'disabled'} successfully`),
    onError: (err: any) => toast.error(err.response?.data?.message || '2FA toggle failed'),
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  const twoFaEnabled = profile?.twoFactorEnabled || user?.twoFactorEnabled;

  // Mock login activity for demo
  const loginSessions = [
    { device: 'Chrome on Windows', location: 'New York, US', ip: '192.168.1.1', time: '2 minutes ago', current: true },
    { device: 'Safari on iPhone', location: 'New York, US', ip: '10.0.0.2', time: '3 hours ago', current: false },
    { device: 'Firefox on MacOS', location: 'Los Angeles, US', ip: '172.16.0.3', time: '2 days ago', current: false },
  ];

  return (
    <div className="min-h-screen bg-navy-950 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <FiShield className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Security Center</h1>
          </div>
          <p className="text-gray-400 ml-13 mb-8">Manage your password, two-factor authentication, and view login activity.</p>
        </motion.div>

        <div className="space-y-6">
          {/* Password Change */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FiKey className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Change Password</h2>
                <p className="text-xs text-gray-500">Use a strong password you don't use elsewhere</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Current Password</label>
                <div className="relative">
                  <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-bank-blue/50 focus:outline-none pr-10"
                    placeholder="Enter current password" required />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showCurrent ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">New Password</label>
                <div className="relative">
                  <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-bank-blue/50 focus:outline-none pr-10"
                    placeholder="At least 8 characters" required />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showNew ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-bank-blue/50 focus:outline-none"
                  placeholder="Re-enter new password" required />
              </div>
              <button type="submit" disabled={passwordMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-bank-blue text-white font-semibold text-sm hover:bg-bank-blue/90 transition-colors disabled:opacity-50">
                {passwordMutation.isPending ? 'Updating...' : <><FiSave className="w-4 h-4" /> Update Password</>}
              </button>
            </form>
          </motion.div>

          {/* Two-Factor Authentication */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FiLock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Two-Factor Authentication</h2>
                  <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                </div>
              </div>
              <button
                onClick={() => twoFaMutation.mutate(!twoFaEnabled)}
                disabled={twoFaMutation.isPending}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  twoFaEnabled
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                }`}
              >
                {twoFaEnabled ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                {twoFaEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            {twoFaEnabled && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
                <FiCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-300">Your account is protected with two-factor authentication. You'll be asked for a verification code when signing in.</p>
              </div>
            )}
          </motion.div>

          {/* Login Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <FiActivity className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Login Activity</h2>
                <p className="text-xs text-gray-500">Recent sign-ins to your account</p>
              </div>
            </div>

            <div className="space-y-3">
              {loginSessions.map((session, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                      {session.device.includes('iPhone') ? <FiSmartphone className="w-4 h-4 text-gray-400" /> : <FiMonitor className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{session.device}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FiGlobe className="w-3 h-3" /> {session.location}
                        <span>•</span>
                        <span>{session.ip}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <FiClock className="w-3 h-3" /> {session.time}
                    </div>
                    {session.current && (
                      <span className="badge badge-success text-[10px] mt-1">Current</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Security Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-bank-blue/10 flex items-center justify-center">
                <FiAlertCircle className="w-5 h-5 text-bank-blue" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Security Best Practices</h2>
                <p className="text-xs text-gray-500">Keep your account safe with these tips</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'Use a unique password for your banking account',
                'Enable two-factor authentication for extra protection',
                'Never share your login credentials with anyone',
                'Log out from shared or public devices after use',
                'Monitor your account activity regularly for suspicious actions',
                'Use a password manager to generate and store strong passwords',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-white/[0.02]">
                  <FiCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
