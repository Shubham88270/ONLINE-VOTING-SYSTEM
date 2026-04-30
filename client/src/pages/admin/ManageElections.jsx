import React, { useEffect, useState } from 'react';
import api from '../../api/axios.jsx';
import Spinner from '../../components/Spinner.jsx';
import CountdownTimer from '../../components/CountdownTimer.jsx';

const SYMBOLS = ['🌸', '⭐', '🦁', '🌙', '🔥', '🌊', '🦅', '🌿', '⚡', '🎯', '🏆', '🎪', '🌺', '🦋', '🐯', '🌻', '🍀', '🦚', '🌈', '🎖️'];

const emptyCandidate = (index) => ({
  name: '',
  description: '',
  symbol: SYMBOLS[index % SYMBOLS.length],
});

export default function ManageElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', endDate: '' });
  const [candidates, setCandidates] = useState([emptyCandidate(0), emptyCandidate(1)]);

  // fetchElections — loading sirf pehli baar dikhao, refresh pe nahi
  const fetchElections = (showLoader = false) => {
    if (showLoader) setLoading(true);
    api.get('/elections')
      .then(({ data }) => setElections(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchElections(true); }, []);

  const addCandidate = () => {
    setCandidates((prev) => [...prev, emptyCandidate(prev.length)]);
  };

  const removeCandidate = (i) => {
    if (candidates.length <= 2) return;
    setCandidates((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateCandidate = (i, field, value) => {
    setCandidates((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg('');

    if (!form.title.trim()) return setMsg('❌ Election title is required');
    const valid = candidates.filter((c) => c.name.trim());
    if (valid.length < 2) return setMsg('❌ At least 2 candidates are required');
    if (form.endDate && new Date(form.endDate) <= new Date())
      return setMsg('❌ End date must be in the future');

    setCreating(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        ...(form.endDate ? { endDate: form.endDate } : {}),
      };

      const { data: election } = await api.post('/elections', payload);

      await Promise.all(
        valid.map((c) =>
          api.post(`/elections/${election._id}/candidates`, {
            name:        `${c.symbol} ${c.name}`,
            description: c.description,
          })
        )
      );

      // Reset form
      setForm({ title: '', description: '', endDate: '' });
      setCandidates([emptyCandidate(0), emptyCandidate(1)]);

      // Success message with election name
      setMsg(`✅ Election "${payload.title}" created successfully with ${valid.length} candidates!`);
      fetchElections(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Something went wrong';
      setMsg(`❌ ${errMsg}`);
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id) => {
    await api.patch(`/elections/${id}/toggle`);
    fetchElections(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this election?')) return;
    await api.delete(`/elections/${id}`);
    fetchElections(false);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Elections</h1>

      {/* ── Create Election Form ── */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="font-semibold text-gray-700 text-lg mb-5">🗳️ Create New Election</h2>
        <form onSubmit={handleCreate} className="space-y-5">

          {/* Election Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Election Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Student Council Election 2026"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Description (optional)</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Vote for your class representative"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">End Date & Time *</label>
              <input
                type="datetime-local"
                value={form.endDate}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <p className="text-xs text-gray-400 mt-0.5">Election auto-closes at this time</p>
            </div>
          </div>

          {/* Candidates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-gray-500">
                Candidates <span className="text-indigo-500">({candidates.length} added)</span>
              </label>
              <button
                type="button"
                onClick={addCandidate}
                className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                + Add Candidate
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {candidates.map((c, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2">

                  {/* Row number */}
                  <span className="text-xs text-gray-400 font-bold w-5 text-center">{i + 1}</span>

                  {/* Symbol picker */}
                  <select
                    value={c.symbol}
                    onChange={(e) => updateCandidate(i, 'symbol', e.target.value)}
                    className="border border-gray-300 rounded-lg px-1 py-1.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 w-14 text-center"
                  >
                    {SYMBOLS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  {/* Candidate Name */}
                  <input
                    value={c.name}
                    onChange={(e) => updateCandidate(i, 'name', e.target.value)}
                    placeholder={`Candidate ${i + 1} name`}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />

                  {/* Party / Description */}
                  <input
                    value={c.description}
                    onChange={(e) => updateCandidate(i, 'description', e.target.value)}
                    placeholder="Party / Info (optional)"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeCandidate(i)}
                    disabled={candidates.length <= 2}
                    className="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed text-lg px-1 transition"
                    title="Remove candidate"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Add more hint */}
            <button
              type="button"
              onClick={addCandidate}
              className="mt-2 w-full border-2 border-dashed border-indigo-300 text-indigo-400 hover:border-indigo-500 hover:text-indigo-600 rounded-lg py-2 text-sm transition"
            >
              + Click to add more candidates
            </button>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={creating}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60 flex items-center gap-2"
            >
              {creating ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating...
                </>
              ) : '🗳️ Create Election'}
            </button>
            {msg && (
              <div className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg ${
                msg.startsWith('✅')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-600 border border-red-200'
              }`}>
                {msg}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* ── Elections List ── */}
      <h2 className="font-semibold text-gray-700 mb-3">All Elections</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Election</th>
              <th className="px-5 py-3 text-left">Candidates</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {elections.map((e) => (
              <tr key={e._id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-800">{e.title}</p>
                  {e.description && <p className="text-xs text-gray-400 mt-0.5">{e.description}</p>}
      <CountdownTimer endDate={e.endDate} isActive={e.isActive} onExpire={() => fetchElections(false)} />
                </td>
                <td className="px-5 py-3 text-gray-500">{e.candidates.length}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    e.isActive && !(e.endDate && new Date(e.endDate) < new Date())
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {e.isActive && !(e.endDate && new Date(e.endDate) < new Date())
                      ? '🟢 Active'
                      : '🔴 Closed'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleToggle(e._id)}
                      className="text-xs px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition">
                      {e.isActive ? 'Close' : 'Open'}
                    </button>
                    <button onClick={() => handleDelete(e._id)}
                      className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {elections.length === 0 && (
          <p className="text-center text-gray-400 py-10">No elections yet. Create one above!</p>
        )}
      </div>
    </div>
  );
}
