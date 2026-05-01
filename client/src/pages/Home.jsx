import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Abstract SVG human figures
const HumanFigure = ({ x, y, scale = 1, color = '#818cf8', opacity = 0.6 }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
    {/* Head */}
    <circle cx="0" cy="-28" r="8" fill={color} />
    {/* Body */}
    <rect x="-6" y="-18" width="12" height="20" rx="4" fill={color} />
    {/* Arms */}
    <rect x="-18" y="-16" width="12" height="4" rx="2" fill={color} />
    <rect x="6" y="-16" width="12" height="4" rx="2" fill={color} />
    {/* Legs */}
    <rect x="-6" y="4" width="5" height="16" rx="2" fill={color} />
    <rect x="1" y="4" width="5" height="16" rx="2" fill={color} />
  </g>
);

// Abstract tech background SVG
const TechBackground = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <defs>
      <radialGradient id="bg1" cx="20%" cy="30%">
        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
      <radialGradient id="bg2" cx="80%" cy="70%">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
      <radialGradient id="bg3" cx="60%" cy="20%">
        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>

    {/* Gradient blobs */}
    <ellipse cx="20%" cy="30%" rx="400" ry="300" fill="url(#bg1)" />
    <ellipse cx="80%" cy="70%" rx="350" ry="280" fill="url(#bg2)" />
    <ellipse cx="60%" cy="15%" rx="300" ry="200" fill="url(#bg3)" />

    {/* Grid lines */}
    {Array.from({ length: 12 }).map((_, i) => (
      <line key={`v${i}`} x1={`${(i + 1) * 8.33}%`} y1="0" x2={`${(i + 1) * 8.33}%`} y2="100%"
        stroke="#6366f1" strokeOpacity="0.05" strokeWidth="1" />
    ))}
    {Array.from({ length: 8 }).map((_, i) => (
      <line key={`h${i}`} x1="0" y1={`${(i + 1) * 12.5}%`} x2="100%" y2={`${(i + 1) * 12.5}%`}
        stroke="#6366f1" strokeOpacity="0.05" strokeWidth="1" />
    ))}

    {/* Floating circles */}
    <circle cx="10%" cy="20%" r="60" fill="none" stroke="#6366f1" strokeOpacity="0.1" strokeWidth="1" />
    <circle cx="10%" cy="20%" r="40" fill="none" stroke="#6366f1" strokeOpacity="0.08" strokeWidth="1" />
    <circle cx="90%" cy="80%" r="80" fill="none" stroke="#8b5cf6" strokeOpacity="0.1" strokeWidth="1" />
    <circle cx="90%" cy="80%" r="50" fill="none" stroke="#8b5cf6" strokeOpacity="0.08" strokeWidth="1" />
    <circle cx="75%" cy="15%" r="50" fill="none" stroke="#06b6d4" strokeOpacity="0.1" strokeWidth="1" />

    {/* Connection dots */}
    {[[15,25],[25,60],[40,15],[60,75],[75,40],[85,20],[50,50],[30,85]].map(([cx,cy], i) => (
      <circle key={i} cx={`${cx}%`} cy={`${cy}%`} r="3" fill="#6366f1" fillOpacity="0.15" />
    ))}

    {/* Connection lines */}
    <line x1="15%" y1="25%" x2="25%" y2="60%" stroke="#6366f1" strokeOpacity="0.06" strokeWidth="1" />
    <line x1="25%" y1="60%" x2="40%" y2="15%" stroke="#6366f1" strokeOpacity="0.06" strokeWidth="1" />
    <line x1="60%" y1="75%" x2="75%" y2="40%" stroke="#8b5cf6" strokeOpacity="0.06" strokeWidth="1" />
    <line x1="75%" y1="40%" x2="85%" y2="20%" stroke="#8b5cf6" strokeOpacity="0.06" strokeWidth="1" />

    {/* Human figures */}
    <g className="animate-float">
      <HumanFigure x={120} y={200} scale={1.2} color="#6366f1" opacity={0.15} />
    </g>
    <g className="animate-float2">
      <HumanFigure x={300} y={400} scale={0.9} color="#8b5cf6" opacity={0.12} />
    </g>
    <g className="animate-float3">
      <HumanFigure x={500} y={150} scale={1.0} color="#06b6d4" opacity={0.1} />
    </g>
    <g style={{ animation: 'float 7s ease-in-out infinite 2s' }}>
      <HumanFigure x={700} y={350} scale={1.3} color="#6366f1" opacity={0.12} />
    </g>
    <g className="animate-float2">
      <HumanFigure x={900} y={180} scale={0.8} color="#8b5cf6" opacity={0.1} />
    </g>
    <g className="animate-float">
      <HumanFigure x={1100} y={420} scale={1.1} color="#06b6d4" opacity={0.12} />
    </g>
    <g style={{ animation: 'float2 6s ease-in-out infinite 0.5s' }}>
      <HumanFigure x={1300} y={250} scale={0.9} color="#6366f1" opacity={0.1} />
    </g>
  </svg>
);

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">

      {/* Tech background */}
      <TechBackground />

      {/* Navbar */}
      <nav className="relative z-10 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg shadow-lg shadow-indigo-500/30">
            🗳️
          </div>
          <span className="text-white font-bold text-xl tracking-tight">VoteApp</span>
        </div>
        <div>
          {user ? (
            <Link to={user.isAdmin ? '/admin' : '/dashboard'}
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl text-sm font-medium transition backdrop-blur-sm border border-white/10">
              {user.isAdmin ? '⚙️ Admin Panel' : '🗳️ Dashboard'} →
            </Link>
          ) : (
            <Link to="/auth"
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-500/30">
              Login →
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">

        {/* Badge */}
        <div className="animate-slide-up mb-6">
          <span className="glass text-indigo-300 text-xs font-medium px-4 py-1.5 rounded-full border border-indigo-500/20">
            ✦ Secure · Transparent · Decentralized
          </span>
        </div>

        {/* Heading */}
        <h1 className="animate-slide-up text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 max-w-4xl"
          style={{ animationDelay: '0.1s' }}>
          The Future of
          <span className="block gradient-text">Online Voting</span>
        </h1>

        <p className="animate-slide-up text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
          style={{ animationDelay: '0.2s' }}>
          Cast your vote with confidence. Blockchain-secured, tamper-proof, and completely transparent.
          Every voice matters.
        </p>

        {/* CTA */}
        <div className="animate-slide-up flex flex-col sm:flex-row gap-4" style={{ animationDelay: '0.3s' }}>
          {user ? (
            <Link to={user.isAdmin ? '/admin' : '/dashboard'}
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white px-8 py-3.5 rounded-2xl font-semibold text-lg transition shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-0.5">
              {user.isAdmin ? '⚙️ Go to Admin Panel' : '🗳️ Go to Dashboard'}
            </Link>
          ) : (
            <Link to="/auth"
              className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white px-8 py-3.5 rounded-2xl font-semibold text-lg transition shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-0.5">
              Get Started →
            </Link>
          )}
          <a href="#features"
            className="glass text-white px-8 py-3.5 rounded-2xl font-semibold text-lg transition hover:bg-white/15 border border-white/10">
            Learn More
          </a>
        </div>

        {/* Stats */}
        <div className="animate-slide-up mt-16 grid grid-cols-3 gap-8 max-w-lg" style={{ animationDelay: '0.4s' }}>
          {[
            { value: '100%', label: 'Secure' },
            { value: '⛓️',   label: 'Blockchain' },
            { value: '0',    label: 'Fraud' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: '🔒', title: 'Secure Auth',    desc: 'JWT + OTP verification keeps every voter identity safe and verified.' },
            { icon: '⛓️', title: 'Blockchain',     desc: 'Every vote is recorded as a tamper-proof block. Immutable forever.' },
            { icon: '📊', title: 'Live Results',   desc: 'Real-time vote counts with beautiful charts and instant winner detection.' },
          ].map((f, i) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:bg-white/10 transition group animate-slide-up"
              style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-6 text-slate-600 text-xs">
        © 2026 VoteApp — Secure Online Voting System
      </div>
    </div>
  );
}
