import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-barber-gold disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-barber-gold via-barber-amber to-barber-darkgold text-background shadow-lg shadow-barber-gold/20 hover:brightness-110',
        secondary:
          'bg-surface-border text-zinc-100 hover:bg-surface-hover border border-surface-border',
        outline:
          'border border-barber-gold/40 text-barber-gold hover:bg-barber-gold/10',
        ghost: 'text-zinc-400 hover:text-zinc-100 hover:bg-surface-hover',
        destructive: 'bg-accent-rose text-white hover:bg-accent-rose/90',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-14 rounded-2xl px-8 text-base font-bold tracking-wide',
        icon: 'h-12 w-12 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
