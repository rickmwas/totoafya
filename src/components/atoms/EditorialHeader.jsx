import React from 'react';
import { cn } from '@/lib/utils';

export default function EditorialHeader({ eyebrow, title, subtitle, className, center = false }) {
  return (
    <div className={cn('flex flex-col', center && 'items-center text-center', className)}>
      {eyebrow && (
        <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#A0A0A0] mb-2">
          {eyebrow}
        </span>
      )}
      {title && (
        <h1 className="text-[32px] sm:text-[40px] font-extrabold leading-none tracking-[-0.03em] text-[#0A0A0A]">
          {title}
        </h1>
      )}
      {subtitle && (
        <p className="text-[15px] text-[#666666] mt-2 leading-relaxed font-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
}