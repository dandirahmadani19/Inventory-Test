import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Inventory Control Center — mGanik',
  description: 'Real-time inventory management system for warehouse administrators. Monitor stock levels and prevent overselling.',
  keywords: ['inventory', 'stock management', 'warehouse', 'real-time'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-950`}>{children}</body>
    </html>
  );
}
