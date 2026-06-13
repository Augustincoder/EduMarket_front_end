// src/components/ui/Modal.jsx
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, footer, children }) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(val) => !val && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[400px] p-6 bg-edu-surface rounded-lg shadow-premium-lg border border-edu-border/30 z-[101] max-h-[85vh] overflow-y-auto scrollbar-hide focus:outline-none animate-ios-pop">
          {title && (
            <div className="flex items-center justify-between mb-6 px-1">
              <Dialog.Title className="text-[19px] font-bold text-edu-text tracking-tight leading-tight">
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button aria-label="Yopish" className="w-11 h-11 rounded-full bg-edu-bg flex items-center justify-center active:scale-[0.97] transition-transform duration-[120ms] transition-all text-edu-muted hover:text-edu-text">
                  <X size={20} strokeWidth={3} />
                </button>
              </Dialog.Close>
            </div>
          )}
          <div className="text-[15px] text-edu-text font-medium leading-relaxed px-1 opacity-90">
            {children}
          </div>
          {footer && (
            <div className="mt-8 flex flex-col gap-3">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default Modal;
