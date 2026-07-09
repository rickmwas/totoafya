import db from '@/api/totoafyaClient';

import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Scale, Ruler } from 'lucide-react';

import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import { useRequireOnboarding } from '@/hooks/useRequireOnboarding';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, differenceInMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/atoms/StatusBadge';

// WHO Weight-for-age median references (boys, approximate)
const WHO_WEIGHT_MEDIAN = { 0:3.3,1:4.5,2:5.6,3:6.4,4:7.0,5:7.5,6:7.9,7:8.3,8:8.6,9:8.9,10:9.2,11:9.4,12:9.6,18:10.9,24:12.2,36:14.3,48:16.3,60:18.3 };

export default function GrowthTracker() {
  const { t, lang } = useLang();
  const { loading: checkingOnboarding } = useRequireOnboarding();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('weight');
  const [form, setForm] = useState({ weight_kg: '', height_cm: '', muac_cm: '', recorded_date: new Date().toISOString().split('T')[0] });

  useEffect(() => { loadChildren(); }, []);
  useEffect(() => { if (selectedChild) loadRecords(selectedChild.id); }, [selectedChild]);

  const loadChildren = async () => {
    const kids = await db.entities.Child.list('-created_date', 20);
    setChildren(kids);
    if (kids.length > 0) setSelectedChild(kids[0]);
    setLoading(false);
  };

  const loadRecords = async (childId) => {
    const r = await db.entities.GrowthRecord.filter({ child_id: childId }, 'recorded_date', 50);
    setRecords(r);
  };

  const saveRecord = async () => {
    if (!selectedChild) return;
    setSaving(true);
    try {
      const ageMonths = differenceInMonths(parseISO(form.recorded_date), parseISO(selectedChild.date_of_birth));
      await db.entities.GrowthRecord.create({
        child_id: selectedChild.id,
        ...form,
        weight_kg: parseFloat(form.weight_kg) || null,
        height_cm: parseFloat(form.height_cm) || null,
        muac_cm: parseFloat(form.muac_cm) || null,
        age_months: ageMonths,
      });
      await loadRecords(selectedChild.id);
      setForm({ weight_kg: '', height_cm: '', muac_cm: '', recorded_date: new Date().toISOString().split('T')[0] });
      setShowForm(false);
    } catch (err) {
      console.error("Failed to save growth record:", err);
      alert(lang === 'sw' ? `Imeshindwa kuhifadhi kipimo cha ukuaji: ${err.message || err}` : `Failed to save growth record: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const chartData = records.map(r => {
    const median = WHO_WEIGHT_MEDIAN[Math.round(r.age_months)] || null;
    return {
      date: r.recorded_date ? format(parseISO(r.recorded_date), 'MMM yy') : '',
      weight: r.weight_kg,
      height: r.height_cm,
      muac: r.muac_cm,
      who: median,
      who_plus_2: median ? parseFloat((median * 1.22).toFixed(1)) : null,
      who_minus_2: median ? parseFloat((median * 0.78).toFixed(1)) : null,
      who_plus_3: median ? parseFloat((median * 1.33).toFixed(1)) : null,
      who_minus_3: median ? parseFloat((median * 0.67).toFixed(1)) : null,
    };
  });

  const latest = records[records.length - 1];
  const nutritionStatus = latest?.nutrition_status || 'normal';

  const InputField = ({ label, value, onChange, unit, placeholder }) => (
    <div>
      <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-toto-light block mb-2">{label}</label>
      <div className="flex">
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 h-14 px-4 bg-white border border-toto-surface rounded-l-[16px] text-[15px] font-medium outline-none focus:border-toto-teal transition-all"
        />
        <div className="h-14 px-4 bg-toto-surface border border-l-0 border-toto-surface rounded-r-[16px] flex items-center">
          <span className="text-[13px] text-toto-gray font-medium">{unit}</span>
        </div>
      </div>
    </div>
  );

  if (checkingOnboarding) return null;

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="relative px-4 pt-14 pb-6 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-toto-green opacity-[0.07] blur-2xl pointer-events-none" />
          <div className="absolute top-8 right-10 w-24 h-24 rounded-full bg-toto-teal opacity-[0.04] blur-xl pointer-events-none" />
          <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-toto-teal/60 mb-1.5">
            {lang === 'sw' ? 'MFUATILIAJI' : 'TRACKER'}
          </p>
          <h1 className="font-bold leading-tight text-toto-black text-[34px]" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            {t('growth_tracker')}
          </h1>
        </div>

        {/* Child selector */}
        {children.length > 1 && (
          <div className="px-4 mb-4 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 active:scale-[0.96]',
                  selectedChild?.id === child.id
                    ? 'bg-toto-teal text-white shadow-teal-glow-sm'
                    : 'bg-white border border-toto-surface text-[#666666]'
                )}
              >
                {child.full_name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {!selectedChild ? (
          <div className="px-4 py-12 text-center text-toto-light text-[15px]">
            {lang === 'sw' ? 'Ongeza mtoto kwanza' : 'Add a child first'}
          </div>
        ) : (
          <>
            {/* Latest metrics */}
            {latest && (
              <div className="px-4 mb-4 grid grid-cols-3 gap-2">
                {[
                  { label: t('weight'), value: latest.weight_kg, unit: 'kg', icon: Scale, color: '#006B5F' },
                  { label: t('height'), value: latest.height_cm, unit: 'cm', icon: Ruler, color: '#107C41' },
                  { label: t('muac'), value: latest.muac_cm, unit: 'cm', icon: TrendingUp, color: '#FFB900' },
                ].map(({ label, value, unit, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-[20px] p-3 border border-toto-surface shadow-card">
                    <Icon size={14} style={{ color }} className="mb-2" />
                    <p className="text-[20px] font-extrabold leading-none text-toto-black font-numeric-tabular">{value ?? '—'}</p>
                    <p className="text-[10px] text-toto-light mt-0.5">{unit} · {label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Nutrition status with colored highlights */}
            {latest && (
              <div className="px-4 mb-4 animate-fade-in">
                <div className={cn(
                  "rounded-[20px] p-4 border flex items-center justify-between shadow-card transition-all duration-200",
                  nutritionStatus === 'sam' ? 'bg-toto-red/5 border-toto-red/20 text-toto-red' :
                  nutritionStatus === 'mam' ? 'bg-toto-amber/5 border-toto-amber/20 text-toto-ochre' :
                  'bg-white border-toto-surface text-toto-black'
                )}>
                  <div>
                    <p className={cn(
                      "text-[10px] tracking-[0.15em] uppercase font-bold mb-1",
                      nutritionStatus === 'sam' || nutritionStatus === 'mam' ? 'opacity-80' : 'text-toto-light'
                    )}>
                      {lang === 'sw' ? 'HALI YA LISHE' : 'NUTRITION STATUS'}
                    </p>
                    <p className="text-[16px] font-bold">
                      {nutritionStatus === 'normal' ? (lang === 'sw' ? 'Kawaida' : 'Normal') :
                       nutritionStatus === 'mam' ? 'Moderate Malnutrition (MAM)' :
                       nutritionStatus === 'sam' ? 'Severe Malnutrition (SAM)' : nutritionStatus}
                    </p>
                  </div>
                  <StatusBadge status={nutritionStatus === 'normal' ? 'healthy' : nutritionStatus === 'mam' ? 'monitor' : 'critical'} />
                </div>
              </div>
            )}

            {/* Chart Tabs */}
            <div className="px-4 mb-3 flex gap-2">
              {[
                { key: 'weight', label: t('weight') },
                { key: 'height', label: t('height') },
                { key: 'muac', label: t('muac') },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    'px-4 py-2 rounded-full text-[12px] font-bold transition-all duration-200 active:scale-[0.96]',
                    activeTab === key
                      ? 'bg-toto-black text-white'
                      : 'bg-white border border-toto-surface text-[#666666]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Chart */}
            {chartData.length > 0 ? (
              <div className="mx-4 mb-4 bg-white rounded-[24px] p-4 border border-toto-surface shadow-card">
                <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-toto-light mb-4">
                  {activeTab === 'weight' ? t('weight') : activeTab === 'height' ? t('height') : t('muac')} {lang === 'sw' ? '— Mwelekeo' : '— Trend'}
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F7F5F0" />
                    <XAxis dataKey="date" tick={{ className: 'font-numeric-tabular text-[10px] fill-toto-light' }} />
                    <YAxis tick={{ className: 'font-numeric-tabular text-[10px] fill-toto-light' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E5E5E5', fontSize: '12px' }}
                    />
                    <Line type="linear" dataKey={activeTab} stroke="#006B5F" strokeWidth={2.5} dot={{ fill: '#006B5F', r: 4 }} />
                    {activeTab === 'weight' && (
                      <>
                        <Line type="linear" dataKey="who" stroke="#107C41" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="WHO Median" />
                        <Line type="linear" dataKey="who_plus_3" stroke="#D13438" strokeWidth={1.2} dot={false} name="+3 SD" />
                        <Line type="linear" dataKey="who_plus_2" stroke="#FFB900" strokeWidth={1.2} strokeDasharray="3 3" dot={false} name="+2 SD" />
                        <Line type="linear" dataKey="who_minus_2" stroke="#FFB900" strokeWidth={1.2} strokeDasharray="3 3" dot={false} name="-2 SD" />
                        <Line type="linear" dataKey="who_minus_3" stroke="#D13438" strokeWidth={1.2} dot={false} name="-3 SD" />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
                {activeTab === 'weight' && (
                  <div className="flex flex-wrap items-center gap-3 mt-3 px-1 border-t border-toto-surface pt-2">
                    <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-[#006B5F] rounded" /><span className="text-[9px] font-bold text-toto-gray">{lang === 'sw' ? 'Mimi' : 'Child'}</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 border-t border-dashed border-[#107C41]" /><span className="text-[9px] font-bold text-[#107C41]">WHO Median</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 border-t border-dashed border-[#FFB900]" /><span className="text-[9px] font-bold text-[#FFB900]">{lang === 'sw' ? 'Hatari (±2 SD)' : 'Warning (±2 SD)'}</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 border-t border-[#D13438]" /><span className="text-[9px] font-bold text-[#D13438]">{lang === 'sw' ? 'Dharura (±3 SD)' : 'Critical (±3 SD)'}</span></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-4 mb-4 bg-white rounded-[24px] p-8 border border-toto-surface text-center">
                <TrendingUp size={32} className="text-[#E5E5E5] mx-auto mb-2" />
                <p className="text-[14px] text-toto-light">{lang === 'sw' ? 'Ongeza kipimo cha kwanza' : 'Add the first measurement'}</p>
              </div>
            )}

            {/* Add measurement form */}
            {showForm ? (
              <div className="mx-4 mb-4 bg-white rounded-[24px] p-5 border border-toto-surface shadow-card animate-fade-in">
                <p className="text-[14px] font-bold text-toto-black mb-4">{t('add_measurement')}</p>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-toto-light">
                      {lang === 'sw' ? 'Tarehe ya Kipimo' : 'Measurement Date'}
                    </label>
                    <input
                      type="date"
                      value={form.recorded_date}
                      onChange={e => setForm(f => ({ ...f, recorded_date: e.target.value }))}
                      className="h-14 px-4 bg-toto-surface border border-toto-surface rounded-[16px] text-[15px] outline-none focus:border-toto-teal font-numeric-tabular"
                    />
                  </div>
                  <InputField label={t('weight')} value={form.weight_kg} onChange={v => setForm(f => ({...f, weight_kg: v}))} unit="kg" placeholder="e.g. 7.5" />
                  <InputField label={t('height')} value={form.height_cm} onChange={v => setForm(f => ({...f, height_cm: v}))} unit="cm" placeholder="e.g. 68" />
                  <InputField label={t('muac')} value={form.muac_cm} onChange={v => setForm(f => ({...f, muac_cm: v}))} unit="cm" placeholder="e.g. 13.5" />
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 h-12 rounded-full border border-toto-surface text-[13px] font-semibold text-toto-gray active:scale-[0.97] transition-transform"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={saveRecord}
                      disabled={saving || (!form.weight_kg && !form.height_cm)}
                      className="flex-1 h-12 rounded-full bg-toto-teal text-white text-[13px] font-bold shadow-teal-glow active:scale-[0.97] transition-all disabled:opacity-40"
                    >
                      {saving ? '...' : t('save')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 mb-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full h-14 rounded-full bg-toto-teal text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-teal-glow active:scale-[0.97] transition-all"
                >
                  <Plus size={18} /> {t('add_measurement')}
                </button>
              </div>
            )}

            {/* Records list */}
            {records.length > 0 && (
              <div className="px-4 pb-4">
                <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-toto-light mb-3">
                  {lang === 'sw' ? 'HISTORIA' : 'HISTORY'}
                </p>
                <div className="flex flex-col gap-2">
                  {[...records].reverse().slice(0, 8).map(record => (
                    <div key={record.id} className="bg-white rounded-[18px] p-4 border border-toto-surface flex items-center justify-between shadow-card">
                      <div>
                        <p className="text-[12px] font-bold text-toto-black font-numeric-tabular">
                          {record.recorded_date ? format(parseISO(record.recorded_date), 'MMM d, yyyy') : '—'}
                        </p>
                        <p className="text-[11px] text-toto-light mt-0.5 font-numeric-tabular">
                          {record.age_months !== null ? `${record.age_months}mo` : ''}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        {record.weight_kg && <div className="text-right"><p className="text-[14px] font-bold text-toto-teal font-numeric-tabular">{record.weight_kg}kg</p><p className="text-[9px] text-toto-light">WEIGHT</p></div>}
                        {record.height_cm && <div className="text-right"><p className="text-[14px] font-bold text-toto-green font-numeric-tabular">{record.height_cm}cm</p><p className="text-[9px] text-toto-light">HEIGHT</p></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}