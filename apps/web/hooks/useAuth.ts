'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  kycStatus: string;
  account: {
    id: string;
    balance: number;
    savingsBalance: number;
    currency: string;
    status: string;
  };
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    setHasToken(!!localStorage.getItem('accessToken'));
  }, []);

  const { data: freshUser, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/api/auth/me');
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data));
        setUser(data.data);
        return data.data;
      }
      return null;
    },
    enabled: hasToken,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string; otpCode?: string }) => {
      const { data } = await api.post('/api/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      if (data.data?.requires2FA) {
        toast.success('2FA code sent to your device');
        // Return the data so the login page can show the 2FA input
        return data.data;
      } else {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        toast.success('Welcome back!');
        router.push(data.data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
      const res = await api.post('/api/auth/register', data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Account created! Check your email for verification code.');
      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        router.push('/dashboard');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    queryClient.clear();
    router.push('/login');
    toast.success('Logged out');
  };

  return {
    user: freshUser || user,
    isLoading,
    isAuthenticated: !!(freshUser || user),
    login: loginMutation,
    register: registerMutation,
    logout,
  };
}
