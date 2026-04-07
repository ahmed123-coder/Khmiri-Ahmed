import { useEffect, useState } from 'react';
import axios from 'axios';
import { Wrench, Plus, X, Pencil, Trash2, Upload, ImageIcon } from 'lucide-react';

const inp = 'w-full border rounded-lg px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500';
const inpStyle = { background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' };

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', icon: null, image: null });
  const [iconPreview, setIconPreview] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try { const res = await axios.get('http://localhost:3000/api/service'); setServices(res.data); }
    catch (err) { console.error(err); }
  };

  const handleFile = (field, file) => {
    if (!file) return;
    setFormData(prev => ({ ...prev, [field]: file }));
    const reader = new FileReader();
    reader.onloadend = () => { if (field === 'icon') setIconPreview(reader.result); else setImagePreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    if (formData.icon) payload.append('icon', formData.icon);
    if (formData.image) payload.append('image', formData.image);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      if (editingService) await axios.put(`http://localhost:3000/api/service/${editingService}`, payload, { headers });
      else await axios.post('http://localhost:3000/api/service', payload, { headers });
      resetForm(); fetchServices();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await axios.delete(`http://localhost:3000/api/service/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchServices();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (service) => {
    setEditingService(service._id);
    setFormData({ title: service.title, description: service.description, icon: null, image: null });
    setIconPreview(service.icon || ''); setImagePreview(service.image || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({ title: '', description: '', icon: null, image: null });
    setIconPreview(''); setImagePreview('');
  };

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1e293b' }}>{editingService ? 'Edit Service' : 'Manage Services'}</h1>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{services.length} service{services.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        {editingService && (
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
          <span className="text-sm font-semibold" style={{ color: '#1e293b' }}>{editingService ? 'Update Service' : 'Add New Service'}</span>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Title</label>
            <input placeholder="Service title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className={inp} style={inpStyle} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Description</label>
            <textarea placeholder="Describe this service..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={3} className={`${inp} resize-none`} style={inpStyle} />
          </div>

          {/* Icon upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Icon Image</label>
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all overflow-hidden"
              style={{ border: '2px dashed #e2e8f0', minHeight: '110px', background: '#fafafa' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
              {iconPreview
                ? <img src={iconPreview} alt="icon" className="h-14 w-14 object-contain rounded-full" style={{ border: '2px solid #e2e8f0' }} />
                : <><Upload className="w-5 h-5" style={{ color: '#cbd5e1' }} /><span className="text-xs" style={{ color: '#94a3b8' }}>Upload icon</span></>
              }
              <input type="file" accept="image/*" onChange={(e) => handleFile('icon', e.target.files[0])} className="hidden" />
            </label>
          </div>

          {/* Service image upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Service Image</label>
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all overflow-hidden"
              style={{ border: '2px dashed #e2e8f0', minHeight: '110px', background: '#fafafa' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
              {imagePreview
                ? <img src={imagePreview} alt="service" className="w-full object-cover rounded-xl" style={{ maxHeight: '110px' }} />
                : <><Upload className="w-5 h-5" style={{ color: '#cbd5e1' }} /><span className="text-xs" style={{ color: '#94a3b8' }}>Upload image</span></>
              }
              <input type="file" accept="image/*" onChange={(e) => handleFile('image', e.target.files[0])} className="hidden" />
            </label>
          </div>

          <div className="md:col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-opacity disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
              <Plus className="w-4 h-4" />
              {loading ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
            </button>
            {editingService && (
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-slate-50"
                style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Services grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>All Services ({services.length})</h2>
        {services.length === 0 && (
          <div className="rounded-2xl p-10 text-center text-sm" style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
            No services yet. Add your first one above.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service._id} className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group"
              style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
              {/* Cover image */}
              <div className="relative h-44 overflow-hidden" style={{ background: '#f8fafc' }}>
                {service.image
                  ? <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10" style={{ color: '#e2e8f0' }} /></div>
                }
                {/* Floating icon */}
                {service.icon && (
                  <div className="absolute bottom-0 left-4 translate-y-1/2 w-11 h-11 rounded-full overflow-hidden shadow-md flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)', border: '2px solid #fff' }}>
                    <img src={service.icon} alt="icon" className="w-6 h-6 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                  </div>
                )}
              </div>
              <div className="p-4 pt-7 space-y-2">
                <h3 className="font-bold text-sm" style={{ color: '#1e293b' }}>{service.title}</h3>
                <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: '#94a3b8' }}>{service.description}</p>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleEdit(service)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border transition-colors hover:bg-slate-50"
                    style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(service._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg transition-colors"
                    style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}>
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceManager;
