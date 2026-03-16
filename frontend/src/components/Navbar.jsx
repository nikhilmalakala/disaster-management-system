import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { getNotifications } from '../services/api';
import { useQuery } from '../hooks/useQuery';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  const { data } = useQuery(getNotifications, { enabled: !!user });
  const notifications = Array.isArray(data) ? data : [];
  const unread = notifications.filter((n) => !n?.read).length;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <NavLink to="/" className="text-xl font-bold text-blue-600">
              DMER
            </NavLink>

            <NavLink to="/" className={({ isActive }) =>
              `rounded-lg px-3 py-2 ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`
            }>
              Dashboard
            </NavLink>

            <NavLink to="/incidents" className={({ isActive }) =>
              `rounded-lg px-3 py-2 ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`
            }>
              Incidents
            </NavLink>

            {user?.role === 'authority' || user?.role === 'admin' ? (
              <NavLink to="/authority" className={({ isActive }) =>
                `rounded-lg px-3 py-2 ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`
              }>
                Authority
              </NavLink>
            ) : null}

            <NavLink to="/analytics" className={({ isActive }) =>
              `rounded-lg px-3 py-2 ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`
            }>
              Analytics
            </NavLink>

            {user?.role === 'admin' && (
              <NavLink to="/admin/users" className={({ isActive }) =>
                `rounded-lg px-3 py-2 ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`
              }>
                Admin
              </NavLink>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-lg bg-white hover:bg-gray-50 transition relative border border-gray-100"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-xs flex items-center justify-center text-white">
                    {unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-gray-200 shadow-lg py-2 max-h-80 overflow-y-auto">
                  <div className="px-3 py-2 flex justify-between items-center border-b border-gray-100">
                    <span className="font-medium text-gray-700">Notifications</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="px-3 py-4 text-gray-500 text-sm">No notifications</p>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div key={n._id} className={`px-3 py-2 text-sm border-b border-gray-100 ${n.read ? 'text-gray-500' : 'text-gray-800'}`}>
                        {n.message}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <NavLink to="/profile" className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50">Profile</NavLink>

            <span className="text-gray-600 text-sm">{user?.role}</span>

            <button onClick={logout} className="rounded-lg px-3 py-2 text-gray-700 hover:text-red-600">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
