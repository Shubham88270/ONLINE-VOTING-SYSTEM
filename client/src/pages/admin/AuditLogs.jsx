import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios.jsx';
import Spinner from '../../components/Spinner.jsx';

const glass = { background:'rgba(255,255,255,0.04)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.08)' };

const ACTION_META = {
  VOTE_CAST:        { icon:'🗳️', color:'#3b82f6', label:'Vote Cast'         },
  USER_APPROVED:    { icon:'✅', color:'#10b981', label:'User Approved'      },
  ELECTION_CREATED: { icon:'➕', color:'#8b5cf6', label:'Election Created'   },
  ELECTION_CLOSED:  { icon:'🔒', color:'#f59e0b', label:'Election Closed'    },
};

export default function AuditLogs() {
  const [logs,    setLogs]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('ALL');

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/votes/audit?page=${p}&limit=50`);
      setLogs(data.logs);
      setTotal(data.total);
      setPage(p);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(1); }, [load]);

  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.action === filter);

  const handleExportCSV = () => {
    const rows = [
      ['Time', 'Action', 'Actor', 'Target', 'IP'],
      ...logs.map(l => [
        new Date(l.createdAt).toLocaleString(),
        l.action,
        l.actor,
        l.target,
        l.ip || '—',
      ]),
    ];
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `audit_log_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-slate-500 text-sm mt-1">Who did what — {total} total events</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Filter buttons */}
          {['ALL', 'VOTE_CAST', 'USER_APPROVED', 'ELECTION_CREATED', 'ELECTION_CLOSED'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
              style={filter === f
                ? { background:'rgba(59,130,246,0.2)', border:'1px solid rgba(59,130,246,0.4)', color:'#93c5fd' }
                : { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#64748b' }}>
              {f === 'ALL' ? 'All' : (ACTION_META[f]?.icon + ' ' + ACTION_META[f]?.label)}
            </button>
          ))}
          <button onClick={handleExportCSV}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
            style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#6ee7b7' }}>
            ⬇️ CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={glass}>
        {loading ? <div className="p-8"><Spinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background:'rgba(255,255,255,0.03)' }}>
                  {['Time', 'Action', 'Actor (Voter ID)', 'Target', 'IP'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => {
                  const meta = ACTION_META[log.action] || { icon:'📋', color:'#94a3b8', label: log.action };
                  return (
                    <motion.tr key={log._id}
                      initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i * 0.02 }}
                      className="border-t hover:bg-white/[0.02] transition-colors"
                      style={{ borderColor:'rgba(255,255,255,0.04)' }}>
                      <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-1.5 text-xs font-semibold w-fit px-2 py-1 rounded-lg"
                          style={{ background:`${meta.color}15`, border:`1px solid ${meta.color}30`, color: meta.color }}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-slate-300 px-2 py-0.5 rounded"
                          style={{ background:'rgba(255,255,255,0.05)' }}>
                          {log.actor}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-400 max-w-xs truncate">{log.target || '—'}</td>
                      <td className="px-5 py-3 text-xs text-slate-600 font-mono">{log.ip || '—'}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-600">
                <p className="text-3xl mb-2">📋</p>
                <p>No audit logs yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 50 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => load(page - 1)} disabled={page === 1}
            className="text-xs px-4 py-2 rounded-lg disabled:opacity-30 text-slate-400 transition"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
            ← Prev
          </button>
          <span className="text-xs text-slate-500 px-3 py-2">Page {page} of {Math.ceil(total/50)}</span>
          <button onClick={() => load(page + 1)} disabled={page >= Math.ceil(total/50)}
            className="text-xs px-4 py-2 rounded-lg disabled:opacity-30 text-slate-400 transition"
            style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
            Next →
          </button>
        </div>
      )}
    </motion.div>
  );
}
