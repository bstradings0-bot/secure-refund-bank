'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiDollarSign, FiSearch, FiCalendar, FiUser, FiBriefcase, FiPhone, FiChevronDown, FiX, FiMail, FiClock, FiUsers } from 'react-icons/fi';

export default function AdminQuotesPage() {
  const [page, setPage] = useState(1);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-quotes', page],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/quotes?page=${page}&limit=${limit}`);
      return data;
    },
    refetchInterval: 30000,
  });

  const quotes = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Quote Requests</h1>
        <p className="text-gray-400 mt-1">{total} enterprise quote requests</p>
      </div>

      {/* Summary Cards */}
      {!isLoading && quotes.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-bank-blue/10 flex items-center justify-center">
                <FiBriefcase className="w-5 h-5 text-bank-blue" />
              </div>
              <p className="text-sm text-gray-400">Total Requests</p>
            </div>
            <p className="text-2xl font-bold text-white">{total}</p>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-sm text-gray-400">This Month</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {quotes.filter((q: any) => new Date(q.createdAt).getMonth() === new Date().getMonth()).length}
            </p>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-sm text-gray-400">Unique Companies</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {new Set(quotes.map((q: any) => q.companyName.toLowerCase())).size}
            </p>
          </div>
        </div>
      )}

      {/* Quotes List */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-16">
            <FiBriefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Quotes Yet</h3>
            <p className="text-gray-400">Enterprise quote request submissions will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {quotes.map((quote: any) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                onClick={() => setSelectedQuote(quote)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <FiBriefcase className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">{quote.companyName}</span>
                        {quote.industry && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">
                            {quote.industry}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1"><FiUser className="w-3 h-3" />{quote.contactName}</span>
                        <span className="flex items-center gap-1"><FiMail className="w-3 h-3" />{quote.email}</span>
                        {quote.phone && <span className="flex items-center gap-1"><FiPhone className="w-3 h-3" />{quote.phone}</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        {quote.budget && <span className="text-bank-blue">{quote.budget}</span>}
                        {quote.employeeCount && <span className="text-gray-500">{quote.employeeCount} employees</span>}
                        {quote.timeline && <span className="text-gray-500 flex items-center gap-1"><FiClock className="w-3 h-3" />{quote.timeline}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-500">{formatDate(quote.createdAt)}</span>
                    <FiChevronDown className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
            <p className="text-sm text-gray-400">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-white/5 text-sm text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedQuote(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <FiBriefcase className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Quote Request Details</h3>
                    <p className="text-sm text-gray-400">{formatDate(selectedQuote.createdAt)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedQuote(null)} className="text-gray-400 hover:text-white transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Company & Contact Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Company</p>
                  <p className="text-sm font-semibold text-white">{selectedQuote.companyName}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Contact Person</p>
                  <p className="text-sm font-semibold text-white">{selectedQuote.contactName}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Email</p>
                  <a href={`mailto:${selectedQuote.email}`} className="text-sm text-bank-blue hover:underline">{selectedQuote.email}</a>
                </div>
                {selectedQuote.phone && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                    <a href={`tel:${selectedQuote.phone}`} className="text-sm text-bank-blue hover:underline">{selectedQuote.phone}</a>
                  </div>
                )}
                {selectedQuote.industry && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Industry</p>
                    <p className="text-sm text-white">{selectedQuote.industry}</p>
                  </div>
                )}
                {selectedQuote.employeeCount && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Company Size</p>
                    <p className="text-sm text-white">{selectedQuote.employeeCount}</p>
                  </div>
                )}
                {selectedQuote.budget && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Budget</p>
                    <p className="text-sm font-semibold text-emerald-400">{selectedQuote.budget}</p>
                  </div>
                )}
                {selectedQuote.timeline && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Timeline</p>
                    <p className="text-sm text-white">{selectedQuote.timeline}</p>
                  </div>
                )}
              </div>

              {/* Requirements */}
              <div className="p-4 bg-white/5 rounded-xl mb-6">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FiBriefcase className="w-3 h-3" /> Requirements
                </p>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedQuote.requirements}</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <a
                  href={`mailto:${selectedQuote.email}?subject=Custom%20Quote%20for%20${encodeURIComponent(selectedQuote.companyName)}`}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <FiMail className="w-4 h-4" /> Send Proposal
                </a>
                <button onClick={() => setSelectedQuote(null)} className="btn-secondary">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
