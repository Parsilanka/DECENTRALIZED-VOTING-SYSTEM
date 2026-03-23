import Link from 'next/link';

export default function ElectionCard({ election }: { election: any }) {
  const isEnded = !election.active;
  const inProgress = election.active && new Date().getTime() / 1000 >= election.startTime;
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{election.title}</h3>
      <p className="text-sm text-gray-500 mb-4">{election.description || "No description provided."}</p>
      
      <div className="flex justify-between items-center text-sm mb-4">
        <span className={`px-2 py-1 rounded-full ${isEnded ? 'bg-red-100 text-red-700' : inProgress ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {isEnded ? "Ended" : inProgress ? "Active" : "Upcoming"}
        </span>
        <span className="text-gray-600">Candidates: {election.candidates?.length || 0}</span>
      </div>

      <div className="flex gap-2">
        {!isEnded && (
          <Link href={`/vote/${election.election_id}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg font-medium">
            Vote Now
          </Link>
        )}
        <Link href={`/results/${election.election_id}`} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-center py-2 rounded-lg font-medium border border-gray-200">
          View Results
        </Link>
      </div>
    </div>
  );
}
