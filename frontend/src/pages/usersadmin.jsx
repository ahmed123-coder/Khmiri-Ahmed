import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

const API_URL = 'http://localhost:3000/api/user';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'user' });
  const [editingUser, setEditingUser] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) { console.error(err.response?.data || err.message); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (editingUser) {
        await axios.put(`${API_URL}/${editingUser._id}`, formData, { headers });
      } else {
        await axios.post(`${API_URL}/register`, formData, { headers });
      }
      fetchUsers(); resetForm();
    } catch (err) { console.error(err.response?.data || err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (err) { console.error(err.response?.data || err.message); }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: '', role: user.role });
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'user' });
  };

  const inputClass = 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Users</h1>
        {editingUser && (
          <Button variant="ghost" size="sm" onClick={resetForm} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4 mr-1" /> Cancel Edit
          </Button>
        )}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">{editingUser ? 'Edit User' : 'Add New User'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className={inputClass} />
            <Input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className={inputClass} />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              {editingUser ? 'Update' : 'Add User'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Username</TableHead>
                  <TableHead className="text-zinc-400">Role</TableHead>
                  <TableHead className="text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="text-white font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge className={user.role === 'admin' ? 'bg-violet-600 text-white' : 'bg-zinc-700 text-zinc-300'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(user)}
                          className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(user._id)}>
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageUsers;
