'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiCreditCard, FiSend, FiGlobe, FiArrowRight, FiInfo } from 'react-icons/fi';

export default function CalculatorPage() {
  const [transferAmount, setTransferAmount] = useState(1000);
  const [cardCount, setCardCount] = useState(3);
  const [transferType, setTransferType] = useState('ACH');
  const [currencyPair, setCurrencyPair] = useState('USD-EUR');

  const transferFees: Record<string, { fee: number; pct: number }> = {
    INTERNAL: { fee: 0, pct: 0 },
    ACH: { fee: 1.50, pct: 0 },
    SWIFT: { fee: 25, pct: 0.001 },
    WIRE: { fee: 15, pct: 0 },
    CRYPTO: { fee: 0, pct: 0.005 },
  };

  const fxRates: Record<string, number> = {
    'USD-EUR': 0.92,
    'USD-GBP': 0.79,
    'USD-JPY': 150.5,
    'USD-CAD': 1.36,
    'USD-AUD': 1.53,
    'USD-CHF': 0.89,
  };

  const txFee = transferFees[transferType];
  const transferFeeTotal = txFee.fee + (transferAmount * txFee.pct);
  const fxRate = fxRates[currencyPair] || 1;
  const convertedAmount = (transferAmount - transferFeeTotal) * fxRate;
  const monthlyCardCost = cardCount > 10 ? (cardCount - 10) * 0.50 : 0;
  const planCost = cardCount <= 1 ? 0 : cardCount <= 10 ? 9.99 : 29.99;
  const totalMonthly = planCost + monthlyCardCost + (transferAmount >= 10000 ? transferAmount * 0.001 : 0);

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-blue-950 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-2xl mx-auto">
            <span className="text-bank-accent text-sm font-semibold tracking-widest uppercase">Calculator</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold mt-4 leading-tight">Estimate Your Banking Costs</h1>
            <p className="text-lg text-gray-400 mt-4">Use our interactive calculator to estimate fees, exchange rates, and monthly costs.</p>
          </motion.div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card p-8 space-y-6">
            <h2 className="text-xl font-bold text-white mb-2">Configure Your Usage</h2>

            {/* Transfer Amount */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-400 mb-2">
                <span className="flex items-center gap-2"><FiSend className="w-4 h-4" /> Monthly Transfer Volume</span>
                <span className="text-bank-blue font-bold">${transferAmount.toLocaleString()}</span>
              </label>
              <input type="range" min={0} max={100000} step={500} value={transferAmount} onChange={(e) => setTransferAmount(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-bank-blue" />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>$0</span><span>$25K</span><span>$50K</span><span>$75K</span><span>$100K</span>
              </div>
            </div>

            {/* Transfer Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                <FiSend className="w-4 h-4" /> Transfer Method
              </label>
              <select value={transferType} onChange={(e) => setTransferType(e.target.value)} className="input-field text-white bg-navy-900 w-full">
                {Object.keys(transferFees).map(t => <option key={t} value={t}>{t} Transfer</option>)}
              </select>
            </div>

            {/* Card Count */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-400 mb-2">
                <span className="flex items-center gap-2"><FiCreditCard className="w-4 h-4" /> Virtual Cards</span>
                <span className="text-bank-blue font-bold">{cardCount}</span>
              </label>
              <input type="range" min={1} max={50} step={1} value={cardCount} onChange={(e) => setCardCount(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-bank-blue" />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>1</span><span>10</span><span>25</span><span>35</span><span>50</span>
              </div>
            </div>

            {/* Currency Pair */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                <FiGlobe className="w-4 h-4" /> Currency Pair (FX Rate)
              </label>
              <select value={currencyPair} onChange={(e) => setCurrencyPair(e.target.value)} className="input-field text-white bg-navy-900 w-full">
                {Object.entries(fxRates).map(([pair, rate]) => <option key={pair} value={pair}>{pair.replace('-', ' → ')} (1 USD = {rate})</option>)}
              </select>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card p-8 space-y-5">
            <h2 className="text-xl font-bold text-white mb-2">Estimated Costs</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-sm text-gray-400">Transfer Fee</span>
                <span className="text-lg font-bold text-white">${transferFeeTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-sm text-gray-400">FX Rate</span>
                <span className="text-lg font-bold text-bank-accent">1 USD = {fxRate}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-sm text-gray-400">You Receive</span>
                <span className="text-xl font-extrabold text-white">{currencyPair.split('-')[1]} {convertedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-sm text-gray-400">Plan Cost (monthly)</span>
                <span className="text-lg font-bold text-white">${planCost.toFixed(2)}</span>
              </div>
              {monthlyCardCost > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-sm text-gray-400">Extra Cards ({cardCount - 10} × $0.50)</span>
                  <span className="text-lg font-bold text-white">${monthlyCardCost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 bg-bank-blue/5 rounded-xl px-4 -mx-2">
                <span className="text-sm font-semibold text-white">Estimated Monthly Total</span>
                <span className="text-2xl font-extrabold text-bank-blue">${totalMonthly.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-start gap-2 text-xs text-gray-500 bg-white/5 rounded-lg p-3">
                <FiInfo className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Estimates only. Actual fees may vary based on transaction volume, currency fluctuations, and regulatory requirements. Enterprise customers qualify for volume discounts.</span>
              </div>
            </div>

            <a href="/request-quote" className="btn-primary w-full flex items-center justify-center gap-2 mt-4">
              Request Enterprise Quote <FiArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
