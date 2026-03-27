"use client";
import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { ethers } from 'ethers';
import { useToast } from '@/context/ToastContext';
import { applyToVote, getVoterStatus, updateVoterProfile, getVoterActivity } from '@/lib/auth';
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
  Check,
  UserPlus,
  Loader2,
  Clock,
  LogIn,
  ChevronRight,
  AlertCircle,
  Edit2,
  Save
} from 'lucide-react';

export default function ProfilePage() {
  const { address, isCorrectNetwork, isLoggedIn, loginSIWE, token, loading: walletLoading } = useWallet();
  const { showToast } = useToast();
  const [balance, setBalance] = useState("0.00");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [regStatus, setRegStatus] = useState<'none' | 'pending' | 'approved' | 'failed' | 'approving'>('none');
  const [voterName, setVoterName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    async function fetchVoterInfo() {
      if (!address || !isCorrectNetwork) return;
      setLoading(true);
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const bal = await provider.getBalance(address);
        setBalance(ethers.formatEther(bal).slice(0, 6));

        // Fetch registration status
        if (token) {
          const statusRes = await getVoterStatus(token);
          setRegStatus(statusRes.status);
          setVoterName(statusRes.name || "");
          
          // Fetch real voting history
          const activity = await getVoterActivity(token);
          setHistory(activity);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchVoterInfo();
  }, [address, isCorrectNetwork, token]);

  const handleUpdateProfile = async () => {
    if (!voterName || !token) return;
    setEditLoading(true);
    try {
      await updateVoterProfile(voterName, token);
      showToast('success', "Profile updated!");
      setIsEditing(false);
    } catch (err) {
      showToast('error', "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    showToast('info', "Address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!address) return (
     <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-fadeIn">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <User className="w-12 h-12" />
        </div>
        <div className="space-y-4">
           <h1 className="text-3xl font-black dark:text-white">Profile Access</h1>
           <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">Connect your wallet to manage your verified identity and view voting history.</p>
        </div>
        <button 
           onClick={() => useWallet().connect()}
           className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black shadow-xl hover:shadow-blue-500/20 transition-all flex items-center gap-3 mx-auto"
        >
           <Wallet className="w-5 h-5" /> Connect Now
        </button>
     </div>
  );

  if (!isLoggedIn) return (
    <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-fadeIn">
       <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl ring-8 ring-indigo-50/50">
         <ShieldCheck className="w-12 h-12" />
       </div>
       <div className="space-y-4">
          <h1 className="text-3xl font-black dark:text-white">Secure Sign-In</h1>
          <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">Verify your ownership of <strong>{address.slice(0,6)}...</strong> to access private voting records.</p>
       </div>
       <button 
          onClick={loginSIWE}
          disabled={walletLoading}
          className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center gap-3 mx-auto disabled:opacity-50"
       >
          <LogIn className="w-5 h-5" /> {walletLoading ? 'Verifying...' : 'Sign In with Wallet'}
       </button>
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
                 <div className="flex items-center justify-center md:justify-start gap-2">
                   <h1 className="text-sm font-black uppercase tracking-widest text-blue-600">Verified Voter</h1>
                   {regStatus === 'approved' && (
                     <button 
                       onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                       disabled={editLoading}
                       className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition text-blue-600"
                     >
                       {editLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : isEditing ? <Save className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                     </button>
                   )}
                 </div>
                 <div className="flex flex-col items-center md:items-start">
                    {isEditing ? (
                      <input 
                        value={voterName}
                        onChange={(e) => setVoterName(e.target.value)}
                        className="text-2xl font-black bg-gray-50 dark:bg-gray-800 border-b-2 border-blue-600 outline-none px-2 py-1 dark:text-white mb-2"
                        autoFocus
                      />
                    ) : (
                      <p className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                        {voterName || "Anonymous Voter"}
                      </p>
                    )}
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <p className="text-xl md:text-2xl font-mono font-medium text-gray-400 truncate max-w-[200px] md:max-w-full">
                          {address?.slice(0, 10)}...{address?.slice(-8)}
                      </p>
                      <button onClick={copyAddress} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-400 hover:text-blue-600">
                          {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
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

      {/* Registration Section */}
      {(regStatus === 'none' || regStatus === 'failed') && (
         <VoterRegistrationForm 
           address={address} 
           onSuccess={() => setRegStatus('pending')} 
           isFailed={regStatus === 'failed'}
         />
      )}
      
      {(regStatus === 'pending' || regStatus === 'approving') && (
         <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-800 text-amber-600 rounded-3xl flex items-center justify-center">
                   <Clock className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                   <h3 className="text-xl font-bold dark:text-white">
                     {regStatus === 'pending' ? 'Application Pending' : 'Finalizing Registration'}
                   </h3>
                   <p className="text-gray-500">
                     {regStatus === 'pending' 
                       ? 'The administrator is currently reviewing your registration request.' 
                       : 'Your request has been approved and is being recorded on the blockchain.'}
                   </p>
                </div>
            </div>
            <div className="px-6 py-3 bg-white dark:bg-gray-800 rounded-2xl text-xs font-bold text-amber-600 shadow-sm border dark:border-gray-700">
               {regStatus === 'pending' ? 'ETR: Under 24h' : 'Status: Processing...'}
            </div>
         </div>
      )}

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
             history.map((item, idx) => (
               <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:border-blue-500 transition-all shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                       <BadgeCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold dark:text-white uppercase text-[10px] tracking-widest text-blue-600 mb-1">Official Vote Cast</h4>
                      <h3 className="font-black dark:text-white text-lg">{item.election_title}</h3>
                      <p className="text-xs text-gray-500 font-mono">TX: {item.transaction_hash?.slice(0, 20)}...</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                     <span className="text-[10px] font-black uppercase text-gray-400">Block #{item.block_number}</span>
                     <a 
                       href={`https://sepolia.etherscan.io/tx/${item.transaction_hash}`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                     >
                        View Receipt <ExternalLink className="w-3 h-3" />
                     </a>
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

function VoterRegistrationForm({ address, onSuccess, isFailed }: any) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await applyToVote({ address, name });
      showToast('success', "Application submitted!");
      onSuccess();
    } catch (err) {
      showToast('error', "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 md:p-12 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
       <div className="absolute top-0 right-0 p-12 opacity-10">
          <UserPlus className="w-64 h-64 -mr-20 -mt-20" />
       </div>
       <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
             <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                <UserPlus className="w-8 h-8" />
             </div>
             <div className="space-y-2">
                <h2 className="text-4xl font-black">Become a Voter</h2>
                <p className="text-indigo-100 text-lg leading-relaxed">Register your official identity to participate in upcoming on-chain elections.</p>
             </div>
             
             {isFailed && (
               <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 p-4 rounded-2xl flex items-start gap-4 animate-shake">
                  <AlertCircle className="w-6 h-6 text-red-200 shrink-0" />
                  <div className="text-sm">
                    <p className="font-bold text-red-100">Previous Request Failed</p>
                    <p className="text-red-100/70">There was an issue processing your last request. You can try submitting again below.</p>
                  </div>
               </div>
             )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-70">Full Name / Identifier</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe / Citizen ID"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-lg focus:bg-white/20 focus:outline-none transition group"
                />
             </div>
             <button 
               type="submit"
               disabled={loading}
               className="w-full bg-white text-indigo-600 py-5 rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
             >
               {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="flex items-center gap-3">Request Access <ChevronRight className="w-6 h-6" /></span>}
             </button>
             <p className="text-[10px] text-center opacity-60">Submitting this form notifies the administrator for manual verification.</p>
          </form>
       </div>
    </div>
  );
}
