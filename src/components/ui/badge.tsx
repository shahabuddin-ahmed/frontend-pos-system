import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

type BadgeProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary';
};

export function Badge({ className, variant = 'secondary', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
        className,
      )}
      {...props}
    />
  );
}
