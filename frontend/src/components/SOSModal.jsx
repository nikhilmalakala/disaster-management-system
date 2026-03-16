export default function SOSModal({ data, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="backdrop-blur-md bg-slate-800/95 border-2 border-red-500/50 rounded-xl p-6 max-w-md w-full shadow-glow animate-pulse" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-red-400">Emergency SOS Received</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <p className="text-slate-200 mb-2">{data.message || 'Emergency SOS'}</p>
        {(data.latitude != null && data.longitude != null) && (
          <p className="text-slate-400 text-sm">
            Location: {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
          </p>
        )}
        <p className="text-slate-500 text-xs mt-2">{new Date(data.timestamp).toLocaleString()}</p>
        <a
          href={data.latitude != null && data.longitude != null ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm"
        >
          Open in Maps
        </a>
      </div>
    </div>
  );
}
