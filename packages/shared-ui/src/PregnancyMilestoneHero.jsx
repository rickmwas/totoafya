import React from 'react';
import { Calendar, Clock, ChevronRight, Sparkles, Heart } from 'lucide-react';
import { PillButton } from './PillButton';
import { cn } from './utils';

/**
 * BotanicalCircularWreath — SVG Vector Illustration
 *
 * Implements "The Sunlit Botanical Editorial" visual anchor:
 * - Two-tone botanical line art reflecting Kenyan flora (acacia / olive branches)
 * - Encircles stylized developmental stage line art
 * - ZERO Unicode emojis, ZERO uncanny 3D CGI renders
 */
function BotanicalCircularWreath({ className = '' }) {
  // Leaf angles around 360 degrees
  const leafAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  return (
    <div
      className={cn(
        'relative w-36 h-36 md:w-44 md:h-44 flex items-center justify-center shrink-0 mx-auto select-none',
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
      >
        {/* Soft background ambient halo */}
        <circle cx="80" cy="80" r="66" fill="rgba(255, 255, 255, 0.08)" />

        {/* Circular botanical vine spine */}
        <circle
          cx="80"
          cy="80"
          r="62"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.75"
          strokeDasharray="4 2"
        />

        {/* Botanical leaves radiating around the circular spine */}
        {leafAngles.map((angle) => (
          <g key={angle} transform={`rotate(${angle} 80 80)`}>
            {/* Outer leaf */}
            <path
              d="M 80 16 C 84 10 90 12 88 18 C 86 23 82 20 80 16 Z"
              fill="rgba(255, 255, 255, 0.65)"
            />
            {/* Inner secondary leaf */}
            <path
              d="M 80 17 C 76 12 70 14 72 19 C 74 23 78 21 80 17 Z"
              fill="rgba(255, 255, 255, 0.45)"
            />
            {/* Delicate twig junction */}
            <circle cx="80" cy="18" r="1.5" fill="rgba(255, 255, 255, 0.75)" />
          </g>
        ))}

        {/* Stylized Center Fetal Line Art Silhouette */}
        <g transform="translate(48, 44)">
          {/* Fetal head & spine curve */}
          <path
            d="M 38 10 C 48 10 56 18 56 28 C 56 36 50 44 42 46 C 40 54 44 64 36 68 C 28 72 16 68 18 56 C 20 48 24 46 22 40 C 20 34 22 26 28 18 C 31 14 34 10 38 10 Z"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(255, 255, 255, 0.15)"
          />
          {/* Curled limbs gentle outline */}
          <path
            d="M 36 40 C 33 42 28 41 26 46 C 24 51 29 55 33 54"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Subtle heartbeat pulse core */}
          <circle cx="37" cy="34" r="3" fill="#FEF3C7" opacity="0.9" />
          <path
            d="M 37 31 L 37.5 33.5 L 39 34 L 37.5 34.5 L 37 37 L 36.5 34.5 L 35 34 L 36.5 33.5 Z"
            fill="#E68A00"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * PregnancyMilestoneHero — "The Sunlit Botanical Editorial" Maternal Hero Organism
 *
 * Implements:
 * - Elevated hero card (rounded-3xl, gradient bg-gradient-to-br from-[#006B5F] to-[#004D44], text #FFFFFF, p-6)
 * - Top row: Gestational badge ("Wiki 28 • Trimester 3" / "Week 28 • Trimester 3") + countdown pill ("84 Siku Zimebaki" / "84 Days Remaining")
 * - Center graphic: Botanical circular wreath / clean SVG framing developmental stage
 * - Size analogy: Fruit/vegetable comparison (e.g. Biringanya / Eggplant) with length and weight metrics
 * - Footer bar: Translucent pill with weekly maternal advice snippet + "Read Full Week Guide →" CTA button
 * - Bilingual English/Kiswahili support via `lang` prop ('en' | 'sw')
 * - Minimum 48x48px hit areas for buttons and interactive controls
 * - ZERO Unicode emojis: Lucide SVG icons exclusively
 */
export function PregnancyMilestoneHero({
  week = 28,
  trimester = 3,
  daysRemaining = 84,
  sizeAnalogy = 'Eggplant (Garden Egg / Brinjal)',
  sizeAnalogySw = 'Biringanya',
  lengthCm = 37.6,
  weightGrams = 1000,
  adviceSnippet = 'Baby can now open their eyes, detect light changes, and practice gentle breathing movements.',
  adviceSnippetSw = 'Mtoto anaweza kufungua macho, kutambua mabadiliko ya mwanga, na kufanya mazoezi ya kupumua.',
  onReadGuide,
  actionLabel = 'Read Full Week Guide →',
  actionLabelSw = 'Soma Mwongozo Kamili wa Wiki →',
  lang = 'en',
  className = '',
}) {
  const isSw = lang === 'sw';

  // Localized badge strings
  const gestationalBadgeText = isSw
    ? `Wiki ${week} • Trimester ${trimester}`
    : `Week ${week} • Trimester ${trimester}`;

  const countdownText = isSw
    ? `${daysRemaining} Siku Zimebaki`
    : `${daysRemaining} Days Remaining`;

  const resolvedSizeAnalogy = isSw && sizeAnalogySw ? sizeAnalogySw : sizeAnalogy;
  const resolvedAdvice = isSw && adviceSnippetSw ? adviceSnippetSw : adviceSnippet;
  const resolvedActionLabel = isSw && actionLabelSw ? actionLabelSw : actionLabel;

  const lengthLabel = isSw ? 'Urefu' : 'Length';
  const weightLabel = isSw ? 'Uzito' : 'Weight';
  const sizeHeadingPrefix = isSw ? 'Mtoto ana ukubwa wa' : 'Baby is the size of an';

  return (
    <article
      aria-label={gestationalBadgeText}
      className={cn(
        'w-full rounded-3xl bg-gradient-to-br from-[#006B5F] to-[#004D44] text-[#FFFFFF] p-6 md:p-8',
        'shadow-[0_8px_24px_rgba(0,107,95,0.28)] flex flex-col gap-6 relative overflow-hidden transition-all',
        className
      )}
    >
      {/* Decorative ambient background rings */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-black/10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Row: Gestational Badge + Countdown Pill */}
      <div className="flex items-center justify-between gap-3 flex-wrap z-10">
        {/* Gestational Badge */}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold',
            'bg-white/15 border border-white/25 text-[#FFFFFF] backdrop-blur-xs select-none'
          )}
        >
          <Calendar className="w-3.5 h-3.5 shrink-0 text-white" aria-hidden="true" />
          <span>{gestationalBadgeText}</span>
        </div>

        {/* Countdown Pill — Dark-on-Amber WCAG 2.1 AA Compliance */}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-bold',
            'bg-[#FEF3C7] text-[#1A202C] border border-[#FDE68A] shadow-xs select-none'
          )}
        >
          <Clock className="w-3.5 h-3.5 shrink-0 text-[#B45309]" aria-hidden="true" />
          <span>{countdownText}</span>
        </div>
      </div>

      {/* Center Section: Botanical Wreath & Developmental Size Analogy */}
      <div className="flex flex-col md:flex-row items-center gap-6 z-10 my-1">
        {/* Center Graphic: Botanical Circular Wreath */}
        <BotanicalCircularWreath />

        {/* Size Analogy & Clinical Measurements */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-3">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/80 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#FEF3C7]" aria-hidden="true" />
            <span>{sizeHeadingPrefix}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold font-display text-white tracking-tight leading-tight">
            {resolvedSizeAnalogy}
          </h2>

          {/* Metric Chips (Length & Weight with Tabular Numbers) */}
          <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap pt-1">
            <span
              className={cn(
                'inline-flex items-center px-3 py-1.5 rounded-xl text-xs md:text-sm font-medium',
                'bg-white/15 border border-white/20 text-white backdrop-blur-xs tabular-nums'
              )}
            >
              <span className="text-white/70 mr-1.5">{`${lengthLabel}:`}</span>
              <strong>{`~${lengthCm} cm`}</strong>
            </span>

            <span
              className={cn(
                'inline-flex items-center px-3 py-1.5 rounded-xl text-xs md:text-sm font-medium',
                'bg-white/15 border border-white/20 text-white backdrop-blur-xs tabular-nums'
              )}
            >
              <span className="text-white/70 mr-1.5">{`${weightLabel}:`}</span>
              <strong>{`~${weightGrams} g`}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Footer Bar: Translucent Advice Pill + 48x48px CTA Button */}
      <div
        className={cn(
          'w-full rounded-2xl bg-white/10 border border-white/20 p-4 md:p-5',
          'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10 backdrop-blur-xs'
        )}
      >
        <div className="flex items-start gap-2.5 flex-1">
          <Heart className="w-4 h-4 text-[#FEF3C7] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs md:text-sm text-white/95 leading-relaxed font-normal">
            {resolvedAdvice}
          </p>
        </div>

        {/* Action Button: Guaranteed >= 48px hit area */}
        <button
          type="button"
          onClick={onReadGuide}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-full font-bold select-none leading-snug',
            'min-h-[48px] px-6 py-2.5 text-xs md:text-sm shrink-0 w-full sm:w-auto',
            'bg-[#FFFFFF] text-[#006B5F] hover:bg-[#F9F8F5] active:scale-[0.98]',
            'shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#004D44]'
          )}
        >
          <span>{resolvedActionLabel}</span>
          <ChevronRight className="w-4 h-4 shrink-0 text-[#006B5F]" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
