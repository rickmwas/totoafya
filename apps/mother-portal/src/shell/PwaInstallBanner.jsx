import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

/**
 * PwaInstallBanner Component
 *
 * Provides a non-intrusive, accessible "Add to Home Screen" installation
 * banner for the Mother Experience Progressive Web App per NAVIGATION_PROPOSAL.md.
 *
 * Features:
 * - 48x48px hit target buttons
 * - Zero Unicode emojis (clean Lucide SVG vector icons)
 * - Bilingual English / Kiswahili support
 * - Session-based dismiss persistence
 */
export function PwaInstallBanner({
  lang = 'en',
  onDismiss = null,
  forceVisible = false,
  className = '',
}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (forceVisible) return true;
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('toto_pwa_banner_dismissed') !== 'true';
  });

  const isSw = lang === 'sw';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (sessionStorage.getItem('toto_pwa_banner_dismissed') !== 'true') {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for browsers without direct prompt (e.g. iOS Safari instructions or bookmark guidance)
      alert(
        isSw
          ? 'Kuweka TotoAfya kwenye skrini yako: Bonyeza alama ya Shiriki (Share) kisha uchague "Weka kwenye Skrini ya Mwanzo" (Add to Home Screen).'
          : 'To add TotoAfya to your screen: Tap the Share button in your browser, then choose "Add to Home Screen".'
      );
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('toto_pwa_banner_dismissed', 'true');
    }
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  };

  if (!isVisible && !forceVisible) {
    return null;
  }

  return (
    <aside
      role="banner"
      aria-label={isSw ? 'Weka TotoAfya kwenye skrini' : 'Install TotoAfya app banner'}
      className={`w-full bg-[#004D44] text-white px-3.5 py-2 transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-3 max-w-[430px] mx-auto">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-[#006B5F] flex items-center justify-center shrink-0 border border-teal-600/40">
            <Smartphone className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold leading-tight truncate text-white">
              TotoAfya Mobile
            </p>
            <p className="text-[11px] text-teal-100/90 leading-tight truncate">
              {isSw
                ? 'Weka kwenye skrini kwa matumizi bila mtandao'
                : 'Add to home screen for offline access'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="min-h-[48px] min-w-[48px] px-3.5 py-2 bg-[#FEF3C7] hover:bg-[#FDE68A] active:bg-[#FCD34D] text-[#1A202C] text-xs font-bold rounded-full border border-[#FDE68A] flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE68A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#004D44] cursor-pointer shadow-sm"
            aria-label={isSw ? 'Weka programu kwenye simu yako' : 'Install TotoAfya app'}
          >
            <Download className="w-3.5 h-3.5 text-[#1A202C]" aria-hidden="true" />
            <span>{isSw ? 'Weka' : 'Install'}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="min-h-[48px] min-w-[48px] p-2 text-teal-200 hover:text-white hover:bg-teal-800/50 rounded-full flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
            aria-label={isSw ? 'Funga ilani ya usakinishaji' : 'Dismiss installation banner'}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default PwaInstallBanner;
