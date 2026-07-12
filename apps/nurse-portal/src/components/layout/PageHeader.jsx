import React from 'react';

export default function PageHeader({ title, subtitle, children, accentColor = '#0F4C81' }) {
  return (
    <div className="relative px-4 pt-14 pb-6 overflow-hidden">
      {/* Decorative blobs */}
      <div
        className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-[0.07] blur-2xl pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="absolute top-4 right-16 w-20 h-20 rounded-full opacity-[0.05] blur-xl pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      {subtitle && (
        <p className="text-[10px] tracking-[0.2em] font-bold uppercase mb-2" style={{ color: accentColor + 'BB' }}>
          {subtitle}
        </p>
      )}

      <h1
        className="text-[34px] font-bold leading-tight text-[#1a1a1a]"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {title}
      </h1>

      {children}
    </div>
  );
}
