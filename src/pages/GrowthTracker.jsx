import db from '@/api/base44Client';

import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Scale, Ruler } from 'lucide-react';

import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import { useRequireOnboarding } from '@/hooks/useRequireOnboarding';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
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
    setSaving(false);
  };

  const chartData = records.map(r => ({
    date: r.recorded_date ? format(parseISO(r.recorded_date), 'MMM yy') : '',
    weight: r.weight_kg,
    height: r.height_cm,
    muac: r.muac_cm,
    who: WHO_WEIGHT_MEDIAN[Math.round(r.age_months)] || null,
  }));

  const latest = records[records.length - 1];
  const nutritionStatus = latest?.nutrition_status || 'normal';

  const InputField = ({ label, value, onChange, unit, placeholder }) => (
    <div>
      <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] block mb-2">{label}</label>
      <div className="flex">
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 h-14 px-4 bg-white border border-[#E5E5E5] rounded-l-[16px] text-[15px] font-medium outline-none focus:border-[#0047FF]"
        />
        <div className="h-14 px-4 bg-[#F5F5F7] border border-l-0 border-[#E5E5E5] rounded-r-[16px] flex items-center">
          <span className="text-[13px] text-[#666666] font-medium">{unit}</span>
        </div>
      </div>
    </div>
  );

  if (checkingOnboarding) return null;

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="px-4 pt-14 pb-5">
          <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#A0A0A0] mb-1">
            {lang === 'sw' ? 'MFUATILIAJI' : 'TRACKER'}
          </p>
          <h1 className="text-[32px] font-extrabold leading-none tracking-[-0.03em] text-[#0A0A0A]">
            {t('growth_tracker')}
          </h1>
        </div>

        {/* Child selector */}
        {children.length > 1 && (
          <div className="px-4 mb-4 flex gap-2 overflow-x-auto pb-1">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 active:scale-[0.96]',
                  selectedChild?.id === child.id
                    ? 'bg-[#0047FF] text-white shadow-blue-glow-sm'
                    : 'bg-white border border-[#E5E5E5] text-[#666666]'
                )}
              >
                {child.full_name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {!selectedChild ? (
          <div className="px-4 py-12 text-center text-[#A0A0A0] text-[15px]">
            {lang === 'sw' ? 'Ongeza mtoto kwanza' : 'Add a child first'}
          </div>
        ) : (
          <>
            {/* Latest metrics */}
            {latest && (
              <div className="px-4 mb-4 grid grid-cols-3 gap-2">
                {[
                  { label: t('weight'), value: latest.weight_kg, unit: 'kg', icon: Scale, color: '#0047FF' },
                  { label: t('height'), value: latest.height_cm, unit: 'cm', icon: Ruler, color: '#2E7A5D' },
                  { label: t('muac'), value: latest.muac_cm, unit: 'cm', icon: TrendingUp, color: '#F9A825' },
                ].map(({ label, value, unit, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-[20px] p-3 border border-[#E5E5E5] shadow-card">
                    <Icon size={14} style={{ color }} className="mb-2" />
                    <p className="text-[20px] font-extrabold leading-none text-[#0A0A0A]">{value ?? '—'}</p>
                    <p className="text-[10px] text-[#A0A0A0] mt-0.5">{unit} · {label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Nutrition status */}
            {latest && (
              <div className="px-4 mb-4">
                <div className="bg-white rounded-[20px] p-4 border border-[#E5E5E5] flex items-center justify-between shadow-card">
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] mb-1">
                      {lang === 'sw' ? 'HALI YA LISHE' : 'NUTRITION STATUS'}
                    </p>
                    <p className="text-[16px] font-bold text-[#0A0A0A]">
                      {nutritionStatus === 'normal' ? (lang === 'sw' ? 'Kawaida' : 'Normal') :
                       nutritionStatus === 'mam' ? 'Moderate Malnutrition' :
                       nutritionStatus === 'sam' ? 'Severe Malnutrition' : nutritionStatus}
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
                      ? 'bg-[#0A0A0A] text-white'
                      : 'bg-white border border-[#E5E5E5] text-[#666666]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Chart */}
            {chartData.length > 0 ? (
              <div className="mx-4 mb-4 bg-white rounded-[24px] p-4 border border-[#E5E5E5] shadow-card">
                <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] mb-4">
                  {activeTab === 'weight' ? t('weight') : activeTab === 'height' ? t('height') : t('muac')} {lang === 'sw' ? '— Mwelekeo' : '— Trend'}
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#A0A0A0' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#A0A0A0' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E5E5E5', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey={activeTab} stroke="#0047FF" strokeWidth={2.5} dot={{ fill: '#0047FF', r: 4 }} />
                    {activeTab === 'weight' && (
                      <Line type="monotone" dataKey="who" stroke="#2E7A5D" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="WHO Median" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
                {activeTab === 'weight' && (
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1"><div className="w-4 h-0.5 bg-[#0047FF] rounded" /><span className="text-[10px] text-[#666666]">{lang === 'sw' ? 'Mtoto' : 'Child'}</span></div>
                    <div className="flex items-center gap-1"><div className="w-4 border-t border-dashed border-[#2E7A5D]" /><span className="text-[10px] text-[#666666]">WHO</span></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-4 mb-4 bg-white rounded-[24px] p-8 border border-[#E5E5E5] text-center">
                <TrendingUp size={32} className="text-[#E5E5E5] mx-auto mb-2" />
                <p className="text-[14px] text-[#A0A0A0]">{lang === 'sw' ? 'Ongeza kipimo cha kwanza' : 'Add the first measurement'}</p>
              </div>
            )}

            {/* Add measurement form */}
            {showForm ? (
              <div className="mx-4 mb-4 bg-white rounded-[24px] p-5 border border-[#E5E5E5] shadow-card">
                <p className="text-[14px] font-bold text-[#0A0A0A] mb-4">{t('add_measurement')}</p>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">
                      {lang === 'sw' ? 'Tarehe ya Kipimo' : 'Measurement Date'}
                    </label>
                    <input
                      type="date"
                      value={form.recorded_date}
                      onChange={e => setForm(f => ({ ...f, recorded_date: e.target.value }))}
                      className="h-14 px-4 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[16px] text-[15px] outline-none focus:border-[#0047FF]"
                    />
                  </div>
                  <InputField label={t('weight')} value={form.weight_kg} onChange={v => setForm(f => ({...f, weight_kg: v}))} unit="kg" placeholder="e.g. 7.5" />
                  <InputField label={t('height')} value={form.height_cm} onChange={v => setForm(f => ({...f, height_cm: v}))} unit="cm" placeholder="e.g. 68" />
                  <InputField label={t('muac')} value={form.muac_cm} onChange={v => setForm(f => ({...f, muac_cm: v}))} unit="cm" placeholder="e.g. 13.5" />
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 h-12 rounded-full border border-[#E5E5E5] text-[13px] font-semibold text-[#666666] active:scale-[0.97] transition-transform"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={saveRecord}
                      disabled={saving || (!form.weight_kg && !form.height_cm)}
                      className="flex-1 h-12 rounded-full bg-[#0047FF] text-white text-[13px] font-bold shadow-blue-glow active:scale-[0.97] transition-all disabled:opacity-40"
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
                  className="w-full h-14 rounded-full bg-[#0047FF] text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-blue-glow active:scale-[0.97] transition-all"
                >
                  <Plus size={18} /> {t('add_measurement')}
                </button>
              </div>
            )}

            {/* Records list */}
            {records.length > 0 && (
              <div className="px-4 pb-4">
                <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] mb-3">
                  {lang === 'sw' ? 'HISTORIA' : 'HISTORY'}
                </p>
                <div className="flex flex-col gap-2">
                  {[...records].reverse().slice(0, 8).map(record => (
                    <div key={record.id} className="bg-white rounded-[18px] p-4 border border-[#E5E5E5] flex items-center justify-between shadow-card">
                      <div>
                        <p className="text-[12px] font-bold text-[#0A0A0A]">
                          {record.recorded_date ? format(parseISO(record.recorded_date), 'MMM d, yyyy') : '—'}
                        </p>
                        <p className="text-[11px] text-[#A0A0A0] mt-0.5">
                          {record.age_months !== null ? `${record.age_months}mo` : ''}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        {record.weight_kg && <div className="text-right"><p className="text-[14px] font-bold text-[#0047FF]">{record.weight_kg}kg</p><p className="text-[9px] text-[#A0A0A0]">WEIGHT</p></div>}
                        {record.height_cm && <div className="text-right"><p className="text-[14px] font-bold text-[#2E7A5D]">{record.height_cm}cm</p><p className="text-[9px] text-[#A0A0A0]">HEIGHT</p></div>}
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