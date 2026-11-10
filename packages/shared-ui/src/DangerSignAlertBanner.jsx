import React from 'react';
import { ShieldAlert, Phone, AlertTriangle, ArrowRight } from 'lucide-react';
import { PillButton } from './PillButton';
import { cn } from './utils';

/**
 * DangerSignAlertBanner — "The Sunlit Botanical Editorial" Clinical Emergency Banner
 *
 * Implements:
 * - High-urgency alert banner for maternal obstetric red flags and infant critical signs
 * - Crimson emergency background (#FEF2F2) with high-contrast red border (#DC2626)
 * - Immediate dialer action trigger via direct tel: URI
 * - Prominent red-flag symptoms checklist (fetal movements, bleeding, severe headache, convulsions)
 * - Guaranteed 48x48px hit targets on interactive actions with 8px spacing clearance
 * - Zero Unicode emojis — Lucide SVG vector icons exclusively
 * - Bilingual localization (English & Kiswahili)
 * - Accessible: role="alert" with clear contrast ratios
 */

export function DangerSignAlertBanner({
  title = 'Danger Signs Alert',
  titleSw = 'Ukaguzi wa Dalili za Hatari',
  description = 'If you experience severe headache, vaginal bleeding, reduced fetal movement, or high fever, seek immediate hospital care.',
  descriptionSw = 'Ukipata maumivu makali ya kichwa, kutokwa na damu, kupungua kwa mateke ya mtoto, au homa kali, nenda hospitali mara moja.',
  signs = [],
  signsSw = [],
  emergencyPhone = '1190',
  phoneLabel = 'Call Emergency (1190)',
  phoneLabelSw = 'Piga Simu ya Dharura (1190)',
  actionLabel = 'Emergency Triage & SOS',
  actionLabelSw = 'Mwongozo wa Dharura & SOS',
  onEmergencyCall,
  onAction,
  lang = 'en',
  className = '',
}) {
  const isSw = lang === 'sw';
  const resolvedTitle = isSw && titleSw ? titleSw : title;
  const resolvedDesc = isSw && descriptionSw ? descriptionSw : description;
  const resolvedSigns = isSw && signsSw && signsSw.length > 0 ? signsSw : signs;
  const resolvedPhoneLabel = isSw && phoneLabelSw ? phoneLabelSw : phoneLabel;
  const resolvedActionLabel = isSw && actionLabelSw ? actionLabelSw : actionLabel;

  return (
    <section
      role="alert"
      aria-label={resolvedTitle}
      className={cn(
        'w-full rounded-2xl bg-[#FEF2F2] border-2 border-[#DC2626] p-4 md:p-5 shadow-[0_4px_16px_rgba(220,38,38,0.15)]',
        'flex flex-col gap-3.5 text-left transition-all',
        className
      )}
    >
      {/* Header Row: Shield Icon + Title */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0 text-[#DC2626]">
          <ShieldAlert className="w-6 h-6 animate-pulse" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-[#DC2626]">
            {isSw ? 'Uangalizi wa Haraka' : 'Urgent Clinical Alert'}
          </span>
          <h3 className="text-base md:text-lg font-bold text-[#DC2626] leading-snug tracking-tight font-display">
            {resolvedTitle}
          </h3>
        </div>
      </div>

      {/* Main Guidance Text */}
      <p className="text-sm font-medium text-[#1A202C] leading-relaxed">
        {resolvedDesc}
      </p>

      {/* Danger Signs Checklist */}
      {resolvedSigns && resolvedSigns.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-1 text-xs font-semibold text-[#1A202C]">
          {resolvedSigns.map((sign, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-lg border border-red-200"
            >
              <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" aria-hidden="true" />
              <span>{sign}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Action Buttons Row with 8px Spacing Clearance */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Immediate Dialer Action Trigger */}
        {emergencyPhone && (
          <a
            href={`tel:${emergencyPhone}`}
            onClick={onEmergencyCall}
            className="inline-flex items-center justify-center rounded-full font-bold select-none leading-snug transition-all duration-150 ease-out active:scale-[0.98] min-h-[48px] min-w-[48px] px-6 py-3 text-sm gap-2 bg-[#DC2626] hover:bg-[#B91C1C] text-[#FFFFFF] shadow-[0_4px_12px_rgba(220,38,38,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#DC2626]"
          >
            <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{resolvedPhoneLabel}</span>
          </a>
        )}

        {/* Triage / SOS Flow Action */}
        {onAction && (
          <PillButton
            variant="outline"
            size="md"
            onClick={onAction}
            className="border-[#DC2626] text-[#DC2626] hover:bg-red-50 hover:border-[#B91C1C] focus-visible:ring-[#DC2626]"
          >
            <span>{resolvedActionLabel}</span>
            <ArrowRight className="w-4 h-4 ml-1 shrink-0" aria-hidden="true" />
          </PillButton>
        )}
      </div>
    </section>
  );
}

export default DangerSignAlertBanner;
