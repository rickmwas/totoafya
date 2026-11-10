import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from './utils';

/**
 * QuickActionCard — "The Sunlit Botanical Editorial" Action Card Molecule
 *
 * Implements:
 * - Reusable interactive card with leading icon, title, description, optional badge, and trailing chevron
 * - Guaranteed >= 48px hit target (min-h-[56px] for whole card container)
 * - Accessible keyboard interaction (Enter / Space support when rendered as button)
 * - Distinct icon color variants grounded in TotoAfya color tokens
 * - Zero Unicode emojis: Lucide vector icons exclusively
 * - Bilingual English/Kiswahili localization support
 */

const iconVariants = {
  teal: 'bg-[#E6F4F1] text-[#006B5F] border border-[#BCE1DB]',
  amber: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
  green: 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]',
  stone: 'bg-[#F1EFEA] text-[#4A5568] border border-[#E2E8F0]',
  crimson: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]',
};

const badgeVariants = {
  healthy: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
  warning: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
  critical: 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]',
  info: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
  neutral: 'bg-[#F1EFEA] text-[#64748B] border-[#E2E8F0]',
};

export function QuickActionCard({
  icon: Icon = null,
  title,
  titleSw,
  description,
  descriptionSw,
  badge = null,
  badgeSw = null,
  badgeVariant = 'neutral',
  iconVariant = 'teal',
  onClick,
  disabled = false,
  lang = 'en',
  className = '',
}) {
  const isSw = lang === 'sw';
  const resolvedTitle = isSw && titleSw ? titleSw : title;
  const resolvedDescription = isSw && descriptionSw ? descriptionSw : description;
  const resolvedBadge = isSw && badgeSw ? badgeSw : badge;

  const resolvedIconClasses = iconVariants[iconVariant] || iconVariants.teal;
  const resolvedBadgeClasses = badgeVariants[badgeVariant] || badgeVariants.neutral;

  const handleClick = (e) => {
    if (disabled) return;
    onClick?.(e);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e);
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled ? 'true' : undefined}
      aria-label={resolvedTitle}
      className={cn(
        // Base layout & minimum touch target guarantee (>= 48px, standard 56px+)
        'w-full min-h-[56px] p-4 rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs',
        'flex items-center gap-3.5 text-left transition-all duration-150 group select-none',
        // Hover & Focus states
        !disabled && [
          'cursor-pointer',
          'hover:border-[#006B5F]/40 hover:shadow-md hover:bg-[#FAF9F6]',
          'active:scale-[0.99]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] focus-visible:ring-offset-2',
        ],
        // Disabled appearance
        disabled && 'opacity-40 pointer-events-none cursor-not-allowed bg-[#F9F8F5]',
        className
      )}
    >
      {/* Leading Icon Container: Guaranteed >= 48x48px touch footprint */}
      {Icon && (
        <div
          className={cn(
            'w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center shrink-0 shadow-2xs',
            resolvedIconClasses
          )}
          aria-hidden="true"
        >
          <Icon className="w-5 h-5 shrink-0" />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          {resolvedTitle && (
            <h3 className="text-sm md:text-base font-bold text-[#1A202C] leading-snug group-hover:text-[#006B5F] transition-colors truncate">
              {resolvedTitle}
            </h3>
          )}

          {resolvedBadge && (
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border',
                resolvedBadgeClasses
              )}
            >
              {resolvedBadge}
            </span>
          )}
        </div>

        {resolvedDescription && (
          <p className="text-xs md:text-sm text-[#4A5568] leading-tight line-clamp-2">
            {resolvedDescription}
          </p>
        )}
      </div>

      {/* Trailing Chevron Action Indicator */}
      <div
        className="w-8 h-8 min-w-[32px] flex items-center justify-center text-[#718096] group-hover:text-[#006B5F] group-hover:translate-x-0.5 transition-all shrink-0"
        aria-hidden="true"
      >
        <ChevronRight className="w-5 h-5" />
      </div>
    </div>
  );
}
