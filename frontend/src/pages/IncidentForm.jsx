import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createIncident, getIncident, updateIncident } from '../services/api';

export default function IncidentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      getIncident(id).then((res) => {
        const inc = res.data.data;
        setTitle(inc.title);
        setDescription(inc.description);
        if (inc.location?.coordinates) {
          setLongitude(inc.location.coordinates[0]);
          setLatitude(inc.location.coordinates[1]);
        }
      }).catch(() => setError('Failed to load incident'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(String(pos.coords.latitude));
          setLongitude(String(pos.coords.longitude));
        },
        () => setError('Could not get location')
      );
    }
  }, [id, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    if (image) formData.append('image', image);
    if (isEdit) {
      updateIncident(id, { title, description, latitude, longitude }).then(() => navigate(`/incidents/${id}`)).catch((err) => setError(err.response?.data?.message || 'Update failed')).finally(() => setLoading(false));
    } else {
      createIncident(formData).then(() => navigate('/incidents')).catch((err) => setError(err.response?.data?.message || 'Create failed')).finally(() => setLoading(false));
    }
  };

  return (
    <div className="max-w-2xl mx-auto backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(99,102,241,0.05)] transition-all">
      <div className="mb-8">
        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight">
          {isEdit ? 'Update Incident' : 'Report Emergency'}
        </h1>
        <p className="text-slate-400 mt-2 font-medium">
          {isEdit ? 'Modify the details of this incident.' : 'Provide accurate details to assist emergency responders.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center font-medium">{error}</div>}

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Major Flooding on Main St" className="w-full rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} placeholder="Describe the situation in detail..." className="w-full rounded-xl bg-slate-800/50 border border-slate-700/50 px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium resize-none custom-scrollbar" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Latitude</label>
              <input type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)} required readOnly={!isEdit} className={`w-full rounded-xl border border-slate-700/50 px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium ${!isEdit ? 'bg-slate-800/30 text-slate-400' : 'bg-slate-800/50'}`} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Longitude</label>
              <input type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)} required readOnly={!isEdit} className={`w-full rounded-xl border border-slate-700/50 px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium ${!isEdit ? 'bg-slate-800/30 text-slate-400' : 'bg-slate-800/50'}`} />
            </div>
          </div>
          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">Image Proof (Optional)</label>
              <div className="relative group">
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="w-full rounded-xl bg-slate-800/30 border-2 border-dashed border-slate-700/50 hover:border-indigo-500/50 px-4 py-8 text-center transition-all group-hover:bg-slate-800/60">
                  <svg className="w-8 h-8 mx-auto text-slate-500 group-hover:text-indigo-400 transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <p className="text-sm text-slate-300 font-medium">{image ? image.name : 'Click or drop image here'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-700/50">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white font-bold transition-all border border-slate-700">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 flex justify-center items-center">
            {loading ? <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : (isEdit ? 'Save Changes' : 'Submit Report')}
          </button>
        </div>
      </form>
    </div>
  );
}
