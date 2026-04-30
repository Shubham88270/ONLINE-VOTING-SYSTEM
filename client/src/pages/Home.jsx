import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xl">
          <span className="text-2xl">🗳️</span> VoteApp
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            /* Login ke baad — sahi panel ka button */
            <Link
              to={user.isAdmin ? '/admin' : '/dashboard'}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
            >
              {user.isAdmin ? '⚙️ Admin Panel →' : '🗳️ My Dashboard →'}
            </Link>
          ) : (
            /* Login se pehle */
            <>
              <Link to="/auth" className="text-indigo-600 text-sm font-semibold hover:underline">
                Login
              </Link>
              <Link to="/auth"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center py-16">
        <span className="text-6xl mb-4">🗳️</span>
        <h1 className="text-5xl font-extrabold text-indigo-700 mb-4">Online Voting System</h1>
        <p className="text-gray-500 text-lg max-w-xl mb-8">
          A secure, transparent, and easy-to-use platform for conducting elections online.
          Every vote counts — make yours matter.
        </p>

        {user ? (
          /* Login ke baad hero button */
          <Link
            to={user.isAdmin ? '/admin' : '/dashboard'}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition text-lg"
          >
            {user.isAdmin ? '⚙️ Go to Admin Panel →' : '🗳️ Go to Dashboard →'}
          </Link>
        ) : (
          /* Login se pehle hero buttons */
          <div className="flex gap-4">
            <Link to="/auth"
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition text-lg">
              Get Started
            </Link>
            <Link to="/auth"
              className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition text-lg">
              Login
            </Link>
          </div>
        )}

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
          {[
            { icon: '🔒', title: 'Secure',       desc: 'JWT-based authentication keeps your vote safe.' },
            { icon: '✅', title: 'One Vote',      desc: 'Each user can vote only once per election.'     },
            { icon: '📊', title: 'Live Results',  desc: 'View real-time vote counts and percentages.'   },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl shadow p-6 text-left">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-indigo-700 text-lg mb-1">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-xs py-4">
        © 2026 VoteApp — Online Voting System
      </footer>
    </div>
  );
}
