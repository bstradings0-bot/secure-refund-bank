'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiCreditCard, FiSend, FiList, FiBell, FiUser, FiSettings, FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiActivity, FiRefreshCw, FiClock } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: FiHome },
  { href: '/cards', label: 'Cards', icon: FiCreditCard },
  { href: '/transfer', label: 'Transfer', icon: FiSend },
  { href: '/transactions', label: 'Transactions', icon: FiList },
  { href: '/refunds', label: 'Refunds', icon: FiRefreshCw },
  { href: '/notifications', label: 'Notifications', icon: FiBell },
  { href: '/settings', label: 'Settings', icon: FiSettings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const isDark = theme === 'dark';

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/api/account/notifications');
      return data.data;
    },
    enabled: !!user,
  });

  const notifications = notifData || [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900/30">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 glass border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bank-blue to-bank-accent flex items-center justify-center">
              <FiActivity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">SecureRefund</h1>
              <p className="text-xs text-gray-400">Bank</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-gray-400 hover:text-white">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-bank-blue/10 text-bank-blue border border-bank-blue/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-bank-blue to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all">
              <FiLogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:ml-72">
        {/* Header */}
        <header className="sticky top-0 z-30 glass border-b border-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
                <FiMenu className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-semibold text-white hidden sm:block">
                {pathname === '/dashboard' && 'Dashboard'}
                {pathname === '/cards' && 'Virtual Cards'}
                {pathname === '/transfer' && 'Send Money'}
                {pathname === '/transactions' && 'Transactions'}
                {pathname === '/refunds' && 'Refund Center'}
                {pathname === '/notifications' && 'Notifications'}
                {pathname === '/settings' && 'Settings'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <FiBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 glass-card p-0 border border-white/10 shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-4 border-b border-white/5">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        <Link
                          href="/notifications"
                          onClick={() => setNotifOpen(false)}
                          className="text-xs text-bank-blue hover:text-bank-light transition-colors"
                        >
                          View all
                        </Link>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center">
                            <FiBell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n: any) => (
                            <div
                              key={n.id}
                              className={`flex items-start gap-3 p-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${!n.read ? 'bg-bank-blue/5' : ''}`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.type === 'TRANSACTION' ? 'bg-emerald-500/10 text-emerald-400' : n.type === 'SECURITY' ? 'bg-red-500/10 text-red-400' : 'bg-bank-blue/10 text-bank-blue'}`}>
                                <FiBell className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white truncate">{n.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-gray-600 mt-1 flex items-center gap-1">
                                  <FiClock className="w-3 h-3" />
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              {!n.read && <span className="w-2 h-2 rounded-full bg-bank-blue flex-shrink-0 mt-1.5" />}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-2 pl-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-bank-blue to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
