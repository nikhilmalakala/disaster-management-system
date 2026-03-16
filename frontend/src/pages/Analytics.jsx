import { useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useQuery } from '../hooks/useQuery';
import { getIncidentStats, getIncidentsByDate } from '../services/api';

const COLORS = {
  pending: '#f59e0b',
  verified: '#3b82f6',
  resolved: '#22c55e',
  rejected: '#ef4444',
};

export default function Analytics() {
  const { data: stats } = useQuery(getIncidentStats);
  // useCallback ensures a stable function reference so useQuery won't refetch every render
  const fetchByDate = useCallback(() => getIncidentsByDate(14), []);
  const { data: byDate } = useQuery(fetchByDate);

  const pieData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats).map(([k, v]) => ({ name: k, value: v }));
  }, [stats]);

  const barData = useMemo(() => {
    const list = byDate || [];
    return list.map((d) => ({ date: d._id, incidents: d.count }));
  }, [byDate]);

  const total = useMemo(() => pieData.reduce((acc, x) => acc + (x.value || 0), 0), [pieData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-slate-400 text-sm">Incident trends and status distribution.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-indigo-500/10">
          <p className="text-slate-400 text-sm font-medium mb-1">Total</p>
          <p className="text-3xl font-black text-slate-100">{total}</p>
        </div>
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-orange-500/10">
          <p className="text-slate-400 text-sm font-medium mb-1">Pending</p>
          <p className="text-3xl font-black" style={{ color: COLORS.pending }}>{stats?.pending ?? 0}</p>
        </div>
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-blue-500/10">
          <p className="text-slate-400 text-sm font-medium mb-1">Verified</p>
          <p className="text-3xl font-black" style={{ color: COLORS.verified }}>{stats?.verified ?? 0}</p>
        </div>
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-green-500/10">
          <p className="text-slate-400 text-sm font-medium mb-1">Resolved</p>
          <p className="text-3xl font-black" style={{ color: COLORS.resolved }}>{stats?.resolved ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-6 text-slate-200">Incidents (last 14 days)</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px', color: '#e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                />
                <Bar dataKey="incidents" fill="url(#colorUv)" radius={[6, 6, 0, 0]}>
                  {
                    barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={'#6366f1'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 shadow-lg rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-6 text-slate-200">Status distribution</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={120} innerRadius={80} paddingAngle={3}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name] || '#94a3b8'} stroke="rgba(15,23,42,0.5)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px', color: '#e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

