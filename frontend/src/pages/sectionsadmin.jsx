import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import {
  Layers, Plus, X, Pencil, Trash2, Eye, EyeOff, GripVertical, Upload,
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const inp =
  'w-full border rounded-lg px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500';
const inpStyle = { background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' };

const SECTION_KEYS = ['hero', 'skills', 'services', 'footer', 'about', 'projects'];

const KEY_COLORS = {
  hero:     { bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe' },
  skills:   { bg: '#fce7f3', color: '#be185d', border: '#fbcfe8' },
  services: { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' },
  footer:   { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
  about:    { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  projects: { bg: '#fef9c3', color: '#a16207', border: '#fde68a' },
};

const Field = ({ label, children, col2 = false }) => (
  <div className={`flex flex-col gap-1.5 ${col2 ? 'md:col-span-2' : ''}`}>
    <label
      className="text-xs font-semibold uppercase tracking-wider"
      style={{ color: '#64748b' }}
    >
      {label}
    </label>
    {children}
  </div>
);

// ─── SortableItem ────────────────────────────────────────────────────────────

const SortableItem = ({ section, onEdit, onDelete, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  const keyColor = KEY_COLORS[section.key] || KEY_COLORS.footer;
  const isHidden = !section.visible;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: '#fff',
        border: '1px solid #e2e8f0',
        opacity: isDragging ? 0.5 : isHidden ? 0.55 : 1,
      }}
      className="rounded-2xl p-4 flex items-center gap-3 transition-all hover:shadow-md"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1 rounded-lg transition-colors hover:bg-slate-100"
        style={{ color: '#cbd5e1', touchAction: 'none' }}
        aria-label="Drag to reorder"
        type="button"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Key badge */}
      <span
        className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
        style={{
          background: keyColor.bg,
          color: keyColor.color,
          border: `1px solid ${keyColor.border}`,
        }}
      >
        {section.key}
      </span>

      {/* Title + order */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: '#1e293b' }}>
          {section.title || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Untitled</span>}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
          Order: {section.order}
        </p>
      </div>

      {/* Visible / Hidden badge */}
      <span
        className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style={
          section.visible
            ? { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }
            : { background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }
        }
      >
        {section.visible ? 'Visible' : 'Hidden'}
      </span>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Toggle visibility */}
        <button
          onClick={() => onToggle(section._id)}
          className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors hover:bg-slate-50"
          style={{ color: '#64748b', borderColor: '#e2e8f0' }}
          title={section.visible ? 'Hide section' : 'Show section'}
          type="button"
        >
          {section.visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>

        {/* Edit */}
        <button
          onClick={() => onEdit(section)}
          className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors hover:bg-slate-50"
          style={{ color: '#64748b', borderColor: '#e2e8f0' }}
          title="Edit section"
          type="button"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(section._id)}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
          style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#fef2f2')}
          title="Delete section"
          type="button"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ─── SectionsAdminPage ───────────────────────────────────────────────────────

const emptyForm = {
  key: 'hero',
  title: '',
  subtitle: '',
  content: '',
  order: '',
  image: null,
};

const SectionsAdminPage = () => {
  const [sites, setSites] = useState([]);
  const [activeSiteId, setActiveSiteId] = useState(null);
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: null });

  const preDragSnapshot = useRef(null);
  const formRef = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor));

  // ── Derived helpers ──────────────────────────────────────────────────────

  const activeSite = sites.find((s) => s._id === activeSiteId);

  // ── Data fetching ────────────────────────────────────────────────────────

  const fetchSites = async () => {
    try {
      const res = await api.get('/api/site');
      const data = res.data;
      setSites(data);
      if (data.length > 0) {
        const selected = data.find((s) => s.selected === true) || data[0];
        setActiveSiteId(selected._id);
        setSections(sortSections(selected.sections || []));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load sites');
    }
  };

  const fetchSections = async (siteId) => {
    try {
      const res = await api.get('/api/site');
      const site = res.data.find((s) => s._id === siteId);
      if (site) setSections(sortSections(site.sections || []));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load sections');
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const sortSections = (arr) => [...arr].sort((a, b) => a.order - b.order);

  const resetForm = () => {
    setForm(emptyForm);
    setImagePreview('');
    setEditingId(null);
  };

  // ── Site selector ────────────────────────────────────────────────────────

  const handleSiteChange = (e) => {
    const id = e.target.value;
    setActiveSiteId(id);
    resetForm();
    fetchSections(id);
  };

  // ── Form handlers ────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleEdit = (section) => {
    setForm({
      key: section.key,
      title: section.title || '',
      subtitle: section.subtitle || '',
      content: section.content || '',
      order: section.order,
      image: null,
    });
    setImagePreview(section.image || '');
    setEditingId(section._id);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeSiteId) return;
    setLoading(true);

    const payload = new FormData();
    payload.append('key', form.key);
    if (form.title) payload.append('title', form.title);
    if (form.subtitle) payload.append('subtitle', form.subtitle);
    if (form.content) payload.append('content', form.content);
    if (form.order !== '') payload.append('order', form.order);
    if (form.image) payload.append('image', form.image);

    try {
      if (editingId) {
        await api.put(`/api/site/${activeSiteId}/sections/${editingId}`, payload);
        toast.success('Section updated');
      } else {
        await api.post(`/api/site/${activeSiteId}/sections`, payload);
        toast.success('Section created');
      }
      resetForm();
      fetchSections(activeSiteId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving section');
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = (id) => setConfirmModal({ open: true, id });

  const confirmDelete = async () => {
    const id = confirmModal.id;
    setConfirmModal({ open: false, id: null });
    try {
      await api.delete(`/api/site/${activeSiteId}/sections/${id}`);
      toast.success('Section deleted');
      fetchSections(activeSiteId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting section');
    }
  };

  // ── Toggle visibility ────────────────────────────────────────────────────

  const handleToggle = async (sectionId) => {
    try {
      await api.put(`/api/site/${activeSiteId}/sections/${sectionId}/toggle`);
      fetchSections(activeSiteId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error toggling visibility');
    }
  };

  // ── Drag-and-drop ────────────────────────────────────────────────────────

  const handleDragStart = () => {
    preDragSnapshot.current = sections;
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s._id === active.id);
    const newIndex = sections.findIndex((s) => s._id === over.id);
    const newOrder = arrayMove(sections, oldIndex, newIndex);

    // Optimistic update
    setSections(newOrder);

    try {
      await api.put(`/api/site/${activeSiteId}/sections/reorder`, {
        sectionIds: newOrder.map((s) => s._id),
      });
    } catch (err) {
      // Revert on failure
      setSections(preDragSnapshot.current);
      toast.error(err.response?.data?.message || 'Reorder failed, changes reverted');
    }
  };

  // ── Scroll to form ───────────────────────────────────────────────────────

  const scrollToForm = () => {
    resetForm();
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-10">
      <ConfirmModal
        open={confirmModal.open}
        title="Delete Section"
        message="This section will be permanently deleted."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ open: false, id: null })}
      />

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}
          >
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1e293b' }}>
              Manage Sections
            </h1>
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              {sections.length} section{sections.length !== 1 ? 's' : ''} for{' '}
              {activeSite?.siteName || '—'}
            </p>
          </div>
        </div>
        <button
          onClick={scrollToForm}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}
          type="button"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      {/* Site selector */}
      <div
        className="rounded-2xl p-5"
        style={{ background: '#fff', border: '1px solid #e2e8f0' }}
      >
        {sites.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: '#94a3b8' }}>
            No sites found. Create a site first in Manage Sites.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#64748b' }}
            >
              Active Site
            </label>
            <select
              value={activeSiteId || ''}
              onChange={handleSiteChange}
              className={inp}
              style={inpStyle}
            >
              {sites.map((site) => (
                <option key={site._id} value={site._id}>
                  {site.siteName || site._id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Section form */}
      {sites.length > 0 && (
        <div
          ref={formRef}
          className="rounded-2xl shadow-sm overflow-hidden"
          style={{ background: '#fff', border: '1px solid #e2e8f0' }}
        >
          <div
            className="px-6 py-4 flex items-center gap-2"
            style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}
          >
            <Plus className="w-4 h-4" style={{ color: '#7c3aed' }} />
            <span className="text-sm font-semibold" style={{ color: '#1e293b' }}>
              {editingId ? 'Edit Section' : 'Add New Section'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Key */}
            <Field label="Section Key">
              <select
                name="key"
                value={form.key}
                onChange={handleInputChange}
                required
                className={inp}
                style={inpStyle}
              >
                {SECTION_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k.charAt(0).toUpperCase() + k.slice(1)}
                  </option>
                ))}
              </select>
            </Field>

            {/* Order */}
            <Field label="Order">
              <input
                type="number"
                name="order"
                placeholder="Auto (appended to end)"
                value={form.order}
                onChange={handleInputChange}
                min="0"
                className={inp}
                style={inpStyle}
              />
            </Field>

            {/* Title */}
            <Field label="Title">
              <input
                type="text"
                name="title"
                placeholder="Section title..."
                value={form.title}
                onChange={handleInputChange}
                className={inp}
                style={inpStyle}
              />
            </Field>

            {/* Subtitle */}
            <Field label="Subtitle">
              <input
                type="text"
                name="subtitle"
                placeholder="Section subtitle..."
                value={form.subtitle}
                onChange={handleInputChange}
                className={inp}
                style={inpStyle}
              />
            </Field>

            {/* Content */}
            <Field label="Content" col2>
              <textarea
                name="content"
                placeholder="Section content..."
                value={form.content}
                onChange={handleInputChange}
                rows={3}
                className={`${inp} resize-none`}
                style={inpStyle}
              />
            </Field>

            {/* Image upload */}
            <Field label="Image" col2>
              <label
                className="flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all overflow-hidden"
                style={{ border: '2px dashed #e2e8f0', minHeight: '100px', background: '#fafafa' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#7c3aed')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Section preview"
                    className="h-20 object-contain rounded"
                  />
                ) : (
                  <>
                    <Upload className="w-5 h-5" style={{ color: '#cbd5e1' }} />
                    <span className="text-xs" style={{ color: '#94a3b8' }}>
                      Click to upload image
                    </span>
                  </>
                )}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => { setImagePreview(''); setForm((p) => ({ ...p, image: null })); }}
                  className="text-xs mt-1 self-start flex items-center gap-1 transition-colors hover:opacity-70"
                  style={{ color: '#ef4444' }}
                >
                  <X className="w-3 h-3" /> Remove image
                </button>
              )}
            </Field>

            {/* Actions */}
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-opacity disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}
              >
                <Plus className="w-4 h-4" />
                {loading ? 'Saving...' : editingId ? 'Update Section' : 'Add Section'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-slate-50"
                  style={{ color: '#64748b', borderColor: '#e2e8f0' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Section list */}
      {sites.length > 0 && (
        <div className="space-y-3">
          <h2
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: '#94a3b8' }}
          >
            Sections ({sections.length})
          </h2>

          {sections.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center text-sm"
              style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#94a3b8' }}
            >
              No sections yet. Add your first one above.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s._id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sections.map((section) => (
                    <SortableItem
                      key={section._id}
                      section={section}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionsAdminPage;
