import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus, X, CheckCircle, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:3000/api/site';

const SiteManagementPage = () => {
  const [token] = useState(localStorage.getItem('token'));
  const [sites, setSites] = useState([]);
  const [formData, setFormData] = useState({
    siteName: '', siteDescription: '', hero: '', footer: '',
    contactEmail: '', emailuser: '', passworduser: '', logoheader: null, logohero: null,
  });
  const [logoheaderPreview, setLogoheaderPreview] = useState('');
  const [logoheroPreview, setLogoheroPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { toast.error('Please login'); navigate('/login'); return; }
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const res = await axios.get(API_URL);
      setSites(res.data);
    } catch { toast.error('Failed to load sites'); }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, [name]: file }));
    const reader = new FileReader();
    reader.onloadend = () => {
      if (name === 'logoheader') setLogoheaderPreview(reader.result);
      if (name === 'logohero') setLogoheroPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => { if (v !== null && v !== '') payload.append(k, v); });
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' };
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload, { headers });
        toast.success('Site updated');
      } else {
        await axios.post(API_URL, payload, { headers });
        toast.success('Site created');
      }
      fetchSites(); resetForm();
    } catch (err) {
      toast.error('Error saving site');
      console.error(err.response?.data || err.message);
    } finally { setLoading(false); }
  };

  const handleEdit = (site) => {
    setFormData({
      siteName: site.siteName, siteDescription: site.siteDescription,
      hero: site.hero, footer: site.footer, contactEmail: site.contactEmail,
      emailuser: site.emailuser, passworduser: site.passworduser,
      logoheader: null, logohero: null,
    });
    setLogoheaderPreview(site.logoheader || '');
    setLogoheroPreview(site.logohero || '');
    setEditingId(site._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this site?')) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Site deleted'); fetchSites();
    } catch { toast.error('Error deleting site'); }
    finally { setLoading(false); }
  };

  const handleSelect = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/select`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Site selected'); fetchSites();
    } catch { toast.error('Error selecting site'); }
  };

  const handleDeselect = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/deselect`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Site deselected'); fetchSites();
    } catch { toast.error('Error deselecting site'); }
  };

  const resetForm = () => {
    setFormData({ siteName: '', siteDescription: '', hero: '', footer: '', contactEmail: '', emailuser: '', passworduser: '', logoheader: null, logohero: null });
    setLogoheaderPreview(''); setLogoheroPreview(''); setEditingId(null);
  };

  const inputClass = 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Site Content</h1>
        {editingId && (
          <Button variant="ghost" size="sm" onClick={resetForm} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
        )}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">{editingId ? 'Edit Site' : 'Add New Site'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="siteName" placeholder="Site Name" value={formData.siteName} onChange={handleInputChange} required className={inputClass} />
            <Input type="email" name="contactEmail" placeholder="Contact Email" value={formData.contactEmail} onChange={handleInputChange} required className={inputClass} />
            <Textarea name="siteDescription" placeholder="Site Description" value={formData.siteDescription} onChange={handleInputChange} required className={`${inputClass} md:col-span-2`} />
            <Textarea name="hero" placeholder="Hero text" value={formData.hero} onChange={handleInputChange} required className={inputClass} />
            <Textarea name="footer" placeholder="Footer text" value={formData.footer} onChange={handleInputChange} required className={inputClass} />
            <Input type="email" name="emailuser" placeholder="Email user" value={formData.emailuser} onChange={handleInputChange} required className={inputClass} />
            <Input type="password" name="passworduser" placeholder="Email password" value={formData.passworduser} onChange={handleInputChange} required className={inputClass} />

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Header Logo</label>
              <Input type="file" name="logoheader" accept="image/*" onChange={handleFileChange} className={inputClass} />
              {logoheaderPreview && <img src={logoheaderPreview} alt="header preview" className="h-16 rounded object-contain" />}
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Hero Logo</label>
              <Input type="file" name="logohero" accept="image/*" onChange={handleFileChange} className={inputClass} />
              {logoheroPreview && <img src={logoheroPreview} alt="hero preview" className="h-16 rounded object-contain" />}
            </div>

            <div className="md:col-span-2 flex gap-3">
              <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : editingId ? 'Update Site' : 'Add Site'}
              </Button>
              {editingId && <Button type="button" variant="outline" onClick={resetForm} className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">Cancel</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg">Sites List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Name</TableHead>
                  <TableHead className="text-zinc-400">Description</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((site) => (
                  <TableRow key={site._id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="text-white font-medium">{site.siteName}</TableCell>
                    <TableCell className="text-zinc-400 max-w-xs truncate">{site.siteDescription}</TableCell>
                    <TableCell>
                      <Badge className={site.selected === 'selected' ? 'bg-green-600 text-white' : 'bg-zinc-700 text-zinc-300'}>
                        {site.selected === 'selected' ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(site)}
                          className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(site._id)}>
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                        {site.selected === 'selected' ? (
                          <Button size="sm" variant="outline" onClick={() => handleDeselect(site._id)}
                            className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                            <XCircle className="w-3 h-3 mr-1" /> Deselect
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleSelect(site._id)}
                            className="bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" /> Select
                          </Button>
                        )}
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

export default SiteManagementPage;
