import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from './utils';

export const SearchInput = forwardRef(function SearchInput(
  {
    value,
    onChange,
    onClear,
    placeholder = 'Search patient by name, ID, or phone...',
    placeholderSw = 'Tafuta mgonjwa kwa jina, kitambulisho, au nambari ya simu...',
    lang = 'en',
    className = '',
    containerClassName = '',
    disabled = false,
    autoFocus = false,
    ...props
  },
  ref
) {
  const displayPlaceholder = lang === 'sw' ? placeholderSw : placeholder;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && onClear) {
      onClear();
    }
  };

  return (
    <div className={cn('relative flex items-center w-full', containerClassName)}>
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none"
        aria-hidden="true"
      />

      <input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={displayPlaceholder}
        disabled={disabled}
        aria-label="Search records"
        className={cn(
          'w-full min-h-[48px] pl-10 pr-12 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-xl',
          'text-[#1A202C] placeholder:text-[#6B7280] transition-all duration-150 shadow-sm',
          'focus:border-[#006B5F] focus:ring-2 focus:ring-[#006B5F]/20 focus:outline-none',
          'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
          className
        )}
        autoFocus={autoFocus}
        {...props}
      />

      {value && onClear && !disabled ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search input"
          className="absolute right-0.5 top-1/2 -translate-y-1/2 min-w-[48px] min-h-[48px] w-12 h-12 flex items-center justify-center text-[#6B7280] hover:text-[#0A0A0A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] rounded-full cursor-pointer"
        >
          <span className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-3.5 h-3.5" />
          </span>
        </button>
      ) : null}
    </div>
  );
});

export default SearchInput;
