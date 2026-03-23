"use client";
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getResults } from '@/lib/api';

export default function ResultsChart({ electionId }: { electionId: number }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await getResults(electionId);
        setData(res);
      } catch (err) {
        console.error(err);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [electionId]);

  if (!data) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl w-full"></div>;

  const totalVotes = data.candidates.reduce((sum: number, c: any) => sum + Number(c.voteCount), 0);
  const winner = !data.active ? [...data.candidates].sort((a,b) => b.voteCount - a.voteCount)[0] : null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Live Results</h2>
          <p className="text-gray-500 text-sm">Total Votes: {totalVotes}</p>
        </div>
        {!data.active && winner && (
          <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200">
            Winner: <span className="font-bold">{winner.name}</span> ({winner.voteCount} votes)
          </div>
        )}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.candidates} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
            <Tooltip 
              cursor={{fill: '#f3f4f6'}}
              formatter={(value: any) => [`${value} votes`, 'Votes']}
            />
            <Bar dataKey="voteCount" radius={[0, 4, 4, 0]} barSize={32}>
              {data.candidates.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.id === winner?.id ? '#eab308' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
