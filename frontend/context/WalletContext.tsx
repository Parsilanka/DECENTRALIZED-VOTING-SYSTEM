"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { connectWallet } from '@/lib/web3';

interface WalletContextType {
  address: string | null;
  isAdmin: boolean;
  isCorrectNetwork: boolean;
  loading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || "0x272b49179565b4A6103c8939f24Fcd4da12f8Ed3";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [loading, setLoading] = useState(true);

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const addr = accounts[0];
          setAddress(addr);
          
          const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
          setIsCorrectNetwork(chainId === '0xaa36a7'); // Sepolia
        }
      } catch (err) {
        console.error("Connection check failed", err);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkConnection();

    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        } else {
          setAddress(null);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setIsCorrectNetwork(chainId === '0xaa36a7');
        window.location.reload();
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkConnection]);

  const connect = async () => {
    setLoading(true);
    try {
      const { address: addr } = await connectWallet();
      setAddress(addr);
      const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
      setIsCorrectNetwork(chainId === '0xaa36a7');
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
  };

  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  return (
    <WalletContext.Provider value={{ 
      address, 
      isAdmin, 
      isCorrectNetwork, 
      loading, 
      connect, 
      disconnect 
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};
