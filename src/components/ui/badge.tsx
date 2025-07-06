import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
}

export function Badge({ className, variant = 'secondary', children, ...props }: BadgeProps) {
  const variants = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger'
  };

  return (
    <span
      className={cn('badge', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
