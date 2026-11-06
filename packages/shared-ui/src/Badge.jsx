import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from './utils';

const variantConfig = {
  // Healthy / Normal / Given
  healthy: {
    bg: 'bg-[#F0FAF5]',
    text: 'text-[#0E6835]',
    border: 'border-[#A3E0BF]',
    dot: 'bg-[#0E6835]',
    icon: CheckCircle2,
    defaultLabel: 'Healthy / Given',
    defaultLabelSw: 'Mzima / Imepewa',
  },
  normal: {
    bg: 'bg-[#F0FAF5]',
    text: 'text-[#0E6835]',
    border: 'border-[#A3E0BF]',
    dot: 'bg-[#0E6835]',
    icon: CheckCircle2,
    defaultLabel: 'Normal',
    defaultLabelSw: 'Kawaida',
  },
  given: {
    bg: 'bg-[#F0FAF5]',
    text: 'text-[#0E6835]',
    border: 'border-[#A3E0BF]',
    dot: 'bg-[#0E6835]',
    icon: CheckCircle2,
    defaultLabel: 'Given',
    defaultLabelSw: 'Imepewa',
  },

  // Monitor / Due / MAM
  due: {
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#8F5B00]',
    border: 'border-[#FDE68A]',
    dot: 'bg-[#D97706]',
    icon: Clock,
    defaultLabel: 'Due Soon',
    defaultLabelSw: 'Karibu',
  },
  monitor: {
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#8F5B00]',
    border: 'border-[#FDE68A]',
    dot: 'bg-[#D97706]',
    icon: AlertCircle,
    defaultLabel: 'Monitor',
    defaultLabelSw: 'Angalia',
  },
  mam: {
    bg: 'bg-[#FFFBEB]',
    text: 'text-[#8F5B00]',
    border: 'border-[#FDE68A]',
    dot: 'bg-[#D97706]',
    icon: AlertCircle,
    defaultLabel: 'MAM (Moderate Malnutrition)',
    defaultLabelSw: 'MAM (Utapiamlo wa Wastani)',
  },

  // Overdue / Critical / SAM / High-Risk ANC
  overdue: {
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#DC2626]',
    border: 'border-[#FCA5A5]',
    dot: 'bg-[#DC2626] animate-pulse',
    icon: AlertTriangle,
    defaultLabel: 'Overdue',
    defaultLabelSw: 'Imechelewa',
  },
  critical: {
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#DC2626]',
    border: 'border-[#FCA5A5]',
    dot: 'bg-[#DC2626] animate-pulse',
    icon: AlertTriangle,
    defaultLabel: 'Critical',
    defaultLabelSw: 'Muhimu',
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
  at_risk: {
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#DC2626]',
    border: 'border-[#FCA5A5]',
    dot: 'bg-[#DC2626] animate-pulse',
    icon: AlertTriangle,
    defaultLabel: 'At Risk',
    defaultLabelSw: 'Hatarini',
  },
  high_risk_anc: {
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#DC2626]',
    border: 'border-[#FCA5A5]',
    dot: 'bg-[#DC2626] animate-pulse',
    icon: AlertTriangle,
    defaultLabel: 'High-Risk ANC',
    defaultLabelSw: 'ANC ya Hatari Kubwa',
  },

  // Scheduled / Upcoming
  scheduled: {
    bg: 'bg-[#E6F4F1]',
    text: 'text-[#006B5F]',
    border: 'border-[#99D5CE]',
    dot: 'bg-[#006B5F]',
    icon: Clock,
    defaultLabel: 'Scheduled',
    defaultLabelSw: 'Imepangwa',
  },
  upcoming: {
    bg: 'bg-[#F3F4F6]',
    text: 'text-[#4B5563]',
    border: 'border-[#E5E7EB]',
    dot: 'bg-[#6B7280]',
    icon: Clock,
    defaultLabel: 'Upcoming',
    defaultLabelSw: 'Ijayo',
  },
};

export function Badge({
  status = 'normal',
  label,
  labelSw,
  lang = 'en',
  size = 'md',
  showDot = true,
  showIcon = false,
  className = '',
  children,
}) {
  const config = variantConfig[status.toLowerCase()] || variantConfig.normal;
  const Icon = config.icon;

  const resolvedText =
    children ||
    (lang === 'sw' && labelSw
      ? labelSw
      : label || (lang === 'sw' ? config.defaultLabelSw : config.defaultLabel));

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-colors select-none leading-none',
        config.bg,
        config.text,
        config.border,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            config.dot
          )}
          aria-hidden="true"
        />
      )}

      {showIcon && Icon && (
        <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      )}

      <span>{resolvedText}</span>
    </span>
  );
}

export default Badge;
