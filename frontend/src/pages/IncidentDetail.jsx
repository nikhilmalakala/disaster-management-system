import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '../hooks/useQuery';
import { getIncident, deleteIncident } from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusClass = { pending: 'bg-amber-500/20 text-amber-400', verified: 'bg-blue-500/20 text-blue-400', resolved: 'bg-green-500/20 text-green-400', rejected: 'bg-red-500/20 text-red-400' };

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: incident, loading, refetch } = useQuery(() => getIncident(id), { enabled: !!id });

  const handleDelete = () => {
    if (!window.confirm('Delete this incident?')) return;
    deleteIncident(id).then(() => navigate('/incidents')).catch(console.error);
  };

  if (loading || !incident) return <div className="text-slate-500">Loading...</div>;

  const [lng, lat] = incident.location?.coordinates || [];
  const isOwner = incident.reportedBy?._id === user?.id || incident.reportedBy === user?.id;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-2xl font-bold">{incident.title}</h1>
        <span className={`px-3 py-1 rounded-full text-sm ${statusClass[incident.status] || ''}`}>{incident.status}</span>
      </div>
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <p className="text-slate-300">{incident.description}</p>
        {incident.image && (
          <img src={incident.image.startsWith('http') ? incident.image : (import.meta.env.VITE_API_URL || '') + incident.image} alt="" className="rounded-xl max-h-64 object-cover w-full" />
        )}
        <p className="text-slate-500 text-sm">Reported by {incident.reportedBy?.name || 'Unknown'} • {new Date(incident.createdAt).toLocaleString()}</p>
        {lat != null && lng != null && (
          <p className="text-slate-400 text-sm">Location: {lat}, {lng} — <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Open in Maps</a></p>
        )}
        {isOwner && (
          <div className="flex gap-3 pt-2">
            <Link to={`/incidents/${id}/edit`} className="py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20">Edit</Link>
            <button onClick={handleDelete} className="py-2 px-4 rounded-xl bg-red-900/50 hover:bg-red-800/50 text-red-400">Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}
