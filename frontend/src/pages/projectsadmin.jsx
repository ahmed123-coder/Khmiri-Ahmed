import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/project');
      setProjects(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (image) formData.append('image', image);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      if (editingId) {
        await axios.put(`http://localhost:3000/api/project/${editingId}`, formData, { headers });
      } else {
        await axios.post('http://localhost:3000/api/project', formData, { headers });
      }
      fetchProjects();
      resetForm();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/project/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchProjects();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (project) => {
    setTitle(project.title);
    setDescription(project.description);
    setEditingId(project._id);
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setImage(null); setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Projects</h1>
        {editingId && (
          <Button variant="ghost" size="sm" onClick={resetForm} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4 mr-1" /> Cancel Edit
          </Button>
        )}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            {editingId ? 'Edit Project' : 'Add New Project'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="bg-zinc-800 border-zinc-700 text-zinc-300"
            />
            <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : editingId ? 'Update Project' : 'Add Project'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project._id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
            {project.image && (
              <img src={project.image} alt={project.title} className="w-full h-40 object-cover" />
            )}
            <CardContent className="p-4 space-y-2">
              <h3 className="font-semibold text-white">{project.title}</h3>
              <p className="text-sm text-zinc-400 line-clamp-2">{project.description}</p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(project)}
                  className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 flex-1">
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(project._id)} className="flex-1">
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageProjects;
