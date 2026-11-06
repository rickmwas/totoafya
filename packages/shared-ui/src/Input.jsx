import React, { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from './utils';

export const Input = forwardRef(function Input(
  {
    label,
    labelSw,
    lang = 'en',
    helperText,
    error,
    required = false,
    id: externalId,
    className = '',
    containerClassName = '',
    type = 'text',
    disabled = false,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = externalId || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const displayLabel = lang === 'sw' && labelSw ? labelSw : label;

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', containerClassName)}>
      {displayLabel && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold text-[#4A4A4A] tracking-wider uppercase flex items-center justify-between px-0.5"
        >
          <span>
            {displayLabel}
            {required && <span className="text-[#DC2626] ml-1 font-bold">*</span>}
          </span>
          {labelSw && lang !== 'sw' && (
            <span className="text-[11px] font-normal text-[#6B7280] lowercase">
              ({labelSw})
            </span>
          )}
        </label>
      )}

      <div className="relative w-full">
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-white border rounded-lg',
            'text-[#0A0A0A] placeholder:text-[#6B7280] transition-all duration-150',
            'border-[#D1D5DB] focus:border-[#006B5F] focus:ring-2 focus:ring-[#006B5F]/20 focus:outline-none',
            'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-200',
            error && 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20 bg-red-50/20 text-[#DC2626]',
            className
          )}
          {...props}
        />
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-semibold text-[#DC2626] flex items-center gap-1.5 px-0.5 mt-0.5"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-[#6B7280] px-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
