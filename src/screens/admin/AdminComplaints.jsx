import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi, filesApi } from '../../services/other.service';
import { toast } from 'react-hot-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  Select
} from '../../components/ui/AdminComponents';
import { Eye, Check, X } from 'lucide-react';

export default function AdminComplaints() {
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [adminNotes, setAdminNotes] = useState('');

  // 1. Fetch reports
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['admin', 'reports', statusFilter, typeFilter],
    queryFn: () => {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;
      return reportsApi.getAll(params).then(r => r.data.data.reports);
    }
  });
  const reports = reportsData || [];

  // 2. Resolve Report Mutation
  const resolveMutation = useMutation({
    mutationFn: ({ id, status, adminNotes }) => reportsApi.resolve(id, { status, adminNotes }),
    onSuccess: (data) => {
      toast.success('Shikoyat holati yangilandi');
      queryClient.invalidateQueries(['admin', 'reports']);
      queryClient.invalidateQueries(['admin', 'stats']);
      closeModal();
    },
    onError: (err) => toast.error(err.serverMsg || 'Xatolik yuz berdi')
  });

  const openReport = (report) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || '');
  };

  const closeModal = () => {
    setSelectedReport(null);
    setAdminNotes('');
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* ── Filter Bar ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 border border-slate-800/60 p-5 rounded-3xl">
        <div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
            placeholder="Shikoyat Holati"
            options={[
              { label: 'Kutilayotgan Shikoyatlar', value: 'PENDING' },
              { label: 'Hal qilinganlar', value: 'RESOLVED' },
              { label: 'Rad etilganlar', value: 'DISMISSED' },
              { label: 'Barchasi', value: 'ALL' },
            ]}
          />
        </div>
        <div>
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
            placeholder="Shikoyat Turi"
            options={[
              { label: 'Barcha Turlar', value: 'ALL' },
              { label: 'Fraud / Firibgarlik', value: 'FRAUD' },
              { label: 'Inappropriate Content', value: 'INAPPROPRIATE' },
              { label: 'Communication / Aloqa', value: 'COMMUNICATION' },
              { label: 'Task Quality / Sifat', value: 'TASK_QUALITY' },
              { label: 'Fake Profile', value: 'FAKE_PROFILE' },
              { label: 'Spam', value: 'SPAM' },
            ]}
          />
        </div>
      </div>

      {/* ── Table Grid ────────────────────────────────────── */}
      <div className="bg-slate-950/40 border border-slate-800/60 rounded-3xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shikoyatlar yuklanmoqda...</span>
          </div>
        ) : reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-950/20">
                  <th className="py-4 px-6">Shikoyat qiluvchi</th>
                  <th className="py-4 px-6">Shikoyat qilinuvchi</th>
                  <th className="py-4 px-6">Shikoyat turi</th>
                  <th className="py-4 px-6">Sana</th>
                  <th className="py-4 px-6">Holat</th>
                  <th className="py-4 px-6 text-right">Tekshirish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-900/20 transition-all">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-100">{rep.reporter?.fullname}</p>
                        <p className="text-[10px] text-slate-500">@{rep.reporter?.username || 'username_yoq'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {rep.reported ? (
                        <div>
                          <p className="font-bold text-slate-100">{rep.reported?.fullname}</p>
                          <p className="text-[10px] text-slate-500">@{rep.reported?.username || 'username_yoq'}</p>
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                        ⚠️ {rep.reportType}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(rep.createdAt).toLocaleString('uz-UZ')}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        rep.status === 'PENDING' ? 'bg-amber-500/15 text-amber-500' :
                        rep.status === 'RESOLVED' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-400'
                      }`}>
                        ● {rep.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end">
                        <button
                          onClick={() => openReport(rep)}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-750"
                        >
                          <Eye size={14} /> Tekshirish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 text-xs font-semibold">Tegishli shikoyatlar topilmadi</p>
          </div>
        )}
      </div>

      {/* ── Radix Dialog: Shikoyat tafsilotlari ───────────── */}
      <Dialog open={!!selectedReport} onOpenChange={(v) => !v && closeModal()}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Shikoyat Arizasi Tafsilotlari</DialogTitle>
          <DialogDescription>
            Tizimdagi shubhali xatti-harakatlar yoki qoidabuzarliklarni ko'rib chiqish.
          </DialogDescription>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider">Ariza beruvchi</p>
                <p className="text-slate-100 font-bold mt-1">{selectedReport?.reporter?.fullname}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider">Kim ustidan</p>
                <p className="text-slate-100 font-bold mt-1">{selectedReport?.reported?.fullname || 'Nomuvofiq'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider">Shikoyat turi</p>
                <p className="text-rose-400 font-bold mt-1">⚠️ {selectedReport?.reportType}</p>
              </div>
              <div>
                <p className="text-slate-500 font-bold uppercase tracking-wider">Yuborilgan sana</p>
                <p className="text-slate-100 font-bold mt-1">{selectedReport && new Date(selectedReport.createdAt).toLocaleString('uz-UZ')}</p>
              </div>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl space-y-1.5">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Shikoyat sababi / Matni</h4>
              <p className="text-xs text-slate-200 leading-relaxed font-mono">{selectedReport?.reason}</p>
            </div>

            {selectedReport?.evidenceFileId && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dalil (Fayl/Rasm)</h4>
                <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-950 p-2 flex justify-center">
                  {filesApi.getPublicUrl(selectedReport.evidenceFileId) ? (
                    <img 
                      src={filesApi.getPublicUrl(selectedReport.evidenceFileId)} 
                      alt="Dalil" 
                      className="max-h-[250px] object-contain rounded-lg"
                    />
                  ) : (
                    <button
                      onClick={async () => {
                        const res = await filesApi.getUrl(selectedReport.evidenceFileId);
                        window.open(res.data.data.url, '_blank');
                      }}
                      className="px-4 py-2 bg-slate-800 text-slate-300 text-[11px] font-bold rounded-xl flex items-center gap-2"
                    >
                      <Eye size={14} /> Faylni ko'rish
                    </button>
                  )}
                </div>
              </div>
            )}

            {selectedReport?.task && (
              <div className="p-3.5 bg-slate-900 border border-slate-850 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Biriktirilgan topshiriq</p>
                  <p className="text-slate-100 font-bold mt-0.5">{selectedReport.task.title}</p>
                </div>
                <span className="text-[10px] text-slate-500">ID: {selectedReport.task.id}</span>
              </div>
            )}

            {/* Resolve Controls */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Admin Izohi</label>
                <textarea
                  placeholder="Admin tomonidan shikoyat bo'yicha ko'rilgan chora yoki yechim izohi..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs outline-none min-h-[90px] text-slate-100"
                  disabled={selectedReport?.status !== 'PENDING'}
                />
              </div>

              {selectedReport?.status === 'PENDING' ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={resolveMutation.isLoading}
                    onClick={() => resolveMutation.mutate({ id: selectedReport.id, status: 'DISMISSED', adminNotes })}
                    className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-750"
                  >
                    <X size={16} /> Rad etish (Dismiss)
                  </button>
                  <button
                    disabled={resolveMutation.isLoading}
                    onClick={() => resolveMutation.mutate({ id: selectedReport.id, status: 'RESOLVED', adminNotes })}
                    className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check size={16} /> Shikoyatni hal qilish
                  </button>
                </div>
              ) : (
                <div className="bg-slate-950/60 p-3.5 border border-slate-850 rounded-2xl flex justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wide">
                  <span>Yechim holati: {selectedReport?.status}</span>
                  <span>Tekshirgan Admin ID: {selectedReport?.resolvedById}</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
