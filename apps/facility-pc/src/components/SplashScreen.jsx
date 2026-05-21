import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 2200);
    const t3 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(160deg, #F7F5F0 0%, #EAF3F0 50%, #F7F5F0 100%)',
        opacity: phase === 'exit' ? 0 : 1,
        transition: phase === 'exit' ? 'opacity 0.6s ease-in-out' : 'none',
      }}
    >
      {/* Decorative ambient blobs */}
      <div
        className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(27,107,90,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />
      <div
        className="absolute bottom-[15%] right-[5%] w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(200,129,58,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />
      <div
        className="absolute top-[40%] right-[10%] w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(27,107,90,0.07) 0%, transparent 70%)', filter: 'blur(30px)' }}
      />

      {/* Logo mark */}
      <div
        style={{
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'scale(0.7) translateY(12px)' : 'scale(1) translateY(0)',
          transition: 'opacity 0.7s cubic-bezier(0.34,1.56,0.64,1), transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        className="flex flex-col items-center"
      >
        {/* Icon ring */}
        <div className="relative mb-8">
          <div
            className="w-24 h-24 rounded-[28px] flex items-center justify-center shadow-[0_16px_48px_rgba(27,107,90,0.28)]"
            style={{ background: 'linear-gradient(145deg, #1B6B5A 0%, #2E8A74 100%)' }}
          >
            <span
              className="text-[42px] font-bold text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              T
            </span>
          </div>
          {/* Amber accent dot */}
          <div
            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full border-[3px] border-[#F7F5F0] flex items-center justify-center"
            style={{ background: '#C8813A' }}
          >
            <span className="text-white text-[10px]">+</span>
          </div>
        </div>

        {/* App name */}
        <h1
          className="text-[36px] font-bold text-[#1B6B5A] mb-1 leading-none"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          TotoAfya
        </h1>

        {/* Tagline */}
        <p
          className="text-[13px] font-medium tracking-[0.12em] uppercase text-[#1B6B5A]/50"
          style={{
            opacity: phase === 'show' ? 1 : 0,
            transition: 'opacity 0.6s ease 0.4s',
          }}
        >
          Kenya MCH Digital
        </p>
      </div>

      {/* Subtle bottom pulse ring */}
      <div
        className="absolute bottom-16 flex items-center gap-2"
        style={{
          opacity: phase === 'show' ? 0.6 : 0,
          transition: 'opacity 0.5s ease 0.8s',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#1B6B5A]"
            style={{
              animation: 'pulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
