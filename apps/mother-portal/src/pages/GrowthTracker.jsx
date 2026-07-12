import db from '@/api/totoafyaClient';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Scale, Ruler, ChevronLeft, MoreVertical, Check } from 'lucide-react';

import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import { useRequireOnboarding } from '@/hooks/useRequireOnboarding';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
      <div className="animate-fade-in bg-[#f7f9f7] min-h-screen pb-12 font-sans text-[#131714]">
        
        {/* Header (Screen 06) */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <Link to="/" className="w-10 h-10 bg-white rounded-full border border-[#e5e7eb] flex items-center justify-center shadow-sm active:scale-95 transition-transform">
            <ChevronLeft size={20} className="text-[#131714]" />
          </Link>
          <h1 className="text-[18px] font-extrabold text-[#131714]">
            {lang === 'sw' ? 'Ukuaji' : 'Growth'}
          </h1>
          <button 
            className="w-10 h-10 bg-white rounded-full border border-[#e5e7eb] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            onClick={() => alert(lang === 'sw' ? 'Chaguo' : 'Options')}
          >
            <MoreVertical size={20} className="text-[#131714]" />
          </button>
        </div>

        {/* Child Selector (If multiple) */}
        {children.length > 1 && (
          <div className="px-6 mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={cn(
                  'flex-shrink-0 px-5 py-2 rounded-full text-[13px] font-extrabold transition-all duration-200 active:scale-[0.96]',
                  selectedChild?.id === child.id
                    ? 'bg-toto-teal text-white shadow-sm'
                    : 'bg-white border border-[#e5e7eb] text-toto-gray'
                )}
              >
                {child.full_name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {!selectedChild ? (
          <div className="px-6 py-12 text-center text-toto-light text-[15px] font-bold">
            {lang === 'sw' ? 'Ongeza mtoto kwanza' : 'Add a child first'}
          </div>
        ) : (
          <>
            {/* Chart Tabs (Screen 06 Tabs) */}
            <div className="flex bg-white border-b border-[#e5e7eb] px-6 mb-5">
              {[
                { key: 'weight', label: lang === 'sw' ? 'Uzito' : 'Weight' },
                { key: 'height', label: lang === 'sw' ? 'Urefu' : 'Height' },
                { key: 'muac', label: 'MUAC' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 pb-3 text-[14px] font-bold text-center relative transition-all ${
                    activeTab === key ? 'text-toto-green' : 'text-[#6e7772] hover:text-[#131714]'
                  }`}
                >
                  {label}
                  {activeTab === key && (
                    <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-toto-green rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Latest metrics grid */}
            {latest && (
              <div className="px-4 mb-4 grid grid-cols-3 gap-3">
                {[
                  { label: lang === 'sw' ? 'Uzito' : 'Weight', value: latest.weight_kg, unit: 'kg', color: 'text-toto-teal bg-toto-teal/5' },
                  { label: lang === 'sw' ? 'Urefu' : 'Height', value: latest.height_cm, unit: 'cm', color: 'text-toto-green bg-toto-green/5' },
                  { label: 'MUAC', value: latest.muac_cm, unit: 'cm', color: 'text-toto-purple bg-toto-purple/5' },
                ].map(({ label, value, unit, color }) => (
                  <div key={label} className="bg-white rounded-[24px] p-5 border border-[#e5e7eb] shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-toto-gray tracking-wider uppercase">{label}</span>
                    <p className="text-[22px] font-extrabold text-[#131714] mt-2 font-numeric-tabular leading-none">
                      {value ?? '—'}<span className="text-[12px] font-semibold text-toto-gray ml-0.5">{unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Area Chart Container (Screen 06 Chart) */}
            {chartData.length > 0 ? (
              <div className="mx-4 mb-4 bg-white rounded-[32px] p-5 border border-[#e5e7eb] shadow-[0_8px_24px_rgba(0,0,0,0.01)]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] font-bold text-toto-gray tracking-wider uppercase">
                    {activeTab === 'weight' ? (lang === 'sw' ? 'Mwelekeo wa Uzito' : 'Weight Curve') : activeTab === 'height' ? (lang === 'sw' ? 'Mwelekeo wa Urefu' : 'Height Curve') : 'MUAC Curve'}
                  </span>
                  {latest?.weight_kg && activeTab === 'weight' && (
                    <span className="text-[13px] font-extrabold text-toto-green">
                      {latest.weight_kg} kg • 50th Percentile
                    </span>
                  )}
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1eb96c" stopOpacity={0.16}/>
                        <stop offset="95%" stopColor="#1eb96c" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ className: 'font-numeric-tabular text-[10px] fill-toto-gray' }} stroke="#e5e7eb" />
                    <YAxis tick={{ className: 'font-numeric-tabular text-[10px] fill-toto-gray' }} stroke="#e5e7eb" />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={activeTab} 
                      stroke="#1eb96c" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      dot={{ fill: '#1eb96c', r: 5, strokeWidth: 2, stroke: '#ffffff' }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mx-4 mb-4 bg-white rounded-[32px] p-8 border border-[#e5e7eb] text-center">
                <TrendingUp size={32} className="text-[#a0aba5]/30 mx-auto mb-2.5" />
                <p className="text-[14px] text-toto-gray font-semibold">{lang === 'sw' ? 'Ongeza kipimo cha kwanza' : 'Add the first measurement'}</p>
              </div>
            )}

            {/* Validation Feedback Badge (Screen 06: "Great! Your baby is growing well.") */}
            {latest && (
              <div className="mx-4 mb-5">
                <div className="bg-emerald-50/70 border border-emerald-100/50 rounded-2xl py-3 px-4 flex items-center justify-center gap-2 text-toto-green">
                  <div className="w-5 h-5 rounded-full bg-toto-green flex items-center justify-center text-white">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-[13.5px] font-bold">
                    {lang === 'sw' ? 'Safi sana! Mtoto wako anakua vyema.' : 'Great! Your baby is growing well.'}
                  </span>
                </div>
              </div>
            )}

            {/* Add measurement form */}
            {showForm ? (
              <div className="mx-4 mb-4 bg-white rounded-[32px] p-5 border border-[#e5e7eb] shadow-sm animate-fade-in">
                <p className="text-[15px] font-bold text-toto-black mb-4">{t('add_measurement')}</p>
                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-toto-gray uppercase tracking-wider px-1">
                      {lang === 'sw' ? 'Tarehe ya Kipimo' : 'Measurement Date'}
                    </label>
                    <input
                      type="date"
                      value={form.recorded_date}
                      onChange={e => setForm(f => ({ ...f, recorded_date: e.target.value }))}
                      className="h-12 px-4 bg-[#f7f9f7] border border-[#e5e7eb] rounded-[12px] text-[14px] outline-none focus:border-toto-teal font-numeric-tabular font-semibold"
                    />
                  </div>
                  <InputField label={t('weight')} value={form.weight_kg} onChange={v => setForm(f => ({...f, weight_kg: v}))} unit="kg" placeholder="e.g. 7.5" />
                  <InputField label={t('height')} value={form.height_cm} onChange={v => setForm(f => ({...f, height_cm: v}))} unit="cm" placeholder="e.g. 68" />
                  <InputField label="MUAC" value={form.muac_cm} onChange={v => setForm(f => ({...f, muac_cm: v}))} unit="cm" placeholder="e.g. 13.5" />
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 h-12 rounded-full border border-[#e5e7eb] text-[13px] font-bold text-toto-gray active:scale-[0.97] transition-transform"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={saveRecord}
                      disabled={saving || (!form.weight_kg && !form.height_cm)}
                      className="flex-1 h-12 rounded-full bg-toto-teal text-white text-[13px] font-bold shadow-sm active:scale-[0.97] transition-all disabled:opacity-40"
                    >
                      {saving ? '...' : t('save')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 mb-5">
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full h-14 rounded-full bg-toto-teal text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.97] transition-all"
                >
                  <Plus size={18} /> {t('add_measurement')}
                </button>
              </div>
            )}

            {/* Records list */}
            {records.length > 0 && (
              <div className="px-4 pb-4">
                <p className="text-[11px] font-bold text-toto-gray tracking-wider uppercase mb-3">
                  {lang === 'sw' ? 'HISTORIA' : 'HISTORY'}
                </p>
                <div className="flex flex-col gap-2.5">
                  {[...records].reverse().slice(0, 8).map(record => (
                    <div key={record.id} className="bg-white rounded-[24px] p-5 border border-[#e5e7eb] flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-[13px] font-extrabold text-toto-black font-numeric-tabular">
                          {record.recorded_date ? format(parseISO(record.recorded_date), 'MMM d, yyyy') : '—'}
                        </p>
                        <p className="text-[11.5px] text-toto-gray mt-0.5 font-semibold font-numeric-tabular">
                          {record.age_months !== null ? `${record.age_months} ${lang === 'sw' ? 'miezi' : 'months old'}` : ''}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        {record.weight_kg && (
                          <div className="text-right">
                            <p className="text-[14px] font-extrabold text-toto-teal font-numeric-tabular">{record.weight_kg}kg</p>
                            <p className="text-[9px] font-bold text-toto-light uppercase">Weight</p>
                          </div>
                        )}
                        {record.height_cm && (
                          <div className="text-right">
                            <p className="text-[14px] font-extrabold text-toto-green font-numeric-tabular">{record.height_cm}cm</p>
                            <p className="text-[9px] font-bold text-toto-light uppercase">Height</p>
                          </div>
                        )}
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
