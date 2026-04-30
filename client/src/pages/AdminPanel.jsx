import React, { useEffect, useState } from 'react';
import api from '../api/axios.jsx';
import Spinner from '../components/Spinner.jsx';

export default function AdminPanel() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New election form state
  const [newElection, setNewElection] = useState({ title: '', description: '' });
  const [electionMsg, setElectionMsg] = useState('');

  // New candidate form state (per election)
  const [candidateForms, setCandidateForms] = useState({});

  const fetchElections = () => {
    setLoading(true);
    api
      .get('/elections')
      .then(({ data }) => setElections(data))
      .catch(() => setError('Failed to load elections'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchElections(); }, []);

  // Create a new election
  const handleCreateElection = async (e) => {
    e.preventDefault();
    setElectionMsg('');
    if (!newElection.title.trim()) return setElectionMsg('Title is required');
    try {
      await api.post('/elections', newElection);
      setNewElection({ title: '', description: '' });
      setElectionMsg('Election created!');
      fetchElections();
    } catch (err) {
      setElectionMsg(err.response?.data?.message || 'Error creating election');
    }
  };

  // Add candidate to an election
  const handleAddCandidate = async (electionId) => {
    const form = candidateForms[electionId] || {};
    if (!form.name?.trim()) return;
    try {
      await api.post(`/elections/${electionId}/candidates`, {
        name: form.name,
        description: form.description || '',
      });
      setCandidateForms((prev) => ({ ...prev, [electionId]: { name: '', description: '' } }));
      fetchElections();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding candidate');
    }
  };

  // Toggle election active/closed
  const handleToggle = async (electionId) => {
    try {
      await api.patch(`/elections/${electionId}/toggle`);
      fetchElections();
    } catch {
      alert('Failed to toggle election status');
    }
  };

  // Delete election
  const handleDelete = async (electionId) => {
    if (!window.confirm('Delete this election and all its candidates?')) return;
    try {
      await api.delete(`/elections/${electionId}`);
      fetchElections();
    } catch {
      alert('Failed to delete election');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-700 mb-8">Admin Panel</h1>

        {/* Create Election */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Election</h2>
          <form onSubmit={handleCreateElection} className="space-y-3">
            <input
              type="text"
              placeholder="Election title"
              value={newElection.title}
              onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newElection.description}
              onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Create Election
            </button>
            {electionMsg && (
              <p className="text-sm text-indigo-600">{electionMsg}</p>
            )}
          </form>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Elections list */}
        <div className="space-y-6">
          {elections.map((election) => (
            <div key={election._id} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{election.title}</h3>
                  {election.description && (
                    <p className="text-sm text-gray-500">{election.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggle(election._id)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                      election.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {election.isActive ? 'Active' : 'Closed'}
                  </button>
                  <button
                    onClick={() => handleDelete(election._id)}
                    className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Candidates list */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-600 mb-2">Candidates:</p>
                {election.candidates.length === 0 ? (
                  <p className="text-sm text-gray-400">No candidates yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {election.candidates.map((c) => (
                      <li key={c._id} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-400 rounded-full inline-block" />
                        {c.name} {c.description && <span className="text-gray-400">— {c.description}</span>}
                        <span className="ml-auto text-gray-400">{c.votes} votes</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Add candidate form */}
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  placeholder="Candidate name"
                  value={candidateForms[election._id]?.name || ''}
                  onChange={(e) =>
                    setCandidateForms((prev) => ({
                      ...prev,
                      [election._id]: { ...prev[election._id], name: e.target.value },
                    }))
                  }
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={candidateForms[election._id]?.description || ''}
                  onChange={(e) =>
                    setCandidateForms((prev) => ({
                      ...prev,
                      [election._id]: { ...prev[election._id], description: e.target.value },
                    }))
                  }
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={() => handleAddCandidate(election._id)}
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
