import React from 'react';
import { cn } from './utils';

/**
 * Clean SVG Vector Icons built on 24x24 grid with 2.0px stroke
 * Strictly replaces Unicode emojis (Anti-Pattern 2 compliant)
 */

function MaternalIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Head */}
      <circle cx="12" cy="5" r="2.5" />
      {/* Torso with gentle maternal bump */}
      <path d="M9.5 9.5c.8-1 2-1.5 3.5-1.5 2 0 3.5 1.2 3.5 3.2 0 1.5-.7 2.5-1.5 3.3.8.5 1.5 1.3 1.5 2.5 0 2-1.8 3.5-4.5 3.5-2.2 0-3.5-1-4-2.5" />
      <path d="M9 13.5c1.2 0 2.8.8 2.8 2.5 0 1.2-.9 2-2.3 2" />
    </svg>
  );
}

function ChildIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Baby Head */}
      <circle cx="12" cy="8" r="4" />
      {/* Baby smile */}
      <path d="M10.5 8.5c.4.6 1.1 1 1.5 1s1.1-.4 1.5-1" />
      {/* Baby body / swaddle */}
      <path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      {/* Baby lock of hair */}
      <path d="M12 4c-.5-1-1.5-1.5-2-1.5" />
    </svg>
  );
}

/**
 * ModeSwitcherPill — Dual-mode toggle component
 *
 * Implements:
 * - Seamless toggle between "Mimba Yangu" (Pregnancy mode) and "Mtoto Wangu" (Child mode)
 * - Active indicator pill with solid white background, subtle elevation shadow, and Deep Teal (#006B5F)
 * - 48x48px guaranteed minimum hit target per segment
 * - Haptic-ready event callbacks (onHapticFeedback & safe navigator.vibrate fallback)
 * - Complete ban on Unicode emojis — custom 24px SVG line art
 * - WCAG 2.1 AA accessible tablist / radiogroup pattern with keyboard navigation
 */

export function ModeSwitcherPill({
  mode = 'pregnancy',
  onModeChange,
  pregnancyLabel = 'Mimba Yangu',
  pregnancyLabelSw = 'Mimba Yangu',
  pregnancySubtitle = '',
  childLabel = 'Mtoto Wangu',
  childLabelSw = 'Mtoto Wangu',
  childSubtitle = '',
  lang = 'sw',
  onHapticFeedback,
  className = '',
}) {
  const isPregnancy = mode === 'pregnancy';
  const isChild = mode === 'child';

  const resolvedPregnancyLabel =
    lang === 'sw' ? pregnancyLabelSw : pregnancyLabel;
  const resolvedChildLabel = lang === 'sw' ? childLabelSw : childLabel;

  const triggerHaptic = () => {
    if (typeof onHapticFeedback === 'function') {
      try {
        onHapticFeedback('selection');
      } catch {
        // Safe no-op
      }
    }
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(10);
      } catch {
        // Safe no-op for browsers blocking vibration
      }
    }
  };

  const handleSelectMode = (newMode) => {
    if (newMode !== mode) {
      triggerHaptic();
      if (onModeChange) {
        onModeChange(newMode);
      }
    }
  };

  const handleKeyDown = (e, targetMode) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectMode(targetMode);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      handleSelectMode(mode === 'pregnancy' ? 'child' : 'pregnancy');
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Mode switcher"
      className={cn(
        'inline-flex items-center bg-[#F1EFEA] border border-[#E2E8F0] p-1 rounded-full select-none shadow-inner',
        className
      )}
    >
      {/* Segment 1: Mimba Yangu (Pregnancy Mode) */}
      <button
        type="button"
        role="radio"
        aria-checked={isPregnancy}
        tabIndex={isPregnancy ? 0 : -1}
        onClick={() => handleSelectMode('pregnancy')}
        onKeyDown={(e) => handleKeyDown(e, 'pregnancy')}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 rounded-full font-semibold min-h-[48px] px-4 py-2 text-xs md:text-sm',
          'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] focus-visible:ring-offset-1',
          'active:scale-[0.98]',
          isPregnancy
            ? 'bg-[#FFFFFF] text-[#006B5F] shadow-[0_2px_8px_rgba(0,107,95,0.12),0_1px_2px_rgba(0,0,0,0.06)] font-bold'
            : 'text-[#4A5568] hover:text-[#1A202C] hover:bg-black/5 font-medium'
        )}
      >
        <MaternalIcon
          className={cn(
            'w-5 h-5 shrink-0 transition-colors',
            isPregnancy ? 'text-[#006B5F]' : 'text-[#718096]'
          )}
        />
        <div className="flex flex-col text-left leading-tight">
          <span className="tracking-tight">{resolvedPregnancyLabel}</span>
          {pregnancySubtitle && (
            <span
              className={cn(
                'text-[10px] font-normal leading-none',
                isPregnancy ? 'text-[#004D44]' : 'text-[#718096]'
              )}
            >
              {pregnancySubtitle}
            </span>
          )}
        </div>
      </button>

      {/* Segment 2: Mtoto Wangu (Child Mode) */}
      <button
        type="button"
        role="radio"
        aria-checked={isChild}
        tabIndex={isChild ? 0 : -1}
        onClick={() => handleSelectMode('child')}
        onKeyDown={(e) => handleKeyDown(e, 'child')}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 rounded-full font-semibold min-h-[48px] px-4 py-2 text-xs md:text-sm',
          'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] focus-visible:ring-offset-1',
          'active:scale-[0.98]',
          isChild
            ? 'bg-[#FFFFFF] text-[#006B5F] shadow-[0_2px_8px_rgba(0,107,95,0.12),0_1px_2px_rgba(0,0,0,0.06)] font-bold'
            : 'text-[#4A5568] hover:text-[#1A202C] hover:bg-black/5 font-medium'
        )}
      >
        <ChildIcon
          className={cn(
            'w-5 h-5 shrink-0 transition-colors',
            isChild ? 'text-[#006B5F]' : 'text-[#718096]'
          )}
        />
        <div className="flex flex-col text-left leading-tight">
          <span className="tracking-tight">{resolvedChildLabel}</span>
          {childSubtitle && (
            <span
              className={cn(
                'text-[10px] font-normal leading-none',
                isChild ? 'text-[#004D44]' : 'text-[#718096]'
              )}
            >
              {childSubtitle}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

export default ModeSwitcherPill;
