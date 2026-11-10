import React from 'react';
import { Bell, Cloud, CloudOff, Globe } from 'lucide-react';
import { ModeSwitcherPill } from '@totoafya/shared-ui';

/**
 * DashboardTopBar — "The Sunlit Botanical Editorial" Sticky Header Architecture
 *
 * Implements:
 * - Sticky top app bar for contextual orientation and system indicators
 * - Integrated ModeSwitcherPill (toggling Pregnancy vs Child mode)
 * - 1-tap Language Switcher toggle (EN | SW) with >= 48px hit target
 * - Notification bell with unread indicator and >= 48px hit target
 * - Offline sync status chip (#15803D online / #B45309 offline with Dark-on-Amber compliance)
 * - ZERO Unicode emojis: Custom Lucide SVG vector icons exclusively
 * - Bilingual English & Kiswahili support
 */

export function DashboardTopBar({
  mode = 'pregnancy',
  onModeChange,
  lang = 'en',
  onLangToggle,
  isOnline = true,
  hasPendingSync = false,
  unreadNotifications = 0,
  onNotificationsClick,
  className = '',
}) {
  const isSw = lang === 'sw';

  return (
    <header
      role="banner"
      className={`sticky top-0 z-30 w-full bg-[#F9F8F5]/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs ${className}`}
    >
      <div className="max-w-[430px] mx-auto w-full px-4 py-2.5 flex flex-col gap-2">
        {/* Top utility row: Brand / Sync / Lang / Bell */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand mark & Sync Status Chip */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 select-none">
              <div
                className="w-7 h-7 rounded-lg bg-[#006B5F] flex items-center justify-center text-white font-bold text-xs shadow-xs"
                aria-hidden="true"
              >
                T
              </div>
              <span className="font-serif font-bold text-base text-[#1A202C] tracking-tight">
                TotoAfya
              </span>
            </div>

            {/* Offline Sync Indicator Chip */}
            <div
              role="status"
              aria-label={
                isOnline
                  ? isSw
                    ? 'Imeunganishwa na kusawazishwa'
                    : 'Online & Synced'
                  : isSw
                    ? 'Bila mtandao — taarifa zimehifadhiwa'
                    : 'Offline — saved locally'
              }
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border select-none transition-colors ${
                isOnline && !hasPendingSync
                  ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                  : 'bg-[#FEF3C7] text-[#78350F] border-[#FDE68A]'
              }`}
            >
              {isOnline && !hasPendingSync ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-[#15803D] shrink-0" aria-hidden="true" />
                  <span>{isSw ? 'Imesawazishwa' : 'Synced'}</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-[#B45309] shrink-0" aria-hidden="true" />
                  <span>{isSw ? 'Bila Mtandao' : 'Offline'}</span>
                </>
              )}
            </div>
          </div>

          {/* Right Utilities: Language Toggle + Notification Bell */}
          <div className="flex items-center gap-1">
            {/* Bilingual Toggle Button (min 48x48px hit target) */}
            <button
              type="button"
              onClick={onLangToggle}
              aria-label={
                isSw ? 'Badili lugha hadi Kiingereza' : 'Switch language to Kiswahili'
              }
              className="min-h-[48px] min-w-[48px] p-2 flex items-center justify-center rounded-full text-[#4A5568] hover:text-[#1A202C] hover:bg-black/5 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F]"
            >
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-[#E2E8F0] shadow-2xs text-xs font-bold text-[#006B5F]">
                <Globe className="w-3 h-3 text-[#006B5F]" aria-hidden="true" />
                <span>{isSw ? 'SW' : 'EN'}</span>
              </div>
            </button>

            {/* Notification Bell Button (min 48x48px hit target) */}
            <button
              type="button"
              onClick={onNotificationsClick}
              aria-label={
                unreadNotifications > 0
                  ? isSw
                    ? `Una taarifa mpya ${unreadNotifications}`
                    : `You have ${unreadNotifications} unread notifications`
                  : isSw
                    ? 'Hakuna taarifa mpya'
                    : 'No new notifications'
              }
              className="min-h-[48px] min-w-[48px] p-2 flex items-center justify-center rounded-full text-[#4A5568] hover:text-[#1A202C] hover:bg-black/5 active:scale-95 transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F]"
            >
              <div className="relative">
                <Bell className="w-5 h-5 text-[#4A5568]" aria-hidden="true" />
                {unreadNotifications > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#DC2626] rounded-full ring-2 ring-white"
                    aria-hidden="true"
                  />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mode Switcher Pill Row (Pregnancy vs Child) */}
        <div className="w-full flex justify-center pt-0.5">
          <ModeSwitcherPill
            mode={mode}
            onModeChange={onModeChange}
            lang={lang}
            pregnancyLabel="My Pregnancy"
            pregnancyLabelSw="Mimba Yangu"
            childLabel="My Child"
            childLabelSw="Mtoto Wangu"
            className="w-full max-w-sm shadow-xs"
          />
        </div>
      </div>
    </header>
  );
}

export default DashboardTopBar;
