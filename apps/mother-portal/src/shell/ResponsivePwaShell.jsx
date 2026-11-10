import React from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { OfflineFallbackShell } from './OfflineFallbackShell';
import { PwaInstallBanner } from './PwaInstallBanner';

/**
 * ResponsivePwaShell Component
 *
 * The canonical Progressive Web App Shell for TotoAfya Mother Experience:
 * - On desktop / wide tablet (>=640px): Centered in an elegant 390px–430px mobile frame
 *   with warm Sunlit Parchment stone canvas framing (bg-[#F9F8F5]), rounded-[36px],
 *   border-[#EBEBEB], and soft elevation shadow [0_20px_60px_rgba(0,0,0,0.12)].
 * - On mobile (<640px): 100% full-width edge-to-edge layout with native safe area insets.
 * - Natural Thumb Zone Ergonomics: Bottom navigation anchored strictly in the bottom 40%
 *   of the viewport for 1-handed accessibility.
 * - Strict 48x48px minimum touch target enforcement.
 * - Strict Anti-Pattern compliance: ZERO Unicode emojis (100% vector SVGs).
 * - Integrated Offline Resilience: Automatic offline detection banner in Savannah Ochre (#B45309).
 */
export function ResponsivePwaShell({
  children,
  topBar = null,
  bottomNav = null,
  lang = 'en',
  isOffline: propIsOffline = null,
  showOfflineBanner = true,
  showInstallBanner = false,
  onRetryConnection = null,
  className = '',
  contentClassName = '',
}) {
  const { isOffline: detectedOffline, checkConnection } = useOnlineStatus();
  const isOffline = propIsOffline !== null ? propIsOffline : detectedOffline;

  const handleRetry = onRetryConnection || checkConnection;

  return (
    <div
      data-testid="pwa-outer-canvas"
      className="min-h-screen w-full bg-[#F9F8F5] text-[#1A202C] flex flex-col justify-start items-center relative selection:bg-[#006B5F] selection:text-white"
    >
      {/* 
        Centered 390px–430px Mobile Smartphone Shell on Desktop Viewports.
        On mobile (<640px), takes 100% full width with zero outer margins.
      */}
      <div
        data-testid="pwa-shell-container"
        className={`w-full max-w-[430px] mx-auto min-h-screen bg-white sm:shadow-[0_20px_60px_rgba(0,0,0,0.12)] sm:border sm:border-[#EBEBEB] sm:my-6 sm:rounded-[36px] overflow-hidden flex flex-col relative transition-all ${className}`}
        style={{
          // Native mobile safe area insets (top notch & bottom home indicator)
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        {/* Optional Non-Intrusive PWA Install Banner */}
        {showInstallBanner && (
          <PwaInstallBanner
            lang={lang}
            forceVisible={true}
          />
        )}

        {/* Top App Bar Slot */}
        {topBar && (
          <header
            data-testid="pwa-top-bar-slot"
            className="w-full shrink-0 z-30 sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100"
          >
            {topBar}
          </header>
        )}

        {/* Integrated Offline Fallback Banner in Savannah Ochre (#B45309) */}
        {showOfflineBanner && isOffline && (
          <OfflineFallbackShell
            isOffline={true}
            onRetry={handleRetry}
            lang={lang}
            mode="banner"
          />
        )}

        {/* 
          Main Content Scrollable Viewport (Middle Reachable Zone)
        */}
        <main
          data-testid="pwa-main-content"
          role="main"
          className={`flex-1 overflow-y-auto w-full relative flex flex-col ${contentClassName}`}
        >
          {children}
        </main>

        {/* 
          Natural Thumb Zone Layout: Bottom Navigation Anchored in Bottom 40% 
          Safe area inset bottom applied to ensure compatibility with iPhone Home indicator & Android gestural bars.
        */}
        {bottomNav && (
          <nav
            data-testid="pwa-bottom-nav-slot"
            aria-label={lang === 'sw' ? 'Menyu kuu ya chini' : 'Bottom main navigation'}
            className="w-full shrink-0 sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {bottomNav}
          </nav>
        )}
      </div>
    </div>
  );
}

export default ResponsivePwaShell;
