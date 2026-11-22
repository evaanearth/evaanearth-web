import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
const styles = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500 disabled:pointer-events-none disabled:opacity-50', {
  variants: { variant: { default: 'bg-primary text-primary-foreground hover:bg-olive-700 shadow-sm', secondary: 'bg-secondary text-secondary-foreground hover:bg-olive-100', outline: 'border border-border bg-white/70 text-foreground hover:bg-olive-50', ghost: 'hover:bg-olive-50 text-foreground', danger: 'bg-red-600 text-white hover:bg-red-700', gold: 'bg-gold text-olive-900 hover:brightness-95' }, size: { default: 'h-11 px-5 py-2.5', sm: 'h-9 px-3 rounded-lg', lg: 'h-12 px-7 text-base', icon: 'h-10 w-10' } }, defaultVariants: { variant: 'default', size: 'default' }
});
export const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => { const Comp = asChild ? Slot : 'button'; return <Comp ref={ref} className={cn(styles({ variant, size }), className)} {...props} />; });
Button.displayName = 'Button';
