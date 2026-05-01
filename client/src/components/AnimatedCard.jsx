import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Animated counting number
export function CountUp({ target, duration = 1.5 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count.toLocaleString()}</span>;
}

// Staggered fade+slide card
export function AnimatedCard({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Skeleton shimmer
export function SkeletonCard() {
  return (
    <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
      <div className="shimmer h-4 w-24 rounded-lg mb-3" />
      <div className="shimmer h-8 w-16 rounded-lg mb-2" />
      <div className="shimmer h-3 w-32 rounded-lg" />
    </div>
  );
}

// Animated button with microinteraction
export function GlowButton({ children, onClick, className = '', variant = 'primary' }) {
  const base = variant === 'primary'
    ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'
    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20';
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${base} ${className}`}
    >
      {children}
    </motion.button>
  );
}
