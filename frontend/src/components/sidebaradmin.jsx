import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { LayoutDashboard, FolderKanban, Wrench, Users, Globe, LogOut, Menu, X, Zap, ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin/ManageSites', label: 'Site Content', icon: Globe },
  { to: '/admin/ManageProjects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/ManageService', label: 'Services', icon: Wrench },
  { to: '/admin/ManageSkills', label: 'Skills', icon: Zap },
  { to: '/admin/ManageUsers', label: 'Users', icon: Users },
];

const Sidebaradmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('Admin');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'admin') navigate('/');
      if (decoded.username) setUsername(decoded.username);
    } catch { navigate('/'); }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full w-64" style={{ background: '#1e1b4b' }}>

      {/* Logo / Brand */}
      <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Admin Panel</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>SaaS Management</p>
          </div>
        </div>
        {mobile && (
          <button onClick={() => setOpen(false)} style={{ color: 'rgba(255,255,255,0.4)' }} className="hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User */}
      <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#AA367C,#4A2FBD)' }}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{username}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Administrator</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold px-3 mb-3 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Navigation
        </p>
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => mobile && setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'text-white'
                  : 'hover:bg-white/8'
              )}
              style={active
                ? { background: 'linear-gradient(135deg,#AA367C,#4A2FBD)', color: '#fff' }
                : { color: 'rgba(255,255,255,0.55)' }
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <a href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-white/8"
          style={{ color: 'rgba(255,255,255,0.55)' }}>
          <Home className="w-4 h-4" />
          <span>Back to Site</span>
        </a>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-500/15"
          style={{ color: 'rgba(255,255,255,0.55)' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg shadow-lg"
        style={{ background: '#1e1b4b', color: '#fff' }}
        onClick={() => setOpen(!open)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        'fixed top-0 left-0 h-full z-50 transition-transform duration-300 md:hidden shadow-2xl',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent mobile />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen sticky top-0 shadow-xl">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebaradmin;
