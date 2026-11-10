import React, { useState } from 'react';
import { PillButton } from '@totoafya/shared-ui';
import {
  PregnantMotherIcon,
  InfantChildIcon,
  MotherAndChildIcon,
} from './icons';

/**
 * SCR-03: Caregiver Role / Journey Identification Screen
 *
 * Implements:
 * - 3 tactile cards with custom SVG icons (Option A: Expecting, Option B: Child, Option C: Both)
 * - Zero Unicode emojis (anti-pattern guardrail)
 * - Friendly skip option ("I'll set this up later — explore the app first")
 * - 48x48px minimum touch targets and accessible radio semantics
 */

export function SCR03RoleSelection({
  selectedRole: initialRole = null,
  onSelectRole,
  onContinue,
  onSkip,
  onBack,
  lang = 'en',
}) {
  const isSw = lang === 'sw';
  const [selectedRole, setSelectedRole] = useState(initialRole);

  const handleCardClick = (roleKey) => {
    setSelectedRole(roleKey);
    if (onSelectRole) onSelectRole(roleKey);
  };

  const handleContinue = () => {
    if (selectedRole && onContinue) {
      onContinue(selectedRole);
    }
  };

  const roles = [
    {
      id: 'expecting',
      title: isSw ? 'Nina mjamzito' : 'I am expecting a baby',
      subtitle: isSw
        ? 'Ukuaji wa wiki kwa wiki, maandalizi ya kliniki ya ANC, na hesabu ya mateke.'
        : 'Week-by-week growth, ANC clinic prep, and kick counter.',
      badge: isSw ? 'Afya ya Uzazi' : 'Maternal Health',
      icon: <PregnantMotherIcon size={34} color="#006B5F" />,
    },
    {
      id: 'child',
      title: isSw
        ? 'Nina mtoto mchanga au wa chekechea'
        : 'I have a child (0–5 years)',
      subtitle: isSw
        ? 'Ratiba ya chanjo ya KEPI, makuzi na uzito wa WHO, na mwongozo wa kulisha.'
        : 'KEPI immunization tracker, WHO growth curves, and feeding guide.',
      badge: isSw ? 'Afya ya Mtoto' : 'Child Health',
      icon: <InfantChildIcon size={34} color="#006B5F" />,
    },
    {
      id: 'both',
      title: isSw
        ? 'Nina mjamzito na pia nina mtoto'
        : 'I am expecting AND have a child',
      subtitle: isSw
        ? 'Dashibodi ya pamoja inayofuatilia ujauzito na afya ya watoto wako wote.'
        : 'Dual-mode dashboard tracking pregnancy and all your children in one place.',
      badge: isSw ? 'Huduma ya Familia' : 'Family Care',
      icon: <MotherAndChildIcon size={34} color="#006B5F" />,
    },
  ];

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between px-6 py-6"
      style={{ backgroundColor: '#F9F8F5', color: '#1A202C' }}
      data-testid="scr03-role-selection"
    >
      {/* Top Bar with Back Navigation */}
      <div>
        <div className="flex items-center justify-between mb-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="min-h-[48px] min-w-[48px] flex items-center gap-1.5 text-sm font-semibold text-[#006B5F] hover:text-[#004D44] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] rounded-lg"
              aria-label={isSw ? 'Rudi nyuma' : 'Go back'}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>{isSw ? 'Nyuma' : 'Back'}</span>
            </button>
          ) : (
            <div className="w-12 h-12" />
          )}

          <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            {isSw ? 'Hatua 3 kati ya 6' : 'Step 3 of 6'}
          </span>
        </div>

        {/* Headline & Guidance */}
        <div className="text-center mb-6">
          <h2
            className="text-2xl font-bold text-[#1A202C] leading-tight mb-2"
            style={{ fontFamily: "'Merriweather', Georgia, serif" }}
          >
            {isSw ? 'Safari yako iko wapi sasa?' : 'Where are you on your journey?'}
          </h2>
          <p className="text-xs text-[#4A5568] max-w-sm mx-auto leading-relaxed">
            {isSw
              ? 'Chagua hatua inayolingana na mahitaji yako ya kiafya leo ili kubinafsisha programu.'
              : 'Choose the stage that best describes your care needs today to personalize your companion.'}
          </p>
        </div>

        {/* 3 Tactile Role Selection Cards */}
        <div
          className="flex flex-col gap-3.5 max-w-sm mx-auto"
          role="radiogroup"
          aria-label={isSw ? 'Chagua safari yako' : 'Select your journey'}
        >
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;

            return (
              <div
                key={role.id}
                onClick={() => handleCardClick(role.id)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    handleCardClick(role.id);
                  }
                }}
                className={`relative min-h-[76px] p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] ${
                  isSelected
                    ? 'bg-[#E6F4F1] border-[#006B5F] shadow-sm transform scale-[1.01]'
                    : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] shadow-[0_2px_4px_rgba(0,0,0,0.02)]'
                }`}
                data-testid={`role-card-${role.id}`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Custom SVG Icon Container */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-white shadow-sm' : 'bg-[#F9F8F5]'
                    }`}
                  >
                    {role.icon}
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 pr-6">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-[#1A202C] leading-snug">
                        {role.title}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E6F4F1] text-[#006B5F]">
                        {role.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A5568] leading-relaxed">
                      {role.subtitle}
                    </p>
                  </div>
                </div>

                {/* Selection Indicator Check */}
                <div
                  className={`absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-[#006B5F] border-[#006B5F]'
                      : 'border-[#CBD5E1] bg-transparent'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col items-center gap-3 pt-6 w-full max-w-sm mx-auto">
        <PillButton
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selectedRole}
          onClick={handleContinue}
          className="w-full h-[52px] text-base font-semibold"
          data-testid="role-continue-btn"
        >
          {isSw ? 'Endelea' : 'Continue'}
        </PillButton>

        {/* Friendly Skip Option */}
        <button
          type="button"
          onClick={onSkip}
          className="min-h-[48px] px-4 py-2 text-xs font-semibold text-[#4A5568] hover:text-[#1A202C] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] rounded-lg transition-colors"
          data-testid="role-skip-btn"
        >
          {isSw
            ? 'Nitaweka baadaye — angalia kwanza'
            : "I'll set this up later — explore the app first"}
        </button>
      </div>
    </div>
  );
}

export default SCR03RoleSelection;
