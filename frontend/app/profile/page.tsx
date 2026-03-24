"use client";
import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { 
  User, 
  Wallet, 
  History, 
  BadgeCheck, 
  ExternalLink,
  ShieldCheck,
  MapPin,
  Vote,
  Copy,
  Check
} from 'lucide-react';
import { ethers } from 'ethers';
import { useToast } from '@/context/ToastContext';

export default function ProfilePage() {
  const { address, isCorrectNetwork } = useWallet();
  const { showToast } = useToast();
  const [balance, setBalance] = useState("0.00");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchVoterInfo() {
      if (!address || !isCorrectNetwork) return;
      setLoading(true);
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const bal = await provider.getBalance(address);
        setBalance(ethers.formatEther(bal).slice(0, 6));

        // In a real app, we'd fetch event logs here. 
        // For now, we'll show a placeholder history to demonstrate the concept.
        setHistory([
          { id: 1, title: 'Presidential Election 2026', candidate: 'Alice Johnson', status: 'Confirmed', date: 'Mar 22, 2026' },
          { id: 2, title: 'Senate Primary', candidate: 'Bob Smith', status: 'Confirmed', date: 'Feb 15, 2026' }
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchVoterInfo();
  }, [address, isCorrectNetwork]);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    showToast('info', "Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!address) return (
     <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <User className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold dark:text-white">Profile Access</h1>
        <p className="text-gray-500">Please connect your wallet to view your voting history and registration status.</p>
     </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8">
           <div className="w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-10">
           <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/30 ring-8 ring-blue-50 dark:ring-blue-900/20">
              <User className="w-16 h-16" />
           </div>
           
           <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                 <h1 className="text-sm font-black uppercase tracking-widest text-blue-600">Verified Voter</h1>
                 <div className="flex items-center justify-center md:justify-start gap-4">
                    <p className="text-3xl md:text-4xl font-outfit font-black text-gray-900 dark:text-white truncate max-w-[250px] md:max-w-full">
                       {address.slice(0, 10)}...{address.slice(-8)}
                    </p>
                    <button onClick={copyAddress} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-blue-600">
                       {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                 </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                 <div className="px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold border border-green-100 dark:border-green-800 flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4" /> Account Secured
                 </div>
                 <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-800 flex items-center gap-2">
                   <MapPin className="w-4 h-4" /> Global Citizen
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-12 border-t dark:border-gray-800">
           <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Wallet className="w-3 h-3" /> Sepolia Balance
              </p>
              <p className="text-4xl font-black dark:text-white">{balance} <span className="text-sm font-medium text-gray-500 italic">ETH</span></p>
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Vote className="w-3 h-3" /> Participation Rate
              </p>
              <p className="text-4xl font-black dark:text-white">100<span className="text-sm font-medium text-gray-500 italic">%</span></p>
           </div>
        </div>
      </div>

      {/* Voting History */}
      <section className="space-y-8">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center">
              <History className="w-6 h-6" />
           </div>
           <h2 className="text-2xl font-bold dark:text-white">Recent Activity</h2>
         </div>

         <div className="space-y-4">
           {loading ? (
             [1, 2].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)
           ) : history.length > 0 ? (
             history.map((item) => (
               <div key={item.id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:border-blue-500 transition-all shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                       <BadgeCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold dark:text-white">{item.title}</h4>
                      <p className="text-sm text-gray-500">Voted for: <span className="font-bold text-gray-700 dark:text-gray-300">{item.candidate}</span></p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                     <span className="text-[10px] font-black uppercase text-gray-400">{item.date}</span>
                     <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                        Receipt <ExternalLink className="w-3 h-3" />
                     </button>
                  </div>
               </div>
             ))
           ) : (
             <p className="text-center py-12 text-gray-400 font-medium bg-gray-50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
               No voting history found for this address.
             </p>
           )}
         </div>
      </section>
    </div>
  );
}
