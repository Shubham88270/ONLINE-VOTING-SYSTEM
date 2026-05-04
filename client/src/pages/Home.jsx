import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// ── Typewriter Hook ───────────────────────────────────────
function useTypewriter(words, speed = 80, pause = 1800) {
  const [text,      setText]      = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting,  setDeleting]  = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    const delay   = deleting ? speed / 2 : speed;
    const timer   = setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, charIndex + 1));
        if (charIndex + 1 === current.length) setTimeout(() => setDeleting(true), pause);
        else setCharIndex(c => c + 1);
      } else {
        setText(current.slice(0, charIndex - 1));
        if (charIndex - 1 === 0) { setDeleting(false); setWordIndex(w => w + 1); setCharIndex(0); }
        else setCharIndex(c => c - 1);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [charIndex, deleting, wordIndex, words, speed, pause]);

  return text;
}

// ── Intersection Observer Hook ────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ── Animated Counter ──────────────────────────────────────
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, inView]     = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    const numeric = parseInt(target.replace(/\D/g, ''), 10);
    const step    = numeric / (duration / 16);
    let   current = 0;
    const timer   = setInterval(() => {
      current += step;
      if (current >= numeric) { setCount(numeric); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  const raw = target.replace(/\D/g, '');
  const formatted = count.toLocaleString();
  return (
    <span ref={ref}>
      {target.startsWith('+') ? '+' : ''}
      {formatted}
      {target.includes('+') && !target.startsWith('+') ? '+' : ''}
      {suffix}
      {target.includes('%') ? '%' : ''}
    </span>
  );
}

// ── 3D Tilt Card ─────────────────────────────────────────
function Card3D({ icon, title, desc, color, delay = 0, badge }) {
  const cardRef        = useRef(null);
  const [tilt, setTilt] = useState({});
  const [sectionRef, inView] = useInView(0.1);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect    = card.getBoundingClientRect();
    const x       = e.clientX - rect.left;
    const y       = e.clientY - rect.top;
    const cx      = rect.width  / 2;
    const cy      = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -14;
    const rotateY = ((x - cx) / cx) *  14;
    setTilt({
      transform:  `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px) scale(1.03)`,
      boxShadow:  `${-rotateY * 2}px ${rotateX * 2}px 50px rgba(0,0,0,0.55), 0 0 40px ${color}30`,
      transition: 'none',
    });
  }, [color]);

  const handleMouseLeave = useCallback(() => {
    setTilt({
      transform:  'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)',
      boxShadow:  `0 8px 40px rgba(0,0,0,0.3), 0 0 0 1px ${color}20`,
      transition: 'all 0.55s cubic-bezier(0.34,1.56,0.64,1)',
    });
  }, [color]);

  return (
    <div ref={sectionRef} style={{
      opacity:    inView ? 1 : 0,
      transform:  inView ? 'translateY(0)' : 'translateY(40px)',
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          background:     'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border:         `1px solid ${color}35`,
          borderRadius:   '24px',
          padding:        '2.2rem 1.8rem',
          cursor:         'default',
          transformStyle: 'preserve-3d',
          position:       'relative',
          overflow:       'hidden',
          ...tilt,
        }}>
        {/* Top gradient shine */}
        <div style={{ position:'absolute', inset:0, borderRadius:'24px', background:`linear-gradient(135deg, ${color}12 0%, transparent 55%)`, pointerEvents:'none' }} />
        {/* Animated border glow */}
        <div style={{ position:'absolute', inset:0, borderRadius:'24px', background:`radial-gradient(ellipse at 50% 0%, ${color}20, transparent 60%)`, pointerEvents:'none' }} />
        {/* Bottom accent */}
        <div style={{ position:'absolute', bottom:0, left:'15%', right:'15%', height:'2px', background:`linear-gradient(90deg, transparent, ${color}, transparent)`, opacity:0.6 }} />

        {badge && (
          <div style={{ position:'absolute', top:'1.2rem', right:'1.2rem', fontSize:'10px', fontWeight:700, padding:'3px 10px', borderRadius:'999px', background:`${color}20`, border:`1px solid ${color}40`, color }}>
            {badge}
          </div>
        )}

        <div style={{ fontSize:'2.8rem', marginBottom:'1.2rem', transform:'translateZ(20px)', display:'inline-block' }}>{icon}</div>
        <h3 style={{ color:'#fff', fontSize:'1.15rem', fontWeight:800, marginBottom:'0.6rem', transform:'translateZ(15px)', letterSpacing:'-0.01em' }}>{title}</h3>
        <p style={{ color:'#94a3b8', fontSize:'0.875rem', lineHeight:1.7, transform:'translateZ(10px)' }}>{desc}</p>
      </div>
    </div>
  );
}

// ── Security Badge Card ───────────────────────────────────
function SecurityBadge({ item, index }) {
  const [ref, inView] = useInView(0.1);
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={ref} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background:     hovered ? `rgba(255,255,255,0.08)` : 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border:         `1px solid ${hovered ? item.color + '50' : item.color + '20'}`,
      borderRadius:   '16px',
      padding:        '1.4rem',
      opacity:        inView ? 1 : 0,
      transform:      inView ? (hovered ? 'translateY(-4px)' : 'translateY(0)') : 'translateY(30px)',
      transition:     `opacity 0.5s ease ${index * 60}ms, transform 0.4s ease ${index * 60}ms, border-color 0.3s, background 0.3s`,
      cursor:         'default',
      position:       'relative',
      overflow:       'hidden',
    }}>
      {hovered && <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 50% 0%, ${item.color}12, transparent 60%)`, pointerEvents:'none' }} />}
      <div style={{ fontSize:'1.8rem', marginBottom:'0.6rem' }}>{item.icon}</div>
      <div style={{ color:'#e2e8f0', fontSize:'0.875rem', fontWeight:700, marginBottom:'0.3rem' }}>{item.label}</div>
      <div style={{ color:'#475569', fontSize:'0.78rem', lineHeight:1.5 }}>{item.desc}</div>
    </div>
  );
}

// ── Step Card ─────────────────────────────────────────────
function StepCard({ item, index }) {
  const [ref, inView] = useInView(0.15);
  return (
    <div ref={ref} style={{
      position:'relative',
      background:'rgba(255,255,255,0.05)',
      backdropFilter:'blur(20px)',
      WebkitBackdropFilter:'blur(20px)',
      border:`1px solid ${item.color}30`,
      borderRadius:'24px',
      padding:'2.2rem 1.8rem',
      textAlign:'center',
      overflow:'hidden',
      opacity:   inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(40px)',
      transition:`opacity 0.6s ease ${index * 150}ms, transform 0.6s ease ${index * 150}ms`,
    }}>
      <div style={{ position:'absolute', top:'-15px', right:'16px', fontSize:'6rem', fontWeight:900, lineHeight:1, color:`${item.color}10`, userSelect:'none', pointerEvents:'none' }}>{item.step}</div>
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 50% 0%, ${item.color}10, transparent 60%)`, pointerEvents:'none' }} />
      <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'56px', height:'56px', borderRadius:'16px', fontSize:'26px', background:`${item.color}18`, border:`1px solid ${item.color}35`, marginBottom:'1.2rem' }}>{item.icon}</div>
      <div style={{ display:'inline-block', fontSize:'11px', fontWeight:700, padding:'3px 12px', borderRadius:'999px', marginBottom:'0.9rem', background:`${item.color}20`, border:`1px solid ${item.color}40`, color:item.color }}>Step {item.step}</div>
      <h3 style={{ color:'#fff', fontSize:'1.05rem', fontWeight:800, marginBottom:'0.6rem', letterSpacing:'-0.01em' }}>{item.title}</h3>
      <p style={{ color:'#64748b', fontSize:'0.875rem', lineHeight:1.7 }}>{item.desc}</p>
      <div style={{ position:'absolute', bottom:0, left:'20%', right:'20%', height:'2px', background:`linear-gradient(90deg, transparent, ${item.color}, transparent)`, opacity:0.5 }} />
    </div>
  );
}

// ── Floating Particle ─────────────────────────────────────
function Particle({ style }) {
  return (
    <div style={{
      position: 'absolute',
      borderRadius: '50%',
      pointerEvents: 'none',
      ...style,
    }} />
  );
}

// ── Section Heading ───────────────────────────────────────
function SectionHeading({ eyebrow, title, subtitle }) {
  const [ref, inView] = useInView(0.2);
  return (
    <div ref={ref} style={{ textAlign:'center', marginBottom:'3rem', opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)', transition:'opacity 0.7s ease, transform 0.7s ease' }}>
      <p style={{ color:'#818cf8', fontSize:'11px', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'0.75rem' }}>{eyebrow}</p>
      <h2 style={{ color:'#fff', fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:900, letterSpacing:'-0.03em', marginBottom:'0.75rem', lineHeight:1.15 }}>{title}</h2>
      {subtitle && <p style={{ color:'#64748b', fontSize:'1rem', maxWidth:'520px', margin:'0 auto', lineHeight:1.7 }}>{subtitle}</p>}
    </div>
  );
}

// ── Main Home Page ────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const videoRef = useRef(null);
  const ticking  = useRef(false);

  // Optimized parallax scroll handler
  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const typeWords = ['Secure Voting', 'Transparent Elections', 'Blockchain Security', 'Real-time Results', 'Verified Voters', 'Fair Democracy'];
  const typed = useTypewriter(typeWords, 75, 2000);

  const features = [
    { icon:'�', title:'Military-Grade Encryption', desc:'AES-256 encryption, JWT tokens, bcrypt hashing, and OTP verification protect every voter identity end-to-end.', color:'#a78bfa', delay:0,   badge:'Secure' },
    { icon:'⛓️', title:'Blockchain Immutability',   desc:'Every vote is a tamper-proof block with Proof-of-Work consensus. Permanently recorded, publicly verifiable.', color:'#38bdf8', delay:120, badge:'Web3' },
    { icon:'📊', title:'Real-time Live Results',    desc:'Socket.io powered live vote counts with animated charts. Winner declared automatically the moment polls close.', color:'#34d399', delay:240, badge:'Live' },
    { icon:'🛡️', title:'Anti-Fraud Protection',    desc:'Rate limiting, duplicate vote detection, and admin approval workflows ensure every vote is legitimate.', color:'#fb923c', delay:360, badge:'Verified' },
    { icon:'🌐', title:'Fully Decentralized',       desc:'No single point of failure. Distributed ledger architecture means no one entity can manipulate results.', color:'#f472b6', delay:480, badge:'Distributed' },
    { icon:'⚡', title:'Instant Verification',      desc:'Cryptographic proof of your vote in milliseconds. Verify your ballot was counted without revealing your choice.', color:'#facc15', delay:600, badge:'Fast' },
  ];

  // Parallax offset: video moves at 40% of scroll speed
  const parallaxY = scrollY * 0.4;

  return (
    <div style={{
      minHeight:  '100vh',
      background: '#080b14',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      overflowX:  'hidden',
      color:      '#fff',
    }}>

      {/* ── Fixed Parallax Video Background ── */}
      <div style={{ position:'fixed', inset:0, zIndex:0, overflow:'hidden', pointerEvents:'none' }}>
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          style={{
            position:   'absolute',
            inset:      0,
            width:      '100%',
            height:     '115%',   /* extra height for parallax travel */
            objectFit:  'cover',
            objectPosition: 'center',
            willChange: 'transform',
            transform:  `translateY(${parallaxY}px)`,
          }}
        >
          <source src="/bgvideo.mp4" type="video/mp4" />
        </video>

        {/* Multi-layer gradient overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(8,11,20,0.72) 0%, rgba(8,11,20,0.45) 40%, rgba(8,11,20,0.65) 70%, rgba(8,11,20,0.92) 100%)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 50%, rgba(6,182,212,0.06) 100%)' }} />

        {/* Animated ambient blobs */}
        <div style={{ position:'absolute', top:'8%', left:'10%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)', filter:'blur(80px)', animation:'blobPulse 7s ease-in-out infinite' }} />
        <div style={{ position:'absolute', bottom:'10%', right:'8%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.09), transparent 70%)', filter:'blur(80px)', animation:'blobPulse 9s ease-in-out infinite 2s' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'800px', height:'400px', borderRadius:'50%', background:'radial-gradient(ellipse, rgba(139,92,246,0.06), transparent 70%)', filter:'blur(60px)', animation:'blobPulse 11s ease-in-out infinite 4s' }} />

        {/* Floating particles */}
        {[
          { width:'4px', height:'4px', top:'20%', left:'25%', background:'rgba(99,102,241,0.7)', animation:'particleFloat 6s ease-in-out infinite' },
          { width:'3px', height:'3px', top:'35%', left:'70%', background:'rgba(6,182,212,0.6)',  animation:'particleFloat 8s ease-in-out infinite 1s' },
          { width:'5px', height:'5px', top:'60%', left:'15%', background:'rgba(139,92,246,0.5)', animation:'particleFloat 7s ease-in-out infinite 2s' },
          { width:'3px', height:'3px', top:'75%', left:'80%', background:'rgba(52,211,153,0.6)', animation:'particleFloat 9s ease-in-out infinite 0.5s' },
          { width:'4px', height:'4px', top:'45%', left:'45%', background:'rgba(251,146,60,0.5)', animation:'particleFloat 5s ease-in-out infinite 3s' },
          { width:'2px', height:'2px', top:'15%', left:'55%', background:'rgba(244,114,182,0.6)',animation:'particleFloat 10s ease-in-out infinite 1.5s' },
        ].map((p, i) => <Particle key={i} style={p} />)}
      </div>

      {/* ── Navbar ── */}
      <nav style={{
        position:       'fixed',
        top:            0, left:0, right:0,
        zIndex:         100,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '1rem 2.5rem',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        background:     'rgba(8,11,20,0.75)',
        borderBottom:   '1px solid rgba(255,255,255,0.06)',
        transition:     'background 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{
            width:'38px', height:'38px', borderRadius:'12px',
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'18px', boxShadow:'0 4px 20px rgba(99,102,241,0.5)',
            flexShrink:0,
          }}>🗳️</div>
          <div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:'1rem', letterSpacing:'-0.02em', lineHeight:1 }}>VoteChain</div>
            <div style={{ color:'#6366f1', fontSize:'9px', fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase' }}>Secure Voting</div>
          </div>
        </div>

        {/* Nav links (desktop) */}
        <div style={{ display:'flex', alignItems:'center', gap:'2rem' }}>
          {['Features', 'How It Works', 'Security', 'Stats'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g,'-')}`} style={{ color:'#94a3b8', fontSize:'13px', fontWeight:500, textDecoration:'none', transition:'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color='#fff'}
              onMouseLeave={e => e.currentTarget.style.color='#94a3b8'}>
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        {user ? (
          <Link to={user.isAdmin ? '/admin' : '/dashboard'} style={{
            background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff',
            padding:'0.5rem 1.4rem', borderRadius:'25px', textDecoration:'none',
            fontSize:'13px', fontWeight:700, boxShadow:'0 4px 20px rgba(99,102,241,0.4)',
            transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='scale(1.06)'; e.currentTarget.style.boxShadow='0 6px 28px rgba(99,102,241,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(99,102,241,0.4)'; }}>
            {user.isAdmin ? '⚙️ Admin Panel' : '🗳️ Dashboard'} →
          </Link>
        ) : (
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <Link to="/auth" style={{ color:'#94a3b8', fontSize:'13px', fontWeight:500, textDecoration:'none', padding:'0.5rem 1rem', transition:'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color='#fff'}
              onMouseLeave={e => e.currentTarget.style.color='#94a3b8'}>
              Sign In
            </Link>
            <Link to="/auth" style={{
              background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff',
              padding:'0.5rem 1.4rem', borderRadius:'25px', textDecoration:'none',
              fontSize:'13px', fontWeight:700, boxShadow:'0 4px 20px rgba(99,102,241,0.4)',
              transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='scale(1.06)'; e.currentTarget.style.boxShadow='0 6px 28px rgba(99,102,241,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(99,102,241,0.4)'; }}>
              Get Started →
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <div style={{
        position:       'relative',
        zIndex:         1,
        minHeight:      '100vh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        textAlign:      'center',
        padding:        '8rem 1.5rem 4rem',
      }}>
        {/* Animated badge */}
        <div style={{
          display:       'inline-flex',
          alignItems:    'center',
          gap:           '8px',
          padding:       '7px 18px',
          borderRadius:  '999px',
          background:    'rgba(99,102,241,0.12)',
          border:        '1px solid rgba(99,102,241,0.3)',
          color:         '#a5b4fc',
          fontSize:      '12px',
          fontWeight:    600,
          marginBottom:  '2rem',
          animation:     'heroFadeUp 0.7s ease 0.1s both',
          backdropFilter:'blur(12px)',
        }}>
          <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#6366f1', display:'inline-block', boxShadow:'0 0 8px #6366f1', animation:'dotPulse 2s ease-in-out infinite' }} />
          Powered by Blockchain Technology · Fully Decentralized
          <span style={{ padding:'2px 8px', borderRadius:'999px', background:'rgba(99,102,241,0.25)', fontSize:'10px', fontWeight:700, color:'#818cf8' }}>v2.0</span>
        </div>

        {/* Main heading */}
        <h1 style={{
          fontSize:      'clamp(2.8rem, 6.5vw, 5rem)',
          fontWeight:    900,
          lineHeight:    1.08,
          letterSpacing: '-0.04em',
          marginBottom:  '1.2rem',
          animation:     'heroFadeUp 0.7s ease 0.2s both',
          maxWidth:      '900px',
        }}>
          <span style={{
            background:           'linear-gradient(135deg, #fff 0%, #e2e8f0 40%, #c7d2fe 70%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
            display:              'block',
            textShadow:           'none',
            filter:               'drop-shadow(0 0 40px rgba(99,102,241,0.3))',
          }}>
            Secure Online
          </span>
          <span style={{
            background:           'linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #67e8f9 80%, #34d399 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
            display:              'block',
            filter:               'drop-shadow(0 0 60px rgba(139,92,246,0.4))',
          }}>
            Voting System
          </span>
        </h1>

        {/* Typewriter line */}
        <div style={{
          fontSize:      'clamp(1.1rem, 2.5vw, 1.5rem)',
          fontWeight:    600,
          color:         '#64748b',
          marginBottom:  '1.5rem',
          animation:     'heroFadeUp 0.7s ease 0.3s both',
          minHeight:     '2rem',
          display:       'flex',
          alignItems:    'center',
          gap:           '8px',
        }}>
          <span style={{ color:'#475569' }}>Built for</span>
          <span style={{
            background:           'linear-gradient(135deg, #818cf8, #a78bfa, #67e8f9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor:  'transparent',
            backgroundClip:       'text',
            fontWeight:           700,
          }}>
            {typed}
          </span>
          <span style={{
            display:'inline-block', width:'2px', height:'1.2em',
            background:'#818cf8', borderRadius:'2px',
            animation:'blink 1s step-end infinite', verticalAlign:'middle',
          }} />
        </div>

        {/* Subheading */}
        <p style={{
          color:         '#64748b',
          fontSize:      'clamp(0.95rem, 2vw, 1.1rem)',
          maxWidth:      '560px',
          lineHeight:    1.75,
          marginBottom:  '3rem',
          animation:     'heroFadeUp 0.7s ease 0.4s both',
        }}>
          Cast your vote with absolute confidence. Every ballot is encrypted,
          blockchain-secured, and permanently verifiable — no tampering, no fraud, no doubt.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display:        'flex',
          gap:            '14px',
          flexWrap:       'wrap',
          justifyContent: 'center',
          animation:      'heroFadeUp 0.7s ease 0.5s both',
          marginBottom:   '4rem',
        }}>
          {user ? (
            <Link to={user.isAdmin ? '/admin' : '/dashboard'} style={{
              background:'linear-gradient(135deg,#6366f1,#4f46e5,#7c3aed)',
              color:'#fff', padding:'1rem 2.5rem', borderRadius:'50px',
              textDecoration:'none', fontSize:'16px', fontWeight:800,
              boxShadow:'0 8px 40px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.3)',
              transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              letterSpacing:'-0.01em',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='scale(1.06) translateY(-3px)'; e.currentTarget.style.boxShadow='0 16px 50px rgba(99,102,241,0.65), 0 0 0 1px rgba(99,102,241,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='scale(1) translateY(0)'; e.currentTarget.style.boxShadow='0 8px 40px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.3)'; }}>
              {user.isAdmin ? '⚙️ Go to Admin Panel' : '🗳️ Go to Dashboard'} →
            </Link>
          ) : (
            <>
              <Link to="/auth" style={{
                background:'linear-gradient(135deg,#6366f1,#4f46e5,#7c3aed)',
                color:'#fff', padding:'1rem 2.5rem', borderRadius:'50px',
                textDecoration:'none', fontSize:'16px', fontWeight:800,
                boxShadow:'0 8px 40px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.3)',
                transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                letterSpacing:'-0.01em', position:'relative', overflow:'hidden',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.06) translateY(-3px)'; e.currentTarget.style.boxShadow='0 16px 50px rgba(99,102,241,0.65), 0 0 0 1px rgba(99,102,241,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='scale(1) translateY(0)'; e.currentTarget.style.boxShadow='0 8px 40px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.3)'; }}>
                🗳️ Start Voting Free →
              </Link>
              <a href="#features" style={{
                background:'rgba(255,255,255,0.06)',
                backdropFilter:'blur(12px)',
                color:'#cbd5e1', padding:'1rem 2.5rem', borderRadius:'50px',
                textDecoration:'none', fontSize:'16px', fontWeight:700,
                border:'1px solid rgba(255,255,255,0.12)',
                transition:'all 0.3s ease',
                letterSpacing:'-0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='#cbd5e1'; e.currentTarget.style.transform='translateY(0)'; }}>
                Learn More ↓
              </a>
            </>
          )}
        </div>

        {/* Trust badges */}
        <div style={{
          display:        'flex',
          gap:            '1.5rem',
          flexWrap:       'wrap',
          justifyContent: 'center',
          animation:      'heroFadeUp 0.7s ease 0.6s both',
        }}>
          {[
            { icon:'🔒', label:'256-bit Encrypted' },
            { icon:'⛓️', label:'Blockchain Verified' },
            { icon:'🛡️', label:'Zero Fraud' },
            { icon:'⚡', label:'Real-time Results' },
          ].map(b => (
            <div key={b.label} style={{
              display:'flex', alignItems:'center', gap:'6px',
              color:'#475569', fontSize:'12px', fontWeight:500,
            }}>
              <span style={{ fontSize:'14px' }}>{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{
          position:   'absolute',
          bottom:     '2.5rem',
          left:       '50%',
          transform:  'translateX(-50%)',
          display:    'flex',
          flexDirection:'column',
          alignItems: 'center',
          gap:        '6px',
          color:      '#334155',
          fontSize:   '11px',
          fontWeight: 500,
          letterSpacing:'0.08em',
          textTransform:'uppercase',
          animation:  'heroFadeUp 0.7s ease 0.8s both',
        }}>
          <span>Scroll</span>
          <div style={{ width:'1px', height:'40px', background:'linear-gradient(180deg, #6366f1, transparent)', animation:'scrollLine 2s ease-in-out infinite' }} />
        </div>
      </div>

      {/* ── Features Section ── */}
      <div id="features" style={{ position:'relative', zIndex:1, maxWidth:'1200px', margin:'0 auto', padding:'6rem 1.5rem' }}>
        <SectionHeading
          eyebrow="Why VoteChain"
          title="Enterprise-Grade Security for Every Vote"
          subtitle="Built with the same cryptographic standards used by financial institutions and government systems worldwide."
        />
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap:                 '1.5rem',
        }}>
          {features.map(f => <Card3D key={f.title} {...f} />)}
        </div>
      </div>

      {/* ── How It Works ── */}
      <div id="how-it-works" style={{ position:'relative', zIndex:1, maxWidth:'1000px', margin:'0 auto', padding:'0 1.5rem 6rem' }}>
        <SectionHeading
          eyebrow="Simple Process"
          title="Vote in 3 Simple Steps"
          subtitle="From registration to verified results — the entire process takes minutes, not days."
        />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:'1.5rem' }}>
          {[
            { step:'01', icon:'📝', title:'Register & Verify', desc:'Sign up with your details. Admin verifies your identity and approves your voter account via secure OTP.', color:'#a78bfa' },
            { step:'02', icon:'🗳️', title:'Cast Your Vote',    desc:'Browse active elections, review candidates, and cast your single cryptographically-signed vote.', color:'#38bdf8' },
            { step:'03', icon:'📊', title:'See Live Results',  desc:'Watch real-time results update instantly. Every vote is blockchain-recorded and publicly verifiable.', color:'#34d399' },
          ].map((item, i) => <StepCard key={i} item={item} index={i} />)}
        </div>
      </div>

      {/* ── Security Showcase ── */}
      <div id="security" style={{ position:'relative', zIndex:1, maxWidth:'1100px', margin:'0 auto', padding:'0 1.5rem 6rem' }}>
        <SectionHeading
          eyebrow="Security Architecture"
          title="Zero-Trust Security Model"
          subtitle="Every layer of the system is hardened against attacks, from the frontend to the blockchain."
        />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1rem' }}>
          {[
            { icon:'🔑', label:'JWT Auth Tokens',       desc:'Stateless, signed tokens with short expiry', color:'#a78bfa' },
            { icon:'🔐', label:'bcrypt Password Hash',  desc:'Salted hashing with 12 rounds of work factor', color:'#38bdf8' },
            { icon:'📱', label:'OTP Verification',      desc:'Time-based one-time passwords via email', color:'#34d399' },
            { icon:'🚦', label:'Rate Limiting',         desc:'IP-based throttling prevents brute force', color:'#fb923c' },
            { icon:'⛓️', label:'Proof-of-Work Chain',  desc:'SHA-256 chained blocks, immutable ledger', color:'#f472b6' },
            { icon:'👁️', label:'Audit Logging',        desc:'Every action timestamped and logged forever', color:'#facc15' },
            { icon:'🎭', label:'Anonymous Ballots',     desc:'Vote recorded without linking to identity', color:'#67e8f9' },
            { icon:'✅', label:'Admin Approval Flow',   desc:'Manual voter verification before access', color:'#86efac' },
          ].map((item, i) => (
            <SecurityBadge key={i} item={item} index={i} />
          ))}
        </div>
      </div>

      {/* ── Live Stats ── */}
      <div id="stats" style={{ position:'relative', zIndex:1, maxWidth:'1000px', margin:'0 auto', padding:'0 1.5rem 6rem' }}>
        <SectionHeading
          eyebrow="Platform Stats"
          title="Trusted by Thousands of Voters"
          subtitle="Real numbers from real elections conducted on our platform."
        />
        <div style={{
          background:     'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border:         '1px solid rgba(255,255,255,0.08)',
          borderRadius:   '28px',
          padding:        '3rem 2rem',
          display:        'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap:            '2.5rem',
          textAlign:      'center',
          position:       'relative',
          overflow:       'hidden',
        }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'600px', height:'300px', background:'radial-gradient(ellipse, rgba(99,102,241,0.07), transparent 70%)', pointerEvents:'none' }} />
          {[
            { value:'1200', display:'1,200+', label:'Registered Voters', icon:'👥', color:'#a78bfa' },
            { value:'3400', display:'3,400+', label:'Votes Cast',         icon:'🗳️', color:'#38bdf8' },
            { value:'12',   display:'12+',    label:'Elections Held',     icon:'📋', color:'#34d399' },
            { value:'100',  display:'100',    label:'% Blockchain Verified', icon:'⛓️', color:'#fb923c' },
          ].map((s, i) => (
            <div key={i} style={{ position:'relative', zIndex:1 }}>
              <div style={{ fontSize:'2.2rem', marginBottom:'0.75rem' }}>{s.icon}</div>
              <div style={{
                fontSize:'clamp(2rem,3.5vw,2.8rem)', fontWeight:900, lineHeight:1,
                background:`linear-gradient(135deg, #fff 0%, ${s.color} 100%)`,
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                marginBottom:'0.5rem',
              }}>
                <AnimatedCounter target={s.display} />
              </div>
              <div style={{ color:'#475569', fontSize:'0.8rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Final CTA Banner ── */}
      <div style={{ position:'relative', zIndex:1, maxWidth:'900px', margin:'0 auto', padding:'0 1.5rem 8rem' }}>
        <div style={{
          background:   'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.14), rgba(6,182,212,0.10))',
          border:       '1px solid rgba(99,102,241,0.3)',
          borderRadius: '28px',
          padding:      '4rem 2.5rem',
          textAlign:    'center',
          position:     'relative',
          overflow:     'hidden',
          backdropFilter:'blur(20px)',
          WebkitBackdropFilter:'blur(20px)',
        }}>
          <div style={{ position:'absolute', top:'-60px', left:'-60px', width:'250px', height:'250px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-60px', right:'-60px', width:'250px', height:'250px', borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.2), transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)', pointerEvents:'none' }} />

          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ fontSize:'3.5rem', marginBottom:'1.2rem', filter:'drop-shadow(0 0 20px rgba(99,102,241,0.5))' }}>🗳️</div>
            <h2 style={{ color:'#fff', fontSize:'clamp(1.8rem,3.5vw,2.4rem)', fontWeight:900, marginBottom:'1rem', letterSpacing:'-0.03em', lineHeight:1.15 }}>
              Ready to Make Your Voice Heard?
            </h2>
            <p style={{ color:'#64748b', fontSize:'1.05rem', maxWidth:'500px', margin:'0 auto 2.5rem', lineHeight:1.75 }}>
              Join thousands of verified voters. Your vote is secure, anonymous, and permanently recorded on the blockchain.
            </p>
            <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/auth" style={{
                background:'linear-gradient(135deg,#6366f1,#4f46e5,#7c3aed)',
                color:'#fff', padding:'1rem 2.5rem', borderRadius:'50px',
                textDecoration:'none', fontSize:'16px', fontWeight:800,
                boxShadow:'0 8px 40px rgba(99,102,241,0.5)',
                transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                letterSpacing:'-0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.06) translateY(-3px)'; e.currentTarget.style.boxShadow='0 16px 50px rgba(99,102,241,0.65)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='scale(1) translateY(0)'; e.currentTarget.style.boxShadow='0 8px 40px rgba(99,102,241,0.5)'; }}>
                🚀 Get Started Free
              </Link>
              <a href="#features" style={{
                background:'rgba(255,255,255,0.08)', color:'#e2e8f0',
                padding:'1rem 2.5rem', borderRadius:'50px',
                textDecoration:'none', fontSize:'16px', fontWeight:700,
                border:'1px solid rgba(255,255,255,0.15)',
                transition:'all 0.3s ease',
                letterSpacing:'-0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.14)'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.transform='translateY(0)'; }}>
                Explore Features ↑
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{
        position:   'relative',
        zIndex:     1,
        textAlign:  'center',
        padding:    '2rem 1.5rem',
        color:      '#334155',
        fontSize:   '13px',
        borderTop:  '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(8,11,20,0.6)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'0.5rem' }}>
          <div style={{ width:'24px', height:'24px', borderRadius:'7px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px' }}>🗳️</div>
          <span style={{ color:'#475569', fontWeight:600 }}>VoteChain</span>
        </div>
        <p>© 2026 VoteChain — Secure Online Voting System &nbsp;·&nbsp; Built with ❤️ for fair democracy</p>
        <p style={{ marginTop:'0.3rem', color:'#1e293b', fontSize:'11px' }}>Blockchain-secured · Zero-knowledge proofs · Fully auditable</p>
      </div>

      {/* ── Global CSS Animations ── */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes blobPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes dotPulse {
          0%, 100% { box-shadow: 0 0 4px #6366f1; }
          50%       { box-shadow: 0 0 12px #6366f1, 0 0 24px #6366f1; }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          25%       { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          50%       { transform: translateY(-35px) translateX(-5px); opacity: 0.6; }
          75%       { transform: translateY(-15px) translateX(-12px); opacity: 0.9; }
        }
        @keyframes scrollLine {
          0%   { transform: scaleY(0); transform-origin: top; opacity: 1; }
          50%  { transform: scaleY(1); transform-origin: top; opacity: 1; }
          51%  { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
          100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
        }
        * { scroll-behavior: smooth; }
        html { scroll-padding-top: 80px; }
        @media (max-width: 768px) {
          nav > div:nth-child(2) { display: none; }
        }
      `}</style>
    </div>
  );
}
