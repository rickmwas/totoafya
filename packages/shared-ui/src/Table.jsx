import React, { forwardRef } from 'react';
import { cn } from './utils';

export const Table = forwardRef(function Table(
  { children, className = '', containerClassName = '', ...props },
  ref
) {
  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm',
        containerClassName
      )}
    >
      <table
        ref={ref}
        className={cn('w-full min-w-[640px] text-left border-collapse', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
});

export const TableHeader = forwardRef(function TableHeader(
  { children, className = '', ...props },
  ref
) {
  return (
    <thead
      ref={ref}
      className={cn('bg-slate-50 border-b border-slate-200', className)}
      {...props}
    >
      {children}
    </thead>
  );
});

export const TableBody = forwardRef(function TableBody(
  { children, className = '', ...props },
  ref
) {
  return (
    <tbody
      ref={ref}
      className={cn('divide-y divide-slate-100 bg-white', className)}
      {...props}
    >
      {children}
    </tbody>
  );
});

export const TableRow = forwardRef(function TableRow(
  { children, className = '', isClickable = false, ...props },
  ref
) {
  return (
    <tr
      ref={ref}
      className={cn(
        'transition-colors',
        isClickable
          ? 'cursor-pointer hover:bg-teal-50/40 active:bg-teal-50/70'
          : 'hover:bg-slate-50/70',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
});

export const TableHead = forwardRef(function TableHead(
  { children, className = '', ...props },
  ref
) {
  return (
    <th
      ref={ref}
      className={cn(
        'px-4 py-3 text-left text-xs font-bold text-[#4A4A4A] uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
});

export const TableCell = forwardRef(function TableCell(
  { children, className = '', ...props },
  ref
) {
  return (
    <td
      ref={ref}
      className={cn('px-4 py-3.5 text-sm text-[#0A0A0A] align-middle', className)}
      {...props}
    >
      {children}
    </td>
  );
});

export function TableEmpty({
  title = 'No records found',
  description = 'No matching patient records in this view.',
  action = null,
  colSpan = 5,
  className = '',
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={cn('px-4 py-12 text-center text-slate-500', className)}
      >
        <p className="text-sm font-bold text-[#0A0A0A]">{title}</p>
        {description && (
          <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">
            {description}
          </p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </td>
    </tr>
  );
}

export default Table;
