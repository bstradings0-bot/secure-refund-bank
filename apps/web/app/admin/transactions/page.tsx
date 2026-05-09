'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useState } from 'react';

export default function AdminTransactionsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', page],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/transactions?page=${page}&limit=15`);
      return data;
    },
  });

  const transactions = data?.transactions || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">All Transactions</h1>
        <p className="text-gray-400 mt-1">Monitor all platform transactions</p>
      </div>
      <div className="glass-card">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="divide-y divide-white/5">
              {transactions.map((tx: any, i: number) => (
                <motion.div key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="flex items-center justify-between p-4 hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.receiver ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      <FiArrowDown className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{tx.sender?.firstName} → {tx.receiver?.firstName}</p>
                      <p className="text-[10px] text-gray-600 font-mono">{tx.referenceNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">${tx.amount.toFixed(2)}</p>
                    <span className={`badge text-[10px] ${tx.status === 'COMPLETED' ? 'badge-success' : 'badge-pending'}`}>{tx.status}</span>
                  </div>
                </motion.div>
              ))}
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
