import React, { useEffect } from 'react';
import { X, Plus, Check, Baby, Calendar } from 'lucide-react';
import { PillButton } from '@totoafya/shared-ui';

/**
 * SCR22ChildSwitcher — Screen SCR-22: Child Profiles Switcher & Sibling Drawer
 *
 * Implements:
 * - Half-to-full spring bottom sheet drawer anchored in the thumb zone
 * - Multi-child list/carousel for caregivers with twins, toddlers, or multiple dependents
 * - Clear active selection badge with Deep Teal indicator (#006B5F)
 * - "+ Add Another Child" (+ Sajili Mtoto Mwingine) CTA button with 48x48px touch target
 * - Keyboard accessible: Escape key dismissal, focus management, role="dialog"
 * - ZERO Unicode emojis: Custom SVG monogram avatars and Lucide icons exclusively
 * - Bilingual English & Kiswahili support via `lang` prop ('en' | 'sw')
 */

export const DEFAULT_CHILDREN = [
  {
    id: 'child-1',
    name: 'Joy Wambui',
    gender: 'female',
    dob: '2026-07-12',
    age: '4 Months 2 Weeks',
    ageSw: 'Miezi 4 Wiki 2',
    weight: '6.4 kg — Normal (50th percentile)',
    weightSw: '6.4 kg — Kawaida (asilimia 50)',
    muac: '13.2 cm — Healthy',
    muacSw: '13.2 cm — Afya Bora',
    muacStatus: 'healthy',
    vaccineAlert: '14-Week KEPI Vaccines Due in 12 Days',
    vaccineAlertSw: 'Chanjo ya Wiki 14 — Zimebaki Siku 12',
    lastClinic: '10-Week KEPI (Given)',
    lastClinicSw: 'Chanjo ya Wiki 10 (Imetolewa)',
  },
  {
    id: 'child-2',
    name: 'Brian Kiprop',
    gender: 'male',
    dob: '2024-04-10',
    age: '2 Years 7 Months',
    ageSw: 'Miaka 2 Miezi 7',
    weight: '12.8 kg — Normal (50th percentile)',
    weightSw: '12.8 kg — Kawaida (asilimia 50)',
    muac: '15.4 cm — Healthy',
    muacSw: '15.4 cm — Afya Bora',
    muacStatus: 'healthy',
    vaccineAlert: 'Up to Date — Next: 5-Year Booster',
    vaccineAlertSw: 'Kamilifu — Inayofuata: Chanjo ya Miaka 5',
    lastClinic: '18-Month Booster (Given)',
    lastClinicSw: 'Chanjo ya Miezi 18 (Imetolewa)',
  },
];

export function SCR22ChildSwitcher({
  isOpen = false,
  onClose,
  childrenList = DEFAULT_CHILDREN,
  activeChildId = 'child-1',
  onSelectChild,
  onAddChild,
  lang = 'en',
  className = '',
}) {
  const isSw = lang === 'sw';

  // Handle ESC key to dismiss sheet
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (childId) => {
    onSelectChild?.(childId);
    onClose?.();
  };

  const handleAdd = () => {
    onAddChild?.();
    onClose?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="child-switcher-title"
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      {/* Backdrop overlay with blur */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-up Sheet Container (constrained to 430px phone shell) */}
      <div
        className={`relative z-10 w-full max-w-[430px] bg-[#FFFFFF] rounded-t-3xl border-t border-[#E2E8F0] shadow-2xl p-5 md:p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 ${className}`}
      >
        {/* Drag handle */}
        <div
          className="w-12 h-1.5 bg-[#CBD5E1] rounded-full mx-auto select-none"
          aria-hidden="true"
        />

        {/* Sheet Header: Title, Subtitle, Close Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col text-left">
            <h2
              id="child-switcher-title"
              className="text-xl font-bold font-serif text-[#1A202C] tracking-tight"
            >
              {isSw ? 'Watoto Wangu' : 'My Children'}
            </h2>
            <p className="text-xs text-[#718096] font-medium mt-0.5">
              {isSw
                ? 'Chagua mtoto kuona ratiba ya chanjo na vipimo'
                : 'Select child to view their vaccine card and growth milestones'}
            </p>
          </div>

          {/* Close Button (min 48x48px hit target) */}
          <button
            type="button"
            onClick={onClose}
            aria-label={isSw ? 'Funga dirisha' : 'Close drawer'}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center -mr-2 -mt-2 text-[#718096] hover:text-[#1A202C] hover:bg-black/5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Children List */}
        <div
          role="radiogroup"
          aria-label={isSw ? 'Orodha ya watoto' : 'Children selection'}
          className="flex flex-col gap-3"
        >
          {childrenList.map((child) => {
            const isActive = String(child.id) === String(activeChildId);
            const resolvedAge = isSw && child.ageSw ? child.ageSw : child.age;
            const resolvedWeight = isSw && child.weightSw ? child.weightSw : child.weight;
            const monogram = child.name ? child.name.trim().charAt(0).toUpperCase() : 'B';

            return (
              <button
                key={child.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => handleSelect(child.id)}
                className={`w-full min-h-[56px] p-3.5 rounded-2xl text-left flex items-center justify-between gap-3.5 transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] active:scale-[0.98] ${
                  isActive
                    ? 'bg-[#E6F4F1] border-2 border-[#006B5F] shadow-xs'
                    : 'bg-[#F9F8F5] border border-[#E2E8F0] hover:border-[#006B5F]/40 hover:bg-[#FFFFFF]'
                }`}
              >
                {/* Child Monogram Avatar & Metadata */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base shrink-0 shadow-2xs ${
                      isActive
                        ? 'bg-[#006B5F] text-[#FFFFFF]'
                        : 'bg-[#FFFFFF] border-2 border-[#E2E8F0] text-[#006B5F]'
                    }`}
                    aria-hidden="true"
                  >
                    {monogram}
                  </div>

                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-[#1A202C] leading-tight">
                      {child.name}
                    </span>
                    <span className="text-xs text-[#718096] font-medium mt-0.5">
                      {resolvedAge} {resolvedWeight ? `• ${resolvedWeight}` : ''}
                    </span>
                  </div>
                </div>

                {/* Active Indicator Chip */}
                {isActive ? (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#006B5F] text-white text-[11px] font-bold shadow-2xs shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                    <span>{isSw ? 'Anayetumika' : 'Active'}</span>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-[#006B5F] shrink-0">
                    {isSw ? 'Chagua' : 'Select'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action: Add Another Child CTA (min 48px hit target) */}
        <div className="pt-2 border-t border-[#E2E8F0]">
          <PillButton
            variant="secondary"
            onClick={handleAdd}
            aria-label={isSw ? 'Sajili Mtoto Mwingine' : 'Add Another Child'}
            className="w-full min-h-[48px] justify-center bg-[#FEF3C7] text-[#1A202C] border border-[#FDE68A] hover:bg-[#FDE68A] font-bold text-sm"
          >
            <Plus className="w-4 h-4 text-[#B45309]" aria-hidden="true" />
            <span>{isSw ? '+ Sajili Mtoto Mwingine' : '+ Add Another Child'}</span>
          </PillButton>
        </div>
      </div>
    </div>
  );
}

export default SCR22ChildSwitcher;
