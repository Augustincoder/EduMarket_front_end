import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../services/auth.service';
import { Lock, User, Terminal } from 'lucide-react';

export default function AdminLoginScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setAuth = useAuthStore((s) => s.setAuth);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error(t('system.admin.enterCredentials'));
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.adminLogin({ username, password });
      if (res.data.success) {
        setAuth({
          user: res.data.data.user,
          token: res.data.data.token,
        });
        toast.success(t('system.admin.welcome'));
        navigate('/admin/dashboard');
      } else {
        toast.error(res.data.message || t('system.admin.genericError'));
      }
    } catch (err) {
      toast.error(err.serverMsg || t('system.admin.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden select-none">
      {/* Dynamic background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-xl p-8 shadow-lg relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 mb-4 animate-pulse">
            <Terminal size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">EduMarket</h1>
          <p className="text-slate-400 text-xs mt-1 uppercase font-bold tracking-wider">Admin Control Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User size={18} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-2 text-sm"
          >
            {isLoading ? 'Checking credentials...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
