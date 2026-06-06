import { Card, CardContent } from '../ui/Card';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function VerificationStatusCard({ status, onClick }) {
  return (
    <Card 
      className={cn(
        "border relative overflow-hidden press-scale",
        status === 'APPROVED' ? "bg-edu-primary/5 border-edu-primary/20" : 
        status === 'PENDING' ? "bg-amber-500/5 border-amber-500/20" : "bg-edu-surface border-edu-border/40"
      )}
      onClick={onClick}
      radius="xl"
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            status === 'APPROVED' ? "bg-edu-primary text-white" : 
            status === 'PENDING' ? "bg-amber-500 text-white" : "bg-edu-bg text-edu-muted"
          )}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-edu-text">Profilingizni tasdiqlang</h4>
            <p className="text-[10px] font-bold text-edu-muted uppercase tracking-wider">
              {status === 'APPROVED' ? 'Tasdiqlangan' : 
               status === 'PENDING' ? 'Kutilmoqda...' : 'Hujjat topshirish'}
            </p>
          </div>
        </div>
        <ArrowRight size={16} className="text-edu-muted" />
      </CardContent>
    </Card>
  );
}
