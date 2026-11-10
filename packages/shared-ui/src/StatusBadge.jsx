import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import { cn } from './utils';

/**
 * StatusBadge — "The Sunlit Botanical Editorial" Clinical Status Indicator
 *
 * Implements:
 * - Anti-Pattern 7 Compliance: Overdue badges use dignified Savannah Ochre ("Catch-up Due"),
 *   never guilt-inducing or punitive red.
 * - Contrast Rule Compliance: Outlaws white text on Amber. Uses Charcoal Ink (#1A202C)
 *   or Deep Amber (#B45309) for full WCAG 2.1 AA/AAA compliance.
 * - Zero Unicode emojis — uses Lucide SVG vector icons exclusively.
 * - Bilingual localization (English & Kiswahili).
 * - Minimum 8px spacing clearance consideration.
 */

const variantConfig = {
  // Completed / Healthy / Administered / Normal
  completed: {
    bg: 'bg-[#F0FDF4]',
    text: 'text-[#15803D]',
    border: 'border-[#A3E0BF]',
    dot: 'bg-[#15803D]',
    icon: CheckCircle2,
    defaultLabel: 'Completed',
    defaultLabelSw: 'Imekamilika',
  },
  healthy: {
    bg: 'bg-[#F0FDF4]',
    text: 'text-[#15803D]',
    border: 'border-[#A3E0BF]',
    dot: 'bg-[#15803D]',
    icon: CheckCircle2,
    defaultLabel: 'Healthy',
    defaultLabelSw: 'Mzima',
  },
  given: {
    bg: 'bg-[#F0FDF4]',
    text: 'text-[#15803D]',
    border: 'border-[#A3E0BF]',
    dot: 'bg-[#15803D]',
    icon: CheckCircle2,
    defaultLabel: 'Given',
    defaultLabelSw: 'Imepewa',
  },
  normal: {
    bg: 'bg-[#F0FDF4]',
    text: 'text-[#15803D]',
    border: 'border-[#A3E0BF]',
    dot: 'bg-[#15803D]',
    icon: CheckCircle2,
    defaultLabel: 'Normal',
    defaultLabelSw: 'Kawaida',
  },

  // Upcoming / Scheduled / Info
  upcoming: {
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#1D4ED8]',
    border: 'border-[#BFDBFE]',
    dot: 'bg-[#1D4ED8]',
    icon: Calendar,
    defaultLabel: 'Upcoming',
    defaultLabelSw: 'Inayofuata',
  },
  scheduled: {
    bg: 'bg-[#E6F4F1]',
    text: 'text-[#006B5F]',
    border: 'border-[#99D5CE]',
    dot: 'bg-[#006B5F]',
    icon: Calendar,
    defaultLabel: 'Scheduled',
    defaultLabelSw: 'Imepangwa',
  },
  info: {
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#1D4ED8]',
    border: 'border-[#BFDBFE]',
    dot: 'bg-[#1D4ED8]',
    icon: Clock,
    defaultLabel: 'Information',
    defaultLabelSw: 'Taarifa',
  },

  // Overdue / Catch-up / Due Soon / Warning / MAM
  // STRICT: Dignified Savannah Ochre (#B45309 on #FFFBEB), NEVER shaming red!
  overdue: {
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
    dot: 'bg-[#B45309]',
    icon: Clock,
    defaultLabel: 'Catch-up Due',
    defaultLabelSw: 'Kukamilisha Huduma',
  },
  catch_up: {
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
    dot: 'bg-[#B45309]',
    icon: Clock,
    defaultLabel: 'Catch-up Due',
    defaultLabelSw: 'Kukamilisha Huduma',
  },
  due: {
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
    dot: 'bg-[#B45309]',
    icon: Clock,
    defaultLabel: 'Due Soon',
    defaultLabelSw: 'Inatarajiwa Hivi Karibuni',
  },
  warning: {
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
    dot: 'bg-[#B45309]',
    icon: AlertCircle,
    defaultLabel: 'Monitor',
    defaultLabelSw: 'Kuangaliwa',
  },
  mam: {
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
    dot: 'bg-[#B45309]',
    icon: AlertCircle,
    defaultLabel: 'MAM (Moderate Malnutrition)',
    defaultLabelSw: 'MAM (Utapiamlo wa Wastani)',
  },

  // Critical / Danger / SAM — Genuine medical emergency
  critical: {
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#DC2626]',
    border: 'border-[#FCA5A5]',
    dot: 'bg-[#DC2626] animate-pulse',
    icon: AlertTriangle,
    defaultLabel: 'Critical Danger',
    defaultLabelSw: 'Hatari Kubwa',
  },
  sam: {
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#DC2626]',
    border: 'border-[#FCA5A5]',
    dot: 'bg-[#DC2626] animate-pulse',
    icon: AlertTriangle,
    defaultLabel: 'SAM (Severe Malnutrition)',
    defaultLabelSw: 'SAM (Utapiamlo Mkali)',
  },
  danger: {
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#DC2626]',
    border: 'border-[#FCA5A5]',
    dot: 'bg-[#DC2626] animate-pulse',
    icon: ShieldAlert,
    defaultLabel: 'Danger Sign',
    defaultLabelSw: 'Dalili ya Hatari',
  },

  // Neutral / Draft / Inactive
  neutral: {
    bg: 'bg-[#F1EFEA]',
    text: 'text-[#4A5568]',
    border: 'border-[#E2E8F0]',
    dot: 'bg-[#64748B]',
    icon: Clock,
    defaultLabel: 'Recorded',
    defaultLabelSw: 'Imehifadhiwa',
  },
};

const sizeClasses = {
  sm: 'text-[11px] px-2.5 py-0.5 gap-1 font-semibold min-h-[24px]',
  md: 'text-xs px-3 py-1 gap-1.5 font-bold min-h-[28px]',
  lg: 'text-sm px-4 py-1.5 gap-2 font-bold min-h-[32px]',
};

export function StatusBadge({
  status = 'upcoming',
  label,
  labelSw,
  lang = 'en',
  size = 'md',
  showDot = true,
  showIcon = false,
  icon: CustomIcon,
  className = '',
  children,
}) {
  const normalizedStatus = String(status).toLowerCase().replace(/-/g, '_');
  const config = variantConfig[normalizedStatus] || variantConfig.upcoming;
  const Icon = CustomIcon || config.icon;

  const resolvedText =
    children ||
    (lang === 'sw'
      ? labelSw || config.defaultLabelSw
      : label || config.defaultLabel);

  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center rounded-full border transition-colors select-none leading-none shrink-0',
        config.bg,
        config.text,
        config.border,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    >
      {showDot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)}
          aria-hidden="true"
        />
      )}

      {showIcon && Icon && (
        <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      )}

      <span className="truncate">{resolvedText}</span>
    </span>
  );
}

export default StatusBadge;
