import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

const SkillsAdmin = () => {
  const [skills, setSkills] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', percentage: 50 });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    const res = await axios.get('http://localhost:3000/api/skill');
    setSkills(res.data);
  };

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`http://localhost:3000/api/skill/${editingId}`, form, { headers });
      } else {
        await axios.post('http://localhost:3000/api/skill', form, { headers });
      }
      setEditingId(null);
      setForm({ name: '', percentage: 50 });
      fetchSkills();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    await axios.delete(`http://localhost:3000/api/skill/${id}`, { headers });
    fetchSkills();
  };

  const handleEdit = (skill) => {
    setEditingId(skill._id);
    setForm({ name: skill.name, percentage: skill.percentage });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Skills</h1>
        {editingId && (
          <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setForm({ name: '', percentage: 50 }); }} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
        )}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">{editingId ? 'Edit Skill' : 'Add New Skill'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Skill name (e.g. React)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Percentage: <span className="text-violet-400 font-bold">{form.percentage}%</span></label>
              <input
                type="range"
                min="50"
                max="90"
                value={form.percentage}
                onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-xs text-zinc-500">
                <span>50%</span><span>90%</span>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : editingId ? 'Update Skill' : 'Add Skill'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <Card key={skill._id} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{skill.name}</p>
                <p className="text-violet-400 text-sm">{skill.percentage}%</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(skill)} className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(skill._id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SkillsAdmin;
