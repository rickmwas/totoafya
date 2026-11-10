import React from 'react';
import { Home, FileText, MessageCircle, ShieldCheck } from 'lucide-react';

/**
 * BottomNav4Tab — "The Sunlit Botanical Editorial" 4-Destination Bottom Navigation Shell
 *
 * Implements:
 * - Natural thumb zone architecture (bottom 40% of viewport)
 * - 4 core destinations:
 *     1. Home / Nyumbani
 *     2. Records / Kumbukumbu (Kadi ya Afya / Vaccines / Growth)
 *     3. Chat / AI Rafiki (Symptom triage & conversational companion)
 *     4. Care / Huduma (Facility contacts, clinics & emergency care)
 * - Minimum 48x48px touch target per tab (WCAG 2.1 AA / 2.2 compliant)
 * - Active pill styling: TotoAfya Deep Teal (#006B5F), bold label, and 4px rounded indicator dot
 * - Inactive state: Slate Grey (#64748B) with medium weight typography
 * - ZERO Unicode emojis: Clean Lucide SVG vector line art on 24px grid with 2.0px stroke
 * - Bilingual English & Kiswahili support via `lang` prop ('en' | 'sw')
 */

export const NAV_TABS = [
  {
    key: 'home',
    labelEn: 'Home',
    labelSw: 'Nyumbani',
    icon: Home,
    route: '/',
  },
  {
    key: 'records',
    labelEn: 'Records',
    labelSw: 'Kumbukumbu',
    icon: FileText,
    route: '/vaccines',
  },
  {
    key: 'chat',
    labelEn: 'Chat',
    labelSw: 'AI Rafiki',
    icon: MessageCircle,
    route: '/ai-health',
  },
  {
    key: 'care',
    labelEn: 'Care',
    labelSw: 'Huduma',
    icon: ShieldCheck,
    route: '/care',
  },
];

export function BottomNav4Tab({
  activeTab = 'home',
  onTabChange,
  lang = 'en',
  className = '',
}) {
  const isSw = lang === 'sw';

  const handleTabClick = (tab) => {
    if (typeof onTabChange === 'function') {
      onTabChange(tab.key, tab.route);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label={isSw ? 'Urambazaji wa Chini' : 'Bottom Navigation'}
      className={`fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40 bg-[#FFFFFF] border-t border-[#E5E7EB] shadow-[0_-2px_10px_rgba(0,0,0,0.04)] sm:border-x sm:rounded-t-2xl ${className}`}
    >
      <div className="max-w-[430px] mx-auto w-full h-16 flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom,0px)]">
        {NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          const label = isSw ? tab.labelSw : tab.labelEn;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              onClick={() => handleTabClick(tab)}
              className={`flex-1 min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-0.5 py-1 px-1 transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] active:scale-[0.96] ${
                isActive ? 'text-[#006B5F]' : 'text-[#64748B] hover:text-[#1A202C]'
              }`}
            >
              {/* Icon Container with min 24px visual frame */}
              <div
                className={`relative flex items-center justify-center transition-transform ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              >
                <Icon
                  className="w-5 h-5 shrink-0"
                  strokeWidth={isActive ? 2.3 : 1.8}
                  aria-hidden="true"
                />
              </div>

              {/* Tab Label */}
              <span
                className={`text-[11px] leading-tight tracking-tight text-center truncate max-w-full ${
                  isActive ? 'font-bold text-[#006B5F]' : 'font-medium text-[#64748B]'
                }`}
              >
                {label}
              </span>

              {/* 4px Rounded Active Indicator Dot */}
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-[#006B5F] opacity-100 scale-100' : 'bg-transparent opacity-0 scale-50'
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav4Tab;
