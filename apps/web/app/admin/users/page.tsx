'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus, FiLock, FiUnlock, FiSearch, FiX, FiDollarSign, FiFileText, FiUser, FiHash, FiExternalLink, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import Link from 'next/link';

interface UserAccount {
  id: string;
  accountNumber: string;
  balance: number;
  savingsBalance: number;
  status: string;
  currency: string;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  country: string;
  role: string;
  kycStatus: string;
  emailVerified: boolean;
  suspended: boolean;
  createdAt: string;
  account: UserAccount | null;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modal state
  const [modalUser, setModalUser] = useState<AdminUser | null>(null);
  const [modalAction, setModalAction] = useState<'credit' | 'debit' | 'freeze' | ''>('');
  const [creditForm, setCreditForm] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    reason: '',
  });

  // Real-time balance tracking
  const [liveBalances, setLiveBalances] = useState<Record<string, number>>({});
  const adminUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const socketRef = useSocket(adminUser?.id);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Users query with search
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', debouncedSearch],
    queryFn: async () => {
      const params = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : '';
      const { data } = await api.get(`/api/admin/users${params}`);
      return data.data as AdminUser[];
    },
    refetchInterval: 15000, // auto-refresh every 15s
  });

  // Initialize live balances from fetched data
  useEffect(() => {
    if (users) {
      const balances: Record<string, number> = {};
      users.forEach((u) => {
        if (u.account) balances[u.id] = u.account.balance;
      });
      setLiveBalances((prev) => ({ ...balances, ...prev }));
    }
  }, [users]);

  // Socket.io — listen for balance updates
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleBalanceUpdate = (data: { balance: number; userId?: string }) => {
      // If userId is provided, update that user; otherwise invalidate query
      if (data.userId) {
        const userId = data.userId as string;
        setLiveBalances((prev) => ({ ...prev, [userId]: data.balance }));
      }
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    };

    const handleTransaction = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    };

    socket.on('balance:updated', handleBalanceUpdate);
    socket.on('transaction:new', handleTransaction);

    return () => {
      socket.off('balance:updated', handleBalanceUpdate);
      socket.off('transaction:new', handleTransaction);
    };
  }, [socketRef, queryClient]);

  // Admin mutations
  const adminMutation = useMutation({
    mutationFn: async ({
      userId,
      action,
      amount,
      currency,
      description,
      reason,
    }: {
      userId: string;
      action: string;
      amount?: number;
      currency?: string;
      description?: string;
      reason?: string;
    }) => {
      const endpoints: Record<string, { method: 'post' | 'patch'; url: string }> = {
        credit: { method: 'post', url: `/api/admin/users/${userId}/credit` },
        debit: { method: 'post', url: `/api/admin/users/${userId}/debit` },
        freeze: { method: 'patch', url: `/api/admin/users/${userId}/freeze` },
        suspend: { method: 'patch', url: `/api/admin/users/${userId}/suspend` },
      };
      const ep = endpoints[action];
      const body = action === 'freeze' || action === 'suspend'
        ? {}
        : { amount, currency, description, reason: reason || undefined };
      const { data } = await (ep.method === 'patch' ? api.patch(ep.url, body) : api.post(ep.url, body));
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      closeModal();
      const actionLabels: Record<string, string> = {
        credit: `Credited $${variables.amount?.toLocaleString()} ${variables.currency}`,
        debit: `Debited $${variables.amount?.toLocaleString()} ${variables.currency}`,
        freeze: data.status === 'FROZEN' ? 'Account frozen' : 'Account unfrozen',
        suspend: data.suspended ? 'User suspended' : 'User unsuspended',
      };
      toast.success(actionLabels[variables.action] || 'Action completed', {
        icon: variables.action === 'credit' ? '💰' : variables.action === 'debit' ? '📤' : '🔒',
      });

      // Emit socket event to refresh
      const socket = socketRef.current;
      if (socket && variables.action === 'credit' && data.newBalance) {
        socket.emit('admin:credit', {
          userId: variables.userId,
          amount: variables.amount,
          newBalance: data.newBalance,
        });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Operation failed');
    },
  });

  // Modal helpers
  const openModal = (user: AdminUser, action: 'credit' | 'debit' | 'freeze') => {
    setModalUser(user);
    setModalAction(action);
    setCreditForm({ amount: '', currency: 'USD', description: '', reason: '' });
  };

  const closeModal = useCallback(() => {
    setModalUser(null);
    setModalAction('');
    setCreditForm({ amount: '', currency: 'USD', description: '', reason: '' });
  }, []);

  const confirmAction = () => {
    if (!modalUser) return;

    if (modalAction === 'freeze') {
      adminMutation.mutate({ userId: modalUser.id, action: 'freeze' });
      return;
    }

    const amount = parseFloat(creditForm.amount);
    if (!amount || amount <= 0) {
      return toast.error('Enter a valid positive amount');
    }

    if (modalAction === 'debit') {
      const currentBalance = liveBalances[modalUser.id] ?? modalUser.account?.balance ?? 0;
      if (amount > currentBalance) {
        return toast.error(`Insufficient balance. User has $${currentBalance.toLocaleString()}`);
      }
      if (!creditForm.reason.trim()) {
        return toast.error('Reason is required for debits');
      }
    }

    adminMutation.mutate({
      userId: modalUser.id,
      action: modalAction,
      amount,
      currency: creditForm.currency,
      description: creditForm.description || undefined,
      reason: creditForm.reason || undefined,
    });
  };

  const getBalance = (user: AdminUser) => {
    return liveBalances[user.id] ?? user.account?.balance ?? 0;
  };

  const getStatusBadge = (user: AdminUser) => {
    if (user.suspended) return { label: 'SUSPENDED', class: 'badge-danger' };
    if (!user.account) return { label: 'NO ACCOUNT', class: 'badge-danger' };
    if (user.account.status === 'FROZEN') return { label: 'FROZEN', class: 'badge-warning' };
    return { label: 'ACTIVE', class: 'badge-success' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">
            {users ? `${users.length} users` : 'Loading...'} — Credit, debit, freeze accounts
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-bank-blue focus:ring-1 focus:ring-bank-blue/30 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left p-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-xs text-gray-400 font-semibold uppercase tracking-wider hidden md:table-cell">Account #</th>
                <th className="text-left p-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">Balance</th>
                <th className="text-left p-4 text-xs text-gray-400 font-semibold uppercase tracking-wider hidden lg:table-cell">Country</th>
                <th className="text-left p-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">Status</th>
                <th className="text-right p-4 text-xs text-gray-400 font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="p-4"><div className="h-5 bg-white/5 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : users && users.length > 0 ? (
                users.map((user) => {
                  const balance = getBalance(user);
                  const statusBadge = getStatusBadge(user);
                  const previousBalance = user.account?.balance ?? 0;
                  const balanceChanged = balance !== previousBalance;

                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* User Info */}
                      <td className="p-4">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="flex items-center gap-3 group/link"
                        >
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bank-blue to-cyan-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white group-hover/link:text-bank-blue transition-colors flex items-center gap-1">
                              {user.firstName} {user.lastName}
                              <FiExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            <p className="text-[10px] text-gray-600">{user.role}</p>
                          </div>
                        </Link>
                      </td>

                      {/* Account Number */}
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-sm font-mono text-gray-300">
                          {user.account?.accountNumber || '—'}
                        </span>
                      </td>

                      {/* Balance */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold font-mono transition-all duration-500 ${
                              balanceChanged ? 'text-emerald-400 scale-105' : 'text-white'
                            }`}
                          >
                            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          {balanceChanged && (
                            <motion.span
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                balance > previousBalance
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {balance > previousBalance ? '+' : ''}
                              ${(balance - previousBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </motion.span>
                          )}
                        </div>
                      </td>

                      {/* Country */}
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-400">{user.country || 'US'}</span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`badge text-xs ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openModal(user, 'credit')}
                            disabled={!user.account || user.account.status === 'FROZEN'}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Credit user"
                          >
                            <FiPlus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal(user, 'debit')}
                            disabled={!user.account || user.account.status === 'FROZEN' || getBalance(user) <= 0}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Debit user"
                          >
                            <FiMinus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal(user, 'freeze')}
                            disabled={!user.account}
                            className={`p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                              user.account?.status === 'FROZEN'
                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                            }`}
                            title={user.account?.status === 'FROZEN' ? 'Unfreeze account' : 'Freeze account'}
                          >
                            {user.account?.status === 'FROZEN' ? (
                              <FiUnlock className="w-4 h-4" />
                            ) : (
                              <FiLock className="w-4 h-4" />
                            )}
                          </button>
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="p-2 rounded-lg bg-bank-blue/10 text-bank-blue hover:bg-bank-blue/20 transition-all"
                            title="View profile"
                          >
                            <FiUser className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <FiSearch className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {debouncedSearch ? 'No users match your search' : 'No users found'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit / Debit / Freeze Modal */}
      <AnimatePresence>
        {modalUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    modalAction === 'credit'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : modalAction === 'debit'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {modalAction === 'credit' ? <FiPlus className="w-5 h-5" /> :
                     modalAction === 'debit' ? <FiMinus className="w-5 h-5" /> :
                     <FiShield className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white capitalize">
                      {modalAction === 'freeze'
                        ? (modalUser.account?.status === 'FROZEN' ? 'Unfreeze' : 'Freeze') + ' Account'
                        : `${modalAction} User`}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {modalUser.firstName} {modalUser.lastName}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* User Info Summary */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Current Balance</p>
                  <p className="text-lg font-bold text-white">
                    ${getBalance(modalUser).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Account Number</p>
                  <p className="text-sm font-mono text-gray-300">
                    {modalUser.account?.accountNumber || '—'}
                  </p>
                </div>
              </div>

              {/* Credit / Debit Form */}
              {(modalAction === 'credit' || modalAction === 'debit') && (
                <div className="space-y-4">
                  {/* Amount + Currency Row */}
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
                          className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-bank-blue transition-all"
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                      <select
                        value={creditForm.currency}
                        onChange={(e) => setCreditForm((f) => ({ ...f, currency: e.target.value }))}
                        className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-bank-blue transition-all appearance-none cursor-pointer"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FiFileText className="inline w-3.5 h-3.5 mr-1.5" />
                      Description
                    </label>
                    <input
                      type="text"
                      value={creditForm.description}
                      onChange={(e) => setCreditForm((f) => ({ ...f, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-bank-blue transition-all"
                      placeholder={modalAction === 'credit' ? 'e.g. Welcome bonus, deposit...' : 'e.g. Fee deduction, charge...'}
                      maxLength={200}
                    />
                  </div>

                  {/* Reason (Debit only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FiHash className="inline w-3.5 h-3.5 mr-1.5" />
                      Reason {modalAction === 'debit' && <span className="text-red-400">*</span>}
                    </label>
                    <input
                      type="text"
                      value={creditForm.reason}
                      onChange={(e) => setCreditForm((f) => ({ ...f, reason: e.target.value }))}
                      className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all ${
                        modalAction === 'debit' && !creditForm.reason.trim()
                          ? 'border-red-500/50 focus:border-red-500'
                          : 'border-white/10 focus:border-bank-blue'
                      }`}
                      placeholder={modalAction === 'debit' ? 'Required — e.g. Service fee, penalty...' : 'Optional reason for audit log'}
                      maxLength={200}
                    />
                  </div>

                  {/* Preview */}
                  {creditForm.amount && parseFloat(creditForm.amount) > 0 && (
                    <div className={`p-4 rounded-xl border ${
                      modalAction === 'credit'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-red-500/5 border-red-500/20'
                    }`}>
                      <p className="text-xs text-gray-400 mb-2">Transaction Preview</p>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount</span>
                          <span className={`font-bold ${modalAction === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {modalAction === 'credit' ? '+' : '−'}
                            {creditForm.currency} {parseFloat(creditForm.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">New Balance</span>
                          <span className="text-white font-medium">
                            ${(getBalance(modalUser) + (modalAction === 'credit' ? parseFloat(creditForm.amount) : -parseFloat(creditForm.amount)))
                              .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {creditForm.description && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Note</span>
                            <span className="text-gray-300 truncate max-w-[200px]">{creditForm.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Freeze Warning */}
              {modalAction === 'freeze' && (
                <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 mb-4">
                  <p className="text-sm text-yellow-300/80">
                    {modalUser.account?.status === 'FROZEN'
                      ? 'This will unfreeze the account. The user will be able to transact again.'
                      : 'This will freeze the account. The user will not be able to send or receive funds until unfrozen.'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button onClick={closeModal} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={adminMutation.isPending}
                  className={`btn-primary flex-1 flex items-center justify-center gap-2 ${
                    modalAction === 'debit' || modalAction === 'freeze'
                      ? '!bg-red-500 hover:!bg-red-600'
                      : modalAction === 'credit'
                      ? '!bg-emerald-500 hover:!bg-emerald-600'
                      : ''
                  }`}
                >
                  {adminMutation.isPending ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </>
                  ) : modalAction === 'freeze' ? (
                    modalUser.account?.status === 'FROZEN' ? 'Unfreeze Account' : 'Freeze Account'
                  ) : (
                    `Confirm ${modalAction === 'credit' ? 'Credit' : 'Debit'}`
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
