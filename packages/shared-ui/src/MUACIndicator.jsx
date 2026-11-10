import React from 'react';
import { StatusBadge } from './StatusBadge';
import { cn } from './utils';

/**
 * MUACIndicator — Mid-Upper Arm Circumference Visual Gauge
 *
 * Implements:
 * - Kenya MoH & WHO standard color tape thresholds for child nutrition:
 *   - Red (< 11.5 cm): Severe Acute Malnutrition (SAM)
 *   - Yellow (11.5 – 12.4 cm): Moderate Acute Malnutrition (MAM)
 *   - Green (>= 12.5 cm): Normal / Healthy nutrition
 * - Smooth pointer indicator indicating current reading in centimeters
 * - Semantic StatusBadge integration
 * - Zero Unicode emojis — Lucide & SVG vectors exclusively
 * - Bilingual support (English & Kiswahili)
 */

export function MUACIndicator({
  value = 13.5, // measurement in cm
  lang = 'en',
  className = '',
}) {
  const isSw = lang === 'sw';
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  // Determine nutrition status
  let status = 'healthy';
  let statusLabel = 'Healthy (>= 12.5 cm)';
  let statusLabelSw = 'Kawaida / Mzima (>= 12.5 cm)';

  if (numericValue < 11.5) {
    status = 'sam';
    statusLabel = 'SAM (< 11.5 cm)';
    statusLabelSw = 'Utapiamlo Mkali (< 11.5 cm)';
  } else if (numericValue < 12.5) {
    status = 'mam';
    statusLabel = 'MAM (11.5 - 12.4 cm)';
    statusLabelSw = 'Utapiamlo wa Wastani (11.5 - 12.4 cm)';
  }

  // Calculate pointer position percentage along 9.0cm to 16.0cm scale
  const minScale = 9.0;
  const maxScale = 16.0;
  const clampedVal = Math.max(minScale, Math.min(maxScale, numericValue));
  const percent = ((clampedVal - minScale) / (maxScale - minScale)) * 100;

  return (
    <div
      role="region"
      aria-label="MUAC Nutrition Gauge"
      className={cn(
        'w-full bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col gap-3',
        className
      )}
    >
      {/* Top Header: Title & Status Badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#718096]">
            {isSw ? 'Kipimo cha Mkono (MUAC)' : 'Mid-Upper Arm Circumference (MUAC)'}
          </span>
          <p className="text-lg font-bold text-[#1A202C]">
            {numericValue.toFixed(1)} <span className="text-xs font-normal text-[#718096]">cm</span>
          </p>
        </div>

        <StatusBadge
          status={status}
          label={statusLabel}
          labelSw={statusLabelSw}
          lang={lang}
          size="sm"
        />
      </div>

      {/* Visual Tape Bar with Scale Marks */}
      <div className="relative pt-3 pb-1">
        {/* Pointer Triangle */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
          style={{ left: `${percent}%` }}
          aria-hidden="true"
        >
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#1A202C]" />
        </div>

        {/* Triple Segment Bar */}
        <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner border border-black/10">
          {/* SAM Red: 9.0 - 11.5cm -> (2.5 / 7.0) = 35.7% */}
          <div
            className="h-full bg-[#DC2626]"
            style={{ width: '35.7%' }}
            title="SAM (< 11.5 cm)"
          />
          {/* MAM Yellow: 11.5 - 12.4cm -> (1.0 / 7.0) = 14.3% */}
          <div
            className="h-full bg-[#F59E0B]"
            style={{ width: '14.3%' }}
            title="MAM (11.5 - 12.4 cm)"
          />
          {/* Normal Green: 12.5 - 16.0cm -> (3.5 / 7.0) = 50.0% */}
          <div
            className="h-full bg-[#15803D]"
            style={{ width: '50.0%' }}
            title="Normal (>= 12.5 cm)"
          />
        </div>

        {/* Legend Scale Labels */}
        <div className="flex justify-between text-[10px] text-[#718096] font-semibold mt-1.5 px-0.5">
          <span>9.0 cm</span>
          <span className="text-[#DC2626]">11.5 cm (SAM)</span>
          <span className="text-[#B45309]">12.5 cm (MAM)</span>
          <span className="text-[#15803D]">16.0 cm</span>
        </div>
      </div>
    </div>
  );
}

export default MUACIndicator;
