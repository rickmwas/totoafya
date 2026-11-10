import React, { useState, useEffect } from 'react';
import {
  X,
  Scale,
  Ruler,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  evaluateChildGrowth,
  calculateWeightForAgeZScore,
  assessMUACNutrition,
} from '@totoafya/business-logic';
import { StatusBadge, PillButton } from '@totoafya/shared-ui';

export function SCR16GrowthLoggerSheet({
  isOpen,
  onClose,
  onSave,
  childAgeMonths = 4,
  gender = 'girl',
  lang = 'en',
  className = '',
}) {
  const isSw = lang === 'sw';

  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [muacCm, setMuacCm] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [weightWarning, setWeightWarning] = useState(null);
  const [muacWarning, setMuacWarning] = useState(null);
  const [nutritionPreview, setNutritionPreview] = useState(null);

  // Real-time plausibility checks & Z-score nutritional preview
  useEffect(() => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm);
    const m = parseFloat(muacCm);

    // 1. Weight Plausibility Check (0.5 kg to 40.0 kg)
    if (!isNaN(w) && (w < 0.5 || w > 40.0)) {
      setWeightWarning(
        isSw
          ? `Uzito wa ${w} kg uko nje ya viwango vya watoto (0.5 - 40 kg). Tafadhali thibitisha usahihi.`
          : `Weight value ${w} kg is outside plausible pediatric bounds (0.5–40 kg). Please verify.`
      );
    } else {
      setWeightWarning(null);
    }

    // 2. MUAC Age Eligibility Check (Kenya MoH IMAM guideline requires >= 6 months)
    if (!isNaN(m) && m > 0) {
      if (childAgeMonths < 6) {
        setMuacWarning(
          isSw
            ? 'Kipimo cha MUAC kinatumika kitabibu kwa watoto wenye umri wa miezi 6 au zaidi pekee.'
            : 'MUAC screening is clinically validated only for infants aged 6 months and older per Kenya MoH IMAM guidelines.'
        );
      } else if (m < 7.0 || m > 25.0) {
        setMuacWarning(
          isSw
            ? `Kipimo cha MUAC cha ${m} cm kiko nje ya viwango vya kawaida (7 - 25 cm).`
            : `MUAC value ${m} cm is outside plausible biological bounds (7–25 cm).`
        );
      } else {
        setMuacWarning(null);
      }
    } else {
      setMuacWarning(null);
    }

    // 3. Instant Nutritional & Z-Score Preview
    if (!isNaN(w) && w >= 0.5 && w <= 40.0) {
      try {
        const preview = evaluateChildGrowth({
          ageMonths: childAgeMonths,
          gender,
          weightKg: w,
          heightCm: !isNaN(h) ? h : undefined,
          muacCm: !isNaN(m) && childAgeMonths >= 6 ? m : undefined,
        });
        setNutritionPreview(preview);
      } catch (err) {
        setNutritionPreview(null);
      }
    } else {
      setNutritionPreview(null);
    }
  }, [weightKg, heightCm, muacCm, childAgeMonths, gender, isSw]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm);
    const m = parseFloat(muacCm);

    if (isNaN(w)) return;

    if (typeof onSave === 'function') {
      onSave({
        date,
        weightKg: w,
        heightCm: !isNaN(h) ? h : null,
        muacCm: !isNaN(m) && childAgeMonths >= 6 ? m : null,
        ageMonths: childAgeMonths,
        nutritionStatus: nutritionPreview?.nutritionStatus || 'NORMAL',
        weightForAgeZ: nutritionPreview?.weightForAgeZ ?? null,
      });
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="growth-logger-title"
      data-testid="scr16-growth-logger-sheet"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
    >
      <div
        className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white border border-[#E2E8F0] p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto text-left ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4F1] flex items-center justify-center text-[#006B5F] shrink-0">
              <Scale className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="growth-logger-title" className="text-base sm:text-lg font-bold font-serif text-[#1A202C]">
                {isSw ? 'Rekodi Vipimo vya Makuzi' : 'Log Child Growth'}
              </h2>
              <span className="text-xs text-[#718096] font-medium">
                {isSw ? `Umri: Miezi ${childAgeMonths}` : `Age: ${childAgeMonths} Months`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isSw ? 'Funga fomu' : 'Close form'}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#718096] hover:bg-[#F1EFEA] transition-all"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Date Picker */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#1A202C]">
              {isSw ? 'Tarehe ya Kupima' : 'Measurement Date'}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-xs text-[#1A202C]"
            />
          </div>

          {/* Weight Input (0.5 to 40.0 kg) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1A202C]">
                {isSw ? 'Uzito (Weight in kg) *' : 'Weight (kg) *'}
              </label>
              <span className="text-[11px] text-[#718096]">0.5 – 40.0 kg</span>
            </div>
            <input
              type="number"
              step="0.01"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="e.g. 6.40"
              required
              aria-label="Weight in kilograms"
              className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-sm font-mono text-[#1A202C] focus:ring-2 focus:ring-[#006B5F]"
            />
            {weightWarning && (
              <span className="text-[11px] font-semibold text-[#DC2626] flex items-center gap-1 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{weightWarning}</span>
              </span>
            )}
          </div>

          {/* Height Input (optional) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1A202C]">
                {isSw ? 'Urefu (Height/Length in cm)' : 'Length / Height (cm)'}
              </label>
              <span className="text-[11px] text-[#718096]">35 – 120 cm</span>
            </div>
            <input
              type="number"
              step="0.1"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="e.g. 62.5"
              aria-label="Height in centimeters"
              className="min-h-[48px] px-3 rounded-xl border border-[#CBD5E1] text-sm font-mono text-[#1A202C]"
            />
          </div>

          {/* MUAC Input (Age >= 6m constraint) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1A202C]">
                {isSw ? 'Kipimo cha Mkono (MUAC in cm)' : 'MUAC (cm)'}
              </label>
              <span className="text-[11px] text-[#718096]">
                {childAgeMonths < 6 ? (isSw ? 'Hutumika miezi 6+' : 'Age >= 6m only') : '7.0 – 25.0 cm'}
              </span>
            </div>
            <input
              type="number"
              step="0.1"
              disabled={childAgeMonths < 6}
              value={childAgeMonths < 6 ? '' : muacCm}
              onChange={(e) => setMuacCm(e.target.value)}
              placeholder={childAgeMonths < 6 ? (isSw ? 'Haitumiki chini ya miezi 6' : 'Eligible at >= 6 months') : 'e.g. 13.2'}
              aria-label="MUAC in centimeters"
              className={`min-h-[48px] px-3 rounded-xl border text-sm font-mono ${
                childAgeMonths < 6
                  ? 'bg-[#F1EFEA] border-[#E2E8F0] text-[#718096] cursor-not-allowed'
                  : 'bg-white border-[#CBD5E1] text-[#1A202C]'
              }`}
            />
            {muacWarning && (
              <span className="text-[11px] font-semibold text-[#B45309] flex items-center gap-1 mt-0.5">
                <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{muacWarning}</span>
              </span>
            )}
          </div>

          {/* Instant Nutritional & Z-Score Preview (<16ms feedback) */}
          {nutritionPreview && (
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col gap-1.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#166534]">
                  {isSw ? 'Tathmini ya Papo Hapo (WHO Preview):' : 'Instant WHO Z-Score Preview:'}
                </span>
                <span className="text-xs font-bold text-[#15803D]">
                  Z = {nutritionPreview.weightForAgeZ >= 0 ? `+${nutritionPreview.weightForAgeZ}` : nutritionPreview.weightForAgeZ}
                </span>
              </div>
              <p className="text-xs text-[#15803D]">
                {isSw ? nutritionPreview.clinicalRecommendationSw : nutritionPreview.clinicalRecommendationEn}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-4 py-2 rounded-full border border-[#E2E8F0] text-xs font-semibold text-[#4A5568]"
            >
              {isSw ? 'Ghairi' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={Boolean(weightWarning)}
              className="min-h-[48px] px-6 py-2 rounded-full bg-[#006B5F] hover:bg-[#004D44] text-white text-xs font-bold active:scale-95 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
              <span>{isSw ? 'Hifadhi Kipimo' : 'Save Measurement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
