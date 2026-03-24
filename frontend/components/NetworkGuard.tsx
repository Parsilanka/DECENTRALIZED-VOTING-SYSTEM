"use client";
import { useWallet } from '@/context/WalletContext';
import { AlertCircle, Smartphone } from 'lucide-react';

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { address, isCorrectNetwork, loading } = useWallet();

  const handleSwitchNetwork = async () => {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia
      });
    } catch (err: any) {
      if (err.code === 4902) {
        alert("Sepolia network is not added to your MetaMask. Please add it manually.");
      }
    }
  };

  if (loading) return children;

  if (address && !isCorrectNetwork) {
    return (
      <div className="fixed inset-0 z-[60] bg-white/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-red-100 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Wrong Network</h2>
            <p className="text-gray-600">You are connected to the wrong network. Please switch to the **Sepolia Testnet** to continue.</p>
          </div>
          <button 
            onClick={handleSwitchNetwork}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-all"
          >
            Switch to Sepolia
          </button>
        </div>
      </div>
    );
  }

  if (typeof window !== 'undefined' && typeof window.ethereum === 'undefined') {
     return (
        <div className="fixed inset-0 z-[60] bg-white/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-blue-100 max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Smartphone className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">MetaMask Required</h2>
              <p className="text-gray-600">A Web3 wallet like MetaMask is required to participate in decentralized voting.</p>
            </div>
            <a 
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg transition-all"
            >
              Install MetaMask
            </a>
          </div>
        </div>
      );
  }

  return children;
}
