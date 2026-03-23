"use client";
import { useState, useEffect } from 'react';
import { createElection, addCandidate, registerVoter } from '@/lib/api';
import { connectWallet } from '@/lib/web3';

export default function AdminDashboard() {
  const [address, setAddress] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if already connected without prompting
    const ethereum = (window as any).ethereum;
    if (ethereum) {
      ethereum.request({ method: 'eth_accounts' })
        .then((accounts: any) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
          }
          setChecking(false);
        })
        .catch(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  const handleManualConnect = async () => {
    try {
      const { address: addr } = await connectWallet();
      setAddress(addr);
    } catch (err: any) {
      alert(err.message || "Connection failed");
    }
  };

  if (checking) return <div className="p-8 text-center text-gray-500">Initializing...</div>;
  
  if (!address) return (
    <div className="p-8 text-center bg-blue-50 rounded-xl border border-blue-200">
      <h2 className="text-xl font-bold text-blue-800 mb-4">Admin Access Required</h2>
      <p className="text-blue-600 mb-6">Please connect your authorized Admin wallet to manage elections.</p>
      <button 
        onClick={handleManualConnect}
        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
      >
        Connect Admin Wallet
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900 border-b pb-4">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CreateElectionForm />
        <div className="space-y-8">
          <AddCandidateForm />
          <RegisterVoterForm />
        </div>
      </div>
    </div>
  );
}

function CreateElectionForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', start_time: '', end_time: '' });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const start = Math.floor(new Date(form.start_time).getTime() / 1000);
      const end = Math.floor(new Date(form.end_time).getTime() / 1000);
      const res = await createElection({ ...form, start_time: start, end_time: end });
      alert(`Election created! ID: ${res.election_id}`);
      setForm({ title: '', description: '', start_time: '', end_time: '' });
    } catch (err: any) {
      alert(err.response?.data?.error || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-bold mb-4">Create Election</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-lg p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border rounded-lg p-2"></textarea>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input required type="datetime-local" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input required type="datetime-local" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
        </div>
        <button disabled={loading} className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700 transition">
          {loading ? "Creating..." : "Create Election"}
        </button>
      </form>
    </div>
  );
}

function AddCandidateForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ election_id: '', name: '', party: '', bio: '' });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await addCandidate({ ...form, election_id: Number(form.election_id) });
      alert(`Candidate Added! ID: ${res.candidate_id}`);
      setForm({ election_id: '', name: '', party: '', bio: '' });
    } catch (err: any) {
      alert(err.response?.data?.error || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-bold mb-4">Add Candidate</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Election ID</label>
            <input required type="number" value={form.election_id} onChange={e => setForm({...form, election_id: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Party</label>
            <input required type="text" value={form.party} onChange={e => setForm({...form, party: e.target.value})} className="w-full border rounded-lg p-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Name</label>
          <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-lg p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea required value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="w-full border rounded-lg p-2"></textarea>
        </div>
        <button disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg py-2 font-medium hover:bg-indigo-700 transition">
          {loading ? "Adding..." : "Add Candidate"}
        </button>
      </form>
    </div>
  );
}

function RegisterVoterForm() {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerVoter({ address });
      alert(`Voter registered! TX: ${res.tx_hash}`);
      setAddress('');
    } catch (err: any) {
      alert(err.response?.data?.error || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-bold mb-4">Register Voter</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Voter Ethereum Address</label>
          <input required type="text" placeholder="0x..." value={address} onChange={e => setAddress(e.target.value)} className="w-full border rounded-lg p-2" />
        </div>
        <button disabled={loading} className="w-full bg-green-600 text-white rounded-lg py-2 font-medium hover:bg-green-700 transition">
          {loading ? "Registering..." : "Whitelist Voter"}
        </button>
      </form>
    </div>
  );
}
