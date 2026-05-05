import { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Globe, Plus, X, Pencil, Trash2, CheckCircle, XCircle, Upload } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = '/api/site';

const Field = ({ label, children, col2 = false }) => (
  <div className={`flex flex-col gap-1.5 ${col2 ? 'md:col-span-2' : ''}`}>
    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{label}</label>
    {children}
  </div>
);

const inp = 'w-full border rounded-lg px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500';
const inpStyle = { background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' };

const SiteManagementPage = () => {
  const [token] = useState(localStorage.getItem('token'));
  const [sites, setSites] = useState([]);
  const [formData, setFormData] = useState({
    siteName: '', contactEmail: '', logoheader: null,
    roles: '', linkedIn: '', facebook: '', instagram: '',
  });
  const [logoheaderPreview, setLogoheaderPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { toast.error('Please login'); navigate('/login'); return; }
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try { const res = await api.get(API_URL); setSites(res.data); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to load sites'); }
  };

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, [name]: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      if (name === 'logoheader') setLogoheaderPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => { if (v !== null && v !== '') payload.append(k, v); });
    try {
      if (editingId) { await api.put(`${API_URL}/${editingId}`, payload); toast.success('Site updated'); }
      else { await api.post(API_URL, payload); toast.success('Site created'); }
      fetchSites(); resetForm();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving site'); }
    finally { setLoading(false); }
  };

  const handleEdit = (site) => {
    setFormData({
      siteName: site.siteName || '',
      contactEmail: site.contactEmail || '',
      logoheader: null,
      roles: (site.roles || []).join(', '),
      linkedIn: site.linkedIn || '',
      facebook: site.facebook || '',
      instagram: site.instagram || '',
    });
    setLogoheaderPreview(site.logoheader || '');
    setEditingId(site._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => setConfirmModal({ open: true, id });

  const confirmDelete = async () => {
    const id = confirmModal.id;
    setConfirmModal({ open: false, id: null });
    try { await api.delete(`${API_URL}/${id}`); toast.success('Deleted'); fetchSites(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error deleting'); }
  };

  const handleSelect = async (id) => {
    try { await api.put(`${API_URL}/${id}/select`, {}); toast.success('Activated'); fetchSites(); }
    catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
  };

  const handleDeselect = async (id) => {
    try { await api.put(`${API_URL}/${id}/deselect`, {}); toast.success('Deactivated'); fetchSites(); }
    catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
  };

  const resetForm = () => {
    setFormData({ siteName: '', contactEmail: '', logoheader: null, roles: '', linkedIn: '', facebook: '', instagram: '' });
    setLogoheaderPreview('');
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-10">

      <ConfirmModal
        open={confirmModal.open}
        title="Delete Site"
        message="This site configuration will be permanently deleted."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ open: false, id: null })}
      />

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1e293b' }}>Manage Sites</h1>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{sites.length} site{sites.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        {editingId && (
          <button onClick={resetForm} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors hover:bg-slate-50"
            style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
            <X className="w-3.5 h-3.5" /> Cancel Edit
          </button>
        )}
      </div>

      {/* Form card */}
      <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
        <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
          <Plus className="w-4 h-4" style={{ color: '#7c3aed' }} />
          <span className="text-sm font-semibold" style={{ color: '#1e293b' }}>{editingId ? 'Edit Site' : 'Add New Site'}</span>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

          <Field label="Site Name">
            <input name="siteName" placeholder="My Portfolio" value={formData.siteName} onChange={handleInputChange} required className={inp} style={inpStyle} />
          </Field>

          <Field label="Contact Email">
            <input type="email" name="contactEmail" placeholder="contact@example.com" value={formData.contactEmail} onChange={handleInputChange} required className={inp} style={inpStyle} />
          </Field>

          <Field label="Roles (comma-separated)" col2>
            <input name="roles" placeholder="Web Developer, UI/UX Designer, Freelancer" value={formData.roles} onChange={handleInputChange} className={inp} style={inpStyle} />
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Used for the typewriter effect in the banner. Separate each role with a comma.</p>
          </Field>

          <Field label="LinkedIn URL">
            <input name="linkedIn" placeholder="https://linkedin.com/in/yourprofile" value={formData.linkedIn} onChange={handleInputChange} className={inp} style={inpStyle} />
          </Field>

          <Field label="Facebook URL">
            <input name="facebook" placeholder="https://facebook.com/yourprofile" value={formData.facebook} onChange={handleInputChange} className={inp} style={inpStyle} />
          </Field>

          <Field label="Instagram URL">
            <input name="instagram" placeholder="https://instagram.com/yourprofile" value={formData.instagram} onChange={handleInputChange} className={inp} style={inpStyle} />
          </Field>

          <Field label="Header Logo">
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all group overflow-hidden"
              style={{ border: '2px dashed #e2e8f0', minHeight: '100px', background: '#fafafa' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
              {logoheaderPreview
                ? <img src={logoheaderPreview} alt="header logo" className="h-14 object-contain rounded" />
                : <><Upload className="w-5 h-5" style={{ color: '#cbd5e1' }} /><span className="text-xs" style={{ color: '#94a3b8' }}>Click to upload</span></>
              }
              <input type="file" name="logoheader" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </Field>

          <div className="md:col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-opacity disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
              <Plus className="w-4 h-4" />
              {loading ? 'Saving...' : editingId ? 'Update Site' : 'Add Site'}
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

      {/* Sites list */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>All Sites</h2>
        {sites.length === 0 && (
          <div className="rounded-2xl p-10 text-center text-sm" style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
            No sites yet. Add your first one above.
          </div>
        )}
        {sites.map((site) => (
          <div key={site._id} className="rounded-2xl p-5 transition-all hover:shadow-md" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 min-w-0">
                {site.logoheader && <img src={site.logoheader} alt="logo" className="w-10 h-10 rounded-lg object-contain p-1" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }} />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: '#1e293b' }}>{site.siteName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={site.selected === true
                        ? { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }
                        : { background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                      {site.selected === true ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 truncate max-w-sm" style={{ color: '#94a3b8' }}>{site.siteDescription}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#cbd5e1' }}>{site.contactEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => handleEdit(site)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-slate-50"
                  style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDelete(site._id)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}>
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
                {site.selected === true ? (
                  <button onClick={() => handleDeselect(site._id)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-slate-50"
                    style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
                    <XCircle className="w-3 h-3" /> Deactivate
                  </button>
                ) : (
                  <button onClick={() => handleSelect(site._id)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#dcfce7'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}>
                    <CheckCircle className="w-3 h-3" /> Activate
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SiteManagementPage;
