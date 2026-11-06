import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from './utils';

const variantClasses = {
  primary:
    'bg-[#006B5F] hover:bg-[#00544B] text-white shadow-sm hover:shadow focus-visible:ring-[#006B5F]',
  secondary:
    'bg-[#C98A2C] hover:bg-[#B27823] text-white shadow-sm hover:shadow focus-visible:ring-[#C98A2C]',
  outline:
    'border border-[#D1D5DB] bg-white text-[#0A0A0A] hover:bg-slate-50 hover:border-slate-400 focus-visible:ring-[#006B5F]',
  danger:
    'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-sm hover:shadow focus-visible:ring-[#DC2626]',
  ghost:
    'bg-transparent text-[#4A4A4A] hover:bg-slate-100 hover:text-[#0A0A0A] focus-visible:ring-[#006B5F]',
  subtle:
    'bg-[#E6F4F1] text-[#006B5F] hover:bg-[#D5EDE8] focus-visible:ring-[#006B5F]',
};

const sizeClasses = {
  sm: 'min-h-[36px] px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'min-h-[44px] px-4 py-2.5 text-sm rounded-lg gap-2', // Enforces 44px minimum touch target
  lg: 'min-h-[52px] px-6 py-3.5 text-base rounded-xl gap-2.5 font-bold',
  icon: 'min-h-[44px] min-w-[44px] p-2.5 rounded-lg flex items-center justify-center',
};

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon = null,
    iconPosition = 'left',
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'active:scale-[0.98]',
        'disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}

      {children && <span className="leading-none">{children}</span>}

      {!loading && Icon && iconPosition === 'right' ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
    </button>
  );
});

export default Button;
