// src/components/ui/BottomSheet.jsx
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  fullHeight = false 
}) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(val) => !val && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content 
          className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] bg-edu-surface rounded-t-[32px] shadow-sheet z-50 focus:outline-none flex flex-col animate-slide-up ${fullHeight ? 'h-[95vh]' : 'max-h-[90vh]'}`}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1 rounded-full bg-edu-border/50" />
          </div>
          
          {title && (
            <div className="flex items-center justify-between px-6 pt-3 pb-4 border-b border-edu-border/30">
              <Dialog.Title className="font-display text-lg font-black text-edu-text tracking-tight">
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="w-9 h-9 rounded-2xl bg-edu-bg flex items-center justify-center press-scale hover:bg-edu-border/20 transition-all">
                  <X size={18} className="text-edu-muted" />
                </button>
              </Dialog.Close>
            </div>
          )}
          
          <div className="px-6 py-5 overflow-y-auto scrollbar-hide flex-1">
            {children}
          </div>

          {footer && (
            <div className="px-6 py-5 border-t border-edu-border/30 bg-edu-surface/80 backdrop-blur-md pb-safe">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default BottomSheet;
