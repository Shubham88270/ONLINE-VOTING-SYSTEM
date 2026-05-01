import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { validateLogin } from '../utils/validators.js';

// Floating human SVG
const FloatingHuman = ({ style, color = '#818cf8', size = 60 }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 40 56" fill="none" style={style}>
    <circle cx="20" cy="10" r="8" fill={color} fillOpacity="0.4" />
    <rect x="12" y="20" width="16" height="20" rx="5" fill={color} fillOpacity="0.35" />
    <rect x="2" y="22" width="10" height="5" rx="2.5" fill={color} fillOpacity="0.3" />
    <rect x="28" y="22" width="10" height="5" rx="2.5" fill={color} fillOpacity="0.3" />
    <rect x="12" y="42" width="7" height="14" rx="3.5" fill={color} fillOpacity="0.3" />
    <rect x="21" y="42" width="7" height="14" rx="3.5" fill={color} fillOpacity="0.3" />
  </svg>
);

export default function Auth() {
  const [form,        setForm]        = useState({ email: '', password: '' });
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg,  setSuccessMsg]  = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [touched,     setTouched]     = useState({});

  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === 'true')
      setSuccessMsg('✅ Email verified! You can now login.');
  }, [location]);

  const handleBlur = (field) => {
    setTouched((p) => ({ ...p, [field]: true }));
    setErrors(validateLogin(form));
  };

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (touched[field]) setErrors(validateLogin({ ...form, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validateLogin(form);
    setTouched({ email: true, password: true });
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      navigate(result.isAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      setServerError(err.response?.status === 429 ? '⏳ Too many attempts. Please wait.' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center px-4">

      {/* Abstract background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-500/8 blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />

        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`v${i}`} x1={`${i * 5}%`} y1="0" x2={`${i * 5}%`} y2="100%" stroke="white" strokeWidth="1" />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={`${i * 7}%`} x2="100%" y2={`${i * 7}%`} stroke="white" strokeWidth="1" />
          ))}
        </svg>

        {/* Floating humans */}
        <div className="absolute top-[10%] left-[5%] animate-float">
          <FloatingHuman color="#6366f1" size={70} />
        </div>
        <div className="absolute top-[20%] right-[8%] animate-float2">
          <FloatingHuman color="#8b5cf6" size={55} />
        </div>
        <div className="absolute bottom-[15%] left-[8%] animate-float3">
          <FloatingHuman color="#06b6d4" size={50} />
        </div>
        <div className="absolute bottom-[20%] right-[5%] animate-float">
          <FloatingHuman color="#6366f1" size={65} />
        </div>
        <div className="absolute top-[50%] left-[2%] animate-float2">
          <FloatingHuman color="#a78bfa" size={45} />
        </div>
        <div className="absolute top-[45%] right-[2%] animate-float3">
          <FloatingHuman color="#67e8f9" size={48} />
        </div>

        {/* Floating dots */}
        {[[10,30],[20,70],[80,20],[90,60],[50,10],[50,90]].map(([l,t], i) => (
          <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400/30 animate-pulse-slow"
            style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${i * 0.5}s` }} />
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl shadow-indigo-500/40 mb-4">
            <span className="text-3xl">🗳️</span>
          </div>
          <h1 className="text-white text-2xl font-bold">VoteApp</h1>
          <p className="text-slate-400 text-sm mt-1">Secure Online Voting System</p>
        </div>

        {/* Card */}
        <div className="glass-white rounded-3xl p-8 shadow-2xl">

          <h2 className="text-gray-800 text-xl font-bold mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-6">Sign in to cast your vote</p>

          {/* Success */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4 animate-fade-in">
              {successMsg}
            </div>
          )}

          {/* Error */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 animate-fade-in flex items-center gap-2">
              <span>⚠️</span>{serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Email Address</label>
              <input type="email" placeholder="you@example.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full border rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition ${
                  touched.email && errors.email
                    ? 'border-red-300 focus:ring-red-200'
                    : touched.email && !errors.email
                    ? 'border-green-300 focus:ring-green-200'
                    : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-300'
                }`} />
              {touched.email && errors.email && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <span>⚠️</span>{errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full border rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition pr-11 ${
                    touched.password && errors.password
                      ? 'border-red-300 focus:ring-red-200'
                      : touched.password && !errors.password
                      ? 'border-green-300 focus:ring-green-200'
                      : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-300'
                  }`} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-sm">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <span>⚠️</span>{errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white py-3 rounded-xl font-semibold transition shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>Signing in...</>
              ) : '🔐 Sign In'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-5 p-3.5 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
            <p className="text-xs text-indigo-500 font-medium">Don't have an account?</p>
            <p className="text-xs text-gray-400 mt-0.5">Contact your administrator to get registered.</p>
          </div>
        </div>

        <Link to="/" className="block text-center text-slate-500 text-xs mt-5 hover:text-slate-300 transition">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
