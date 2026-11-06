import React, { forwardRef } from 'react';
import { cn } from './utils';

export const Card = forwardRef(function Card(
  { children, className = '', hoverable = false, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-150',
        hoverable && 'hover:shadow-md hover:border-slate-300 active:scale-[0.995]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export const CardHeader = forwardRef(function CardHeader(
  { children, className = '', action = null, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-4',
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
});

export const CardTitle = forwardRef(function CardTitle(
  { children, className = '', as: Component = 'h3', ...props },
  ref
) {
  return (
    <Component
      ref={ref}
      className={cn(
        'text-base font-bold text-[#0A0A0A] tracking-tight leading-snug flex items-center gap-2',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

export const CardSubtitle = forwardRef(function CardSubtitle(
  { children, className = '', ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={cn('text-xs text-[#6B7280] mt-0.5 leading-normal', className)}
      {...props}
    >
      {children}
    </p>
  );
});

export const CardContent = forwardRef(function CardContent(
  { children, className = '', ...props },
  ref
) {
  return (
    <div ref={ref} className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
});

export const CardFooter = forwardRef(function CardFooter(
  { children, className = '', ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-[#6B7280]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
