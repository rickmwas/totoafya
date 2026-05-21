import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Shield, TrendingUp, BookOpen, Settings, HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/context/LanguageContext';
import { useProfile } from '@/context/ProfileContext';

export default function AppShell({ children }) {
  const location = useLocation();
  const { t } = useLang();
  const { profile } = useProfile();

  const isPregnant = profile?.pregnancy_status === 'pregnant';
  const isCaregiverOnly = profile?.caregiver_type === 'father' || profile?.caregiver_type === 'guardian';

  const navItems = [
    { to: '/', icon: Home, key: 'home', always: true },
    ...(!isCaregiverOnly && isPregnant
      ? [{ to: '/anc', icon: HeartHandshake, key: 'anc', always: false }]
      : []),
    { to: '/vaccines', icon: Shield, key: 'vaccines', always: true },
    { to: '/growth', icon: TrendingUp, key: 'growth', always: true },
    { to: '/learn', icon: BookOpen, key: 'learn', always: true },
    { to: '/settings', icon: Settings, key: 'settings', always: true },
  ];

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Desktop/Tablet top nav */}
      <nav className="hidden sm:flex items-center justify-between px-6 md:px-10 py-3 bg-white/90 backdrop-blur-xl border-b border-[#E8E4DC] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-[#1B6B5A] flex items-center justify-center shadow-teal-glow-sm">
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
                  'flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-150',
                  active ? 'bg-[#1B6B5A] text-white shadow-teal-glow-sm' : 'text-[#666666] hover:bg-[#F0EDE6]'
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

      {/* Mobile bottom nav — floating pill */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="mx-3 mb-3 bg-white/95 backdrop-blur-xl rounded-[28px] border border-[#E8E4DC] shadow-[0_8px_30px_rgba(0,0,0,0.08)] px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map(({ to, icon: Icon, key }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-[20px] min-w-[48px] min-h-[48px] justify-center',
                    'transition-all duration-200 ease-out active:scale-[0.92] select-none',
                    active ? 'bg-[#1B6B5A]' : 'bg-transparent'
                  )}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} className={active ? 'text-white' : 'text-[#A0A0A0]'} />
                  <span className={cn('text-[9px] tracking-[0.1em] font-bold uppercase leading-none', active ? 'text-white' : 'text-[#A0A0A0]')}>
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
