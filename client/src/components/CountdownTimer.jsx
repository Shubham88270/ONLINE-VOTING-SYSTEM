import React, { useEffect, useState, useRef } from 'react';

export default function CountdownTimer({ endDate, isActive, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(null);
  // useRef se onExpire stable reference rakho — infinite loop nahi hoga
  const onExpireRef = useRef(onExpire);
  const expiredRef  = useRef(false); // sirf ek baar call karo

  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    if (!endDate) return;
    expiredRef.current = false; // reset on endDate change

    const calc = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) {
        setTimeLeft(null);
        // Sirf ek baar call karo — infinite loop rokne ke liye
        if (!expiredRef.current) {
          expiredRef.current = true;
          if (onExpireRef.current) onExpireRef.current();
        }
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
  }, [endDate]); // ✅ sirf endDate dependency — onExpire nahi

  if (!endDate) return null;

  if (!isActive || !timeLeft) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full mt-1 font-medium"
        style={{ background:'rgba(100,116,139,0.1)', border:'1px solid rgba(100,116,139,0.2)', color:'#64748b' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block" />
        Closed
      </span>
    );
  }

  const urgent  = timeLeft.diff < 1000 * 60 * 60;
  const warning = timeLeft.diff < 1000 * 60 * 60 * 24;

  const style = urgent
    ? { background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#fca5a5' }
    : warning
    ? { background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.2)', color:'#fcd34d' }
    : { background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.2)', color:'#6ee7b7' };

  const dotClass = urgent ? 'bg-red-400 animate-pulse' : warning ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse';

  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full mt-1 font-medium" style={style}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {timeLeft.days > 0    && `${timeLeft.days}d `}
      {timeLeft.hours > 0   && `${timeLeft.hours}h `}
      {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
      {timeLeft.seconds}s left
    </span>
  );
}
