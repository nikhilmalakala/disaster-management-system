import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { getNotifications, markAllNotificationsRead } from '../services/api';
import { useQuery } from '../hooks/useQuery';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  // Fetch notifications safely
  const { data, refetch: refetchNotifs } = useQuery(getNotifications, {
    enabled: !!user,
  });

  // Always ensure notifications is an array
  const notifications = Array.isArray(data) ? data : [];

  // Safe unread count
  const unread = notifications.filter((n) => !n?.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      refetchNotifs();
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
    setNotifOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/60 border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6">
              <NavLink to="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tighter">
                DMER
              </NavLink>

              <div className="hidden md:flex items-center gap-2">
                <NavLink to="/" className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-medium transition-all ${isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`
                }>
                  Dashboard
                </NavLink>

                <NavLink to="/incidents" className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-medium transition-all ${isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`
                }>
                  Incidents
                </NavLink>

                {(user?.role === 'authority' || user?.role === 'admin') && (
                  <NavLink to="/authority" className={({ isActive }) =>
                    `rounded-lg px-4 py-2 text-sm font-medium transition-all ${isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`
                  }>
                    Authority
                  </NavLink>
                )}

                <NavLink to="/analytics" className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-medium transition-all ${isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`
                }>
                  Analytics
                </NavLink>

                {user?.role === 'admin' && (
                  <NavLink to="/admin/users" className={({ isActive }) =>
                    `rounded-lg px-4 py-2 text-sm font-medium transition-all ${isActive ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`
                  }>
                    Admin Users
                  </NavLink>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-700 relative"
                >
                  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>

                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 border-2 border-slate-900 text-[10px] font-bold flex items-center justify-center text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                      {unread}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl backdrop-blur-xl bg-slate-900/90 border border-slate-700 shadow-2xl py-2 max-h-96 overflow-y-auto z-50">
                    <div className="px-4 py-3 flex justify-between items-center border-b border-slate-800/60 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                      <span className="font-semibold text-slate-200">Notifications</span>
                      {unread > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-slate-500 text-sm">
                        <svg className="w-8 h-8 mx-auto mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        No new notifications
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/50">
                        {notifications.slice(0, 10).map((n) => (
                          <div
                            key={n._id}
                            className={`px-4 py-3 text-sm transition-colors hover:bg-slate-800/30 ${n.read ? 'text-slate-500' : 'text-slate-200 font-medium bg-slate-800/20'
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>}
                              <p>{n.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-700/50">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-200">{user?.name || 'User'}</span>
                  <span className="text-xs text-indigo-400 font-medium uppercase tracking-wider">{user?.role}</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-slate-800">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="ml-2 p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative z-10">
          <Outlet />
        </div>

        {/* Universal background decoration elements */}
        <div className="fixed top-20 left-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="fixed bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      </main>
    </div>
  );
}