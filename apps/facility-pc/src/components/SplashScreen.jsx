import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('enter');
  const [greeting, setGreeting] = useState({ en: '', sw: '' });

  useEffect(() => {
    // Dynamic greeting based on current local time
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting({
        en: "Good morning, Administrator",
        sw: "Asubuhi njema, Msimamizi"
      });
    } else if (hour < 16) {
      setGreeting({
        en: "Good afternoon, Administrator",
        sw: "Mchana mwema, Msimamizi"
      });
    } else {
      setGreeting({
        en: "Good evening, Administrator",
        sw: "Habari ya jioni, Msimamizi"
      });
    }

    const t1 = setTimeout(() => setPhase('show'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 2200); // Admin also prefers a faster load
    const t3 = setTimeout(() => onDone(), 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden flex flex-col justify-between"
      style={{
        background: '#FAF7F2', // Match the natural light cream background of the image
        opacity: phase === 'exit' ? 0 : 1,
        transition: 'opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
      }}
    >
      {/* Background Image: the complete designed splashscreen */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/splash.jpg")',
          transform: phase === 'enter' ? 'scale(1.01)' : 'scale(1.03)',
          transition: 'transform 2.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Floating bokeh/glowing lights that match the dots in the image */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Soft, large background light glows (Lens Flares) */}
        <div 
          className="absolute top-[32%] left-[12%] w-28 h-28 rounded-full animate-float-1" 
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.16) 0%, rgba(251, 191, 36, 0.05) 50%, transparent 80%)',
            filter: 'blur(12px)',
            mixBlendMode: 'screen',
          }} 
        />
        <div 
          className="absolute top-[48%] right-[18%] w-36 h-36 rounded-full animate-float-2" 
          style={{
            background: 'radial-gradient(circle, rgba(110, 231, 183, 0.12) 0%, rgba(52, 211, 153, 0.03) 60%, transparent 80%)',
            filter: 'blur(18px)',
            mixBlendMode: 'screen',
            animationDelay: '0.5s'
          }} 
        />
        <div 
          className="absolute top-[62%] left-[22%] w-24 h-24 rounded-full animate-float-1" 
          style={{
            background: 'radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, rgba(251, 146, 60, 0.04) 50%, transparent 80%)',
            filter: 'blur(10px)',
            mixBlendMode: 'screen',
            animationDelay: '1.5s'
          }} 
        />

        {/* Small sharp glowing embers */}
        <div 
          className="absolute top-[38%] left-[24%] w-3 h-3 rounded-full animate-float-1" 
          style={{
            background: 'radial-gradient(circle, #FFFFFF 0%, rgba(251, 191, 36, 0.8) 50%, transparent 100%)',
            boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)',
            filter: 'blur(0.5px)',
            mixBlendMode: 'screen',
            animationDelay: '0.3s'
          }} 
        />
        <div 
          className="absolute top-[55%] right-[28%] w-2.5 h-2.5 rounded-full animate-float-2" 
          style={{
            background: 'radial-gradient(circle, #FFFFFF 0%, rgba(16, 185, 129, 0.8) 50%, transparent 100%)',
            boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)',
            filter: 'blur(0.5px)',
            mixBlendMode: 'screen',
            animationDelay: '0.8s'
          }} 
        />
      </div>

      {/* Spacer to push text to the middle region */}
      <div className="h-[48vh]" />

      {/* Floating Greeting Text (positioned in the middle empty space) */}
      <div
        className="w-full relative z-20 px-8 text-center select-none flex flex-col items-center justify-center"
        style={{
          opacity: phase === 'show' ? 1 : 0,
          transform: phase === 'enter' ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 1s cubic-bezier(0.25, 1, 0.5, 1) 0.3s, transform 1s cubic-bezier(0.25, 1, 0.5, 1) 0.3s',
        }}
      >
        <p 
          className="text-xl font-medium tracking-[0.1em] leading-normal"
          style={{ 
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            color: '#10453A', 
            mixBlendMode: 'multiply',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.85), 0 0 15px rgba(255, 255, 255, 0.4)'
          }}
        >
          {greeting.en}
        </p>
        <p 
          className="text-xs font-semibold tracking-[0.14em] italic mt-2 opacity-95"
          style={{ 
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            color: '#C66C28', 
            mixBlendMode: 'multiply',
            textShadow: '0 1px 2px rgba(255, 255, 255, 0.85)'
          }}
        >
          {greeting.sw}
        </p>
      </div>

      {/* Subtle loader dots that match the image theme */}
      <div
        className="w-full pb-12 flex flex-col items-center justify-end z-20"
        style={{
          opacity: phase === 'show' ? 0.85 : 0,
          transition: 'opacity 0.5s ease 0.6s',
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-2 h-2 rounded-full animate-pulse-dot" 
            style={{ 
              animationDelay: '0s',
              background: 'radial-gradient(circle, #FFFFFF 0%, #E07A2F 60%, rgba(224, 122, 47, 0) 100%)',
              boxShadow: '0 0 8px rgba(224, 122, 47, 0.8), 0 0 16px rgba(224, 122, 47, 0.4)',
              mixBlendMode: 'screen'
            }} 
          />
          <div 
            className="w-2 h-2 rounded-full animate-pulse-dot" 
            style={{ 
              animationDelay: '0.2s',
              background: 'radial-gradient(circle, #FFFFFF 0%, #C8813A 60%, rgba(200, 129, 58, 0) 100%)',
              boxShadow: '0 0 8px rgba(200, 129, 58, 0.8), 0 0 16px rgba(200, 129, 58, 0.4)',
              mixBlendMode: 'screen'
            }} 
          />
          <div 
            className="w-2 h-2 rounded-full animate-pulse-dot" 
            style={{ 
              animationDelay: '0.4s',
              background: 'radial-gradient(circle, #FFFFFF 0%, #1B6B5A 60%, rgba(27, 107, 90, 0) 100%)',
              boxShadow: '0 0 8px rgba(27, 107, 90, 0.8), 0 0 16px rgba(27, 107, 90, 0.4)',
              mixBlendMode: 'screen'
            }} 
          />
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.4; transform: scale(0.85); filter: blur(0.5px); }
          50% { opacity: 1; transform: scale(1.35); filter: blur(0.0px); }
        }
        .animate-pulse-dot {
          animation: pulse-dot 1.6s ease-in-out infinite;
        }
        @keyframes float-spark-1 {
          0% { transform: translateY(0) translateX(0) scale(0.7); opacity: 0; }
          20% { opacity: 0.65; }
          80% { opacity: 0.65; }
          100% { transform: translateY(-70px) translateX(20px) scale(1.2); opacity: 0; }
        }
        @keyframes float-spark-2 {
          0% { transform: translateY(0) translateX(0) scale(1.1); opacity: 0; }
          25% { opacity: 0.55; }
          75% { opacity: 0.55; }
          100% { transform: translateY(-90px) translateX(-15px) scale(0.7); opacity: 0; }
        }
        .animate-float-1 {
          animation: float-spark-1 6s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-spark-2 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
