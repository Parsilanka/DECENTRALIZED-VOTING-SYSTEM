"use client";
import { useParams } from 'next/navigation';
import ResultsChart from '@/components/ResultsChart';

export default function ResultsPage() {
  const params = useParams();
  const id = Number(params.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 border-b pb-4">
        Election Results Tracker
      </h1>
      <ResultsChart electionId={id} />
    </div>
  );
}
