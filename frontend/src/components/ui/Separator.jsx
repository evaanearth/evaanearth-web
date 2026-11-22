import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';
export function Separator({ className, ...props }) { return <SeparatorPrimitive.Root decorative className={cn('h-px w-full bg-border', className)} {...props} />; }
