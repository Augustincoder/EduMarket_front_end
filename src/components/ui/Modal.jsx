// src/components/ui/Modal.jsx
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, footer, children }) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(val) => !val && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[380px] p-6 bg-white dark:bg-[#1C1C1E] rounded-[32px] shadow-premium-lg border border-black/[0.03] dark:border-white/5 z-50 max-h-[85vh] overflow-y-auto scrollbar-hide focus:outline-none animate-in zoom-in-95 fade-in duration-300 ease-out">
          {title && (
            <div className="flex items-center justify-between mb-5 px-1">
              <Dialog.Title className="text-[17px] font-black text-gray-900 dark:text-white tracking-tight">
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center active-spring transition-all text-gray-400">
                  <X size={18} strokeWidth={3} />
                </button>
              </Dialog.Close>
            </div>
          )}
          <div className="text-[14px] text-gray-600 dark:text-gray-300 font-medium leading-relaxed px-1">
            {children}
          </div>
          {footer && (
            <div className="mt-8 flex flex-col gap-2">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default Modal;
