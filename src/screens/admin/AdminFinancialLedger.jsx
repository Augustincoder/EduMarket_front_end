import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/admin.service';
import { formatPrice } from '../../lib/constants';
import { Coins, ArrowUpRight, ArrowDownLeft, Download } from 'lucide-react';
import { exportToCSV } from '../../lib/export';
import { toast } from 'react-hot-toast';

export default function AdminFinancialLedger() {
  // Fetch transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['admin', 'transactions'],
    queryFn: () => adminApi.getTransactions().then(r => r.data.data)
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (transactions && transactions.length) {
              const exportData = transactions.map(tx => ({
                Tranzaksiya_ID: tx.id,
                Foydalanuvchi: tx.user?.fullname || 'Nomalum',
                Turi: tx.type,
                Miqdor: tx.amount,
                Sana: new Date(tx.createdAt).toLocaleString('uz-UZ'),
                Izoh: tx.notes || tx.reference || 'Izohsiz'
              }));
              exportToCSV(exportData, 'Tranzaksiyalar_Tarixi');
            } else {
              toast.error("Eksport qilish uchun tranzaksiyalar topilmadi");
            }
          }}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-slate-950/40 border border-slate-800/60 rounded-3xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tranzaksiyalar yuklanmoqda...</span>
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-950/20">
                  <th className="py-4 px-6">Tranzaksiya ID</th>
                  <th className="py-4 px-6">Foydalanuvchi</th>
                  <th className="py-4 px-6">Turi</th>
                  <th className="py-4 px-6">Miqdor</th>
                  <th className="py-4 px-6">Sana</th>
                  <th className="py-4 px-6">Tafsilot (Notes)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs text-slate-300">
                {transactions.map((tx) => {
                  const isCredit = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-900/20 transition-all">
                      <td className="py-4 px-6 font-mono text-[10px] text-slate-500">
                        {tx.id}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-slate-100">{tx.user?.fullname}</p>
                          <p className="text-[10px] text-slate-500">@{tx.user?.username || 'username_yoq'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider border ${
                          tx.type === 'VIP_PURCHASE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          tx.type.startsWith('ESCROW') ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`py-4 px-6 font-bold flex items-center gap-1 mt-1 ${isCredit ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isCredit ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        {isCredit ? '+' : ''}{formatPrice(tx.amount)} UZS
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {new Date(tx.createdAt).toLocaleString('uz-UZ')}
                      </td>
                      <td className="py-4 px-6 text-slate-400 italic">
                        {tx.notes || tx.reference || 'Izohsiz'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 text-xs font-semibold">Tizimda hozircha tranzaksiyalar mavjud emas</p>
          </div>
        )}
      </div>

    </div>
  );
}
