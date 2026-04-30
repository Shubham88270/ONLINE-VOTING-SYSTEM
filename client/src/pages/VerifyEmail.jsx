import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios.jsx';
import Spinner from '../components/Spinner.jsx';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    api.get(`/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus('success');
        setMessage('Email verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      });
  }, []);

  if (status === 'loading') return <Spinner />;

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">{status === 'success' ? '✅' : '❌'}</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
        </h2>
        <p className="text-gray-500 mb-6">{message}</p>
        <Link to="/auth"
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition">
          {status === 'success' ? 'Login Now →' : 'Back to Login'}
        </Link>
      </div>
    </div>
  );
}
