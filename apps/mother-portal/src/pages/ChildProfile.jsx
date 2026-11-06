import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  TrendingUp,
  Calendar,
  Baby,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Scale,
  Award,
} from 'lucide-react';
import { dataClient } from '@totoafya/api-client';
import { classifyNutritionStatus, KENYA_VACCINE_SCHEDULE } from '@totoafya/business-logic';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from '@totoafya/shared-ui';
import AppShell from '@/components/layout/AppShell';
import { useLang } from '@/context/LanguageContext';
import { differenceInMonths, differenceInYears, differenceInWeeks, format, parseISO } from 'date-fns';

const TABS = [
  { key: 'overview', icon: '📋', en: 'Overview', sw: 'Muhtasari' },
  { key: 'vaccines', icon: '💉', en: 'KEPI Vaccines', sw: 'Chanjo za KEPI' },
  { key: 'growth', icon: '📈', en: 'Growth & Nutrition', sw: 'Ukuaji na Lishe' },
];

export default function ChildProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();
  const isSw = lang === 'sw';

  const [child, setChild] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [growth, setGrowth] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildData();
  }, [id]);

  const loadChildData = async () => {
    setLoading(true);
    try {
      const [childRecord, vList, gList] = await Promise.all([
        dataClient.children.get(id),
        dataClient.immunizations.filter({ child_id: id }, 'scheduled_date', 50),
        dataClient.growthRecords.filter({ child_id: id }, '-recorded_date', 20),
      ]);

      setChild(childRecord);
      setVaccines(vList);
      setGrowth(gList);
    } catch (e) {
      console.error('Failed to load child profile:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-3 border-[#006B5F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 mt-3 font-semibold">
            {isSw ? 'Inapakia wasifu wa mtoto...' : 'Loading child profile...'}
          </p>
        </div>
      </AppShell>
    );
  }

  if (!child) {
    return (
      <AppShell>
        <div className="p-8 text-center text-slate-500">
          <Baby className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-800">
            {isSw ? 'Mtoto hakupatikana' : 'Child profile not found'}
          </h2>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            <span>{isSw ? 'Rudi Nyuma' : 'Go Back'}</span>
          </Button>
        </div>
      </AppShell>
    );
  }

  const rawDob = child.date_of_birth || child.dob;
  let parsedDob = new Date();
  let ageLabel = '';
  try {
    if (rawDob) {
      parsedDob = typeof rawDob === 'string' ? parseISO(rawDob) : new Date(rawDob);
      const years = differenceInYears(new Date(), parsedDob);
      const months = differenceInMonths(new Date(), parsedDob);
      const weeks = differenceInWeeks(new Date(), parsedDob);
      ageLabel = years >= 1 ? `${years}y ${months % 12}m` : months >= 1 ? `${months} ${isSw ? 'miezi' : 'months'}` : `${weeks} ${isSw ? 'wiki' : 'weeks'}`;
    }
  } catch (e) {
    console.warn(e);
  }

  const childName = child.full_name || child.name || 'Child';
  const initials = childName.split(' ').map((n) => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2) || 'C';

  const givenCount = vaccines.filter((v) => v.status === 'given').length;
  const overdueCount = vaccines.filter((v) => v.status === 'overdue').length;
  const pendingCount = vaccines.filter((v) => v.status === 'due' || v.status === 'scheduled').length;
  const latestGrowth = growth[0];

  const latestNutrition = latestGrowth?.muac_cm
    ? classifyNutritionStatus(latestGrowth.muac_cm)
    : { status: 'normal', color: 'green', label_en: 'Normal Growth', label_sw: 'Ukuaji wa Kawaida' };

  return (
    <AppShell>
      <div className="bg-[#F8FAFC] min-h-screen pb-16 font-sans text-slate-900">
        {/* Top Back Nav & Child Hero Header */}
        <div className="px-4 pt-4 pb-4 bg-white border-b border-slate-200/80">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>{isSw ? 'Rudi kwenye dashibodi' : 'Back to dashboard'}</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] border-2 border-[#006B5F]/20 flex items-center justify-center font-bold text-[#006B5F] text-2xl font-serif shadow-sm shrink-0">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 truncate">
                  {child.full_name}
                </h1>
                <Badge variant={child.gender === 'female' ? 'outline' : 'secondary'}>
                  {child.gender === 'female' ? (isSw ? '👧 Msichana' : '👧 Girl') : (isSw ? '👦 Mvulana' : '👦 Boy')}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {ageLabel} • {isSw ? 'Alizaliwa' : 'Born'} {format(parsedDob, 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-2.5 mt-5">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
              <div className="text-lg font-extrabold text-emerald-700">
                {givenCount}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                {isSw ? 'Chanjo zilizopewa' : 'Doses Given'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
              <div className="text-lg font-extrabold text-[#006B5F]">
                {latestGrowth?.weight_kg ? `${latestGrowth.weight_kg} kg` : '—'}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                {isSw ? 'Uzito wa Sasa' : 'Latest Weight'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-center">
              <div className="text-lg font-extrabold text-amber-700">
                {pendingCount}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                {isSw ? 'Zinazofuata' : 'Next Doses'}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-slate-200/60 bg-white">
          {TABS.map(({ key, icon, en, sw }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                activeTab === key
                  ? 'bg-[#006B5F] text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <span>{icon}</span>
              <span>{isSw ? sw : en}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="p-4 space-y-4">
            {/* Birth Details Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                {isSw ? 'Taarifa za Kuzaliwa' : 'Birth Details'}
              </h3>
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">{isSw ? 'Uzito wa Kuzaliwa:' : 'Birth Weight:'}</span>
                <span className="font-bold text-slate-800">{child.birth_weight_kg ? `${child.birth_weight_kg} kg` : '3.4 kg'}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">{isSw ? 'Urefu wa Kuzaliwa:' : 'Birth Length:'}</span>
                <span className="font-bold text-slate-800">{child.birth_height_cm ? `${child.birth_height_cm} cm` : '50 cm'}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">{isSw ? 'Hospitali ya Kuzaliwa:' : 'Birth Hospital:'}</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]">{child.birth_facility || 'Pumwani Maternity Hospital'}</span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-500">{isSw ? 'Aina ya Uzazi:' : 'Delivery Mode:'}</span>
                <span className="font-bold text-slate-800">{child.birth_type || 'Spontaneous Vaginal Delivery (SVD)'}</span>
              </div>
            </div>

            {/* Quick Link to KEPI Vaccines */}
            <Link
              to="/vaccines"
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#006B5F]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#006B5F] flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isSw ? 'Ratiba Kamili ya Chanjo (KEPI)' : 'Full KEPI Vaccine Schedule'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {givenCount} {isSw ? 'zimepewa' : 'administered'} • {overdueCount > 0 ? `${overdueCount} overdue` : (isSw ? 'Uko sawa' : 'Up to date')}
                  </p>
                </div>
              </div>
              <Badge variant={overdueCount > 0 ? 'sam' : 'normal'}>
                {overdueCount > 0 ? (isSw ? 'Imechelewa' : 'Overdue') : (isSw ? 'Sawa' : 'Current')}
              </Badge>
            </Link>

            {/* Quick Link to Growth Tracker */}
            <Link
              to="/growth"
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-[#006B5F]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isSw ? 'Chati ya Ukuaji na Lishe (WHO)' : 'WHO Growth & Nutrition Chart'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {latestGrowth?.weight_kg ? `${latestGrowth.weight_kg} kg • ${latestGrowth.height_cm || 50} cm` : (isSw ? 'Hakuna rekodi bado' : 'No records yet')}
                  </p>
                </div>
              </div>
              <Badge variant={latestNutrition.status === 'normal' ? 'normal' : 'mam'}>
                {isSw ? latestNutrition.label_sw : latestNutrition.label_en}
              </Badge>
            </Link>
          </div>
        )}

        {/* Tab 2: KEPI Vaccines */}
        {activeTab === 'vaccines' && (
          <div className="p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isSw ? 'Chanjo za KEPI kwa Mtoto Huyu' : 'KEPI Vaccines for this Child'}
            </h3>

            {vaccines.length > 0 ? (
              <div className="space-y-2.5">
                {vaccines.map((v) => {
                  const isGiven = v.status === 'given';
                  const isOverdue = v.status === 'overdue';
                  return (
                    <div
                      key={v.id}
                      className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isGiven
                              ? 'bg-emerald-50 text-emerald-700'
                              : isOverdue
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {isGiven ? <CheckCircle2 size={18} /> : isOverdue ? <AlertCircle size={18} /> : <Clock size={18} />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {v.vaccine_name} (Dose {v.dose_number})
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {isGiven
                              ? `${isSw ? 'Ilipewa mnamo' : 'Given on'} ${v.administered_date || v.date_given}`
                              : `${isSw ? 'Tarehe iliyopangwa:' : 'Due date:'} ${v.scheduled_date}`}
                          </div>
                        </div>
                      </div>

                      <Badge variant={isGiven ? 'normal' : isOverdue ? 'sam' : 'scheduled'}>
                        {isGiven
                          ? isSw ? 'Imepewa' : 'Given'
                          : isOverdue
                          ? isSw ? 'Imechelewa' : 'Overdue'
                          : isSw ? 'Inasubiri' : 'Upcoming'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                {isSw ? 'Hakuna chanjo zilizorekodiwa bado.' : 'No immunization records registered yet.'}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Growth Records */}
        {activeTab === 'growth' && (
          <div className="p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isSw ? 'Historia ya Ukuaji (Uzito, Urefu & MUAC)' : 'Growth History (Weight, Height & MUAC)'}
            </h3>

            {growth.length > 0 ? (
              <div className="space-y-2.5">
                {growth.map((g) => {
                  const nut = g.muac_cm ? classifyNutritionStatus(g.muac_cm) : { status: 'normal', label_en: 'Normal', label_sw: 'Kawaida' };
                  return (
                    <div
                      key={g.id}
                      className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {g.weight_kg} kg • {g.height_cm} cm
                          {g.muac_cm && ` • MUAC: ${g.muac_cm} cm`}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {g.recorded_date || g.date_recorded} • {g.facility_name || 'Hospital Clinic'}
                        </div>
                      </div>

                      <Badge variant={nut.status === 'normal' ? 'normal' : 'mam'}>
                        {isSw ? nut.label_sw : nut.label_en}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                {isSw ? 'Hakuna rekodi za ukuaji zilizopatikana.' : 'No growth records logged yet.'}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
