import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
export const Input = forwardRef(({ className, ...props }, ref) => <input ref={ref} className={cn('flex h-11 w-full rounded-xl border border-border bg-white/80 px-3.5 py-2 text-sm outline-none transition placeholder:text-olive-400 focus:border-olive-500 focus:ring-2 focus:ring-olive-500/15 disabled:opacity-50', className)} {...props} />);
Input.displayName = 'Input';
