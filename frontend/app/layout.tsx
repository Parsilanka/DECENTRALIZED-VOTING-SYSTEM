import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import WalletConnect from '@/components/WalletConnect';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Decentralized Voting DApp',
  description: 'A transparent, tamper-proof, and verifiable voting system built on Ethereum.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl tracking-tight font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                VoteChain
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Admin
              </Link>
              <WalletConnect />
            </div>
          </div>
        </header>
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} VoteChain Decentralized App. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
