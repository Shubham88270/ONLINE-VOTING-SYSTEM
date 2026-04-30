import React, { useEffect, useState } from 'react';
import api from '../../api/axios.jsx';
import Spinner from '../../components/Spinner.jsx';

export default function AdminResults() {
  const [elections, setElections] = useState([]);
  const [results,   setResults]   = useState({});
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: elecs } = await api.get('/elections');
        setElections(elecs);

        const res = {};
        await Promise.all(
          elecs.map(async (e) => {
            try {
              const { data } = await api.get(`/votes/results/${e._id}`);
              res[e._id] = data;
            } catch {
              res[e._id] = { totalVotes: 0, results: [] };
            }
          })
        );
        setResults(res);
      } catch {
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;
  if (error)   return <p className="text-red-500 p-4">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Results</h1>
      <div className="space-y-5">
        {elections.map((election) => {
          const r      = results[election._id];
          if (!r) return null;
          const winner = r.results[0];
          return (
            <div key={election._id} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-gray-800">{election.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${election.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {election.isActive ? '🟢 Active' : '🔴 Closed'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">Total: <strong>{r.totalVotes}</strong></span>
              </div>

              {r.totalVotes > 0 && winner && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2 mb-4 flex items-center gap-2">
                  <span className="text-xl">🏆</span>
                  <p className="text-sm font-semibold text-indigo-700">
                    {winner.name} — {winner.votes} votes ({winner.percentage}%)
                  </p>
                </div>
              )}

              {r.results.length === 0 ? (
                <p className="text-sm text-gray-400">No votes yet.</p>
              ) : (
                <div className="space-y-2">
                  {r.results.map((c, i) => (
                    <div key={c._id} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-5">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-0.5">
                          <span className="font-medium text-gray-700">{c.name}</span>
                          <span className="text-gray-400">{c.votes} ({c.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${c.percentage}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
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
