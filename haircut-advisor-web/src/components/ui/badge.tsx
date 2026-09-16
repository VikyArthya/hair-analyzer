import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './button';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-barber-gold/20 text-barber-gold border-barber-gold/40',
        secondary: 'border-transparent bg-surface-border text-zinc-300',
        destructive: 'border-transparent bg-accent-rose/20 text-accent-rose border-accent-rose/30',
        outline: 'text-zinc-300 border-surface-border',
        cyan: 'border-transparent bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30',
        emerald: 'border-transparent bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
