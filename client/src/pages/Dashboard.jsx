import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/elections')
      .then(({ data }) => setElections(data))
      .catch(() => setError('Failed to load elections'))
      .finally(() => setLoading(false));
  }, []);

  const hasVoted = (electionId) =>
    user?.votedElections?.includes(electionId);

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-700 mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">Welcome, {user?.name}. Browse active elections below.</p>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-600 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {elections.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <p className="text-5xl mb-4">🗳️</p>
            <p className="text-lg">No elections available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {elections.map((election) => {
              const voted = user?.votedElections?.includes(election._id);
              return (
                <div
                  key={election._id}
                  className="bg-white rounded-xl shadow p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold text-gray-800">{election.title}</h2>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          election.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {election.isActive ? 'Active' : 'Closed'}
                      </span>
                    </div>
                    {election.description && (
                      <p className="text-gray-500 text-sm mb-3">{election.description}</p>
                    )}
                    <p className="text-sm text-gray-400">
                      {election.candidates.length} candidate(s)
                    </p>
                  </div>

                  <div className="flex gap-3 mt-4">
                    {election.isActive && !voted ? (
                      <Link
                        to={`/dashboard/vote/${election._id}`}
                        className="flex-1 text-center bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                      >
                        Vote Now
                      </Link>
                    ) : (
                      <span className="flex-1 text-center bg-gray-100 text-gray-400 py-2 rounded-lg text-sm font-medium">
                        {voted ? '✓ Voted' : 'Closed'}
                      </span>
                    )}
                    <Link
                      to={`/dashboard/results/${election._id}`}
                      className="flex-1 text-center border border-indigo-600 text-indigo-600 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition"
                    >
                      Results
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
