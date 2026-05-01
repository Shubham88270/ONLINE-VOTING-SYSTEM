import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/Spinner.jsx';
import CountdownTimer from '../../components/CountdownTimer.jsx';

const glass = { background:'rgba(255,255,255,0.04)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.08)' };

export default function UserVote() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchElections = useCallback(() => {
    api.get('/elections').then(({ data }) => setElections(data.filter(e => e.isActive))).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetchElections(); }, [fetchElections]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="text-2xl font-bold text-white">Vote</h1>
        <p className="text-slate-500 text-sm mt-1">Active elections available for voting</p>
      </motion.div>

      {elections.length === 0 ? (
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.2 }}
          className="text-center py-20 rounded-2xl" style={glass}>
          <motion.p animate={{ y:[0,-10,0] }} transition={{ repeat:Infinity, duration:3 }} className="text-5xl mb-4">🗳️</motion.p>
          <p className="text-slate-400 font-medium text-lg">No active elections</p>
          <p className="text-slate-600 text-sm mt-2">Check back later for upcoming elections</p>
        </motion.div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {elections.map((e, i) => {
            const hasVoted = user?.votedElections?.includes(e._id);
            const totalVotes = e.candidates.reduce((s, c) => s + (c.votes||0), 0);
            return (
              <motion.div key={e._id}
                initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i*0.1, duration:0.5, ease:[0.22,1,0.36,1] }}
                whileHover={{ y:-4 }}
                className="rounded-2xl p-5 card-3d-subtle" style={glass}>

                <div className="flex items-start justify-between mb-3">
                  <h2 className="font-semibold text-slate-200 flex-1 pr-2">{e.title}</h2>
                  <motion.span animate={{ scale:[1,1.05,1] }} transition={{ repeat:Infinity, duration:2 }}
                    className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#6ee7b7' }}>
                    🟢 Active
                  </motion.span>
                </div>

                {e.description && <p className="text-sm text-slate-500 mb-3">{e.description}</p>}

                <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
                  <span>🙋 {e.candidates.length} candidates</span>
                  <span>📊 {totalVotes} votes</span>
                </div>

                <CountdownTimer endDate={e.endDate} isActive={e.isActive} onExpire={fetchElections} />

                <div className="mt-4">
                  {hasVoted ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold"
                        style={{ background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#6ee7b7' }}>
                        <motion.span animate={{ scale:[1,1.2,1] }} transition={{ duration:0.5 }}>✅</motion.span>
                        Already Voted
                      </div>
                      <motion.div whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}>
                        <Link to={`/dashboard/results/${e._id}`}
                          className="block text-center py-2 rounded-xl text-sm font-medium transition"
                          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8' }}>
                          📊 See Results
                        </Link>
                      </motion.div>
                    </div>
                  ) : !user?.isApproved ? (
                    <div className="py-2.5 px-4 rounded-xl text-sm text-center text-slate-600"
                      style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                      ⏳ Pending Approval
                    </div>
                  ) : (
                    <motion.div whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}>
                      <Link to={`/dashboard/vote/${e._id}`}
                        className="block text-center py-3 rounded-xl text-sm font-semibold text-white btn-3d"
                        style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow:'0 4px 20px rgba(99,102,241,0.35)' }}>
                        🗳️ Cast Your Vote →
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
