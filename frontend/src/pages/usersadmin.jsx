import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, X, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

const API_URL = 'http://localhost:3000/api/user';

const inp = 'w-full border rounded-lg px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500';
const inpStyle = { background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' };

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'user' });
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (editingUser) await axios.put(`${API_URL}/${editingUser._id}`, formData, { headers });
      else await axios.post(`${API_URL}/register`, formData, { headers });
      fetchUsers(); resetForm();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: '', role: user.role });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'user' });
  };

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1e293b' }}>{editingUser ? 'Edit User' : 'Manage Users'}</h1>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{users.length} user{users.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        {editingUser && (
          <button onClick={resetForm} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors hover:bg-slate-50"
            style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
            <X className="w-3.5 h-3.5" /> Cancel Edit
          </button>
        )}
      </div>

      {/* Form */}
      <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
        <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
          <Plus className="w-4 h-4" style={{ color: '#7c3aed' }} />
          <span className="text-sm font-semibold" style={{ color: '#1e293b' }}>{editingUser ? 'Update User' : 'Add New User'}</span>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Username</label>
            <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className={inp} style={inpStyle} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className={`${inp} pr-10`} style={inpStyle} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: '#94a3b8' }}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} className={inp} style={inpStyle}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="md:col-span-3 flex gap-3">
            <button type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md"
              style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
              <Plus className="w-4 h-4" />
              {editingUser ? 'Update User' : 'Add User'}
            </button>
            {editingUser && (
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-slate-50"
                style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Users table */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>All Users ({users.length})</h2>
        {users.length === 0 && (
          <div className="rounded-2xl p-10 text-center text-sm" style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
            No users yet. Add your first one above.
          </div>
        )}
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Username</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Role</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user._id} style={{ borderBottom: idx < users.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                    className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm" style={{ color: '#1e293b' }}>{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={user.role === 'admin'
                          ? { background: '#ede9fe', color: '#7c3aed', border: '1px solid #ddd6fe' }
                          : { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(user)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-slate-50"
                          style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => handleDelete(user._id)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                          style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}>
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
