"use client";
import { useState, useEffect } from 'react';
import { Clock, Users, Vote, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getElections } from '@/lib/api';

export default function HomePage() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchElections() {
      try {
        const data = await getElections();
        setElections(data);
      } catch (err) {
        console.error("Failed to fetch elections", err);
      } finally {
        setLoading(false);
      }
    }
    fetchElections();
  }, []);

  const activeElections = elections.filter(e => e.status === 'Active' || (new Date(e.end_time * 1000) > new Date()));
  const endedElections = elections.filter(e => e.status === 'Ended' || (new Date(e.end_time * 1000) <= new Date()));

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold border border-blue-100 dark:border-blue-800 animate-fadeIn">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Live on Sepolia Testnet
        </div>
        <h1 className="text-5xl md:text-7xl font-outfit font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
          Transparent. Tamper-proof. <span className="text-blue-600 dark:text-blue-400">On-chain.</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          The future of democracy is here. Secure, verifiable, and decentralized voting powered by Ethereum blockchain and MongoDB.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link href="#active" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2 group">
            Vote Now <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
          <Link href="/results" className="px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-lg hover:border-blue-600 dark:hover:border-blue-400 transition-all">
            View Live Stats
          </Link>
        </div>
      </section>

      {/* Active Elections */}
      <section id="active" className="scroll-mt-24 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold dark:text-white flex items-center gap-3">
             <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
                <Vote className="w-6 h-6" />
             </div>
             Active Elections
          </h2>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            {activeElections.length} Total
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <ElectionSkeleton key={i} />)}
          </div>
        ) : activeElections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeElections.map(election => (
              <ElectionCard key={election.election_id} election={election} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
             <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-gray-400" />
             </div>
             <h3 className="text-xl font-bold dark:text-white mb-2">No active elections found</h3>
             <p className="text-gray-500 max-w-sm mx-auto">Check back later or contact the administrator to create a new voting event.</p>
          </div>
        )}
      </section>

      {/* Ended Elections */}
      {endedElections.length > 0 && (
        <section className="space-y-8 pt-8 border-t dark:border-gray-800">
          <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3 opacity-70">
            Ended Elections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {endedElections.map(election => (
               <ElectionCard key={election.election_id} election={election} grayscale />
             ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ElectionCard({ election, grayscale }: { election: any, grayscale?: boolean }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (grayscale) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = election.end_time * 1000 - now;
      if (distance < 0) {
        setTimeLeft("Ended");
        clearInterval(timer);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [election.end_time, grayscale]);

  return (
    <div className={`group bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${grayscale ? 'opacity-70 saturate-50' : ''}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${grayscale ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
          {grayscale ? 'Ended' : 'Active'}
        </div>
        {!grayscale && (
          <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-mono text-sm font-bold">
            <Clock className="w-4 h-4" />
            {timeLeft}
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 transition">
        {election.title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2">
        {election.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
          <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Candidates</p>
          <div className="flex items-center gap-2 font-bold dark:text-white">
            <Users className="w-4 h-4 text-blue-500" />
            {election.candidate_count || 0}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
          <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Total Votes</p>
          <div className="flex items-center gap-2 font-bold dark:text-white">
            <Vote className="w-4 h-4 text-indigo-500" />
            {election.total_votes || 0}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {!grayscale && (
          <Link href={`/vote/${election.election_id}`} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-center font-bold shadow-lg shadow-blue-500/10 transition">
            Vote Now
          </Link>
        )}
        <Link href={`/results/${election.election_id}`} className={`py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl text-center font-bold transition ${grayscale ? 'w-full' : 'px-4'}`}>
          {grayscale ? 'View Final Results' : <ChevronRight className="w-5 h-5 mx-auto" />}
        </Link>
      </div>
    </div>
  );
}

function ElectionSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full mb-6" />
      <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
      <div className="h-12 w-full bg-gray-100 dark:bg-gray-800/50 rounded-2xl mb-8" />
      <div className="flex gap-3">
        <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
}
