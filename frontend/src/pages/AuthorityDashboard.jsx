import { useEffect, useMemo, useState } from 'react';
import { getIncidents, getUsers, updateIncident } from '../services/api';
import { useAuth } from '../context/AuthContext';
import IncidentsMap from '../components/IncidentsMap';

const statusClass = {
  pending: 'bg-amber-500/20 text-amber-400',
  verified: 'bg-blue-500/20 text-blue-400',
  resolved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
};

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [responders, setResponders] = useState([]);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [incRes, usersRes] = await Promise.all([
        getIncidents({ status: status || undefined, startDate: startDate || undefined, endDate: endDate || undefined }),
        getUsers({ role: 'authority' }),
      ]);
      setIncidents(incRes.data.data || []);
      setResponders(usersRes.data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = async (id, patch) => {
    try {
      const res = await updateIncident(id, patch);
      setIncidents((prev) => prev.map((i) => (i._id === id ? res.data.data : i)));
    } catch (e) {
      alert(e.response?.data?.message || 'Update failed');
    }
  };

  const mapIncidents = useMemo(() => incidents, [incidents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Authority Panel</h1>
          <p className="text-slate-400 mt-1">Review incidents, update statuses, and dispatch responders.</p>
        </div>
        <button onClick={fetchAll} className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-200 font-medium transition-all hover:shadow-md">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Refresh Data
        </button>
      </div>

      <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg rounded-2xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Status Filter</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl bg-slate-800/80 border border-slate-700/50 px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow appearance-none">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Start Date</label>
            <input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" className="w-full rounded-xl bg-slate-800/80 border border-slate-700/50 px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow [color-scheme:dark]" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">End Date</label>
            <input value={endDate} onChange={(e) => setEndDate(e.target.value)} type="date" className="w-full rounded-xl bg-slate-800/80 border border-slate-700/50 px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow [color-scheme:dark]" />
          </div>
          <div className="flex items-end">
            <button onClick={fetchAll} className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-md shadow-indigo-500/20">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg rounded-2xl overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 font-semibold text-slate-200">Live Map</div>
          <div className="flex-1">
            <IncidentsMap incidents={mapIncidents} height="100%" />
          </div>
        </div>

        <div className="xl:col-span-2 backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-700/50 bg-slate-800/30 font-semibold text-slate-200 flex justify-between items-center">
            <span>Incident Review</span>
            <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-400 border border-slate-700">{incidents.length} cases</span>
          </div>
          <div className="overflow-x-auto min-h-[360px]">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : incidents.length === 0 ? (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                <svg className="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                No incidents match criteria
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-800/20 border-b border-slate-700/50 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Incident Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Responder</th>
                    <th className="px-6 py-4 rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30 bg-transparent">
                  {incidents.map((inc) => (
                    <tr key={inc._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-200 mb-1 line-clamp-1">{inc.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          {new Date(inc.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${statusClass[inc.status] || 'bg-slate-500/20 text-slate-400'}`}>
                          {inc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 min-w-[160px]">
                        <select
                          value={inc.assignedTo?._id || inc.assignedTo?.id || inc.assignedTo || ''}
                          onChange={(e) => handleUpdate(inc._id, { assignedTo: e.target.value || null })}
                          className="w-full rounded-lg bg-slate-800/80 border border-slate-700/50 px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none"
                        >
                          <option value="">Unassigned</option>
                          {responders.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                          {user?.role === 'admin' && responders.length === 0 && <option value="">No authority users</option>}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {inc.status !== 'verified' && inc.status !== 'resolved' && (
                            <button
                              onClick={() => handleUpdate(inc._id, { status: 'verified', assignedTo: inc.assignedTo?._id || inc.assignedTo || user?.id })}
                              className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-xs font-medium transition-colors"
                            >
                              Verify
                            </button>
                          )}
                          {inc.status !== 'resolved' && (
                            <button
                              onClick={() => handleUpdate(inc._id, { status: 'resolved' })}
                              className="px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 text-xs font-medium transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                          {inc.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdate(inc._id, { status: 'rejected' })}
                              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs font-medium transition-colors"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

