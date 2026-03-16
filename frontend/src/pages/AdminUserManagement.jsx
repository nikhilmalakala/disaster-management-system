import { useEffect, useState } from 'react';
import { adminGetUsers, adminUpdateUserRole } from '../services/api';
import AdminCreateUser from './AdminCreateUser';

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    adminGetUsers()
      .then((res) => setUsers(res.data.users || []))
      .catch((err) => console.error('adminGetUsers error', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => fetchUsers(), []);

  const handleChangeRole = (id, newRole) => {
    adminUpdateUserRole(id, { role: newRole })
      .then((res) => fetchUsers())
      .catch((err) => alert(err.response?.data?.message || 'Failed to update role'));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Admin - User Management</h2>
        <button onClick={() => setCreating((v) => !v)} className="px-3 py-2 rounded bg-red-600 text-white">{creating ? 'Close' : 'Create User'}</button>
      </div>
      {creating && <AdminCreateUser onCreated={() => { setCreating(false); fetchUsers(); }} />}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="rounded-xl bg-white/5 p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-white/5">
                  <td className="py-2">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <select value={u.role} onChange={(e) => handleChangeRole(u.id, e.target.value)} className="mr-2 bg-white/5 px-2 py-1 rounded">
                      <option value="citizen">Citizen</option>
                      <option value="authority">Authority</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
