'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiPlus, FiMinus, FiLock, FiUnlock, FiDollarSign,
  FiFileText, FiHash, FiShield, FiX, FiCreditCard, FiActivity,
  FiBell, FiClock, FiAlertTriangle, FiUser, FiMail, FiPhone,
  FiMapPin, FiCalendar, FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  country: string;
  role: string;
  kycStatus: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  suspended: boolean;
  createdAt: string;
  account: {
    id: string;
    accountNumber: string;
    balance: number;
    savingsBalance: number;
    currency: string;
    status: string;
  } | null;
  cards: any[];
  refundRequests: any[];
  notifications: any[];
  activityLogs: any[];
}

export default function AdminUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params.id as string;

  // Credit/Debit modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [modalAction, setModalAction] = useState<'credit' | 'debit' | 'freeze'>('credit');
  const [creditForm, setCreditForm] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    reason: '',
  });

  // Active tab
  const [activeTab, setActiveTab] = useState<'cards' | 'logs' | 'notifications'>('cards');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/users/${userId}`);
      return data.data as UserProfileData;
    },
    enabled: !!userId,
  });

  const adminMutation = useMutation({
    mutationFn: async (opts: {
      action: 'credit' | 'debit' | 'freeze';
      amount?: number;
      currency?: string;
      description?: string;
      reason?: string;
    }) => {
      const { action, amount, currency, description, reason } = opts;
      if (action === 'freeze') {
        const { data } = await api.patch(`/api/admin/users/${userId}/freeze`);
        return data;
      }
      const url = `/api/admin/users/${userId}/${action}`;
      const { data } = await api.post(url, { amount, currency, description, reason: reason || undefined });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowActionModal(false);
      setCreditForm({ amount: '', currency: 'USD', description: '', reason: '' });
      toast.success('Action completed successfully');
    },
    onError: (error: any) => {
      console.error('Admin operation error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || error.message || 'Operation failed');
    },
  });

  const openModal = (action: 'credit' | 'debit' | 'freeze') => {
    setModalAction(action);
    setCreditForm({ amount: '', currency: 'USD', description: '', reason: '' });
    setShowActionModal(true);
  };

  const confirmAction = () => {
    if (modalAction === 'freeze') {
      adminMutation.mutate({ action: 'freeze' });
      return;
    }
    const amount = parseFloat(creditForm.amount);
    if (!amount || amount <= 0) return toast.error('Enter a valid positive amount');
    if (modalAction === 'debit' && !creditForm.reason.trim()) {
      return toast.error('Reason is required for debits');
    }
    adminMutation.mutate({
      action: modalAction,
      amount,
      currency: creditForm.currency,
      description: creditForm.description || undefined,
      reason: creditForm.reason || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded" />
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <FiAlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">User Not Found</h2>
        <p className="text-gray-400 mb-6">This user may have been deleted.</p>
        <Link href="/admin/users" className="btn-primary">Back to Users</Link>
      </div>
    );
  }

  const account = profile.account;
  const isFrozen = account?.status === 'FROZEN';
  const isSuspended = profile.suspended;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      {/* Profile Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bank-blue to-cyan-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {profile.firstName} {profile.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <FiMail className="w-3.5 h-3.5" /> {profile.email}
                </span>
                {profile.phone && (
                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    <FiPhone className="w-3.5 h-3.5" /> {profile.phone}
                  </span>
                )}
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <FiMapPin className="w-3.5 h-3.5" /> {profile.country || 'US'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`badge text-xs ${profile.role === 'ADMIN' ? 'badge-warning' : 'badge-success'}`}>
                  {profile.role}
                </span>
                {isSuspended && <span className="badge badge-danger text-xs">SUSPENDED</span>}
                {isFrozen && <span className="badge badge-warning text-xs">FROZEN</span>}
                <span className={`badge text-xs ${profile.emailVerified ? 'badge-success' : 'badge-danger'}`}>
                  {profile.emailVerified ? 'Verified' : 'Unverified'}
                </span>
                <span className="badge text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
                  KYC: {profile.kycStatus}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1">
                <FiCalendar className="w-3 h-3" />
                Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => openModal('credit')}
              disabled={!account || isFrozen}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-medium text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FiPlus className="w-4 h-4" /> Credit
            </button>
            <button
              onClick={() => openModal('debit')}
              disabled={!account || isFrozen || (account?.balance ?? 0) <= 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FiMinus className="w-4 h-4" /> Debit
            </button>
            <button
              onClick={() => openModal('freeze')}
              disabled={!account}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                isFrozen
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
              }`}
            >
              {isFrozen ? <FiUnlock className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
              {isFrozen ? 'Unfreeze' : 'Freeze'}
            </button>
          </div>
        </div>
      </div>

      {/* Account Details */}
      {account && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="glass-card p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Main Balance</p>
            <p className="text-2xl font-bold text-white">
              ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">{account.currency}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Savings</p>
            <p className="text-2xl font-bold text-white">
              ${account.savingsBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Account Number</p>
            <p className="text-lg font-mono font-bold text-bank-blue">{account.accountNumber}</p>
            <p className="text-xs text-gray-500 mt-1">ID: {account.id.slice(0, 8)}...</p>
          </div>
        </div>
      )}

      {/* No Account State */}
      {!account && (
        <div className="glass-card p-8 text-center">
          <FiAlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No Bank Account</h3>
          <p className="text-sm text-gray-400">This user does not have an associated bank account.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {(['cards', 'logs', 'notifications'] as const).map((tab) => {
          const labels = { cards: 'Cards', logs: 'Activity Logs', notifications: 'Notifications' };
          const icons = { cards: FiCreditCard, logs: FiActivity, notifications: FiBell };
          const Icon = icons[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-bank-blue/20 text-bank-blue'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {labels[tab]}
              {tab === 'cards' && profile.cards?.length > 0 && (
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{profile.cards.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'cards' && (
        <div>
          {profile.cards && profile.cards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.cards.map((card: any) => (
                <div key={card.id} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FiCreditCard className="w-4 h-4 text-bank-blue" />
                      <span className="text-sm font-medium text-white">{card.cardType}</span>
                    </div>
                    <span className={`badge text-xs ${
                      card.status === 'ACTIVE' ? 'badge-success' :
                      card.status === 'FROZEN' ? 'badge-warning' : 'badge-danger'
                    }`}>{card.status}</span>
                  </div>
                  <p className="font-mono text-sm text-gray-300 mb-2">
                    {card.cardNumber?.replace(/(\d{4})/g, '$1 ').trim()}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Exp: {card.expiryDate}</span>
                    <span>CVV: ***</span>
                    <span>Limit: ${card.spendingLimit?.toLocaleString()}</span>
                  </div>
                  {card.cardLabel && (
                    <p className="text-xs text-gray-500 mt-2 italic">&ldquo;{card.cardLabel}&rdquo;</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <FiCreditCard className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No virtual cards</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="glass-card overflow-hidden">
          {profile.activityLogs && profile.activityLogs.length > 0 ? (
            <div className="divide-y divide-white/5">
              {profile.activityLogs.slice(0, 50).map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-4 hover:bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-bank-blue/10 flex items-center justify-center">
                      <FiActivity className="w-4 h-4 text-bank-blue" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-mono text-xs">{log.action}</p>
                      {log.ipAddress && (
                        <p className="text-[10px] text-gray-600">{log.ipAddress} · {log.userAgent}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FiActivity className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No activity logs</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="glass-card overflow-hidden">
          {profile.notifications && profile.notifications.length > 0 ? (
            <div className="divide-y divide-white/5">
              {profile.notifications.slice(0, 20).map((notif: any) => (
                <div key={notif.id} className="flex items-start gap-3 p-4 hover:bg-white/[0.01]">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    notif.type === 'TRANSACTION' ? 'bg-emerald-500/10 text-emerald-400' :
                    notif.type === 'CARD' ? 'bg-purple-500/10 text-purple-400' :
                    notif.type === 'SECURITY' ? 'bg-red-500/10 text-red-400' :
                    'bg-bank-blue/10 text-bank-blue'
                  }`}>
                    <FiBell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{notif.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{notif.message}</p>
                    <p className="text-[10px] text-gray-600 mt-1 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-bank-blue flex-shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FiBell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No notifications</p>
            </div>
          )}
        </div>
      )}

      {/* Credit / Debit / Freeze Modal */}
      <AnimatePresence>
        {showActionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowActionModal(false); } }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    modalAction === 'credit' ? 'bg-emerald-500/20 text-emerald-400' :
                    modalAction === 'debit' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {modalAction === 'credit' ? <FiPlus className="w-5 h-5" /> :
                     modalAction === 'debit' ? <FiMinus className="w-5 h-5" /> :
                     <FiShield className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white capitalize">
                      {modalAction === 'freeze'
                        ? (isFrozen ? 'Unfreeze' : 'Freeze') + ' Account'
                        : `${modalAction} ${profile.firstName}`}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Balance: ${account?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0.00'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowActionModal(false)} className="text-gray-400 hover:text-white">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {(modalAction === 'credit' || modalAction === 'debit') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Amount <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                          type="number"
                          value={creditForm.amount}
                          onChange={(e) => setCreditForm((f) => ({ ...f, amount: e.target.value }))}
                          className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-bank-blue transition-all"
                          placeholder="0.00"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                      <select
                        value={creditForm.currency}
                        onChange={(e) => setCreditForm((f) => ({ ...f, currency: e.target.value }))}
                        className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-bank-blue transition-all"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <input
                      type="text"
                      value={creditForm.description}
                      onChange={(e) => setCreditForm((f) => ({ ...f, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-bank-blue transition-all"
                      placeholder="e.g. Welcome bonus, account adjustment..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reason {modalAction === 'debit' && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="text"
                      value={creditForm.reason}
                      onChange={(e) => setCreditForm((f) => ({ ...f, reason: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-bank-blue transition-all"
                      placeholder={modalAction === 'debit' ? 'Required for audit' : 'Optional'}
                    />
                  </div>
                </div>
              )}

              {modalAction === 'freeze' && (
                <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 mb-4">
                  <p className="text-sm text-yellow-300/80">
                    {isFrozen ? 'Unfreeze to restore transactions.' : 'Freeze to block all transactions.'}
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowActionModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button
                  onClick={confirmAction}
                  disabled={adminMutation.isPending}
                  className={`btn-primary flex-1 ${modalAction === 'debit' || modalAction === 'freeze' ? '!bg-red-500' : ''}`}
                >
                  {adminMutation.isPending ? 'Processing...' : modalAction === 'freeze' ? (isFrozen ? 'Unfreeze' : 'Freeze') : `Confirm ${modalAction}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
