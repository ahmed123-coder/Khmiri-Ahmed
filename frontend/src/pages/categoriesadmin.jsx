import { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { Layers, Plus, X, Pencil, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const inp = 'w-full border rounded-lg px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500';
const inpStyle = { background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' };

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/category');
      setCategories(res.data);
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/api/category/${editingId}`, { name });
        toast.success('Category updated');
      } else {
        await api.post('/api/category', { name });
        toast.success('Category created');
      }
      fetchCategories();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => setConfirmModal({ open: true, id });

  const confirmDelete = async () => {
    const id = confirmModal.id;
    setConfirmModal({ open: false, id: null });
    try {
      await api.delete(`/api/category/${id}`);
      toast.success('Deleted');
      fetchCategories();
    } catch (err) {
      toast.error('Error deleting category');
    }
  };

  const handleEdit = (cat) => {
    setName(cat.name);
    setEditingId(cat._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setName('');
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-10">
      <ConfirmModal
        open={confirmModal.open}
        title="Delete Category"
        message="Projects using this category will no longer show it. This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ open: false, id: null })}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1e293b' }}>Manage Categories</h1>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{categories.length} total</p>
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
        <form onSubmit={handleSubmit} className="p-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Category Name</label>
            <input 
              placeholder="e.g. Web Design, Mobile App, UI/UX" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className={inp} 
              style={inpStyle} 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] disabled:opacity-60 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}
          >
            {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingId ? 'Update' : 'Add Category'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-violet-600 font-bold text-xs">
                {cat.name.charAt(0)}
              </div>
              <span className="font-semibold text-slate-700">{cat.name}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(cat)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={16} /></button>
              <button onClick={() => handleDelete(cat._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageCategories;
