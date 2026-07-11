import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

/**
 * Premium animated modal. Fully controlled — pass `open` + `onOpenChange`.
 * Preserves all existing form/CRUD logic; this is purely presentational chrome.
 */
export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  icon: Icon,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            </Dialog.Overlay>
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto">
              <Dialog.Content asChild forceMount onOpenAutoFocus={(e) => e.preventDefault()}>
                <motion.div
                  className={cn(
                    'relative w-full my-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden',
                    SIZES[size] || SIZES.md
                  )}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                >
                  {(title || description) && (
                    <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-850">
                      <div className="flex items-start gap-3 min-w-0">
                        {Icon && (
                          <div className="w-10 h-10 rounded-xl bg-indigo-55/10 dark:bg-indigo-955/40 flex items-center justify-center text-indigo-650 dark:text-indigo-400 shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          {title && (
                            <Dialog.Title className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                              {title}
                            </Dialog.Title>
                          )}
                          {description && (
                            <Dialog.Description className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                              {description}
                            </Dialog.Description>
                          )}
                        </div>
                      </div>
                      <Dialog.Close asChild>
                        <button
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors shrink-0"
                          aria-label="Close"
                        >
                          <X className="w-4.5 h-4.5" />
                        </button>
                      </Dialog.Close>
                    </div>
                  )}

                  <div className="px-6 py-5 max-h-[70vh] overflow-y-auto scrollbar-thin">{children}</div>

                  {footer && (
                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30">
                      {footer}
                    </div>
                  )}
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default Modal;
