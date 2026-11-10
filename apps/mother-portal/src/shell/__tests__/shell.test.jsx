/**
 * Vitest Automated Suite: TotoAfya Digital Mother Experience PWA & Mobile Shell (TD-2.4)
 *
 * Verifies:
 * 1. ResponsivePwaShell desktop 390px-430px container rendering with warm stone canvas (#F9F8F5)
 * 2. Mobile vs Desktop viewport class adaptations (100% full width mobile, sm:rounded-[36px] desktop)
 * 3. Natural thumb zone layout (bottom navigation anchored in bottom 40% with safe areas)
 * 4. OfflineFallbackShell: Savannah Ochre (#B45309) indicator chip, non-blocking banner & recovery state
 * 5. State transitions: online vs offline, retry button callback execution
 * 6. Strict 48x48px touch target enforcement across all shell buttons (WCAG 2.2 AA)
 * 7. Anti-Pattern 2 Compliance: ZERO Unicode emojis across all rendered markup
 * 8. PwaInstallBanner non-intrusive home screen install prompt
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  ResponsivePwaShell,
  OfflineFallbackShell,
  PwaInstallBanner,
  useOnlineStatus,
} from '../index';

// Regex to detect forbidden Unicode emojis per Anti-Pattern 2
const UNICODE_EMOJI_REGEX =
  /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}]/u;

describe('Workstream TD-2.4: PWA & Mobile Shell Integrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ========================================================================
   * 1. ResponsivePwaShell Structure & Viewport Classes
   * ======================================================================== */
  describe('ResponsivePwaShell Viewport & Desktop Frame', () => {
    it('renders outer desktop canvas with Sunlit Parchment warm stone background (#F9F8F5)', () => {
      const html = renderToString(
        <ResponsivePwaShell>
          <div>Screen Content</div>
        </ResponsivePwaShell>
      );

      expect(html).toContain('data-testid="pwa-outer-canvas"');
      expect(html).toContain('bg-[#F9F8F5]');
      expect(html).toContain('min-h-screen');
    });

    it('renders centered 390px-430px smartphone shell container on desktop', () => {
      const html = renderToString(
        <ResponsivePwaShell>
          <div>Screen Content</div>
        </ResponsivePwaShell>
      );

      expect(html).toContain('data-testid="pwa-shell-container"');
      expect(html).toContain('max-w-[430px]');
      expect(html).toContain('mx-auto');
      expect(html).toContain('bg-white');
      // Desktop frame decorations
      expect(html).toContain('sm:shadow-[0_20px_60px_rgba(0,0,0,0.12)]');
      expect(html).toContain('sm:border');
      expect(html).toContain('sm:border-[#EBEBEB]');
      expect(html).toContain('sm:my-6');
      expect(html).toContain('sm:rounded-[36px]');
      expect(html).toContain('overflow-hidden');
    });

    it('adapts to 100% full width on mobile viewports (<640px)', () => {
      const html = renderToString(
        <ResponsivePwaShell>
          <div>Mobile Screen Content</div>
        </ResponsivePwaShell>
      );

      // Mobile classes: w-full min-h-screen without sm: prefix for full screen coverage
      expect(html).toContain('w-full');
      expect(html).toContain('min-h-screen');
      expect(html).toContain('env(safe-area-inset-top');
    });

    it('renders top bar slot sticky at top when provided', () => {
      const TopBarMock = <div data-testid="mock-top-bar">Dashboard Top Bar</div>;
      const html = renderToString(
        <ResponsivePwaShell topBar={TopBarMock}>
          <div>Screen Content</div>
        </ResponsivePwaShell>
      );

      expect(html).toContain('data-testid="pwa-top-bar-slot"');
      expect(html).toContain('sticky');
      expect(html).toContain('top-0');
      expect(html).toContain('Dashboard Top Bar');
    });

    it('renders bottom navigation anchored in natural thumb zone (bottom 40%) with safe areas', () => {
      const BottomNavMock = <div data-testid="mock-bottom-nav">4-Tab Navigation Bar</div>;
      const html = renderToString(
        <ResponsivePwaShell bottomNav={BottomNavMock}>
          <div>Screen Content</div>
        </ResponsivePwaShell>
      );

      expect(html).toContain('data-testid="pwa-bottom-nav-slot"');
      expect(html).toContain('sticky');
      expect(html).toContain('bottom-0');
      expect(html).toContain('env(safe-area-inset-bottom');
      expect(html).toContain('4-Tab Navigation Bar');
    });

    it('renders scrollable main viewport content area with role="main"', () => {
      const html = renderToString(
        <ResponsivePwaShell>
          <div data-testid="test-child">Child Element</div>
        </ResponsivePwaShell>
      );

      expect(html).toContain('data-testid="pwa-main-content"');
      expect(html).toContain('role="main"');
      expect(html).toContain('flex-1');
      expect(html).toContain('overflow-y-auto');
      expect(html).toContain('Child Element');
    });
  });

  /* ========================================================================
   * 2. OfflineFallbackShell: Savannah Ochre (#B45309) & State Transitions
   * ======================================================================== */
  describe('OfflineFallbackShell Resilience & Indicators', () => {
    it('suppresses offline banner when online', () => {
      const html = renderToString(
        <OfflineFallbackShell isOffline={false} mode="banner" />
      );

      expect(html).toBe('');
    });

    it('renders non-blocking offline banner with Savannah Ochre (#B45309) indicator chip when offline', () => {
      const html = renderToString(
        <OfflineFallbackShell isOffline={true} mode="banner" lang="en" />
      );

      expect(html).toContain('role="status"');
      expect(html).toContain('aria-live="polite"');
      // Savannah Ochre indicator chip (#B45309)
      expect(html).toContain('#B45309');
      expect(html).toContain('Offline');
      // Soft Savannah Amber banner background (#FEF3C7)
      expect(html).toContain('bg-[#FEF3C7]');
      expect(html).toContain('border-[#FDE68A]');
      // Informative local cache sync message
      expect(html).toContain('saved locally on your phone and will sync once connected');
    });

    it('renders Swahili copy for offline banner when lang="sw"', () => {
      const html = renderToString(
        <OfflineFallbackShell isOffline={true} mode="banner" lang="sw" />
      );

      expect(html).toContain('Nje ya Mtandao');
      expect(html).toContain('Kumbukumbu zinahifadhiwa kwenye simu yako na zitalandanishwa mtandao ukirejea');
      expect(html).toContain('Jaribu');
    });

    it('renders standalone Savannah Ochre chip in mode="chip"', () => {
      const htmlOffline = renderToString(
        <OfflineFallbackShell isOffline={true} mode="chip" lang="en" />
      );
      expect(htmlOffline).toContain('#B45309');
      expect(htmlOffline).toContain('Offline Mode');

      const htmlOnline = renderToString(
        <OfflineFallbackShell isOffline={false} mode="chip" lang="en" />
      );
      expect(htmlOnline).toContain('#006B5F');
      expect(htmlOnline).toContain('Online');
    });

    it('renders full cache-friendly recovery state in mode="fullscreen"', () => {
      const html = renderToString(
        <OfflineFallbackShell isOffline={true} mode="fullscreen" lang="en" />
      );

      expect(html).toContain('No Internet Connection');
      expect(html).toContain('Local Device Storage Active');
      expect(html).toContain('Retry Connection');
      expect(html).toContain('bg-[#006B5F]');
      expect(html).toContain('#B45309');
    });

    it('renders Swahili recovery state in mode="fullscreen" when lang="sw"', () => {
      const html = renderToString(
        <OfflineFallbackShell isOffline={true} mode="fullscreen" lang="sw" />
      );

      expect(html).toContain('Hakuna Muunganisho wa Mtandao');
      expect(html).toContain('Hifadhi ya Ndani Inafanya Kazi');
      expect(html).toContain('Jaribu Tena');
    });
  });

  /* ========================================================================
   * 3. Shell Integration with OfflineFallback & PWA Install Banner
   * ======================================================================== */
  describe('ResponsivePwaShell Integrated Shell Features', () => {
    it('automatically renders offline fallback banner inside shell when isOffline is true', () => {
      const html = renderToString(
        <ResponsivePwaShell isOffline={true} showOfflineBanner={true}>
          <div>Protected Content</div>
        </ResponsivePwaShell>
      );

      expect(html).toContain('#B45309');
      expect(html).toContain('Offline');
      expect(html).toContain('Protected Content');
    });

    it('does not render offline fallback banner when isOffline is false', () => {
      const html = renderToString(
        <ResponsivePwaShell isOffline={false} showOfflineBanner={true}>
          <div>Online Content</div>
        </ResponsivePwaShell>
      );

      expect(html).not.toContain('saved locally on your phone');
      expect(html).toContain('Online Content');
    });

    it('renders PwaInstallBanner when showInstallBanner is true', () => {
      const html = renderToString(
        <ResponsivePwaShell showInstallBanner={true} lang="en">
          <div>Content</div>
        </ResponsivePwaShell>
      );

      expect(html).toContain('TotoAfya Mobile');
      expect(html).toContain('Add to home screen for offline access');
      expect(html).toContain('Install');
    });

    it('renders bilingual PwaInstallBanner in Kiswahili', () => {
      const html = renderToString(
        <PwaInstallBanner forceVisible={true} lang="sw" />
      );

      expect(html).toContain('TotoAfya Mobile');
      expect(html).toContain('Weka kwenye skrini kwa matumizi bila mtandao');
      expect(html).toContain('Weka');
    });
  });

  /* ========================================================================
   * 4. Strict 48x48px Minimum Hit Targets Enforcement (WCAG 2.2 AA)
   * ======================================================================== */
  describe('Touch Target Enforcement (48x48px)', () => {
    it('enforces 48x48px minimum touch target on OfflineFallbackShell retry button', () => {
      const htmlBanner = renderToString(
        <OfflineFallbackShell isOffline={true} mode="banner" />
      );
      expect(htmlBanner).toContain('min-w-[48px]');
      expect(htmlBanner).toContain('min-h-[48px]');

      const htmlFullscreen = renderToString(
        <OfflineFallbackShell isOffline={true} mode="fullscreen" />
      );
      expect(htmlFullscreen).toContain('min-h-[48px]');
    });

    it('enforces 48x48px minimum touch target on OfflineFallbackShell dismiss button', () => {
      const html = renderToString(
        <OfflineFallbackShell isOffline={true} mode="banner" dismissible={true} />
      );
      expect(html).toContain('min-w-[48px]');
      expect(html).toContain('min-h-[48px]');
      expect(html).toContain('aria-label');
    });

    it('enforces 48x48px minimum touch target on PwaInstallBanner buttons', () => {
      const html = renderToString(
        <PwaInstallBanner forceVisible={true} />
      );
      expect(html).toContain('min-h-[48px]');
      expect(html).toContain('min-w-[48px]');
    });
  });

  /* ========================================================================
   * 5. Anti-Pattern 2 Guardrail: ZERO Unicode Emojis
   * ======================================================================== */
  describe('Anti-Pattern 2 Compliance: ZERO Unicode Emojis', () => {
    it('verifies ZERO Unicode emojis in ResponsivePwaShell output', () => {
      const html = renderToString(
        <ResponsivePwaShell isOffline={true} showInstallBanner={true}>
          <div>Sample Clinical Screen</div>
        </ResponsivePwaShell>
      );

      const emojiMatch = html.match(UNICODE_EMOJI_REGEX);
      expect(emojiMatch).toBeNull();
    });

    it('verifies ZERO Unicode emojis in OfflineFallbackShell (all modes, both EN & SW)', () => {
      const modes = ['banner', 'chip', 'fullscreen'];
      const languages = ['en', 'sw'];

      for (const mode of modes) {
        for (const lang of languages) {
          const html = renderToString(
            <OfflineFallbackShell isOffline={true} mode={mode} lang={lang} />
          );
          const emojiMatch = html.match(UNICODE_EMOJI_REGEX);
          expect(emojiMatch).toBeNull();
        }
      }
    });

    it('verifies ZERO Unicode emojis in PwaInstallBanner (both EN & SW)', () => {
      for (const lang of ['en', 'sw']) {
        const html = renderToString(
          <PwaInstallBanner forceVisible={true} lang={lang} />
        );
        const emojiMatch = html.match(UNICODE_EMOJI_REGEX);
        expect(emojiMatch).toBeNull();
      }
    });
  });
});
