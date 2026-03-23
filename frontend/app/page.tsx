"use client";
import { useEffect, useState } from 'react';
import ElectionCard from '@/components/ElectionCard';
import { getElections } from '@/lib/api';

export default function Home() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getElections().then(data => {
      setElections(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="text-center py-12 px-4 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Secure & Transparent Voting</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Participate in active elections seamlessly. Your vote is recorded on the Ethereum blockchain ensuring tamper-proof results.
          </p>
        </div>
      </section>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">🗳️</span> 
          Active Elections
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>)}
          </div>
        ) : elections.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No elections found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election: any) => (
              <ElectionCard key={election.election_id} election={election} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
