import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.jsx';
import { validateRegister, validateLogin, getPasswordStrength } from '../utils/validators.js';

export default function Auth() {
  const [isLogin, setIsLogin]           = useState(true);
  const [form, setForm]                 = useState({ name: '', email: '', password: '' });
  const [errors, setErrors]             = useState({});
  const [loading, setLoading]           = useState(false);
  const [serverError, setServerError]   = useState('');
  const [successMsg, setSuccessMsg]     = useState('');
  const [notVerified, setNotVerified]   = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched]           = useState({});

  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const pwStrength = getPasswordStrength(form.password);

  // Show success if redirected after email verification
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('verified') === 'true') {
      setSuccessMsg('✅ Email verified! You can now login.');
      setIsLogin(true);
    }
  }, [location]);

  // Real-time validation on blur
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = isLogin
      ? validateLogin(form)
      : validateRegister(form);
    setErrors(errs);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const errs = isLogin ? validateLogin({ ...form, [field]: value }) : validateRegister({ ...form, [field]: value });
      setErrors(errs);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');
    setNotVerified(false);

    // Full validation
    const errs = isLogin ? validateLogin(form) : validateRegister(form);
    setTouched({ name: true, email: true, password: true });
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(form.email, form.password);
        navigate(result.isAdmin ? '/admin' : '/dashboard');
      } else {
        await api.post('/auth/register', { name: form.name, email: form.email, password: form.password });
        setSuccessMsg(`📧 Verification email sent to ${form.email}. Please verify before logging in.`);
        setForm({ name: '', email: '', password: '' });
        setTouched({});
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      if (err.response?.data?.notVerified) setNotVerified(true);
      if (err.response?.status === 429) {
        setServerError(`⏳ Too many attempts. Please wait and try again.`);
      } else {
        setServerError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMsg('');
    try {
      await api.post('/auth/resend-verification', { email: form.email });
      setResendMsg('✅ Verification email resent!');
    } catch (err) {
      setResendMsg(err.response?.data?.message || 'Failed to resend');
    } finally {
      setResendLoading(false);
    }
  };

  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    setErrors({});
    setServerError('');
    setSuccessMsg('');
    setNotVerified(false);
    setTouched({});
    setForm({ name: '', email: '', password: '' });
  };

  const inputClass = (field) =>
    `w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
      touched[field] && errors[field]
        ? 'border-red-400 bg-red-50 focus:ring-red-300'
        : touched[field] && !errors[field]
        ? 'border-green-400 bg-green-50 focus:ring-green-300'
        : 'border-gray-300 focus:ring-indigo-400'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl flex rounded-2xl shadow-2xl overflow-hidden">

        {/* Left — Branding */}
        <div className="hidden md:flex flex-col justify-center items-center bg-indigo-700 text-white w-1/2 p-10">
          <span className="text-6xl mb-4">🗳️</span>
          <h1 className="text-3xl font-extrabold mb-3">VoteApp</h1>
          <p className="text-indigo-200 text-center text-sm leading-relaxed mb-8">
            Secure, transparent online voting platform.
          </p>
          <div className="space-y-3 w-full">
            {[
              { icon: '🔒', text: 'JWT Authentication'         },
              { icon: '📧', text: 'Email Verification Required' },
              { icon: '🛡️', text: 'Role-based Authorization'   },
              { icon: '⚡', text: 'Rate limiting protection'   },
              { icon: '✅', text: 'One vote per election'       },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 bg-indigo-600 rounded-lg px-4 py-2.5">
                <span>{f.icon}</span>
                <span className="text-sm text-indigo-100">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex-1 bg-white p-8 md:p-10 flex flex-col justify-center">

          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button onClick={() => switchTab(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${isLogin ? 'bg-white text-indigo-700 shadow' : 'text-gray-500 hover:text-gray-700'}`}>
              Login
            </button>
            <button onClick={() => switchTab(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${!isLogin ? 'bg-white text-indigo-700 shadow' : 'text-gray-500 hover:text-gray-700'}`}>
              Register
            </button>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            {isLogin ? 'Welcome back!' : 'Create account'}
          </h2>
          <p className="text-gray-400 text-sm mb-5">
            {isLogin ? 'Login to cast your vote.' : 'Register and verify your email to get started.'}
          </p>

          {/* Success */}
          {successMsg && (
            <div className="bg-green-50 border border-green-300 text-green-700 text-sm rounded-lg px-4 py-3 mb-4 flex items-start gap-2">
              <span>📧</span><span>{successMsg}</span>
            </div>
          )}

          {/* Server Error */}
          {serverError && (
            <div className="bg-red-50 border border-red-300 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              <p className="flex items-center gap-2"><span>⚠️</span>{serverError}</p>
              {notVerified && (
                <div className="mt-2 pt-2 border-t border-red-200">
                  <button onClick={handleResend} disabled={resendLoading}
                    className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200 transition font-medium">
                    {resendLoading ? 'Sending...' : '📧 Resend Verification Email'}
                  </button>
                  {resendMsg && <p className="text-xs mt-1 text-green-600">{resendMsg}</p>}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Name */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="Ali Ahmed"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={inputClass('name')} />
                {touched.name && errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span>{errors.name}
                  </p>
                )}
                {touched.name && !errors.name && form.name && (
                  <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                    <span>✅</span> Looks good!
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input type="email" placeholder="you@example.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={inputClass('email')} />
              {touched.email && errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠️</span>{errors.email}
                </p>
              )}
              {touched.email && !errors.email && form.email && (
                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <span>✅</span> Valid email
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`${inputClass('password')} pr-10`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Password strength bar — only on register */}
              {!isLogin && form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwStrength.score ? pwStrength.color : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  {pwStrength.label && (
                    <p className="text-xs text-gray-500">Strength: <span className="font-medium">{pwStrength.label}</span></p>
                  )}
                </div>
              )}

              {touched.password && errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠️</span>{errors.password}
                </p>
              )}
              {!isLogin && (
                <p className="text-gray-400 text-xs mt-1">Min 6 chars, must include a number</p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>Please wait...</>
              ) : isLogin ? '🔐 Login' : '📧 Register & Verify Email'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => switchTab(!isLogin)}
              className="text-indigo-600 font-semibold hover:underline">
              {isLogin ? 'Register here' : 'Login here'}
            </button>
          </p>

          <Link to="/" className="text-center text-xs text-gray-400 mt-3 hover:text-indigo-500 transition block">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
