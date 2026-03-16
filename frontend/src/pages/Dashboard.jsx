import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '../hooks/useQuery';
import { getIncidentStats } from '../services/api';
import IncidentsMap from '../components/IncidentsMap';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats } = useQuery(getIncidentStats);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            Welcome back, <span className="text-slate-200 font-medium">{user?.name}</span>. {' '}
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-wider ml-2">{user?.role}</span>
          </p>
        </div>
        <Link to="/incidents/new" className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-medium shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:scale-105">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Report Incident
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-indigo-500/10">
          <p className="text-sm text-slate-400 font-medium mb-1">Total Incidents</p>
          <p className="text-4xl font-black text-slate-100">{(stats?.pending ?? 0) + (stats?.verified ?? 0) + (stats?.resolved ?? 0) + (stats?.rejected ?? 0)}</p>
        </div>
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-orange-500/10">
          <p className="text-sm text-slate-400 font-medium mb-1">Active Cases</p>
          <p className="text-4xl font-black text-orange-400">{stats?.pending ?? 0}</p>
        </div>
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-green-500/10">
          <p className="text-sm text-slate-400 font-medium mb-1">Resolved Cases</p>
          <p className="text-4xl font-black text-green-400">{stats?.resolved ?? 0}</p>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg rounded-2xl p-5">
        <div className="flex justify-between items-center mb-5 px-2">
          <h2 className="text-lg font-bold text-slate-200">Recent Incidents Overview</h2>
          <Link to="/incidents" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors flex items-center gap-1">
            View all map <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
        </div>
        <div className="rounded-xl overflow-hidden border border-slate-700/50">
          <IncidentsMap height="360px" />
        </div>
      </div>
    </div>
  );
}
