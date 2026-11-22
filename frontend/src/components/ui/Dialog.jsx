import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
export const Dialog = DialogPrimitive.Root; export const DialogTrigger = DialogPrimitive.Trigger; export const DialogClose = DialogPrimitive.Close;
export function DialogContent({ className, children, ...props }) { return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-olive-900/45 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" /><DialogPrimitive.Content className={cn('fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl outline-none', className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1.5 text-olive-500 transition hover:bg-olive-100"><X size={18} /></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>; }
export function DialogHeader({ className, ...props }) { return <div className={cn('mb-5 space-y-1.5 pr-7', className)} {...props} />; }
export function DialogTitle({ className, ...props }) { return <DialogPrimitive.Title className={cn('font-display text-2xl font-semibold text-olive-900', className)} {...props} />; }
export function DialogDescription({ className, ...props }) { return <DialogPrimitive.Description className={cn('text-sm text-olive-600', className)} {...props} />; }
export function DialogFooter({ className, ...props }) { return <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />; }
