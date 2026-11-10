import React from 'react';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { PillButton } from './PillButton';
import { cn } from './utils';

/**
 * AppointmentBanner — "The Sunlit Botanical Editorial" Clinical Visit Banner
 *
 * Implements:
 * - Summary card for next Antenatal Care (ANC) contact or child immunization visit
 * - Warm sunlit background (#FFFBEB) with honey border (#FDE68A)
 * - Strict contrast compliance: Charcoal ink (#1A202C) headings, Deep Amber (#B45309) metadata
 * - Dignified countdown badge without punitive framing
 * - 48x48px guaranteed hit target on action button
 * - Zero Unicode emojis — Lucide SVG icons exclusively
 * - Bilingual localization (English & Kiswahili)
 */

export function AppointmentBanner({
  title,
  titleSw,
  category = 'Upcoming Clinic Appointment',
  categorySw = 'Kliniki Inayofuata',
  date,
  dateSw,
  facility,
  countdown,
  countdownSw,
  actionLabel = 'View Checklist',
  actionLabelSw = 'Angalia Maandalizi',
  onAction,
  lang = 'en',
  className = '',
}) {
  const isSw = lang === 'sw';
  const resolvedCategory = isSw && categorySw ? categorySw : category;
  const resolvedTitle = isSw && titleSw ? titleSw : title;
  const resolvedDate = isSw && dateSw ? dateSw : date;
  const resolvedCountdown = isSw && countdownSw ? countdownSw : countdown;
  const resolvedActionLabel = isSw && actionLabelSw ? actionLabelSw : actionLabel;

  return (
    <section
      aria-label={resolvedTitle || resolvedCategory}
      className={cn(
        'w-full rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 md:p-5 shadow-[0_2px_8px_rgba(180,83,9,0.06)]',
        'flex flex-col gap-3 text-left transition-all',
        className
      )}
    >
      {/* Top Metadata Row: Icon + Category + Countdown Badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0 text-[#B45309]">
            <Calendar className="w-4 h-4" aria-hidden="true" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#B45309]">
            {resolvedCategory}
          </span>
        </div>

        {resolvedCountdown && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
            <Clock className="w-3.5 h-3.5 mr-1 shrink-0" aria-hidden="true" />
            <span>{resolvedCountdown}</span>
          </span>
        )}
      </div>

      {/* Main Headline */}
      {resolvedTitle && (
        <h3 className="text-base md:text-lg font-bold text-[#1A202C] leading-snug tracking-tight font-display">
          {resolvedTitle}
        </h3>
      )}

      {/* Details Row: Date & Facility */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-[#4A5568]">
        {resolvedDate && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#718096] shrink-0" aria-hidden="true" />
            <span className="font-semibold text-[#1A202C]">{resolvedDate}</span>
          </div>
        )}

        {facility && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#718096] shrink-0" aria-hidden="true" />
            <span className="truncate">{facility}</span>
          </div>
        )}
      </div>

      {/* Trailing Action Button */}
      {onAction && (
        <div className="pt-1 flex items-center justify-start sm:justify-end">
          <PillButton
            variant="primary"
            size="md"
            onClick={onAction}
            className="w-full sm:w-auto"
          >
            <span>{resolvedActionLabel}</span>
            <ChevronRight className="w-4 h-4 ml-1 shrink-0" aria-hidden="true" />
          </PillButton>
        </div>
      )}
    </section>
  );
}

export default AppointmentBanner;
