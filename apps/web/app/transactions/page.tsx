'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp, FiArrowDown, FiSearch, FiDownload, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';

type FilterState = { type: string; status: string };

export default function TransactionsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ type: '', status: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page],
    queryFn: async () => {
      const { data } = await api.get(`/api/transactions?page=${page}&limit=50`);
      return data;
    },
    enabled: !!user,
  });

  const allTransactions = data?.transactions || [];
  const totalPages = data?.totalPages || 1;

  // Client-side filtering
  const transactions = useMemo(() => {
    let result = allTransactions;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((tx: any) =>
        tx.referenceNumber?.toLowerCase().includes(q) ||
        tx.sender?.firstName?.toLowerCase().includes(q) ||
        tx.sender?.lastName?.toLowerCase().includes(q) ||
        tx.receiver?.firstName?.toLowerCase().includes(q) ||
        tx.receiver?.lastName?.toLowerCase().includes(q) ||
        tx.type?.toLowerCase().includes(q) ||
        tx.description?.toLowerCase().includes(q)
      );
    }

    if (filters.type) {
      result = result.filter((tx: any) => tx.type === filters.type);
    }

    if (filters.status) {
      result = result.filter((tx: any) => tx.status === filters.status);
    }

    return result;
  }, [allTransactions, search, filters]);

  const hasActiveFilters = search.trim() || filters.type || filters.status;

  const clearFilters = () => {
    setSearch('');
    setFilters({ type: '', status: '' });
  };

  const exportCSV = () => {
    const txns = transactions.length > 0 ? transactions : allTransactions;
    if (txns.length === 0) {
      toast.error('No transactions to export');
      return;
    }
    const headers = ['Reference', 'Type', 'Sender', 'Receiver', 'Amount', 'Status', 'Date'];
    const rows = txns.map((tx: any) => [
      tx.referenceNumber,
      tx.type,
      `${tx.sender?.firstName || ''} ${tx.sender?.lastName || ''}`.trim(),
      `${tx.receiver?.firstName || ''} ${tx.receiver?.lastName || ''}`.trim(),
      tx.amount,
      tx.status,
      new Date(tx.timestamp || tx.createdAt).toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${txns.length} transactions exported`);
  };

  // Dedupe types and statuses from data
  const types = useMemo(() => [...new Set(allTransactions.map((t: any) => t.type))] as string[], [allTransactions]);
  const statuses = useMemo(() => [...new Set(allTransactions.map((t: any) => t.status))] as string[], [allTransactions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-gray-400 mt-1">Your transaction history</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`btn-secondary flex items-center gap-2 text-sm py-2 px-4 ${hasActiveFilters ? '!border-bank-blue/40 !text-bank-blue' : ''}`}
            >
              <FiFilter className="w-4 h-4" />
              Filter
              {hasActiveFilters && (
                <span className="w-5 h-5 rounded-full bg-bank-blue text-white text-[10px] font-bold flex items-center justify-center">
                  {(search ? 1 : 0) + (filters.type ? 1 : 0) + (filters.status ? 1 : 0)}
                </span>
              )}
            </button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 glass-card p-4 border border-white/10 shadow-2xl z-50 space-y-4"
                >
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-bank-blue/50 focus:outline-none"
                    >
                      <option value="">All Types</option>
                      {types.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-bank-blue/50 focus:outline-none"
                    >
                      <option value="">All Statuses</option>
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="w-full text-xs text-bank-blue hover:text-bank-light transition-colors py-1">
                      Clear all filters
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 text-sm py-2 px-4">
            <FiDownload className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="glass-card">
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              className="input-field pl-12 pr-10"
              placeholder="Search by reference, name, or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="divide-y divide-white/5">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg font-medium">
                    {hasActiveFilters ? 'No transactions match your filters' : 'No transactions yet'}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {hasActiveFilters ? 'Try adjusting your search or filter criteria.' : 'Your transaction history will appear here.'}
                  </p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="mt-3 text-sm text-bank-blue hover:text-bank-light transition-colors">
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                transactions.map((tx: any, i: number) => {
                  const isOutgoing = tx.senderId === user?.id;
                  return (
                    <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOutgoing ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                          {isOutgoing ? <FiArrowUp className="w-4 h-4 text-red-400" /> : <FiArrowDown className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {isOutgoing ? `To ${tx.receiver?.firstName || 'Unknown'} ${tx.receiver?.lastName || ''}` : `From ${tx.sender?.firstName || 'Unknown'} ${tx.sender?.lastName || ''}`}
                          </p>
                          <p className="text-xs text-gray-500">{tx.type} | {new Date(tx.timestamp || tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${isOutgoing ? 'text-red-400' : 'text-emerald-400'}`}>
                          {isOutgoing ? '-' : '+'}${tx.amount?.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-500 font-mono">{tx.referenceNumber}</span>
                          <span className={`badge text-[10px] ${tx.status === 'COMPLETED' ? 'badge-success' : tx.status === 'PENDING' ? 'badge-pending' : 'badge-danger'}`}>{tx.status}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !hasActiveFilters && (
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
