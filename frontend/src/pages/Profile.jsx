import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 max-w-lg">
      <h1 className="text-xl font-bold text-red-400 mb-4">Profile</h1>
      <dl className="space-y-2 text-sm">
        <div><dt className="text-slate-500">Name</dt><dd className="text-white">{user?.name}</dd></div>
        <div><dt className="text-slate-500">Email</dt><dd className="text-white">{user?.email}</dd></div>
        <div><dt className="text-slate-500">Role</dt><dd className="text-white capitalize">{user?.role}</dd></div>
      </dl>
    </div>
  );
}
