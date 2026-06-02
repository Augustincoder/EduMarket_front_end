import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  Users, 
  Crown, 
  AlertOctagon, 
  Gavel, 
  Coins, 
  Settings, 
  Scroll, 
  Send, 
  ShieldAlert, 
  LogOut,
  Terminal
} from 'lucide-react';

export default function AdminLayout() {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token || user?.role !== 'ADMIN') {
      navigate('/adminlog', { replace: true });
    } else {
      document.getElementById('root').style.maxWidth = '100%';
    }
    return () => {
      document.getElementById('root').style.maxWidth = '430px';
    };
  }, [token, user, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Admin panel segmenti yopildi');
    navigate('/adminlog');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Foydalanuvchilar', path: '/admin/users', icon: Users },
    { label: 'VIP Arizalar', path: '/admin/vip', icon: Crown },
    { label: 'Shikoyatlar', path: '/admin/complaints', icon: AlertOctagon },
    { label: 'Nizolar (Disputes)', path: '/admin/disputes', icon: Gavel },
    { label: 'Tranzaksiyalar', path: '/admin/financial', icon: Coins },
    { label: 'Moderator', path: '/admin/moderator', icon: ShieldAlert },
    { label: 'Ommaviy Xabar', path: '/admin/broadcast', icon: Send },
    { label: 'Audit Loglari', path: '/admin/audit', icon: Scroll },
    { label: 'Tizim Sozlamalari', path: '/admin/settings', icon: Settings },
  ];

  if (!token || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between select-none">
        <div>
          {/* Logo */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-800/60">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white">
              <Terminal size={18} />
            </span>
            <div>
              <h2 className="font-black text-sm tracking-tight text-white leading-none">EduMarket</h2>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Admin Panel</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer & Logout */}
        <div className="p-4 border-t border-slate-800/60 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 text-xs">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate">{user?.fullname || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 font-semibold truncate">Role: Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Tizimdan Chiqish
          </button>
        </div>
      </aside>

      {/* ── Main content area ──────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full bg-slate-900 overflow-y-auto">
        <header className="h-16 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur px-8 flex justify-between items-center shrink-0">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            {navItems.find((item) => item.path === location.pathname)?.label || 'System Control'}
          </h2>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <span>Server Status: <span className="text-green-500 font-bold">Online ●</span></span>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
