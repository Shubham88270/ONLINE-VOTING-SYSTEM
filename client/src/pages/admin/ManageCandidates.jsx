import React, { useEffect, useState } from 'react';
import api from '../../api/axios.jsx';
import Spinner from '../../components/Spinner.jsx';

export default function ManageCandidates() {
  const [elections, setElections] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [forms,     setForms]     = useState({});
  const [msgs,      setMsgs]      = useState({}); // per-election messages
  // Track which elections are "locked" (candidates finalized)
  const [locked,    setLocked]    = useState({});

  const fetchElections = () => {
    setLoading(true);
    api.get('/elections')
      .then(({ data }) => setElections(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchElections(); }, []);

  const handleAdd = async (electionId) => {
    const f = forms[electionId] || {};
    if (!f.name?.trim()) return;

    try {
      await api.post(`/elections/${electionId}/candidates`, {
        name:        f.name.trim(),
        description: f.description || '',
      });
      setForms((p) => ({ ...p, [electionId]: { name: '', description: '' } }));
      setMsgs((p) => ({ ...p, [electionId]: { type: 'success', text: `✅ Candidate "${f.name}" added!` } }));
      fetchElections();
    } catch (err) {
      setMsgs((p) => ({ ...p, [electionId]: { type: 'error', text: `❌ ${err.response?.data?.message || 'Error adding candidate'}` } }));
    }
  };

  // Lock election — no more candidates can be added
  const handleLock = (electionId, title) => {
    if (!window.confirm(`Lock "${title}"? No more candidates can be added after this.`)) return;
    setLocked((p) => ({ ...p, [electionId]: true }));
    setMsgs((p) => ({ ...p, [electionId]: { type: 'success', text: '🔒 Candidates finalized!' } }));
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Candidates</h1>
      <div className="space-y-5">
        {elections.map((election) => {
          const isLocked = locked[election._id];
          const msg      = msgs[election._id];

          return (
            <div key={election._id} className="bg-white rounded-xl shadow p-5">

              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  🗳️ {election.title}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${election.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {election.isActive ? 'Active' : 'Closed'}
                  </span>
                  {isLocked && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                      🔒 Locked
                    </span>
                  )}
                </h2>
                {/* Lock button */}
                {!isLocked && election.candidates.length >= 2 && (
                  <button
                    onClick={() => handleLock(election._id, election.title)}
                    className="text-xs px-3 py-1 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 transition font-medium"
                  >
                    🔒 Finalize Candidates
                  </button>
                )}
              </div>

              {/* Message */}
              {msg && (
                <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${
                  msg.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {msg.text}
                </div>
              )}

              {/* Candidates list */}
              {election.candidates.length === 0 ? (
                <p className="text-sm text-gray-400 mb-3">No candidates yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {election.candidates.map((c, i) => (
                    <div key={c._id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-bold">#{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{c.name}</p>
                          {c.description && <p className="text-xs text-gray-400">{c.description}</p>}
                        </div>
                      </div>
                      <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                        {c.votes} votes
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add candidate — hidden if locked */}
              {isLocked ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-500 text-center">
                  🔒 Candidates are finalized. No more additions allowed.
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    placeholder="Candidate name *"
                    value={forms[election._id]?.name || ''}
                    onChange={(e) => setForms((p) => ({ ...p, [election._id]: { ...p[election._id], name: e.target.value } }))}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <input
                    placeholder="Description (optional)"
                    value={forms[election._id]?.description || ''}
                    onChange={(e) => setForms((p) => ({ ...p, [election._id]: { ...p[election._id], description: e.target.value } }))}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    onClick={() => handleAdd(election._id)}
                    className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {elections.length === 0 && (
          <p className="text-gray-400 text-center py-10">No elections found. Create one first.</p>
        )}
      </div>
    </div>
  );
}
