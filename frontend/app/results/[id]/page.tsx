"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { 
  Trophy, 
  Users, 
  Vote, 
  Clock, 
  ExternalLink, 
  ChevronLeft,
  RefreshCcw,
  Share2,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { getResults } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

export default function ResultsPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(0);

  const fetchResults = async (silent = false) => {
    try {
      const results = await getResults(Number(id));
      setData(results);
      setLastUpdated(0);
      if (!silent) setLoading(false);
    } catch (err) {
      if (!silent) showToast('error', "Failed to load results");
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(() => fetchResults(true), 15000);
    const tick = setInterval(() => setLastUpdated(prev => prev + 1), 1000);
    return () => { clearInterval(interval); clearInterval(tick); };
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('success', "Link copied to clipboard!");
  };

  if (loading) return <ResultsSkeleton />;

  const isEnded = new Date(data.end_time * 1000) <= new Date();
  const sortedCandidates = [...data.candidates].sort((a, b) => b.vote_count - a.vote_count);
  const winner = isEnded ? sortedCandidates[0] : null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
          Back to Home
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase font-bold text-gray-400">Live Updates</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
              <RefreshCcw className="w-3 h-3 animate-spin" />
              Updated {lastUpdated}s ago
            </p>
          </div>
          <button 
            onClick={handleShare}
            className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:text-blue-600 transition shadow-sm"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="relative space-y-8">
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${isEnded ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700 animate-pulse'}`}>
              {isEnded ? 'Election Ended' : 'Live Results'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-outfit font-extrabold text-gray-900 dark:text-white max-w-3xl">
            {data.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
             <StatCard label="Total Votes" value={data.total_votes} icon={Vote} color="blue" />
             <StatCard label="Candidates" value={data.candidates.length} icon={Users} color="indigo" />
             <StatCard label="Status" value={isEnded ? "Finalized" : "Collecting"} icon={TrendingUp} color="emerald" />
          </div>
        </div>
      </div>

      {/* Winner Banner */}
      {winner && winner.vote_count > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-1 rounded-[2rem] shadow-xl animate-fadeIn">
           <div className="bg-white dark:bg-gray-900 rounded-[1.8rem] p-8 flex flex-wrap items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-3xl flex items-center justify-center shadow-inner">
                  <Trophy className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-yellow-600 mb-1">Election Winner</h3>
                  <p className="text-4xl font-outfit font-black text-gray-900 dark:text-white">{winner.name}</p>
                  <p className="text-gray-500 font-medium">{winner.party}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-5xl font-black text-yellow-600">{winner.vote_count}</p>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">Total Votes Cast</p>
              </div>
           </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
          <h3 className="text-xl font-bold dark:text-white">Vote Distribution</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.candidates}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="vote_count" radius={[8, 8, 0, 0]}>
                  {data.candidates.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center space-y-6">
           <h3 className="text-xl font-bold dark:text-white self-start">Market Share</h3>
           <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.candidates}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="vote_count"
                >
                  {data.candidates.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
             {data.candidates.map((candidate: any, index: number) => (
               <div key={candidate.name} className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                 <span className="text-xs font-bold text-gray-500">{candidate.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-8 border-b dark:border-gray-800">
          <h3 className="text-xl font-bold dark:text-white">Detailed Standings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase font-black tracking-widest text-gray-400">
                <th className="px-8 py-4">Rank</th>
                <th className="px-8 py-4">Candidate</th>
                <th className="px-8 py-4">Party</th>
                <th className="px-8 py-4 text-right">Votes</th>
                <th className="px-8 py-4 text-right">Percent</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {sortedCandidates.map((c, i) => (
                <tr key={c.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                  <td className="px-8 py-5">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' : 
                      i === 1 ? 'bg-gray-100 text-gray-600' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-400'
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-bold dark:text-white">{c.name}</td>
                  <td className="px-8 py-5 text-sm text-gray-500">{c.party}</td>
                  <td className="px-8 py-5 text-right font-mono font-bold">{c.vote_count}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full text-xs font-black">
                      {data.total_votes > 0 ? ((c.vote_count / data.total_votes) * 100).toFixed(1) : 0}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  };
  return (
    <div className={`p-6 rounded-3xl border flex items-center gap-4 bg-white dark:bg-gray-800/50 shadow-sm ${colors[color].split(' ')[2]}`}>
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
         <Icon className="w-6 h-6" />
       </div>
       <div>
         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
         <p className="text-2xl font-black dark:text-white">{value}</p>
       </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8 animate-pulse">
       <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-full" />
       <div className="h-80 w-full bg-gray-200 dark:bg-gray-800 rounded-[2.5rem]" />
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="h-[450px] bg-gray-200 dark:bg-gray-800 rounded-[2.5rem]" />
         <div className="h-[450px] bg-gray-200 dark:bg-gray-800 rounded-[2.5rem]" />
       </div>
    </div>
  );
}
