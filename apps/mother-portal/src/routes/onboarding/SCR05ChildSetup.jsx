import React, { useState, useMemo } from 'react';
import { PillButton } from '@totoafya/shared-ui';
import {
  calculateKEPISchedule,
  generateVaccinationSchedule,
} from '@totoafya/business-logic';
import { SyringeVaccineIcon, CalendarIcon } from './icons';

/**
 * SCR-05: Child Registration Flow
 *
 * Implements:
 * - Child's First Name or Nickname
 * - Date of Birth (DOB) picker with age calculation (0-5 years)
 * - Gender selector: Boy (Mvulana) | Girl (Msichana)
 * - Optional birth weight (kg) with clinical bounds (0.5 - 6.0 kg)
 * - Smart immunization notice: auto-populates Kenya KEPI 7-visit vaccine schedule
 *   via @totoafya/business-logic
 * - Minimum 48x48px touch targets, zero Unicode emojis
 */

export function SCR05ChildSetup({
  initialData = {},
  onComplete,
  onBack,
  lang = 'en',
}) {
  const isSw = lang === 'sw';

  const [firstName, setFirstName] = useState(initialData.firstName || '');
  const [dob, setDob] = useState(initialData.dob || '');
  const [gender, setGender] = useState(initialData.gender || 'girl'); // 'boy' | 'girl'
  const [birthWeight, setBirthWeight] = useState(initialData.birthWeight || '');
  const [error, setError] = useState('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const fiveYearsAgoStr = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 5);
    return d.toISOString().split('T')[0];
  }, []);

  // Compute child age and auto-populated KEPI schedule from business-logic
  const childInfo = useMemo(() => {
    if (!dob) return null;

    try {
      const dobDate = new Date(dob);
      const today = new Date();
      const diffMs = today.getTime() - dobDate.getTime();
      if (diffMs < 0) return null;

      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const totalWeeks = Math.floor(totalDays / 7);
      const totalMonths = Math.floor(totalDays / 30.4375);
      const totalYears = Math.floor(totalDays / 365.25);

      let ageDisplayEn = `${totalDays} days old`;
      let ageDisplaySw = `Siku ${totalDays}`;
      if (totalYears >= 1) {
        const remMonths = totalMonths % 12;
        ageDisplayEn = `${totalYears} yr${totalYears > 1 ? 's' : ''} ${remMonths > 0 ? `${remMonths} mo` : ''}`;
        ageDisplaySw = `Miaka ${totalYears} ${remMonths > 0 ? `na miezi ${remMonths}` : ''}`;
      } else if (totalMonths >= 1) {
        ageDisplayEn = `${totalMonths} month${totalMonths > 1 ? 's' : ''} old`;
        ageDisplaySw = `Miezi ${totalMonths}`;
      } else if (totalWeeks >= 1) {
        ageDisplayEn = `${totalWeeks} week${totalWeeks > 1 ? 's' : ''} old`;
        ageDisplaySw = `Wiki ${totalWeeks}`;
      }

      // Generate KEPI schedule
      const kepiSchedule = calculateKEPISchedule(dobDate, 'temp-child-id');
      const legacySchedule = generateVaccinationSchedule('temp-child-id', dob);

      return {
        totalDays,
        totalWeeks,
        totalMonths,
        totalYears,
        ageDisplayEn,
        ageDisplaySw,
        kepiSchedule,
        totalVisits: kepiSchedule?.visits?.length || 7,
        totalVaccines: legacySchedule?.length || 18,
      };
    } catch (err) {
      return null;
    }
  }, [dob]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!firstName.trim()) {
      setError(
        isSw
          ? 'Tafadhali weka jina au jina la utani la mtoto.'
          : 'Please enter child’s first name or nickname.'
      );
      return;
    }

    if (!dob) {
      setError(
        isSw
          ? 'Tafadhali chagua tarehe ya kuzaliwa ya mtoto.'
          : 'Please select child’s date of birth (DOB).'
      );
      return;
    }

    if (birthWeight && (parseFloat(birthWeight) < 0.5 || parseFloat(birthWeight) > 6.0)) {
      setError(
        isSw
          ? 'Uzito wa kuzaliwa unapaswa kuwa kati ya kilo 0.5 na 6.0.'
          : 'Birth weight should be between 0.5 kg and 6.0 kg.'
      );
      return;
    }

    if (onComplete) {
      onComplete({
        firstName: firstName.trim(),
        dob,
        gender,
        birthWeight: birthWeight ? parseFloat(birthWeight) : null,
        kepiSchedule: childInfo?.kepiSchedule,
        ageDisplay: isSw ? childInfo?.ageDisplaySw : childInfo?.ageDisplayEn,
      });
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between px-6 py-6"
      style={{ backgroundColor: '#F9F8F5', color: '#1A202C' }}
      data-testid="scr05-child-setup"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="min-h-[48px] min-w-[48px] flex items-center gap-1.5 text-sm font-semibold text-[#006B5F] hover:text-[#004D44] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] rounded-lg"
              aria-label={isSw ? 'Rudi nyuma' : 'Go back'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>{isSw ? 'Nyuma' : 'Back'}</span>
            </button>
          ) : (
            <div className="w-12 h-12" />
          )}

          <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            {isSw ? 'Hatua 5 kati ya 6' : 'Step 5 of 6'}
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-5">
          <h2
            className="text-2xl font-bold text-[#1A202C] leading-tight mb-1.5"
            style={{ fontFamily: "'Merriweather', Georgia, serif" }}
          >
            {isSw ? 'Sajili Mtoto Wako' : 'Register Your Child'}
          </h2>
          <p className="text-xs text-[#4A5568] max-w-sm mx-auto">
            {isSw
              ? 'Weka taarifa fupi ili kupanga ratiba ya chanjo ya KEPI na makuzi ya mtoto.'
              : 'Enter basic details to personalize immunization timelines and growth charts.'}
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm max-w-md mx-auto space-y-4">
          {/* Child's Name */}
          <div>
            <label className="block text-xs font-bold text-[#1A202C] mb-1.5">
              {isSw ? 'Jina la Kwanza au la Utani *' : "Child's First Name or Nickname *"}
            </label>
            <input
              type="text"
              placeholder={isSw ? 'Mfano: Joy au Baraka' : 'e.g., Joy or Baraka'}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#006B5F] focus:border-[#006B5F]"
              data-testid="child-name-input"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-bold text-[#1A202C] mb-1.5">
              {isSw ? 'Tarehe ya Kuzaliwa (DOB) *' : 'Date of Birth (DOB) *'}
            </label>
            <input
              type="date"
              max={todayStr}
              min={fiveYearsAgoStr}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#006B5F] focus:border-[#006B5F]"
              data-testid="child-dob-input"
            />
          </div>

          {/* Gender Selector */}
          <div>
            <label className="block text-xs font-bold text-[#1A202C] mb-1.5">
              {isSw ? 'Jinsia *' : 'Gender *'}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setGender('girl')}
                className={`min-h-[48px] px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  gender === 'girl'
                    ? 'bg-[#E6F4F1] border-[#006B5F] text-[#006B5F]'
                    : 'bg-white border-[#E2E8F0] text-[#4A5568] hover:bg-[#F9F8F5]'
                }`}
                data-testid="gender-girl-btn"
              >
                {isSw ? 'Msichana (Girl)' : 'Girl'}
              </button>
              <button
                type="button"
                onClick={() => setGender('boy')}
                className={`min-h-[48px] px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  gender === 'boy'
                    ? 'bg-[#E6F4F1] border-[#006B5F] text-[#006B5F]'
                    : 'bg-white border-[#E2E8F0] text-[#4A5568] hover:bg-[#F9F8F5]'
                }`}
                data-testid="gender-boy-btn"
              >
                {isSw ? 'Mvulana (Boy)' : 'Boy'}
              </button>
            </div>
          </div>

          {/* Birth Weight (Optional) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-[#1A202C]">
                {isSw ? 'Uzito wa Kuzaliwa (Kilo) — Hiari' : 'Birth Weight (kg) — Optional'}
              </label>
              <span className="text-[11px] text-[#718096]">
                {isSw ? 'Wastani: ~3.2 kg' : 'Standard: ~3.2 kg'}
              </span>
            </div>
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="6.0"
              placeholder="3.2"
              value={birthWeight}
              onChange={(e) => setBirthWeight(e.target.value)}
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#006B5F] focus:border-[#006B5F]"
              data-testid="child-weight-input"
            />
          </div>

          {/* Smart KEPI Immunization Schedule Notice */}
          {childInfo && (
            <div
              className="mt-3 p-3.5 rounded-xl bg-[#F0FAF5] border border-[#A7F3D0] transition-all"
              data-testid="smart-immunization-notice"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#006B5F] text-white flex items-center justify-center shrink-0">
                  <SyringeVaccineIcon size={18} color="#FFFFFF" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#065F46] leading-snug">
                    {isSw
                      ? `Ratiba ya Chanjo ya KEPI Imepangwa (${childInfo.totalVisits} Ziara)`
                      : `Kenya KEPI Vaccine Schedule Auto-Populated (${childInfo.totalVisits} Visits)`}
                  </h4>
                  <p className="text-[11px] text-[#047857] mt-0.5 leading-relaxed">
                    {isSw
                      ? `Mtoto ana umri wa ${childInfo.ageDisplaySw}. Chanjo zote za kuzaliwa hadi miezi 18 zimewekwa kwenye ratiba kiotomatiki.`
                      : `Child is ${childInfo.ageDisplayEn}. Vaccines from birth through 18 months are calculated per Kenya Ministry of Health guidelines.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p
              className="text-xs font-semibold text-[#DC2626] text-center"
              role="alert"
              data-testid="child-error"
            >
              {error}
            </p>
          )}
        </form>
      </div>

      {/* Action CTA */}
      <div className="pt-6 w-full max-w-sm mx-auto">
        <PillButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSubmit}
          className="w-full h-[52px] text-base font-semibold"
          data-testid="create-child-btn"
        >
          {isSw ? 'Sajili Mtoto' : 'Create Child Record'}
        </PillButton>
      </div>
    </div>
  );
}

export default SCR05ChildSetup;
