import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, MessageSquare, Footprints, AlertTriangle } from 'lucide-react';
import db from '@/api/totoafyaClient';

export default function QuickActions({ isPregnant, caregiverType, lang }) {
  const chatbotEnabled = db.features.isEnabled('enable-chatbot');
  
  const items = [];
  if (chatbotEnabled) {
    items.push(
      {
        to: '/ai-health',
        icon: Activity,
        label: lang === 'sw' ? 'Dalili' : 'Symptoms',
        bgColor: 'bg-blue-50/70 text-blue-600 border-blue-100/50',
      },
      {
        to: '/ai-health',
        icon: MessageSquare,
        label: lang === 'sw' ? 'Soga ya AI' : 'AI Chat',
        bgColor: 'bg-emerald-50/70 text-emerald-600 border-emerald-100/50',
      }
    );
  }
  
  items.push(
    {
      to: '/care',
      icon: Footprints,
      label: lang === 'sw' ? 'Kicks' : 'Kick Counter',
      bgColor: 'bg-amber-50/70 text-amber-600 border-amber-100/50',
    },
    {
      to: '/emergency',
      icon: AlertTriangle,
      label: lang === 'sw' ? 'Dharura' : 'Emergency',
      bgColor: 'bg-rose-50/70 text-rose-600 border-rose-100/50',
    }
  );

  return (
    <div className="mx-4 mb-8 animate-slide-up">
      <h3 className="text-[15px] font-bold text-toto-black mb-3">
        {lang === 'sw' ? 'Vitendo vya Haraka' : 'Quick Actions'}
      </h3>
      <div className={`grid gap-3 ${chatbotEnabled ? 'grid-cols-4' : 'grid-cols-2'}`}>
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              to={item.to}
              className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-colors ${item.bgColor}`}>
                <Icon size={22} strokeWidth={2.2} />
              </div>
              <span className="text-[11.5px] font-bold text-toto-gray text-center leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

