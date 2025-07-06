import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  background?: 'default' | 'muted' | 'card' | 'gradient-stacks' | 'gradient-bitcoin';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Section({ 
  className, 
  children, 
  background = 'default',
  padding = 'lg',
  ...props 
}: SectionProps) {
  const backgrounds = {
    default: 'bg-background',
    muted: 'bg-muted',
    card: 'bg-card border-t border-border',
    'gradient-stacks': 'gradient-stacks',
    'gradient-bitcoin': 'gradient-bitcoin'
  };

  const paddings = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16 lg:py-20',
    xl: 'py-20 lg:py-32'
  };

  return (
    <section
      className={cn(backgrounds[background], paddings[padding], className)}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  centered?: boolean;
  children?: React.ReactNode;
}

export function SectionHeader({ 
  className, 
  title, 
  description, 
  centered = true,
  children,
  ...props 
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-12 lg:mb-16',
        centered ? 'text-center' : '',
        className
      )}
      {...props}
    >
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
        {title}
      </h2>
      {description && (
        <p className={cn(
          'text-xl text-muted-foreground',
          centered ? 'max-w-3xl mx-auto' : 'max-w-2xl'
        )}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
