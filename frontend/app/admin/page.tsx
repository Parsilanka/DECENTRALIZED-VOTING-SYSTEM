"use client";
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  UserPlus, 
  Trash2, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Hash,
  Activity,
  Calendar,
  ChevronRight,
  Power,
  RefreshCcw,
  Loader2,
  CheckCircle,
  UserCheck,
  FileText,
  History,
  Monitor,
  AlertTriangle
} from 'lucide-react';
import { createElection, addCandidate, registerVoter, getElections, endElection, getProtocolEvents } from '@/lib/api';
import { getPendingVoters, approveVoter as apiApproveVoter, forceApproveVoter } from '@/lib/auth';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/context/ToastContext';
import { ethers } from 'ethers';

export default function AdminDashboard() {
  const { address, isAdmin, isLoggedIn, token, loading: walletLoading } = useWallet();
  const { showToast } = useToast();
  const [elections, setElections] = useState<any[]>([]);
  const [voterRequests, setVoterRequests] = useState<any[]>([]);
  const [protocolEvents, setProtocolEvents] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit'>('overview');

  const getAdminHeaders = async (action: string) => {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const message = `Admin Action: ${action} at ${Date.now()}`;
    const signature = await signer.signMessage(message);
    return {
      'X-Signature': signature,
      'X-Message': message
    };
  };

  useEffect(() => {
    if (isAdmin && isLoggedIn && token) {
      const fetchData = async () => {
        try {
          const [electionData, requestData, eventData] = await Promise.all([
            getElections(),
            getPendingVoters(token),
            getProtocolEvents()
          ]);
          setElections(electionData);
          setVoterRequests(requestData);
          setProtocolEvents(eventData);
        } catch (err) {
          console.error("Fetch error", err);
        }
      };
      fetchData();
      const interval = setInterval(fetchData, 8000); // Poll every 8s
      return () => clearInterval(interval);
    }
  }, [isAdmin, isLoggedIn, token, refresh, showToast]);

  if (walletLoading) return <div className="p-12 text-center text-gray-400">Verifying Admin Status...</div>;
  if (!address || !isAdmin) return <AdminAccessDenied />;

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black dark:text-white font-outfit">Admin Control Center</h1>
           <p className="text-gray-500 mt-1">Manage infrastructure, candidates, and election protocols.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-900 border border-indigo-100 dark:border-indigo-800 rounded-2xl shadow-sm">
           <ShieldCheck className="w-5 h-5 text-indigo-600" />
           <span className="text-sm font-bold dark:text-white">Authenticated: {address.slice(0, 6)}...</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 p-1.5 bg-gray-100 dark:bg-voter-dark-paper/50 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'overview' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Monitor className="w-4 h-4" />
          Dashboard Overview
        </button>
        <button 
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'audit' ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <History className="w-4 h-4" />
          Full Audit Log
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fadeIn">
          <div className="xl:col-span-1 space-y-8">
            <CreateElectionForm onSuccess={() => setRefresh(r => r + 1)} getHeaders={getAdminHeaders} />
            <AddCandidateForm elections={elections} onSuccess={() => setRefresh(r => r + 1)} getHeaders={getAdminHeaders} />
            <ManualWhitelistForm onSuccess={() => setRefresh(r => r + 1)} token={token!} />
            <PendingVoterRequests requests={voterRequests} token={token!} onRefresh={() => setRefresh(r => r + 1)} />
          </div>

          <div className="xl:col-span-2 space-y-8">
            <ElectionsTable elections={elections} onRefresh={() => setRefresh(r => r + 1)} getHeaders={getAdminHeaders} />
            <EventsLog events={protocolEvents} />
          </div>
        </div>
      ) : (
        <div className="animate-fadeIn">
          <AuditLogFullView events={protocolEvents} />
        </div>
      )}
    </div>
  );
}

function AuditLogFullView({ events }: { events: any[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-8 border-b dark:border-gray-800 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold dark:text-white">Full Protocol History</h3>
          <p className="text-sm text-gray-500">A permanent record of all administrative and system actions.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase font-black tracking-widest text-gray-400">
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Timestamp</th>
              <th className="px-8 py-4">Action / Event Message</th>
              <th className="px-8 py-4">Log Level</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-800">
            {events.map((event, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                <td className="px-8 py-5">
                  <div className={`w-3 h-3 rounded-full ${
                    event.type === 'success' ? 'bg-green-500 shadow-lg shadow-green-500/20' : 
                    event.type === 'error' ? 'bg-red-500' : 
                    event.type === 'process' ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
                  }`} />
                </td>
                <td className="px-8 py-5 text-sm font-mono text-gray-400">{event.timestamp}</td>
                <td className="px-8 py-5 font-bold dark:text-white text-sm">{event.message}</td>
                <td className="px-8 py-5 text-right">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    event.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {event.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreateElectionForm({ onSuccess, getHeaders }: any) {
  const [loading, setLoading] = useState(false);
  const { showToast, dismissToast } = useToast();
  const [form, setForm] = useState({ title: '', description: '', start_time: '', end_time: '' });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const toastId = showToast('loading', "Creating election on-chain...");
    try {
      const headers = await getHeaders(`Create Election ${form.title}`);
      const start = Math.floor(new Date(form.start_time).getTime() / 1000);
      const end = Math.floor(new Date(form.end_time).getTime() / 1000);
      if (end <= start) throw new Error("End time must be after start time");
      const res = await createElection({ ...form, start_time: start, end_time: end }, headers);
      dismissToast(toastId);
      showToast('success', `Election "${form.title}" created!`, res.tx_hash);
      setForm({ title: '', description: '', start_time: '', end_time: '' });
      onSuccess();
    } catch (err: any) {
      dismissToast(toastId);
      showToast('error', err.response?.data?.error || err.message || "Failed to create election");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
          <Plus className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold dark:text-white">New Election</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Election Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl p-4 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition" />
        <textarea required placeholder="Brief Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl p-4 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition h-24" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-gray-400 ml-2">Starts</label>
            <input required type="datetime-local" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl p-3 text-xs dark:text-white outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-gray-400 ml-2">Ends</label>
            <input required type="datetime-local" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl p-3 text-xs dark:text-white outline-none" />
          </div>
        </div>
        <button disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Broadcast to Network"}
        </button>
      </form>
    </div>
  );
}

function AddCandidateForm({ elections, onSuccess, getHeaders }: any) {
  const [loading, setLoading] = useState(false);
  const { showToast, dismissToast } = useToast();
  const [form, setForm] = useState({ election_id: '', name: '', party: '', bio: '', image_url: '', manifesto: '' });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const toastId = showToast('loading', "Adding candidate to contract...");
    try {
      const headers = await getHeaders(`Add Candidate ${form.name}`);
      const res = await addCandidate({ 
        ...form, 
        election_id: Number(form.election_id) 
      }, headers);
      dismissToast(toastId);
      showToast('success', `Candidate ${form.name} added!`, res.tx_hash);
      setForm({ election_id: '', name: '', party: '', bio: '', image_url: '', manifesto: '' });
      onSuccess();
    } catch (err: any) {
      dismissToast(toastId);
      showToast('error', err.response?.data?.error || "Error adding candidate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center">
          <UserPlus className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold dark:text-white">Register Candidate</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select required value={form.election_id} onChange={e => setForm({...form, election_id: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl p-4 dark:text-white outline-none appearance-none cursor-pointer">
          <option value="">Select Election</option>
          {elections.filter((e: any) => e.status !== 'Ended').map((e: any) => (
            <option key={e.election_id} value={e.election_id}>{e.title}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-4">
          <input required placeholder="Candidate Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl p-4 dark:text-white outline-none" />
          <input required placeholder="Party Name" value={form.party} onChange={e => setForm({...form, party: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl p-4 dark:text-white outline-none" />
        </div>
        <input placeholder="Profile Image URL (Optional)" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl p-4 dark:text-white outline-none" />
        <textarea required placeholder="Short Biography" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl p-4 dark:text-white outline-none h-20" />
        <textarea placeholder="Detailed Manifesto / Goals (Optional)" value={form.manifesto} onChange={e => setForm({...form, manifesto: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl p-4 dark:text-white outline-none h-32" />
        <button disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register Candidate"}
        </button>
      </form>
    </div>
  );
}

function RegisterVoterForm({ getHeaders }: any) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [voterAddress, setVoterAddress] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!voterAddress.startsWith('0x') || voterAddress.length !== 42) {
      showToast('error', "Invalid Ethereum address");
      return;
    }
    setLoading(true);
    showToast('loading', "Whitelisting voter address...");
    try {
      const headers = await getHeaders(`Register Voter ${voterAddress}`);
      const res = await registerVoter({ address: voterAddress }, headers);
      showToast('success', "Voter registered!", res.tx_hash);
      setVoterAddress('');
    } catch (err: any) {
      showToast('error', err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold dark:text-white">Whitelist Voter</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="0x..." value={voterAddress} onChange={e => setVoterAddress(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl p-4 dark:text-white font-mono text-sm outline-none" />
        <button disabled={loading} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Wallet"}
        </button>
      </form>
    </div>
  );
}

function ElectionsTable({ elections, onRefresh, getHeaders }: any) {
  const { showToast, dismissToast } = useToast();
  const [actingId, setActingId] = useState<number | null>(null);

  const handleEnd = async (id: number) => {
    setActingId(id);
    const toastId = showToast('loading', "Terminating election session...");
    try {
      const headers = await getHeaders(`End Election ${id}`);
      await endElection(id, headers);
      dismissToast(toastId);
      showToast('success', "Election session ended.");
      onRefresh();
    } catch (err) {
      dismissToast(toastId);
      showToast('error', "Action denied by network.");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-8 border-b dark:border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
           <Activity className="w-5 h-5 text-blue-500" /> Infrastructure Overview
        </h2>
        <button onClick={onRefresh} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-400">
           <RefreshCcw className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase font-black tracking-widest text-gray-400">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Protocol</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-800">
            {elections.map((election: any) => (
              <tr key={election.election_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition">
                <td className="px-6 py-4 font-mono text-xs text-gray-400">#{election.election_id}</td>
                <td className="px-6 py-4">
                  <p className="font-bold dark:text-white text-sm">{election.title}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    {election.end_time ? new Date(election.end_time * 1000).toLocaleDateString() : 'Syncing...'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    election.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {election.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {election.status === 'Active' && (
                    <button 
                      onClick={() => handleEnd(election.election_id)}
                      disabled={actingId === election.election_id}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                      title="End Election"
                    >
                      {actingId === election.election_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PendingVoterRequests({ requests, token, onRefresh }: any) {
  const [acting, setActing] = useState<string | null>(null);
  const { showToast, dismissToast } = useToast();

  const handleApprove = async (address: string) => {
    setActing(address);
    const toastId = showToast('loading', "Broadcasting voter whitelisting...");
    try {
      await apiApproveVoter(address, token);
      dismissToast(toastId);
      showToast('success', "Voter approved! Whitelisting in progress...");
      onRefresh();
    } catch (err) {
      dismissToast(toastId);
      showToast('error', "Approval failed");
    } finally {
      setActing(null);
    }
  };

  const handleForceApprove = async (address: string) => {
    if (!confirm("Are you sure you want to MANUALLY mark this voter as approved? This will bypass blockchain whitelisting for now.")) return;
    setActing(address);
    try {
      await forceApproveVoter(address, token);
      showToast('success', "Status updated manually!");
      onRefresh();
    } catch (err) {
      showToast('error', "Manual update failed");
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold dark:text-white">Voter Requests</h2>
         </div>
       </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {requests.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">No pending requests</div>
        )}
        {requests.map((req: any) => (
          <div key={req.address} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-between group gap-4">
            <div className="min-w-0 flex-1">
               <div className="flex items-center gap-2 mb-1">
                 <p className="font-bold dark:text-white text-sm truncate">{req.name}</p>
                 <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                    req.status === 'failed' ? 'bg-red-100 text-red-600' : 
                    req.status === 'approving' ? 'bg-blue-100 text-blue-600 animate-pulse' : 
                    'bg-amber-100 text-amber-600'
                 }`}>
                    {req.status}
                 </span>
               </div>
               <p className="text-[10px] font-mono text-gray-400 truncate">{req.address}</p>
               {req.error && (
                 <p className="text-[9px] text-red-400 mt-1 italic line-clamp-1">{req.error}</p>
               )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleForceApprove(req.address)}
                className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition"
                title="Manual Override"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleApprove(req.address)}
                disabled={acting === req.address || req.status === 'approving'}
                className={`p-2 rounded-xl shadow-sm border transition-all ${
                  req.status === 'failed' 
                  ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border-red-100' 
                  : 'bg-white dark:bg-gray-800 text-green-500 hover:text-white hover:bg-green-500 dark:border-gray-700'
                }`}
              >
                {acting === req.address || req.status === 'approving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventsLog({ events }: { events: any[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-800">
       <h3 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2 text-indigo-500">
         <ShieldCheck className="w-5 h-5" /> Live Protocol Events
       </h3>
       <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {events.length === 0 ? (
            <div className="text-center py-12 text-gray-400 italic text-sm">Waiting for incoming protocol events...</div>
          ) : (
            events.map((event, i) => (
              <div key={i} className={`p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center gap-4 text-xs transition-all animate-fadeIn ${i > 0 ? 'opacity-70' : ''}`}>
                 <div className={`w-2.5 h-2.5 rounded-full ${
                    event.type === 'success' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 
                    event.type === 'error' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 
                    event.type === 'process' ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
                 }`} />
                 <span className="font-mono text-gray-400 min-w-[65px]">{event.timestamp}</span>
                 <span className="font-bold dark:text-white flex-1">{event.message}</span>
              </div>
            ))
          )}
       </div>
    </div>
  );
}

function ManualWhitelistForm({ onSuccess, token }: any) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleManual = async () => {
    if (!address) return;
    setLoading(true);
    try {
      await forceApproveVoter(address, token);
      showToast('success', "Voter whitelisted manually!");
      setAddress('');
      onSuccess();
    } catch (err) {
      showToast('error', "Manual whitelisting failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
       <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold dark:text-white">Quick Whitelist</h2>
          <p className="text-[10px] text-gray-500 font-medium">Bypass blockchain wait for emergency approval.</p>
        </div>
      </div>
      <div className="space-y-4">
        <input 
          placeholder="0x... (Voter Wallet Address)" 
          className="w-full bg-gray-50 dark:bg-gray-800 border-none p-4 rounded-xl text-xs font-mono dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button 
          onClick={handleManual}
          disabled={loading || !address}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          Manual Whitelist Approval
        </button>
      </div>
    </div>
  );
}

function AdminAccessDenied() {
  return (
    <div className="max-w-md mx-auto py-20 text-center space-y-8 animate-fadeIn">
       <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50/50 dark:ring-red-950/20">
          <AlertCircle className="w-10 h-10" />
       </div>
       <div className="space-y-4">
          <h1 className="text-3xl font-black dark:text-white">Access Denied</h1>
          <p className="text-gray-500 leading-relaxed italic">"Restricted to authorized administrator credentials only."</p>
       </div>
       <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-3xl border dark:border-gray-700 text-xs text-gray-400 text-left font-mono">
         ERRORCODE: 403_ADMIN_GUARD<br/>
         STATUS: UNAUTHORIZED_WALLET_SIG
       </div>
    </div>
  );
}


