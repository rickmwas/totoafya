import React, { useState } from 'react';
import { WifiOff, RotateCw, HardDrive, CheckCircle2, X } from 'lucide-react';

/**
 * OfflineFallbackShell Component
 *
 * Implements TotoAfya Mother Experience offline resilience architecture:
 * 1. Graceful offline fallback indicator chip in Savannah Ochre (#B45309)
 * 2. Non-blocking notification banner informing mothers that data is cached locally
 * 3. Cache-friendly offline recovery state with manual retry action
 * 4. Strict 48x48px touch target enforcement (WCAG 2.2 AA)
 * 5. Dark-on-Amber contrast compliance (exceeds 4.5:1 ratio)
 * 6. ZERO Unicode emojis (vector SVG icons only)
 * 7. Bilingual English / Kiswahili support
 */
export function OfflineFallbackShell({
  isOffline = true,
  onRetry = null,
  lang = 'en',
  mode = 'banner', // 'banner' | 'chip' | 'fullscreen' | 'wrapper'
  title = null,
  description = null,
  dismissible = true,
  showLocalCacheNotice = true,
  className = '',
  children = null,
}) {
  const [dismissed, setDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const isSw = lang === 'sw';

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      if (typeof onRetry === 'function') {
        await onRetry();
      } else if (typeof window !== 'undefined' && window.location) {
        // Safe connectivity ping or soft recheck
        window.dispatchEvent(new Event('online'));
      }
    } finally {
      // Small feedback timeout for visual touch confirmation
      setTimeout(() => setIsRetrying(false), 450);
    }
  };

  // If not offline and in wrapper mode, just render children
  if (!isOffline && mode === 'wrapper') {
    return <>{children}</>;
  }

  // If not offline and standalone, render nothing
  if (!isOffline && mode !== 'chip') {
    return null;
  }

  /* -------------------------------------------------------------------------
   * VARIANT A: Minimal Savannah Ochre Indicator Chip (#B45309)
   * ------------------------------------------------------------------------- */
  if (mode === 'chip') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors select-none ${
          isOffline
            ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
            : 'bg-[#E6F4F1] text-[#006B5F] border-[#B2DFDB]'
        } ${className}`}
        style={{ minHeight: '32px' }}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isOffline ? 'bg-[#B45309]' : 'bg-[#006B5F] animate-pulse'
          }`}
          aria-hidden="true"
        />
        {isOffline ? (
          <WifiOff className="w-3.5 h-3.5 text-[#B45309]" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-[#006B5F]" aria-hidden="true" />
        )}
        <span>
          {isOffline
            ? isSw
              ? 'Nje ya Mtandao'
              : 'Offline Mode'
            : isSw
            ? 'Mtandaoni'
            : 'Online'}
        </span>
      </div>
    );
  }

  /* -------------------------------------------------------------------------
   * VARIANT B: Fullscreen Cache-Friendly Recovery State
   * ------------------------------------------------------------------------- */
  if (mode === 'fullscreen') {
    return (
      <section
        role="region"
        aria-label={isSw ? 'Taarifa ya ukosefu wa mtandao' : 'Offline recovery notice'}
        className={`w-full min-h-[460px] flex flex-col items-center justify-center p-6 text-center bg-[#F9F8F5] sm:rounded-3xl ${className}`}
      >
        {/* Sunlit Botanical Line Art Vector Container */}
        <div className="w-20 h-20 rounded-full bg-[#FEF3C7] border-2 border-[#FDE68A] flex items-center justify-center mb-5 shadow-sm">
          <WifiOff className="w-10 h-10 text-[#B45309]" strokeWidth={2} aria-hidden="true" />
        </div>

        {/* Savannah Ochre Indicator Chip */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
            <span className="w-2 h-2 rounded-full bg-[#B45309]" aria-hidden="true" />
            <span>{isSw ? 'Uko Nje ya Mtandao' : 'Working Offline'}</span>
          </div>
        </div>

        {/* Headings with high contrast (#1A202C) */}
        <h2
          className="text-xl sm:text-2xl font-bold text-[#1A202C] mb-2"
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}
        >
          {title || (isSw ? 'Hakuna Muunganisho wa Mtandao' : 'No Internet Connection')}
        </h2>

        <p className="text-sm text-[#4A5568] max-w-xs mb-6 leading-relaxed">
          {description ||
            (isSw
              ? 'Usijali, kumbukumbu zote za mama na mtoto zimehifadhiwa salama kwenye kifaa chako na zitalandanishwa mtandao ukirejea.'
              : 'Rest assured, all maternal and child records remain accessible on your device and will sync automatically when you reconnect.')}
        </p>

        {/* Local Storage Assurance Card */}
        {showLocalCacheNotice && (
          <div className="w-full max-w-sm mb-6 p-3.5 bg-white border border-[#E5E7EB] rounded-2xl flex items-center gap-3 text-left shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5 text-[#006B5F]" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#1A202C]">
                {isSw ? 'Hifadhi ya Ndani Inafanya Kazi' : 'Local Device Storage Active'}
              </p>
              <p className="text-[11px] text-[#64748B]">
                {isSw ? 'Unaweza kuendelea kutazama kadi' : 'You can browse your saved records freely'}
              </p>
            </div>
          </div>
        )}

        {/* Action Controls with Strict 48x48px Hit Targets */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full min-h-[48px] px-5 py-3 rounded-full font-bold text-sm text-white bg-[#006B5F] hover:bg-[#004D44] active:bg-[#003831] transition-all shadow-sm flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] focus-visible:ring-offset-2 disabled:opacity-60 cursor-pointer"
            aria-label={isSw ? 'Jaribu kuunganisha tena mtandao' : 'Retry network connection'}
          >
            <RotateCw
              className={`w-4 h-4 text-white ${isRetrying ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>
              {isRetrying
                ? isSw
                  ? 'Inajaribu Kuunganisha...'
                  : 'Checking Connection...'
                : isSw
                ? 'Jaribu Tena'
                : 'Retry Connection'}
            </span>
          </button>
        </div>
      </section>
    );
  }

  /* -------------------------------------------------------------------------
   * VARIANT C: Non-Blocking Notification Banner (Default & Wrapper Mode)
   * ------------------------------------------------------------------------- */
  if (dismissed && mode !== 'wrapper') {
    return null;
  }

  const bannerElement = !dismissed ? (
    <aside
      role="status"
      aria-live="polite"
      aria-label={isSw ? 'Ilani ya kutokuwa mtandaoni' : 'Offline notification banner'}
      className={`w-full bg-[#FEF3C7] border-b border-[#FDE68A] text-[#1A202C] px-3.5 py-2.5 transition-all shadow-sm ${className}`}
    >
      <div className="flex items-start sm:items-center justify-between gap-3 max-w-screen-sm mx-auto">
        {/* Left: Savannah Ochre Indicator Chip & Messaging */}
        <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
          {/* Savannah Ochre Status Chip */}
          <div
            className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] select-none mt-0.5 sm:mt-0"
            title={isSw ? 'Uko nje ya mtandao' : 'You are offline'}
          >
            <WifiOff className="w-3 h-3 text-[#B45309]" aria-hidden="true" />
            <span>{isSw ? 'Nje ya Mtandao' : 'Offline'}</span>
          </div>

          {/* Copy - High Contrast Charcoal Ink on Amber */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#1A202C] font-semibold leading-tight line-clamp-2">
              {description ||
                (isSw
                  ? 'Kumbukumbu zinahifadhiwa kwenye simu yako na zitalandanishwa mtandao ukirejea.'
                  : 'Changes are saved locally on your phone and will sync once connected.')}
            </p>
          </div>
        </div>

        {/* Right: Manual Retry Button (Strict 48x48px Touch Target) + Dismiss */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="min-w-[48px] min-h-[48px] px-3 py-2 rounded-xl text-xs font-bold text-[#B45309] hover:bg-[#FDE68A]/60 active:bg-[#FDE68A] flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] cursor-pointer"
            aria-label={isSw ? 'Jaribu kuunganisha mtandao tena' : 'Retry connecting to the network'}
          >
            <RotateCw
              className={`w-3.5 h-3.5 text-[#B45309] ${isRetrying ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span className="hidden xs:inline sm:inline">
              {isRetrying
                ? isSw
                  ? 'Inajaribu...'
                  : 'Retrying...'
                : isSw
                ? 'Jaribu'
                : 'Retry'}
            </span>
          </button>

          {dismissible && (
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="min-w-[48px] min-h-[48px] p-2 text-[#78350F] hover:text-[#1A202C] hover:bg-[#FDE68A]/50 rounded-xl flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] cursor-pointer"
              aria-label={isSw ? 'Ondoa ilani hii' : 'Dismiss offline banner'}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </aside>
  ) : null;

  if (mode === 'wrapper') {
    return (
      <div className="w-full flex flex-col min-h-0 flex-1">
        {bannerElement}
        {children}
      </div>
    );
  }

  return bannerElement;
}

export default OfflineFallbackShell;
