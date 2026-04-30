import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const menuItems = [
  { path: '/admin',              icon: '🏠', label: 'Dashboard'          },
  { path: '/admin/elections',    icon: '🗳️', label: 'Manage Elections'   },
  { path: '/admin/users',        icon: '👥', label: 'Manage Users'       },
  { path: '/admin/candidates',   icon: '🙋', label: 'Manage Candidates'  },
  { path: '/admin/monitoring',   icon: '📡', label: 'Votes Monitoring'   },
  { path: '/admin/results',      icon: '📊', label: 'Results'            },
  { path: '/admin/blockchain',   icon: '⛓️', label: 'Blockchain Explorer'},
  { path: '/admin/settings',     icon: '⚙️', label: 'Settings'           },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <aside className="w-64 min-h-screen bg-indigo-900 text-white flex flex-col">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-indigo-700">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🗳️</span>
          <div>
            <p className="font-bold text-lg leading-tight">VoteApp</p>
            <p className="text-indigo-300 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 border-b border-indigo-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">
          {initials}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-semibold truncate">{user?.name}</p>
          <p className="text-indigo-300 text-xs truncate">{user?.email}</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-indigo-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-900 hover:text-red-200 transition"
        >
          <span className="text-base">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
