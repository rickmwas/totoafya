import React, { useState } from 'react';
import {
  ChevronLeft,
  Building2,
  Car,
  Users,
  CreditCard,
  ShoppingBag,
  CheckCircle2,
  Edit2,
  Save,
  Info,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { PillButton, StatusBadge } from '@totoafya/shared-ui';

export function SCR12BirthPlan({
  lang = 'en',
  onNavigate,
  className = '',
}) {
  const isSw = lang === 'sw';

  // Birth preparedness sections
  const [plan, setPlan] = useState({
    facility: 'Ruiru Sub-County Hospital (Maternity Wing, Level 4)',
    facilityPhone: '0722 000 000',
    backupFacility: 'Kiambu Level 5 Referral Hospital',
    transportMode: 'Designated Taxi / Ambulance 1199',
    driverName: 'Mr. Mwangi (Neighbor Taxi)',
    driverPhone: '0711 234 567',
    companionName: 'Peter (Husband) & Mama Mary (Mother-in-law)',
    companionPhone: '0720 123 456',
    insuranceProvider: 'SHA / NHIF (Linda Mama Scheme Active)',
    insuranceNumber: 'SHA-8921-4402',
    emergencyCashSaved: 'KES 15,000 in M-PESA reserve',
    bloodDonor: 'John Kariuki (Blood Group O+ confirmed)',
  });

  // Hospital bag checklist items
  const [bagItems, setBagItems] = useState([
    { id: 'b1', labelEn: 'MoH 216 Mother & Child Clinic Card', labelSw: 'Kadi ya Kliniki ya MoH 216', checked: true },
    { id: 'b2', labelEn: 'National ID card & Linda Mama / SHA card', labelSw: 'Kitambulisho cha Taifa & Kadi ya SHA/NHIF', checked: true },
    { id: 'b3', labelEn: '3 sets of clean baby clothes & 2 warm shawls', labelSw: 'Nguo 3 safi za mtoto na shuka 2 za joto', checked: true },
    { id: 'b4', labelEn: 'Newborn diapers & cotton wool roll', labelSw: 'Nepi za mtoto na pamba safi', checked: true },
    { id: 'b5', labelEn: 'Maternity sanitary pads & comfortable loose dress', labelSw: 'Pedi za uzazi na gauni pana la mama', checked: true },
    { id: 'b6', labelEn: 'Toiletries (mild soap, basin, washcloth, slippers)', labelSw: 'Vifaa vya usafi (sabuni, beseni, kanga, ndala)', checked: false },
  ]);

  const [isEditing, setIsEditing] = useState(false);

  const toggleBagItem = (id) => {
    setBagItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // Completion calculation (6 key pillars)
  const completedBagCount = bagItems.filter((i) => i.checked).length;
  const bagComplete = completedBagCount === bagItems.length;
  const facilityComplete = Boolean(plan.facility && plan.facilityPhone);
  const transportComplete = Boolean(plan.transportMode && plan.driverPhone);
  const companionComplete = Boolean(plan.companionName && plan.companionPhone);
  const financeComplete = Boolean(plan.insuranceNumber && plan.emergencyCashSaved);
  const donorComplete = Boolean(plan.bloodDonor);

  const pillars = [facilityComplete, transportComplete, companionComplete, financeComplete, donorComplete, bagComplete];
  const completedPillars = pillars.filter(Boolean).length;
  const progressPercent = Math.round((completedPillars / pillars.length) * 100);

  return (
    <div
      data-testid="scr12-birth-plan"
      className={`w-full flex flex-col gap-5 px-4 pt-3 pb-12 text-left bg-[#F9F8F5] min-h-screen ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              aria-label={isSw ? 'Rudi nyumbani' : 'Back to dashboard'}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-[#E2E8F0] text-[#1A202C] hover:bg-[#F1EFEA] active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-serif text-[#1A202C] tracking-tight">
              {isSw ? 'Mpango wa Kujifungua' : 'Birth Preparedness Plan'}
            </h1>
            <p className="text-xs text-[#718096] font-medium">
              {isSw ? 'Mwongozo wa maandalizi ya uzazi salama' : 'Emergency readiness & hospital bag checklist'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          aria-label={isEditing ? (isSw ? 'Hifadhi' : 'Save') : (isSw ? 'Hariri' : 'Edit')}
          className="min-h-[48px] px-3.5 py-2 rounded-full bg-white border border-[#E2E8F0] text-xs font-bold text-[#006B5F] hover:bg-[#E6F4F1] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4 text-[#006B5F]" aria-hidden="true" />
              <span>{isSw ? 'Hifadhi' : 'Done'}</span>
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4 text-[#006B5F]" aria-hidden="true" />
              <span>{isSw ? 'Badilisha' : 'Edit'}</span>
            </>
          )}
        </button>
      </div>

      {/* Completion Progress Card & Ring */}
      <section
        aria-label={isSw ? 'Kiwango cha Kukamilisha Mpango' : 'Plan Completion Progress'}
        className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-xs flex items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#718096]">
            {isSw ? 'Utekelezaji wa Mpango' : 'Readiness Score'}
          </span>
          <h2 className="text-lg font-bold font-serif text-[#1A202C]">
            {isSw ? `${completedPillars} kati ya nguzo 6 zimekamilika` : `${completedPillars} of 6 Pillars Ready`}
          </h2>
          <p className="text-xs text-[#4A5568]">
            {progressPercent >= 80
              ? (isSw ? 'Maandalizi yako yako vizuri kwa uzazi salama!' : 'Your delivery preparations are clinically comprehensive.')
              : (isSw ? 'Tafadhali kamilisha vipengee vilivyosalia kabla ya wiki ya 36.' : 'Complete remaining items before 36 weeks.')}
          </p>
        </div>

        {/* Progress Circular Meter */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#E2E8F0]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[#006B5F]"
              strokeDasharray={`${progressPercent}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-xs font-bold font-mono text-[#1A202C]">
            {progressPercent}%
          </span>
        </div>
      </section>

      {/* Pillar 1: Delivery Facility */}
      <article className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-4 md:p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E6F4F1] flex items-center justify-center text-[#006B5F] shrink-0">
              <Building2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold font-serif text-[#1A202C]">
                {isSw ? '1. Kituo cha Kujifungulia' : '1. Delivery Facility'}
              </h3>
              <span className="text-[11px] text-[#718096]">
                {isSw ? 'Hospitali uliyochagua kwa uzazi' : 'Designated maternity health facility'}
              </span>
            </div>
          </div>
          <StatusBadge status="healthy" label={isSw ? 'Imethibitishwa' : 'Confirmed'} size="sm" />
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2 pt-2">
            <input
              type="text"
              value={plan.facility}
              onChange={(e) => setPlan({ ...plan, facility: e.target.value })}
              aria-label="Delivery Facility"
              className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
            />
            <input
              type="text"
              value={plan.facilityPhone}
              onChange={(e) => setPlan({ ...plan, facilityPhone: e.target.value })}
              placeholder="Facility hotline"
              aria-label="Facility Phone"
              className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
            />
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-[#F9F8F5] border border-[#E2E8F0] flex flex-col gap-1 text-xs">
            <span className="font-bold text-[#1A202C]">{plan.facility}</span>
            <span className="text-[#4A5568]">Simu: {plan.facilityPhone}</span>
            <span className="text-[#718096] text-[11px]">Kituo cha Akiba: {plan.backupFacility}</span>
          </div>
        )}
      </article>

      {/* Pillar 2: Transport & Driver */}
      <article className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-4 md:p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#B45309] shrink-0">
              <Car className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold font-serif text-[#1A202C]">
                {isSw ? '2. Mpango wa Usafiri' : '2. Emergency Transport'}
              </h3>
              <span className="text-[11px] text-[#718096]">
                {isSw ? 'Njia ya kufika hospitalini wakati wowote' : '24/7 designated vehicle & driver'}
              </span>
            </div>
          </div>
          <StatusBadge status="healthy" label={isSw ? 'Tayari' : 'Ready'} size="sm" />
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2 pt-2">
            <input
              type="text"
              value={plan.transportMode}
              onChange={(e) => setPlan({ ...plan, transportMode: e.target.value })}
              aria-label="Transport Mode"
              className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
            />
            <input
              type="text"
              value={plan.driverName}
              onChange={(e) => setPlan({ ...plan, driverName: e.target.value })}
              aria-label="Driver Name"
              className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
            />
            <input
              type="text"
              value={plan.driverPhone}
              onChange={(e) => setPlan({ ...plan, driverPhone: e.target.value })}
              aria-label="Driver Phone"
              className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
            />
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-[#F9F8F5] border border-[#E2E8F0] flex flex-col gap-1 text-xs">
            <span className="font-bold text-[#1A202C]">{plan.transportMode}</span>
            <span className="text-[#4A5568]">Dereva: {plan.driverName} ({plan.driverPhone})</span>
            <span className="text-[#718096] text-[11px]">Nambari ya Ambulensi ya Kaunti: 1199</span>
          </div>
        )}
      </article>

      {/* Pillar 3: Birth Companion */}
      <article className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-4 md:p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E6F4F1] flex items-center justify-center text-[#006B5F] shrink-0">
              <Users className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold font-serif text-[#1A202C]">
                {isSw ? '3. Mtu wa Kusindikiza (Companion)' : '3. Birth Companion'}
              </h3>
              <span className="text-[11px] text-[#718096]">
                {isSw ? 'Mshirika anayeaminika wakati wa leba' : 'Supportive birth partner or family member'}
              </span>
            </div>
          </div>
          <StatusBadge status="healthy" label={isSw ? 'Tayari' : 'Ready'} size="sm" />
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2 pt-2">
            <input
              type="text"
              value={plan.companionName}
              onChange={(e) => setPlan({ ...plan, companionName: e.target.value })}
              aria-label="Companion Name"
              className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
            />
            <input
              type="text"
              value={plan.companionPhone}
              onChange={(e) => setPlan({ ...plan, companionPhone: e.target.value })}
              aria-label="Companion Phone"
              className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
            />
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-[#F9F8F5] border border-[#E2E8F0] flex flex-col gap-1 text-xs">
            <span className="font-bold text-[#1A202C]">{plan.companionName}</span>
            <span className="text-[#4A5568]">Simu: {plan.companionPhone}</span>
          </div>
        )}
      </article>

      {/* Pillar 4: Saved Funds & Insurance (NHIF / SHA) */}
      <article className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-4 md:p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center text-[#15803D] shrink-0">
              <CreditCard className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold font-serif text-[#1A202C]">
                {isSw ? '4. Fedha & Bima (SHA/NHIF)' : '4. Finance & Insurance'}
              </h3>
              <span className="text-[11px] text-[#718096]">
                {isSw ? 'Mpango wa malipo na akiba ya dharura' : 'Linda Mama / SHA coverage & cash reserve'}
              </span>
            </div>
          </div>
          <StatusBadge status="healthy" label={isSw ? 'Imethibitishwa' : 'Confirmed'} size="sm" />
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2 pt-2">
            <input
              type="text"
              value={plan.insuranceProvider}
              onChange={(e) => setPlan({ ...plan, insuranceProvider: e.target.value })}
              aria-label="Insurance Provider"
              className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
            />
            <input
              type="text"
              value={plan.insuranceNumber}
              onChange={(e) => setPlan({ ...plan, insuranceNumber: e.target.value })}
              aria-label="Insurance Number"
              className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
            />
            <input
              type="text"
              value={plan.emergencyCashSaved}
              onChange={(e) => setPlan({ ...plan, emergencyCashSaved: e.target.value })}
              aria-label="Emergency Cash Saved"
              className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
            />
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-[#F9F8F5] border border-[#E2E8F0] flex flex-col gap-1 text-xs">
            <span className="font-bold text-[#1A202C]">{plan.insuranceProvider}</span>
            <span className="text-[#4A5568]">Nambari ya Bima: {plan.insuranceNumber}</span>
            <span className="text-[#15803D] font-semibold">Akiba ya M-PESA: {plan.emergencyCashSaved}</span>
            <span className="text-[#718096] text-[11px]">Mtoa Damu wa Dharura: {plan.bloodDonor}</span>
          </div>
        )}
      </article>

      {/* Pillar 5: Hospital Bag Essentials Checklist */}
      <article className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-4 md:p-5 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] flex items-center justify-center text-[#B45309] shrink-0">
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold font-serif text-[#1A202C]">
                {isSw ? '5. Begi la Hospitali' : '5. Hospital Bag Essentials'}
              </h3>
              <span className="text-[11px] text-[#718096]">
                {completedBagCount} / {bagItems.length} {isSw ? 'vifaa viko tayari' : 'items packed'}
              </span>
            </div>
          </div>
          <StatusBadge
            status={bagComplete ? 'healthy' : 'warning'}
            label={bagComplete ? (isSw ? 'Tayari' : 'Packed') : (isSw ? 'Inaendelea' : 'In Progress')}
            size="sm"
          />
        </div>

        <div className="flex flex-col gap-2 pt-1">
          {bagItems.map((item) => (
            <label
              key={item.id}
              className={`min-h-[48px] flex items-center gap-3 px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                item.checked
                  ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]'
                  : 'bg-white border-[#E2E8F0] text-[#1A202C] hover:bg-[#F9F8F5]'
              }`}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleBagItem(item.id)}
                className="w-5 h-5 rounded text-[#006B5F] focus:ring-[#006B5F]"
              />
              <span className="text-xs font-medium leading-relaxed">
                {isSw ? item.labelSw : item.labelEn}
              </span>
            </label>
          ))}
        </div>
      </article>
    </div>
  );
}
