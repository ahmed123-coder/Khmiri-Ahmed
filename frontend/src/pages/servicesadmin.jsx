import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', icon: null, image: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/service');
      setServices(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    if (formData.icon) payload.append('icon', formData.icon);
    if (formData.image) payload.append('image', formData.image);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      if (editingService) {
        await axios.put(`http://localhost:3000/api/service/${editingService}`, payload, { headers });
      } else {
        await axios.post('http://localhost:3000/api/service', payload, { headers });
      }
      resetForm();
      fetchServices();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/service/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchServices();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (service) => {
    setEditingService(service._id);
    setFormData({ title: service.title, description: service.description, icon: null, image: null });
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({ title: '', description: '', icon: null, image: null });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Services</h1>
        {editingService && (
          <Button variant="ghost" size="sm" onClick={resetForm} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4 mr-1" /> Cancel Edit
          </Button>
        )}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
            <div className="space-y-1">
              <label className="text-sm text-zinc-400">Icon image</label>
              <Input type="file" accept="image/*"
                onChange={(e) => setFormData({ ...formData, icon: e.target.files[0] })}
                className="bg-zinc-800 border-zinc-700 text-zinc-300" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-zinc-400">Service image</label>
              <Input type="file" accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                className="bg-zinc-800 border-zinc-700 text-zinc-300" />
            </div>
            <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service._id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
            {service.image && (
              <img src={service.image} alt={service.title} className="w-full h-40 object-cover" />
            )}
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                {service.icon && <img src={service.icon} alt="icon" className="w-8 h-8 object-contain rounded" />}
                <h3 className="font-semibold text-white">{service.title}</h3>
              </div>
              <p className="text-sm text-zinc-400 line-clamp-2">{service.description}</p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(service)}
                  className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 flex-1">
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(service._id)} className="flex-1">
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

export default ServiceManager;
