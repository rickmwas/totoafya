import React from 'react';
import { cn } from '@/lib/utils';

const configs = {
  healthy:   { bg: 'bg-[#2E7A5D]/10', text: 'text-[#2E7A5D]', dot: 'bg-[#2E7A5D]', label: 'Healthy' },
  given:     { bg: 'bg-[#2E7A5D]/10', text: 'text-[#2E7A5D]', dot: 'bg-[#2E7A5D]', label: 'Given' },
  normal:    { bg: 'bg-[#2E7A5D]/10', text: 'text-[#2E7A5D]', dot: 'bg-[#2E7A5D]', label: 'Normal' },
  achieved:  { bg: 'bg-[#2E7A5D]/10', text: 'text-[#2E7A5D]', dot: 'bg-[#2E7A5D]', label: 'Achieved' },
  monitor:   { bg: 'bg-[#F9A825]/10', text: 'text-[#F9A825]', dot: 'bg-[#F9A825]', label: 'Monitor' },
  due:       { bg: 'bg-[#F9A825]/10', text: 'text-[#F9A825]', dot: 'bg-[#F9A825]', label: 'Due' },
  due_soon:  { bg: 'bg-[#F9A825]/10', text: 'text-[#F9A825]', dot: 'bg-[#F9A825]', label: 'Due Soon' },
  upcoming:  { bg: 'bg-[#0047FF]/10', text: 'text-[#0047FF]', dot: 'bg-[#0047FF]', label: 'Upcoming' },
  scheduled: { bg: 'bg-[#0047FF]/10', text: 'text-[#0047FF]', dot: 'bg-[#0047FF]', label: 'Scheduled' },
  at_risk:   { bg: 'bg-[#E51010]/10', text: 'text-[#E51010]', dot: 'bg-[#E51010]', label: 'At Risk' },
  overdue:   { bg: 'bg-[#E51010]/10', text: 'text-[#E51010]', dot: 'bg-[#E51010]', label: 'Overdue' },
  missed:    { bg: 'bg-[#E51010]/10', text: 'text-[#E51010]', dot: 'bg-[#E51010]', label: 'Missed' },
  critical:  { bg: 'bg-[#E51010]/10', text: 'text-[#E51010]', dot: 'bg-[#E51010]', label: 'Critical' },
  delayed:   { bg: 'bg-[#E51010]/10', text: 'text-[#E51010]', dot: 'bg-[#E51010]', label: 'Delayed' },
  mam:       { bg: 'bg-[#F9A825]/10', text: 'text-[#F9A825]', dot: 'bg-[#F9A825]', label: 'MAM' },
  sam:       { bg: 'bg-[#E51010]/10', text: 'text-[#E51010]', dot: 'bg-[#E51010]', label: 'SAM' },
  info:      { bg: 'bg-[#0047FF]/10', text: 'text-[#0047FF]', dot: 'bg-[#0047FF]', label: 'Info' },
  warning:   { bg: 'bg-[#F9A825]/10', text: 'text-[#F9A825]', dot: 'bg-[#F9A825]', label: 'Warning' },
  low:       { bg: 'bg-[#2E7A5D]/10', text: 'text-[#2E7A5D]', dot: 'bg-[#2E7A5D]', label: 'Low Risk' },
  medium:    { bg: 'bg-[#F9A825]/10', text: 'text-[#F9A825]', dot: 'bg-[#F9A825]', label: 'Medium Risk' },
  high:      { bg: 'bg-[#E51010]/10', text: 'text-[#E51010]', dot: 'bg-[#E51010]', label: 'High Risk' },
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