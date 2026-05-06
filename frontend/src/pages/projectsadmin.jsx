import { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { FolderKanban, Plus, X, Pencil, Trash2, Upload, ImageIcon, ChevronUp, ChevronDown, Video, Tag, Globe, Layers, Calendar } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const inp = 'w-full border rounded-lg px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500';
const inpStyle = { background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' };

const Field = ({ label, children, col2 = false }) => (
  <div className={`flex flex-col gap-1.5 ${col2 ? 'md:col-span-2' : ''}`}>
    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>
    {children}
  </div>
);

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]); // All available categories
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]); // Selected for current project
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState('');
  const [link, setLink] = useState('');
  const [slug, setSlug] = useState('');
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  
  const [videoFile, setVideoFile] = useState(null);
  const [videoLink, setVideoLink] = useState(''); 

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });

  useEffect(() => { 
    fetchProjects(); 
    fetchCategories();
  }, []);

  const fetchProjects = async () => {
    try { const res = await api.get('/api/project'); setProjects(res.data); }
    catch (err) { toast.error('Failed to load projects'); }
  };

  const fetchCategories = async () => {
    try { const res = await api.get('/api/category'); setCategories(res.data); }
    catch (err) { toast.error('Failed to load categories'); }
  };

  const handleCategoryToggle = (catId) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setGalleryPreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryPreview = (index, isExisting = false) => {
    if (isExisting) {
      setExistingGallery(prev => prev.filter((_, i) => i !== index));
    } else {
      setGalleryFiles(prev => prev.filter((_, i) => i !== index));
      setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categories', JSON.stringify(selectedCategories));
    formData.append('date', date);
    formData.append('link', link);
    formData.append('slug', slug);
    formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)));
    
    if (image) formData.append('image', image);
    galleryFiles.forEach(file => formData.append('images', file));
    
    if (editingId) {
      formData.append('keepImages', JSON.stringify(existingGallery));
    }
    if (videoLink) formData.append('video', videoLink);

    try {
      let res;
      if (editingId) res = await api.put(`/api/project/${editingId}`, formData);
      else res = await api.post('/api/project', formData);

      if (videoFile) {
        const videoFormData = new FormData();
        videoFormData.append('video', videoFile);
        await api.post(`/api/project/${res.data._id}/video`, videoFormData);
      }

      toast.success(editingId ? 'Project updated' : 'Project created');
      fetchProjects(); resetForm();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Error saving project'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = (id) => setConfirmModal({ open: true, id });

  const confirmDelete = async () => {
    const id = confirmModal.id;
    setConfirmModal({ open: false, id: null });
    try {
      await api.delete(`/api/project/${id}`);
      toast.success('Deleted');
      fetchProjects();
    } catch (err) { toast.error('Error deleting project'); }
  };

  const handleEdit = (project) => {
    setTitle(project.title || '');
    setDescription(project.description || '');
    setSelectedCategories(project.categories?.map(c => typeof c === 'object' ? c._id : c) || []);
    setDate(project.date ? new Date(project.date).toISOString().split('T')[0] : '');
    setTags(project.tags ? project.tags.join(', ') : '');
    setLink(project.link || '');
    setSlug(project.slug || '');
    setVideoLink(project.video || '');
    
    setImagePreview(project.image || '');
    setImage(null);
    
    setExistingGallery(project.images || []);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setVideoFile(null);
    
    setEditingId(project._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setSelectedCategories([]); setDate(new Date().toISOString().split('T')[0]);
    setTags(''); setLink(''); setSlug(''); setVideoLink('');
    setImage(null); setImagePreview('');
    setGalleryFiles([]); setGalleryPreviews([]); setExistingGallery([]);
    setVideoFile(null);
    setEditingId(null);
  };

  const handleMove = async (index, direction) => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= projects.length) return;
    const updated = [...projects];
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    const reordered = updated.map((p, i) => ({ ...p, order: i }));
    setProjects(reordered);
    try {
      await api.put('/api/project/reorder', reordered.map(p => ({ id: p._id, order: p.order })));
    } catch (err) {
      toast.error('Failed to save order');
      fetchProjects();
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
            <FolderKanban className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1e293b' }}>{editingId ? 'Edit Project' : 'Manage Projects'}</h1>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{projects.length} total</p>
          </div>
        </div>
        {editingId && (
          <button onClick={resetForm} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors hover:bg-slate-50"
            style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
            <X className="w-3.5 h-3.5" /> Cancel Edit
          </button>
        )}
      </div>

      <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Title"><input placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} required className={inp} style={inpStyle} /></Field>
          <Field label="Slug (optional)"><input placeholder="my-awesome-project" value={slug} onChange={(e) => setSlug(e.target.value)} className={inp} style={inpStyle} /></Field>

          <Field label="Categories (Select Multiple)" col2>
            <div className="flex flex-wrap gap-2 p-3 border rounded-xl bg-slate-50 border-slate-200">
              {categories.length === 0 && <p className="text-xs text-slate-400">No categories found. Create some in Category Management.</p>}
              {categories.map(cat => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => handleCategoryToggle(cat._id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedCategories.includes(cat._id)
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Completion Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp} style={inpStyle} /></Field>
          <Field label="External Link"><input placeholder="https://demo.com" value={link} onChange={(e) => setLink(e.target.value)} className={inp} style={inpStyle} /></Field>
          <Field label="Tech Stack (comma-separated)"><input placeholder="React, Node.js" value={tags} onChange={(e) => setTags(e.target.value)} className={inp} style={inpStyle} /></Field>

          <Field label="Main Cover Image">
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all overflow-hidden border-2 border-dashed bg-slate-50 hover:bg-slate-100 min-h-[160px] border-slate-200">
              {imagePreview ? <img src={imagePreview} className="w-full object-cover" style={{ maxHeight: '160px' }} alt="" /> : <><Upload className="text-slate-300" /><span className="text-xs text-slate-400">Click to upload</span></>}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </Field>

          <Field label="Video URL / Upload"><input placeholder="YouTube link" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} className={inp} style={inpStyle} /><input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="mt-2 text-xs" /></Field>

          <Field label="Gallery (Multiple)" col2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {existingGallery.map((url, idx) => (
                <div key={`ex-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200"><img src={url} className="w-full h-full object-cover" alt="" /><button type="button" onClick={() => removeGalleryPreview(idx, true)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10} /></button></div>
              ))}
              {galleryPreviews.map((src, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-violet-200"><img src={src} className="w-full h-full object-cover" alt="" /><button type="button" onClick={() => removeGalleryPreview(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X size={10} /></button></div>
              ))}
              <label className="flex flex-col items-center justify-center aspect-square rounded-lg cursor-pointer border-2 border-dashed border-slate-200 hover:border-violet-400 hover:bg-slate-50"><Plus className="text-slate-300" /><input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="hidden" /></label>
            </div>
          </Field>

          <Field label="Full Description" col2><textarea placeholder="..." value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className={inp} style={inpStyle} /></Field>

          <div className="md:col-span-2 flex gap-3 pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
              {loading ? 'Saving...' : (editingId ? 'Update Project' : 'Create Project')}
            </button>
            {editingId && <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl text-sm font-semibold border bg-white text-slate-500">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Project Inventory</h2>
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project, index) => (
            <div key={project._id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1">
                  <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-1 text-slate-300 disabled:opacity-20"><ChevronUp size={16} /></button>
                  <span className="text-xs font-bold text-slate-400">{index + 1}</span>
                  <button onClick={() => handleMove(index, 'down')} disabled={index === projects.length - 1} className="p-1 text-slate-300 disabled:opacity-20"><ChevronDown size={16} /></button>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-800">{project.title}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.categories?.map(c => (
                          <span key={typeof c === 'object' ? c._id : c} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                            {typeof c === 'object' ? c.name : 'Unknown'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(project)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={18} /></button>
                      <button onClick={() => handleDelete(project._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </div>
                  
                  {/* Gallery View */}
                  <div className="flex flex-wrap gap-2">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-violet-400 shadow-sm" title="Cover Image">
                      <img src={project.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    {project.images?.map((img, i) => (
                      <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageProjects;

