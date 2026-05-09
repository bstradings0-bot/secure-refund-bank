'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGlobe, FiDollarSign, FiTrendingUp, FiTrendingDown,
  FiRefreshCw, FiArrowRight, FiZap
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

// Live-ish exchange rates (EUR, GBP, JPY, CAD, AUD, CHF)
const exchangeRates = {
  USD: { symbol: '$', rate: 1, flag: '🇺🇸', name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.92, flag: '🇪🇺', name: 'Euro' },
  GBP: { symbol: '£', rate: 0.79, flag: '🇬🇧', name: 'British Pound' },
  JPY: { symbol: '¥', rate: 151.2, flag: '🇯🇵', name: 'Japanese Yen' },
  CAD: { symbol: 'C$', rate: 1.36, flag: '🇨🇦', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', rate: 1.53, flag: '🇦🇺', name: 'Australian Dollar' },
  CHF: { symbol: 'Fr', rate: 0.89, flag: '🇨🇭', name: 'Swiss Franc' },
};

export default function CurrenciesPage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('100');

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => { const { data } = await api.get('/api/account/dashboard'); return data.data; },
  });

  const handleRefresh = () => {
    toast.success('Exchange rates refreshed');
  };

  return (
    <div className="min-h-screen bg-navy-950 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <FiGlobe className="w-5 h-5 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Multi-Currency</h1>
            </div>
            <button onClick={handleRefresh} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white transition-colors">
              <FiRefreshCw className="w-4 h-4" /> Refresh Rates
            </button>
          </div>
          <p className="text-gray-400 ml-13 mb-8">View real-time exchange rates and manage multi-currency balances.</p>
        </motion.div>

        {/* Balance Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(exchangeRates).slice(0, 3).map(([code, info], i) => (
            <motion.div
              key={code}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-card p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{info.flag}</span>
                <span className="badge badge-success text-[10px]">Active</span>
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{code} — {info.name}</p>
              <p className="text-3xl font-bold text-white mt-2">
                {info.symbol}{code === 'USD' ? (dashboard?.account?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Available Balance</p>
            </motion.div>
          ))}
        </div>

        {/* Converter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Currency Converter</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs text-gray-500 mb-1.5">Amount (USD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-semibold focus:border-bank-blue/50 focus:outline-none"
                min="0" step="0.01"
              />
            </div>
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-bank-blue/10 flex items-center justify-center">
                <FiArrowRight className="w-5 h-5 text-bank-blue" />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
            {Object.entries(exchangeRates).filter(([code]) => code !== 'USD').map(([code, info]) => {
              const converted = (parseFloat(amount) || 0) * info.rate;
              return (
                <div key={code} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{info.flag}</span>
                    <span className="text-xs text-gray-500">{code}</span>
                  </div>
                  <p className="text-lg font-bold text-white">{info.symbol}{converted.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">1 USD = {info.rate} {code}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Exchange Rate Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Exchange Rates</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Currency</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Symbol</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">Rate (per 1 USD)</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(exchangeRates).map(([code, info]) => (
                  <tr key={code} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{info.flag}</span>
                        <span className="text-white font-medium">{code}</span>
                        <span className="text-gray-500 text-xs">{info.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{info.symbol}</td>
                    <td className="py-3 px-4 text-right text-white font-mono">{info.rate.toFixed(4)}</td>
                    <td className="py-3 px-4 text-right">
                      {code === 'USD' ? (
                        <span className="text-gray-500">—</span>
                      ) : (
                        <span className="text-emerald-400 flex items-center justify-end gap-1">
                          <FiTrendingUp className="w-3 h-3" /> +0.00%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* API Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mt-8 p-5 rounded-xl bg-bank-blue/5 border border-bank-blue/10 flex items-start gap-3"
        >
          <FiZap className="w-5 h-5 text-bank-blue flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-bank-light font-medium">Live Exchange Rates</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Exchange rates shown are for demonstration purposes. In production, real-time rates would be fetched from providers like Wise, Stripe, or Open Exchange Rates API. Multi-currency wallet support is available for registered users.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
