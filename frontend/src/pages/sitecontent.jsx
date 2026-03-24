// SiteManagementPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import '../styles/siteManagement.css';

const API_URL = 'http://localhost:3000/api/site';

const SiteManagementPage = () => {
  const [token] = useState(localStorage.getItem('token'));
  const [sites, setSites] = useState([]);
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    hero: '',
    footer: '',
    contactEmail: '',
    emailuser: '',
    passworduser: '',
    logoheader: null,
    logohero: null
  });
  const [logoheaderPreview, setLogoheaderPreview] = useState('');
  const [logoheroPreview, setLogoheroPreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error('يرجى تسجيل الدخول');
      navigate('/login');
      return;
    }
    fetchSites();
  }, []);

  const fetchSites = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setSites(response.data);
    } catch (error) {
      toast.error('خطأ في تحميل المواقع');
      console.error('Error selecting site: ', err.response ? err.response.data : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [name]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (name === 'logoheader') setLogoheaderPreview(reader.result);
        if (name === 'logohero') setLogoheroPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        formDataToSend.append(key, value);
      }
    });

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formDataToSend, config);
        toast.success('تم التحديث بنجاح');
      } else {
        await axios.post(API_URL, formDataToSend, config);
        toast.success('تم الإنشاء بنجاح');
      }
      fetchSites();
      resetForm();
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ');
      console.error('Error selecting site: ', err.response ? err.response.data : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (site) => {
    setFormData({
      siteName: site.siteName,
      siteDescription: site.siteDescription,
      hero: site.hero,
      footer: site.footer,
      contactEmail: site.contactEmail,
      emailuser: site.emailuser,
      passworduser: site.passworduser,
      logoheader: null,
      logohero: null
    });
    setLogoheaderPreview(site.logoheader || '');
    setLogoheroPreview(site.logohero || '');
    setEditingId(site._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من الحذف؟')) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('تم الحذف');
        fetchSites();
      } catch (err) {
        toast.error('حدث خطأ أثناء الحذف');
        console.error(err);
      console.error('Error selecting site: ', err.response ? err.response.data : err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectSite = async (id) => {
    setIsLoading(true);
    try {
      await axios.put(`${API_URL}/${id}/select`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('تم تحديد الموقع');
      fetchSites();
    } catch (err) {
      toast.error('خطأ في تحديد الموقع');
      console.error(err);
      console.error('Error selecting site: ', err.response ? err.response.data : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeselectSite = async (id) => {
    setIsLoading(true);
    try {
      await axios.put(`${API_URL}/${id}/deselect`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('تم إلغاء التحديد');
      fetchSites();
    } catch (err) {
      toast.error('خطأ في إلغاء التحديد');
      console.error(err);
      console.error('Error selecting site: ', err.response ? err.response.data : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      siteName: '',
      siteDescription: '',
      hero: '',
      footer: '',
      contactEmail: '',
      emailuser: '',
      passworduser: '',
      logoheader: null,
      logohero: null
    });
    setLogoheaderPreview('');
    setLogoheroPreview('');
    setEditingId(null);
  };

  return (
    <div className="site-management-container">
      <h1>{editingId ? 'تعديل الموقع' : 'إضافة موقع'}</h1>
      <form onSubmit={handleSubmit} className="site-form">
        {/* بقية الحقول */}
        <input type="text" name="siteName" value={formData.siteName} onChange={handleInputChange} required />
        <textarea name="siteDescription" value={formData.siteDescription} onChange={handleInputChange} required />
        <textarea name="hero" value={formData.hero} onChange={handleInputChange} required />
        <textarea name="footer" value={formData.footer} onChange={handleInputChange} required />
        <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} required />
        <input type="email" name="emailuser" value={formData.emailuser} onChange={handleInputChange} required />
        <input type="password" name="passworduser" value={formData.passworduser} onChange={handleInputChange} required />
        <input type="file" name="logoheader" onChange={handleFileChange} />
        {logoheaderPreview && <img src={logoheaderPreview} alt="header preview" />}
        <input type="file" name="logohero" onChange={handleFileChange} />
        {logoheroPreview && <img src={logoheroPreview} alt="hero preview" />}
        <button type="submit" disabled={isLoading}>{editingId ? 'تحديث' : 'حفظ'}</button>
        {editingId && <button type="button" onClick={resetForm}>إلغاء</button>}
      </form>

      <h2>قائمة المواقع</h2>
      <table>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الوصف</th>
            <th>التحديد</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {sites.map(site => (
            <tr key={site._id}>
              <td>{site.siteName}</td>
              <td>{site.siteDescription}</td>
              <td>{site.selected === 'selected' ? '✅' : '❌'}</td>
              <td className="actions">
                <button onClick={() => handleEdit(site)}>تعديل</button>
                <button onClick={() => handleDelete(site._id)}>حذف</button>
                {site.selected === 'selected' ? (
                  <button onClick={() => handleDeselectSite(site._id)}>إلغاء التحديد</button>
                ) : (
                  <button onClick={() => handleSelectSite(site._id)}>تحديد</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SiteManagementPage;
