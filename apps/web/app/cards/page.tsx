'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCreditCard, FiPlus, FiLock, FiUnlock, FiCopy, FiTrash2, FiShield, FiEye, FiEyeOff, FiEdit3, FiBarChart2, FiDollarSign, FiCalendar, FiUser, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const cardThemes: Record<string, { gradient: string; chip: string; glow: string }> = {
  blue:   { gradient: 'from-blue-600 via-blue-500 to-cyan-400',   chip: 'bg-yellow-400/30', glow: 'shadow-blue-500/20' },
  purple: { gradient: 'from-purple-600 via-purple-500 to-pink-400', chip: 'bg-yellow-400/30', glow: 'shadow-purple-500/20' },
  gold:   { gradient: 'from-yellow-600 via-amber-500 to-yellow-400', chip: 'bg-black/30',     glow: 'shadow-amber-500/20' },
  black:  { gradient: 'from-gray-900 via-gray-800 to-gray-700',    chip: 'bg-yellow-400/30', glow: 'shadow-gray-800/20' },
  red:    { gradient: 'from-red-600 via-rose-500 to-orange-400',   chip: 'bg-yellow-400/30', glow: 'shadow-red-500/20' },
};

const cardTypeLabels: Record<string, string> = {
  VISA: 'VISA',
  MASTERCARD: 'MASTERCARD',
  PREMIUM: 'BLACK',
};

export default function CardsPage() {
  const queryClient = useQueryClient();
  const [showGenerator, setShowGenerator] = useState(false);
  const [cardType, setCardType] = useState('VISA');
  const [colorTheme, setColorTheme] = useState('blue');
  const [spendingLimit, setSpendingLimit] = useState(10000);
  const [initialBalance, setInitialBalance] = useState(0);

  // Expanded card state
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [showFullNumber, setShowFullNumber] = useState<Record<string, boolean>>({});
  const [showCvv, setShowCvv] = useState<Record<string, boolean>>({});

  // Rename state
  const [renamingCardId, setRenamingCardId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Analytics modal
  const [analyticsCardId, setAnalyticsCardId] = useState<string | null>(null);

  const { data: cards, isLoading } = useQuery({
    queryKey: ['cards'],
    queryFn: async () => {
      const { data } = await api.get('/api/cards');
      return data.data;
    },
  });

  const createCard = useMutation({
    mutationFn: async (cardData: any) => {
      const { data } = await api.post('/api/cards', cardData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setShowGenerator(false);
      toast.success('Virtual card created!', { icon: '💳' });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to create card'),
  });

  const freezeCard = useMutation({
    mutationFn: async (cardId: string) => {
      const { data } = await api.patch(`/api/cards/${cardId}/freeze`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast.success(data.message || 'Card status updated');
    },
  });

  const renameCard = useMutation({
    mutationFn: async ({ cardId, label }: { cardId: string; label: string }) => {
      const { data } = await api.patch(`/api/cards/${cardId}/rename`, { label });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setRenamingCardId(null);
      toast.success('Card renamed!');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to rename'),
  });

  const changeColorTheme = useMutation({
    mutationFn: async ({ cardId, colorTheme }: { cardId: string; colorTheme: string }) => {
      const { data } = await api.patch(`/api/cards/${cardId}/color-theme`, { colorTheme });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      toast.success('Card theme updated!');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update theme'),
  });

  const cancelCard = useMutation({
    mutationFn: async (cardId: string) => {
      const { data } = await api.delete(`/api/cards/${cardId}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setExpandedCardId(null);
      toast.success('Card cancelled');
    },
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['card-analytics', analyticsCardId],
    queryFn: async () => {
      if (!analyticsCardId) return null;
      const { data } = await api.get(`/api/cards/${analyticsCardId}/analytics`);
      return data.data;
    },
    enabled: !!analyticsCardId,
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const toggleFullNumber = (cardId: string) => {
    setShowFullNumber(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const toggleCvv = (cardId: string) => {
    setShowCvv(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const startRename = (cardId: string, currentLabel: string) => {
    setRenamingCardId(cardId);
    setRenameValue(currentLabel || '');
    setTimeout(() => renameInputRef.current?.focus(), 100);
  };

  const submitRename = (cardId: string) => {
    if (renameValue.trim().length > 0) {
      renameCard.mutate({ cardId, label: renameValue.trim() });
    }
  };

  const formatCardNumber = (number: string) => {
    // Format as groups of 4 with spaces
    const cleaned = number.replace(/\s/g, '');
    return cleaned.match(/.{1,4}/g)?.join(' ') || number;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Virtual Cards</h1>
          <p className="text-gray-400 mt-1">Create and manage virtual payment cards</p>
        </div>
        <button
          onClick={() => setShowGenerator(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> Create New Card
        </button>
      </div>

      {/* Disclaimer */}
      <div className="glass-card p-4 border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-start gap-3">
          <FiShield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-300">For demonstration purposes only</p>
            <p className="text-sm text-yellow-300/70">Not real financial cards. These virtual cards are simulated and cannot be used for actual payments.</p>
          </div>
        </div>
      </div>

      {/* Card Generator Modal */}
      <AnimatePresence>
        {showGenerator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowGenerator(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-md p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Create Virtual Card</h3>
                <button onClick={() => setShowGenerator(false)} className="text-gray-400 hover:text-white transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Card Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Card Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: 'VISA', icon: 'VISA', desc: 'Visa' },
                      { type: 'MASTERCARD', icon: 'MC', desc: 'Mastercard' },
                      { type: 'PREMIUM', icon: 'BLK', desc: 'Premium Black' },
                    ].map(({ type, icon, desc }) => (
                      <button
                        key={type}
                        onClick={() => setCardType(type)}
                        className={`p-4 rounded-xl text-center transition-all duration-200 ${
                          cardType === type
                            ? 'bg-bank-blue/20 border-2 border-bank-blue shadow-lg shadow-bank-blue/10'
                            : 'bg-white/5 border-2 border-transparent hover:border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span className={`text-lg font-bold block mb-1 ${cardType === type ? 'text-bank-blue' : 'text-gray-400'}`}>
                          {icon}
                        </span>
                        <span className={`text-xs font-medium ${cardType === type ? 'text-white' : 'text-gray-500'}`}>
                          {desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Color Theme</label>
                  <div className="flex gap-3">
                    {Object.entries(cardThemes).map(([name, { gradient }]) => (
                      <button
                        key={name}
                        onClick={() => setColorTheme(name)}
                        title={name.charAt(0).toUpperCase() + name.slice(1)}
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} transition-all duration-200 ${
                          colorTheme === name ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a2540] scale-110' : 'hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Spending Limit */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Spending Limit ($)</label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      type="number"
                      value={spendingLimit}
                      onChange={(e) => setSpendingLimit(Number(e.target.value))}
                      className="input-field pl-10"
                      placeholder="10,000"
                      min={0}
                    />
                  </div>
                </div>

                {/* Initial Balance */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Initial Card Balance ($)</label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      type="number"
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(Number(e.target.value))}
                      className="input-field pl-10"
                      placeholder="0"
                      min={0}
                    />
                  </div>
                </div>

                {/* Live Preview */}
                <div className={`rounded-2xl bg-gradient-to-br ${cardThemes[colorTheme].gradient} p-5 text-white shadow-xl ${cardThemes[colorTheme].glow}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] opacity-70 uppercase tracking-wider">{cardType === 'PREMIUM' ? 'PLATINUM' : 'CARD'}</p>
                      <p className="text-base font-bold tracking-wider">{cardTypeLabels[cardType]}</p>
                    </div>
                    <div className={`w-9 h-7 rounded ${cardThemes[colorTheme].chip}`} />
                  </div>
                  <p className="font-mono text-sm tracking-[0.3em] mb-5">•••• •••• •••• 0000</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[9px] opacity-60 uppercase tracking-wider">Card Holder</p>
                      <p className="text-xs font-medium">YOUR NAME</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] opacity-60 uppercase tracking-wider">Expires</p>
                      <p className="text-xs font-medium">MM/YY</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowGenerator(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button
                    onClick={() => createCard.mutate({ cardType, colorTheme, spendingLimit, initialBalance })}
                    disabled={createCard.isPending}
                    className="btn-primary flex-1"
                  >
                    {createCard.isPending ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        Creating...
                      </span>
                    ) : (
                      'Generate Card'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnimatePresence>
        {analyticsCardId && analyticsData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setAnalyticsCardId(null); }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card w-full max-w-md p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Card Analytics</h3>
                <button onClick={() => setAnalyticsCardId(null)} className="text-gray-400 hover:text-white transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Total Spent</p>
                    <p className="text-xl font-bold text-white">${analyticsData.totalSpent.toLocaleString()}</p>
                  </div>
                  <div className="glass-card p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Remaining</p>
                    <p className="text-xl font-bold text-emerald-400">${analyticsData.remainingLimit.toLocaleString()}</p>
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Usage</span>
                    <span className="text-white font-medium">{analyticsData.usagePercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(analyticsData.usagePercent, 100)}%` }}
                      className={`h-full rounded-full transition-all duration-1000 ${
                        analyticsData.usagePercent > 80 ? 'bg-red-500' : analyticsData.usagePercent > 50 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Spending Limit</span>
                  <span className="text-white">${analyticsData.spendingLimit.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card h-72 animate-pulse">
              <div className="h-48 bg-white/5 rounded-2xl mb-3" />
              <div className="h-16 bg-white/5 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards?.map((card: any, i: number) => {
            const isExpanded = expandedCardId === card.id;
            const theme = cardThemes[card.colorTheme] || cardThemes.blue;
            const isRenaming = renamingCardId === card.id;

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                layout
                className="relative"
              >
                {/* Card Visual */}
                <motion.div
                  className={`relative h-56 rounded-2xl bg-gradient-to-br ${theme.gradient} p-6 text-white shadow-2xl cursor-pointer overflow-hidden ${card.status === 'FROZEN' ? 'opacity-60 grayscale-[30%]' : ''}`}
                  whileHover={{ scale: 1.02, rotateY: -3 }}
                  style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                  onClick={() => setExpandedCardId(isExpanded ? null : card.id)}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxNSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-20" />
                  {/* Frost overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />

                  <div className="relative z-10 flex flex-col h-full">
                    {/* Top */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] opacity-70 uppercase tracking-wider">
                          {card.cardType === 'PREMIUM' ? 'PLATINUM' : 'VIRTUAL CARD'}
                        </p>
                        <p className="text-xl font-bold tracking-wider mt-0.5">{cardTypeLabels[card.cardType]}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {card.cardLabel && (
                          <span className="text-[10px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                            {card.cardLabel}
                          </span>
                        )}
                        <div className={`w-10 h-8 rounded ${theme.chip}`} />
                      </div>
                    </div>

                    {/* Middle - Card Number */}
                    <div className="mt-auto mb-3">
                      <p className="font-mono text-lg tracking-[0.25em]">
                        {showFullNumber[card.id]
                          ? formatCardNumber(card.cardNumber)
                          : `•••• •••• •••• ${card.cardNumber?.slice(-4)}`}
                      </p>
                    </div>

                    {/* Bottom */}
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[9px] opacity-60 uppercase tracking-wider">Card Holder</p>
                        <p className="text-sm font-medium uppercase tracking-wide">{card.cardholderName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] opacity-60 uppercase tracking-wider">Expires</p>
                        <p className="text-sm font-medium">{card.expiryDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {card.status === 'FROZEN' && (
                    <div className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md rotate-12 z-20">
                      FROZEN
                    </div>
                  )}
                </motion.div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 glass-card p-5 space-y-4 overflow-hidden"
                    >
                      {/* Quick Stats Row */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-white/5 rounded-xl">
                          <FiDollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                          <p className="text-[10px] text-gray-400">Balance</p>
                          <p className="text-sm font-bold text-white">${card.balance?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-xl">
                          <FiCalendar className="w-4 h-4 text-bank-blue mx-auto mb-1" />
                          <p className="text-[10px] text-gray-400">Expiry</p>
                          <p className="text-sm font-bold text-white">{card.expiryDate}</p>
                        </div>
                        <div className="text-center p-3 bg-white/5 rounded-xl">
                          <FiBarChart2 className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                          <p className="text-[10px] text-gray-400">Limit</p>
                          <p className="text-sm font-bold text-white">${card.spendingLimit?.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* CVV Row */}
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FiShield className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">CVV</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-white">
                            {showCvv[card.id] ? card.cvv : '•••'}
                          </span>
                          <button
                            onClick={() => toggleCvv(card.id)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            {showCvv[card.id] ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Card Number Row */}
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FiCreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">Number</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-white">
                            {showFullNumber[card.id] ? formatCardNumber(card.cardNumber) : `•••• ${card.cardNumber?.slice(-4)}`}
                          </span>
                          <button
                            onClick={() => toggleFullNumber(card.id)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            {showFullNumber[card.id] ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Rename Row */}
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FiEdit3 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">Label</span>
                        </div>
                        {isRenaming ? (
                          <div className="flex items-center gap-2">
                            <input
                              ref={renameInputRef}
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') submitRename(card.id);
                                if (e.key === 'Escape') setRenamingCardId(null);
                              }}
                              className="w-32 px-2 py-1 text-sm bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:border-bank-blue"
                              placeholder="Card label"
                              maxLength={50}
                            />
                            <button onClick={() => submitRename(card.id)} className="text-emerald-400 hover:text-emerald-300">
                              <FiCheck className="w-4 h-4" />
                            </button>
                            <button onClick={() => setRenamingCardId(null)} className="text-gray-400 hover:text-white">
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startRename(card.id, card.cardLabel)}
                            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                          >
                            {card.cardLabel || 'Set label'}
                            <FiEdit3 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Status & Type */}
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <span className="text-sm text-gray-400">Status</span>
                        <span className={`badge text-xs ${
                          card.status === 'ACTIVE' ? 'badge-success' :
                          card.status === 'FROZEN' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {card.status}
                        </span>
                      </div>

                      {/* Color Theme Selector */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Color Theme</p>
                        <div className="flex gap-2">
                          {Object.entries(cardThemes).map(([name, { gradient }]) => (
                            <button
                              key={name}
                              onClick={() => changeColorTheme.mutate({ cardId: card.id, colorTheme: name })}
                              disabled={card.colorTheme === name}
                              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} transition-all ${
                                card.colorTheme === name ? 'ring-2 ring-white scale-110' : 'hover:scale-105 opacity-60 hover:opacity-100'
                              }`}
                              title={name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => freezeCard.mutate(card.id)}
                          className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg text-xs font-medium transition-all ${
                            card.status === 'FROZEN'
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                          }`}
                        >
                          {card.status === 'FROZEN' ? <FiUnlock className="w-3.5 h-3.5" /> : <FiLock className="w-3.5 h-3.5" />}
                          {card.status === 'FROZEN' ? 'Unfreeze' : 'Freeze'}
                        </button>
                        <button
                          onClick={() => copyToClipboard(card.cardNumber, 'Card number')}
                          className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-white text-xs font-medium transition-all hover:bg-white/10"
                        >
                          <FiCopy className="w-3.5 h-3.5" /> Copy Number
                        </button>
                        <button
                          onClick={() => {
                            copyToClipboard(`Card: ${formatCardNumber(card.cardNumber)}\nCVV: ${card.cvv}\nExpiry: ${card.expiryDate}\nHolder: ${card.cardholderName}`, 'Card details');
                          }}
                          className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-white text-xs font-medium transition-all hover:bg-white/10"
                          title="Copy all details"
                        >
                          <FiCopy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setAnalyticsCardId(card.id)}
                          className="flex items-center justify-center p-2.5 rounded-lg bg-bank-blue/10 text-bank-blue hover:bg-bank-blue/20 transition-all"
                          title="View analytics"
                        >
                          <FiBarChart2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this card?')) {
                              cancelCard.mutate(card.id);
                            }
                          }}
                          className="flex items-center justify-center p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                          title="Cancel card"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Empty State */}
          {(!cards || cards.length === 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-2 text-center py-16"
            >
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <FiCreditCard className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Virtual Cards Yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Create your first virtual card to get started. Choose from Visa, Mastercard, or Premium Black.
              </p>
              <button onClick={() => setShowGenerator(true)} className="btn-primary">
                <FiPlus className="w-4 h-4" /> Create Your First Card
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
