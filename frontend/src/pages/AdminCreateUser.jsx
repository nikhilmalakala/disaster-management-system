import { useState } from 'react';
import { adminCreateUser } from '../services/api';

export default function AdminCreateUser({ onCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('authority');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    adminCreateUser({ name, email, password, role })
      .then((res) => {
        alert('User created');
        setName(''); setEmail(''); setPassword(''); setRole('authority');
        onCreated?.();
      })
      .catch((err) => alert(err.response?.data?.message || 'Create failed'))
      .finally(() => setLoading(false));
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 rounded-xl bg-white/5 p-4">
      <div className="grid grid-cols-3 gap-3">
        <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-1 px-3 py-2 rounded bg-transparent border" />
        <input required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-1 px-3 py-2 rounded bg-transparent border" />
        <input required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-1 px-3 py-2 rounded bg-transparent border" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 rounded bg-transparent border">
          <option value="authority">Authority</option>
          <option value="admin">Admin</option>
        </select>
        <div />
        <button disabled={loading} type="submit" className="px-4 py-2 bg-red-600 rounded text-white">Create</button>
      </div>
    </form>
  );
}
