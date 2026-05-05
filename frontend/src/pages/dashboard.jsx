import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  FolderKanban, Wrench, Zap, Users, Globe,
  ArrowRight, TrendingUp, Activity,
} from 'lucide-react';

/* ─── Stat card ─────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, gradient, to }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="rounded-2xl p-5 text-left w-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group"
      style={{ background: '#fff', border: '1px solid #e2e8f0' }}
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
          style={{ background: gradient }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#94a3b8' }} />
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold" style={{ color: '#1e293b' }}>
          {value ?? <span className="inline-block w-10 h-7 rounded animate-pulse" style={{ background: '#f1f5f9' }} />}
        </p>
        <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>{label}</p>
      </div>
    </button>
  );
};

/* ─── Quick action button ────────────────────────────────────────────────── */
const QuickAction = ({ icon: Icon, label, to, color }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
      style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: color + '18', color }}>
        <Icon className="w-4 h-4" />
      </div>
      {label}
      <ArrowRight className="w-3.5 h-3.5 ml-auto" style={{ color: '#cbd5e1' }} />
    </button>
  );
};

/* ─── Dashboard ─────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const [counts, setCounts] = useState({ projects: null, services: null, skills: null, users: null });
  const [activeSite, setActiveSite] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, services, skills, users, site] = await Promise.all([
          api.get('/api/project'),
          api.get('/api/service'),
          api.get('/api/skill'),
          api.get('/api/user'),
          api.get('/api/site/selected'),
        ]);
        setCounts({
          projects: projects.data.length,
          services: services.data.length,
          skills: skills.data.length,
          users: users.data.length,
        });
        setActiveSite(site.data?.siteName || null);
        // Last 5 projects as "recent activity"
        setRecentProjects([...projects.data].reverse().slice(0, 5));
      } catch {
        // Partial failures are fine — counts stay null and show skeleton
      }
    };
    load();
  }, []);

  const stats = [
    { icon: FolderKanban, label: 'Projects',  value: counts.projects, gradient: 'linear-gradient(135deg,#AA367C,#4A2FBD)', to: '/admin/ManageProjects' },
    { icon: Wrench,       label: 'Services',  value: counts.services, gradient: 'linear-gradient(135deg,#0ea5e9,#6366f1)', to: '/admin/ManageService' },
    { icon: Zap,          label: 'Skills',    value: counts.skills,   gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)', to: '/admin/ManageSkills' },
    { icon: Users,        label: 'Users',     value: counts.users,    gradient: 'linear-gradient(135deg,#10b981,#0ea5e9)', to: '/admin/ManageUsers' },
  ];

  const quickActions = [
    { icon: FolderKanban, label: 'Add a new project',  to: '/admin/ManageProjects', color: '#AA367C' },
    { icon: Wrench,       label: 'Add a new service',  to: '/admin/ManageService',  color: '#6366f1' },
    { icon: Zap,          label: 'Add a new skill',    to: '/admin/ManageSkills',   color: '#f59e0b' },
    { icon: Globe,        label: 'Edit site content',  to: '/admin/ManageSites',    color: '#10b981' },
    { icon: Users,        label: 'Manage users',       to: '/admin/ManageUsers',    color: '#0ea5e9' },
  ];

  return (
    <div className="space-y-8 pb-10">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
          style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1e293b' }}>Dashboard</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            {activeSite ? <>Active site: <span className="font-semibold" style={{ color: '#7c3aed' }}>{activeSite}</span></> : 'No active site selected'}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Bottom two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent activity */}
        <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
          <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
            <Activity className="w-4 h-4" style={{ color: '#7c3aed' }} />
            <span className="text-sm font-semibold" style={{ color: '#1e293b' }}>Recent Projects</span>
          </div>
          <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
            {recentProjects.length === 0 && (
              <div className="px-6 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>
                No projects yet.
              </div>
            )}
            {recentProjects.map((p) => (
              <div key={p._id} className="flex items-center gap-3 px-6 py-3">
                <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ background: '#f8fafc' }}>
                  {p.image
                    ? <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                    : <FolderKanban className="w-4 h-4 m-auto mt-2.5" style={{ color: '#e2e8f0' }} />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#1e293b' }}>{p.title}</p>
                  <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
          <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
            <ArrowRight className="w-4 h-4" style={{ color: '#7c3aed' }} />
            <span className="text-sm font-semibold" style={{ color: '#1e293b' }}>Quick Actions</span>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((a) => <QuickAction key={a.label} {...a} />)}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
