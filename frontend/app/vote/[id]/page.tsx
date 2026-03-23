"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getElection } from '@/lib/api';
import VoteButton from '@/components/VoteButton';

export default function VotePage() {
  const params = useParams();
  const id = Number(params.id);
  const [election, setElection] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);

  useEffect(() => {
    getElection(id).then(setElection).catch(console.error);
  }, [id]);

  if (!election) return <div className="h-96 flex items-center justify-center text-gray-500 text-lg">Loading election...</div>;

  const isActive = election.active && new Date().getTime() / 1000 >= election.startTime;
  const isEnded = !election.active;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
        <div className="bg-blue-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">{election.title}</h1>
          <p className="text-blue-100">{election.description}</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">Select a Candidate</h2>
          
          {isEnded ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mb-6 font-medium">
              This election has ended.
            </div>
          ) : !isActive ? (
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200 mb-6 font-medium">
              This election is not yet active.
            </div>
          ) : null}

          <div className="space-y-4 mb-8">
            {election.candidates?.map((candidate: any) => (
              <label 
                key={candidate.candidate_id} 
                className={`flex items-center justify-between p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedCandidate === candidate.candidate_id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedCandidate === candidate.candidate_id ? 'border-blue-600' : 'border-gray-400'}`}>
                    {selectedCandidate === candidate.candidate_id && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{candidate.name}</h3>
                    <p className="text-sm text-gray-500">{candidate.party} - {candidate.bio}</p>
                  </div>
                </div>
              </label>
            ))}
            
            {(!election.candidates || election.candidates.length === 0) && (
              <p className="text-gray-500">No candidates have been added yet.</p>
            )}
          </div>

          <VoteButton 
            electionId={id} 
            candidateId={selectedCandidate || 0} 
            disabled={!selectedCandidate || !isActive || isEnded} 
          />
        </div>
      </div>
    </div>
  );
}
