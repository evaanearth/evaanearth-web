import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
export function Select({ value, onValueChange, children }) { return <SelectPrimitive.Root value={value} onValueChange={onValueChange}>{children}</SelectPrimitive.Root>; }
export function SelectTrigger({ className, children }) { return <SelectPrimitive.Trigger className={cn('flex h-11 w-full items-center justify-between rounded-xl border border-border bg-white px-3.5 text-sm outline-none focus:ring-2 focus:ring-olive-500/20', className)}>{children}<SelectPrimitive.Icon><ChevronDown size={16} /></SelectPrimitive.Icon></SelectPrimitive.Trigger>; }
export function SelectValue(props) { return <SelectPrimitive.Value {...props} />; }
export function SelectContent({ children }) { return <SelectPrimitive.Portal><SelectPrimitive.Content className="z-[80] overflow-hidden rounded-xl border border-border bg-white shadow-xl" position="popper"><SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport></SelectPrimitive.Content></SelectPrimitive.Portal>; }
export function SelectItem({ value, children }) { return <SelectPrimitive.Item value={value} className="relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm outline-none focus:bg-olive-50 data-[disabled]:opacity-40"><span className="absolute left-2"><SelectPrimitive.ItemIndicator><Check size={14} /></SelectPrimitive.ItemIndicator></span><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText></SelectPrimitive.Item>; }
