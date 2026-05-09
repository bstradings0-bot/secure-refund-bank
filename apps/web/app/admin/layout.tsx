'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminSessionTimeout } from '@/hooks/useAdminSessionTimeout';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiHome, FiUsers, FiList, FiBarChart2, FiShield, FiLogOut, FiMenu, FiX, FiActivity, FiRefreshCw, FiUserCheck, FiFileText, FiMail, FiBriefcase, FiBell } from 'react-icons/fi';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: FiHome },
  { href: '/admin/users', label: 'Users', icon: FiUsers },
  { href: '/admin/transactions', label: 'Transactions', icon: FiList },
  { href: '/admin/kyc', label: 'KYC Review', icon: FiUserCheck },
  { href: '/admin/refunds', label: 'Refunds', icon: FiRefreshCw },
  { href: '/admin/compliance', label: 'Compliance', icon: FiFileText },
  { href: '/admin/contacts', label: 'Contact Messages', icon: FiMail },
  { href: '/admin/quotes', label: 'Quote Requests', icon: FiBriefcase },
  { href: '/admin/announcements', label: 'Announcements', icon: FiBell },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDark = theme === 'dark';

  // Admin session timeout (30 min inactivity → auto logout)
  useAdminSessionTimeout();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // If on login page and already admin, redirect to dashboard
    if (isLoginPage && user && user.role === 'ADMIN') {
      router.replace('/admin');
      return;
    }
    // If on protected admin page and not admin, redirect to admin login
    if (!isLoginPage && user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
    // If not logged in at all and not on login page, redirect to admin login
    if (!isLoginPage && !user) {
      router.replace('/admin/login');
    }
  }, [user, router, isLoginPage, pathname]);

  // Show children without sidebar on login page or when not admin
  if (isLoginPage) return <>{children}</>;
  if (!user || user.role !== 'ADMIN') return <>{children}</>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900/30">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 glass border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <FiShield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Admin Panel</h1>
              <p className="text-xs text-orange-400">SecureRefund</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                  <Icon className="w-5 h-5" />{item.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-orange-400">Administrator</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/5 transition-all">
              <FiLogOut className="w-5 h-5" />Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:ml-72">
        <header className="sticky top-0 z-30 glass border-b border-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white"><FiMenu className="w-6 h-6" /></button>
            <h2 className="text-lg font-semibold text-white">
              {pathname === '/admin' && 'Admin Dashboard'}
              {pathname === '/admin/login' && 'Admin Login'}
              {pathname === '/admin/users' && 'User Management'}
              {pathname?.startsWith('/admin/users/') && 'User Profile'}
              {pathname === '/admin/transactions' && 'All Transactions'}
              {pathname === '/admin/kyc' && 'KYC Review'}
              {pathname === '/admin/refunds' && 'Refund Management'}
              {pathname === '/admin/compliance' && 'Compliance Center'}
              {pathname === '/admin/contacts' && 'Contact Messages'}
              {pathname === '/admin/quotes' && 'Quote Requests'}
              {pathname === '/admin/announcements' && 'Announcements'}
            </h2>
            <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white">{isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}</button>
          </div>
        </header>
        <main className="p-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{children}</motion.div>
        </main>
      </div>
    </div>
  );
}
