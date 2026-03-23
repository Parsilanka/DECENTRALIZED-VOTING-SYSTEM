"use client";
import { useState } from 'react';
import { createVoteTransaction } from '@/lib/web3';
import { relayVote } from '@/lib/api';

export default function VoteButton({ electionId, candidateId, disabled }: { electionId: number, candidateId: number, disabled: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleVote = async () => {
    setLoading(true);
    try {
      const txHash = await createVoteTransaction(electionId, candidateId);
      alert(`Vote transaction submitted!\nTx Hash: ${txHash}`);
    } catch (err: any) {
      alert(err.message || "Failed to submit vote");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleVote} 
      disabled={disabled || loading}
      className={`w-full py-3 rounded-lg font-medium text-white transition-all shadow-sm ${disabled || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
    >
      {loading ? "Confirming..." : "Cast Vote"}
    </button>
  );
}
