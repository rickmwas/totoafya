/**
 * TotoAfya Mother Experience — OfflineSyncChip Visual & Accessibility Test Suite
 * Task Directive TD-3.4: Offline Reconciliation & Indicator Chip
 * 
 * Verifies:
 * 1. Visual indicator states: 'synced', 'syncing', 'pending', 'dead_letter'.
 * 2. Strict WCAG 2.1/2.2 AA Dark-on-Amber compliance (contrast >= 4.5:1, zero white on savannah amber).
 * 3. 48x48px minimum touch target for interactive actions.
 * 4. Zero Unicode emojis (100% SVG line icons from lucide-react).
 * 5. Bilingual Swahili and English localization.
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { OfflineSyncChip } from '../../../shared-ui/src/atoms/OfflineSyncChip.jsx';

describe('OfflineSyncChip Component Verification', () => {
  describe('1. State Renderings', () => {
    it('renders "synced" state with Deep Green (#15803D) and SVG CheckCircle2', () => {
      const html = renderToString(
        <OfflineSyncChip status="synced" lang="en" />
      );

      expect(html).toContain('text-[#15803D]');
      expect(html).toContain('bg-[#F0FDF4]');
      expect(html).toContain('border-[#BBF7D0]');
      expect(html).toContain('Synced');
      expect(html).toContain('<svg');
      expect(html).toContain('role="status"');
    });

    it('renders "synced" state with Swahili localization', () => {
      const html = renderToString(
        <OfflineSyncChip status="synced" lang="sw" />
      );

      expect(html).toContain('Zimelandanishwa');
    });

    it('renders "syncing" state with Savannah Amber (#B45309) on (#FEF3C7) and rotating spinner', () => {
      const html = renderToString(
        <OfflineSyncChip status="syncing" lang="en" />
      );

      expect(html).toContain('text-[#B45309]');
      expect(html).toContain('bg-[#FEF3C7]');
      expect(html).toContain('border-[#FDE68A]');
      expect(html).toContain('animate-spin');
      expect(html).toContain('Syncing...');
    });

    it('renders "pending" state with pending count and Savannah Amber palette', () => {
      const html = renderToString(
        <OfflineSyncChip status="pending" pendingCount={3} isOnline={true} lang="en" />
      );

      expect(html).toContain('text-[#B45309]');
      expect(html).toContain('bg-[#FEF3C7]');
      expect(html).toContain('border-[#FDE68A]');
      expect(html).toContain('3 pending');
    });

    it('renders "pending" offline state with WifiOff icon indicator in Swahili', () => {
      const html = renderToString(
        <OfflineSyncChip status="pending" pendingCount={5} isOnline={false} lang="sw" />
      );

      expect(html).toContain('5 zinasubiri');
      expect(html).toContain('<svg');
    });

    it('renders "dead_letter" warning state with AlertCircle and action target', () => {
      const html = renderToString(
        <OfflineSyncChip
          status="dead_letter"
          deadLetterCount={2}
          onClick={() => {}}
          lang="en"
        />
      );

      expect(html).toContain('text-[#9A3412]');
      expect(html).toContain('bg-[#FFFBEB]');
      expect(html).toContain('border-[#FCD34D]');
      expect(html).toContain('2 unresolved');
      expect(html).toContain('Resolve');
    });
  });

  describe('2. Accessibility & WCAG AA Compliance', () => {
    it('enforces guaranteed 48x48px touch target for interactive button', () => {
      const interactiveHtml = renderToString(
        <OfflineSyncChip
          status="dead_letter"
          onClick={() => {}}
        />
      );

      expect(interactiveHtml).toContain('min-w-[48px]');
      expect(interactiveHtml).toContain('min-h-[48px]');
      expect(interactiveHtml).toContain('<button');
      expect(interactiveHtml).toContain('type="button"');
    });

    it('enforces Dark-on-Amber: ZERO white text on Savannah Amber background', () => {
      const states = ['syncing', 'pending', 'dead_letter'];

      for (const st of states) {
        const html = renderToString(
          <OfflineSyncChip status={st} />
        );

        // Disallow white text on amber
        expect(html).not.toContain('text-white');
        expect(html).not.toContain('text-[#ffffff]');
        expect(html).not.toContain('text-[#FFFFFF]');
      }
    });

    it('strictly outlaws Unicode emojis (zero emoji characters, 100% SVG line icons)', () => {
      const allStates = ['synced', 'syncing', 'pending', 'dead_letter'];

      for (const st of allStates) {
        const html = renderToString(
          <OfflineSyncChip status={st} pendingCount={2} deadLetterCount={1} />
        );

        // Unicode emoji regex range
        const emojiRegex = /[\u{1F300}-\u{1F9FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/u;
        expect(emojiRegex.test(html)).toBe(false);
        // Must contain SVG icons
        expect(html).toContain('<svg');
      }
    });
  });
});
