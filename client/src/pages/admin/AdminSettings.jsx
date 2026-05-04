import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import api from '../../api/axios.jsx';
import toast from 'react-hot-toast';
import Avatar from '../../components/Avatar.jsx';

const glass = { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' };
const inputCls = "w-full rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition";
const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };
const sectionHeaderStyle = { borderBottom: '1px solid rgba(255,255,255,0.06)' };

// File → base64
const toBase64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(file);
});

export default function AdminSettings() {
  const { user, refreshUser } = useAuth();
  const {
    theme, setTheme, themes,
    fontSize, setFontSize, fontSizes,
    fontFamily, setFontFamily, fontFamilies,
    darkMode, setDarkMode,
  } = useTheme();

  const photoRef = useRef(null);
  const [photoSaving, setPhotoSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPw: '', newPw: '', confirm: '', show: false });
  const [pwLoading, setPwLoading] = useState(false);

  // ── Photo upload ──────────────────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Max photo size is 2MB');
    setPhotoSaving(true);
    try {
      const b64 = await toBase64(file);
      await api.patch('/auth/profile', { photo: b64 });
      await refreshUser();
      toast.success('✅ Profile photo updated!');
    } catch { toast.error('Failed to upload photo'); }
    finally { setPhotoSaving(false); }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast.error('Name required');
    setSaving(true);
    try {
      await api.patch('/auth/profile', { name: profileForm.name });
      await refreshUser();
      toast.success('✅ Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!pwForm.oldPw) return toast.error('Enter current password');
    if (pwForm.newPw.length < 6) return toast.error('Min 6 characters');
    if (pwForm.newPw !== pwForm.confirm) return toast.error('Passwords do not match');
    setPwLoading(true);
    try {
      const { data } = await api.post('/auth/change-password', { oldPassword: pwForm.oldPw, newPassword: pwForm.newPw });
      toast.success(data.message);
      setPwForm({ oldPw: '', newPw: '', confirm: '', show: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setPwLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your preferences and account</p>
      </div>

      {/* ── APPEARANCE ─────────────────────────────── */}
      <div style={glass} className="rounded-2xl overflow-hidden">
        <div className="px-6 py-4 flex items-center gap-2" style={sectionHeaderStyle}>
          <span className="text-lg">🎨</span>
          <h2 className="font-semibold text-white">Appearance</h2>
        </div>
        <div className="p-6 space-y-6">

          {/* Color Theme */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">Color Theme</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Object.entries(themes).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className="relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                  style={
                    theme === key
                      ? { border: '2px solid #3b82f6', background: 'rgba(59,130,246,0.1)' }
                      : { border: '2px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }
                  }
                >
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ background: t.primary }} />
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ background: t.secondary }} />
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ background: t.accent }} />
                  </div>
                  <span className="text-xs font-medium text-slate-400">{t.name}</span>
                  {theme === key && (
                    <span className="absolute top-1.5 right-1.5 text-blue-400 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">Font Size</label>
            <div className="flex gap-3 flex-wrap">
              {Object.entries(fontSizes).map(([key, f]) => (
                <button
                  key={key}
                  onClick={() => setFontSize(key)}
                  className="px-4 py-2 rounded-xl transition-all font-medium"
                  style={
                    fontSize === key
                      ? { border: '2px solid #3b82f6', background: 'rgba(59,130,246,0.1)', color: '#93c5fd', fontSize: f.base }
                      : { border: '2px solid rgba(255,255,255,0.08)', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', fontSize: f.base }
                  }
                >
                  {f.name}
                  <span className="text-xs text-slate-500 ml-1">({f.base})</span>
                </button>
              ))}
            </div>
            {/* Live preview */}
            <div
              className="mt-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-slate-500 text-xs mb-1">Preview:</p>
              <p className="text-slate-200 font-medium" style={{ fontSize: fontSizes[fontSize].base }}>
                The quick brown fox jumps over the lazy dog.
              </p>
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">Font Family</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(fontFamilies).map(([key, f]) => (
                <button
                  key={key}
                  onClick={() => setFontFamily(key)}
                  className="px-4 py-3 rounded-xl transition-all text-left"
                  style={
                    fontFamily === key
                      ? { border: '2px solid #3b82f6', background: 'rgba(59,130,246,0.1)' }
                      : { border: '2px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }
                  }
                >
                  <p className="text-sm font-semibold text-slate-200" style={{ fontFamily: f.value }}>
                    {f.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: f.value }}>
                    Aa Bb Cc
                  </p>
                  {fontFamily === key && <span className="text-blue-400 text-xs">✓ Active</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Dark Mode toggle */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div>
              <p className="text-sm font-medium text-slate-200">Dark Mode</p>
              <p className="text-xs text-slate-500 mt-0.5">Toggle dark/light interface</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-500' : 'bg-white/20'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={() => { setTheme('indigo'); setFontSize('md'); setFontFamily('inter'); setDarkMode(true); }}
            className="text-sm text-slate-500 hover:text-slate-300 transition underline"
          >
            Reset to defaults
          </button>
        </div>
      </div>

      {/* ── PROFILE ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div style={glass} className="rounded-2xl overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-2" style={sectionHeaderStyle}>
            <span className="text-lg">👤</span>
            <h2 className="font-semibold text-white">Profile Info</h2>
          </div>
          <div className="p-6">

            {/* ── Photo upload ── */}
            <div className="flex items-center gap-5 mb-6">
              <div className="relative flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={() => photoRef.current?.click()}
                  className="w-20 h-20 rounded-2xl overflow-hidden cursor-pointer relative"
                  style={{ border: '2px solid rgba(59,130,246,0.4)', boxShadow: '0 4px 20px rgba(59,130,246,0.25)' }}>
                  <Avatar user={user} size={80} style={{ borderRadius: 14, width: '100%', height: '100%' }} />
                  {/* hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                    <span className="text-white text-xs font-medium">📷 Change</span>
                  </div>
                </motion.div>

                {/* Spinner while uploading */}
                {photoSaving && (
                  <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center">
                    <svg className="animate-spin w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  </div>
                )}

                {/* Camera badge */}
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => photoRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#1e40af)', border: '2px solid rgba(15,23,42,1)' }}>
                  📷
                </motion.button>

                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>

              <div>
                <p className="font-semibold text-white text-base">{user?.name}</p>
                <p className="text-sm text-slate-400">{user?.email}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium mt-1.5 inline-block"
                  style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                  👑 Admin
                </span>
                <p className="text-xs text-slate-600 mt-1.5">Click photo to update</p>
              </div>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Full Name</label>
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Email</label>
                <input
                  value={profileForm.email}
                  disabled
                  className="w-full rounded-xl px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full text-white py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1e40af)', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Change Password */}
        <div style={glass} className="rounded-2xl overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-2" style={sectionHeaderStyle}>
            <span className="text-lg">🔒</span>
            <h2 className="font-semibold text-white">Change Password</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handlePasswordSave} className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Current Password</label>
                <div className="relative">
                  <input
                    type={pwForm.show ? 'text' : 'password'}
                    value={pwForm.oldPw}
                    onChange={(e) => setPwForm({ ...pwForm, oldPw: e.target.value })}
                    placeholder="Your current password"
                    className={`${inputCls} pr-8`}
                    style={inputStyle}
                  />
                  <button type="button" onClick={() => setPwForm({ ...pwForm, show: !pwForm.show })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    {pwForm.show ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">New Password</label>
                <input
                  type={pwForm.show ? 'text' : 'password'}
                  value={pwForm.newPw}
                  onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                  placeholder="Min 6 characters"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Confirm Password</label>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                  placeholder="Repeat new password"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              {/* Password strength */}
              {pwForm.newPw && (
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all"
                      style={{
                        background: pwForm.newPw.length >= i * 3
                          ? i <= 1 ? '#f87171' : i <= 2 ? '#fbbf24' : i <= 3 ? '#60a5fa' : '#34d399'
                          : 'rgba(255,255,255,0.08)',
                      }} />
                  ))}
                </div>
              )}
              <button
                type="submit"
                disabled={pwLoading}
                className="w-full text-white py-2 rounded-xl text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1e40af)', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}
              >
                {pwLoading ? '⏳ Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── THEME PREVIEW ──────────────────────────── */}
      <div style={glass} className="rounded-2xl overflow-hidden">
        <div className="px-6 py-4 flex items-center gap-2" style={sectionHeaderStyle}>
          <span className="text-lg">👁️</span>
          <h2 className="font-semibold text-white">Live Preview</h2>
        </div>
        <div className="p-6">
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Mini sidebar */}
            <div className="flex h-32">
              <div
                className="w-28 flex flex-col gap-1 p-2"
                style={{ background: `linear-gradient(180deg, var(--color-primary, #6366f1), var(--color-secondary, #8b5cf6))` }}
              >
                {['Dashboard', 'Elections', 'Users'].map((item, i) => (
                  <div key={item} className={`text-xs px-2 py-1 rounded-lg text-white ${i === 0 ? 'bg-white/20' : 'opacity-60'}`}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Mini content */}
              <div className="flex-1 p-3 flex gap-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {['Elections', 'Users', 'Votes'].map((s, i) => (
                  <div
                    key={s}
                    className="flex-1 rounded-lg p-2"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div
                      className="w-6 h-6 rounded-lg mb-1"
                      style={{ background: [
                        `var(--color-primary, #6366f1)`,
                        `var(--color-secondary, #8b5cf6)`,
                        `var(--color-accent, #06b6d4)`,
                      ][i] }}
                    />
                    <div className="text-xs font-bold text-slate-200">{i * 4 + 3}</div>
                    <div className="text-xs text-slate-500">{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">Changes apply instantly across the entire app</p>
        </div>
      </div>
    </motion.div>
  );
}
