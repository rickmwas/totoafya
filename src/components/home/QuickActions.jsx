import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, BookOpen, Sparkles, TrendingUp, Shield, Baby, ArrowRight } from 'lucide-react';

const PHOTOS = {
  anc:      'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=500&q=80',
  learn:    'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&q=80',
  ai:       'https://images.unsplash.com/photo-1576671081837-49000212a370?w=500&q=80',
  growth:   'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=500&q=80',
  vaccines: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=500&q=80',
  baby:     'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&q=80',
};

const ACTIONS = {
  pregnant: [
    { to: '/anc',      photo: PHOTOS.anc,      Icon: HeartHandshake, color: '#0047FF', en: 'ANC Visits',  sw: 'Ziara za ANC',  sub_en: 'Track your clinic',  sub_sw: 'Fuatilia kliniki' },
    { to: '/learn',    photo: PHOTOS.learn,    Icon: BookOpen,       color: '#7C3AED', en: 'Learn',       sw: 'Jifunze',       sub_en: 'Pregnancy videos', sub_sw: 'Video za ujauzito' },
    { to: '/ai-health',photo: PHOTOS.ai,       Icon: Sparkles,       color: '#0047FF', en: 'AI Health',   sw: 'Afya AI',       sub_en: 'Risk analysis',   sub_sw: 'Tathmini hatari' },
    { to: '/growth',   photo: PHOTOS.growth,   Icon: TrendingUp,     color: '#2E7A5D', en: 'Growth',      sw: 'Ukuaji',        sub_en: 'Weight records',  sub_sw: 'Rekodi za uzito' },
  ],
  child: [
    { to: '/vaccines', photo: PHOTOS.vaccines, Icon: Shield,         color: '#0047FF', en: 'Vaccines',    sw: 'Chanjo',        sub_en: 'Full schedule',   sub_sw: 'Ratiba kamili' },
    { to: '/growth',   photo: PHOTOS.growth,   Icon: TrendingUp,     color: '#2E7A5D', en: 'Growth',      sw: 'Ukuaji',        sub_en: 'WHO charts',      sub_sw: 'Grafu ya WHO' },
    { to: '/learn',    photo: PHOTOS.learn,    Icon: BookOpen,       color: '#7C3AED', en: 'Learn',       sw: 'Jifunze',       sub_en: 'Health videos',   sub_sw: 'Video za afya' },
    { to: '/ai-health',photo: PHOTOS.ai,       Icon: Sparkles,       color: '#0047FF', en: 'AI Health',   sw: 'Afya AI',       sub_en: 'AI insights',     sub_sw: 'Ushauri wa AI' },
  ],
  caregiver: [
    { to: '/vaccines', photo: PHOTOS.vaccines, Icon: Shield,         color: '#0047FF', en: 'Vaccines',    sw: 'Chanjo',        sub_en: 'Vaccine schedule',sub_sw: 'Ratiba ya chanjo' },
    { to: '/growth',   photo: PHOTOS.growth,   Icon: TrendingUp,     color: '#2E7A5D', en: 'Growth',      sw: 'Ukuaji',        sub_en: 'Track growth',    sub_sw: 'Fuatilia ukuaji' },
    { to: '/add-child',photo: PHOTOS.baby,     Icon: Baby,           color: '#F9A825', en: 'Add Child',   sw: 'Ongeza Mtoto',  sub_en: 'Register child',  sub_sw: 'Sajili mtoto' },
    { to: '/learn',    photo: PHOTOS.learn,    Icon: BookOpen,       color: '#7C3AED', en: 'Learn',       sw: 'Jifunze',       sub_en: 'Parenting guide', sub_sw: 'Mwongozo' },
  ],
};

export default function QuickActions({ isPregnant, caregiverType, lang }) {
  const key = (caregiverType === 'father' || caregiverType === 'guardian') ? 'caregiver' : isPregnant ? 'pregnant' : 'child';
  const actions = ACTIONS[key];

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#A0A0A0]">
          {lang === 'sw' ? 'VITENDO VYA HARAKA' : 'QUICK ACTIONS'}
        </p>
        <div className="flex items-center gap-1 text-[#A0A0A0]">
          <span className="text-[10px] font-semibold">{lang === 'sw' ? 'Telezesha' : 'Scroll'}</span>
          <ArrowRight size={10} />
        </div>
      </div>

      {/* Horizontal scroll strip */}
      <div
        className="flex gap-3 overflow-x-auto pl-4 pr-4 pb-1"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {actions.map(({ to, photo, Icon, color, en, sw, sub_en, sub_sw }) => (
          <Link
            key={to}
            to={to}
            className="flex-shrink-0 active:scale-[0.96] transition-transform duration-200"
            style={{ scrollSnapAlign: 'start', width: '148px' }}
          >
            {/* Card */}
            <div className="rounded-[22px] overflow-hidden relative" style={{ height: '188px' }}>
              {/* Photo */}
              <img
                src={photo}
                alt={en}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.65) 100%)' }}
              />
              {/* Top right icon pill */}
              <div
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: color, boxShadow: `0 4px 12px ${color}50` }}
              >
                <Icon size={13} className="text-white" strokeWidth={2.5} />
              </div>
              {/* Bottom text */}
              <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                <p className="text-[13px] font-bold text-white leading-tight">{lang === 'sw' ? sw : en}</p>
                <p className="text-[10px] text-white/65 mt-0.5">{lang === 'sw' ? sub_sw : sub_en}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}