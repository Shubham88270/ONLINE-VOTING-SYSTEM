import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios.jsx';
import Spinner from '../../components/Spinner.jsx';

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/elections')
      .then(({ data: elections }) => {
        const totalVotes = elections.reduce(
          (sum, e) => sum + e.candidates.reduce((s, c) => s + (c.votes || 0), 0), 0
        );
        setStats({
          elections:  elections.length,
          active:     elections.filter((e) => e.isActive).length,
          candidates: elections.reduce((s, e) => s + e.candidates.length, 0),
          votes:      totalVotes,
        });
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error)   return <p className="text-red-500 p-4">{error}</p>;

  const cards = [
    {
      label:  'Total Elections',
      value:  stats.elections,
      icon:   '🗳️',
      color:  'bg-indigo-500',
      hover:  'hover:bg-indigo-50 hover:border-indigo-300',
      route:  '/admin/elections',
      hint:   'View all elections →',
    },
    {
      label:  'Active Elections',
      value:  stats.active,
      icon:   '✅',
      color:  'bg-green-500',
      hover:  'hover:bg-green-50 hover:border-green-300',
      route:  '/admin/elections',
      hint:   'Manage elections →',
    },
    {
      label:  'Total Candidates',
      value:  stats.candidates,
      icon:   '🙋',
      color:  'bg-yellow-500',
      hover:  'hover:bg-yellow-50 hover:border-yellow-300',
      route:  '/admin/candidates',
      hint:   'Manage candidates →',
    },
    {
      label:  'Total Votes',
      value:  stats.votes,
      icon:   '📊',
      color:  'bg-pink-500',
      hover:  'hover:bg-pink-50 hover:border-pink-300',
      route:  '/admin/monitoring',
      hint:   'View monitoring →',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-400 text-sm mb-6">Click any card to view details</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => navigate(c.route)}
            className={`bg-white rounded-xl shadow p-5 flex items-center gap-4 border-2 border-transparent transition-all duration-200 cursor-pointer text-left w-full ${c.hover} hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className={`${c.color} w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white flex-shrink-0`}>
              {c.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.hint}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { icon: '➕', label: 'Create New Election', route: '/admin/elections' },
              { icon: '👥', label: 'Manage Users',        route: '/admin/users'     },
              { icon: '📊', label: 'View Results',        route: '/admin/results'   },
              { icon: '⛓️', label: 'Blockchain Explorer', route: '/admin/blockchain'},
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.route)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition text-left"
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
                <span className="ml-auto text-gray-300">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Summary</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Elections',  value: stats.elections,              bar: 'bg-indigo-400' },
              { label: 'Active Elections', value: stats.active,                 bar: 'bg-green-400'  },
              { label: 'Total Candidates', value: stats.candidates,             bar: 'bg-yellow-400' },
              { label: 'Total Votes Cast', value: stats.votes,                  bar: 'bg-pink-400'   },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold text-gray-800">{item.value}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`${item.bar} h-1.5 rounded-full transition-all duration-700`}
                    style={{ width: item.value > 0 ? `${Math.min((item.value / Math.max(stats.elections, stats.candidates, stats.votes, 1)) * 100, 100)}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
