import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
export const Textarea = forwardRef(({ className, ...props }, ref) => <textarea ref={ref} className={cn('flex min-h-[110px] w-full rounded-xl border border-border bg-white/80 px-3.5 py-3 text-sm outline-none transition placeholder:text-olive-400 focus:border-olive-500 focus:ring-2 focus:ring-olive-500/15', className)} {...props} />);
Textarea.displayName = 'Textarea';
