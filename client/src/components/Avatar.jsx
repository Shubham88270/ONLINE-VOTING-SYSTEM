import React from 'react';

// Reusable Avatar — shows photo if available, else initials
export default function Avatar({ user, size = 36, className = '', style = {} }) {
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const s = {
    width:        size,
    height:       size,
    borderRadius: Math.round(size * 0.28),
    flexShrink:   0,
    overflow:     'hidden',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    fontWeight:   700,
    fontSize:     Math.round(size * 0.35),
    color:        '#fff',
    background:   'linear-gradient(135deg, #6366f1, #4f46e5)',
    ...style,
  };

  return (
    <div style={s} className={className}>
      {user?.photo ? (
        <img src={user.photo} alt={user.name}
          style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
