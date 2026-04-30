import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, ArcElement, Title, Tooltip, Legend
} from 'chart.js';
import api from '../api/axios.jsx';
import Spinner from '../components/Spinner.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

export default function ResultsPage() {
  const { id } = useParams();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [chart,   setChart]   = useState('bar'); // bar | pie

  useEffect(() => {
    api.get(`/votes/results/${id}`)
      .then(({ data }) => setData(data))
      .catch(() => setError('Failed to load results'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (error)   return <p className="text-center text-red-500 mt-10">{error}</p>;

  const { election, totalVotes, results, winner } = data;

  const chartData = {
    labels:   results.map((c) => c.name),
    datasets: [{
      label:           'Votes',
      data:            results.map((c) => c.votes),
      backgroundColor: results.map((_, i) => COLORS[i % COLORS.length]),
      borderRadius:    6,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: chart === 'pie' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.raw} votes (${results[ctx.dataIndex]?.percentage}%)`,
        },
      },
    },
    scales: chart === 'bar' ? {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    } : {},
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/dashboard" className="text-indigo-600 text-sm hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-1">{election.title} — Results</h1>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-gray-500 text-sm">Total votes: <strong>{totalVotes}</strong></span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${election.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {election.isActive ? '🟢 Active' : '🔴 Closed'}
        </span>
      </div>

      {/* Winner Banner */}
      {totalVotes > 0 && winner && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-5 mb-6 text-white flex items-center gap-4">
          <span className="text-5xl">🏆</span>
          <div>
            <p className="text-sm font-medium opacity-90">Winner</p>
            <p className="text-2xl font-extrabold">{winner.name}</p>
            {winner.party && <p className="text-sm opacity-90">{winner.party}</p>}
            <p className="text-sm mt-1">{winner.votes} votes · {winner.percentage}%</p>
          </div>
        </div>
      )}

      {totalVotes === 0 && (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 mb-6">
          <p className="text-3xl mb-2">📊</p>
          <p>No votes cast yet.</p>
        </div>
      )}

      {/* Chart toggle */}
      {totalVotes > 0 && (
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Vote Distribution</h2>
            <div className="flex gap-2">
              <button onClick={() => setChart('bar')}
                className={`text-xs px-3 py-1 rounded-lg font-medium transition ${chart === 'bar' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                📊 Bar
              </button>
              <button onClick={() => setChart('pie')}
                className={`text-xs px-3 py-1 rounded-lg font-medium transition ${chart === 'pie' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                🥧 Pie
              </button>
            </div>
          </div>
          <div className="max-h-72">
            {chart === 'bar'
              ? <Bar data={chartData} options={chartOptions} />
              : <Pie data={chartData} options={chartOptions} />
            }
          </div>
        </div>
      )}

      {/* Results list */}
      <div className="space-y-3">
        {results.map((c, i) => (
          <div key={c._id} className={`bg-white rounded-xl shadow p-4 ${i === 0 && totalVotes > 0 ? 'border-2 border-yellow-400' : ''}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-indigo-300'
              }`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{c.name}</p>
                {c.party && <p className="text-xs text-indigo-600">{c.party}</p>}
              </div>
              <span className="text-sm font-bold text-gray-700">{c.votes} votes</span>
              <span className="text-sm text-gray-400">({c.percentage}%)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div className="h-3 rounded-full transition-all duration-700"
                style={{ width: `${c.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
