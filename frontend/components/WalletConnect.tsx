"use client";
import { useState } from 'react';
import { connectWallet } from '@/lib/web3';

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { address: addr } = await connectWallet();
      setAddress(addr);
    } catch (err: any) {
      if (err.code !== -32002) { // Don't alert if it's just a pending request
        alert(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      {address ? (
        <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium shadow-sm">
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      ) : (
        <button 
          onClick={handleConnect}
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-medium shadow-md transition-all duration-200 ${
            loading 
              ? "bg-blue-400 cursor-not-allowed text-white/50" 
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}
