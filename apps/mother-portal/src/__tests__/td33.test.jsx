/**
 * Vitest Automated Test Suite: TD-3.3 AI Assistant, Sensitive Exceptions & 6-State Lifecycle
 *
 * Verifies:
 * 1. Server-side fail-closed regex danger sniffer (12 obstetric & neonatal categories)
 * 2. KDPA 2019 PII tokenization and redaction (tok_m_...)
 * 3. @totoafya/shared-ui 6-state lifecycle components (Skeleton, EmptyState presets, ErrorRecovery)
 * 4. AIHealthAssistant (SCR-18): 36px safety banner, quick prompt carousel, fail-closed triage
 * 5. Learn (SCR-19) & ArticleDetail (SCR-20): Zero emojis, Lucide SVG icons, Merriweather editorial
 * 6. Settings (SCR-23): Flag emojis purged, 4-digit PIN row, Sync Vault link, Bereavement row
 * 7. SCR24SyncVault (SCR-24): Storage gauge, mutation outbox queue, manual sync trigger
 * 8. SCR28Bereavement (SCR-28): Condolence copy, 1190 & Befrienders hotlines, engorgement/lochia guidance
 * 9. Anti-Pattern 2 Compliance: ZERO Unicode emojis across all surfaces
 */

import './test-setup.js';

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

// Edge Function logic
import {
  EMERGENCY_REGEX_PATTERNS,
  snifferDangerSigns,
  redactPII,
} from '../../../../supabase/functions/care-coordinator/sniffer.ts';

// Shared UI components
import {
  Skeleton,
  CardSkeleton,
  HeroSkeleton,
  TimelineSkeleton,
  ArticleCardSkeleton,
  MilestoneHeroSkeleton,
  EmptyState,
  ErrorRecovery,
  PillButton,
} from '@totoafya/shared-ui';

// Mother Portal components
import AIHealthAssistant from '../pages/AIHealthAssistant';
import Learn from '../pages/Learn';
import Settings from '../pages/Settings';
import ArticleDetail from '../routes/learning/ArticleDetail';
import SCR24SyncVault from '../routes/settings/SCR24SyncVault';
import SCR28Bereavement from '../routes/sensitive/SCR28Bereavement';
import { LanguageProvider } from '../context/LanguageContext';
import { ProfileProvider } from '../context/ProfileContext';

// Strict regex to detect Unicode emojis prohibited by Anti-Pattern 2
const UNICODE_EMOJI_REGEX =
  /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}]/u;

// Helper to render components with required contexts
function renderWithContext(ui, { lang = 'sw', route = '/' } = {}) {
  if (typeof global.localStorage !== 'undefined') {
    global.localStorage.getItem = (key) => (key === 'toto_lang' ? lang : null);
  }
  return renderToString(
    <MemoryRouter initialEntries={[route]}>
      <LanguageProvider>
        <ProfileProvider>
          {ui}
        </ProfileProvider>
      </LanguageProvider>
    </MemoryRouter>
  );
}

describe('TD-3.3 AI Assistant, Sensitive Exceptions & 6-State Lifecycle', () => {
  /* ========================================================================
   * 1. Edge Function Server-Side Danger Sniffer & KDPA 2019 PII Redaction
   * ======================================================================== */
  describe('Edge Function Danger Sniffer & KDPA PII Redaction', () => {
    it('contains all 12 obstetric & neonatal danger sign categories', () => {
      expect(EMERGENCY_REGEX_PATTERNS).toHaveLength(12);
      const labels = EMERGENCY_REGEX_PATTERNS.map((p) => p.label);
      expect(labels).toContain('Vaginal Bleeding (Kutokwa na Damu)');
      expect(labels).toContain('Convulsions / Fits (Kifafa cha Mimba)');
      expect(labels).toContain('Severe Headache (Kuumwa na Kichwa Sana)');
      expect(labels).toContain('Blurred Vision (Kutoona Vizuri)');
      expect(labels).toContain('Reduced/Absent Fetal Movement (Mtoto Haisikiki)');
      expect(labels).toContain('Loss of Consciousness (Kupoteza Fahamu)');
      expect(labels).toContain('Severe Chest Pain (Maumivu Makali ya Kifua)');
      expect(labels).toContain('High Fever / Chills (Homa Kali)');
      expect(labels).toContain('Severe Abdominal Pain (Maumivu Makali ya Tumbo)');
      expect(labels).toContain('Leaking Fluid / Water Broke (Maji Kuvunjika)');
      expect(labels).toContain('Facial/Hand Swelling (Kuvimba Uso na Mikono)');
      expect(labels).toContain('Difficulty Breathing (Kupumua kwa Shida)');
    });

    it('intercepts all 12 danger sign categories and flags isEmergency=true', () => {
      const testCases = [
        { text: 'Ninavuja damu ukeni tangu asubuhi', expected: 'Vaginal Bleeding (Kutokwa na Damu)' },
        { text: 'Mama amekuwa na degedege na kifafa', expected: 'Convulsions / Fits (Kifafa cha Mimba)' },
        { text: 'Kichwa changu kinauma sana na siwezi kuvumilia', expected: 'Severe Headache (Kuumwa na Kichwa Sana)' },
        { text: 'Macho yangu hayaoni vizuri, kuna ukungu', expected: 'Blurred Vision (Kutoona Vizuri)' },
        { text: 'Mtoto haisikiki akicheza tangu jana', expected: 'Reduced/Absent Fetal Movement (Mtoto Haisikiki)' },
        { text: 'Mgonjwa amezirai na kupoteza fahamu', expected: 'Loss of Consciousness (Kupoteza Fahamu)' },
        { text: 'Nina maumivu makali ya kifua', expected: 'Severe Chest Pain (Maumivu Makali ya Kifua)' },
        { text: 'Nina homa kali na kutetemeka mwili', expected: 'High Fever / Chills (Homa Kali)' },
        { text: 'Tumbo linauma sana kwa maumivu makali', expected: 'Severe Abdominal Pain (Maumivu Makali ya Tumbo)' },
        { text: 'Maji yamemwagika na kuvunjika mapema', expected: 'Leaking Fluid / Water Broke (Maji Kuvunjika)' },
        { text: 'Uso wangu na mikono vimevimba sana', expected: 'Facial/Hand Swelling (Kuvimba Uso na Mikono)' },
        { text: 'Ninashindwa kupumua vizuri kwa shida', expected: 'Difficulty Breathing (Kupumua kwa Shida)' },
      ];

      for (const { text, expected } of testCases) {
        const result = snifferDangerSigns(text);
        expect(result.isEmergency).toBe(true);
        expect(result.redFlags).toContain(expected);
      }
    });

    it('does not flag routine questions as emergencies', () => {
      const routineResult = snifferDangerSigns(
        'Je ni vyakula gani bora kwa mtoto wa miezi 6?'
      );
      expect(routineResult.isEmergency).toBe(false);
      expect(routineResult.redFlags).toHaveLength(0);
    });

    it('redacts KDPA 2019 PII into ephemeral tokens (tok_m_...)', () => {
      const rawPrompt = 'Naitwa Faith Wanjiku, nambari yangu ni 0712345678 na kitambulisho 28910452.';
      const rawContext = {
        full_name: 'Faith Wanjiku',
        phone: '+254712345678',
        national_id: '28910452',
        county: 'Kiambu',
      };

      const { sanitizedPrompt, sanitizedContext } = redactPII(rawPrompt, rawContext);

      expect(sanitizedPrompt).not.toContain('0712345678');
      expect(sanitizedPrompt).toContain('tok_m_phone_9832');
      expect(sanitizedPrompt).toContain('tok_m_id_7411');

      expect(sanitizedContext.full_name).toBe('tok_m_name_3108');
      expect(sanitizedContext.phone).toBe('tok_m_phone_9832');
      expect(sanitizedContext.national_id).toBe('tok_m_id_7411');
      expect(sanitizedContext.county).toBe('Kiambu'); // Clinical non-PII preserved
    });
  });

  /* ========================================================================
   * 2. Shared-UI 6-State Lifecycle Components (SCR-25, SCR-26, SCR-27)
   * ======================================================================== */
  describe('@totoafya/shared-ui 6-State Lifecycle Components', () => {
    it('renders Skeleton primitive with warm stone pulse (SCR-25)', () => {
      const html = renderToString(<Skeleton className="w-20 h-4" />);
      expect(html).toContain('bg-[#F1EFEA]');
      expect(html).toContain('animate-pulse');
    });

    it('renders Skeleton composites (Card, Hero, Timeline, Article, Milestone)', () => {
      const cardHtml = renderToString(<CardSkeleton />);
      expect(cardHtml).toContain('animate-pulse');

      const heroHtml = renderToString(<HeroSkeleton />);
      expect(heroHtml).toContain('animate-pulse');

      const timelineHtml = renderToString(<TimelineSkeleton items={3} />);
      expect(timelineHtml).toContain('animate-pulse');

      const articleHtml = renderToString(<ArticleCardSkeleton />);
      expect(articleHtml).toContain('animate-pulse');

      const milestoneHtml = renderToString(<MilestoneHeroSkeleton />);
      expect(milestoneHtml).toContain('animate-pulse');
    });

    it('renders EmptyState with all 6 presets (SCR-26)', () => {
      const presets = ['pregnancy', 'child', 'vaccines', 'growth', 'articles', 'outbox'];

      for (const preset of presets) {
        const html = renderToString(
          <EmptyState preset={preset} lang="sw" onAction={() => {}} />
        );
        expect(html).toContain('rounded-[28px]');
        expect(html).toContain('min-h-[48px]'); // 48x48 hit target on PillButton
        expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false); // Zero emojis
      }
    });

    it('renders EmptyState English copy correctly', () => {
      const html = renderToString(
        <EmptyState preset="vaccines" lang="en" onAction={() => {}} />
      );
      expect(html).toContain('No Vaccines Recorded Yet');
      expect(html).toContain('View KEPI Schedule');
    });

    it('renders ErrorRecovery with safety reassurance and retry action (SCR-27)', () => {
      const html = renderToString(
        <ErrorRecovery
          lang="sw"
          onRetry={() => {}}
          onBack={() => {}}
        />
      );

      expect(html).toContain('Hitilafu Kidogo Imetokea');
      expect(html).toContain('Rekodi zako za afya kwenye simu ziko salama na hazijapotea.');
      expect(html).toContain('Jaribu Tena');
      expect(html).toContain('min-h-[48px]');
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });

    it('renders ErrorRecovery English copy correctly', () => {
      const html = renderToString(
        <ErrorRecovery
          lang="en"
          onRetry={() => {}}
        />
      );

      expect(html).toContain('Something Temporarily Went Wrong');
      expect(html).toContain('Your local health records on this device are safe and secure.');
      expect(html).toContain('Try Again');
    });
  });

  /* ========================================================================
   * 3. AI Health Assistant (SCR-18)
   * ======================================================================== */
  describe('Screen SCR-18: AI Health Assistant (AIHealthAssistant)', () => {
    it('renders 36px top clinical safety banner', () => {
      const html = renderWithContext(<AIHealthAssistant />);
      expect(html).toContain('h-9 min-h-[36px] bg-[#E6F4F1]');
      expect(html).toContain('TotoAfya AI inatoa mwongozo wa kielimu. Ikiwa una dharura, nenda hospitalini mara moja.');
    });

    it('renders horizontal quick-prompt carousel in #FFFFFF rounded-full pills', () => {
      const html = renderWithContext(<AIHealthAssistant />);
      expect(html).toContain('Vyakula vinavyoongeza damu');
      expect(html).toContain('Dalili za leba halisi');
      expect(html).toContain('Jinsi ya kuhesabu mateke');
      expect(html).toContain('rounded-full bg-[#FFFFFF]');
      expect(html).toContain('min-h-[48px]');
    });

    it('renders 48x48px hit targets for back and send buttons', () => {
      const html = renderWithContext(<AIHealthAssistant />);
      expect(html).toContain('min-w-[48px] min-h-[48px]');
      expect(html).toContain('SOS 1190');
    });

    it('violates zero Unicode emoji rules in AI assistant', () => {
      const html = renderWithContext(<AIHealthAssistant />);
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });
  });

  /* ========================================================================
   * 4. Learn (SCR-19) & ArticleDetail (SCR-20)
   * ======================================================================== */
  describe('Screen SCR-19 & SCR-20: Learning Hub & Article Detail', () => {
    it('purges all 8 Unicode emojis from Learn.jsx and CATEGORY_CONFIG', () => {
      const html = renderWithContext(<Learn />);
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });

    it('renders ArticleDetail with Merriweather editorial typography (SCR-20)', () => {
      const html = renderWithContext(<ArticleDetail />);
      expect(html).toContain('Lishe Bora ya Mama Mjamzito: Mwongozo wa Vyakula Halisi vya Kenya');
      expect(html).toContain('Dakika 5 za kusoma');
      expect(html).toContain('Imethibitishwa na Muuguzi Mkunga');
      expect(html).toContain('Managu');
      expect(html).toContain('Omena');
      expect(html).toContain('IFAS');
      expect(html).toContain('Hifadhi kwenye Mpango wa Malezi');
      expect(html).toContain('min-h-[48px]');
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);

      // Verify English rendering
      const enHtml = renderWithContext(<ArticleDetail />, { lang: 'en' });
      expect(enHtml).toContain('Optimal Maternal Nutrition');
      expect(enHtml).toContain('Save to Care Plan');
    });
  });

  /* ========================================================================
   * 5. Settings & Privacy (SCR-23)
   * ======================================================================== */
  describe('Screen SCR-23: Settings & Privacy (Settings)', () => {
    it('purges flag emojis and renders clean EN and SW badges', () => {
      const html = renderWithContext(<Settings />);
      expect(html).not.toContain('🇬🇧');
      expect(html).not.toContain('🇰🇪');
      expect(html).toContain('>EN<');
      expect(html).toContain('>SW<');
    });

    it('renders 4-digit PIN management, Offline Sync Vault, and Bereavement mode rows', () => {
      const html = renderWithContext(<Settings />);
      expect(html).toContain('Badilisha PIN ya Tarakimu 4');
      expect(html).toContain('Hifadhi ya Nje ya Mtandao (Sync Vault)');
      expect(html).toContain('Hali ya Maombolezo (Bereavement)');
      expect(html).toContain('min-h-[52px]');
    });

    it('violates zero Unicode emoji rules in Settings', () => {
      const html = renderWithContext(<Settings />);
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });
  });

  /* ========================================================================
   * 6. Offline Sync Vault (SCR-24)
   * ======================================================================== */
  describe('Screen SCR-24: Offline Sync Vault (SCR24SyncVault)', () => {
    it('renders storage capacity gauge and outbox mutation queue', () => {
      const html = renderWithContext(<SCR24SyncVault />);
      expect(html).toContain('Hifadhi ya Nje ya Mtandao');
      expect(html).toContain('Data Yako Iko Salama Kwenye Simu');
      expect(html).toContain('Uwezo wa Hifadhi ya Kifaa');
      expect(html).toContain('Foleni ya Usawazishaji (Outbox)');
      expect(html).toContain('Sawazisha Rekodi Zote Sasa');
      expect(html).toContain('min-h-[48px]');

      // Verify English rendering
      const enHtml = renderWithContext(<SCR24SyncVault />, { lang: 'en' });
      expect(enHtml).toContain('Offline Sync Vault');
      expect(enHtml).toContain('Device Storage Capacity');
      expect(enHtml).toContain('Sync All Records Now');
    });

    it('violates zero Unicode emoji rules in Sync Vault', () => {
      const html = renderWithContext(<SCR24SyncVault />);
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });
  });

  /* ========================================================================
   * 7. Bereavement Mode (SCR-28)
   * ======================================================================== */
  describe('Screen SCR-28: Bereavement Mode (SCR28Bereavement)', () => {
    it('renders compassionate Swahili condolence copy', () => {
      const html = renderWithContext(<SCR28Bereavement />);
      expect(html).toContain('Tunakupa Pole Sana Mama');
      expect(html).toContain('Kumpoteza mtoto au ujauzito ni safari nzito');
      expect(html).toContain('Washa Hali ya Utulivu (Bereavement Mode)');
    });

    it('renders 1-tap dialers for Befrienders Kenya and Emergency helpline 1190', () => {
      const html = renderWithContext(<SCR28Bereavement />);
      expect(html).toContain('tel:0722178177');
      expect(html).toContain('Befrienders Kenya');
      expect(html).toContain('0722 178 177');
      expect(html).toContain('tel:1190');
      expect(html).toContain('1190');
    });

    it('renders postnatal physical healing guidance (engorgement & lochia)', () => {
      const html = renderWithContext(<SCR28Bereavement />);
      expect(html).toContain('Kutuliza Maziwa ya Matiti (Milk Engorgement)');
      expect(html).toContain('Uangalizi wa Damu ya Uzazi (Lochia)');
      expect(html).toContain('Kuhifadhi Kumbukumbu kwa Heshima');
      expect(html).toContain('min-h-[48px]');
    });

    it('violates zero Unicode emoji rules in Bereavement Mode', () => {
      const html = renderWithContext(<SCR28Bereavement />);
      expect(UNICODE_EMOJI_REGEX.test(html)).toBe(false);
    });
  });
});
