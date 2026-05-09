'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiArrowRight, FiCheck, FiX, FiDollarSign, FiUser, FiFileText, FiPlus } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const transferTypes = [
  { id: 'INTERNAL', label: 'Internal Transfer', description: 'Send to another SecureRefund user' },
  { id: 'BANK', label: 'Bank Transfer', description: 'ACH/Wire transfer' },
  { id: 'SWIFT', label: 'SWIFT Transfer', description: 'International wire' },
  { id: 'CRYPTO', label: 'Crypto Transfer', description: 'Blockchain transfer' },
  { id: 'MOBILE', label: 'Mobile Money', description: 'Phone number transfer' },
];

export default function TransferPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [transferType, setTransferType] = useState('INTERNAL');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  const transferMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: res } = await api.post('/api/transactions/transfer', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setShowConfirm(false);
      setShowSuccess(true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Transfer failed');
      setShowConfirm(false);
    },
  });

  const depositMutation = useMutation({
    mutationFn: async (amt: number) => {
      const { data } = await api.post('/api/transactions/deposit', { amount: amt });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Deposit successful!');
      setShowDeposit(false);
      setDepositAmount('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Deposit failed');
    },
  });

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > 1000000) return toast.error('Maximum deposit is $1,000,000');
    depositMutation.mutate(amt);
  };

  const handleSubmit = () => {
    if (!receiverEmail || !amount) return toast.error('Fill all fields');
    setShowConfirm(true);
  };

  const confirmTransfer = () => {
    transferMutation.mutate({
      receiverEmail,
      amount: parseFloat(amount),
      currency: 'USD',
      type: transferType,
      description: description || undefined,
    });
  };

  const reset = () => {
    setStep(1);
    setReceiverEmail('');
    setAmount('');
    setDescription('');
    setShowConfirm(false);
    setShowSuccess(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Send Money</h1>
        <p className="text-gray-400 mt-1">Transfer funds instantly</p>
      </div>

      {!showSuccess ? (
        <>
          {/* Transfer Type */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Transfer Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {transferTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTransferType(t.id)}
                  className={`p-3 rounded-xl text-center text-xs transition-all ${
                    transferType === t.id
                      ? 'bg-bank-blue/20 border border-bank-blue/30 text-bank-blue'
                      : 'bg-white/5 border border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <p className="font-semibold">{t.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="glass-card p-6">
            <label className="text-sm font-semibold text-gray-300 block mb-4">Amount</label>
            <div className="relative">
              <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field pl-12 text-3xl font-bold py-6"
                placeholder="0.00"
                min="1"
                step="0.01"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Available: ${user?.account?.balance?.toLocaleString() || '0.00'}</p>
          </div>

          {/* Recipient */}
          <div className="glass-card p-6">
            <label className="text-sm font-semibold text-gray-300 block mb-4">Recipient</label>
            <div className="relative mb-4">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
                className="input-field pl-12"
                placeholder="Recipient email address"
              />
            </div>
            <div className="relative">
              <FiFileText className="absolute left-4 top-4 text-gray-500" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field pl-12 resize-none"
                placeholder="Description (optional)"
                rows={2}
              />
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeposit(true)}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <FiPlus className="w-4 h-4" /> Quick Deposit
            </button>
            <button onClick={handleSubmit} className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={!amount || !receiverEmail}>
              <FiSend /> Continue
            </button>
          </div>
        </>
      ) : (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <FiCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Transfer Complete!</h2>
          <p className="text-gray-400 mb-6">Your transfer of ${parseFloat(amount || '0').toFixed(2)} has been processed</p>
          <button onClick={reset} className="btn-primary">New Transfer</button>
        </motion.div>
      )}

      {/* Deposit Modal */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card w-full max-w-md p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Quick Deposit</h3>
                <button onClick={() => { setShowDeposit(false); setDepositAmount(''); }} className="text-gray-400 hover:text-white">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Deposit Amount (USD)</label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="input-field pl-12 text-2xl font-bold py-4"
                      placeholder="0.00"
                      min="1"
                      max="1000000"
                      step="0.01"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleDeposit()}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Current balance: ${user?.account?.balance?.toLocaleString() || '0.00'}</p>
                </div>
                <button
                  onClick={handleDeposit}
                  disabled={depositMutation.isPending || !depositAmount || parseFloat(depositAmount) <= 0}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {depositMutation.isPending ? 'Processing...' : <><FiPlus className="w-4 h-4" /> Deposit Funds</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-card w-full max-w-md p-8">
              <h3 className="text-lg font-bold text-white mb-6">Confirm Transfer</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Type</span><span className="text-white font-medium">{transferType}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Recipient</span><span className="text-white font-medium">{receiverEmail}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Amount</span><span className="text-white font-bold text-lg">${parseFloat(amount || '0').toFixed(2)}</span></div>
                {description && <div className="flex justify-between text-sm"><span className="text-gray-400">Note</span><span className="text-white">{description}</span></div>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1 flex items-center justify-center gap-2"><FiX /> Cancel</button>
                <button onClick={confirmTransfer} disabled={transferMutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {transferMutation.isPending ? 'Processing...' : <><FiCheck /> Confirm</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
