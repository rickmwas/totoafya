/**
 * TotoAfya Mother Experience — Core Molecular & Organism UI Component Test Suite
 * Workstream TD-2.1: Wave 2 Component Library Specialist
 *
 * Verifies:
 * 1. PregnancyMilestoneHero:
 *    - Elevated hero card (rounded-3xl, gradient #006B5F to #004D44, white text)
 *    - Gestational badge ("Week 28 • Trimester 3" / "Wiki 28 • Trimester 3")
 *    - Countdown pill ("84 Days Remaining" / "84 Siku Zimebaki")
 *    - Center botanical wreath SVG line art (zero emojis, zero 3D)
 *    - Size analogy (Biringanya / Eggplant) with length & weight metrics
 *    - Translucent advice footer with 48px CTA button
 *    - Dark-on-Amber compliance on countdown pill
 * 2. ChildMilestoneHero:
 *    - Elevated hero card (rounded-3xl, bg #FFFFFF, border #E2E8F0)
 *    - Monogram / avatar circle + child name + age badge
 *    - Growth snapshot (weight & MUAC in healthy green #15803D)
 *    - Savannah Ochre vaccine alert enforcing Dark-on-Amber (#1A202C on #FEF3C7)
 *    - Quick action row with 3 buttons meeting 48px hit targets
 *    - Bilingual English / Kiswahili support
 * 3. QuickActionCard:
 *    - 48px touch target guarantee (min-h-[56px], 48x48 icon)
 *    - Icon variants, title, description, badge, and trailing chevron
 *    - Accessible role="button" with keyboard support
 * 4. MilestoneCard:
 *    - Developmental timeline card with category, timing, and description
 *    - StatusBadge integration (achieved, in_progress, upcoming)
 *    - 48px interactive action button
 * 5. Anti-Pattern Guardrails:
 *    - ZERO Unicode emojis in rendered markup
 *    - ZERO white text on Amber surfaces
 *    - Strict minimum 48x48px hit areas
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Sparkles, Calendar, Heart, Scale, Syringe, BookOpen, Clock } from 'lucide-react';
import {
  PregnancyMilestoneHero,
  ChildMilestoneHero,
  QuickActionCard,
  MilestoneCard,
} from '../index';

describe('Wave 2 UI Organisms: PregnancyMilestoneHero', () => {
  it('renders elevated hero container with Deep Teal gradient and white text', () => {
    const html = renderToString(<PregnancyMilestoneHero />);
    expect(html).toContain('rounded-3xl');
    expect(html).toContain('from-[#006B5F]');
    expect(html).toContain('to-[#004D44]');
    expect(html).toContain('text-[#FFFFFF]');
  });

  it('renders gestational badge and countdown pill with default English copy', () => {
    const html = renderToString(<PregnancyMilestoneHero week={28} trimester={3} daysRemaining={84} />);
    expect(html).toContain('Week 28 • Trimester 3');
    expect(html).toContain('84 Days Remaining');
  });

  it('renders bilingual Kiswahili copy when lang="sw"', () => {
    const html = renderToString(
      <PregnancyMilestoneHero
        week={28}
        trimester={3}
        daysRemaining={84}
        lang="sw"
        sizeAnalogySw="Biringanya"
      />
    );
    expect(html).toContain('Wiki 28 • Trimester 3');
    expect(html).toContain('84 Siku Zimebaki');
    expect(html).toContain('Biringanya');
    expect(html).toContain('Soma Mwongozo Kamili wa Wiki →');
    expect(html).toContain('Urefu:');
    expect(html).toContain('Uzito:');
  });

  it('renders the botanical circular wreath SVG and fetal developmental stage line art', () => {
    const html = renderToString(<PregnancyMilestoneHero />);
    // SVG circular spine and botanical leaf geometry
    expect(html).toContain('<svg');
    expect(html).toContain('viewBox="0 0 160 160"');
    expect(html).toContain('rotate('); // Radiating leaves
  });

  it('renders size analogy with length and weight metrics in tabular format', () => {
    const html = renderToString(
      <PregnancyMilestoneHero
        sizeAnalogy="Eggplant (Garden Egg / Brinjal)"
        lengthCm={37.6}
        weightGrams={1000}
      />
    );
    expect(html).toContain('Eggplant (Garden Egg / Brinjal)');
    expect(html).toContain('~37.6 cm');
    expect(html).toContain('~1000 g');
    expect(html).toContain('tabular-nums');
  });

  it('renders weekly maternal advice snippet and CTA button with 48px hit area', () => {
    const html = renderToString(
      <PregnancyMilestoneHero
        adviceSnippet="Baby can now open their eyes and practice breathing."
      />
    );
    expect(html).toContain('Baby can now open their eyes and practice breathing.');
    expect(html).toContain('min-h-[48px]');
    expect(html).toContain('Read Full Week Guide →');
  });

  it('enforces Dark-on-Amber contrast rule on countdown pill (Charcoal #1A202C on #FEF3C7)', () => {
    const html = renderToString(<PregnancyMilestoneHero />);
    expect(html).toContain('bg-[#FEF3C7]');
    expect(html).toContain('text-[#1A202C]');
    // Never white text on amber
    expect(html).not.toMatch(/bg-\[#FEF3C7\][^>]*text-white/);
    expect(html).not.toMatch(/bg-\[#FEF3C7\][^>]*text-\[#FFFFFF\]/);
  });
});

describe('Wave 2 UI Organisms: ChildMilestoneHero', () => {
  it('renders elevated card with white background, border, and child header', () => {
    const html = renderToString(
      <ChildMilestoneHero name="Baby Joy" age="4 Months 2 Weeks" />
    );
    expect(html).toContain('rounded-3xl');
    expect(html).toContain('bg-[#FFFFFF]');
    expect(html).toContain('border-[#E2E8F0]');
    expect(html).toContain('Baby Joy');
    expect(html).toContain('4 Months 2 Weeks');
    // Monogram circle
    expect(html).toContain('B');
  });

  it('renders child avatar image when avatarUrl is provided', () => {
    const html = renderToString(
      <ChildMilestoneHero
        name="Baby Joy"
        avatarUrl="https://example.com/avatar.jpg"
      />
    );
    expect(html).toContain('src="https://example.com/avatar.jpg"');
    expect(html).toContain('alt="Baby Joy"');
  });

  it('renders growth snapshot with weight and MUAC healthy green indicator (#15803D)', () => {
    const html = renderToString(
      <ChildMilestoneHero
        weight="6.4 kg — Normal (50th percentile)"
        muac="13.2 cm — Healthy"
      />
    );
    expect(html).toContain('6.4 kg — Normal (50th percentile)');
    expect(html).toContain('13.2 cm — Healthy');
    expect(html).toContain('text-[#15803D]');
  });

  it('renders Savannah Ochre vaccine alert enforcing Dark-on-Amber rule', () => {
    const html = renderToString(
      <ChildMilestoneHero vaccineAlert="14-Week KEPI Vaccines Due in 12 Days" />
    );
    expect(html).toContain('14-Week KEPI Vaccines Due in 12 Days');
    expect(html).toContain('bg-[#FFFBEB]');
    expect(html).toContain('border-[#FDE68A]');
    expect(html).toContain('text-[#1A202C]');
    // Never white text on amber
    expect(html).not.toMatch(/bg-\[#FFFBEB\][^>]*text-white/);
    expect(html).not.toMatch(/bg-\[#FFFBEB\][^>]*text-\[#FFFFFF\]/);
  });

  it('renders quick action row with 3 accessible buttons with >= 48px hit targets', () => {
    const html = renderToString(<ChildMilestoneHero />);
    expect(html).toContain('Log Weight');
    expect(html).toContain('View Vaccine Card');
    expect(html).toContain('Feeding Guide');

    // Count min-h-[48px] occurrences in buttons
    const matches = html.match(/min-h-\[48px\]/g);
    expect(matches).not.toBeNull();
    // At least 4 interactive targets (3 quick action buttons + 1 vaccine alert chevron)
    expect(matches.length).toBeGreaterThanOrEqual(4);
  });

  it('renders bilingual Kiswahili copy when lang="sw"', () => {
    const html = renderToString(
      <ChildMilestoneHero
        name="Mtoto Joy"
        ageSw="Miezi 4 Wiki 2"
        weightSw="6.4 kg — Kawaida"
        muacSw="13.2 cm — Afya Bora"
        vaccineAlertSw="Chanjo ya Wiki 14 Inatarajiwa Siku 12"
        lang="sw"
      />
    );
    expect(html).toContain('Miezi 4 Wiki 2');
    expect(html).toContain('6.4 kg — Kawaida');
    expect(html).toContain('13.2 cm — Afya Bora');
    expect(html).toContain('Chanjo ya Wiki 14 Inatarajiwa Siku 12');
    expect(html).toContain('Rekodi Uzito');
    expect(html).toContain('Kadi ya Chanjo');
    expect(html).toContain('Mwongozo wa Lishe');
  });
});

describe('Wave 2 UI Molecules: QuickActionCard', () => {
  it('renders action card with icon, title, description, and chevron', () => {
    const html = renderToString(
      <QuickActionCard
        icon={Scale}
        title="Record Weight and Height"
        description="Track growth percentiles against WHO child standards."
      />
    );
    expect(html).toContain('Record Weight and Height');
    expect(html).toContain('Track growth percentiles against WHO child standards.');
    expect(html).toContain('min-h-[56px]');
    expect(html).toContain('role="button"');
    expect(html).toContain('tabindex="0"');
  });

  it('renders optional badge with appropriate semantic variant', () => {
    const html = renderToString(
      <QuickActionCard
        icon={Syringe}
        title="KEPI Immunization"
        badge="Due in 3 Days"
        badgeVariant="warning"
      />
    );
    expect(html).toContain('Due in 3 Days');
    expect(html).toContain('bg-[#FFFBEB]');
    expect(html).toContain('text-[#B45309]');
  });

  it('renders different icon container color variants', () => {
    const tealHtml = renderToString(<QuickActionCard icon={Scale} title="T" iconVariant="teal" />);
    const amberHtml = renderToString(<QuickActionCard icon={Scale} title="T" iconVariant="amber" />);
    const greenHtml = renderToString(<QuickActionCard icon={Scale} title="T" iconVariant="green" />);

    expect(tealHtml).toContain('bg-[#E6F4F1]');
    expect(tealHtml).toContain('text-[#006B5F]');
    expect(amberHtml).toContain('bg-[#FEF3C7]');
    expect(amberHtml).toContain('text-[#B45309]');
    expect(greenHtml).toContain('bg-[#F0FDF4]');
    expect(greenHtml).toContain('text-[#15803D]');
  });

  it('renders bilingual Kiswahili text when lang="sw"', () => {
    const html = renderToString(
      <QuickActionCard
        icon={BookOpen}
        title="Feeding Guide"
        titleSw="Mwongozo wa Lishe"
        description="Exclusive breastfeeding recommendations."
        descriptionSw="Ushauri wa unyonyeshaji wa maziwa ya mama pekee."
        badge="Recommended"
        badgeSw="Inapendekezwa"
        lang="sw"
      />
    );
    expect(html).toContain('Mwongozo wa Lishe');
    expect(html).toContain('Ushauri wa unyonyeshaji wa maziwa ya mama pekee.');
    expect(html).toContain('Inapendekezwa');
  });

  it('renders disabled state with reduced opacity and disabled attributes', () => {
    const html = renderToString(
      <QuickActionCard
        icon={Scale}
        title="Locked Feature"
        disabled
      />
    );
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('opacity-40');
    expect(html).toContain('pointer-events-none');
    expect(html).toContain('tabindex="-1"');
  });
});

describe('Wave 2 UI Molecules: MilestoneCard', () => {
  it('renders milestone card with category, timing, title, and description', () => {
    const html = renderToString(
      <MilestoneCard
        category="Motor Skills"
        timing="4–6 Months"
        title="Rolls from tummy to back"
        description="Baby begins rolling over during tummy time sessions."
        status="in_progress"
      />
    );
    expect(html).toContain('Motor Skills');
    expect(html).toContain('4–6 Months');
    expect(html).toContain('Rolls from tummy to back');
    expect(html).toContain('Baby begins rolling over during tummy time sessions.');
  });

  it('renders StatusBadge with appropriate semantic status (achieved / in_progress / upcoming)', () => {
    const achievedHtml = renderToString(
      <MilestoneCard title="Milestone" status="achieved" />
    );
    const inProgressHtml = renderToString(
      <MilestoneCard title="Milestone" status="in_progress" />
    );
    const upcomingHtml = renderToString(
      <MilestoneCard title="Milestone" status="upcoming" />
    );

    expect(achievedHtml).toContain('Achieved');
    expect(achievedHtml).toContain('bg-[#F0FDF4]'); // Healthy green

    expect(inProgressHtml).toContain('In Progress');
    expect(inProgressHtml).toContain('bg-[#FFFBEB]'); // Savannah Ochre

    expect(upcomingHtml).toContain('Upcoming');
    expect(upcomingHtml).toContain('bg-[#F1EFEA]'); // Neutral stone
  });

  it('renders bilingual Kiswahili status labels when lang="sw"', () => {
    const achievedHtml = renderToString(
      <MilestoneCard title="M" status="achieved" lang="sw" />
    );
    const inProgressHtml = renderToString(
      <MilestoneCard title="M" status="in_progress" lang="sw" />
    );
    const upcomingHtml = renderToString(
      <MilestoneCard title="M" status="upcoming" lang="sw" />
    );

    expect(achievedHtml).toContain('Imefikiwa');
    expect(inProgressHtml).toContain('Inaendelea');
    expect(upcomingHtml).toContain('Inayokuja');
  });

  it('renders interactive action button with >= 48px hit target when onAction is provided', () => {
    const html = renderToString(
      <MilestoneCard
        title="Holds Head Steady"
        status="in_progress"
        onAction={() => {}}
      />
    );
    expect(html).toContain('Mark Achieved');
    expect(html).toContain('min-h-[48px]');
  });
});

describe('Anti-Pattern & Integrity Guardrails across all Wave 2 Molecules', () => {
  const renderedComponents = [
    renderToString(<PregnancyMilestoneHero />),
    renderToString(<PregnancyMilestoneHero lang="sw" />),
    renderToString(<ChildMilestoneHero />),
    renderToString(<ChildMilestoneHero lang="sw" />),
    renderToString(<QuickActionCard title="Action" description="Desc" icon={Scale} />),
    renderToString(<MilestoneCard title="Milestone" status="achieved" onAction={() => {}} />),
    renderToString(<MilestoneCard title="Milestone" status="in_progress" onAction={() => {}} />),
  ];

  it('verifies ZERO Unicode emojis are present in any component markup', () => {
    // Prohibited emojis per Anti-Pattern 2
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    renderedComponents.forEach((html, idx) => {
      expect(emojiRegex.test(html), `Component index ${idx} contains a prohibited Unicode emoji`).toBe(false);
    });
  });

  it('verifies ZERO instances of white text on Amber surfaces (WCAG 2.1 AA Dark-on-Amber rule)', () => {
    renderedComponents.forEach((html, idx) => {
      // Must not have white text combined with amber backgrounds
      const hasWhiteOnAmber =
        /bg-\[#E68A00\][^>]*text-(white|\[#FFFFFF\])/.test(html) ||
        /bg-\[#FEF3C7\][^>]*text-(white|\[#FFFFFF\])/.test(html) ||
        /bg-\[#FFFBEB\][^>]*text-(white|\[#FFFFFF\])/.test(html);

      expect(hasWhiteOnAmber, `Component index ${idx} violates Dark-on-Amber contrast rule`).toBe(false);
    });
  });

  it('verifies all interactive buttons declare minimum 48px hit areas (min-h-[48px])', () => {
    // Check interactive components
    const heroPregnancy = renderToString(<PregnancyMilestoneHero onReadGuide={() => {}} />);
    const heroChild = renderToString(<ChildMilestoneHero onLogWeight={() => {}} />);
    const quickAction = renderToString(<QuickActionCard title="Action" icon={Scale} />);
    const milestone = renderToString(<MilestoneCard title="Milestone" onAction={() => {}} />);

    expect(heroPregnancy).toContain('min-h-[48px]');
    expect(heroChild).toContain('min-h-[48px]');
    expect(quickAction).toContain('min-h-[56px]'); // Exceeds 48px
    expect(milestone).toContain('min-h-[48px]');
  });
});
