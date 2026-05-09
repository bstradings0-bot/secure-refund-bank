'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiRefreshCw, FiCheck, FiX, FiClock, FiAlertCircle,
  FiFileText, FiDollarSign, FiInbox, FiSend, FiChevronDown
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  PENDING: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: FiClock, label: 'Pending Review' },
  APPROVED: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: FiCheck, label: 'Approved' },
  REJECTED: { color: 'text-red-400', bg: 'bg-red-500/10', icon: FiX, label: 'Rejected' },
  PROCESSING: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: FiRefreshCw, label: 'Processing' },
  COMPLETED: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: FiCheck, label: 'Completed' },
};

export default function RefundsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [reason, setReason] = useState('');
  const [page, setPage] = useState(1);

  const { data: refundsData, isLoading } = useQuery({
    queryKey: ['refunds', page],
    queryFn: async () => {
      const { data } = await api.get(`/api/refunds?page=${page}&limit=10`);
      return data;
    },
    enabled: !!user,
  });

  const { data: txData } = useQuery({
    queryKey: ['transactions', 'refundable'],
    queryFn: async () => {
      const { data } = await api.get('/api/transactions?page=1&limit=50');
      return data;
    },
    enabled: !!user && showForm,
  });

  const submitRefund = useMutation({
    mutationFn: async (payload: { transactionId: string; reason: string }) => {
      const { data } = await api.post('/api/refunds', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      toast.success('Refund request submitted successfully!');
      setShowForm(false);
      setTransactionId('');
      setReason('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit refund');
    },
  });

  const refunds = refundsData?.refunds || refundsData?.data || [];
  const totalPages = refundsData?.totalPages || 1;
  const transactions = txData?.transactions || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId) return toast.error('Please select a transaction');
    if (reason.length < 10) return toast.error('Reason must be at least 10 characters');
    submitRefund.mutate({ transactionId, reason });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Refund Center</h1>
          <p className="text-gray-400 mt-1">Submit and track refund requests</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <FiSend className="w-4 h-4" />
          {showForm ? 'Cancel' : 'New Refund Request'}
        </button>
      </div>

      {/* Refund Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
              <h3 className="text-lg font-semibold text-white">Submit Refund Request</h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Transaction</label>
                <div className="relative">
                  <select
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="input-field w-full appearance-none cursor-pointer"
                    required
                  >
                    <option value="">-- Choose a received transaction --</option>
                    {transactions
                      .filter((tx: any) => tx.receiverId === user?.id)
                      .map((tx: any) => (
                        <option key={tx.id} value={tx.id}>
                          {tx.referenceNumber} — ${tx.amount.toFixed(2)} from {tx.sender?.firstName || 'Unknown'} ({new Date(tx.timestamp || tx.createdAt).toLocaleDateString()})
                        </option>
                      ))}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
                {transactions.filter((tx: any) => tx.receiverId === user?.id).length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No received transactions available for refund.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Reason for Refund</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input-field w-full resize-none"
                  rows={4}
                  placeholder="Explain why you're requesting this refund (min. 10 characters)..."
                  minLength={10}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{reason.length}/10 minimum characters</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitRefund.isPending || !transactionId || reason.length < 10}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitRefund.isPending ? 'Submitting...' : <><FiSend className="w-4 h-4" /> Submit Request</>}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setTransactionId(''); setReason(''); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refund History */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-24 animate-pulse" />
          ))}
        </div>
      ) : refunds.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FiInbox className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Refund Requests</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            You haven't submitted any refund requests yet. Select a received transaction above to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {refunds.map((refund: any, i: number) => {
            const status = statusConfig[refund.status] || statusConfig.PENDING;
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={refund.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${status.bg} flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-5 h-5 ${status.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-semibold text-white">
                          Refund Request
                        </h3>
                        <span className={`badge text-[10px] ${status.color} ${status.bg}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{refund.reason}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-gray-500 font-mono">
                          ID: {refund.id?.slice(0, 8)}...
                        </p>
                        {refund.transaction && (
                          <p className="text-xs text-gray-500">
                            Amount: <span className="text-white font-medium">${refund.transaction.amount?.toFixed(2)}</span>
                          </p>
                        )}
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {new Date(refund.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </p>
                      </div>
                      {refund.adminNote && (
                        <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                          <p className="text-xs text-gray-500 mb-1">Admin Note:</p>
                          <p className="text-sm text-gray-300">{refund.adminNote}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm py-2 px-4 disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary text-sm py-2 px-4 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
