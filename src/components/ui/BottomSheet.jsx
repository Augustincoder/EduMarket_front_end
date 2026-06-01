// src/components/ui/BottomSheet.jsx
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function BottomSheet({ isOpen, onClose, title, children, fullHeight = false }) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(val) => !val && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content 
          className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-edu-surface rounded-t-3xl shadow-sheet z-50 focus:outline-none flex flex-col animate-slide-up ${fullHeight ? 'h-[95vh]' : 'max-h-[90vh]'}`}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-edu-border" />
          </div>
          
          {title && (
            <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-edu-border/50">
              <Dialog.Title className="font-display text-lg font-bold text-edu-text">
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="w-8 h-8 rounded-xl bg-edu-bg flex items-center justify-center press-scale hover:bg-edu-border/40">
                  <X size={16} className="text-edu-muted" />
                </button>
              </Dialog.Close>
            </div>
          )}
          
          <div className="px-5 py-4 overflow-y-auto scrollbar-hide flex-1">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default BottomSheet;
