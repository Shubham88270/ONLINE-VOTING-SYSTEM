import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/Spinner.jsx';
import CountdownTimer from '../../components/CountdownTimer.jsx';

// Animated count-up
function CountUp({ target }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let s = 0; const step = target / 60;
    const t = setInterval(() => { s += step; if (s >= target) { setVal(target); clearInterval(t); } else setVal(Math.floor(s)); }, 16);
    return () => clearInterval(t);
  }, [target]);
  return <span>{val}</span>;
}

const glass = { background:'rgba(255,255,255,0.04)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.08)' };

export default function UserHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchElections = useCallback(() => {
    api.get('/elections').then(({ data }) => setElections(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetchElections(); }, [fetchElections]);

  if (loading) return <Spinner />;

  const active  = elections.filter(e => e.isActive);
  const voted   = elections.filter(e => user?.votedElections?.includes(e._id));
  const pending = active.filter(e => !user?.votedElections?.includes(e._id));

  const stats = [
    { label:'Total Elections',  value: elections.length, icon:'🗳️', color:'#6366f1', route:'/dashboard/vote',    hint:'View all elections →'  },
    { label:'Active Elections', value: active.length,    icon:'✅', color:'#10b981', route:'/dashboard/vote',    hint:'Vote now →'            },
    { label:'My Votes Cast',    value: voted.length,     icon:'📊', color:'#f59e0b', route:'/dashboard/results', hint:'View my results →'     },
  ];

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background:'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))', border:'1px solid rgba(99,102,241,0.3)' }}>
        {/* Animated bg orbs */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 animate-pulse-glow"
          style={{ background:'radial-gradient(circle, #6366f1, transparent)', transform:'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-20 w-24 h-24 rounded-full opacity-10 animate-float"
          style={{ background:'radial-gradient(circle, #8b5cf6, transparent)' }} />

        <div className="relative z-10 flex items-center gap-4">
          <motion.div whileHover={{ scale:1.1, rotate:5 }}
            className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </motion.div>
          <div>
            <motion.h1 initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }}
              className="text-xl font-bold text-white">Welcome back, {user?.name}! 👋</motion.h1>
            <motion.p initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}
              className="text-indigo-300 text-sm mt-0.5">
              Voter ID: <span className="font-mono text-white">{user?.voterId}</span>
            </motion.p>
            <motion.span initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3 }}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full mt-1.5 font-medium"
              style={user?.isApproved
                ? { background:'rgba(16,185,129,0.2)', border:'1px solid rgba(16,185,129,0.3)', color:'#6ee7b7' }
                : { background:'rgba(245,158,11,0.2)', border:'1px solid rgba(245,158,11,0.3)', color:'#fcd34d' }}>
              {user?.isApproved ? '✅ Verified Voter' : '⏳ Pending Approval'}
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: 0.1 + i*0.08, duration:0.5, ease:[0.22,1,0.36,1] }}
            whileHover={{ y:-4, scale:1.02 }}
            whileTap={{ scale:0.97 }}
            onClick={() => navigate(s.route)}
            className="rounded-2xl p-5 flex items-center gap-4 cursor-pointer stat-card-3d relative overflow-hidden group"
            style={glass}>

            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
              style={{ background:`radial-gradient(circle at 30% 50%, ${s.color}12, transparent 70%)` }} />

            <motion.div whileHover={{ rotate:10, scale:1.15 }}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 relative z-10"
              style={{ background:`${s.color}20`, border:`1px solid ${s.color}30` }}>
              {s.icon}
            </motion.div>

            <div className="relative z-10 flex-1">
              <p className="text-2xl font-bold text-white"><CountUp target={s.value} /></p>
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="text-xs mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ color: s.color }}>{s.hint}</p>
            </div>

            {/* Arrow */}
            <motion.span
              initial={{ x: -4, opacity: 0 }}
              whileHover={{ x: 0, opacity: 1 }}
              className="text-slate-600 group-hover:text-slate-400 transition-all text-sm relative z-10">
              →
            </motion.span>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-60 transition-opacity rounded-b-2xl"
              style={{ background:`linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />
          </motion.div>
        ))}
      </div>

      {/* Pending vote alert */}
      {pending.length > 0 && user?.isApproved && (
        <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.4 }}
          className="flex items-center gap-3 px-5 py-3 rounded-xl"
          style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)' }}>
          <motion.span animate={{ scale:[1,1.2,1] }} transition={{ repeat:Infinity, duration:2 }} className="text-xl">🔔</motion.span>
          <p className="text-amber-300 text-sm font-medium">
            You have <strong>{pending.length}</strong> active election(s) waiting for your vote!
          </p>
          <Link to="/dashboard/vote" className="ml-auto text-xs px-3 py-1 rounded-lg font-medium text-amber-300 transition"
            style={{ background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.25)' }}>
            Vote Now →
          </Link>
        </motion.div>
      )}

      {!user?.isApproved && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          className="flex items-center gap-3 px-5 py-4 rounded-xl"
          style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)' }}>
          <span className="text-2xl">⏳</span>
          <div>
            <p className="text-amber-300 font-semibold text-sm">Account Pending Approval</p>
            <p className="text-amber-600 text-xs mt-0.5">Your account is under review. You can vote once admin approves it.</p>
          </div>
        </motion.div>
      )}

      {/* Active Elections */}
      <div>
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
          className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Active Elections</h2>
          <Link to="/dashboard/vote" className="text-xs text-indigo-400 hover:text-indigo-300 transition">View all →</Link>
        </motion.div>

        {active.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
            className="text-center py-14 rounded-2xl" style={glass}>
            <motion.p animate={{ y:[0,-8,0] }} transition={{ repeat:Infinity, duration:3 }} className="text-4xl mb-3">🗳️</motion.p>
            <p className="text-slate-400 font-medium">No active elections right now</p>
            <p className="text-slate-600 text-sm mt-1">Check back later</p>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map((e, i) => {
              const hasVoted = user?.votedElections?.includes(e._id);
              return (
                <motion.div key={e._id}
                  initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: 0.5 + i*0.08 }}
                  whileHover={{ y:-3 }}
                  className="rounded-2xl p-5 flex flex-col justify-between card-3d-subtle"
                  style={glass}>
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-200 flex-1 pr-2">{e.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#6ee7b7' }}>
                        🟢 Active
                      </span>
                    </div>
                    {e.description && <p className="text-sm text-slate-500 mb-2">{e.description}</p>}
                    <p className="text-xs text-slate-600 mb-1">{e.candidates.length} candidates</p>
                    <CountdownTimer endDate={e.endDate} isActive={e.isActive} onExpire={fetchElections} />
                  </div>

                  <div className="flex gap-2 mt-4">
                    {hasVoted ? (
                      <motion.span whileHover={{ scale:1.02 }}
                        className="flex-1 text-center py-2 rounded-xl text-sm font-semibold"
                        style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#6ee7b7' }}>
                        ✅ Voted
                      </motion.span>
                    ) : !user?.isApproved ? (
                      <span className="flex-1 text-center py-2 rounded-xl text-sm font-medium text-slate-600"
                        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                        ⏳ Pending
                      </span>
                    ) : (
                      <motion.div whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} className="flex-1">
                        <Link to={`/dashboard/vote/${e._id}`}
                          className="block text-center py-2 rounded-xl text-sm font-semibold text-white btn-3d"
                          style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow:'0 4px 15px rgba(99,102,241,0.3)' }}>
                          🗳️ Vote Now
                        </Link>
                      </motion.div>
                    )}
                    <motion.div whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} className="flex-1">
                      <Link to={`/dashboard/results/${e._id}`}
                        className="block text-center py-2 rounded-xl text-sm font-medium transition"
                        style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8' }}>
                        📊 Results
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
