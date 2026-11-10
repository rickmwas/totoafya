import React from 'react';

/**
 * Custom SVG Icons for Onboarding Flow
 * Strictly adheres to Anti-Pattern 2: ZERO Unicode emojis.
 * Built on standard 24x24 grid with 2.0px stroke and rounded terminals.
 */

export function BrandEmblem({ size = 48, className = '' }) {
  return (
    <div
      className={`rounded-full flex items-center justify-center shadow-md ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #006B5F 0%, #004D44 100%)',
      }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FEF3C7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FEF3C7" fillOpacity="0.3" />
        <circle cx="12" cy="12" r="3" fill="#FEF3C7" />
      </svg>
    </div>
  );
}

export function PregnantMotherIcon({ size = 28, color = '#006B5F', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Mother head */}
      <circle cx="9" cy="5" r="2.5" />
      {/* Curved body profile with pregnant belly */}
      <path d="M7 10h3c1.5 0 2.5 1 3 2.5 1 3 1 5-1 7.5H6" />
      {/* Back and posture */}
      <path d="M6 10v10" />
      {/* Radiant sunlit aura around belly */}
      <path d="M16 11c1 .5 2 2 2 3.5s-1 3-2 3.5" strokeOpacity="0.7" />
      <path d="M19 12.5c.8.5 1.2 1.3 1.2 2s-.4 1.5-1.2 2" strokeOpacity="0.4" />
    </svg>
  );
}

export function InfantChildIcon({ size = 28, color = '#006B5F', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Infant head */}
      <circle cx="12" cy="12" r="5" />
      {/* Gentle tuft of hair */}
      <path d="M12 7c-.5-1.5 0-2.5 1-3" />
      {/* Smiling eyes */}
      <circle cx="10" cy="11.5" r="0.75" fill={color} />
      <circle cx="14" cy="11.5" r="0.75" fill={color} />
      {/* Warm smile */}
      <path d="M10.5 14c.8.8 2.2.8 3 0" />
      {/* Sunburst radiance rays */}
      <path d="M12 2v2" strokeOpacity="0.6" />
      <path d="M19.07 4.93l-1.41 1.41" strokeOpacity="0.6" />
      <path d="M22 12h-2" strokeOpacity="0.6" />
      <path d="M4.93 4.93l1.41 1.41" strokeOpacity="0.6" />
      <path d="M2 12h2" strokeOpacity="0.6" />
    </svg>
  );
}

export function MotherAndChildIcon({ size = 28, color = '#006B5F', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Mother */}
      <circle cx="8" cy="5" r="2.2" />
      <path d="M6 10h3c1 0 2 .8 2.2 2 .8 2.5.5 4.5-.7 6.5H5v-7" />
      {/* Toddler/Infant held in arm */}
      <circle cx="16.5" cy="9.5" r="2" />
      <path d="M14 14.5c.8-.8 2-.8 3 0v4.5h-4" />
      {/* Protective embrace arm */}
      <path d="M9 13c1.5 1 3.5 1 5 0" />
    </svg>
  );
}

export function LockShieldIcon({ size = 24, color = '#006B5F', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <rect x="9" y="10" width="6" height="5" rx="1" />
      <path d="M10 10V8a2 2 0 1 1 4 0v2" />
    </svg>
  );
}

export function FingerprintIcon({ size = 24, color = '#006B5F', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 0-6.88 17.24" />
      <path d="M8.56 18.23A7 7 0 0 1 5 12a7 7 0 0 1 14 0c0 1.2-.23 2.3-.67 3.3" />
      <path d="M12 8a4 4 0 0 0-4 4c0 1.4.6 2.7 1.6 3.6" />
      <path d="M12 11a1 1 0 0 1 1 1v4" />
      <path d="M17 19a9.95 9.95 0 0 0 2-7" />
    </svg>
  );
}

export function EyeIcon({ size = 20, color = '#4A5568', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon({ size = 20, color = '#4A5568', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function BackspaceIcon({ size = 24, color = '#1A202C', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
      <line x1="18" y1="9" x2="12" y2="15" />
      <line x1="12" y1="9" x2="18" y2="15" />
    </svg>
  );
}

export function CalendarIcon({ size = 20, color = '#006B5F', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function SyringeVaccineIcon({ size = 24, color = '#006B5F', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 2l4 4" />
      <path d="M17 7l3-3" />
      <path d="M19 9L8.7 19.3c-.4.4-1 .4-1.4 0l-2.6-2.6c-.4-.4-.4-1 0-1.4L15 5" />
      <path d="M9 11l4 4" />
      <path d="M5 19l-3 3" />
      <path d="M14 4l6 6" />
    </svg>
  );
}

export function BotanicalFetalHeroIllustration({ className = '' }) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full max-w-[320px] h-auto ${className}`}
      aria-label="Sunlit Botanical Maternal Art"
      role="img"
    >
      {/* Soft warm sun background aura */}
      <circle cx="160" cy="110" r="85" fill="#FEF3C7" fillOpacity="0.45" />
      <circle cx="160" cy="110" r="68" fill="#FDE68A" fillOpacity="0.30" />

      {/* Stylized acacia botanical branches encircling */}
      <path
        d="M60 170c20-30 45-50 80-60m0 0c20-5 50-8 90 20"
        stroke="#2D6A4F"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Botanical acacia leaves */}
      <ellipse cx="90" cy="135" rx="5" ry="9" transform="rotate(-35 90 135)" fill="#006B5F" />
      <ellipse cx="110" cy="122" rx="5" ry="9" transform="rotate(-25 110 122)" fill="#006B5F" />
      <ellipse cx="130" cy="114" rx="5" ry="9" transform="rotate(-15 130 114)" fill="#006B5F" />
      <ellipse cx="190" cy="118" rx="5" ry="9" transform="rotate(25 190 118)" fill="#006B5F" />
      <ellipse cx="210" cy="130" rx="5" ry="9" transform="rotate(40 210 130)" fill="#006B5F" />
      <ellipse cx="225" cy="148" rx="5" ry="9" transform="rotate(55 225 148)" fill="#006B5F" />

      {/* Mother cradling newborn silhouette - continuous vector line */}
      <path
        d="M138 65c5-10 18-12 25-5 8 8 6 20-3 26-4 3-7 7-9 12-3 8-1 18 3 24 6 9 15 14 24 18"
        stroke="#004D44"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Newborn infant curled securely against chest */}
      <path
        d="M152 112c3-4 8-6 12-4 5 3 6 9 3 13-3 4-8 5-12 2"
        stroke="#E68A00"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="#FEF3C7"
        fillOpacity="0.6"
      />
      {/* Mother's protective hands */}
      <path
        d="M142 125c5 8 14 12 22 10"
        stroke="#004D44"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Golden morning sun accents */}
      <circle cx="160" cy="40" r="1.5" fill="#E68A00" />
      <circle cx="140" cy="46" r="1.2" fill="#E68A00" />
      <circle cx="180" cy="46" r="1.2" fill="#E68A00" />
    </svg>
  );
}

export function CelebrationWreathIcon({ size = 48, className = '' }) {
  return (
    <div
      className={`rounded-full flex items-center justify-center shadow-lg ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #E68A00 0%, #CC7A00 100%)',
      }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L15 9H22L16.5 13.5L18.5 20.5L12 16L5.5 20.5L7.5 13.5L2 9H9L12 2Z" fill="#FFFFFF" fillOpacity="0.25" />
      </svg>
    </div>
  );
}

export function FruitBotanicalIcon({ week = 28, size = 32, className = '' }) {
  // Renders vector botanical representation of Kenyan fruits/vegetables
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#006B5F"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Organic fruit silhouette with stem & leaf */}
      <path d="M12 2v3" stroke="#2D6A4F" />
      <path d="M12 3c2-2 5-1 6 0s0 4-2 4" stroke="#2D6A4F" fill="#2D6A4F" fillOpacity="0.3" />
      <path d="M7 9c-3 4-2 9 2 12s8 1 10-3c2-4 1-8-2-10-3-2-7-1-10 1z" fill="#006B5F" fillOpacity="0.15" />
    </svg>
  );
}
