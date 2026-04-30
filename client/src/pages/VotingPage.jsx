import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import CountdownTimer from '../components/CountdownTimer.jsx';

export default function VotingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [election,    setElection]    = useState(null);
  const [selected,    setSelected]    = useState('');
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    api.get(`/elections/${id}`)
      .then(({ data }) => setElection(data))
      .catch(() => toast.error('Failed to load election'))
      .finally(() => setLoading(false));
  }, [id]);

  const alreadyVoted = user?.votedElections?.includes(id);

  const handleVoteClick = () => {
    if (!selected) return toast.error('Please select a candidate first');
    setShowConfirm(true);
  };

  const handleConfirmVote = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      await api.post('/votes', { electionId: id, candidateId: selected });
      await refreshUser();
      toast.success('🎉 You have successfully voted!');
      setTimeout(() => navigate(`/dashboard/results/${id}`), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cast vote';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  if (!election) return (
    <div className="text-center py-20 text-gray-400">
      <p className="text-4xl mb-2">❌</p>
      <p>Election not found.</p>
    </div>
  );

  // Not active
  if (!election.isActive) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-2xl shadow p-10 max-w-md text-center">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Voting is Closed</h2>
        <p className="text-gray-500 mb-6">This election has ended.</p>
        <button onClick={() => navigate(`/dashboard/results/${id}`)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition">
          📊 View Results
        </button>
      </div>
    </div>
  );

  // Already voted
  if (alreadyVoted) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-2xl shadow p-10 max-w-md text-center">
        <p className="text-5xl mb-4">✅</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Already Voted!</h2>
        <p className="text-gray-500 mb-2">You have already cast your vote in</p>
        <p className="text-indigo-700 font-semibold mb-6">"{election.title}"</p>
        <p className="text-sm text-gray-400 mb-6">Each voter can only vote once per election.</p>
        <button onClick={() => navigate(`/dashboard/results/${id}`)}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition">
          📊 View Results
        </button>
        <button onClick={() => navigate('/dashboard')}
          className="w-full mt-3 border border-gray-300 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );

  // Not approved
  if (!user?.isApproved) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-2xl shadow p-10 max-w-md text-center">
        <p className="text-5xl mb-4">⏳</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Pending Approval</h2>
        <p className="text-gray-500">Your account is pending admin approval. You cannot vote yet.</p>
      </div>
    </div>
  );

  const selectedCandidate = election.candidates.find((c) => c._id === selected);

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="bg-white rounded-xl shadow p-5 mb-5">
        <h1 className="text-2xl font-bold text-indigo-700 mb-1">{election.title}</h1>
        {election.description && <p className="text-gray-500 text-sm mb-2">{election.description}</p>}
        <div className="flex items-center gap-3">
          <CountdownTimer endDate={election.endDate} isActive={election.isActive} />
          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
            ⚠️ You can only vote once
          </span>
        </div>
      </div>

      {/* Candidates */}
      <p className="text-sm text-gray-500 mb-3 font-medium">Select a candidate:</p>
      <div className="space-y-3 mb-6">
        {election.candidates.map((c) => (
          <label key={c._id}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
              selected === c._id
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
            }`}>
            <input type="radio" name="candidate" value={c._id}
              checked={selected === c._id}
              onChange={() => setSelected(c._id)}
              className="accent-indigo-600 w-4 h-4" />

            {/* Candidate photo or symbol */}
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
              {c.photo
                ? <img src={c.photo} alt={c.name} className="w-full h-full object-cover" />
                : <span>{c.symbol || '🙋'}</span>
              }
            </div>

            <div className="flex-1">
              <p className="font-semibold text-gray-800">{c.name}</p>
              {c.party && <p className="text-sm text-indigo-600 font-medium">{c.party}</p>}
              {c.description && <p className="text-xs text-gray-400">{c.description}</p>}
            </div>

            {selected === c._id && (
              <span className="text-indigo-600 text-xl font-bold">✓</span>
            )}
          </label>
        ))}
      </div>

      <button onClick={handleVoteClick} disabled={submitting || !selected}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg">
        {submitting ? '⏳ Submitting...' : '🗳️ Cast My Vote'}
      </button>
      <p className="text-center text-xs text-gray-400 mt-2">🔒 Your vote is secure and anonymous</p>

      {/* Confirmation Modal */}
      {showConfirm && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <p className="text-4xl mb-3">🗳️</p>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Your Vote</h3>
            <p className="text-gray-500 text-sm mb-4">You are voting for:</p>
            <div className="bg-indigo-50 rounded-xl p-4 mb-6">
              <p className="text-2xl mb-1">{selectedCandidate.symbol || '🙋'}</p>
              <p className="font-bold text-indigo-700 text-lg">{selectedCandidate.name}</p>
              {selectedCandidate.party && <p className="text-indigo-500 text-sm">{selectedCandidate.party}</p>}
            </div>
            <p className="text-xs text-red-500 mb-5">⚠️ This action cannot be undone. You can only vote once.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleConfirmVote}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition">
                ✅ Confirm Vote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
