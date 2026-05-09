'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import {
  FiRefreshCw, FiCheck, FiX, FiClock, FiUser,
  FiDollarSign, FiInbox, FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useState } from 'react';

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  PENDING: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Pending' },
  APPROVED: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Approved' },
  REJECTED: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Rejected' },
  PROCESSING: { color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Processing' },
  COMPLETED: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Completed' },
};

export default function AdminRefundsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-refunds', page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/api/admin/refunds?${params}`);
      return data;
    },
  });

  const processMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'APPROVED' | 'REJECTED' }) => {
      await api.patch(`/api/admin/refunds/${id}`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-refunds'] });
      toast.success('Refund processed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process refund');
    },
  });

  const refunds = data?.refunds || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Refund Management</h1>
          <p className="text-gray-400 mt-1">Review and process refund requests</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-orange-500/50 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="glass-card">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : refunds.length === 0 ? (
          <div className="p-12 text-center">
            <FiInbox className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No refund requests found</p>
            <p className="text-gray-600 text-sm mt-1">
              {statusFilter ? 'No refunds match the selected status filter.' : 'All refund requests have been processed.'}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-white/5">
              {refunds.map((refund: any, i: number) => {
                const status = statusConfig[refund.status] || statusConfig.PENDING;
                return (
                  <motion.div
                    key={refund.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-5 hover:bg-white/[0.02] transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`badge text-[10px] ${status.color} ${status.bg}`}>
                            {status.label}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            {refund.id?.slice(0, 12)}...
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{refund.reason}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {refund.user && (
                            <span className="flex items-center gap-1">
                              <FiUser className="w-3 h-3" />
                              {refund.user.firstName} {refund.user.lastName}
                            </span>
                          )}
                          {refund.transaction && (
                            <span className="flex items-center gap-1">
                              <FiDollarSign className="w-3 h-3" />
                              ${refund.transaction.amount?.toFixed(2)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            {new Date(refund.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      {refund.status === 'PENDING' && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => processMutation.mutate({ id: refund.id, action: 'APPROVED' })}
                            disabled={processMutation.isPending}
                            className="px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 text-sm font-medium hover:bg-emerald-600/30 transition-colors disabled:opacity-50"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => processMutation.mutate({ id: refund.id, action: 'REJECTED' })}
                            disabled={processMutation.isPending}
                            className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 text-sm font-medium hover:bg-red-600/30 transition-colors disabled:opacity-50"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-white/5">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-2 px-4 disabled:opacity-30">Previous</button>
                <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm py-2 px-4 disabled:opacity-30">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
