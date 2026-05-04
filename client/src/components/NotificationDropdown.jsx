import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ── Detail Modal ──────────────────────────────────────────────────────────────
function NotifDetail({ notif, onClose }) {
  if (!notif) return null;
  return createPortal(
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        <motion.div
          key="card"
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{   opacity: 0, scale: 0.88, y: 20  }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '420px',
            maxWidth: '90vw',
            borderRadius: '20px',
            background: 'rgba(8,12,28,0.98)',
            border: '1px solid rgba(99,102,241,0.3)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.9)',
            overflow: 'hidden',
          }}>

          {/* Modal header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(59,130,246,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px',
                background: 'rgba(59,130,246,0.18)',
                border: '1px solid rgba(59,130,246,0.3)',
              }}>{notif.icon}</div>
              <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '14px' }}>
                Notification Detail
              </span>
            </div>
            <button onClick={onClose} style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', cursor: 'pointer', fontSize: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>

          {/* Modal body */}
          <div style={{ padding: '20px' }}>
            <p style={{
              color: '#e2e8f0', fontSize: '15px', fontWeight: 600,
              margin: '0 0 10px', lineHeight: '1.5',
            }}>{notif.title}</p>
            <p style={{
              color: '#94a3b8', fontSize: '13px',
              margin: '0 0 16px', lineHeight: '1.7',
            }}>{notif.desc}</p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <span style={{ fontSize: '12px' }}>🕐</span>
              <span style={{ color: '#475569', fontSize: '12px' }}>{notif.time}</span>
            </div>
          </div>

          {/* Modal footer */}
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'flex-end',
          }}>
            <button onClick={onClose} style={{
              padding: '8px 20px', borderRadius: '10px',
              background: 'rgba(59,130,246,0.2)',
              border: '1px solid rgba(59,130,246,0.35)',
              color: '#93c5fd', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.35)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}>
              Got it
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ── Main Dropdown ─────────────────────────────────────────────────────────────
export default function NotificationDropdown({
  open, onClose, anchorRef,
  notifications, onMarkRead, onMarkAllRead,
}) {
  const dropRef = useRef(null);
  const [selected, setSelected] = useState(null);

  const unreadList = notifications.filter(n => n.unread);
  const unread = unreadList.length;

  // Position: below the bell button, right-aligned
  const getPos = () => {
    if (!anchorRef?.current) return { top: 64, right: 16 };
    const r = anchorRef.current.getBoundingClientRect();
    return { top: r.bottom + 8, right: window.innerWidth - r.right };
  };
  const pos = getPos();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target) &&
        anchorRef?.current && !anchorRef.current.contains(e.target)
      ) onClose();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 80);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [open, onClose, anchorRef]);

  const handleItemClick = (notif) => {
    if (notif.unread) onMarkRead(notif.id);   // mark read → count decreases
    setSelected(notif);                        // show detail modal
  };

  return (
    <>
      {/* Detail modal — rendered outside dropdown so it survives dropdown close */}
      <NotifDetail notif={selected} onClose={() => setSelected(null)} />

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={dropRef}
              initial={{ opacity: 0, scale: 0.93, y: -8 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{   opacity: 0, scale: 0.93, y: -8  }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position:      'fixed',
                top:           pos.top,
                right:         pos.right,
                width:         '370px',
                zIndex:        999999,
                borderRadius:  '18px',
                background:    'rgba(8,12,28,0.98)',
                border:        '1px solid rgba(99,102,241,0.28)',
                boxShadow:     '0 24px 70px rgba(0,0,0,0.85), 0 0 0 1px rgba(99,102,241,0.08)',
                overflow:      'hidden',
                display:       'flex',
                flexDirection: 'column',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>🔔</span>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>Notifications</span>
                  <AnimatePresence mode="wait">
                    {unread > 0 && (
                      <motion.span
                        key={unread}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1,   opacity: 1 }}
                        exit={{   scale: 0.6, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          fontSize: '11px', fontWeight: 600, padding: '2px 8px',
                          borderRadius: '999px',
                          background: 'rgba(59,130,246,0.22)',
                          border: '1px solid rgba(59,130,246,0.35)',
                          color: '#93c5fd',
                        }}>
                        {unread} new
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <button onClick={onClose} style={{
                  width: '26px', height: '26px', borderRadius: '7px',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', cursor: 'pointer', fontSize: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
              </div>

              {/* Items */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                <AnimatePresence initial={false}>
                  {unreadList.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{   opacity: 0, y: 8 }}
                      style={{
                        padding: '32px 16px',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: '10px',
                      }}>
                      <span style={{ fontSize: '32px' }}>🎉</span>
                      <p style={{ color: '#475569', fontSize: '13px', margin: 0, textAlign: 'center' }}>
                        You're all caught up!<br />No unread notifications.
                      </p>
                    </motion.div>
                  ) : (
                    unreadList.map((n, i) => (
                      <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0  }}
                        exit={{   opacity: 0, x: -30, height: 0, padding: 0 }}
                        transition={{ duration: 0.22 }}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleItemClick(n)}
                        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleItemClick(n)}
                        style={{
                          display:      'flex',
                          alignItems:   'flex-start',
                          gap:          '12px',
                          padding:      '13px 16px',
                          borderBottom: i < unreadList.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                          background:   'rgba(59,130,246,0.05)',
                          cursor:       'pointer',
                          transition:   'background 0.15s',
                          overflow:     'hidden',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.05)'}>

                        {/* Icon box */}
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px',
                          background: 'rgba(59,130,246,0.18)',
                          border:     '1px solid rgba(59,130,246,0.28)',
                          marginTop:  '1px',
                        }}>{n.icon}</div>

                        {/* Text */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            color: '#e2e8f0', fontSize: '13px', fontWeight: 600,
                            margin: 0, lineHeight: '1.4',
                          }}>{n.title}</p>
                          <p style={{ color: '#475569', fontSize: '11px', margin: '3px 0 0', lineHeight: '1.4' }}>{n.desc}</p>
                          <p style={{ color: '#334155', fontSize: '11px', margin: '4px 0 0' }}>{n.time}</p>
                        </div>

                        {/* Unread dot */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                            background: '#60a5fa', marginTop: '5px',
                            boxShadow: '0 0 8px rgba(96,165,250,0.7)',
                          }}
                          className="animate-pulse"
                        />
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div style={{
                padding:    '10px 16px',
                borderTop:  '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
                textAlign:  'center',
                flexShrink: 0,
              }}>
                <button
                  onClick={onMarkAllRead}
                  disabled={unread === 0}
                  style={{
                    color:      unread > 0 ? '#60a5fa' : '#334155',
                    fontSize:   '12px', fontWeight: 500,
                    background: 'none', border: 'none',
                    cursor:     unread > 0 ? 'pointer' : 'default',
                    padding:    '4px 12px', borderRadius: '6px',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => { if (unread > 0) e.currentTarget.style.color = '#93c5fd'; }}
                  onMouseLeave={e => { if (unread > 0) e.currentTarget.style.color = '#60a5fa'; }}>
                  {unread > 0 ? `Mark all ${unread} as read` : 'All caught up ✓'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
