// src/components/ui/Modal.jsx
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, footer, children }) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(val) => !val && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-auto p-5 bg-edu-surface rounded-3xl shadow-xl border border-edu-border/40 z-50 max-h-[85vh] overflow-y-auto scrollbar-hide focus:outline-none animate-fade-up">
          {title && (
            <div className="flex items-center justify-between border-b border-edu-border/40 pb-3 mb-3">
              <Dialog.Title className="font-display text-base font-bold text-edu-text">
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="w-8 h-8 rounded-xl bg-edu-bg flex items-center justify-center press-scale hover:bg-edu-border/40">
                  <X size={16} className="text-edu-muted" />
                </button>
              </Dialog.Close>
            </div>
          )}
          <div className="py-2 text-sm text-edu-text leading-relaxed">
            {children}
          </div>
          {footer && (
            <div className="border-t border-edu-border/40 pt-3 mt-3 flex justify-end gap-2">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default Modal;
