import React from 'react';
import { AlertTriangle, Info, Zap, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/context/LanguageContext';

const severityConfig = {
  info: {
    bg: '#F0F4FF',
    border: '#2E5B47',
    icon: Info,
    iconColor: '#2E5B47',
    iconBg: '#2E5B4715',
  },
  warning: {
    bg: '#FFFBEB',
    border: '#F9A825',
    icon: AlertTriangle,
    iconColor: '#D97706',
    iconBg: '#F9A82518',
  },
  critical: {
    bg: '#FFF5F5',
    border: '#E51010',
    icon: Zap,
    iconColor: '#E51010',
    iconBg: '#E5101015',
  },
};

export default function AIAlertBanner({ alerts, onDismiss }) {
  const { lang } = useLang();

  if (!alerts || alerts.length === 0) return null;

  // Show only unresolved, unread
  const active = alerts.filter(a => !a.is_resolved && !a.is_read).slice(0, 3);
  if (active.length === 0) return null;

  return (
    <div className="mx-4 mb-4 flex flex-col gap-2">
      {active.map(alert => {
        const config = severityConfig[alert.severity] || severityConfig.info;
        const IconComp = config.icon;
        const title = lang === 'sw' && alert.title_sw ? alert.title_sw : alert.title;
        const message = lang === 'sw' && alert.message_sw ? alert.message_sw : alert.message;

        return (
          <div
            key={alert.id}
            className="rounded-[18px] flex items-start gap-3 overflow-hidden animate-slide-up transition-all duration-200"
            style={{ backgroundColor: config.bg, borderLeft: `3px solid ${config.border}`, padding: '14px 14px 14px 16px' }}
          >
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: config.iconBg }}>
              <IconComp size={15} style={{ color: config.iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[#0A0A0A] leading-tight mb-0.5">{title}</p>
              <p className="text-[11px] text-[#666666] leading-snug">{message}</p>
            </div>
            <button
              onClick={() => onDismiss?.(alert.id)}
              className="w-6 h-6 rounded-full bg-black/6 flex items-center justify-center active:scale-[0.9] transition-transform flex-shrink-0 mt-0.5"
            >
              <X size={12} className="text-[#999]" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
