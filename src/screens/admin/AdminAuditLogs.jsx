import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/admin.service';
import { Scroll, Terminal, Download } from 'lucide-react';
import { exportToCSV } from '../../lib/export';
import { toast } from 'react-hot-toast';

export default function AdminAuditLogs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs'],
    queryFn: () => adminApi.getAuditLogs().then(r => r.data.data)
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (logs && logs.length) {
              const exportData = logs.map(log => ({
                Sana: new Date(log.createdAt).toLocaleString('uz-UZ'),
                Admin_ID: log.adminId,
                Amal: log.action,
                Tafsilotlar: log.details
              }));
              exportToCSV(exportData, 'Audit_Loglar');
            } else {
              toast.error("Eksport qilish uchun loglar topilmadi");
            }
          }}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-slate-950/40 border border-slate-800/60 rounded-3xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit loglari yuklanmoqda...</span>
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-950/20">
                  <th className="py-4 px-6">Vaqt</th>
                  <th className="py-4 px-6">Admin ID</th>
                  <th className="py-4 px-6">Amal (Action)</th>
                  <th className="py-4 px-6">Tafsilotlar (Details)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/20 transition-all">
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(log.createdAt).toLocaleString('uz-UZ')}
                    </td>
                    <td className="py-4 px-6 font-mono text-[10px] text-slate-400">
                      {log.adminId}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider border ${
                        log.action.includes('BAN') ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        log.action.includes('VIP') ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-400 max-w-xl break-all">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 text-xs font-semibold">Tizimda hozircha audit loglari mavjud emas</p>
          </div>
        )}
      </div>

    </div>
  );
}
