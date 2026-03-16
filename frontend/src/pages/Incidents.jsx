import { Link } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { getIncidents } from '../services/api';
import IncidentsMap from '../components/IncidentsMap';

const statusClass = { pending: 'bg-amber-500/20 text-amber-400', verified: 'bg-blue-500/20 text-blue-400', resolved: 'bg-green-500/20 text-green-400', rejected: 'bg-red-500/20 text-red-400' };

export default function Incidents() {
  const { data: incidents = [], loading } = useQuery(getIncidents);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Incidents</h1>
          <p className="text-slate-400 mt-1">Browse and filter reported incidents across the network.</p>
        </div>
        <Link to="/incidents/new" className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-medium shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:scale-105">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Report Incident
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 font-semibold text-slate-200">Live Map View</div>
          <div className="flex-1 min-h-[400px]">
            <IncidentsMap incidents={incidents} height="100%" />
          </div>
        </div>

        <div className="lg:col-span-2 backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg rounded-2xl overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 font-semibold text-slate-200">Incident List</div>
          <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : incidents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 flex flex-col items-center">
                <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                No incidents reported
              </div>
            ) : incidents.map((inc) => (
              <Link key={inc._id} to={`/incidents/${inc._id}`} className="block p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all hover:-translate-y-0.5 hover:shadow-md group">
                <div className="flex justify-between items-start gap-4">
                  <span className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors line-clamp-1">{inc.title}</span>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-bold whitespace-nowrap ${statusClass[inc.status] || 'bg-slate-500/20 text-slate-400'}`}>{inc.status}</span>
                </div>
                <p className="text-slate-400 text-sm mt-2 line-clamp-2 leading-relaxed">{inc.description}</p>
                <div className="flex items-center text-slate-500 text-xs mt-3 gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {new Date(inc.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
