import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/Spinner.jsx';
import CountdownTimer from '../../components/CountdownTimer.jsx';

export default function UserHome() {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchElections = () => {
    api.get('/elections')
      .then(({ data }) => setElections(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchElections(); }, []);

  if (loading) return <Spinner />;

  const active  = elections.filter((e) => e.isActive);
  const voted   = elections.filter((e) => user?.votedElections?.includes(e._id));
  const pending = active.filter((e) => !user?.votedElections?.includes(e._id));

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">Welcome, {user?.name}! 👋</h1>
            <p className="text-indigo-200 text-sm">Voter ID: <span className="font-mono font-semibold text-white">{user?.voterId}</span></p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
              user?.isApproved ? 'bg-green-400/30 text-green-100' : 'bg-yellow-400/30 text-yellow-100'
            }`}>
              {user?.isApproved ? '✅ Verified Voter' : '⏳ Pending Approval'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Elections', value: elections.length, icon: '🗳️', color: 'bg-indigo-500' },
          { label: 'Active Elections', value: active.length,   icon: '✅', color: 'bg-green-500'  },
          { label: 'My Votes Cast',    value: voted.length,    icon: '📊', color: 'bg-pink-500'   },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
            <div className={`${c.color} w-11 h-11 rounded-xl flex items-center justify-center text-xl text-white`}>{c.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending votes notification */}
      {pending.length > 0 && user?.isApproved && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 mb-6 flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <p className="text-yellow-800 text-sm font-medium">
            You have <strong>{pending.length}</strong> active election(s) waiting for your vote!
          </p>
        </div>
      )}

      {!user?.isApproved && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <div>
            <p className="text-orange-800 font-semibold text-sm">Account Pending Approval</p>
            <p className="text-orange-600 text-xs mt-0.5">Your account is under review. You can vote once admin approves it.</p>
          </div>
        </div>
      )}

      {/* Elections */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Active Elections</h2>
      {active.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
          <p className="text-4xl mb-2">🗳️</p>
          <p className="font-medium">Voting is not started yet</p>
          <p className="text-sm mt-1">No active elections at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {active.map((e) => {
            const hasVoted = user?.votedElections?.includes(e._id);
            return (
              <div key={e._id} className="bg-white rounded-xl shadow p-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{e.title}</h3>
                  {e.description && <p className="text-sm text-gray-500 mb-2">{e.description}</p>}
                  <p className="text-xs text-gray-400 mb-1">{e.candidates.length} candidates</p>
                  <CountdownTimer endDate={e.endDate} isActive={e.isActive} onExpire={fetchElections} />
                </div>
                <div className="flex gap-2 mt-4">
                  {hasVoted ? (
                    <span className="flex-1 text-center bg-green-50 text-green-700 py-2 rounded-lg text-sm font-semibold border border-green-200">
                      ✅ You have voted
                    </span>
                  ) : !user?.isApproved ? (
                    <span className="flex-1 text-center bg-gray-100 text-gray-400 py-2 rounded-lg text-sm font-medium">
                      ⏳ Pending Approval
                    </span>
                  ) : (
                    <Link to={`/dashboard/vote/${e._id}`}
                      className="flex-1 text-center bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
                      🗳️ Vote Now
                    </Link>
                  )}
                  <Link to={`/dashboard/results/${e._id}`}
                    className="flex-1 text-center border border-indigo-300 text-indigo-600 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition">
                    📊 Results
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
