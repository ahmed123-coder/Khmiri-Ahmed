import { useEffect, useState } from 'react';
import axios from 'axios';
import { Zap, Plus, X, Pencil, Trash2 } from 'lucide-react';

const inp = 'w-full border rounded-lg px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500';
const inpStyle = { background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' };

const SkillsAdmin = () => {
  const [skills, setSkills] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', percentage: 50 });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    const res = await axios.get('http://localhost:3000/api/skill');
    setSkills(res.data);
  };

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editingId) await axios.put(`http://localhost:3000/api/skill/${editingId}`, form, { headers });
      else await axios.post('http://localhost:3000/api/skill', form, { headers });
      setEditingId(null); setForm({ name: '', percentage: 50 }); fetchSkills();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    await axios.delete(`http://localhost:3000/api/skill/${id}`, { headers });
    fetchSkills();
  };

  const handleEdit = (skill) => {
    setEditingId(skill._id); setForm({ name: skill.name, percentage: skill.percentage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => { setEditingId(null); setForm({ name: '', percentage: 50 }); };

  // circular svg
  const radius = 36, circ = 2 * Math.PI * radius;

  return (
    <div className="space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#1e293b' }}>{editingId ? 'Edit Skill' : 'Manage Skills'}</h1>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{skills.length} skill{skills.length !== 1 ? 's' : ''} total</p>
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
          <span className="text-sm font-semibold" style={{ color: '#1e293b' }}>{editingId ? 'Update Skill' : 'Add New Skill'}</span>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Skill Name</label>
            <input placeholder="e.g. React, Node.js..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inp} style={inpStyle} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>Percentage</label>
              <span className="text-sm font-bold px-3 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)', color: '#fff' }}>
                {form.percentage}%
              </span>
            </div>
            <div className="relative">
              <input type="range" min="50" max="90" value={form.percentage}
                onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: '#7c3aed', background: `linear-gradient(to right, #AA367C ${((form.percentage - 50) / 40) * 100}%, #e2e8f0 ${((form.percentage - 50) / 40) * 100}%)` }}
              />
            </div>
            <div className="flex justify-between text-xs" style={{ color: '#94a3b8' }}>
              <span>50%</span><span>70%</span><span>90%</span>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-opacity disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
              <Plus className="w-4 h-4" />
              {loading ? 'Saving...' : editingId ? 'Update Skill' : 'Add Skill'}
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

      {/* Skills grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>All Skills ({skills.length})</h2>
        {skills.length === 0 && (
          <div className="rounded-2xl p-10 text-center text-sm" style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
            No skills yet. Add your first one above.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => {
            const offset = circ - (skill.percentage / 100) * circ;
            return (
              <div key={skill._id} className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                {/* Mini circular progress */}
                <svg width="88" height="88" viewBox="0 0 88 88" className="flex-shrink-0">
                  <circle cx="44" cy="44" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle cx="44" cy="44" r={radius} fill="none"
                    stroke="url(#sg)" strokeWidth="8"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round" transform="rotate(-90 44 44)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                  <defs>
                    <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#AA367C" />
                      <stop offset="100%" stopColor="#4A2FBD" />
                    </linearGradient>
                  </defs>
                  <text x="44" y="49" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b">{skill.percentage}%</text>
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: '#1e293b' }}>{skill.name}</p>
                  <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${skill.percentage}%`, background: 'linear-gradient(90deg,#AA367C,#4A2FBD)' }} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => handleEdit(skill)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors hover:bg-slate-50"
                    style={{ color: '#64748b', borderColor: '#e2e8f0' }}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(skill._id)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                    style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SkillsAdmin;
