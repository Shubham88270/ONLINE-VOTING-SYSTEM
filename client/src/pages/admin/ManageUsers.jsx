import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios.jsx';
import Spinner from '../../components/Spinner.jsx';

const emptyUser = () => ({ name: '', email: '', password: '', showPw: false });

export default function ManageUsers() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [rows,       setRows]       = useState([emptyUser()]);
  const [regLoading, setRegLoading] = useState(false);
  const [pwForms,    setPwForms]    = useState({});
  const [tab,        setTab]        = useState('all'); // all | pending

  const fetchUsers = () => {
    setLoading(true);
    api.get('/auth/users')
      .then(({ data }) => setUsers(data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── Approve / Reject ──
  const handleApprove = async (id, name) => {
    try {
      await api.patch(`/auth/users/${id}/approve`);
      toast.success(`✅ ${name} approved!`);
      fetchUsers();
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (id, name) => {
    try {
      await api.patch(`/auth/users/${id}/reject`);
      toast.success(`❌ ${name} rejected`);
      fetchUsers();
    } catch { toast.error('Failed to reject'); }
  };

  // ── Register rows ──
  const addRow    = () => setRows((p) => [...p, emptyUser()]);
  const removeRow = (i) => { if (rows.length > 1) setRows((p) => p.filter((_, idx) => idx !== i)); };
  const updateRow = (i, f, v) => setRows((p) => { const u = [...p]; u[i] = { ...u[i], [f]: v }; return u; });

  const handleRegisterAll = async (e) => {
    e.preventDefault();
    const valid = rows.filter((r) => r.name.trim() && r.email.trim() && r.password.length >= 6);
    if (!valid.length) return toast.error('Fill at least one complete row');
    setRegLoading(true);
    let ok = 0;
    await Promise.all(valid.map(async (r) => {
      try {
        await api.post('/auth/admin/register-user', { name: r.name, email: r.email, password: r.password });
        ok++;
      } catch (err) {
        toast.error(`${r.email}: ${err.response?.data?.message || 'Error'}`);
      }
    }));
    if (ok) { toast.success(`✅ ${ok} user(s) registered!`); setRows([emptyUser()]); fetchUsers(); }
    setRegLoading(false);
  };

  // ── Password reset ──
  const updatePw = (id, f, v) => setPwForms((p) => ({ ...p, [id]: { ...p[id], [f]: v } }));
  const handleSetPw = async (user) => {
    const pw = pwForms[user._id]?.value || '';
    if (pw.length < 6) return toast.error('Min 6 characters');
    try {
      await api.patch(`/auth/users/${user._id}/password`, { password: pw });
      toast.success(`✅ Password updated for ${user.name}`);
      updatePw(user._id, 'value', '');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  if (loading) return <Spinner />;

  const pending  = users.filter((u) => !u.isAdmin && !u.isApproved);
  const filtered = tab === 'pending' ? pending : users;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Users</h1>

      {/* Register Form */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-700 text-lg">👥 Register New Users</h2>
            <p className="text-gray-400 text-sm">Admin-registered users are auto-approved</p>
          </div>
          <button onClick={addRow}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
            + Add User
          </button>
        </div>
        <form onSubmit={handleRegisterAll} className="space-y-2">
          <div className="hidden sm:grid grid-cols-12 gap-2 px-1 text-xs font-medium text-gray-400">
            <p className="col-span-3">Full Name *</p>
            <p className="col-span-4">Email *</p>
            <p className="col-span-4">Password * (min 6)</p>
          </div>
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-lg p-2">
              <div className="col-span-12 sm:col-span-3">
                <input value={row.name} onChange={(e) => updateRow(i, 'name', e.target.value)}
                  placeholder={`Name ${i+1}`}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="col-span-12 sm:col-span-4">
                <input type="email" value={row.email} onChange={(e) => updateRow(i, 'email', e.target.value)}
                  placeholder={`email${i+1}@example.com`}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="col-span-11 sm:col-span-4 relative">
                <input type={row.showPw ? 'text' : 'password'} value={row.password}
                  onChange={(e) => updateRow(i, 'password', e.target.value)}
                  placeholder="Password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-8" />
                <button type="button" onClick={() => updateRow(i, 'showPw', !row.showPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  {row.showPw ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="col-span-1 flex justify-center">
                <button type="button" onClick={() => removeRow(i)} disabled={rows.length === 1}
                  className="text-red-400 hover:text-red-600 disabled:opacity-20 text-lg">✕</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addRow}
            className="w-full border-2 border-dashed border-indigo-300 text-indigo-400 hover:border-indigo-500 hover:text-indigo-600 rounded-lg py-2 text-sm transition">
            + Add another user
          </button>
          <button type="submit" disabled={regLoading}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60">
            {regLoading ? '⏳ Registering...' : '➕ Register Users'}
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-700">All Users ({users.length})</h2>
        <div className="flex gap-2">
          {['all', 'pending'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition ${tab === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t === 'all' ? `All (${users.length})` : `Pending (${pending.length})`}
            </button>
          ))}
        </div>
      </div>

      {pending.length > 0 && tab === 'all' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 mb-3 text-sm text-yellow-700">
          🔔 <strong>{pending.length}</strong> voter(s) pending approval
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 text-left">Voter</th>
              <th className="px-5 py-3 text-left">Voter ID</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Votes</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{u.voterId || '—'}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${u.isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isAdmin ? '👑 Admin' : '👤 User'}
                    </span>
                    {!u.isAdmin && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${u.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {u.isApproved ? '✅ Approved' : '⏳ Pending'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-500">{u.votedElections?.length || 0}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-2">
                    {/* Approve/Reject */}
                    {!u.isAdmin && (
                      <div className="flex gap-1">
                        {!u.isApproved ? (
                          <button onClick={() => handleApprove(u._id, u.name)}
                            className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition font-medium">
                            ✅ Approve
                          </button>
                        ) : (
                          <button onClick={() => handleReject(u._id, u.name)}
                            className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition font-medium">
                            ❌ Revoke
                          </button>
                        )}
                      </div>
                    )}
                    {/* Password reset */}
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <input type={pwForms[u._id]?.show ? 'text' : 'password'}
                          placeholder="New password"
                          value={pwForms[u._id]?.value || ''}
                          onChange={(e) => updatePw(u._id, 'value', e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-indigo-400 pr-6" />
                        <button type="button" onClick={() => updatePw(u._id, 'show', !pwForms[u._id]?.show)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                          {pwForms[u._id]?.show ? '🙈' : '👁️'}
                        </button>
                      </div>
                      <button onClick={() => handleSetPw(u)}
                        className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition font-medium">
                        Set
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10">No users found.</p>}
      </div>
    </div>
  );
}
