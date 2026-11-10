import React from 'react';
import { CheckCircle2, Clock, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { cn } from './utils';

/**
 * MilestoneCard — "The Sunlit Botanical Editorial" Developmental Milestone Card Molecule
 *
 * Implements:
 * - Developmental timeline card representing maternal or infant milestones
 * - Categorization (Motor, Cognitive, Language, Social, Nutrition)
 * - Semantic status badge (Achieved / In Progress / Upcoming)
 * - 48x48px touch target on interactive actions
 * - Zero Unicode emojis: Lucide vector icons exclusively
 * - Bilingual English/Kiswahili localization support
 */

const statusMap = {
  achieved: {
    badgeStatus: 'healthy',
    defaultLabelEn: 'Achieved',
    defaultLabelSw: 'Imefikiwa',
    icon: CheckCircle2,
    iconColor: 'text-[#15803D]',
  },
  in_progress: {
    badgeStatus: 'warning',
    defaultLabelEn: 'In Progress',
    defaultLabelSw: 'Inaendelea',
    icon: Clock,
    iconColor: 'text-[#B45309]',
  },
  upcoming: {
    badgeStatus: 'neutral',
    defaultLabelEn: 'Upcoming',
    defaultLabelSw: 'Inayokuja',
    icon: Calendar,
    iconColor: 'text-[#718096]',
  },
};

export function MilestoneCard({
  title,
  titleSw,
  description,
  descriptionSw,
  category,
  categorySw,
  timing,
  timingSw,
  status = 'upcoming',
  statusLabel = null,
  statusLabelSw = null,
  actionLabel = null,
  actionLabelSw = null,
  onAction,
  isCompleted = false,
  lang = 'en',
  className = '',
}) {
  const isSw = lang === 'sw';

  // Resolved localized fields
  const resolvedTitle = isSw && titleSw ? titleSw : title;
  const resolvedDescription = isSw && descriptionSw ? descriptionSw : description;
  const resolvedCategory = isSw && categorySw ? categorySw : category;
  const resolvedTiming = isSw && timingSw ? timingSw : timing;

  // Resolve status configuration
  const currentStatusConfig = statusMap[status] || statusMap.upcoming;
  const resolvedStatusLabel =
    (isSw ? statusLabelSw : statusLabel) ||
    (isSw ? currentStatusConfig.defaultLabelSw : currentStatusConfig.defaultLabelEn);

  const StatusIcon = currentStatusConfig.icon;

  // Resolved action button label
  const defaultActionLabel = status === 'achieved' || isCompleted
    ? (isSw ? 'Angalia Maelezo' : 'View Details')
    : (isSw ? 'Weka Kuwa Imefikiwa' : 'Mark Achieved');

  const resolvedAction =
    (isSw ? actionLabelSw : actionLabel) || defaultActionLabel;

  return (
    <article
      aria-label={`${resolvedTitle} (${resolvedStatusLabel})`}
      className={cn(
        'w-full rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] p-4 md:p-5 shadow-xs',
        'flex flex-col gap-3.5 text-left transition-all duration-150',
        'hover:border-[#006B5F]/30 hover:shadow-sm',
        className
      )}
    >
      {/* Top Metadata Row: Category Pill + Timing Tag + StatusBadge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {resolvedCategory && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6F4F1] text-[#006B5F] border border-[#BCE1DB]">
              {resolvedCategory}
            </span>
          )}

          {resolvedTiming && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#718096]">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{resolvedTiming}</span>
            </span>
          )}
        </div>

        {/* Semantic Status Badge */}
        <StatusBadge
          status={currentStatusConfig.badgeStatus}
          label={resolvedStatusLabel}
          size="sm"
        />
      </div>

      {/* Main Body: Title & Description */}
      <div className="flex flex-col gap-1">
        <div className="flex items-start gap-2.5">
          <StatusIcon
            className={cn('w-5 h-5 shrink-0 mt-0.5', currentStatusConfig.iconColor)}
            aria-hidden="true"
          />
          <h3 className="text-base md:text-lg font-bold font-display text-[#1A202C] leading-snug">
            {resolvedTitle}
          </h3>
        </div>

        {resolvedDescription && (
          <p className="text-xs md:text-sm text-[#4A5568] leading-relaxed pl-7">
            {resolvedDescription}
          </p>
        )}
      </div>

      {/* Action Row: Interactive Button with >= 48px hit area */}
      {onAction && (
        <div className="pt-1 flex items-center justify-end">
          <button
            type="button"
            onClick={onAction}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-full font-bold select-none',
              'min-h-[48px] px-5 py-2.5 text-xs md:text-sm',
              status === 'achieved' || isCompleted
                ? 'bg-[#F1EFEA] hover:bg-[#E5E5E5] text-[#1A202C] border border-[#E2E8F0]'
                : 'bg-[#E6F4F1] hover:bg-[#D5EDE8] text-[#006B5F] border border-[#BCE1DB]',
              'active:scale-[0.98] transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] focus-visible:ring-offset-2'
            )}
          >
            <span>{resolvedAction}</span>
            <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      )}
    </article>
  );
}
