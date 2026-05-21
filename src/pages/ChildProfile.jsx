import db from '@/api/base44Client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Shield, TrendingUp, Star, Calendar } from 'lucide-react';

import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import StatusBadge from '@/components/atoms/StatusBadge';
import { differenceInMonths, differenceInYears, differenceInWeeks, format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'overview', icon: '📋', en: 'Overview', sw: 'Muhtasari' },
  { key: 'vaccines', icon: '💉', en: 'Vaccines', sw: 'Chanjo' },
  { key: 'growth', icon: '📈', en: 'Growth', sw: 'Ukuaji' },
  { key: 'milestones', icon: '⭐', en: 'Milestones', sw: 'Hatua' },
];

export default function ChildProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();
  const [child, setChild] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [growth, setGrowth] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    setLoading(true);
    const [kids, v, g, m] = await Promise.all([
      db.entities.Child.filter({ id }, '-created_date', 1),
      db.entities.Immunization.filter({ child_id: id }, 'scheduled_date', 50),
      db.entities.GrowthRecord.filter({ child_id: id }, '-recorded_date', 20),
      db.entities.Milestone.filter({ child_id: id }, 'expected_age_months', 30),
    ]);
    setChild(kids[0] || null);
    setVaccines(v);
    setGrowth(g);
    setMilestones(m);
    setLoading(false);
  };

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#0047FF] border-t-transparent rounded-full animate-spin" />
      </div>
    </AppShell>
  );

  if (!child) return (
    <AppShell>
      <div className="px-4 pt-14 text-center text-[#A0A0A0]">Child not found</div>
    </AppShell>
  );

  const dob = parseISO(child.date_of_birth);
  const years = differenceInYears(new Date(), dob);
  const months = differenceInMonths(new Date(), dob);
  const weeks = differenceInWeeks(new Date(), dob);
  const ageLabel = years >= 1 ? `${years}y ${months % 12}m` : months >= 1 ? `${months} months` : `${weeks} weeks`;
  const initials = child.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const genderColor = child.gender === 'female' ? '#D946A8' : '#0047FF';

  const givenCount = vaccines.filter(v => v.status === 'given').length;
  const overdueCount = vaccines.filter(v => v.status === 'overdue').length;
  const latestGrowth = growth[0];
  const achievedMilestones = milestones.filter(m => m.status === 'achieved').length;

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Hero */}
        <div className="px-4 pt-12 pb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#666666] mb-6 active:scale-[0.97] transition-transform">
            <ArrowLeft size={18} /> <span className="text-[13px] font-medium">Back</span>
          </button>

          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-16 h-16 rounded-[22px] flex-shrink-0 shadow-float overflow-hidden"
              style={{ backgroundColor: child.avatar_url ? 'transparent' : genderColor }}
            >
              {child.avatar_url ? (
                <img src={child.avatar_url} alt={child.full_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-[20px] font-extrabold">{initials}</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-[#0A0A0A]">
                {child.full_name}
              </h1>
              <p className="text-[13px] text-[#A0A0A0]">{ageLabel} · {child.gender === 'male' ? (lang === 'sw' ? 'Mvulana' : 'Boy') : (lang === 'sw' ? 'Msichana' : 'Girl')}</p>
            </div>
            <div className="ml-auto">
              <StatusBadge status={child.health_status || 'healthy'} />
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: lang === 'sw' ? 'Chanjo' : 'Given', value: givenCount, color: '#2E7A5D' },
              { label: lang === 'sw' ? 'Iliyochelewa' : 'Overdue', value: overdueCount, color: overdueCount > 0 ? '#E51010' : '#A0A0A0' },
              { label: lang === 'sw' ? 'Uzito' : 'Weight', value: latestGrowth?.weight_kg ? `${latestGrowth.weight_kg}` : '—', unit: 'kg', color: '#0047FF' },
              { label: lang === 'sw' ? 'Hatua' : 'Steps', value: achievedMilestones, color: '#7C3AED' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="bg-white rounded-[18px] p-3 border border-[#E5E5E5] text-center shadow-card">
                <p className="text-[18px] font-extrabold leading-none mb-1" style={{ color }}>
                  {value}{unit && <span className="text-[10px] font-medium ml-0.5">{unit}</span>}
                </p>
                <p className="text-[9px] text-[#A0A0A0] tracking-wide font-bold uppercase leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-4 overflow-x-auto pb-1 mb-4 no-scrollbar">
          {TABS.map(({ key, icon, en, sw }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[12px] font-semibold transition-all active:scale-[0.96]',
                activeTab === key
                  ? 'bg-[#0A0A0A] text-white'
                  : 'bg-white border border-[#E5E5E5] text-[#666666]'
              )}
            >
              <span>{icon}</span> {lang === 'sw' ? sw : en}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="px-4 flex flex-col gap-3 pb-6">
            <div className="bg-white rounded-[20px] p-5 border border-[#E5E5E5] shadow-card">
              <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] mb-3">
                {lang === 'sw' ? 'MAELEZO YA MTOTO' : 'CHILD DETAILS'}
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { label: lang === 'sw' ? 'Tarehe ya Kuzaliwa' : 'Date of Birth', value: format(dob, 'MMMM d, yyyy') },
                  { label: lang === 'sw' ? 'Uzito wa Kuzaliwa' : 'Birth Weight', value: child.birth_weight_kg ? `${child.birth_weight_kg} kg` : '—' },
                  { label: lang === 'sw' ? 'Urefu wa Kuzaliwa' : 'Birth Height', value: child.birth_height_cm ? `${child.birth_height_cm} cm` : '—' },
                  { label: lang === 'sw' ? 'Aina ya Kuzaa' : 'Birth Type', value: child.birth_type || '—' },
                  { label: lang === 'sw' ? 'Hospitali ya Kuzaliwa' : 'Birth Facility', value: child.birth_facility || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-1">
                    <p className="text-[12px] text-[#A0A0A0] font-medium">{label}</p>
                    <p className="text-[13px] font-semibold text-[#0A0A0A]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/vaccines" className="flex items-center justify-between bg-white rounded-[20px] p-4 border border-[#E5E5E5] shadow-card active:scale-[0.97] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#0047FF]/10 rounded-full flex items-center justify-center">
                  <Shield size={16} className="text-[#0047FF]" />
                </div>
                <p className="text-[14px] font-semibold text-[#0A0A0A]">
                  {lang === 'sw' ? 'Ona Ratiba ya Chanjo' : 'View Vaccine Schedule'}
                </p>
              </div>
              {overdueCount > 0 && <StatusBadge status="overdue" label={`${overdueCount} overdue`} />}
            </Link>
            <Link to="/growth" className="flex items-center justify-between bg-white rounded-[20px] p-4 border border-[#E5E5E5] shadow-card active:scale-[0.97] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#2E7A5D]/10 rounded-full flex items-center justify-center">
                  <TrendingUp size={16} className="text-[#2E7A5D]" />
                </div>
                <p className="text-[14px] font-semibold text-[#0A0A0A]">
                  {lang === 'sw' ? 'Ona Ukuaji' : 'View Growth Chart'}
                </p>
              </div>
              {latestGrowth && <span className="text-[12px] font-bold text-[#2E7A5D]">{latestGrowth.weight_kg}kg</span>}
            </Link>
          </div>
        )}

        {/* Tab: Vaccines summary */}
        {activeTab === 'vaccines' && (
          <div className="px-4 pb-6 flex flex-col gap-2">
            {vaccines.length === 0 ? (
              <div className="bg-white rounded-[20px] p-6 border border-[#E5E5E5] text-center">
                <p className="text-[14px] text-[#A0A0A0]">{lang === 'sw' ? 'Hakuna chanjo bado' : 'No vaccines recorded yet'}</p>
                <Link to="/vaccines" className="mt-3 inline-block text-[13px] font-bold text-[#0047FF]">
                  {lang === 'sw' ? 'Nenda kwa chanjo →' : 'Go to Vaccines →'}
                </Link>
              </div>
            ) : vaccines.map(v => (
              <div key={v.id} className="bg-white rounded-[18px] p-4 border border-[#E5E5E5] flex items-center justify-between shadow-card">
                <div>
                  <p className="text-[13px] font-bold text-[#0A0A0A]">{v.vaccine_name}</p>
                  <p className="text-[11px] text-[#A0A0A0]">{v.scheduled_date}</p>
                </div>
                <StatusBadge status={v.status} />
              </div>
            ))}
          </div>
        )}

        {/* Tab: Growth */}
        {activeTab === 'growth' && (
          <div className="px-4 pb-6 flex flex-col gap-2">
            {growth.length === 0 ? (
              <div className="bg-white rounded-[20px] p-6 border border-[#E5E5E5] text-center">
                <p className="text-[14px] text-[#A0A0A0]">{lang === 'sw' ? 'Hakuna rekodi za ukuaji' : 'No growth records yet'}</p>
                <Link to="/growth" className="mt-3 inline-block text-[13px] font-bold text-[#0047FF]">
                  {lang === 'sw' ? 'Ongeza kipimo →' : 'Add measurement →'}
                </Link>
              </div>
            ) : growth.map(r => (
              <div key={r.id} className="bg-white rounded-[18px] p-4 border border-[#E5E5E5] flex items-center justify-between shadow-card">
                <div>
                  <p className="text-[13px] font-bold text-[#0A0A0A]">
                    {r.recorded_date ? format(parseISO(r.recorded_date), 'MMM d, yyyy') : '—'}
                  </p>
                  <p className="text-[11px] text-[#A0A0A0]">{r.age_months}mo</p>
                </div>
                <div className="flex gap-3">
                  {r.weight_kg && <div className="text-right"><p className="text-[14px] font-bold text-[#0047FF]">{r.weight_kg}kg</p><p className="text-[9px] text-[#A0A0A0]">WEIGHT</p></div>}
                  {r.height_cm && <div className="text-right"><p className="text-[14px] font-bold text-[#2E7A5D]">{r.height_cm}cm</p><p className="text-[9px] text-[#A0A0A0]">HEIGHT</p></div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Milestones */}
        {activeTab === 'milestones' && (
          <div className="px-4 pb-6 flex flex-col gap-2">
            {milestones.length === 0 ? (
              <div className="bg-white rounded-[20px] p-6 border border-[#E5E5E5] text-center">
                <Star size={28} className="text-[#7C3AED]/30 mx-auto mb-2" />
                <p className="text-[14px] text-[#A0A0A0]">{lang === 'sw' ? 'Hakuna hatua bado' : 'No milestones recorded'}</p>
              </div>
            ) : milestones.map(m => (
              <div key={m.id} className={cn('bg-white rounded-[18px] p-4 border flex items-center gap-3 shadow-card', m.status === 'achieved' ? 'border-[#7C3AED]/20 bg-[#7C3AED]/3' : 'border-[#E5E5E5]')}>
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0', m.status === 'achieved' ? 'bg-[#7C3AED]' : 'bg-[#F5F5F7]')}>
                  <Star size={15} className={m.status === 'achieved' ? 'text-white' : 'text-[#A0A0A0]'} fill={m.status === 'achieved' ? 'white' : 'none'} />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-[#0A0A0A]">
                    {lang === 'sw' && m.milestone_name_sw ? m.milestone_name_sw : m.milestone_name}
                  </p>
                  <p className="text-[11px] text-[#A0A0A0]">
                    {m.expected_age_months ? `${lang === 'sw' ? 'Inatarajiwa' : 'Expected'}: ${m.expected_age_months}mo` : ''}
                  </p>
                </div>
                <StatusBadge status={m.status === 'achieved' ? 'achieved' : m.status === 'delayed' ? 'delayed' : 'upcoming'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}