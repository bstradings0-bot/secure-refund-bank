'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TransfersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/transfer');
  }, [router]);

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="text-gray-400">Redirecting to transfers...</div>
    </div>
  );
}
