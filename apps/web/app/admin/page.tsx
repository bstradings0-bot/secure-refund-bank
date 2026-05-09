'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import {
  FiUsers, FiDollarSign, FiActivity, FiCreditCard, FiTrendingUp,
  FiRefreshCw, FiPlusCircle, FiMinusCircle, FiLock, FiBell,
  FiClock, FiAlertCircle, FiBarChart2, FiArrowUp, FiArrowDown,
} from 'react-icons/fi';
import Link from 'next/link';
import { useMemo } from 'react';

export default function AdminPage() {
  // Analytics
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/analytics');
      return data.data;
    },
    refetchInterval: 30000,
  });

  // Recent transactions
  const { data: txData } = useQuery({
    queryKey: ['admin-recent-tx'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/transactions?page=1&limit=5');
      return data;
    },
    refetchInterval: 15000,
  });

  // Pending refunds
  const { data: refundData } = useQuery({
    queryKey: ['admin-pending-refunds'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/refunds?status=PENDING&page=1&limit=5');
      return data;
    },
    refetchInterval: 15000,
  });

  // Recent activity logs
  const { data: logData } = useQuery({
    queryKey: ['admin-recent-logs'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/activity-logs?page=1&limit=8');
      return data;
    },
    refetchInterval: 20000,
  });

  // Card analytics
  const { data: cardAnalytics } = useQuery({
    queryKey: ['admin-card-stats'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/cards/analytics');
      return data.data;
    },
    refetchInterval: 30000,
  });

  // Calculate total balances from users
  const { data: users } = useQuery({
    queryKey: ['admin-users-balance'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/users');
      return data.data;
    },
    refetchInterval: 30000,
  });

  const totalBalances = useMemo(() => {
    if (!users) return 0;
    return users.reduce((sum: number, u: any) => {
      const acct = u.account;
      return sum + (acct?.balance || 0) + (acct?.savingsBalance || 0);
    }, 0);
  }, [users]);

  const stats = [
    { label: 'Total Users', value: analytics?.totalUsers || 0, icon: FiUsers, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Balances', value: `$${((totalBalances || 0) / 1000).toFixed(1)}K`, icon: FiDollarSign, color: 'from-emerald-500 to-teal-500' },
    { label: 'Transactions', value: analytics?.totalTransactions || 0, icon: FiActivity, color: 'from-purple-500 to-pink-500' },
    { label: 'Active Cards', value: cardAnalytics?.activeCards || analytics?.activeCards || 0, icon: FiCreditCard, color: 'from-orange-500 to-yellow-500' },
    { label: 'Total Volume', value: `$${((analytics?.totalVolume || 0) / 1000).toFixed(1)}K`, icon: FiBarChart2, color: 'from-rose-500 to-red-500' },
    { label: 'Pending Refunds', value: analytics?.pendingRefunds || 0, icon: FiRefreshCw, color: 'from-amber-500 to-yellow-500' },
  ];

  const quickActions = [
    { label: 'Credit User', desc: 'Add funds to any user account', icon: FiPlusCircle, href: '/admin/users', color: 'from-emerald-500 to-green-600', badge: 'CREDIT' },
    { label: 'Debit User', desc: 'Deduct funds from any account', icon: FiMinusCircle, href: '/admin/users', color: 'from-red-500 to-rose-600', badge: 'DEBIT' },
    { label: 'Freeze Accounts', desc: 'Freeze or unfreeze user accounts', icon: FiLock, href: '/admin/users', color: 'from-amber-500 to-orange-600', badge: 'FREEZE' },
    { label: 'Manage Cards', desc: 'View and manage all virtual cards', icon: FiCreditCard, href: '/admin/transactions', color: 'from-indigo-500 to-purple-600', badge: 'CARDS' },
    { label: 'Analytics', desc: 'View detailed platform analytics', icon: FiTrendingUp, href: '/admin/transactions', color: 'from-cyan-500 to-blue-600', badge: 'STATS' },
    { label: 'Notifications', desc: 'Manage system announcements', icon: FiBell, href: '/admin/users', color: 'from-pink-500 to-rose-600', badge: 'ALERTS' },
  ];

  const transactions = txData?.transactions || [];
  const pendingRefunds = refundData?.refunds || [];
  const activityLogs = logData?.logs || [];

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">SecureRefund Bank — Platform Control Center</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live monitoring active
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-4 hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Link
                  href={action.href}
                  className="glass-card p-4 block hover:border-white/15 transition-all group h-full"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-gray-300 transition-colors">
                      {action.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-0.5">{action.label}</h3>
                  <p className="text-[11px] text-gray-500 leading-tight">{action.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Three-column: Transactions | Refunds | Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiActivity className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
            </div>
            <Link href="/admin/transactions" className="text-xs text-bank-blue hover:underline">View All</Link>
          </div>
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No recent transactions</p>
          ) : (
            <div className="space-y-2.5">
              {transactions.slice(0, 5).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white truncate">
                        {tx.sender?.firstName} → {tx.receiver?.firstName}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{formatDate(tx.timestamp)}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold text-white">{formatAmount(tx.amount)}</p>
                    <span className={`text-[10px] font-medium ${tx.status === 'COMPLETED' ? 'text-green-400' : tx.status === 'PENDING' ? 'text-amber-400' : 'text-red-400'}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pending Refunds */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiRefreshCw className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Refund Requests</h3>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">
              {analytics?.pendingRefunds || 0} pending
            </span>
          </div>
          {pendingRefunds.length === 0 ? (
            <div className="text-center py-8">
              <FiAlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No pending refunds</p>
              <p className="text-xs text-gray-600 mt-1">All refund requests have been processed</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingRefunds.slice(0, 5).map((ref: any) => (
                <div key={ref.id} className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white truncate">{ref.user?.firstName} {ref.user?.lastName}</span>
                    <span className="text-sm font-semibold text-amber-400">{formatAmount(ref.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-gray-500 truncate">{ref.reason}</p>
                    <span className="text-[10px] text-gray-600">{formatDate(ref.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Activity Logs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiClock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Activity Logs</h3>
            </div>
            <span className="text-xs text-gray-500">Live</span>
          </div>
          {activityLogs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No activity recorded yet</p>
          ) : (
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto custom-scrollbar">
              {activityLogs.slice(0, 8).map((log: any) => {
                const isCredit = log.action?.includes('CREDIT');
                const isDebit = log.action?.includes('DEBIT');
                const isFreeze = log.action?.includes('FROZEN') || log.action?.includes('FREEZE');
                const isAdmin = log.action?.includes('ADMIN');
                const actionColor = isCredit ? 'text-green-400' : isDebit ? 'text-red-400' : isFreeze ? 'text-amber-400' : isAdmin ? 'text-purple-400' : 'text-gray-400';
                const actionBg = isCredit ? 'bg-green-500/10' : isDebit ? 'bg-red-500/10' : isFreeze ? 'bg-amber-500/10' : isAdmin ? 'bg-purple-500/10' : 'bg-white/5';

                return (
                  <div key={log.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${actionColor.replace('text-', 'bg-')}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${actionBg} ${actionColor}`}>
                          {log.action}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {log.user?.firstName} {log.user?.lastName}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-600 shrink-0">{formatDate(log.createdAt)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* System status bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-4 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>API: Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Database: Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Socket.io: Active</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-500">
            Cards: <span className="text-white font-medium">{cardAnalytics?.totalCards || 0}</span> total
            (<span className="text-green-400">{cardAnalytics?.activeCards || 0}</span> active,
            <span className="text-amber-400"> {cardAnalytics?.frozenCards || 0}</span> frozen,
            <span className="text-red-400"> {cardAnalytics?.cancelledCards || 0}</span> cancelled)
          </span>
          <span className="text-gray-500">
            Refunds: <span className="text-white font-medium">{analytics?.totalRefunds || 0}</span> total,
            <span className="text-amber-400"> {analytics?.pendingRefunds || 0}</span> pending
          </span>
        </div>
      </motion.div>
    </div>
  );
}
