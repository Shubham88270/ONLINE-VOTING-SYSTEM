import React, { useEffect, useState } from 'react';
import api from '../../api/axios.jsx';
import Spinner from '../../components/Spinner.jsx';
import socket from '../../socket.js';

export default function UserResults() {
  const [elections, setElections] = useState([]);
  const [results,   setResults]   = useState({});
  const [loading,   setLoading]   = useState(true);

  const loadResults = async (elecs) => {
    const res = {};
    await Promise.all(
      elecs.map(async (e) => {
        try {
          const { data } = await api.get(`/votes/results/${e._id}`);
          res[e._id] = data;
        } catch { res[e._id] = { totalVotes: 0, results: [] }; }
      })
    );
    setResults(res);
  };

  useEffect(() => {
    api.get('/elections').then(async ({ data }) => {
      setElections(data);
      await loadResults(data);

      // Join all election rooms for live updates
      socket.connect();
      data.forEach((e) => socket.emit('joinElection', e._id));
    }).finally(() => setLoading(false));

    // Live vote update from server
    socket.on('voteUpdate', ({ electionId, candidates }) => {
      setResults((prev) => {
        const old = prev[electionId];
        if (!old) return prev;
        const totalVotes = candidates.reduce((s, c) => s + c.votes, 0);
        const updated = candidates
          .map((c) => ({ ...c, percentage: totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : '0.0' }))
          .sort((a, b) => b.votes - a.votes);
        return { ...prev, [electionId]: { ...old, totalVotes, results: updated, winner: updated[0] } };
      });
    });

    return () => {
      socket.off('voteUpdate');
      elections.forEach((e) => socket.emit('leaveElection', e._id));
      socket.disconnect();
    };
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Results</h1>
        <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Updates
        </span>
      </div>

      <div className="space-y-5">
        {elections.map((election) => {
          const r = results[election._id];
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

              <div className="space-y-2">
                {r.results.map((c, i) => (
                  <div key={c._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">#{i + 1} {c.name}</span>
                      <span className="text-gray-400">{c.votes} ({c.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${c.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {elections.length === 0 && <p className="text-gray-400 text-center py-10">No elections found.</p>}
      </div>
    </div>
  );
}
