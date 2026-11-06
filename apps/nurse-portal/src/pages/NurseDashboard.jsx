import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Building2,
  Lock,
  LogOut,
  UserPlus,
  Search,
  Baby,
  Heart,
  Calendar,
  AlertTriangle,
  Activity,
  Syringe,
  Scale,
  Clock,
  ChevronRight,
  ShieldAlert,
  Phone,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { dataClient } from '@totoafya/api-client';
import {
  Button,
  SearchInput,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  SyncStatusBar,
} from '@totoafya/shared-ui';
import { useStation } from '../context/StationContext';
import ANCIntakeModal from '../components/ANCIntakeModal';
import ImmunizationTracker from '../components/ImmunizationTracker';
import GrowthMonitoring from '../components/GrowthMonitoring';
import NewPatientModal from '../components/NewPatientModal';

export default function NurseDashboard({ initialTab = 'summary' }) {
  const navigate = useNavigate();
  const {
    facility,
    station,
    nurse,
    activePatient,
    setActivePatient,
    lockStation,
    lang,
    toggleLanguage,
  } = useStation();

  // Data State
  const [mothers, setMothers] = useState([]);
  const [children, setChildren] = useState([]);
  const [ancVisits, setAncVisits] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [queueFilter, setQueueFilter] = useState('all'); // 'all' | 'anc_due' | 'vaccines_due' | 'high_risk'
  const [activeTab, setActiveTab] = useState(initialTab); // 'summary' | 'anc' | 'immunization' | 'growth'

  // Modals
  const [showAncModal, setShowAncModal] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);

  // Sync State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLiveDb, setIsLiveDb] = useState(dataClient.mode === 'live');
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadStationData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending mutations
    checkPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [facility?.id]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const checkPendingCount = async () => {
    try {
      if (dataClient?.getPendingMutationsCount) {
        const count = await dataClient.getPendingMutationsCount();
        setPendingCount(count);
      }
    } catch {}
  };

  const loadStationData = async () => {
    setLoading(true);
    try {
      const [moms, kids, visits, alertList] = await Promise.all([
        dataClient.mothers.list('-created_at', 100),
        dataClient.children.list('-created_at', 100),
        dataClient.ancVisits.list('-visit_date', 100),
        dataClient.alerts.list('-created_at', 50).catch(() => []),
      ]);

      setMothers(moms);
      setChildren(kids);
      setAncVisits(visits);
      setAlerts(alertList);

      // Auto-select first mother if none selected
      if (!activePatient && moms.length > 0) {
        setActivePatient(moms[0]);
      }
    } catch (err) {
      console.error('Failed to load station clinical data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      if (dataClient?.sync) {
        await dataClient.sync();
      }
      await loadStationData();
      await checkPendingCount();
    } catch (err) {
      console.error('Sync failed', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Associated children for the currently selected patient
  const activeChildren = useMemo(() => {
    if (!activePatient) return [];
    return children.filter((c) => c.mother_id === activePatient.id);
  }, [activePatient, children]);

  // Associated ANC visits for currently selected patient
  const patientAncVisits = useMemo(() => {
    if (!activePatient) return [];
    return ancVisits.filter((v) => v.mother_id === activePatient.id);
  }, [activePatient, ancVisits]);

  // Associated alerts for currently selected patient
  const patientAlerts = useMemo(() => {
    if (!activePatient) return [];
    return alerts.filter((a) => a.mother_id === activePatient.id);
  }, [activePatient, alerts]);

  // Filtered Queue List
  const filteredQueue = useMemo(() => {
    return mothers.filter((mother) => {
      // Search matching
      const matchesSearch = searchQuery
        ? mother.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mother.national_id?.includes(searchQuery) ||
          mother.anc_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mother.phone?.includes(searchQuery)
        : true;

      if (!matchesSearch) return false;

      // Tab filtering
      if (queueFilter === 'high_risk') {
        return mother.risk_level === 'critical' || mother.risk_level === 'high';
      }
      if (queueFilter === 'anc_due') {
        return mother.pregnancy_status === 'pregnant';
      }
      if (queueFilter === 'vaccines_due') {
        const hasChild = children.some((c) => c.mother_id === mother.id);
        return hasChild;
      }
      return true;
    });
  }, [mothers, children, searchQuery, queueFilter]);

  const handleSignOut = async () => {
    if (dataClient?.auth?.logout) {
      await dataClient.auth.logout().catch(() => {});
    }
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col font-sans">
      {/* ── Top Clinical Header Bar ───────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Station Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006B5F] text-white flex items-center justify-center font-bold shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-[#0A0A0A] leading-none">
                  TotoAfya Nurse
                </h1>
                <Badge status="scheduled" size="sm" showDot={false}>
                  {station}
                </Badge>
              </div>
              <p className="text-xs text-[#6B7280] font-medium mt-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#006B5F]" />
                <span>{facility?.name || 'MCH Clinic'} ({facility?.level || 'Level 4'})</span>
              </p>
            </div>
          </div>

          {/* Clinician Pill & Quick Station Actions */}
          <div className="flex items-center gap-2.5">
            {/* Clinician Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="w-6 h-6 rounded-full bg-[#006B5F] text-white flex items-center justify-center font-bold text-[10px]">
                {nurse?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'NR'}
              </div>
              <div className="text-left">
                <p className="font-bold text-[#0A0A0A] leading-tight text-xs">
                  {nurse?.full_name || 'Staff Nurse'}
                </p>
                <p className="text-[10px] text-[#6B7280]">
                  {nurse?.designation || 'Midwife'}
                </p>
              </div>
            </div>

            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="text-xs font-bold text-slate-700 hover:text-[#006B5F] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              {lang === 'en' ? 'Swahili' : 'English'}
            </button>

            {/* New Walk-in Patient Action */}
            <Button
              variant="secondary"
              size="sm"
              icon={UserPlus}
              onClick={() => setShowNewPatientModal(true)}
            >
              + New Patient
            </Button>

            {/* Lock Station */}
            <Button
              variant="outline"
              size="sm"
              icon={Lock}
              onClick={lockStation}
              title="Lock station between consultations"
            >
              Lock
            </Button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sync Status Bar Component from @totoafya/shared-ui */}
        <SyncStatusBar
          isOnline={isOnline}
          isLiveDb={isLiveDb}
          pendingCount={pendingCount}
          isSyncing={isSyncing}
          onSync={handleManualSync}
          lang={lang}
        />
      </header>

      {/* ── Master-Detail Tablet Layout ───────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── Left Pane: Patient Queue (38% width on desktop) ──────── */}
        <aside className="lg:col-span-5 flex flex-col gap-3 min-h-[600px]">
          {/* Search Box */}
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Search patient, ANC#, ID, phone..."
            placeholderSw="Tafuta mgonjwa, ANC#, Kitambulisho..."
            lang={lang}
          />

          {/* Queue Filter Tabs */}
          <div className="flex gap-1 p-1 bg-white rounded-xl border border-slate-200 text-xs font-bold shadow-xs">
            {[
              { key: 'all', label: `All (${mothers.length})` },
              { key: 'anc_due', label: 'ANC Due' },
              { key: 'vaccines_due', label: 'Vaccines' },
              { key: 'high_risk', label: 'High Risk' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setQueueFilter(tab.key)}
                className={`flex-1 py-2 px-2 rounded-lg text-center transition-all ${
                  queueFilter === tab.key
                    ? 'bg-[#006B5F] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Queue List Cards */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 max-h-[calc(100vh-250px)]">
            {filteredQueue.map((mother) => {
              const isSelected = activePatient?.id === mother.id;
              const motherKids = children.filter((c) => c.mother_id === mother.id);
              const isCritical = mother.risk_level === 'critical';

              return (
                <div
                  key={mother.id}
                  onClick={() => setActivePatient(mother)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99] ${
                    isSelected
                      ? 'border-[#006B5F] bg-teal-50/40 shadow-sm ring-1 ring-[#006B5F]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                          isCritical
                            ? 'bg-red-100 text-[#DC2626]'
                            : 'bg-teal-100/70 text-[#006B5F]'
                        }`}
                      >
                        {mother.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'PT'}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#0A0A0A] leading-tight">
                          {mother.full_name}
                        </h3>
                        <p className="text-[11px] text-[#6B7280]">
                          {mother.anc_number ? `ANC: ${mother.anc_number}` : `ID: ${mother.national_id || 'N/A'}`}
                          {mother.phone && ` • ${mother.phone}`}
                        </p>
                      </div>
                    </div>

                    <Badge
                      status={mother.risk_level || 'healthy'}
                      size="sm"
                      showDot={true}
                    />
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="capitalize font-medium flex items-center gap-1">
                      {mother.pregnancy_status === 'pregnant' ? (
                        <>
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          <span>Pregnant {mother.lmp ? `(${mother.edd ? 'Due: ' + mother.edd : ''})` : ''}</span>
                        </>
                      ) : (
                        <>
                          <Baby className="w-3.5 h-3.5 text-[#006B5F]" />
                          <span>{motherKids.length} Infant(s)</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {mother.county || facility?.county || 'Nairobi'}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredQueue.length === 0 && !loading && (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
                <Search className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-bold text-slate-700">No matching patients</p>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust your search or register a walk-in patient.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* ── Right Pane: Active Patient Workspace (62% width) ───── */}
        <main className="lg:col-span-7 flex flex-col gap-4">
          {activePatient ? (
            <>
              {/* Patient Header Dossier Card */}
              <Card className="p-5 border-slate-200 bg-white">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-[#006B5F] flex items-center justify-center font-black text-xl flex-shrink-0">
                      {activePatient.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-xl font-black text-[#0A0A0A] tracking-tight">
                          {activePatient.full_name}
                        </h2>
                        <Badge
                          status={activePatient.risk_level || 'healthy'}
                          size="md"
                        />
                      </div>
                      <p className="text-xs text-[#6B7280] mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>ANC: <strong>{activePatient.anc_number || 'N/A'}</strong></span>
                        <span>National ID: <strong>{activePatient.national_id || 'N/A'}</strong></span>
                        <span>Phone: <strong>{activePatient.phone || 'N/A'}</strong></span>
                        <span>Blood: <strong>{activePatient.blood_group || 'O+'}</strong></span>
                      </p>
                    </div>
                  </div>

                  {/* Quick Clinical Encounter Triggers */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Activity}
                      onClick={() => setShowAncModal(true)}
                    >
                      + ANC Intake
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Syringe}
                      onClick={() => setActiveTab('immunization')}
                    >
                      Vaccines
                    </Button>
                  </div>
                </div>

                {/* Sub-bar with Status Metrics */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Maternal Status</p>
                    <p className="text-xs font-bold text-[#0A0A0A] capitalize mt-0.5">
                      {activePatient.pregnancy_status?.replace('_', ' ') || 'Pregnant'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] uppercase font-bold text-slate-500">ANC Visits</p>
                    <p className="text-xs font-bold text-[#006B5F] mt-0.5">
                      {patientAncVisits.length} Recorded
                    </p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Children Linked</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {activeChildren.length}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Clinical Risk</p>
                    <p className={`text-xs font-bold mt-0.5 uppercase ${
                      activePatient.risk_level === 'critical' ? 'text-[#DC2626]' : 'text-[#006B5F]'
                    }`}>
                      {activePatient.risk_level || 'Low'} Risk
                    </p>
                  </div>
                </div>
              </Card>

              {/* Workstation Tab Bar */}
              <div className="flex gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs font-bold shadow-xs">
                {[
                  { key: 'summary', label: 'Clinical Summary', icon: Stethoscope },
                  { key: 'anc', label: 'ANC Encounters', icon: Heart },
                  { key: 'immunization', label: 'KEPI Vaccines', icon: Syringe },
                  { key: 'growth', label: 'Growth Monitoring', icon: Scale },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`flex-1 py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === t.key
                        ? 'bg-[#006B5F] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab 1: Summary */}
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  {/* Danger Signs Alerts if present */}
                  {patientAlerts.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#DC2626]">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Active Clinical Alerts</span>
                      </div>
                      {patientAlerts.map((al) => (
                        <div key={al.id} className="text-xs text-red-900 bg-white p-2.5 rounded-lg border border-red-200">
                          <strong>{al.title}:</strong> {al.message}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recent ANC Encounters */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent ANC Visits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      {patientAncVisits.slice(0, 3).map((v) => (
                        <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-[#0A0A0A]">Visit {v.visit_number} • {v.visit_date}</p>
                            <p className="text-slate-500 mt-0.5">
                              BP: <strong>{v.blood_pressure_systolic}/{v.blood_pressure_diastolic} mmHg</strong>
                              {v.fetal_heart_rate && ` • FHR: ${v.fetal_heart_rate} bpm`}
                              {v.gestational_age_weeks && ` • ${v.gestational_age_weeks} Weeks`}
                            </p>
                          </div>
                          <Badge
                            status={(v.blood_pressure_systolic >= 140 || v.blood_pressure_diastolic >= 90) ? 'critical' : 'healthy'}
                            size="sm"
                          >
                            {(v.blood_pressure_systolic >= 140 || v.blood_pressure_diastolic >= 90) ? 'Hypertension Alert' : 'Vitals Normal'}
                          </Badge>
                        </div>
                      ))}

                      {patientAncVisits.length === 0 && (
                        <div className="text-center py-6 text-xs text-slate-400">
                          No ANC visits recorded yet. Click "+ ANC Intake" to record first visit.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Registered Infants */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Registered Infants & Children</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      {activeChildren.map((kid) => (
                        <div key={kid.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-[#006B5F] flex items-center justify-center font-bold">
                              <Baby className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-[#0A0A0A]">{kid.full_name}</p>
                              <p className="text-slate-500">
                                DOB: {kid.date_of_birth} • Gender: {kid.gender} • Birth Weight: {kid.birth_weight_kg || '3.2'} kg
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTab('immunization')}
                          >
                            View Vaccines
                          </Button>
                        </div>
                      ))}

                      {activeChildren.length === 0 && (
                        <div className="text-center py-6 text-xs text-slate-400">
                          No infants registered under this mother yet.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tab 2: ANC */}
              {activeTab === 'anc' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0A0A0A]">
                      Antenatal Care Encounter History
                    </h3>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Activity}
                      onClick={() => setShowAncModal(true)}
                    >
                      + Record New Visit
                    </Button>
                  </div>

                  <Card>
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-100">
                        {patientAncVisits.map((visit) => {
                          const isHighBp =
                            visit.blood_pressure_systolic >= 140 ||
                            visit.blood_pressure_diastolic >= 90;

                          return (
                            <div key={visit.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-extrabold text-[#0A0A0A]">
                                      Visit {visit.visit_number}
                                    </h4>
                                    <span className="text-xs text-slate-500 font-mono">
                                      {visit.visit_date}
                                    </span>
                                    {isHighBp && (
                                      <Badge status="critical" size="sm">
                                        Preeclampsia Risk
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-700">
                                    <span>
                                      BP: <strong className={isHighBp ? 'text-red-600 font-black' : 'font-bold'}>
                                        {visit.blood_pressure_systolic}/{visit.blood_pressure_diastolic} mmHg
                                      </strong>
                                    </span>
                                    <span>FHR: <strong>{visit.fetal_heart_rate || '—'} bpm</strong></span>
                                    <span>Weight: <strong>{visit.weight_kg ? `${visit.weight_kg} kg` : '—'}</strong></span>
                                    <span>Fundal: <strong>{visit.fundal_height_cm ? `${visit.fundal_height_cm} cm` : '—'}</strong></span>
                                    <span>Hb: <strong>{visit.haemoglobin ? `${visit.haemoglobin} g/dL` : '—'}</strong></span>
                                    <span>Urine Protein: <strong>{visit.urine_protein || 'Negative'}</strong></span>
                                  </div>

                                  {visit.danger_signs && visit.danger_signs.length > 0 && (
                                    <div className="mt-2.5 flex flex-wrap gap-1">
                                      {visit.danger_signs.map((ds) => (
                                        <span key={ds} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                                          ⚠️ {ds}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {patientAncVisits.length === 0 && (
                          <div className="p-8 text-center text-xs text-slate-400">
                            No visits recorded. Click "+ Record New Visit" above.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Tab 3: Immunization */}
              {activeTab === 'immunization' && (
                <ImmunizationTracker
                  child={activeChildren[0] || null}
                  nurse={nurse}
                  facility={facility}
                  onUpdated={loadStationData}
                />
              )}

              {/* Tab 4: Growth Monitoring */}
              {activeTab === 'growth' && (
                <GrowthMonitoring
                  child={activeChildren[0] || null}
                  nurse={nurse}
                  facility={facility}
                  onUpdated={loadStationData}
                />
              )}
            </>
          ) : (
            <Card className="p-12 text-center text-slate-500 border-slate-200">
              <Stethoscope className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Patient Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Select a patient from the queue on the left or register a walk-in patient above to begin consultation.
              </p>
            </Card>
          )}
        </main>
      </div>

      {/* ── Clinical Modals ────────────────────────────────────────── */}
      {showAncModal && activePatient && (
        <ANCIntakeModal
          patient={activePatient}
          lang={lang}
          onClose={() => setShowAncModal(false)}
          onSaved={loadStationData}
        />
      )}

      {showNewPatientModal && (
        <NewPatientModal
          facility={facility}
          onClose={() => setShowNewPatientModal(false)}
          onCreated={(newMother, newChild) => {
            loadStationData();
            setActivePatient(newMother);
          }}
        />
      )}
    </div>
  );
}
