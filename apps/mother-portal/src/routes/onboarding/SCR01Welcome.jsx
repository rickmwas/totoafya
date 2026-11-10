import React from 'react';
import { PillButton } from '@totoafya/shared-ui';
import { BrandEmblem, BotanicalFetalHeroIllustration } from './icons';

/**
 * SCR-01: Welcome & Language Selection Screen
 *
 * Implements:
 * - Bilingual language selector toggle: English | Kiswahili with instant UI adaptation
 * - Sunlit Botanical Editorial styling (#006B5F, #E68A00, #F9F8F5)
 * - Minimum 48x48px hit targets for interactive elements
 * - Zero Unicode emojis (anti-pattern guardrail)
 */

export function SCR01Welcome({
  lang = 'en',
  onLanguageChange,
  onGetStarted,
  onLogin,
}) {
  const isSw = lang === 'sw';

  const handleLangToggle = (selectedLang) => {
    if (onLanguageChange && selectedLang !== lang) {
      onLanguageChange(selectedLang);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between px-6 py-8"
      style={{ backgroundColor: '#F9F8F5', color: '#1A202C' }}
      data-testid="scr01-welcome"
    >
      {/* Top Header: Safe Area & Brand Emblem */}
      <div className="flex flex-col items-center text-center pt-2">
        {/* Brand Emblem */}
        <BrandEmblem size={52} className="mb-3" />

        {/* Brand Name & Subtitle */}
        <h1
          className="text-2xl font-bold tracking-tight text-[#004D44] mb-1"
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}
        >
          TotoAfya
        </h1>
        <p className="text-xs font-medium tracking-wide text-[#4A5568] uppercase">
          {isSw
            ? 'Safari Yako Kuanzia Ujauzito Hadi Makuzi'
            : 'Your Journey from Bump to Baby'}
        </p>

        {/* Bilingual Language Selector Pill */}
        <div className="mt-5 inline-flex items-center p-1 bg-white border border-[#E2E8F0] rounded-full shadow-sm">
          <button
            type="button"
            onClick={() => handleLangToggle('en')}
            className={`min-h-[48px] min-w-[105px] px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] ${
              !isSw
                ? 'bg-[#006B5F] text-white shadow-sm'
                : 'text-[#4A5568] hover:text-[#1A202C]'
            }`}
            aria-pressed={!isSw}
            aria-label="Switch language to English"
          >
            English
          </button>
          <button
            type="button"
            onClick={() => handleLangToggle('sw')}
            className={`min-h-[48px] min-w-[105px] px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] ${
              isSw
                ? 'bg-[#006B5F] text-white shadow-sm'
                : 'text-[#4A5568] hover:text-[#1A202C]'
            }`}
            aria-pressed={isSw}
            aria-label="Badili lugha kuwa Kiswahili"
          >
            Kiswahili
          </button>
        </div>
      </div>

      {/* Hero Botanical Artwork */}
      <div className="flex flex-col items-center justify-center my-4">
        <BotanicalFetalHeroIllustration className="transform hover:scale-105 transition-transform duration-300" />
      </div>

      {/* Value Proposition Section */}
      <div className="flex flex-col items-center text-center px-2">
        <h2
          className="text-xl font-bold text-[#1A202C] leading-snug mb-2"
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}
        >
          {isSw
            ? 'Rafiki yako wa kuaminika kuanzia ujauzito hadi makuzi ya mtoto'
            : 'Your trusted health companion from bump to baby'}
        </h2>
        <p className="text-sm text-[#4A5568] leading-relaxed max-w-[340px]">
          {isSw
            ? 'Huduma binafsi za uzazi, ratiba za chanjo za KEPI nchini Kenya, na mwongozo wa kuaminika hata bila mtandao.'
            : 'Personalized maternal care, Kenya vaccine schedules, and trusted offline guidance.'}
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col items-center gap-3 pt-6 w-full max-w-sm mx-auto">
        <PillButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={onGetStarted}
          className="w-full h-[52px] text-base font-semibold"
          data-testid="welcome-get-started-btn"
        >
          {isSw ? 'Anza Safari Hapa' : 'Get Started'}
        </PillButton>

        <button
          type="button"
          onClick={onLogin}
          className="min-h-[48px] px-4 py-2 text-sm font-semibold text-[#006B5F] hover:text-[#004D44] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] rounded-lg transition-colors"
          data-testid="welcome-login-btn"
        >
          {isSw
            ? 'Umeshajiandikisha? Ingia'
            : 'Already have an account? Log In'}
        </button>
      </div>
    </div>
  );
}

export default SCR01Welcome;
