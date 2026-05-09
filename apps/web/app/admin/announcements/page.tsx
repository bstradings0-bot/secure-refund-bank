'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiBell, FiPlus, FiEdit2, FiTrash2, FiX, FiTag, FiAlertTriangle, FiCheck, FiEye, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Announcement {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  category: string | null;
  priority: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | ''>('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'GENERAL',
    priority: 'NORMAL' as 'LOW' | 'NORMAL' | 'HIGH',
    active: true,
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/announcements');
      return data.data as Announcement[];
    },
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { data: response } = await api.post('/api/admin/announcements', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      closeModal();
      toast.success('Announcement created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create announcement');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof form> }) => {
      const { data: response } = await api.patch(`/api/admin/announcements/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      closeModal();
      toast.success('Announcement updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update announcement');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const announcement = announcements?.find(a => a.id === id);
      const { data: response } = await api.patch(`/api/admin/announcements/${id}`, {
        active: !announcement?.active,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast.success('Announcement status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/admin/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      closeModal();
      toast.success('Announcement deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete announcement');
    },
  });

  const openCreate = () => {
    setModalMode('create');
    setForm({
      title: '',
      content: '',
      summary: '',
      category: 'GENERAL',
      priority: 'NORMAL',
      active: true,
    });
    setSelectedAnnouncement(null);
  };

  const openEdit = (announcement: Announcement) => {
    setModalMode('edit');
    setSelectedAnnouncement(announcement);
    setForm({
      title: announcement.title,
      content: announcement.content,
      summary: announcement.summary || '',
      category: announcement.category || 'GENERAL',
      priority: announcement.priority as 'LOW' | 'NORMAL' | 'HIGH',
      active: announcement.active,
    });
  };

  const closeModal = () => {
    setModalMode('');
    setSelectedAnnouncement(null);
    setForm({
      title: '',
      content: '',
      summary: '',
      category: 'GENERAL',
      priority: 'NORMAL',
      active: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      createMutation.mutate(form);
    } else if (modalMode === 'edit' && selectedAnnouncement) {
      updateMutation.mutate({ id: selectedAnnouncement.id, data: form });
    }
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const priorityColors: Record<string, string> = {
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
    NORMAL: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  const categories = ['GENERAL', 'PRODUCT', 'SECURITY', 'COMPANY', 'MAINTENANCE'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Announcements</h1>
          <p className="text-gray-400 mt-1">
            {announcements ? `${announcements.length} announcements` : 'Loading...'} — {announcements?.filter(a => a.active).length} active
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : announcements?.length === 0 ? (
          <div className="text-center py-16">
            <FiBell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Announcements Yet</h3>
            <p className="text-gray-400">Create your first announcement to notify users.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {announcements?.map((announcement) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 hover:bg-white/[0.02] transition-colors ${!announcement.active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      announcement.priority === 'HIGH' ? 'bg-red-500/10' : announcement.priority === 'NORMAL' ? 'bg-blue-500/10' : 'bg-emerald-500/10'
                    }`}>
                      {announcement.priority === 'HIGH' ? (
                        <FiAlertTriangle className="w-5 h-5 text-red-400" />
                      ) : (
                        <FiBell className={`w-5 h-5 ${announcement.priority === 'NORMAL' ? 'text-blue-400' : 'text-emerald-400'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{announcement.title}</span>
                        {!announcement.active && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">Inactive</span>
                        )}
                        {announcement.priority !== 'NORMAL' && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[announcement.priority]}`}>
                            {announcement.priority}
                          </span>
                        )}
                        {announcement.category && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <FiTag className="w-3 h-3" />{announcement.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-1 mb-2">
                        {announcement.summary || announcement.content.substring(0, 150)}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" />{formatDate(announcement.createdAt)}</span>
                        <span className={`flex items-center gap-1 ${announcement.active ? 'text-emerald-400' : 'text-gray-500'}`}>
                          <FiCheck className="w-3 h-3" />{announcement.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleMutation.mutate(announcement.id)}
                      className={`p-2 rounded-lg transition-all ${
                        announcement.active ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                      title={announcement.active ? 'Deactivate' : 'Activate'}
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(announcement)}
                      className="p-2 rounded-lg bg-bank-blue/10 text-bank-blue hover:bg-bank-blue/20 transition-all"
                      title="Edit"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this announcement?')) {
                          deleteMutation.mutate(announcement.id);
                        }
                      }}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
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
                    <FiBell className="w-5 h-5 text-bank-blue" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white capitalize">{modalMode} Announcement</h3>
                    <p className="text-sm text-gray-400">
                      {modalMode === 'create' ? 'Create a new announcement for users' : 'Edit existing announcement'}
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-bank-blue transition-all"
                    placeholder="e.g. Scheduled Maintenance on May 15"
                  />
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Summary (Optional)</label>
                  <input
                    type="text"
                    value={form.summary}
                    onChange={(e) => setForm(f => ({ ...f, summary: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-bank-blue transition-all"
                    placeholder="Brief summary shown in lists"
                    maxLength={200}
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Content *</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-bank-blue transition-all resize-none"
                    placeholder="Full announcement content..."
                  />
                </div>

                {/* Category & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-bank-blue transition-all appearance-none cursor-pointer"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm(f => ({ ...f, priority: e.target.value as any }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-bank-blue transition-all appearance-none cursor-pointer"
                    >
                      <option value="LOW">Low</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                  <input
                    type="checkbox"
                    id="active"
                    checked={form.active}
                    onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-bank-blue focus:ring-bank-blue/30 cursor-pointer"
                  />
                  <label htmlFor="active" className="text-sm text-gray-300 cursor-pointer">
                    Publish immediately (active)
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>{modalMode === 'create' ? 'Create' : 'Update'} Announcement</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
