import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NOTIFICATIONS = [
  { icon:'👤', title:'New voter pending approval',    desc:'A new voter registered and needs approval.', time:'2m ago',  unread:true  },
  { icon:'🗳️', title:'Vote cast in active election',  desc:'Vote recorded in "Student Council 2026".', time:'5m ago',  unread:true  },
  { icon:'⛓️', title:'Blockchain integrity verified', desc:'All vote blocks passed integrity check.',   time:'10m ago', unread:false },
  { icon:'✅', title:'Admin approved 2 voters',       desc:'ranjan@gmail.com and rahul@gmail.com approved.', time:'15m ago', unread:false },
];

export default function NotificationDropdown({ open, onClose, anchorRef }) {
  const dropRef = useRef(null);
  const unread  = NOTIFICATIONS.filter(n => n.unread).length;

  // Position: below the bell button, right-aligned
  const getPos = () => {
    if (!anchorRef?.current) return { top:64, right:16 };
    const r = anchorRef.current.getBoundingClientRect();
    return { top: r.bottom + 8, right: window.innerWidth - r.right };
  };
  const pos = getPos();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target) &&
          anchorRef?.current && !anchorRef.current.contains(e.target))
        onClose();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 80);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [open, onClose, anchorRef]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dropRef}
          initial={{ opacity:0, scale:0.93, y:-8 }}
          animate={{ opacity:1, scale:1,    y:0  }}
          exit={{   opacity:0, scale:0.93, y:-8  }}
          transition={{ duration:0.18, ease:[0.22,1,0.36,1] }}
          style={{
            position:     'fixed',
            top:          pos.top,
            right:        pos.right,
            width:        '370px',
            zIndex:       999999,
            borderRadius: '18px',
            background:   'rgba(8,12,28,0.98)',
            border:       '1px solid rgba(99,102,241,0.28)',
            boxShadow:    '0 24px 70px rgba(0,0,0,0.85), 0 0 0 1px rgba(99,102,241,0.08)',
            overflow:     'hidden',
            display:      'flex',
            flexDirection:'column',
          }}>

          {/* Header */}
          <div style={{
            padding:        '12px 16px',
            borderBottom:   '1px solid rgba(255,255,255,0.07)',
            background:     'rgba(59,130,246,0.08)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            flexShrink:     0,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ fontSize:'18px' }}>🔔</span>
              <span style={{ color:'#fff', fontWeight:700, fontSize:'14px' }}>Notifications</span>
              {unread > 0 && (
                <span style={{
                  fontSize:'11px', fontWeight:600, padding:'2px 8px', borderRadius:'999px',
                  background:'rgba(59,130,246,0.22)', border:'1px solid rgba(59,130,246,0.35)', color:'#93c5fd',
                }}>{unread} new</span>
              )}
            </div>
            <button onClick={onClose} style={{
              width:'26px', height:'26px', borderRadius:'7px',
              background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)',
              color:'#94a3b8', cursor:'pointer', fontSize:'12px',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>✕</button>
          </div>

          {/* Items */}
          <div style={{ overflowY:'auto', flex:1 }}>
            {NOTIFICATIONS.map((n, i) => (
              <div key={i} style={{
                display:      'flex',
                alignItems:   'flex-start',
                gap:          '12px',
                padding:      '13px 16px',
                borderBottom: i < NOTIFICATIONS.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                background:   n.unread ? 'rgba(59,130,246,0.05)' : 'transparent',
                cursor:       'pointer',
                transition:   'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = n.unread ? 'rgba(59,130,246,0.05)' : 'transparent'}>

                {/* Icon box */}
                <div style={{
                  width:'38px', height:'38px', borderRadius:'10px', flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px',
                  background: n.unread ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.06)',
                  border:     n.unread ? '1px solid rgba(59,130,246,0.28)' : '1px solid rgba(255,255,255,0.08)',
                  marginTop:  '1px',
                }}>{n.icon}</div>

                {/* Text */}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{
                    color:      n.unread ? '#e2e8f0' : '#94a3b8',
                    fontSize:   '13px',
                    fontWeight: n.unread ? 600 : 400,
                    margin:     0,
                    lineHeight: '1.4',
                  }}>{n.title}</p>
                  <p style={{ color:'#475569', fontSize:'11px', margin:'3px 0 0', lineHeight:'1.4' }}>{n.desc}</p>
                  <p style={{ color:'#334155', fontSize:'11px', margin:'4px 0 0' }}>{n.time}</p>
                </div>

                {/* Unread dot */}
                {n.unread && (
                  <div style={{
                    width:'8px', height:'8px', borderRadius:'50%', flexShrink:0,
                    background:'#60a5fa', marginTop:'5px',
                    boxShadow:'0 0 8px rgba(96,165,250,0.7)',
                  }} className="animate-pulse" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding:     '10px 16px',
            borderTop:   '1px solid rgba(255,255,255,0.06)',
            background:  'rgba(255,255,255,0.02)',
            textAlign:   'center',
            flexShrink:  0,
          }}>
            <button onClick={onClose} style={{
              color:'#60a5fa', fontSize:'12px', fontWeight:500,
              background:'none', border:'none', cursor:'pointer',
              padding:'4px 12px', borderRadius:'6px',
              transition:'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color='#93c5fd'}
            onMouseLeave={e => e.currentTarget.style.color='#60a5fa'}>
              Mark all as read
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body   // ← render directly into body, no parent clipping
  );
}
