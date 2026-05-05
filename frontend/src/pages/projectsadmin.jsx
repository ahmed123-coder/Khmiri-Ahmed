import { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { FolderKanban, Plus, X, Pencil, Trash2, Upload, ImageIcon, ChevronUp, ChevronDown } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const inp = 'w-full border rounded-lg px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500';
const inpStyle = { background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' };

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try { const res = await api.get('/api/project'); setProjects(res.data); }
    catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (image) formData.append('image', image);
    try {
      if (editingId) await api.put(`/api/project/${editingId}`, formData);
      else await api.post('/api/project', formData);
      fetchProjects(); resetForm();
    } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  const handleDelete = (id) => setConfirmModal({ open: true, id });

  const confirmDelete = async () => {
    const id = confirmModal.id;
    setConfirmModal({ open: false, id: null });
    try {
      await api.delete(`/api/project/${id}`);
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
  };

  const handleEdit = (project) => {
    setTitle(project.title); setDescription(project.description);
    setImagePreview(project.image || ''); setEditingId(project._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { setTitle(''); setDescription(''); setImage(null); setImagePreview(''); setEditingId(null); };

  // Move a project up or down in the list and persist the new order
  const handleMove = async (index, direction) => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= projects.length) return;

    const updated = [...projects];
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];

    // Reassign order values to match new positions
    const reordered = updated.map((p, i) => ({ ...p, order: i }));
    setProjects(reordered); // optimistic update

    try {
      await api.put('/api/project/reorder', reordered.map(p => ({ id: p._id, order: p.order })));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save order');
      fetchProjects(); // revert on failure
    }
  };

  return (
    <div className="space-y-6 pb-10">

      <ConfirmModal
        open={confirmModal.open}
        title="Delete Project"
        message="This project will be permanently deleted."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ open: false, id: null })}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
            <FolderKanban className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1e293b' }}>{editingId ? 'Edit Project' : 'Manage Projects'}</h1>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        {editingId && (
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
          <span className="text-sm font-semibold" style={{ color: '#1e293b' }}>{editingId ? 'Update Project' : 'Add New Project'}</span>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Title</label>
            <input placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} required className={inp} style={inpStyle} />
          </div>

          {/* Image upload */}
          <div className="flex flex-col gap-1.5 md:row-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Project Image</label>
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all overflow-hidden"
              style={{ border: '2px dashed #e2e8f0', minHeight: '160px', background: '#fafafa' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
              {imagePreview
                ? <img src={imagePreview} alt="preview" className="w-full object-cover rounded-xl" style={{ maxHeight: '160px' }} />
                : <>
                  <Upload className="w-6 h-6" style={{ color: '#cbd5e1' }} />
                  <span className="text-xs" style={{ color: '#94a3b8' }}>Click to upload image</span>
                </>
              }
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Description</label>
            <textarea placeholder="Describe your project..." value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className={`${inp} resize-none`} style={inpStyle} />
          </div>

          <div className="md:col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-opacity disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
              <Plus className="w-4 h-4" />
              {loading ? 'Saving...' : editingId ? 'Update Project' : 'Add Project'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-slate-50"
                style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Projects list with ordering */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
            All Projects ({projects.length})
          </h2>
          {projects.length > 1 && (
            <p className="text-xs" style={{ color: '#cbd5e1' }}>Use ↑↓ arrows to reorder</p>
          )}
        </div>

        {projects.length === 0 && (
          <div className="rounded-2xl p-10 text-center text-sm" style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
            No projects yet. Add your first one above.
          </div>
        )}

        <div className="space-y-3">
          {projects.map((project, index) => (
            <div key={project._id}
              className="rounded-2xl overflow-hidden flex items-center gap-4 transition-all duration-200 hover:shadow-md"
              style={{ background: '#fff', border: '1px solid #e2e8f0' }}>

              {/* Order controls */}
              <div className="flex flex-col items-center gap-0.5 pl-3 flex-shrink-0">
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded-lg transition-colors disabled:opacity-20 hover:bg-slate-100"
                  style={{ color: '#64748b' }}
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold tabular-nums" style={{ color: '#cbd5e1' }}>{index + 1}</span>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === projects.length - 1}
                  className="p-1 rounded-lg transition-colors disabled:opacity-20 hover:bg-slate-100"
                  style={{ color: '#64748b' }}
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Thumbnail */}
              <div className="w-20 h-16 flex-shrink-0 overflow-hidden rounded-xl" style={{ background: '#f8fafc' }}>
                {project.image
                  ? <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6" style={{ color: '#e2e8f0' }} /></div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 py-4">
                <h3 className="font-bold text-sm truncate" style={{ color: '#1e293b' }}>{project.title}</h3>
                <p className="text-xs line-clamp-1 mt-0.5" style={{ color: '#94a3b8' }}>{project.description}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pr-4 flex-shrink-0">
                <button onClick={() => handleEdit(project)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-slate-50"
                  style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDelete(project._id)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}>
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageProjects;
