import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
import { LayoutDashboard, FolderKanban, Wrench, Users, Globe, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin/ManageSites', label: 'Site Content', icon: Globe },
  { to: '/admin/ManageProjects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/ManageService', label: 'Services', icon: Wrench },
  { to: '/admin/ManageUsers', label: 'Users', icon: Users },
];

const Sidebaradmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }
    const decoded = jwtDecode(token);
    if (decoded.role !== 'admin') navigate('/');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-900 text-white w-64 p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <LayoutDashboard className="w-6 h-6 text-violet-400" />
        <span className="text-xl font-bold">Admin Panel</span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              location.pathname === to
                ? 'bg-violet-600 text-white'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
      <Button
        variant="ghost"
        onClick={handleLogout}
        className="flex items-center gap-3 justify-start text-zinc-400 hover:text-white hover:bg-zinc-800 mt-4"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-zinc-900 text-white p-2 rounded-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        'fixed top-0 left-0 h-full z-50 transition-transform duration-300 md:hidden',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen sticky top-0">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebaradmin;
