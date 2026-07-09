import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Shield, TrendingUp, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/context/LanguageContext';
import { useProfile } from '@/context/ProfileContext';

export default function AppShell({ children }) {
  const location = useLocation();
  const { t } = useLang();
  const { profile } = useProfile();

  const navItems = [
    { to: '/', icon: Home, key: 'home' },
    { to: '/care', icon: Shield, key: 'care' },
    { to: '/growth', icon: TrendingUp, key: 'growth' },
    { to: '/learn', icon: BookOpen, key: 'learn' },
    { to: '/more', icon: User, key: 'more' },
  ];

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Desktop/Tablet top nav */}
      <nav className="hidden sm:flex items-center justify-between px-6 md:px-10 py-3.5 bg-white/70 backdrop-blur-xl border-b border-[#EBEBEB] sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-toto-teal flex items-center justify-center shadow-teal-glow-sm">
            <span className="text-white text-[13px] font-extrabold">T</span>
          </div>
          <span className="text-[15px] font-extrabold text-[#0A0A0A]">TotoAfya</span>
        </div>
        <div className="flex items-center gap-1">
          {navItems.map(({ to, icon: Icon, key }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-2 px-4.5 py-2 rounded-full text-[13px] font-extrabold transition-all duration-200 active:scale-[0.96]',
                  active ? 'bg-toto-teal text-white shadow-teal-glow-sm' : 'text-toto-gray hover:bg-toto-teal/5 hover:text-toto-teal'
                )}
              >
                <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
                <span className="capitalize">{t(key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Page content */}
      <main className="pb-24 sm:pb-8 max-w-[430px] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
        {children}
      </main>

      {/* Mobile bottom nav — premium floating glass pill */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="mx-4 mb-4 bg-white/75 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-[0_12px_40px_rgba(0,0,0,0.06)] px-2.5 py-2">
          <div className="flex items-center justify-around">
            {navItems.map(({ to, icon: Icon, key }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-1.5 rounded-[22px] min-w-[52px] min-h-[52px] justify-center',
                    'transition-all duration-300 ease-out active:scale-[0.88] select-none',
                    active ? 'bg-toto-teal/10 text-toto-teal font-extrabold shadow-[inset_0_1px_2px_rgba(0,107,95,0.03)]' : 'bg-transparent text-toto-light hover:text-toto-gray'
                  )}
                >
                  <Icon size={19} strokeWidth={active ? 2.6 : 1.8} className={active ? 'text-toto-teal' : 'text-[#A0A0A0]'} />
                  <span className={cn('text-[8.5px] tracking-[0.08em] font-bold uppercase leading-none mt-0.5', active ? 'text-toto-teal' : 'text-[#A0A0A0]')}>
                    {t(key)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
