import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../ui/Card';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function VerificationStatusCard({ status, onClick }) {
  return (
    <Card 
      tilt
      glare
      className={cn(
        "border relative overflow-hidden active:scale-95 duration-[120ms]",
        status === 'APPROVED' ? "bg-edu-primary/5 border-edu-primary/20" : 
        status === 'PENDING' ? "bg-amber-500/5 border-amber-500/20" : "bg-edu-surface border-edu-border/40"
      )}
      onClick={onClick}
      radius="xl"
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            initial={{ scale: 3, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              status === 'APPROVED' ? "bg-edu-primary text-white" : 
              status === 'PENDING' ? "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "bg-edu-bg text-edu-muted"
            )}
          >
            <motion.div
               animate={status !== 'APPROVED' ? { scale: [1, 1.15, 1] } : {}}
               transition={status !== 'APPROVED' ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : {}}
            >
              <ShieldCheck size={20} />
            </motion.div>
          </motion.div>
          <div>
            <h4 className="text-sm font-bold text-edu-text">Profilingizni tasdiqlang</h4>
            <div className="relative overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.p 
                  key={status}
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1",
                    status === 'APPROVED' ? "text-edu-primary" : "text-edu-muted"
                  )}
                >
                  {status === 'APPROVED' && (
                    <motion.span 
                      initial={{ scale: 3, opacity: 0, rotate: -20 }} 
                      animate={{ scale: 1, opacity: 1, rotate: 0 }} 
                      transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                    >
                      ✅
                    </motion.span>
                  )}
                  {status === 'APPROVED' ? 'Tasdiqlangan' : 
                   status === 'PENDING' ? 'Kutilmoqda...' : 'Hujjat topshirish'}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
        <ArrowRight size={16} className="text-edu-muted" />
      </CardContent>
    </Card>
  );
}
