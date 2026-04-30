import React, { useEffect, useState } from 'react';
import api from '../../api/axios.jsx';
import Spinner from '../../components/Spinner.jsx';

export default function VotesMonitoring() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/elections').then(({ data }) => setElections(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Votes Monitoring</h1>
      <div className="space-y-5">
        {elections.map((election) => {
          const totalVotes = election.candidates.reduce((s, c) => s + (c.votes || 0), 0);
          return (
            <div key={election._id} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">{election.title}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Total: <strong>{totalVotes}</strong> votes</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${election.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {election.isActive ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>

              {election.candidates.length === 0 ? (
                <p className="text-sm text-gray-400">No candidates.</p>
              ) : (
                <div className="space-y-3">
                  {election.candidates
                    .slice()
                    .sort((a, b) => b.votes - a.votes)
                    .map((c, i) => {
                      const pct = totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : 0;
                      return (
                        <div key={c._id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">
                              {i === 0 && totalVotes > 0 ? '🏆 ' : ''}{c.name}
                            </span>
                            <span className="text-gray-500">{c.votes} votes ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${i === 0 ? 'bg-indigo-500' : 'bg-indigo-300'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
        {elections.length === 0 && <p className="text-gray-400 text-center py-10">No elections found.</p>}
      </div>
    </div>
  );
}
