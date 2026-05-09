'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { FiBell, FiCheck, FiClock, FiInbox } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/api/account/notifications');
      return data.data;
    },
    enabled: !!user,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/account/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await api.patch('/api/account/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const notifs = notifications || [];
  const unreadCount = notifs.filter((n: any) => !n.read).length;

  const getIconStyle = (type: string) => {
    switch (type) {
      case 'TRANSACTION': return 'bg-emerald-500/10 text-emerald-400';
      case 'SECURITY': return 'bg-red-500/10 text-red-400';
      case 'CARD': return 'bg-purple-500/10 text-purple-400';
      default: return 'bg-bank-blue/10 text-bank-blue';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass-card h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-gray-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <FiCheck className="w-4 h-4" />
            Mark All Read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifs.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FiInbox className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Notifications</h3>
            <p className="text-gray-500 text-sm">You'll see your transaction alerts, security notices, and system updates here.</p>
          </div>
        ) : (
          notifs.map((n: any, i: number) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`glass-card p-4 hover:border-white/10 transition-all cursor-pointer ${!n.read ? 'border-l-2 border-l-bank-blue bg-bank-blue/[0.02]' : ''}`}
              onClick={() => { if (!n.read) markRead.mutate(n.id); }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconStyle(n.type)}`}>
                  <FiBell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-white truncate">{n.title}</h3>
                    {!n.read && (
                      <span className="text-[10px] font-medium text-bank-blue bg-bank-blue/10 px-2 py-0.5 rounded-full flex-shrink-0">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    {new Date(n.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
