import React, { useEffect, useState } from 'react';

export default function CountdownTimer({ endDate, isActive, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!endDate) return;

    const calc = () => {
      const diff = new Date(endDate) - new Date();

      if (diff <= 0) {
        setTimeLeft(null);
        // Notify parent to refresh so status becomes Closed
        if (onExpire) onExpire();
        return;
      }

      const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, diff });
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endDate, onExpire]);

  if (!endDate) return null;

  // Time expired or already closed
  if (!isActive || !timeLeft) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200 mt-1">
        <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
        Closed
      </span>
    );
  }

  // Color based on urgency
  const urgent  = timeLeft.diff < 1000 * 60 * 60;        // < 1 hour  → red
  const warning = timeLeft.diff < 1000 * 60 * 60 * 24;   // < 1 day   → orange

  const color = urgent
    ? 'text-red-600 bg-red-50 border-red-200'
    : warning
    ? 'text-orange-600 bg-orange-50 border-orange-200'
    : 'text-green-700 bg-green-50 border-green-200';

  const dot = urgent
    ? 'bg-red-500 animate-pulse'
    : warning
    ? 'bg-orange-500'
    : 'bg-green-500 animate-pulse';

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border mt-1 font-medium ${color}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {timeLeft.days > 0    && `${timeLeft.days}d `}
      {timeLeft.hours > 0   && `${timeLeft.hours}h `}
      {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
      {timeLeft.seconds}s left
    </span>
  );
}
