"use client";
import { ToastProvider } from '@/context/ToastContext';
import { WalletProvider } from '@/context/WalletContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </WalletProvider>
  );
}
