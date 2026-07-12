import React from 'react';
import { cn } from '@/lib/utils';

export default function HealthMetricCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  status = 'normal',
  color = '#0047FF',
  className,
  onClick,
}) {
  const statusColors = {
    normal: '#0F4C81',
    good: '#0F4C81',
    warning: '#F9A825',
    danger: '#E51010',
    info: '#0047FF',
  };
  const resolvedColor = statusColors[status] || color;

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-[24px] p-4 border border-[#E5E5E5]',
        'flex flex-col gap-2 select-none',
        'transition-all duration-200 ease-out',
        onClick && 'cursor-pointer active:scale-[0.97] hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] tracking-[0.15em] font-bold uppercase"
          style={{ color: '#A0A0A0' }}
        >
          {label}
        </span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${resolvedColor}15` }}
          >
            <Icon size={15} style={{ color: resolvedColor }} />
          </div>
        )}
      </div>
      <div className="flex items-end gap-1">
        <span className="text-[28px] font-bold leading-none tracking-tight text-[#0A0A0A]">
          {value ?? '—'}
        </span>
        {unit && (
          <span className="text-[13px] text-[#666666] mb-0.5 font-medium">{unit}</span>
        )}
      </div>
      {trend && (
        <span className="text-[11px] font-medium" style={{ color: resolvedColor }}>
          {trend}
        </span>
      )}
    </div>
  );
}
