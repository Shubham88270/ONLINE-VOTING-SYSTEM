import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../../api/axios.jsx';
import Spinner from '../../components/Spinner.jsx';
import socket from '../../socket.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const glass = { background:'rgba(255,255,255,0.04)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.08)' };
const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444'];

export default function UserResults() {
  const [elections, setElections] = useState([]);
  const [results,   setResults]   = useState({});
  const [loading,   setLoading]   = useState(true);
  const [chartType, setChartType] = useState('bar');

  const loadResults = async (elecs) => {
    const res = {};
    await Promise.all(elecs.map(async e => {
      try { const { data } = await api.get(`/votes/results/${e._id}`); res[e._id] = data; }
      catch { res[e._id] = { totalVotes:0, results:[] }; }
    }));
    setResults(res);
  };

  useEffect(() => {
    api.get('/elections').then(async ({ data }) => {
      setElections(data);
      await loadResults(data);
      socket.connect();
      data.forEach(e => socket.emit('joinElection', e._id));
    }).finally(() => setLoading(false));

    socket.on('voteUpdate', ({ electionId, candidates }) => {
      setResults(prev => {
        const old = prev[electionId];
        if (!old) return prev;
        const total = candidates.reduce((s,c) => s+c.votes, 0);
        const updated = candidates.map(c => ({ ...c, percentage: total > 0 ? ((c.votes/total)*100).toFixed(1) : '0.0' })).sort((a,b) => b.votes-a.votes);
        return { ...prev, [electionId]: { ...old, totalVotes:total, results:updated, winner:updated[0] } };
      });
    });

    return () => { socket.off('voteUpdate'); socket.disconnect(); };
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Results</h1>
          <p className="text-slate-500 text-sm mt-1">Live vote counts across all elections</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.span animate={{ scale:[1,1.1,1] }} transition={{ repeat:Infinity, duration:2 }}
            className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-400">Live</span>
          <div className="flex gap-1 ml-3">
            {['bar','pie'].map(t => (
              <motion.button key={t} whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                onClick={() => setChartType(t)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
                style={chartType === t
                  ? { background:'rgba(99,102,241,0.2)', border:'1px solid rgba(99,102,241,0.4)', color:'#a5b4fc' }
                  : { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#64748b' }}>
                {t === 'bar' ? '📊 Bar' : '🥧 Pie'}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="space-y-5">
        {elections.map((election, idx) => {
          const r = results[election._id];
          if (!r) return null;
          const winner = r.results[0];

          const chartData = {
            labels: r.results.map(c => c.name.length > 12 ? c.name.slice(0,12)+'…' : c.name),
            datasets: [{
              label:'Votes', data: r.results.map(c => c.votes),
              backgroundColor: COLORS.slice(0, r.results.length),
              borderRadius: 8, borderSkipped: false,
            }],
          };
          const chartOpts = {
            responsive:true, maintainAspectRatio:false,
            plugins: { legend:{ display: chartType==='pie', labels:{ color:'#94a3b8', padding:12, font:{size:11} } }, tooltip:{ backgroundColor:'rgba(15,23,42,0.9)', borderColor:'rgba(99,102,241,0.3)', borderWidth:1, titleColor:'#94a3b8', bodyColor:'#e2e8f0', padding:10, cornerRadius:8 } },
            scales: chartType==='bar' ? { x:{ grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#64748b',font:{size:11}} }, y:{ grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#64748b',font:{size:11}}, beginAtZero:true } } : {},
            animation:{ duration:1000, easing:'easeOutQuart' },
          };

          return (
            <motion.div key={election._id}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: idx*0.08, duration:0.5 }}
              className="rounded-2xl p-5" style={glass}>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-white">{election.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
                    election.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-slate-400 border border-white/10'
                  }`}>{election.isActive ? '🟢 Active' : '🔴 Closed'}</span>
                </div>
                <span className="text-sm text-slate-400">Total: <strong className="text-white">{r.totalVotes}</strong></span>
              </div>

              {/* Winner */}
              {r.totalVotes > 0 && winner && (
                <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.2 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
                  style={{ background:'linear-gradient(90deg, rgba(59,130,246,0.1), rgba(99,102,241,0.05))', border:'1px solid rgba(59,130,246,0.2)' }}>
                  <motion.span animate={{ rotate:[0,10,-10,0] }} transition={{ repeat:Infinity, duration:3 }} className="text-2xl">🏆</motion.span>
                  <div>
                    <p className="text-xs text-slate-500">Leading</p>
                    <p className="text-sm font-bold text-blue-300">{winner.name} — {winner.votes} votes ({winner.percentage}%)</p>
                  </div>
                </motion.div>
              )}

              {/* Chart */}
              {r.totalVotes > 0 && (
                <div className="h-48 mb-4">
                  {chartType === 'bar' ? <Bar data={chartData} options={chartOpts} /> : <Pie data={chartData} options={chartOpts} />}
                </div>
              )}

              {/* Progress bars */}
              <div className="space-y-2.5">
                {r.results.map((c, i) => (
                  <div key={c._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-200 flex items-center gap-1.5">
                        {i === 0 && r.totalVotes > 0 && <span className="text-amber-400 text-xs">🏆</span>}
                        {c.name}
                      </span>
                      <span className="text-slate-400">{c.votes} <span className="text-slate-600">({c.percentage}%)</span></span>
                    </div>
                    <div className="w-full rounded-full h-2 progress-3d" style={{ background:'rgba(255,255,255,0.06)' }}>
                      <motion.div initial={{ width:0 }} animate={{ width:`${c.percentage}%` }}
                        transition={{ duration:0.8, delay:idx*0.08+i*0.05, ease:'easeOut' }}
                        className="h-2 rounded-full"
                        style={{ background:`linear-gradient(90deg, ${COLORS[i%COLORS.length]}, ${COLORS[(i+1)%COLORS.length]})` }} />
                    </div>
                  </div>
                ))}
                {r.results.length === 0 && <p className="text-slate-600 text-sm text-center py-4">No votes yet.</p>}
              </div>
            </motion.div>
          );
        })}
        {elections.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <p className="text-4xl mb-3">📊</p><p>No elections found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
