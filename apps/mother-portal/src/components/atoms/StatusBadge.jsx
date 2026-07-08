import React from 'react';
import { cn } from '@/lib/utils';

const configs = {
  healthy:   { bg: 'bg-[#107C41]/10', text: 'text-[#107C41]', dot: 'bg-[#107C41]', label: 'Healthy' },
  given:     { bg: 'bg-[#107C41]/10', text: 'text-[#107C41]', dot: 'bg-[#107C41]', label: 'Given' },
  normal:    { bg: 'bg-[#107C41]/10', text: 'text-[#107C41]', dot: 'bg-[#107C41]', label: 'Normal' },
  achieved:  { bg: 'bg-[#107C41]/10', text: 'text-[#107C41]', dot: 'bg-[#107C41]', label: 'Achieved' },
  monitor:   { bg: 'bg-[#FFB900]/10', text: 'text-[#FFB900]', dot: 'bg-[#FFB900]', label: 'Monitor' },
  due:       { bg: 'bg-[#FFB900]/10', text: 'text-[#FFB900]', dot: 'bg-[#FFB900]', label: 'Due' },
  due_soon:  { bg: 'bg-[#FFB900]/10', text: 'text-[#FFB900]', dot: 'bg-[#FFB900]', label: 'Due Soon' },
  upcoming:  { bg: 'bg-[#006B5F]/10', text: 'text-[#006B5F]', dot: 'bg-[#006B5F]', label: 'Upcoming' },
  scheduled: { bg: 'bg-[#006B5F]/10', text: 'text-[#006B5F]', dot: 'bg-[#006B5F]', label: 'Scheduled' },
  at_risk:   { bg: 'bg-[#D13438]/10', text: 'text-[#D13438]', dot: 'bg-[#D13438]', label: 'At Risk' },
  overdue:   { bg: 'bg-[#D13438]/10', text: 'text-[#D13438]', dot: 'bg-[#D13438]', label: 'Overdue' },
  missed:    { bg: 'bg-[#D13438]/10', text: 'text-[#D13438]', dot: 'bg-[#D13438]', label: 'Missed' },
  critical:  { bg: 'bg-[#D13438]/10', text: 'text-[#D13438]', dot: 'bg-[#D13438]', label: 'Critical' },
  delayed:   { bg: 'bg-[#D13438]/10', text: 'text-[#D13438]', dot: 'bg-[#D13438]', label: 'Delayed' },
  mam:       { bg: 'bg-[#FFB900]/10', text: 'text-[#FFB900]', dot: 'bg-[#FFB900]', label: 'MAM' },
  sam:       { bg: 'bg-[#D13438]/10', text: 'text-[#D13438]', dot: 'bg-[#D13438]', label: 'SAM' },
  info:      { bg: 'bg-[#006B5F]/10', text: 'text-[#006B5F]', dot: 'bg-[#006B5F]', label: 'Info' },
  warning:   { bg: 'bg-[#FFB900]/10', text: 'text-[#FFB900]', dot: 'bg-[#FFB900]', label: 'Warning' },
  low:       { bg: 'bg-[#107C41]/10', text: 'text-[#107C41]', dot: 'bg-[#107C41]', label: 'Low Risk' },
  medium:    { bg: 'bg-[#FFB900]/10', text: 'text-[#FFB900]', dot: 'bg-[#FFB900]', label: 'Medium Risk' },
  high:      { bg: 'bg-[#D13438]/10', text: 'text-[#D13438]', dot: 'bg-[#D13438]', label: 'High Risk' },
};

export default function StatusBadge({ status, label, pulse = false, className }) {
  const config = configs[status] || configs.info;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
      'text-[10px] tracking-[0.15em] font-bold uppercase',
      config.bg, config.text, className
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full flex-shrink-0',
        config.dot,
        pulse && 'animate-pulse-dot'
      )} />
      {label || config.label}
    </span>
  );
}