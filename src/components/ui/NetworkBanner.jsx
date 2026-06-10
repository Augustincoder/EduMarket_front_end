import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { cn } from '../../lib/utils';

export function NetworkBanner() {
  const isOnline = useNetworkStatus();
  
  if (isOnline) return null;
  
  return (
    <div 
      className={cn(
        "fixed top-0 inset-x-0 z-[100] bg-edu-urgent text-white",
        "py-2 px-4 flex items-center justify-center gap-2",
        "text-[12px] font-bold tracking-wide uppercase",
        "animate-in slide-in-from-top duration-300 shadow-md",
        "backdrop-blur-md bg-edu-urgent/90"
      )}
    >
      <WifiOff size={14} strokeWidth={3} />
      <span>Internet aloqasi yo'q</span>
    </div>
  );
}
