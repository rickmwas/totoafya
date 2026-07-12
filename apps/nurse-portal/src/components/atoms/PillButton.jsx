import React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-[#0047FF] text-white shadow-[0_8px_30px_rgba(0,71,255,0.25)] hover:shadow-[0_12px_40px_rgba(0,71,255,0.35)] hover:bg-[#0038CC]',
  secondary: 'bg-[#0A0A0A] text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:bg-[#222222]',
  ghost: 'bg-white text-[#0A0A0A] border border-[#E5E5E5] hover:bg-[#F4F6F8]',
  danger: 'bg-[#E51010] text-white shadow-[0_8px_30px_rgba(229,16,16,0.2)] hover:bg-[#CC0E0E]',
  success: 'bg-[#0F4C81] text-white shadow-[0_8px_30px_rgba(46,122,93,0.2)] hover:bg-[#266A4F]',
  amber: 'bg-[#F9A825] text-[#0A0A0A] hover:bg-[#E09820]',
  outline: 'bg-transparent text-[#0047FF] border border-[#0047FF] hover:bg-[#0047FF]/5',
};

const sizes = {
  sm: 'h-9 px-4 text-[13px] font-semibold',
  md: 'h-12 px-6 text-[15px] font-semibold',
  lg: 'h-14 px-8 text-[16px] font-semibold',
  xl: 'h-16 px-10 text-[17px] font-bold',
  icon: 'h-12 w-12 p-0',
};

export default function PillButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  loading,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full',
        'transition-all duration-200 ease-out',
        'active:scale-[0.97] select-none cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0047FF]/50',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        'min-w-[48px] min-h-[48px]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
}
