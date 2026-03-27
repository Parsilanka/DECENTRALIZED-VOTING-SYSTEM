"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, User, CheckCircle2, AlertCircle, ChevronLeft, Loader2, ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';
import { getElection, castVoteAction, checkUserVoted } from '@/lib/api';
import { downloadReceipt } from '@/lib/utils';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/context/ToastContext';

export default function VotePage() {
  const { id } = useParams();
  const router = useRouter();
  const { address, connect, loading: walletLoading } = useWallet();
  const { showToast, dismissToast } = useToast();
  
  const [election, setElection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [lastVote, setLastVote] = useState<{ candidateName: string, txHash: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getElection(Number(id));
        setElection(data);
        
        if (address) {
          try {
            console.log(`Checking voted status for ${address} in election ${id}...`);
            const status = await checkUserVoted(Number(id), address);
            setHasVoted(status.has_voted);
          } catch (voterErr) {
            console.error("Voted status check failed:", voterErr);
            setHasVoted(false); // Assume not voted on network error to allow attempt
          }
        }
      } catch (err) {
        showToast('error', "Failed to load election details.");
        router.push('/');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router, showToast, address]);

  const handleVote = async (candidateId: number) => {
    if (!address) {
      await connect();
      return;
    }

    setVotingId(candidateId);
    showToast('loading', "Preparing your transaction...");

    try {
      const res = await castVoteAction(Number(id), candidateId);
      const votedCandidate = election.candidates.find((c: any) => c.candidate_id === candidateId);
      setLastVote({ candidateName: votedCandidate?.name || "Unknown", txHash: res.tx_hash });
      showToast('success', "Vote cast successfully!", res.tx_hash);
      // Refresh data
      const updated = await getElection(Number(id));
      setElection(updated);
      setHasVoted(true);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Transaction failed";
      showToast('error', msg);
    } finally {
      setVotingId(null);
    }
  };

  if (loading) return <VoteSkeleton />;

  const isEnded = new Date(election.end_time * 1000) <= new Date();

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition group mb-4">
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
        Back to Home
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-outfit font-extrabold text-gray-900 dark:text-white">
              {election.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              {election.description}
            </p>
          </div>
          <CountdownBadge end_time={election.end_time} />
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold dark:text-white flex items-center gap-3">
          Candidates
          <span className="text-sm font-medium text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            {election.candidates.length} Registered
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {election.candidates.map((candidate: any) => (
            <div 
              key={candidate.candidate_id}
              className={`group bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col transition-all duration-300 ${isEnded ? 'opacity-70' : 'hover:border-blue-500 dark:hover:border-blue-400'}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-800 shadow-lg">
                  {candidate.image_url ? (
                    <img src={candidate.image_url} alt={candidate.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10" />
                  )}
                </div>
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
                  {candidate.party || 'Independent'}
                </div>
              </div>

              <h3 className="text-2xl font-bold dark:text-white mb-2">{candidate.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">
                {candidate.bio || "No bio provided for this candidate."}
              </p>

              {candidate.manifesto && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <h4 className="text-[10px] uppercase font-black text-blue-600 dark:text-blue-400 mb-2 tracking-widest">Candidate Manifesto</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 italic">
                    "{candidate.manifesto}"
                  </p>
                </div>
              )}

              {/* Progress Bar */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-400 uppercase tracking-tighter">Current Votes</span>
                  <span className="text-blue-600 dark:text-blue-400">{candidate.vote_count}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-blue-600 transition-all duration-1000" 
                    style={{ width: `${election.total_votes > 0 ? (candidate.vote_count / election.total_votes) * 100 : 0}%` }}
                   />
                </div>
              </div>

              <button
                disabled={isEnded || votingId !== null || hasVoted}
                onClick={() => handleVote(candidate.candidate_id)}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                  isEnded || hasVoted
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10 active:scale-95'
                }`}
              >
                {votingId === candidate.candidate_id ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending to Block...
                  </>
                ) : hasVoted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Already Voted
                  </>
                ) : (
                  <>
                    Cast Your Vote
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {lastVote && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-8 rounded-[2rem] flex flex-wrap items-center justify-between gap-6 animate-fadeIn">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Vote Recorded!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">You successfully voted for <span className="font-bold text-green-600 dark:text-green-400">{lastVote.candidateName}</span></p>
            </div>
          </div>
          <button 
            onClick={() => downloadReceipt(election.title, lastVote.candidateName, lastVote.txHash, address || "0x")}
            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 group"
          >
            <FileText className="w-5 h-5 text-blue-500 transition-transform group-hover:scale-110" />
            Download Official Receipt
          </button>
        </div>
      )}
      
      {/* Alert */}
      {!address && !isEnded && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-3xl flex items-start gap-4">
           <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
           <div>
              <h4 className="font-bold text-amber-800 dark:text-amber-400 uppercase text-xs tracking-widest mb-1">Wallet Not Connected</h4>
              <p className="text-amber-700 dark:text-amber-500 text-sm leading-relaxed">
                You must connect your Authorized MetaMask wallet before you can cast a vote. If you are not whitelisted, please contact the administrator.
              </p>
           </div>
        </div>
      )}
    </div>
  );
}

function CountdownBadge({ end_time }: { end_time: number }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = end_time * 1000 - now;
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
  }, [end_time]);

  return (
    <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800 p-4 md:p-6 rounded-3xl flex flex-col items-center justify-center min-w-[140px]">
       <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
       <div className="text-2xl font-mono font-black text-orange-700 dark:text-orange-300">
         {timeLeft}
       </div>
       <div className="text-[10px] uppercase font-bold text-orange-600/50 dark:text-orange-400/50 tracking-widest">
         Remaining
       </div>
    </div>
  );
}

function VoteSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-full mb-8" />
      <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 rounded-[2.5rem]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      </div>
    </div>
  );
}
