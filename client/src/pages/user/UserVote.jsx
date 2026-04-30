import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import Spinner from '../../components/Spinner.jsx';
import CountdownTimer from '../../components/CountdownTimer.jsx';

export default function UserVote() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchElections = () => {
    api.get('/elections')
      .then(({ data }) => setElections(data.filter((e) => e.isActive)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchElections(); }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Vote</h1>
      {elections.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">🗳️</p>
          <p>No active elections right now.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {elections.map((e) => {
            const hasVoted = user?.votedElections?.includes(e._id);
            return (
              <div key={e._id} className="bg-white rounded-xl shadow p-5">
                <h2 className="font-semibold text-gray-800 mb-1">{e.title}</h2>
                {e.description && <p className="text-sm text-gray-500 mb-3">{e.description}</p>}
                <p className="text-xs text-gray-400 mb-2">{e.candidates.length} candidates</p>
                <CountdownTimer endDate={e.endDate} isActive={e.isActive} onExpire={fetchElections} />
                {hasVoted ? (
                  <div className="flex gap-2">
                    <span className="flex-1 text-center bg-green-50 text-green-700 py-2 rounded-lg text-sm font-semibold border border-green-200">
                      🔒 Already Voted
                    </span>
                    <Link to={`/dashboard/results/${e._id}`}
                      className="flex-1 text-center bg-indigo-50 text-indigo-600 py-2 rounded-lg text-sm font-medium border border-indigo-200 hover:bg-indigo-100 transition">
                      📊 Results
                    </Link>
                  </div>
                ) : (
                  <Link to={`/dashboard/vote/${e._id}`}
                    className="block text-center bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                    🗳️ Vote Now →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
