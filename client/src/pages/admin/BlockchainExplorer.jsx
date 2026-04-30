import React, { useEffect, useState } from 'react';
import api from '../../api/axios.jsx';
import Spinner from '../../components/Spinner.jsx';

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
  if (error)   return (
    <div className="text-center py-20">
      <p className="text-red-500 mb-4">{error}</p>
      <button onClick={fetchChain} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">Retry</button>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Blockchain Explorer</h1>
          <p className="text-gray-400 text-sm mt-1">Every vote is recorded as a tamper-proof block</p>
        </div>
        <button onClick={fetchChain}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: '⛓️', color: 'bg-indigo-500', value: data.totalBlocks,     label: 'Total Blocks'    },
          { icon: '🗳️', color: 'bg-blue-500',   value: data.totalBlocks - 1, label: 'Votes Recorded'  },
          { icon: data.isValid ? '✅' : '❌', color: data.isValid ? 'bg-green-500' : 'bg-red-500',
            value: data.isValid ? 'Valid' : 'Tampered', label: 'Chain Integrity' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
            <div className={`${c.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white`}>{c.icon}</div>
            <div>
              <p className="text-xl font-bold text-gray-800">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Banner */}
      <div className={`rounded-xl px-5 py-3 mb-6 flex items-center gap-3 ${data.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <span className="text-xl">{data.isValid ? '🔒' : '⚠️'}</span>
        <p className={`text-sm font-medium ${data.isValid ? 'text-green-700' : 'text-red-700'}`}>
          {data.isValid ? 'Blockchain is valid — all votes are secure' : 'WARNING: Blockchain integrity compromised!'}
        </p>
      </div>

      {/* Blocks */}
      <h2 className="font-semibold text-gray-700 mb-3">Chain Blocks ({data.totalBlocks})</h2>
      <div className="space-y-3">
        {[...data.chain].reverse().map((block) => (
          <div key={block.index} className="bg-white rounded-xl shadow border border-gray-100">
            <button
              onClick={() => setExpanded(expanded === block.index ? null : block.index)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 rounded-xl transition"
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${block.index === 0 ? 'bg-gray-400' : 'bg-indigo-500'}`}>
                  {block.index}
                </span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {block.index === 0 ? '🏁 Genesis Block' : `🗳️ Vote Block #${block.index}`}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(block.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-400 hidden sm:block">{block.hash.slice(0, 20)}...</span>
                <span className="text-gray-400 text-sm">{expanded === block.index ? '▲' : '▼'}</span>
              </div>
            </button>

            {expanded === block.index && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-2 text-xs font-mono">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400 mb-1 font-sans font-medium text-xs">Block Hash</p>
                  <p className="text-indigo-600 break-all">{block.hash}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400 mb-1 font-sans font-medium text-xs">Previous Hash</p>
                  <p className="text-gray-600 break-all">{block.previousHash}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-400 mb-1 font-sans font-medium text-xs">Nonce</p>
                    <p className="text-gray-700">{block.nonce}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-400 mb-1 font-sans font-medium text-xs">Timestamp</p>
                    <p className="text-gray-700">{new Date(block.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                {block.voteData?.type !== 'GENESIS' && (
                  <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                    <p className="text-indigo-500 mb-2 font-sans font-medium text-xs">Vote Data</p>
                    <p className="text-gray-600">User: <span className="text-indigo-600">{block.voteData.userId}</span></p>
                    <p className="text-gray-600">Election: <span className="text-indigo-600">{block.voteData.electionId}</span></p>
                    <p className="text-gray-600">Candidate: <span className="text-indigo-600">{block.voteData.candidateId}</span></p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
