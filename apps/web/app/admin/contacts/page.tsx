'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiMail, FiSearch, FiCalendar, FiUser, FiBriefcase, FiPhone, FiMessageSquare, FiChevronDown, FiX, FiEye } from 'react-icons/fi';

export default function AdminContactsPage() {
  const [page, setPage] = useState(1);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-contacts', page],
    queryFn: async () => {
      const { data } = await api.get(`/api/admin/contacts?page=${page}&limit=${limit}`);
      return data;
    },
    refetchInterval: 30000,
  });

  const messages = data?.data || [];
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
        <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
        <p className="text-gray-400 mt-1">{total} messages from customers</p>
      </div>

      {/* Messages List */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <FiMail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Messages Yet</h3>
            <p className="text-gray-400">Customer contact form submissions will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {messages.map((msg: any) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                onClick={() => setSelectedMsg(msg)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-bank-blue/10 flex items-center justify-center flex-shrink-0">
                      <FiUser className="w-5 h-5 text-bank-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white group-hover:text-bank-blue transition-colors">{msg.name}</span>
                        {msg.company && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <FiBriefcase className="w-3 h-3" />{msg.company}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1"><FiMail className="w-3 h-3" />{msg.email}</span>
                        {msg.phone && <span className="flex items-center gap-1"><FiPhone className="w-3 h-3" />{msg.phone}</span>}
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-1">{msg.subject} — {msg.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-500">{formatDate(msg.createdAt)}</span>
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
        {selectedMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedMsg(null); }}
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
                  <div className="w-10 h-10 rounded-xl bg-bank-blue/10 flex items-center justify-center">
                    <FiMail className="w-5 h-5 text-bank-blue" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Message Details</h3>
                    <p className="text-sm text-gray-400">{formatDate(selectedMsg.createdAt)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedMsg(null)} className="text-gray-400 hover:text-white transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Name</p>
                  <p className="text-sm font-semibold text-white">{selectedMsg.name}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Email</p>
                  <a href={`mailto:${selectedMsg.email}`} className="text-sm text-bank-blue hover:underline">{selectedMsg.email}</a>
                </div>
                {selectedMsg.phone && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                    <a href={`tel:${selectedMsg.phone}`} className="text-sm text-bank-blue hover:underline">{selectedMsg.phone}</a>
                  </div>
                )}
                {selectedMsg.company && (
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Company</p>
                    <p className="text-sm text-white">{selectedMsg.company}</p>
                  </div>
                )}
              </div>

              {/* Subject & Message */}
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-sm font-semibold text-white">{selectedMsg.subject}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FiMessageSquare className="w-3 h-3" /> Message
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedMsg.message}</p>
                </div>
              </div>

              {/* Reply Button */}
              <div className="mt-6 flex gap-3">
                <a
                  href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(selectedMsg.subject)}`}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <FiMail className="w-4 h-4" /> Reply via Email
                </a>
                <button onClick={() => setSelectedMsg(null)} className="btn-secondary">
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
