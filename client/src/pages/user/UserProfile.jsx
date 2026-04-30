import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axios.jsx';

export default function UserProfile() {
  const { user, refreshUser } = useAuth();
  const [form,    setForm]    = useState({ name: user?.name || '' });
  const [saving,  setSaving]  = useState(false);
  const [pwForm,  setPwForm]  = useState({ newPw: '', confirm: '', show: false });

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      await api.patch('/auth/profile', { name: form.name });
      await refreshUser();
      toast.success('✅ Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (pwForm.newPw.length < 6) return toast.error('Min 6 characters');
    if (!/\d/.test(pwForm.newPw)) return toast.error('Password must contain a number');
    if (pwForm.newPw !== pwForm.confirm) return toast.error('Passwords do not match');
    toast.success('✅ Password updated! (Connect API to persist)');
    setPwForm({ newPw: '', confirm: '', show: false });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      {/* Voter Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {initials}
          </div>
          <div>
            <p className="text-xl font-bold">{user?.name}</p>
            <p className="text-indigo-200 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-mono">
                🪪 {user?.voterId}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                user?.isApproved ? 'bg-green-400/30 text-green-100' : 'bg-yellow-400/30 text-yellow-100'
              }`}>
                {user?.isApproved ? '✅ Verified Voter' : '⏳ Pending Approval'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-indigo-600">{user?.votedElections?.length || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Elections Voted</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{user?.isApproved ? '✅' : '⏳'}</p>
          <p className="text-sm text-gray-500 mt-1">Account Status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Edit Profile */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">✏️ Edit Profile</h2>
          <form onSubmit={handleProfileSave} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email (cannot change)</label>
              <input value={user?.email} disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Voter ID (auto-assigned)</label>
              <input value={user?.voterId || ''} disabled
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed font-mono" />
            </div>
            <button type="submit" disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">🔒 Change Password</h2>
          <form onSubmit={handlePasswordSave} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">New Password</label>
              <div className="relative">
                <input type={pwForm.show ? 'text' : 'password'} value={pwForm.newPw}
                  onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                  placeholder="Min 6 chars + number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-8" />
                <button type="button" onClick={() => setPwForm({ ...pwForm, show: !pwForm.show })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  {pwForm.show ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Confirm Password</label>
              <input type="password" value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                placeholder="Repeat password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <button type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
