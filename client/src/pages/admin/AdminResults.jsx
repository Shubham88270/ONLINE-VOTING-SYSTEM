import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios.jsx';
import Spinner from '../../components/Spinner.jsx';

const glass = { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' };

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
  if (error)   return <p className="text-red-400 p-4">{error}</p>;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <h1 className="text-2xl font-bold text-white mb-6">Results</h1>
      <div className="space-y-5">
        {elections.map((election, idx) => {
          const r = results[election._id];
          if (!r) return null;
          const winner = r.results[0];
          return (
            <motion.div
              key={election._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              style={glass}
              className="rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-white">{election.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    election.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-white/5 text-slate-400 border border-white/10'
                  }`}>
                    {election.isActive ? '🟢 Active' : '🔴 Closed'}
                  </span>
                </div>
                <span className="text-sm text-slate-400">
                  Total: <strong className="text-slate-200">{r.totalVotes}</strong>
                </span>
              </div>

              {r.totalVotes > 0 && winner && (
                <div
                  className="rounded-lg px-4 py-2 mb-4 flex items-center gap-2"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
                >
                  <span className="text-xl">🏆</span>
                  <p className="text-sm font-semibold text-blue-300">
                    {winner.name} — {winner.votes} votes ({winner.percentage}%)
                  </p>
                </div>
              )}

              {r.results.length === 0 ? (
                <p className="text-sm text-slate-500">No votes yet.</p>
              ) : (
                <div className="space-y-2">
                  {r.results.map((c, i) => (
                    <div key={c._id} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-5">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-0.5">
                          <span className="font-medium text-slate-200">{c.name}</span>
                          <span className="text-slate-400">{c.votes} ({c.percentage}%)</span>
                        </div>
                        <div
                          className="w-full rounded-full h-2"
                          style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${c.percentage}%`,
                              background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
        {elections.length === 0 && (
          <p className="text-slate-500 text-center py-10">No elections found.</p>
        )}
      </div>
    </motion.div>
  );
}
