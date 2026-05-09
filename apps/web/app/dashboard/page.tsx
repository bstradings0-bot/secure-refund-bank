'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown, FiCreditCard, FiSend, FiPlus, FiDownload, FiDollarSign, FiTrendingUp, FiPieChart } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const quickActions = [
  { label: 'Send Money', icon: FiSend, href: '/transfer', color: 'from-blue-500 to-cyan-400' },
  { label: 'New Card', icon: FiCreditCard, href: '/cards', color: 'from-purple-500 to-pink-400' },
  { label: 'Deposit', icon: FiPlus, href: '/transfer', color: 'from-emerald-500 to-teal-400' },
  { label: 'Withdraw', icon: FiDownload, href: '/transfer', color: 'from-orange-500 to-yellow-400' },
];

const mockChartData = [
  { day: 'Mon', spending: 240, income: 400 },
  { day: 'Tue', spending: 139, income: 300 },
  { day: 'Wed', spending: 980, income: 200 },
  { day: 'Thu', spending: 390, income: 800 },
  { day: 'Fri', spending: 480, income: 400 },
  { day: 'Sat', spending: 380, income: 300 },
  { day: 'Sun', spending: 430, income: 500 },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/api/account/dashboard');
      return data.data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const account = dashboard?.account;
  const transactions = dashboard?.recentTransactions || [];
  const cards = dashboard?.cards || [];
  const totalBalance = (account?.balance || 0) + (account?.savingsBalance || 0);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-gray-400 mt-1">Here&apos;s your financial overview</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-bank-blue/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <p className="text-sm text-gray-400 mb-2">Total Balance</p>
          <p className="text-3xl font-bold text-white">${totalBalance.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-400 text-sm">
            <FiTrendingUp className="w-4 h-4" /> <span>+12.5%</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-bank-blue/10 flex items-center justify-center">
              <FiDollarSign className="w-4 h-4 text-bank-blue" />
            </div>
            <p className="text-sm text-gray-400">Main Balance</p>
          </div>
          <p className="text-2xl font-bold text-white">${(account?.balance || 0).toLocaleString()}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FiPieChart className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm text-gray-400">Savings</p>
          </div>
          <p className="text-2xl font-bold text-white">${(account?.savingsBalance || 0).toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div key={action.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                <Link href={action.href} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-300 font-medium">{action.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Spending Analytics</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0066ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#0a2540', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="spending" stroke="#0066ff" fill="url(#colorSpending)" strokeWidth={2} />
              <Area type="monotone" dataKey="income" stroke="#00d4aa" fill="url(#colorIncome)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-3">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-bank-blue" /><span className="text-xs text-gray-400">Spending</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-bank-accent" /><span className="text-xs text-gray-400">Income</span></div>
          </div>
        </div>

        {/* Cards Preview */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-300">Active Cards</h3>
            <Link href="/cards" className="text-xs text-bank-blue hover:text-bank-light">View all</Link>
          </div>
          <div className="space-y-3">
            {cards.slice(0, 2).map((card: any) => (
              <div key={card.id} className="p-4 rounded-xl bg-gradient-to-br from-navy-800 to-navy-900 border border-white/5 hover:border-bank-blue/20 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">{card.cardType}</span>
                  <span className={`badge ${card.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{card.status}</span>
                </div>
                <p className="text-sm font-mono text-gray-300 mb-2">**** {card.cardNumber?.slice(-4)}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{card.cardholderName}</span>
                  <span>{card.expiryDate}</span>
                </div>
              </div>
            ))}
            {cards.length === 0 && <p className="text-gray-500 text-sm text-center py-6">No cards yet</p>}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300">Recent Transactions</h3>
          <Link href="/transactions" className="text-xs text-bank-blue hover:text-bank-light">View all</Link>
        </div>
        <div className="space-y-2">
          {transactions.slice(0, 6).map((tx: any) => {
            const isOutgoing = tx.senderId === user?.id;
            return (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOutgoing ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                    {isOutgoing ? <FiArrowUp className="w-4 h-4 text-red-400" /> : <FiArrowDown className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{isOutgoing ? tx.receiver.firstName : tx.sender.firstName} {isOutgoing ? tx.receiver.lastName : tx.sender.lastName}</p>
                    <p className="text-xs text-gray-500">{tx.type} - {new Date(tx.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${isOutgoing ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isOutgoing ? '-' : '+'}${tx.amount.toFixed(2)}
                  </p>
                  <span className="badge badge-success text-[10px]">{tx.status}</span>
                </div>
              </div>
            );
          })}
          {transactions.length === 0 && <p className="text-gray-500 text-sm text-center py-6">No transactions yet</p>}
        </div>
      </div>
    </div>
  );
}
