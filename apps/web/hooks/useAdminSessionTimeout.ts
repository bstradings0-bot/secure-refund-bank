'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_THRESHOLD = 28 * 60 * 1000; // Show warning at 28 minutes

export function useAdminSessionTimeout() {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const warningShownRef = useRef<boolean>(false);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    warningShownRef.current = false;

    if (warningRef.current) clearTimeout(warningRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Show warning 2 minutes before timeout
    warningRef.current = setTimeout(() => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        toast('⚠️ Admin session expiring soon due to inactivity', {
          icon: '⏰',
          duration: 5000,
          style: {
            background: '#1a0a0a',
            color: '#fca5a5',
            border: '1px solid rgba(239,68,68,0.3)',
          },
        });
      }
    }, WARNING_THRESHOLD);

    // Auto logout after timeout
    timeoutRef.current = setTimeout(() => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (user.role === 'ADMIN') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            toast.error('Admin session expired due to inactivity');
            router.replace('/admin/login');
          }
        } catch {}
      }
    }, ADMIN_SESSION_TIMEOUT);
  }, [router]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return;
    try {
      const user = JSON.parse(stored);
      if (user.role !== 'ADMIN') return;
    } catch {
      return;
    }

    // Initial timer
    resetTimer();

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    const handleActivity = () => resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      if (warningRef.current) clearTimeout(warningRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer]);
}
