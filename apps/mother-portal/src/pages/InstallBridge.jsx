// ── TotoAfya — Install Bridge ────────────────────────────────────
// Invisible page embedded as a hidden iframe on the marketing website.
// Detects `beforeinstallprompt` (Chrome/Android only) and reports
// install state to the parent frame via postMessage.
// Falls back gracefully: if the event never fires within 2 s, it
// reports "installed_or_unsupported" so the marketing site shows
// "Open App" instead of "Install App".
import { useEffect } from 'react';

// Only accept/send messages to this origin
const MARKETING_ORIGIN = 'https://totoafyadigital.terraseptsolutions.com';

export default function InstallBridge() {
  useEffect(() => {
    let deferredPrompt = null;

    // ── Capture the install prompt ────────────────────────────────
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Stop the browser from showing its own prompt
      deferredPrompt = e;
      // Tell the parent: the PWA is installable right now
      window.parent.postMessage(
        { totoInstallState: 'installable' },
        MARKETING_ORIGIN
      );
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

    // ── Fallback timer ────────────────────────────────────────────
    // If `beforeinstallprompt` doesn't fire within 2 s, the PWA is
    // already installed OR the browser doesn't support it (e.g. iOS).
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt) {
        window.parent.postMessage(
          { totoInstallState: 'installed_or_unsupported' },
          MARKETING_ORIGIN
        );
      }
    }, 2000);

    // ── Listen for install trigger from parent ────────────────────
    const onMessage = (e) => {
      if (e.origin !== MARKETING_ORIGIN) return;
      if (e.data === 'triggerInstall' && deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choice) => {
          // Report outcome back to parent
          window.parent.postMessage(
            {
              totoInstallState:
                choice.outcome === 'accepted'
                  ? 'installed_or_unsupported'
                  : 'installable',
            },
            MARKETING_ORIGIN
          );
          deferredPrompt = null;
        });
      }
    };

    window.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('message', onMessage);
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Render nothing — this page is purely a messaging bridge
  return null;
}
