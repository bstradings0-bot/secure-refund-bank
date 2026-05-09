'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiGlobe,
  FiLock, FiShield, FiCheck, FiAlertCircle, FiSave, FiEye, FiEyeOff
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();

  // Profile
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [country, setCountry] = useState(user?.country || '');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.twoFactorEnabled || false);

  const profileMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: res } = await api.patch('/api/auth/profile', data);
      return res;
    },
    onSuccess: () => toast.success('Profile updated successfully'),
    onError: (error: any) => toast.error(error.response?.data?.message || 'Update failed'),
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: res } = await api.patch('/api/auth/change-password', data);
      return res;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Password change failed'),
  });

  const twoFAMutation = useMutation({
    mutationFn: async () => {
      if (twoFAEnabled) {
        await api.post('/api/auth/2fa/disable');
      } else {
        await api.post('/api/auth/2fa/setup');
      }
    },
    onSuccess: () => {
      setTwoFAEnabled(!twoFAEnabled);
      toast.success(twoFAEnabled ? '2FA disabled' : '2FA enabled successfully');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || '2FA toggle failed'),
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate({ firstName, lastName, phone, address, country });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    passwordMutation.mutate({ currentPassword, newPassword });
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account settings and security</p>
      </div>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-bank-blue/10 flex items-center justify-center">
            <FiUser className="w-5 h-5 text-bank-blue" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Profile Information</h2>
            <p className="text-xs text-gray-500">Update your personal details</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">First Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Last Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={user.email}
                className="input-field pl-10 bg-white/[0.02] cursor-not-allowed"
                disabled
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Phone</label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field pl-10"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Address</label>
            <div className="relative">
              <FiMapPin className="absolute left-3.5 top-3 text-gray-500" />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field pl-10 resize-none"
                rows={2}
                placeholder="123 Main St, City, State"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Country</label>
            <div className="relative">
              <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="input-field pl-10"
                placeholder="United States"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={profileMutation.isPending}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>

      {/* KYC Status */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <FiShield className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">KYC Verification</h2>
            <p className="text-xs text-gray-500">Identity verification status</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <div>
            <p className="text-sm text-white font-medium">KYC Status</p>
            <p className="text-xs text-gray-500 mt-0.5">Required for full platform access</p>
          </div>
          <span className={`badge text-xs ${
            user.kycStatus === 'APPROVED' ? 'badge-success' :
            user.kycStatus === 'PENDING' ? 'badge-pending' :
            user.kycStatus === 'REJECTED' ? 'badge-danger' :
            'bg-gray-500/10 text-gray-400'
          }`}>
            {user.kycStatus || 'NOT_SUBMITTED'}
          </span>
        </div>
      </motion.div>

      {/* Password Change */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <FiLock className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Change Password</h2>
            <p className="text-xs text-gray-500">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Current Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showCurrent ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field pl-10 pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showNew ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pl-10"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            {passwordMutation.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </motion.div>

      {/* 2FA Toggle */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <FiShield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Two-Factor Authentication</h2>
              <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
            </div>
          </div>
          <button
            onClick={() => twoFAMutation.mutate()}
            disabled={twoFAMutation.isPending}
            className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-50 ${
              twoFAEnabled ? 'bg-emerald-500' : 'bg-gray-700'
            }`}
          >
            <motion.div
              className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md"
              animate={{ x: twoFAEnabled ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
