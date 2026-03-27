"use client";
import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Vote, 
  ChevronRight, 
  Activity,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { getElections } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function ResultsDirectoryPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const data = await getElections();
        setElections(data);
      } catch (err) {
        showToast('error', "Failed to load elections directory");
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  const filtered = elections.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <DirectorySkeleton />;

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8">
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="space-y-2">
           <h1 className="text-4xl md:text-5xl font-black dark:text-white font-outfit">Results Archive</h1>
           <p className="text-gray-500 max-w-md">Browse all ongoing and past elections to view their real-time results and participation audit.</p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search elections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition shadow-inner dark:text-white"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.length === 0 ? (
          <div className="col-span-full py-24 text-center space-y-4">
             <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <Search className="w-10 h-10" />
             </div>
             <p className="text-gray-500 font-medium">No elections found matching your search.</p>
          </div>
        ) : (
          filtered.map((election) => (
            <Link 
              key={election.election_id}
              href={`/results/${election.election_id}`}
              className="group bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-xl border border-transparent hover:border-blue-500/30 transition-all duration-300 transform hover:-translate-y-2 flex flex-col justify-between"
            >
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                   <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                      <Trophy className="w-6 h-6" />
                   </div>
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                     election.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                   }`}>
                     {election.status}
                   </span>
                 </div>
                 
                 <div className="space-y-2">
                   <h3 className="text-xl font-black dark:text-white leading-tight group-hover:text-blue-600 transition-colors">
                     {election.title}
                   </h3>
                   <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                     <Calendar className="w-3 h-3" />
                     Ends {new Date(election.end_time * 1000).toLocaleDateString()}
                   </div>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t dark:border-gray-800 flex items-center justify-between">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center" />
                    ))}
                    <span className="ml-4 text-[10px] font-bold text-gray-400 flex items-center gap-1">
                       <Users className="w-3 h-3" /> Multiple Candidates
                    </span>
                 </div>
                 <div className="text-blue-600 transition-transform group-hover:translate-x-1">
                    <ChevronRight className="w-6 h-6" />
                 </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function DirectorySkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8 animate-pulse">
       <div className="h-48 w-full bg-gray-200 dark:bg-gray-800 rounded-[2.5rem]" />
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-[2rem]" />
          ))}
       </div>
    </div>
  );
}
