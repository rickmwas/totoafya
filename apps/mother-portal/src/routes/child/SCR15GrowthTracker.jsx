import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  Scale,
  Ruler,
  Activity,
  Plus,
  Info,
  Calendar,
  Table as TableIcon,
  TrendingUp,
} from 'lucide-react';
import {
  calculateWeightForAgeZScore,
  calculateHeightForAgeZScore,
  assessMUACNutrition,
  WHO_WEIGHT_FOR_AGE_GIRLS,
  WHO_WEIGHT_FOR_AGE_BOYS,
} from '@totoafya/business-logic';
import { StatusBadge, PillButton, MUACIndicator } from '@totoafya/shared-ui';
import { SCR16GrowthLoggerSheet } from './SCR16GrowthLoggerSheet';

const INITIAL_MEASUREMENTS = [
  { date: '2026-07-12', ageMonths: 0, weightKg: 3.2, heightCm: 49.5, muacCm: null },
  { date: '2026-08-24', ageMonths: 1.5, weightKg: 4.4, heightCm: 54.0, muacCm: null },
  { date: '2026-09-21', ageMonths: 2.5, weightKg: 5.5, heightCm: 58.2, muacCm: null },
  { date: '2026-11-10', ageMonths: 4.0, weightKg: 6.4, heightCm: 62.5, muacCm: 13.2 },
];

export function SCR15GrowthTracker({
  lang = 'en',
  onNavigate,
  childName = 'Joy Wambui',
  childDob = '2026-07-12',
  gender = 'girl',
  className = '',
}) {
  const isSw = lang === 'sw';
  const [activeTab, setActiveTab] = useState('weight'); // 'weight' | 'height' | 'muac'
  const [measurements, setMeasurements] = useState(INITIAL_MEASUREMENTS);
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
  const [activeHoverPoint, setActiveHoverPoint] = useState(null);

  // Latest measurement
  const latest = measurements[measurements.length - 1] || INITIAL_MEASUREMENTS[INITIAL_MEASUREMENTS.length - 1];

  // Calculate real-time continuous Z-scores
  const currentWeightZ = useMemo(() => {
    return calculateWeightForAgeZScore(latest.weightKg, latest.ageMonths, gender);
  }, [latest, gender]);

  const currentHeightZ = useMemo(() => {
    return calculateHeightForAgeZScore(latest.heightCm, latest.ageMonths, gender);
  }, [latest, gender]);

  const muacAssessment = useMemo(() => {
    if (latest.muacCm && latest.ageMonths >= 6) {
      return assessMUACNutrition(latest.muacCm, latest.ageMonths);
    }
    return 'NORMAL';
  }, [latest]);

  const handleSaveMeasurement = (record) => {
    setMeasurements((prev) => [...prev, record]);
  };

  // SVG Chart Dimensions & Scales (Age 0 to 24 Months, Weight 2 to 14 kg)
  const chartWidth = 340;
  const chartHeight = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const minAge = 0;
  const maxAge = 24;
  const minVal = activeTab === 'weight' ? 2 : 45;
  const maxVal = activeTab === 'weight' ? 14 : 95;

  const getX = (age) => padding.left + (age / (maxAge - minAge)) * innerWidth;
  const getY = (val) => padding.top + innerHeight - ((val - minVal) / (maxVal - minVal)) * innerHeight;

  // Generate reference curve points across 0 to 24 months
  const whoTable = gender === 'girl' ? WHO_WEIGHT_FOR_AGE_GIRLS : WHO_WEIGHT_FOR_AGE_BOYS;
  const sampleAges = [0, 3, 6, 9, 12, 18, 24];

  const medianPoints = sampleAges.map((age) => {
    const entry = whoTable[age] || { median: 3.3 };
    return `${getX(age)},${getY(entry.median)}`;
  }).join(' ');

  const sd2PosPoints = sampleAges.map((age) => {
    const entry = whoTable[age] || { sd2Pos: 4.4 };
    return `${getX(age)},${getY(entry.sd2Pos)}`;
  }).join(' ');

  const sd2NegPoints = sampleAges.map((age) => {
    const entry = whoTable[age] || { sd2Neg: 2.4 };
    return `${getX(age)},${getY(entry.sd2Neg)}`;
  }).join(' ');

  const sd3NegPoints = sampleAges.map((age) => {
    const entry = whoTable[age] || { sd3Neg: 2.0 };
    return `${getX(age)},${getY(entry.sd3Neg)}`;
  }).join(' ');

  return (
    <div
      data-testid="scr15-growth-tracker"
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
              {isSw ? 'Makuzi na Lishe (WHO)' : 'Growth & Nutrition'}
            </h1>
            <p className="text-xs text-[#718096] font-medium">
              {childName} • {isSw ? `Umri: Miezi ${latest.ageMonths}` : `Age: ${latest.ageMonths} Months`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsLogSheetOpen(true)}
          aria-label={isSw ? 'Rekodi kipimo' : 'Log measurement'}
          className="min-h-[48px] px-3.5 py-2 rounded-full bg-[#006B5F] text-white text-xs font-bold hover:bg-[#004D44] active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4 text-white" aria-hidden="true" />
          <span>{isSw ? 'Rekodi' : 'Log'}</span>
        </button>
      </div>

      {/* Segment Tabs: Weight / Height / MUAC */}
      <div className="flex items-center gap-2 p-1 bg-[#F1EFEA] rounded-2xl border border-[#E2E8F0]">
        {[
          { id: 'weight', labelEn: 'Weight-for-Age', labelSw: 'Uzito (kg)', icon: Scale },
          { id: 'height', labelEn: 'Length-for-Age', labelSw: 'Urefu (cm)', icon: Ruler },
          { id: 'muac', labelEn: 'MUAC (Tape)', labelSw: 'Mkono (MUAC)', icon: Activity },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-h-[48px] px-2 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-white text-[#006B5F] shadow-xs'
                  : 'text-[#4A5568] hover:text-[#1A202C]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{isSw ? tab.labelSw : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Hero Metric Status Snapshot Card */}
      <section
        aria-label={isSw ? 'Hali ya Sasa ya Makuzi' : 'Current Growth Status'}
        className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs"
      >
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider">
            {activeTab === 'weight'
              ? (isSw ? 'Uzito wa Sasa' : 'Latest Weight')
              : activeTab === 'height'
              ? (isSw ? 'Urefu wa Sasa' : 'Latest Length')
              : (isSw ? 'Kipimo cha Mkono' : 'Latest MUAC')}
          </span>
          <span className="text-2xl font-black font-display text-[#1A202C]">
            {activeTab === 'weight'
              ? `${latest.weightKg} kg`
              : activeTab === 'height'
              ? `${latest.heightCm} cm`
              : latest.muacCm ? `${latest.muacCm} cm` : '13.2 cm'}
          </span>
          <span className="text-xs text-[#718096]">
            {isSw ? `Tarehe: ${latest.date}` : `Measured: ${latest.date}`}
          </span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <StatusBadge
            status="healthy"
            label={isSw ? 'Kawaida / Normal' : 'Normal Nutrition'}
            size="sm"
          />
          <span className="text-xs font-bold text-[#006B5F]">
            {activeTab === 'weight'
              ? `Z = ${currentWeightZ >= 0 ? `+${currentWeightZ}` : currentWeightZ}`
              : activeTab === 'height'
              ? `Z = ${currentHeightZ >= 0 ? `+${currentHeightZ}` : currentHeightZ}`
              : (isSw ? 'Ukanda wa Kijani' : 'Green Zone')}
          </span>
        </div>
      </section>

      {/* Active Tab View 1 & 2: Interactive SVG Growth Curves (Weight / Height) */}
      {(activeTab === 'weight' || activeTab === 'height') && (
        <section
          aria-label={isSw ? 'Chati ya Makuzi ya WHO' : 'WHO Growth Percentile Chart'}
          className="w-full rounded-3xl bg-white border border-[#E2E8F0] p-4 flex flex-col gap-3 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1A202C]">
              {isSw
                ? `Chati ya ${activeTab === 'weight' ? 'Uzito' : 'Urefu'} kulingana na Umri (WHO)`
                : `WHO ${activeTab === 'weight' ? 'Weight-for-Age' : 'Length-for-Age'} Curve (0–24m)`}
            </span>
            <span className="text-[11px] font-semibold text-[#15803D] bg-[#F0FDF4] px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
              {gender === 'girl' ? (isSw ? 'Wasichana' : 'Girls') : (isSw ? 'Wavulana' : 'Boys')}
            </span>
          </div>

          {/* SVG Growth Chart Container */}
          <div className="relative w-full overflow-hidden flex flex-col items-center">
            {/* Tooltip Pill */}
            {activeHoverPoint && (
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-[#1A202C] text-white text-[11px] font-mono shadow-md animate-fadeIn">
                {activeHoverPoint.val} {activeTab === 'weight' ? 'kg' : 'cm'} • {activeHoverPoint.age}m • Z={activeHoverPoint.z >= 0 ? `+${activeHoverPoint.z}` : activeHoverPoint.z}
              </div>
            )}

            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto select-none overflow-visible"
            >
              {/* Shaded Percentile Bands */}
              {/* Normal Band (-2 SD to +2 SD) in soft green #F0FDF4 */}
              <polygon
                points={`${sd2PosPoints} ${sd2NegPoints.split(' ').reverse().join(' ')}`}
                fill="#F0FDF4"
                opacity="0.8"
              />
              {/* Underweight Band (-2 SD to -3 SD) in soft amber #FFFBEB */}
              <polygon
                points={`${sd2NegPoints} ${sd3NegPoints.split(' ').reverse().join(' ')}`}
                fill="#FFFBEB"
                opacity="0.9"
              />

              {/* WHO Median (Z=0) Line */}
              <polyline
                points={medianPoints}
                fill="none"
                stroke="#15803D"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />

              {/* Y-Axis Grid Lines & Labels */}
              {[4, 8, 12].map((val) => (
                <g key={val}>
                  <line
                    x1={padding.left}
                    y1={getY(val)}
                    x2={chartWidth - padding.right}
                    y2={getY(val)}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 6}
                    y={getY(val) + 4}
                    textAnchor="end"
                    fontSize="9"
                    fill="#718096"
                    fontFamily="monospace"
                  >
                    {val}
                  </text>
                </g>
              ))}

              {/* X-Axis Labels (Months: 0, 6, 12, 18, 24) */}
              {[0, 6, 12, 18, 24].map((m) => (
                <text
                  key={m}
                  x={getX(m)}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#718096"
                  fontFamily="monospace"
                >
                  {m}m
                </text>
              ))}

              {/* Child's Plotted Measurement Curve */}
              <polyline
                points={measurements
                  .map((m) => `${getX(m.ageMonths)},${getY(activeTab === 'weight' ? m.weightKg : (m.heightCm || 50))}`)
                  .join(' ')}
                fill="none"
                stroke="#006B5F"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {measurements.map((m, idx) => {
                const cx = getX(m.ageMonths);
                const val = activeTab === 'weight' ? m.weightKg : (m.heightCm || 50);
                const cy = getY(val);
                const z = activeTab === 'weight'
                  ? calculateWeightForAgeZScore(val, m.ageMonths, gender)
                  : calculateHeightForAgeZScore(val, m.ageMonths, gender);

                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r={idx === measurements.length - 1 ? 6 : 4.5}
                    className="cursor-pointer transition-transform hover:scale-125"
                    fill={idx === measurements.length - 1 ? '#006B5F' : '#FFFFFF'}
                    stroke="#006B5F"
                    strokeWidth="2.5"
                    onMouseEnter={() => setActiveHoverPoint({ val, age: m.ageMonths, z })}
                    onMouseLeave={() => setActiveHoverPoint(null)}
                    onClick={() => setActiveHoverPoint({ val, age: m.ageMonths, z })}
                  />
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#4A5568] pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#F0FDF4] border border-[#BBF7D0]" />
              <span>{isSw ? 'Kawaida (-2 hadi +2 SD)' : 'Normal (-2 to +2 SD)'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#FFFBEB] border border-[#FDE68A]" />
              <span>{isSw ? 'Uzito wa Chini (-2 hadi -3 SD)' : 'Underweight (-2 to -3 SD)'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#006B5F]" />
              <span>{childName}</span>
            </span>
          </div>
        </section>
      )}

      {/* Active Tab View 3: MUAC Strip Gauge */}
      {activeTab === 'muac' && (
        <section
          aria-label={isSw ? 'Kipimo cha MUAC' : 'MUAC Visual Indicator'}
          className="w-full rounded-3xl bg-white border border-[#E2E8F0] p-5 flex flex-col gap-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif text-[#1A202C]">
              {isSw ? 'Mzunguko wa Mkono wa Juu (MUAC Tape)' : 'Mid-Upper Arm Circumference'}
            </h3>
            <StatusBadge status="healthy" label={isSw ? 'Kijani (Afya Bora)' : 'Green (Healthy)'} size="sm" />
          </div>

          <p className="text-xs text-[#4A5568] leading-relaxed">
            {isSw
              ? 'Ukanda wa MUAC unatumika kutambua utapiamlo mkali kwa watoto wenye umri wa miezi 6 au zaidi kulingana na miongozo ya IMAM ya Wizara ya Afya ya Kenya.'
              : 'MUAC screening identifies acute malnutrition in children aged 6 months and older according to Kenya MoH IMAM guidelines.'}
          </p>

          {/* MUACIndicator Component from shared-ui */}
          <div className="py-2">
            <MUACIndicator
              muacCm={latest.muacCm || 13.2}
              ageMonths={latest.ageMonths}
              lang={lang}
            />
          </div>
        </section>
      )}

      {/* Accessible Alternative Data Table */}
      <section
        aria-label={isSw ? 'Jedwali la Rekodi za Makuzi' : 'Growth Records Table'}
        className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-4 flex flex-col gap-3 shadow-xs"
      >
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-[#006B5F]" aria-hidden="true" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A202C]">
            {isSw ? 'Rekodi za Vipimo Vilivyopita' : 'Historical Measurements Table'}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#718096]">
                <th className="py-2 pr-3 font-semibold">{isSw ? 'Tarehe' : 'Date'}</th>
                <th className="py-2 pr-3 font-semibold">{isSw ? 'Umri' : 'Age'}</th>
                <th className="py-2 pr-3 font-semibold">{isSw ? 'Uzito' : 'Weight'}</th>
                <th className="py-2 pr-3 font-semibold">{isSw ? 'Urefu' : 'Length'}</th>
                <th className="py-2 font-semibold">Z-Score</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((row, i) => {
                const z = calculateWeightForAgeZScore(row.weightKg, row.ageMonths, gender);
                return (
                  <tr key={i} className="border-b border-[#F1EFEA] hover:bg-[#F9F8F5]">
                    <td className="py-2.5 pr-3 font-medium text-[#1A202C]">{row.date}</td>
                    <td className="py-2.5 pr-3 text-[#4A5568]">{row.ageMonths}m</td>
                    <td className="py-2.5 pr-3 font-bold text-[#006B5F]">{row.weightKg} kg</td>
                    <td className="py-2.5 pr-3 text-[#4A5568]">{row.heightCm ? `${row.heightCm} cm` : '—'}</td>
                    <td className="py-2.5 text-[#1A202C] font-mono">{z >= 0 ? `+${z}` : z}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* SCR-16 Half-Height Growth Logger Sheet */}
      <SCR16GrowthLoggerSheet
        isOpen={isLogSheetOpen}
        onClose={() => setIsLogSheetOpen(false)}
        onSave={handleSaveMeasurement}
        childAgeMonths={latest.ageMonths}
        gender={gender}
        lang={lang}
      />
    </div>
  );
}
