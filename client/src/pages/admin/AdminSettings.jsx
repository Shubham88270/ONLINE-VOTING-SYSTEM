import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../api/axios.jsx';

export default function AdminSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  const handleProfile = async (e) => {
    e.preventDefault();
    setMsg('✅ Profile updated! (UI only — connect API if needed)');
  };

  const handlePassword = (e) => {
    e.preventDefault();
    if (pwForm.newPw.length < 6) return setPwMsg('Min 6 characters');
    if (pwForm.newPw !== pwForm.confirm) return setPwMsg('Passwords do not match');
    setPwMsg('✅ Password updated! (UI only — connect API if needed)');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Profile Info</h2>
          <form onSubmit={handleProfile} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
              Save Changes
            </button>
            {msg && <p className="text-sm text-green-600">{msg}</p>}
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Change Password</h2>
          <form onSubmit={handlePassword} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Current Password</label>
              <input type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">New Password</label>
              <input type="password" value={pwForm.newPw} onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Confirm Password</label>
              <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
              Update Password
            </button>
            {pwMsg && <p className={`text-sm ${pwMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{pwMsg}</p>}
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow p-5 md:col-span-2">
          <h2 className="font-semibold text-gray-700 mb-3">Account Info</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
