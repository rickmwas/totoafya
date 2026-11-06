import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Calendar,
  Heart,
  ShieldAlert,
  Sparkles,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Info,
} from 'lucide-react';
import { dataClient } from '@totoafya/api-client';
import {
  calculateGestationalAgeInWeeks,
  calculateEdd,
  DANGER_SIGNS_EN,
  DANGER_SIGNS_SW,
} from '@totoafya/business-logic';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from '@totoafya/shared-ui';
import AppShell from '@/components/layout/AppShell';
import { useLang } from '@/context/LanguageContext';
import { format, parseISO } from 'date-fns';

const PREGNANCY_MILESTONES = [
  { week: 8, label: 'Embryo Formation', labelSw: 'Uundaji wa Kiinitete', fruit: 'Raspberry', fruitSw: 'Tunda Dogo' },
  { week: 12, label: 'End of 1st Trimester', labelSw: 'Mwisho wa Robo ya Kwanza', fruit: 'Lime', fruitSw: 'Ndimu' },
  { week: 16, label: 'Fetal Movements Start', labelSw: 'Mwanzo wa Mateke', fruit: 'Avocado', fruitSw: 'Parachichi' },
  { week: 20, label: 'Anatomy Scan (Halfway)', labelSw: 'Katikati ya Ujauzito', fruit: 'Banana', fruitSw: 'Ndizi' },
  { week: 24, label: 'Viability Milestone', labelSw: 'Mtoto Kuishi Nje', fruit: 'Corn', fruitSw: 'Mahindi' },
  { week: 28, label: 'Start of 3rd Trimester', labelSw: 'Robo ya Tatu ya Ujauzito', fruit: 'Eggplant', fruitSw: 'Bilinganya' },
  { week: 32, label: 'Rapid Brain Growth', labelSw: 'Ukuaji wa Ubongo', fruit: 'Squash', fruitSw: 'Boga' },
  { week: 36, label: 'Full Lungs Maturation', labelSw: 'Mapafu Kukomaa', fruit: 'Papaya', fruitSw: 'Papai' },
  { week: 40, label: 'Full Term Delivery', labelSw: 'Wakati Kamili wa Kujifungua', fruit: 'Watermelon', fruitSw: 'Tikiti Maji' },
];

export default function PregnancyOverview() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const isSw = lang === 'sw';

  const [mother, setMother] = useState(null);
  const [ancVisits, setAncVisits] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(24);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaternalData();
  }, []);

  const loadMaternalData = async () => {
    setLoading(true);
    try {
      const user = await dataClient.auth.me();
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      let m = null;
      if (user.mother_id) {
        m = await dataClient.mothers.get(user.mother_id);
      }
      if (!m) {
        const mothers = await dataClient.mothers.filter({ user_id: user.id });
        if (mothers.length > 0) m = mothers[0];
      }
      if (!m && dataClient.mode === 'mock') {
        const list = await dataClient.mothers.list();
        m = list.find((item) => item.user_id === user.id) || list[0];
      }

      setMother(m);

      if (m?.lmp) {
        const weeks = calculateGestationalAgeInWeeks(m.lmp);
        setCurrentWeek(Math.min(42, Math.max(4, weeks)));
      }

      if (m?.id) {
        const visits = await dataClient.ancVisits.filter({ mother_id: m.id }, '-visit_date', 10);
        setAncVisits(visits);
      }
    } catch (e) {
      console.error('Failed to load maternal pregnancy overview:', e);
    } finally {
      setLoading(false);
    }
  };

  const eddDate = mother?.lmp ? calculateEdd(mother.lmp) : mother?.edd || '2026-11-20';
  const trimester = currentWeek <= 13 ? 1 : currentWeek <= 27 ? 2 : 3;

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-3 border-[#006B5F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 mt-3 font-semibold">
            {isSw ? 'Inapakia rekodi za ujauzito...' : 'Loading pregnancy tracker...'}
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="bg-[#F8FAFC] min-h-screen pb-16 font-sans text-slate-900">
        {/* Header */}
        <div className="px-4 pt-4 pb-4 bg-white border-b border-slate-200/80 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-base font-extrabold text-slate-900">
              {isSw ? 'Safari ya Ujauzito na ANC' : 'Pregnancy & ANC Journey'}
            </h1>
            <Badge variant="secondary">
              {isSw ? `Robo ya ${trimester}` : `Trimester ${trimester}`}
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Gestational Hero Card */}
          <div className="p-6 bg-gradient-to-br from-[#006B5F] to-[#0A2E2B] rounded-3xl text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold text-teal-200 uppercase tracking-widest">
                    {isSw ? 'UMRI WA UJAUZITO' : 'GESTATIONAL AGE'}
                  </span>
                  <div className="text-3xl font-extrabold mt-1 font-serif">
                    {currentWeek} {isSw ? 'Wiki' : 'Weeks'}
                  </div>
                  <p className="text-xs text-teal-100 mt-0.5">
                    {40 - currentWeek > 0
                      ? isSw ? `Zimesalia wiki ${40 - currentWeek} hadi kujifungua` : `${40 - currentWeek} weeks until estimated delivery`
                      : isSw ? 'Uko tayari kujifungua (Full term)' : 'Full term ready for delivery'}
                  </p>
                </div>

                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-teal-200">
                    EDD
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {eddDate}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-5">
                <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C98A2C] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (currentWeek / 40) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-teal-200 mt-1.5 font-bold">
                  <span>Week 0 (Conception)</span>
                  <span>Week 20 (Halfway)</span>
                  <span>Week 40 (Birth)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kenya MOH ANC 8 Contacts Policy Card */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#006B5F]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {isSw ? 'Mwongozo wa Ziara 8 za ANC (Wizara ya Afya)' : 'Kenya MOH 8 ANC Contacts Schedule'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isSw
                ? 'Sera ya Wizara ya Afya inashauri kila mama mjamzito kuhudhuria angalau ziara 8 za kliniki ili kuhakikisha afya ya mama na ukuaji salama wa mtoto.'
                : 'Kenya Ministry of Health guidelines mandate at least 8 focused ANC contacts throughout pregnancy for vital blood pressure monitoring, IFAS supplements, and fetal assessment.'}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block">Contact 1: &lt;12 Weeks</span>
                <span className="text-[11px] text-slate-500">Early booking & baseline vitals</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block">Contact 2: ~20 Weeks</span>
                <span className="text-[11px] text-slate-500">Anomaly ultrasound & quickening</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block">Contact 3: 26 Weeks</span>
                <span className="text-[11px] text-slate-500">Blood sugar & gestational checks</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-800 block">Contact 4–8: 30–40 Wks</span>
                <span className="text-[11px] text-slate-500">Preeclampsia monitoring & birth plan</span>
              </div>
            </div>
          </div>

          {/* Maternal Danger Signs Card */}
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                {isSw ? 'Dalili 7 za Hatari Zinazohitaji Hospitali' : '7 Critical Danger Signs (Immediate Care)'}
              </h3>
            </div>
            <ul className="space-y-1.5 text-xs text-rose-900">
              {(isSw ? DANGER_SIGNS_SW : DANGER_SIGNS_EN).map((sign, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <a
                href={`tel:${mother?.facility_emergency_phone || '1190'}`}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Phone size={14} />
                <span>{isSw ? 'Piga Simu ya Dharura (1190)' : 'Emergency Hotline (1190)'}</span>
              </a>
            </div>
          </div>

          {/* ANC History Card */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              {isSw ? 'Historia ya Ziara za Kliniki (ANC)' : 'Hospital ANC Visit History'}
            </h3>

            {ancVisits.length > 0 ? (
              ancVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Visit #{visit.visit_number} • BP: {visit.bp_systolic}/{visit.bp_diastolic} mmHg
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {visit.visit_date} • Weight: {visit.weight_kg}kg • FHR: {visit.fetal_heart_rate} bpm
                    </div>
                  </div>
                  <Badge variant={visit.danger_signs_present ? 'sam' : 'normal'}>
                    {visit.danger_signs_present ? (isSw ? 'Hatari' : 'Alert') : (isSw ? 'Kawaida' : 'Normal')}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                {isSw ? 'Hakuna ziara zilizorekodiwa bado.' : 'No ANC visits logged yet.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
