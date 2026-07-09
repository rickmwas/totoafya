import React, { useEffect, useState } from 'react';
import { useLang } from '@/context/LanguageContext';

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('enter');
  const { lang } = useLang();

  useEffect(() => {
    const t = setTimeout(() => setPhase('show'), 100);
    return () => clearTimeout(t);
  }, []);

  const handleStart = () => {
    setPhase('exit');
    setTimeout(() => onDone(), 600);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden flex flex-col justify-between p-8"
      style={{
        background: '#f7f9f7',
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
      }}
    >
      {/* Top Section: Branding */}
      <div className="flex flex-col items-center mt-6 animate-slide-up">
        <div className="flex items-center gap-2 mb-2">
          {/* Green Heart Logo */}
          <svg className="w-10 h-10 text-toto-teal" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M50 82C50 82 20 57.5 20 37C20 25.4 29.4 16 41 16C46.8 16 50 20 50 20C50 20 53.2 16 59 16C70.6 16 80 25.4 80 37C80 57.5 50 82 50 82Z" 
              stroke="currentColor" 
              strokeWidth="6" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <circle cx="50" cy="38" r="7" fill="currentColor" />
            <path d="M34 50C34 44 42 42 50 42C58 42 66 44 66 50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <circle cx="50" cy="56" r="5" fill="currentColor" />
            <path d="M40 65C40 60 45 59 50 59C55 59 60 60 60 65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span className="text-3xl font-extrabold tracking-tight text-toto-teal">TotoAfya</span>
        </div>
        <p className="text-xs font-semibold tracking-wider uppercase text-toto-gray">
          {lang === 'sw' ? 'Mama Mwenye Afya, Mtoto Mwenye Afya' : 'Healthy mother, Healthy family'}
        </p>
      </div>

      {/* Center Section: Illustration Card */}
      <div className="flex-1 flex items-center justify-center my-6">
        <div className="relative w-full max-w-[280px] aspect-[4/5] rounded-[48px] overflow-hidden border-[8px] border-white shadow-[0_16px_40px_rgba(13,98,61,0.08)] bg-white animate-fade-in">
          <img 
            src="/mother-child.jpg" 
            alt="Mother and Child" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Bottom Section: Description & Button */}
      <div className="flex flex-col items-center gap-6 mb-4 max-w-[340px] mx-auto text-center">
        <p className="text-[14px] text-toto-gray leading-relaxed font-medium">
          {lang === 'sw' 
            ? 'TotoAfya ni mshirika wako wa kuaminika katika safari ya ujauzito, chanjo, na ukuaji wa mtoto wako.'
            : 'TotoAfya is your trusted companion through pregnancy, child growth, vaccination, and beyond.'}
        </p>
        
        <button
          onClick={handleStart}
          className="w-full h-14 bg-toto-teal hover:bg-toto-teal-dark active:scale-[0.97] text-white rounded-full font-bold text-[16px] shadow-[0_8px_24px_rgba(13,98,61,0.25)] transition-all duration-200"
        >
          {lang === 'sw' ? 'Anza Safari' : 'Get Started'}
        </button>
      </div>
    </div>
  );
}
