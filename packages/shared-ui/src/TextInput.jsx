import React, { forwardRef, useId } from 'react';
import { AlertCircle, X, Check } from 'lucide-react';
import { cn } from './utils';

/**
 * TextInput — "The Sunlit Botanical Editorial" Form Input Primitive
 *
 * Implements:
 * - 48x48px guaranteed minimum touch height (min-h-[48px])
 * - WCAG 2.1 AA accessible label and error associations (aria-invalid, aria-describedby)
 * - Clear inline validation error rendering in #DC2626 with role="alert"
 * - Leading icon slot & trailing action/validation slots
 * - Swahili localization support for labels, placeholders, and error messages
 * - Clean focus state with Deep Teal ring (focus:ring-2 focus:ring-[#006B5F]/20)
 */

export const TextInput = forwardRef(function TextInput(
  {
    label,
    labelSw,
    lang = 'en',
    helperText,
    helperTextSw,
    error,
    errorSw,
    success = false,
    required = false,
    id: externalId,
    name,
    type = 'text',
    value,
    defaultValue,
    onChange,
    onClear,
    placeholder,
    placeholderSw,
    disabled = false,
    readOnly = false,
    leadingIcon: LeadingIcon = null,
    trailingIcon: TrailingIcon = null,
    className = '',
    inputClassName = '',
    containerClassName = '',
    autoComplete,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = externalId || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const displayLabel = lang === 'sw' && labelSw ? labelSw : label;
  const displayPlaceholder =
    lang === 'sw' && placeholderSw ? placeholderSw : placeholder;
  const displayHelper =
    lang === 'sw' && helperTextSw ? helperTextSw : helperText;
  const displayError = lang === 'sw' && errorSw ? errorSw : error;

  const hasError = Boolean(displayError);
  const showClearButton = Boolean(onClear && value && !disabled && !readOnly);

  return (
    <div className={cn('flex flex-col gap-1.5 w-full text-left', containerClassName)}>
      {/* Label Row */}
      {displayLabel && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold text-[#1A202C] tracking-wide flex items-center justify-between px-0.5"
        >
          <span className="flex items-center gap-1">
            <span>{displayLabel}</span>
            {required && (
              <span className="text-[#DC2626] font-bold" aria-hidden="true">
                *
              </span>
            )}
          </span>
          {labelSw && lang !== 'sw' && (
            <span className="text-[11px] font-normal text-[#718096]">
              {`(${labelSw})`}
            </span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="relative w-full flex items-center">
        {/* Leading Icon */}
        {LeadingIcon && (
          <div
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#718096] flex items-center justify-center"
            aria-hidden="true"
          >
            <LeadingIcon className="w-5 h-5 shrink-0" />
          </div>
        )}

        {/* Core Input Field */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={displayPlaceholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={
            hasError ? errorId : displayHelper ? helperId : undefined
          }
          className={cn(
            // Sizing: Guaranteed minimum 48px touch height
            'w-full min-h-[48px] py-3 text-sm rounded-xl border bg-white text-[#1A202C]',
            // Padding offsets for icons
            LeadingIcon ? 'pl-11' : 'pl-4',
            showClearButton || TrailingIcon || success
              ? 'pr-12'
              : 'pr-4',
            // Default border & typography
            'border-[#D1D5DB] placeholder:text-[#718096]',
            'transition-colors duration-150',
            // Focus state: Deep Teal ring
            'focus:border-[#006B5F] focus:ring-2 focus:ring-[#006B5F]/20 focus:outline-none',
            // Disabled state
            'disabled:bg-[#F1EFEA] disabled:text-[#718096] disabled:border-[#E2E8F0] disabled:cursor-not-allowed',
            // Error state
            hasError &&
              'border-[#DC2626] text-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20 bg-red-50/10',
            // Success state
            success && !hasError && 'border-[#15803D] focus:border-[#15803D] focus:ring-[#15803D]/20',
            inputClassName,
            className
          )}
          {...props}
        />

        {/* Trailing Controls */}
        <div className="absolute right-0.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
          {showClearButton && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear input value"
              className="min-w-[48px] min-h-[48px] w-12 h-12 flex items-center justify-center text-[#718096] hover:text-[#1A202C] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] rounded-full cursor-pointer"
            >
              <span className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F1EFEA] transition-colors">
                <X className="w-4 h-4" />
              </span>
            </button>
          )}

          {!showClearButton && success && !hasError && (
            <div className="w-12 h-12 flex items-center justify-center text-[#15803D]" aria-hidden="true">
              <Check className="w-5 h-5" />
            </div>
          )}

          {!showClearButton && !success && TrailingIcon && (
            <div className="w-12 h-12 flex items-center justify-center text-[#718096] pointer-events-none" aria-hidden="true">
              <TrailingIcon className="w-5 h-5 shrink-0" />
            </div>
          )}
        </div>
      </div>

      {/* Error or Helper Message */}
      {hasError ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-semibold text-[#DC2626] flex items-center gap-1.5 px-0.5 mt-0.5 leading-tight"
        >
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{displayError}</span>
        </p>
      ) : displayHelper ? (
        <p id={helperId} className="text-xs text-[#718096] px-0.5 mt-0.5 leading-tight">
          {displayHelper}
        </p>
      ) : null}
    </div>
  );
});

export default TextInput;
