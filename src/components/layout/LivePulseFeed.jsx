import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { useCategoryStore } from '../../store/categoryStore';

export function LivePulseFeed() {
  const { socket } = useSocket();
  const [pulseEvents, setPulseEvents] = useState([]);
  const categoryStore = useCategoryStore(s => s.categories) || [];

  useEffect(() => {
    if (!socket) return;

    const handlePulse = (data) => {
      if (data.event === 'TASK_COMPLETED') {
        const catInfo = categoryStore.find(c => c.value === data.category) || { emoji: '📌', label: data.category };
        const newEvent = {
          id: Math.random().toString(36).substring(7),
          message: `${catInfo?.emoji || '💼'} ${catInfo?.label || data.category} bo'yicha vazifa yakunlandi`,
          timestamp: data.timestamp
        };

        setPulseEvents(prev => {
          const updated = [newEvent, ...prev].slice(0, 5); // Keep last 5
          return updated;
        });
      }
    };

    socket.on('platform_pulse', handlePulse);
    return () => socket.off('platform_pulse', handlePulse);
  }, [socket, categoryStore]);

  if (pulseEvents.length === 0) return null;

  return (
    <div className="bg-edu-surface/60 backdrop-blur-md border-y border-edu-border/30 py-2 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-edu-surface to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-edu-surface to-transparent z-10" />
      
      <div className="flex items-center gap-2 px-4 animate-ticker whitespace-nowrap">
        <Activity className="w-4 h-4 text-emerald-500 animate-pulse flex-shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex-shrink-0">JONLI EFIR:</span>
        
        {pulseEvents.map((ev, idx) => (
          <div key={ev.id} className="flex items-center gap-3">
            <span className="text-xs font-medium text-edu-text px-3 py-1 bg-edu-bg rounded-full border border-edu-border/40">
              {ev.message}
            </span>
            {idx < pulseEvents.length - 1 && <span className="w-1 h-1 rounded-full bg-edu-border" />}
          </div>
        ))}
      </div>
    </div>
  );
}
