import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function ChatListSkeleton() {
  const skeletons = Array(6).fill(null);

  return (
    <div className="w-full flex flex-col gap-3">
      {skeletons.map((_, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="card-base p-4 flex items-center gap-4 overflow-hidden relative"
        >
          {/* Shimmer effect overlay */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-10" />
          
          <div className="shrink-0 w-14 h-14 rounded-full bg-edu-border/40 animate-pulse" />
          
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-2.5">
            <div className="flex justify-between items-center w-full">
              <div className="h-4 w-32 bg-edu-border/40 rounded-full animate-pulse" />
              <div className="h-3 w-10 bg-edu-border/30 rounded-full animate-pulse" />
            </div>
            
            <div className="h-3.5 w-48 bg-edu-border/30 rounded-full animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
