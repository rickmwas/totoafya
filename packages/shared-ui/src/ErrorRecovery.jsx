import React from 'react';
import { RefreshCw, ShieldCheck, ArrowLeft } from 'lucide-react';
import { PillButton } from './PillButton';
import { cn } from './utils';

/**
 * ErrorRecovery (SCR-27)
 * "The Sunlit Botanical Editorial" Empathetic Error Recovery Component
 *
 * Implements:
 * 1. Empathetic, calm, non-technical explanation in Swahili and English
 * 2. Explicit reassurance that local device records are 100% safe
 * 3. Primary retry PillButton (guaranteed 48x48px hit target)
 * 4. Zero raw technical error codes shown to the mother
 */

export function ErrorRecovery({
  title,
  titleEn,
  titleSw,
  message,
  messageEn,
  messageSw,
  onRetry,
  onBack,
  retryLabel,
  retryLabelEn,
  retryLabelSw,
  lang = 'sw',
  className,
  children,
}) {
  const isSw = lang === 'sw';

  const displayTitle =
    title ||
    (isSw ? titleSw : titleEn) ||
    (isSw
      ? 'Hitilafu Kidogo Imetokea'
      : 'Something Temporarily Went Wrong');

  const displayMessage =
    message ||
    (isSw ? messageSw : messageEn) ||
    (isSw
      ? 'Hatuwezi kupakia ukurasa huu kwa sasa. Tafadhali jaribu tena baada ya muda mfupi.'
      : 'We were unable to load this page at the moment. Please try again in a few moments.');

  const displayRetryLabel =
    retryLabel ||
    (isSw ? retryLabelSw : retryLabelEn) ||
    (isSw ? 'Jaribu Tena' : 'Try Again');

  return (
    <div
      className={cn(
        'bg-white rounded-[28px] border border-[#F1EFEA] p-7 text-center shadow-sm flex flex-col items-center max-w-md mx-auto my-6',
        className
      )}
    >
      {/* Calm Icon Container */}
      <div className="w-16 h-16 rounded-full bg-[#FFFBEB] border border-[#FEF3C7] flex items-center justify-center mb-4 text-[#D97706]">
        <RefreshCw size={26} strokeWidth={2} />
      </div>

      {/* Empathetic Headline */}
      <h3 className="font-serif text-lg font-bold text-[#1A202C] leading-snug mb-2">
        {displayTitle}
      </h3>

      {/* Reassurance & Non-technical explanation */}
      <p className="text-xs text-[#4A5568] leading-relaxed max-w-xs mb-4">
        {displayMessage}
      </p>

      {/* Safety Reassurance Chip */}
      <div className="w-full bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-3 flex items-center gap-2.5 text-left mb-6">
        <ShieldCheck size={20} className="text-[#16A34A] shrink-0" />
        <p className="text-[11px] text-[#166534] font-medium leading-tight">
          {isSw
            ? 'Rekodi zako za afya kwenye simu ziko salama na hazijapotea.'
            : 'Your local health records on this device are safe and secure.'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2.5 w-full justify-center">
        {onRetry && (
          <PillButton
            variant="primary"
            size="md"
            onClick={onRetry}
            className="w-full sm:w-auto"
          >
            <RefreshCw size={14} className="shrink-0" />
            <span>{displayRetryLabel}</span>
          </PillButton>
        )}

        {onBack && (
          <PillButton
            variant="ghost"
            size="md"
            onClick={onBack}
            className="w-full sm:w-auto"
          >
            <ArrowLeft size={14} className="shrink-0" />
            <span>{isSw ? 'Rudi Nyuma' : 'Go Back'}</span>
          </PillButton>
        )}
      </div>

      {children}
    </div>
  );
}
