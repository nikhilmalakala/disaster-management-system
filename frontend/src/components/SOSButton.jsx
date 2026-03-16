import { useState } from 'react';
import { useSocket } from '../context/SocketContext';

export default function SOSButton() {
  const { socket } = useSocket();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const sendSOS = () => {
    if (!socket) return;
    setSending(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        socket.emit('SOS_ALERT', {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          message: 'Emergency SOS - need immediate help',
        });
        setSending(false);
        setConfirmOpen(false);
      },
      () => {
        socket.emit('SOS_ALERT', { message: 'Emergency SOS - need immediate help' });
        setSending(false);
        setConfirmOpen(false);
      }
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold shadow-glow animate-pulse flex items-center justify-center transition transform hover:scale-110"
        title="Send SOS"
      >
        SOS
      </button>
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmOpen(false)}>
          <div className="backdrop-blur-md bg-slate-800/90 border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-red-400 mb-2">Send Emergency SOS?</h3>
            <p className="text-slate-400 text-sm mb-4">Authorities will be notified with your location.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmOpen(false)} className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20">Cancel</button>
              <button onClick={sendSOS} disabled={sending} className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50">Send SOS</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
