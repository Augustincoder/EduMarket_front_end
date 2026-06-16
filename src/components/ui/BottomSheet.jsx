import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" 
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div 
                drag="y"
                dragConstraints={{ top: 0, bottom: 500 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (info.offset.y > 100 || info.velocity.y > 500) onClose?.();
                }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] bg-edu-surface rounded-t-[32px] shadow-sheet z-50 focus:outline-none flex flex-col ${fullHeight ? 'h-[95vh]' : 'max-h-[90vh]'}`}
              >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-12 h-1 rounded-full bg-edu-border/50" />
          </div>
          
          {title && (
            <div className="flex items-center justify-between px-6 pt-3 pb-4 border-b border-edu-border/30">
              <Dialog.Title className="font-display text-lg font-bold text-edu-text tracking-tight">
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button aria-label="Yopish" className="w-11 h-11 rounded-xl bg-edu-bg flex items-center justify-center active:scale-95 duration-[120ms] hover:bg-edu-border/20 transition-all">
                  <X size={20} className="text-edu-muted" />
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
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export default BottomSheet;
