'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="text-gray-400">Redirecting to admin dashboard...</div>
    </div>
  );
}
