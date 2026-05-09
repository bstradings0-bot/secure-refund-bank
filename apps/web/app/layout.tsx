import type { Metadata } from 'next';
import { Providers } from '@/components/providers/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'SecureRefund Bank - International Banking',
  description: 'Premium international banking platform. Manage your money, virtual cards, transfers, and more.',
  icons: '/favicon.ico',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
        <footer className="text-center py-4 text-xs text-gray-500 border-t border-white/5">
          This platform is a demo fintech banking system and does not provide real banking services unless integrated with licensed financial infrastructure.
        </footer>
      </body>
    </html>
  );
}
