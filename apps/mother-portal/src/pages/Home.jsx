import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Activity,
  MessageSquare,
  Footprints,
  AlertTriangle,
  ChevronRight,
  Phone,
  Plus,
  Heart,
  Calendar,
  ShieldAlert,
  Sparkles,
  Baby,
  RefreshCw,
  X,
  Stethoscope,
} from 'lucide-react';
import { dataClient } from '@totoafya/api-client';
import {
  calculateGestationalAgeInWeeks,
  calculateEdd,
  DANGER_SIGNS_EN,
  DANGER_SIGNS_SW,
} from '@totoafya/business-logic';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, SyncStatusBar } from '@totoafya/shared-ui';
import AppShell from '@/components/layout/AppShell';
import ChildCard from '@/components/home/ChildCard';
import FetalDevelopmentCard from '@/components/home/FetalDevelopmentCard';
import AIAlertBanner from '@/components/home/AIAlertBanner';
import { useLang } from '@/context/LanguageContext';
import { useProfile } from '@/context/ProfileContext';

export default function Home() {
  const { lang, setLang } = useLang();
  const isSw = lang === 'sw';
  const navigate = useNavigate();
  const { setProfile } = useProfile();

  // Primary Data State
  const [mother, setMother] = useState(null);
  const [children, setChildren] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [nextAncVisit, setNextAncVisit] = useState(null);
  const [vaccineMap, setVaccineMap] = useState({});
  const [growthMap, setGrowthMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Drawers
  const [symptomsOpen, setSymptomsOpen] = useState(false);
  const [kickCounterOpen, setKickCounterOpen] = useState(false);
  const [kicksToday, setKicksToday] = useState(10);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  // Sync State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLiveDb, setIsLiveDb] = useState(dataClient.mode === 'live');
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadAuthenticatedMotherData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPendingCount = async () => {
    try {
      if (dataClient.getPendingMutationsCount) {
        const count = await dataClient.getPendingMutationsCount();
        setPendingCount(count);
      }
    } catch {}
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await dataClient.sync();
      await checkPendingCount();
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * CRITICAL SECURITY & DATA PRIVACY FIX:
   * Load mother profile STRICTLY by authenticated user ID or mother_id.
   * Never query Mother.list() and pick index 0.
   */
  const loadAuthenticatedMotherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await dataClient.auth.me();
      if (!currentUser) {
        navigate('/login', { replace: true });
        return;
      }

      if (currentUser.role === 'nurse') {
        navigate('/login', { replace: true });
        return;
      }

      let motherRecord = null;

      // 1. If session has explicit mother_id, get by ID
      if (currentUser.mother_id) {
        motherRecord = await dataClient.mothers.get(currentUser.mother_id);
      }

      // 2. Query by user_id
      if (!motherRecord && currentUser.id) {
        const matching = await dataClient.mothers.filter({ user_id: currentUser.id });
        if (matching.length > 0) motherRecord = matching[0];
      }

      // 3. Query by national_id or anc_number
      if (!motherRecord && (currentUser.national_id || currentUser.anc_number)) {
        const criteria = currentUser.national_id
          ? { national_id: currentUser.national_id }
          : { anc_number: currentUser.anc_number };
        const matching = await dataClient.mothers.filter(criteria);
        if (matching.length > 0) motherRecord = matching[0];
      }

      // 4. In mock mode fallback, look up fixtures safely matching user or default to Amina
      if (!motherRecord && dataClient.mode === 'mock') {
        const allMock = await dataClient.mothers.list();
        motherRecord =
          allMock.find(
            (m) =>
              m.user_id === currentUser.id ||
              m.national_id === currentUser.national_id ||
              m.phone === currentUser.phone
          ) || allMock[0];
      }

      if (!motherRecord) {
        navigate('/onboarding', { replace: true });
        return;
      }

      setMother(motherRecord);
      setProfile(motherRecord);

      // Scoped queries strictly tied to this mother's ID
      const [kids, alertsList, ancVisitsList] = await Promise.all([
        dataClient.children.filter({ mother_id: motherRecord.id }),
        dataClient.alerts
          ? dataClient.alerts.filter({ mother_id: motherRecord.id, is_resolved: false }).catch(() => [])
          : [],
        dataClient.ancVisits
          ? dataClient.ancVisits.filter({ mother_id: motherRecord.id }, '-visit_date', 1).catch(() => [])
          : [],
      ]);

      setChildren(kids);
      setAlerts(alertsList);
      if (ancVisitsList.length > 0) {
        setNextAncVisit(ancVisitsList[0]);
      }

      // Load vaccine & growth records for each child
      if (kids.length > 0) {
        const vMap = {};
        const gMap = {};
        await Promise.all(
          kids.map(async (child) => {
            const [vaccines, growth] = await Promise.all([
              dataClient.immunizations.filter({ child_id: child.id, status: 'due' }, 'scheduled_date', 1),
              dataClient.growthRecords.filter({ child_id: child.id }, '-recorded_date', 1),
            ]);
            vMap[child.id] = vaccines[0] || null;
            gMap[child.id] = growth[0] || null;
          })
        );
        setVaccineMap(vMap);
        setGrowthMap(gMap);
      }
    } catch (err) {
      console.error('Failed to load mother portal data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const isPregnant = mother?.pregnancy_status === 'pregnant';
  const gestationalAge = mother?.lmp ? calculateGestationalAgeInWeeks(mother.lmp) : null;
  const calculatedEdd = mother?.lmp ? calculateEdd(mother.lmp) : mother?.edd;

  const dismissAlert = async (alertId) => {
    if (dataClient.alerts?.update) {
      await dataClient.alerts.update(alertId, { is_read: true, is_resolved: true });
    }
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-[430px] mx-auto p-4 flex flex-col gap-5 animate-pulse bg-[#F8FAFC] min-h-screen">
          <div className="h-14 bg-slate-200 rounded-2xl" />
          <div className="h-44 bg-slate-200 rounded-3xl" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-slate-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-32 bg-slate-200 rounded-3xl" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {isSw ? 'Hitilafu ya kupakia data' : 'Unable to load profile'}
          </h2>
          <p className="text-xs text-slate-500 max-w-[280px]">
            {error.message || (isSw ? 'Hakikisha una mtandao kisha jaribu tena' : 'Check connection and retry')}
          </p>
          <Button variant="primary" onClick={loadAuthenticatedMotherData}>
            {isSw ? 'Jaribu Tena' : 'Retry'}
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="bg-[#F8FAFC] min-h-screen pb-16 font-sans text-slate-900">
        {/* Real-time Network & Outbox Sync Status Bar */}
        <SyncStatusBar
          isOnline={isOnline}
          isLiveDb={isLiveDb}
          pendingCount={pendingCount}
          isSyncing={isSyncing}
          onSync={handleManualSync}
          lang={lang}
        />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 bg-white border-b border-slate-100 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006B5F] to-[#0A2E2B] flex items-center justify-center shadow-sm text-white font-serif font-black text-lg">
              T
            </div>
            <div>
              <span className="text-sm font-extrabold text-[#006B5F] tracking-tight block leading-none">
                TotoAfya
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {isSw ? 'Afya ya Mama na Mtoto' : 'Maternal & Child Health'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(isSw ? 'en' : 'sw')}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isSw ? '🇰🇪 SW' : '🇬🇧 EN'}
            </button>

            {/* Profile Avatar */}
            <Link to="/more">
              <div className="w-9 h-9 rounded-full bg-[#E6F4F1] border border-[#006B5F]/20 flex items-center justify-center font-bold text-[#006B5F] text-sm">
                {(mother?.full_name || 'M').charAt(0)}
              </div>
            </Link>
          </div>
        </div>

        {/* Greeting & Subtitle */}
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-[22px] font-extrabold text-slate-900 leading-tight">
            {isSw ? 'Habari' : 'Hello'}, {mother?.full_name?.split(' ')[0] || 'Mama'} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSw
              ? 'Karibu kwenye kituo chako cha afya ya kidijitali'
              : 'Welcome to your personalized healthcare portal'}
          </p>
        </div>

        {/* Alerts Banner */}
        {alerts.length > 0 && <AIAlertBanner alerts={alerts} onDismiss={dismissAlert} />}

        {/* MATERNAL MODE: Pregnancy Progress Banner */}
        {isPregnant && (
          <div className="px-4 mb-4">
            <FetalDevelopmentCard mother={mother} lang={lang} />
          </div>
        )}

        {/* Quick Actions (Symptoms, AI Assistant, Kick Counter, Emergency) */}
        <div className="px-4 mb-4">
          <div className="grid grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => setSymptomsOpen(true)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#006B5F] flex items-center justify-center">
                <Activity size={22} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                {isSw ? 'Dalili' : 'Symptoms'}
              </span>
            </button>

            <Link
              to="/ai-health"
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <MessageSquare size={22} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                {isSw ? 'Soga ya AI' : 'AI Health'}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setKickCounterOpen(true)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Footprints size={22} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                {isSw ? 'Mateke' : 'Kicks'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setEmergencyOpen(true)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle size={22} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                {isSw ? 'Dharura' : 'Emergency'}
              </span>
            </button>
          </div>
        </div>

        {/* Kenya MOH Danger Signs Alert Banner */}
        <div className="px-4 mb-4">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                {isSw ? 'Dalili za Hatari (Wizara ya Afya)' : 'Kenya MOH Maternal Danger Signs'}
              </h4>
              <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                {isSw
                  ? 'Ukipata maumivu makali ya tumbo, homa kali, kuvuja damu, au mtoto kuacha kucheza, piga simu ya dharura au tembelea kituo cha afya mara moja.'
                  : 'Severe headache, blurred vision, bleeding, high fever, or reduced fetal movement require immediate hospital assessment.'}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <a
                  href={`tel:${mother?.facility_emergency_phone || '1190'}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  <Phone size={13} />
                  <span>{isSw ? 'Piga Simu ya Dharura (1190)' : 'Call Emergency Hotline (1190)'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments Card */}
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isSw ? 'Miadi Inayofuata Kliniki' : 'Next Clinic Appointment'}
            </h3>
            <Link to="/care" className="text-xs font-bold text-[#006B5F] hover:underline">
              {isSw ? 'Tazama yote' : 'View all'}
            </Link>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#006B5F] flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {isPregnant
                    ? isSw ? 'Kliniki ya Wajawazito (ANC Contact)' : 'Antenatal Care Visit'
                    : isSw ? 'Chanjo na Ukuaji wa Mtoto' : 'Immunization & Growth Checkup'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {nextAncVisit?.next_visit_date || calculatedEdd || '2026-05-15'} • 09:00 AM
                </p>
                <p className="text-[11px] font-medium text-[#006B5F] mt-0.5">
                  {mother?.facility_name || 'Pumwani Maternity Hospital'}
                </p>
              </div>
            </div>
            <Badge variant="scheduled">
              {isSw ? 'Imepangwa' : 'Scheduled'}
            </Badge>
          </div>
        </div>

        {/* Children Overview Section */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isSw ? 'Watoto Wako' : 'Your Children'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {children.length} {children.length === 1 ? (isSw ? 'mtoto aliyesajiliwa' : 'registered child') : (isSw ? 'watoto waliosajiliwa' : 'registered children')}
              </p>
            </div>
            <Link
              to="/add-child"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E6F4F1] hover:bg-[#D5EDE8] text-[#006B5F] text-xs font-bold transition-colors"
            >
              <Plus size={14} />
              <span>{isSw ? 'Ongeza Mtoto' : 'Add Child'}</span>
            </Link>
          </div>

          {children.length > 0 ? (
            <div className="space-y-3">
              {children.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  nextVaccine={vaccineMap[child.id]}
                  lastGrowth={growthMap[child.id]}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center">
              <Baby className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">
                {isSw ? 'Bado hujasajili mtoto' : 'No children registered yet'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 mb-3">
                {isSw
                  ? 'Sajili mtoto wako ili kuanza kufuatilia chanjo na uzito'
                  : 'Register your newborn to track growth and the KEPI immunization schedule'}
              </p>
              <Link to="/add-child">
                <Button variant="outline" size="sm">
                  {isSw ? 'Sajili Mtoto Sasa' : 'Register Child Now'}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Kick Counter Modal */}
        {kickCounterOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-4 sm:hidden" />
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <Footprints size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isSw ? 'Kipimo cha Mateke ya Mtoto' : 'Fetal Kick Counter'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-6 max-w-[280px]">
                {isSw
                  ? 'Kiwango cha kawaida ni angalau mateke 10 ndani ya masaa 2 ukiwa umepumzika.'
                  : 'Under WHO guidelines, count at least 10 kicks or movements within a 2-hour resting window.'}
              </p>

              <div className="text-5xl font-extrabold text-[#006B5F] font-serif mb-6">
                {kicksToday}
              </div>

              <div className="flex gap-3 w-full mb-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={() => setKicksToday((k) => k + 1)}
                >
                  <Plus size={18} />
                  <span>{isSw ? 'Nimesikia Teke (+1)' : 'Record Kick (+1)'}</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setKicksToday(0)}
                >
                  {isSw ? 'Weka Upya' : 'Reset'}
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setKickCounterOpen(false)}
                className="w-full"
              >
                {isSw ? 'Funga' : 'Close'}
              </Button>
            </div>
          </div>
        )}

        {/* Symptoms Screening Modal */}
        {symptomsOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#006B5F]" />
                  <span>{isSw ? 'Uchunguzi wa Dalili' : 'Symptom Triage'}</span>
                </h3>
                <button
                  onClick={() => setSymptomsOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                {isSw
                  ? 'Chagua dalili unazohisi kwa sasa ili upate ushauri wa haraka kulingana na miongozo ya Wizara ya Afya:'
                  : 'Select any symptoms you are currently experiencing for guided clinical triage:'}
              </p>

              <div className="space-y-2 mb-6">
                {(isSw ? DANGER_SIGNS_SW : DANGER_SIGNS_EN).map((sign, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-rose-100 bg-rose-50/60 flex items-start gap-2.5 text-xs text-rose-900"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{sign}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2.5">
                <Link
                  to="/ai-health"
                  className="w-full"
                  onClick={() => setSymptomsOpen(false)}
                >
                  <Button variant="primary" size="lg" className="w-full">
                    <MessageSquare size={16} />
                    <span>{isSw ? 'Zungumza na Msaidizi wa AI' : 'Consult AI Health Assistant'}</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setSymptomsOpen(false)}
                >
                  {isSw ? 'Sina Dalili za Hatari' : 'No Danger Signs Present'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Modal */}
        {emergencyOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {isSw ? 'Msaada wa Dharura' : 'Emergency Assistance'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 mb-6 leading-relaxed">
                {isSw
                  ? 'Ukikumbana na dharura ya kiafya, piga simu mara moja au fika kwenye kituo chako cha afya kilichosajiliwa.'
                  : 'For acute maternal or newborn emergencies, dial immediately or proceed to your registered hospital.'}
              </p>

              <div className="space-y-3 mb-6">
                <a
                  href="tel:1190"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <Phone size={18} />
                    <span>{isSw ? 'Nambari ya Dharura ya Kitaifa' : 'National Health Hotline'}</span>
                  </div>
                  <span className="font-mono text-base">1190</span>
                </a>

                <a
                  href={`tel:${mother?.facility_emergency_phone || mother?.facility_phone || '+254202223344'}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Stethoscope size={18} className="text-[#006B5F]" />
                    <span className="truncate max-w-[200px]">
                      {mother?.facility_name || 'Hospital MCH Wing'}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-600">
                    {mother?.facility_emergency_phone || 'Call'}
                  </span>
                </a>
              </div>

              <Button
                variant="ghost"
                size="md"
                onClick={() => setEmergencyOpen(false)}
                className="w-full"
              >
                {isSw ? 'Funga' : 'Dismiss'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
