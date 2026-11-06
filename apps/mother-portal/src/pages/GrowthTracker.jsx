import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp,
  Scale,
  Ruler,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Baby,
  Calendar,
  Activity,
} from 'lucide-react';
import { dataClient } from '@totoafya/api-client';
import { classifyNutritionStatus } from '@totoafya/business-logic';
import { Button, Input, Badge, Card, CardHeader, CardTitle, CardContent } from '@totoafya/shared-ui';
import AppShell from '@/components/layout/AppShell';
import { useLang } from '@/context/LanguageContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, differenceInMonths } from 'date-fns';

const WHO_WEIGHT_MEDIAN = {
  0: 3.3,
  1: 4.5,
  2: 5.6,
  3: 6.4,
  4: 7.0,
  5: 7.5,
  6: 7.9,
  7: 8.3,
  8: 8.6,
  9: 8.9,
  10: 9.2,
  11: 9.4,
  12: 9.6,
  18: 10.9,
  24: 12.2,
  36: 14.3,
  48: 16.3,
  60: 18.3,
};

export default function GrowthTracker() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const isSw = lang === 'sw';

  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Growth input state
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [muacCm, setMuacCm] = useState('');
  const [recordedDate, setRecordedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadScopedChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadGrowthRecords(selectedChild.id);
    }
  }, [selectedChild]);

  const loadScopedChildren = async () => {
    setLoading(true);
    try {
      const user = await dataClient.auth.me();
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      let motherId = user.mother_id;
      if (!motherId) {
        const mothers = await dataClient.mothers.filter({ user_id: user.id });
        if (mothers.length > 0) motherId = mothers[0].id;
      }

      let kids = [];
      if (motherId) {
        kids = await dataClient.children.filter({ mother_id: motherId });
      } else if (dataClient.mode === 'mock') {
        const allMothers = await dataClient.mothers.list();
        const demoMother = allMothers[0];
        if (demoMother) kids = await dataClient.children.filter({ mother_id: demoMother.id });
      }

      setChildren(kids);
      if (kids.length > 0) {
        setSelectedChild(kids[0]);
      }
    } catch (e) {
      console.error('Failed to load children for growth:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadGrowthRecords = async (childId) => {
    try {
      const list = await dataClient.growthRecords.filter({ child_id: childId }, 'recorded_date', 50);
      setRecords(list);
    } catch (e) {
      console.warn('Failed to load growth records:', e);
    }
  };

  const handleSaveGrowth = async (e) => {
    if (e) e.preventDefault();
    if (!selectedChild || !weightKg) return;

    setSaving(true);
    try {
      const ageMonths = selectedChild.date_of_birth
        ? differenceInMonths(parseISO(recordedDate), parseISO(selectedChild.date_of_birth))
        : 6;

      const numWeight = parseFloat(weightKg);
      const numHeight = heightCm ? parseFloat(heightCm) : undefined;
      const numMuac = muacCm ? parseFloat(muacCm) : undefined;

      const nut = numMuac ? classifyNutritionStatus(numMuac) : { status: 'normal' };

      await dataClient.growthRecords.create({
        child_id: selectedChild.id,
        weight_kg: numWeight,
        height_cm: numHeight,
        muac_cm: numMuac,
        nutrition_status: nut.status,
        age_months: Math.max(0, ageMonths),
        recorded_date: recordedDate,
        facility_name: selectedChild.birth_facility || 'MCH Clinic',
      });

      await loadGrowthRecords(selectedChild.id);
      setShowAddModal(false);
      setWeightKg('');
      setHeightCm('');
      setMuacCm('');
    } catch (err) {
      console.error('Failed to save growth record:', err);
      alert(isSw ? 'Hitilafu wakati wa kuhifadhi kipimo.' : 'Failed to save growth measurement.');
    } finally {
      setSaving(false);
    }
  };

  const chartData = records.map((r) => {
    const age = Math.round(r.age_months || 0);
    const whoMedian = WHO_WEIGHT_MEDIAN[age] || 6.5;
    return {
      date: r.recorded_date ? format(parseISO(r.recorded_date), 'MMM yy') : '',
      weight: r.weight_kg,
      height: r.height_cm,
      muac: r.muac_cm,
      whoMedian,
    };
  });

  const latest = records[records.length - 1];
  const latestNutrition = latest?.muac_cm
    ? classifyNutritionStatus(latest.muac_cm)
    : { status: 'normal', label_en: 'Normal Nutrition', label_sw: 'Lishe ya Kawaida' };

  return (
    <AppShell>
      <div className="bg-[#F8FAFC] min-h-screen pb-16 font-sans text-slate-900">
        {/* Header */}
        <div className="px-4 pt-4 pb-4 bg-white border-b border-slate-200/80 sticky top-0 z-20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-lg font-extrabold text-slate-900">
                {isSw ? 'Ufuatiliaji wa Ukuaji (WHO)' : 'Child Growth & Nutrition'}
              </h1>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={14} />
              <span>{isSw ? 'Pima Sasa' : 'Log Measure'}</span>
            </Button>
          </div>

          {/* Child Selector */}
          {children.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {children.map((c) => {
                const isSelected = selectedChild?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChild(c)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#006B5F] text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    👶 {c.full_name?.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Latest Assessment Card */}
          {latest && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isSw ? 'KIPIMO CHA HIVI KARIBUNI' : 'LATEST MEASUREMENT'}
                </span>
                <div className="text-xl font-extrabold text-[#006B5F] mt-0.5">
                  {latest.weight_kg} kg {latest.height_cm && `• ${latest.height_cm} cm`}
                </div>
                {latest.muac_cm && (
                  <div className="text-xs text-slate-500 mt-0.5">
                    MUAC: {latest.muac_cm} cm • {latest.recorded_date}
                  </div>
                )}
              </div>
              <Badge variant={latestNutrition.status === 'normal' ? 'normal' : latestNutrition.status === 'mam' ? 'mam' : 'sam'}>
                {isSw ? latestNutrition.label_sw : latestNutrition.label_en}
              </Badge>
            </div>
          )}

          {/* WHO Weight Curve Chart */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {isSw ? 'Chati ya Uzito kulingana na WHO' : 'Weight-for-Age Growth Curve'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isSw ? 'Mstari wa kijani: Mtoto wako | Mstari mweusi: Wastani wa WHO' : 'Teal line: Your Child | Dashed line: WHO Reference Median'}
                </p>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006B5F" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#006B5F" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 1', 'dataMax + 2']} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#006B5F"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#weightGrad)"
                      name={isSw ? 'Uzito (kg)' : 'Weight (kg)'}
                    />
                    <Area
                      type="monotone"
                      dataKey="whoMedian"
                      stroke="#94A3B8"
                      strokeDasharray="4 4"
                      fill="none"
                      name="WHO Median"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-slate-400">
                {isSw ? 'Hakuna data za kuonyesha chati bado.' : 'Log at least one measurement to view the growth chart.'}
              </div>
            )}
          </div>

          {/* Log History */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              {isSw ? 'Historia ya Vipimo' : 'Measurement History'}
            </h3>

            {records.length > 0 ? (
              records.map((r) => {
                const nut = r.muac_cm ? classifyNutritionStatus(r.muac_cm) : { status: 'normal', label_en: 'Normal', label_sw: 'Kawaida' };
                return (
                  <div
                    key={r.id}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {r.weight_kg} kg {r.height_cm && `• ${r.height_cm} cm`}
                        {r.muac_cm && ` • MUAC ${r.muac_cm} cm`}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {r.recorded_date} • {r.facility_name || 'MCH Clinic'}
                      </div>
                    </div>
                    <Badge variant={nut.status === 'normal' ? 'normal' : 'mam'}>
                      {isSw ? nut.label_sw : nut.label_en}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                {isSw ? 'Bado hakuna vipimo vilivyorekodiwa.' : 'No growth measurements logged yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Modal: Add Growth Measurement */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                {isSw ? 'Rekodi Kipimo cha Ukuaji' : 'Log Growth Measurement'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {isSw
                  ? 'Weka uzito, urefu na kipimo cha mkono (MUAC) kilichochukuliwa kliniki:'
                  : 'Enter the weight, height, and MUAC values recorded at your child welfare clinic:'}
              </p>

              <form onSubmit={handleSaveGrowth} className="space-y-3.5">
                <Input
                  label={isSw ? 'Uzito (Kilo / kg)' : 'Weight (kg)'}
                  type="number"
                  step="0.05"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 6.5"
                  required
                />

                <Input
                  label={isSw ? 'Urefu (Sentimita / cm)' : 'Height / Length (cm)'}
                  type="number"
                  step="0.5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 62"
                />

                <Input
                  label={isSw ? 'Kipimo cha Mkono (MUAC cm)' : 'Mid-Upper Arm Circumference (MUAC cm)'}
                  type="number"
                  step="0.1"
                  value={muacCm}
                  onChange={(e) => setMuacCm(e.target.value)}
                  placeholder="e.g. 13.5 (>12.5 cm is Normal)"
                  helperText={isSw ? 'Kijani: >12.5cm | Manjano: 11.5-12.5cm | Nyekundu: <11.5cm' : 'Green: >12.5cm | Amber: 11.5-12.5cm (MAM) | Red: <11.5cm (SAM)'}
                />

                <Input
                  label={isSw ? 'Tarehe ya Kupima' : 'Measurement Date'}
                  type="date"
                  value={recordedDate}
                  onChange={(e) => setRecordedDate(e.target.value)}
                  required
                />

                <div className="flex gap-2.5 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddModal(false)}
                  >
                    {isSw ? 'Ghairi' : 'Cancel'}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={saving}
                  >
                    {saving ? (isSw ? 'Inahifadhi...' : 'Saving...') : (isSw ? 'Hifadhi Kipimo' : 'Save Measurement')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
