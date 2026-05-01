import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios.jsx';
import Spinner from '../../components/Spinner.jsx';

const glass = { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' };

export default function BlockchainExplorer() {
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [expanded, setExpanded] = useState(null);

  const fetchChain = () => {
    setLoading(true);
    setError('');
    api.get('/votes/blockchain')
      .then(({ data }) => setData(data))
      .catch(() => setError('Failed to load blockchain data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchChain(); }, []);

  if (loading) return <Spinner />;
  if (error) return (
    <div className="text-center py-20">
      <p className="text-red-400 mb-4">{error}</p>
      <button
        onClick={fetchChain}
        className="text-white px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #1e40af)', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}
      >
        Retry
      </button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Blockchain Explorer</h1>
          <p className="text-slate-400 text-sm mt-1">Every vote is recorded as a tamper-proof block</p>
        </div>
        <button
          onClick={fetchChain}
          className="text-white px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #1e40af)', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: '⛓️', color: 'linear-gradient(135deg,#6366f1,#4f46e5)', value: data.totalBlocks,     label: 'Total Blocks'    },
          { icon: '🗳️', color: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', value: data.totalBlocks - 1, label: 'Votes Recorded'  },
          {
            icon: data.isValid ? '✅' : '❌',
            color: data.isValid ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)',
            value: data.isValid ? 'Valid' : 'Tampered',
            label: 'Chain Integrity',
          },
        ].map((c) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={glass}
            className="rounded-xl p-5 flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white flex-shrink-0"
              style={{ background: c.color }}
            >
              {c.icon}
            </div>
            <div>
              <p className="text-xl font-bold text-white">{c.value}</p>
              <p className="text-sm text-slate-400">{c.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Banner */}
      <div
        className="rounded-xl px-5 py-3 mb-6 flex items-center gap-3"
        style={
          data.isValid
            ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }
            : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }
        }
      >
        <span className="text-xl">{data.isValid ? '🔒' : '⚠️'}</span>
        <p className={`text-sm font-medium ${data.isValid ? 'text-emerald-400' : 'text-red-400'}`}>
          {data.isValid ? 'Blockchain is valid — all votes are secure' : 'WARNING: Blockchain integrity compromised!'}
        </p>
      </div>

      {/* Blocks */}
      <h2 className="font-semibold text-slate-300 mb-3">Chain Blocks ({data.totalBlocks})</h2>
      <div className="space-y-3">
        {[...data.chain].reverse().map((block, idx) => (
          <motion.div
            key={block.index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.03 }}
            style={glass}
            className="rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === block.index ? null : block.index)}
              className="w-full flex items-center justify-between px-5 py-4 text-left transition rounded-xl"
              style={{ ':hover': { background: 'rgba(255,255,255,0.02)' } }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: block.index === 0 ? 'rgba(148,163,184,0.3)' : 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
                >
                  {block.index}
                </span>
                <div>
                  <p className="font-semibold text-slate-200 text-sm">
                    {block.index === 0 ? '🏁 Genesis Block' : `🗳️ Vote Block #${block.index}`}
                  </p>
                  <p className="text-xs text-slate-500">{new Date(block.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500 hidden sm:block">{block.hash.slice(0, 20)}...</span>
                <span className="text-slate-400 text-sm">{expanded === block.index ? '▲' : '▼'}</span>
              </div>
            </button>

            {expanded === block.index && (
              <div
                className="px-5 py-4 space-y-2 text-xs font-mono"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-slate-500 mb-1 font-sans font-medium text-xs">Block Hash</p>
                  <p className="text-blue-400 break-all">{block.hash}</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-slate-500 mb-1 font-sans font-medium text-xs">Previous Hash</p>
                  <p className="text-slate-400 break-all">{block.previousHash}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-slate-500 mb-1 font-sans font-medium text-xs">Nonce</p>
                    <p className="text-slate-300">{block.nonce}</p>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-slate-500 mb-1 font-sans font-medium text-xs">Timestamp</p>
                    <p className="text-slate-300">{new Date(block.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                {block.voteData?.type !== 'GENESIS' && (
                  <div
                    className="rounded-lg p-3"
                    style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
                  >
                    <p className="text-blue-400 mb-2 font-sans font-medium text-xs">Vote Data</p>
                    <p className="text-slate-400">User: <span className="text-blue-400">{block.voteData.userId}</span></p>
                    <p className="text-slate-400">Election: <span className="text-blue-400">{block.voteData.electionId}</span></p>
                    <p className="text-slate-400">Candidate: <span className="text-blue-400">{block.voteData.candidateId}</span></p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
