import db from '@/api/totoafyaClient';

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Bell, 
  Sparkles, 
  BookOpen, 
  Shield, 
  TrendingUp, 
  HeartHandshake,
  Activity,
  MessageSquare,
  Footprints,
  AlertTriangle,
  ChevronRight,
  X,
  Phone,
  MapPin
} from 'lucide-react';

import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import FetalDevelopmentCard from '@/components/home/FetalDevelopmentCard';
import ChildCard from '@/components/home/ChildCard';
import AIAlertBanner from '@/components/home/AIAlertBanner';
import ModeHeader from '@/components/home/ModeHeader';
import { useProfile } from '@/context/ProfileContext';
import { cn } from '@/lib/utils';
import PatientChatbot from '@/components/ai/PatientChatbot';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer';

const getGreeting = (lang) => {
  const hour = new Date().getHours();
  if (lang === 'sw') {
    if (hour < 12) return 'Habari za asubuhi';
    if (hour < 17) return 'Habari za mchana';
    return 'Habari za jioni';
  }
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function Home() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const { setProfile } = useProfile();
  
  // Data states
  const [mother, setMother] = useState(null);
  const [children, setChildren] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [vaccineMap, setVaccineMap] = useState({});
  const [growthMap, setGrowthMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);

  // Drawer states
  const [symptomsOpen, setSymptomsOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [kickCounterOpen, setKickCounterOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [initialChatInput, setInitialChatInput] = useState('');
  const [kicksToday, setKicksToday] = useState(10);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await db.auth.me();
      if (currentUser?.role === 'nurse') {
        navigate('/nurse', { replace: true });
        return;
      }

      const [mothers, kids, alertList] = await Promise.all([
        db.entities.Mother.list('-created_date', 1),
        db.entities.Child.list('-created_date', 20),
        db.entities.AIAlert.filter({ is_resolved: false }, '-created_date', 10).catch(() => []),
      ]);
      const m = mothers[0] || null;

      if (!m) {
        navigate('/onboarding', { replace: true });
        return;
      }

      setMother(m);
      setProfile(m);
      setChildren(kids);
      setAlerts(alertList);
      setUnreadCount(alertList.filter(a => !a.is_read).length);

      if (kids.length > 0) {
        const vMap = {};
        const gMap = {};
        await Promise.all(kids.map(async (child) => {
          const [vaccines, growth] = await Promise.all([
            db.entities.Immunization.filter({ child_id: child.id, status: 'due' }, 'scheduled_date', 1),
            db.entities.GrowthRecord.filter({ child_id: child.id }, '-recorded_date', 1),
          ]);
          vMap[child.id] = vaccines[0] || null;
          gMap[child.id] = growth[0] || null;
        }));
        setVaccineMap(vMap);
        setGrowthMap(gMap);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = async (alertId) => {
    await db.entities.AIAlert.update(alertId, { is_read: true });
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const isPregnant = mother?.pregnancy_status === 'pregnant';
  const hasChildren = children.length > 0;
  const caregiverType = mother?.caregiver_type || 'mother';
  const isCaregiverOnly = caregiverType === 'father' || caregiverType === 'guardian';

  const caregiverEmoji = { mother: '👩', father: '👨', guardian: '🧑' }[caregiverType] || '👋';
  const caregiverLabel = {
    mother: lang === 'sw' ? 'Mama' : 'Mum',
    father: lang === 'sw' ? 'Baba' : 'Dad',
    guardian: lang === 'sw' ? 'Mlezi' : 'Guardian',
  }[caregiverType] || '';

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[#1B6B5A] flex items-center justify-center shadow-teal-glow-sm">
            <span className="text-white text-[18px] font-extrabold">T</span>
          </div>
          <div className="w-7 h-7 border-2 border-[#1B6B5A] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-64 gap-4 px-6 text-center">
          <p className="text-[15px] font-bold text-[#0A0A0A]">
            {lang === 'sw' ? 'Hitilafu ya mtandao' : 'Connection error'}
          </p>
          <p className="text-[13px] text-[#A0A0A0]">
            {lang === 'sw' ? 'Hakikisha una mtandao kisha jaribu tena' : 'Check your connection and try again'}
          </p>
          <button onClick={loadData}
            className="h-12 px-8 rounded-full bg-[#1B6B5A] text-white text-[14px] font-bold shadow-teal-glow-sm active:scale-[0.97] transition-transform">
            {lang === 'sw' ? 'Jaribu Tena' : 'Retry'}
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="animate-fade-in bg-[#f7f9f7] min-h-screen pb-12 font-sans text-[#131714]">

        {/* ── Designer Top Bar & Greeting (Screen 04) ── */}
        <div className="flex items-center justify-between px-4 pt-6 pb-4 bg-[#f7f9f7]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006B5F] to-[#008F7E] flex items-center justify-center shadow-[0_4px_12px_rgba(0,107,95,0.15)] flex-shrink-0">
              <svg className="w-5.5 h-5.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] font-black tracking-tight text-toto-black leading-tight">TotoAfya</span>
              <span className="text-[8.5px] font-bold text-toto-gray tracking-wider leading-none">Healthy family, stronger future</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="w-10 h-10 bg-white rounded-full border border-[#e5e7eb] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] active:scale-95 transition-transform relative">
              <Bell size={18} className="text-[#131714]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-toto-red rounded-full border border-white" />
              )}
            </button>
            {/* Profile Avatar Card */}
            <Link to="/more">
              <div className="w-10 h-10 rounded-full border border-[#e5e7eb] overflow-hidden bg-toto-teal/5 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] font-bold text-toto-teal">
                {(mother?.full_name || 'A').charAt(0)}
              </div>
            </Link>
          </div>
        </div>

        {/* Greeting block */}
        <div className="px-4 pt-3 pb-3">
          <h1 className="text-[28px] font-extrabold leading-tight text-[#131714] tracking-tight">
            Hello, {mother?.full_name?.split(' ')[0] || 'Amina'} 👋
          </h1>
          <p className="text-[13.5px] text-[#6e7772] font-semibold mt-0.5">
            {lang === 'sw' ? 'Unaendelea vyema sana!' : "You're doing great!"}
          </p>
        </div>

        {/* ── AI Alerts (If any) ── */}
        <AIAlertBanner alerts={alerts} onDismiss={dismissAlert} />

        {/* ── MATERNAL MODE: Pregnancy Progress Banner ── */}
        {isPregnant && !isCaregiverOnly && (
          <FetalDevelopmentCard mother={mother} lang={lang} />
        )}

        {/* ── Today's Recommendation Banner (Screen 04) ── */}
        <div className="mx-4 mb-5">
          <div className="bg-white border border-[#e5e7eb] rounded-[28px] p-5.5 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex justify-between items-start gap-4 overflow-hidden relative">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-[#E68A00] tracking-widest uppercase">
                {lang === 'sw' ? 'PENDEKEZO LA LEO' : "TODAY'S RECOMMENDATION"}
              </p>
              <p className="text-[14px] font-bold text-[#131714] mt-2 leading-relaxed max-w-[80%]">
                {isPregnant 
                  ? (lang === 'sw' ? 'Kunywa maji ya kutosha na upate mapumziko ya kutosha leo.' : 'Drink enough water and get enough rest today.')
                  : (lang === 'sw' ? 'Hakikisha mtoto amelala salama na ana joto la kutosha.' : 'Ensure your baby sleeps in a safe position and is kept warm.')}
              </p>
            </div>
            
            {/* Minimalist Water Glass Vector overlay on the right */}
            <div className="absolute right-3 bottom-0 w-20 h-24 opacity-80 flex items-end justify-center select-none pointer-events-none">
              <svg className="w-14 h-20 text-[#006B5F]/10" viewBox="0 0 100 150" fill="currentColor">
                <path d="M10 10 L90 10 L80 140 L20 140 Z" fill="none" stroke="currentColor" strokeWidth="6" />
                <path d="M18 120 L82 120 L78 135 L22 135 Z" stroke="none" />
                <path d="M13 50 L87 50 L82 120 L18 120 Z" className="text-[#006B5F]/20" stroke="none" />
                <path d="M85 30 C75 25, 65 35, 75 45 C85 55, 95 40, 85 30 Z" className="text-[#E68A00]/25" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Upcoming Appointments Card (Screen 04) ── */}
        <div className="mx-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-toto-black">
              {lang === 'sw' ? 'Miadi Inayofuata' : 'Upcoming Appointment'}
            </h3>
            <Link to="/care" className="text-[12.5px] font-bold text-toto-teal hover:underline">
              {lang === 'sw' ? 'Ona Zote' : 'View all'}
            </Link>
          </div>
          
          <div className="bg-white border border-[#e5e7eb] rounded-[28px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#E6F4F1] flex items-center justify-center text-[#006B5F] flex-shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="min-w-0">
                <h4 className="text-[15px] font-bold text-[#131714]">
                  {lang === 'sw' ? 'Ziara ya ANC' : 'ANC Visit'}
                </h4>
                <p className="text-[12.5px] text-[#6e7772] mt-0.5">
                  10 May 2026 • 10:00 AM
                </p>
                <p className="text-[11.5px] text-toto-gray mt-0.5 truncate">
                  {mother?.facility_name || 'Kibera Health Centre'}
                </p>
              </div>
            </div>
            
            <div className="rounded-full bg-[#F0FAF5] text-[#107C41] px-3.5 py-1.5 text-[11px] font-bold border border-[#F0FAF5] flex-shrink-0">
              {lang === 'sw' ? 'Imethibitishwa' : 'Confirmed'}
            </div>
          </div>
        </div>

        {/* ── Quick Actions Grid (Screen 04 / Drawer triggers) ── */}
        <div className="mx-4 mb-6">
          <h3 className="text-[15px] font-bold text-toto-black mb-3">
            {lang === 'sw' ? 'Vitendo vya Haraka' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-4 gap-3.5">
            {[
              {
                icon: Activity,
                label: lang === 'sw' ? 'Dalili' : 'Symptoms',
                color: 'bg-[#F0FAF5] text-[#107C41] border-[#107C41]/10',
                onClick: () => setSymptomsOpen(true)
              },
              {
                icon: MessageSquare,
                label: lang === 'sw' ? 'Soga ya AI' : 'AI Chat',
                color: 'bg-[#E6F4F1] text-[#006B5F] border-[#006B5F]/10',
                onClick: () => {
                  setInitialChatInput('');
                  setAiChatOpen(true);
                }
              },
              {
                icon: Footprints,
                label: lang === 'sw' ? 'Mateke' : 'Kick Counter',
                color: 'bg-[#FFFBEB] text-[#E68A00] border-[#E68A00]/10',
                onClick: () => setKickCounterOpen(true)
              },
              {
                icon: AlertTriangle,
                label: lang === 'sw' ? 'Dharura' : 'Emergency',
                color: 'bg-[#FFF5F5] text-[#D13438] border-[#D13438]/10',
                onClick: () => setEmergencyOpen(true)
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-all select-none"
                >
                  <div className={cn("w-14 h-14 rounded-[20px] flex items-center justify-center border shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-colors", item.color)}>
                    <Icon size={21} strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] font-extrabold text-toto-gray text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Promo Banner ── */}
        <div className="mx-4 mb-6">
          <div className="bg-white border border-[#e5e7eb] rounded-[28px] p-5.5 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex justify-between items-center gap-4 relative overflow-hidden">
            <div className="flex-1 z-10">
              <h4 className="text-[17px] font-black text-[#006B5F] leading-snug">
                {lang === 'sw' ? 'Jifunze, jiandae na ujiamini' : 'Learn, prepare and feel confident'}
              </h4>
              <p className="text-[12.5px] text-[#6e7772] font-semibold mt-1.5 leading-relaxed max-w-[85%]">
                {lang === 'sw' ? 'Pata makala na video zilizotayarishwa na wataalamu kwa ajili yako.' : 'Access expert articles and videos made for you.'}
              </p>
              <Link to="/learn" className="inline-flex items-center gap-1.5 bg-[#006B5F] hover:bg-[#005249] text-white px-5 py-2.5 rounded-full text-[12px] font-bold mt-4 shadow-sm active:scale-95 transition-all">
                {lang === 'sw' ? 'Gundua Sasa' : 'Explore Now'} →
              </Link>
            </div>
            
            {/* Styled Illustration representing a pregnant mother */}
            <div className="absolute right-0 bottom-0 w-28 h-32 opacity-70 pointer-events-none select-none flex items-end justify-end">
              <svg className="w-24 h-28 text-[#006B5F]/15" viewBox="0 0 100 120" fill="currentColor">
                <path d="M60 20 C60 10 50 10 50 20 C50 30 60 30 60 20 Z" />
                <path d="M40 30 C50 30 55 40 50 55 C45 70 30 80 40 100 C45 110 65 110 60 120 L20 120 C18 100 25 80 30 60 C35 40 30 30 40 30 Z" />
                <path d="M50 55 C65 60 70 75 55 80 C48 82 45 78 48 76 C55 74 58 68 50 65 Z" className="text-[#E68A00]/25" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Children Section (For childcare mode) ── */}
        {hasChildren && (
          <div className="px-4 mb-4">
            <div className="flex items-center justify-between mb-3 animate-fade-in">
              <h2 className="text-[15px] font-bold text-toto-black">
                {lang === 'sw' ? 'Watoto Wako' : 'Your Children'}
              </h2>
              <Link to="/add-child">
                <button className="flex items-center gap-1 bg-toto-teal text-white px-3 py-1.5 rounded-full text-[11px] font-bold active:scale-[0.95] transition-transform shadow-sm">
                  <Plus size={12} /> {t('add_child')}
                </button>
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {children.map(child => (
                <ChildCard key={child.id} child={child}
                  nextVaccine={vaccineMap[child.id]}
                  lastGrowth={growthMap[child.id]} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Drawer: Symptoms ── */}
      <Drawer open={symptomsOpen} onOpenChange={setSymptomsOpen}>
        <DrawerContent className="max-w-[430px] mx-auto bg-white rounded-t-[32px] px-6 pb-8 pt-4 border-t border-[#e5e7eb] max-h-[85vh] overflow-y-auto">
          <div className="w-12 h-1 bg-[#EBEBEB] rounded-full mx-auto mb-5" />
          <div className="flex justify-between items-center mb-6">
            <div>
              <DrawerTitle className="text-[17px] font-black text-toto-black">
                {lang === 'sw' ? 'Uchunguzi wa Haraka wa Dalili' : 'Quick Symptom Check'}
              </DrawerTitle>
              <DrawerDescription className="text-[12.5px] text-toto-gray font-semibold mt-0.5">
                {lang === 'sw' ? 'Je, unajisikia vipi leo?' : 'How are you feeling today?'}
              </DrawerDescription>
            </div>
            <DrawerClose className="w-8 h-8 rounded-full bg-[#f8faf8] border border-[#e5e7eb] flex items-center justify-center text-toto-gray hover:text-toto-black active:scale-90 transition-all">
              <X size={15} />
            </DrawerClose>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { label: lang === 'sw' ? 'Kuumwa Kichwa' : 'Headache', query: lang === 'sw' ? 'Kuumwa kichwa leo, nifanye nini?' : 'I have a headache today, what should I do?' },
              { label: lang === 'sw' ? 'Kichefuchefu / Kutapika' : 'Nausea / Vomiting', query: lang === 'sw' ? 'Kichefuchefu na kutapika leo, nifanye nini?' : 'I feel nauseous and have been vomiting today, what should I do?' },
              { label: lang === 'sw' ? 'Maumivu ya Mgongo' : 'Back Pain', query: lang === 'sw' ? 'Maumivu makali ya mgongo leo, nifanye nini?' : 'I am experiencing severe back pain today, what should I do?' },
              { label: lang === 'sw' ? 'Kuvimba Miguu' : 'Swelling', query: lang === 'sw' ? 'Kuvimba mikono au miguu leo, nifanye nini?' : 'I noticed swelling in my feet or hands today, what should I do?' },
              { label: lang === 'sw' ? 'Uchovu Mwingi' : 'Fatigue', query: lang === 'sw' ? 'Uchovu mwingi usio wa kawaida leo, nifanye nini?' : 'I am feeling extremely fatigued today, what should I do?' },
              { label: lang === 'sw' ? 'Dalili Nyinginezo' : 'Other Symptoms', query: lang === 'sw' ? 'Nina maswali ya afya...' : 'I have a health concern...' }
            ].map((symptom, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInitialChatInput(symptom.query);
                  setSymptomsOpen(false);
                  setAiChatOpen(true);
                }}
                className="w-full text-left p-4.5 rounded-[20px] border border-[#e5e7eb] bg-[#f8faf8]/40 hover:border-toto-teal hover:bg-toto-teal/5 active:scale-[0.99] transition-all flex items-center justify-between"
              >
                <span className="text-[14px] font-extrabold text-toto-black">{symptom.label}</span>
                <ChevronRight size={16} className="text-toto-light" />
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* ── Drawer: AI Health Assistant ── */}
      <Drawer open={aiChatOpen} onOpenChange={setAiChatOpen}>
        <DrawerContent className="max-w-[430px] mx-auto bg-white rounded-t-[32px] px-6 pb-6 pt-4 border-t border-[#e5e7eb] h-[85vh]">
          <div className="w-12 h-1 bg-[#EBEBEB] rounded-full mx-auto mb-4 flex-shrink-0" />
          <div className="flex justify-between items-center mb-3 flex-shrink-0">
            <div>
              <DrawerTitle className="text-[17px] font-black text-toto-black">
                {lang === 'sw' ? 'Msaidizi wa Afya wa AI' : 'AI Health Assistant'}
              </DrawerTitle>
              <DrawerDescription className="text-[12px] text-toto-gray font-semibold mt-0.5">
                {lang === 'sw' ? 'Uliza maswali yoyote kwa faragha' : 'Ask any questions in confidence'}
              </DrawerDescription>
            </div>
            <DrawerClose className="w-8 h-8 rounded-full bg-[#f8faf8] border border-[#e5e7eb] flex items-center justify-center text-toto-gray hover:text-toto-black active:scale-90 transition-all">
              <X size={15} />
            </DrawerClose>
          </div>

          <div className="flex-1 min-h-0">
            <PatientChatbot
              mother={mother}
              children={children}
              lang={lang}
              className="border-none shadow-none rounded-none h-full bg-white animate-none"
              initialInput={initialChatInput}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* ── Drawer: Kick Counter ── */}
      <Drawer open={kickCounterOpen} onOpenChange={setKickCounterOpen}>
        <DrawerContent className="max-w-[430px] mx-auto bg-white rounded-t-[32px] px-6 pb-8 pt-4 border-t border-[#e5e7eb] max-h-[80vh] overflow-y-auto">
          <div className="w-12 h-1 bg-[#EBEBEB] rounded-full mx-auto mb-5" />
          <div className="flex justify-between items-center mb-6">
            <div>
              <DrawerTitle className="text-[17px] font-black text-toto-black">
                {lang === 'sw' ? 'Saa ya Mateke' : 'Kick Counter'}
              </DrawerTitle>
              <DrawerDescription className="text-[12.5px] text-toto-gray font-semibold mt-0.5">
                {lang === 'sw' ? 'Fuatilia miondoko ya mtoto wako' : "Monitor your baby's movements"}
              </DrawerDescription>
            </div>
            <DrawerClose className="w-8 h-8 rounded-full bg-[#f8faf8] border border-[#e5e7eb] flex items-center justify-center text-toto-gray hover:text-toto-black active:scale-90 transition-all">
              <X size={15} />
            </DrawerClose>
          </div>

          <div className="flex flex-col items-center py-6">
            <p className="text-[12px] font-black text-toto-gray tracking-wider uppercase">
              {lang === 'sw' ? 'MATEKE YA LEO' : "TODAY'S KICKS"}
            </p>
            <h1 className="text-[64px] font-black text-[#E68A00] leading-none mt-2 font-numeric-tabular">
              {kicksToday}
            </h1>
            <p className="text-[13px] text-toto-light mt-1 font-semibold">
              {lang === 'sw' ? 'Lengo la kila siku: Mateke 10' : 'Daily target: 10 kicks'}
            </p>

            {/* Giant Baby Footprint click button */}
            <button
              onClick={() => {
                setKicksToday(k => k + 1);
              }}
              className="w-32 h-32 rounded-full bg-[#FFFBEB] border border-[#FFF3C4] shadow-sm flex items-center justify-center text-[#E68A00] hover:bg-[#FFF3C4] active:scale-[0.93] transition-all my-8 select-none"
            >
              <Footprints size={48} strokeWidth={1.8} />
            </button>

            <p className="text-[13px] text-[#6e7772] text-center font-medium leading-relaxed max-w-[80%] mb-6">
              {lang === 'sw' ? 'Bonyeza nyayo hapo juu kila wakati unapohisi mtoto wako akipiga au kugeuka.' : 'Tap the footprints above every time you feel your baby kick, roll, or flutter.'}
            </p>

            <div className="flex w-full gap-3.5">
              <button
                onClick={() => setKicksToday(0)}
                className="flex-1 h-12 rounded-full border border-[#e5e7eb] text-[13px] font-bold text-toto-gray active:scale-[0.97] transition-all"
              >
                {lang === 'sw' ? 'Weka Sifuri' : 'Reset Count'}
              </button>
              <DrawerClose className="flex-1 h-12 rounded-full bg-[#E68A00] text-white text-[13px] font-bold active:scale-[0.97] transition-all flex items-center justify-center">
                {lang === 'sw' ? 'Maliza' : 'Done'}
              </DrawerClose>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* ── Drawer: Emergency Help ── */}
      <Drawer open={emergencyOpen} onOpenChange={setEmergencyOpen}>
        <DrawerContent className="max-w-[430px] mx-auto bg-white rounded-t-[32px] px-6 pb-8 pt-4 border-t border-[#e5e7eb] max-h-[80vh] overflow-y-auto">
          <div className="w-12 h-1 bg-[#EBEBEB] rounded-full mx-auto mb-5" />
          <div className="flex justify-between items-center mb-6">
            <div>
              <DrawerTitle className="text-[17px] font-black text-toto-red">
                {lang === 'sw' ? 'Usaidizi wa Dharura' : 'Emergency Help'}
              </DrawerTitle>
              <DrawerDescription className="text-[12.5px] text-toto-gray font-semibold mt-0.5">
                {lang === 'sw' ? 'Pata msaada wa matibabu haraka' : 'Get immediate medical assistance'}
              </DrawerDescription>
            </div>
            <DrawerClose className="w-8 h-8 rounded-full bg-[#f8faf8] border border-[#e5e7eb] flex items-center justify-center text-toto-gray hover:text-toto-black active:scale-90 transition-all">
              <X size={15} />
            </DrawerClose>
          </div>

          <div className="flex flex-col items-center py-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-toto-red mb-4">
              <AlertTriangle size={28} />
            </div>

            <p className="text-[13.5px] text-[#6e7772] text-center font-semibold leading-relaxed max-w-[90%] mb-8">
              {lang === 'sw' ? 'Ikiwa hii ni dharura ya matibabu, tafadhali piga simu mara moja kuomba msaada.' : 'If this is a medical emergency, please call for help immediately.'}
            </p>

            <a
              href="tel:1199"
              className="w-28 h-28 rounded-full bg-[#FFF5F5] border border-[#FFE3E3] shadow-md flex flex-col items-center justify-center text-toto-red hover:bg-[#FFE3E3] active:scale-[0.93] transition-all select-none mb-4"
            >
              <Phone size={36} strokeWidth={2} className="animate-bounce" />
            </a>
            
            <p className="text-[18px] font-black text-toto-black">1199</p>
            <p className="text-[11.5px] font-bold text-toto-gray uppercase tracking-wider mt-0.5">
              {lang === 'sw' ? 'Nambari ya Dharura' : 'Call Emergency Hotline'}
            </p>

            <div className="w-full bg-[#f8faf8] border border-[#e5e7eb] rounded-[24px] p-4.5 flex items-center justify-between gap-4 mt-8 hover:border-toto-teal/20 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-toto-teal/5 flex items-center justify-center text-toto-teal">
                  <MapPin size={16} />
                </div>
                <div className="text-left">
                  <h4 className="text-[13px] font-extrabold text-toto-black">
                    {lang === 'sw' ? 'Shiriki Mahali Ulipo' : 'Share My Location'}
                  </h4>
                  <p className="text-[11.5px] text-toto-gray mt-0.5">
                    {lang === 'sw' ? 'Tuma kuratibu zako kwa waokoaji' : 'Send your location details to emergency services'}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-toto-light" />
            </div>

            <DrawerClose className="w-full h-12 rounded-full border border-[#e5e7eb] text-[13px] font-bold text-toto-gray active:scale-[0.97] transition-all mt-8">
              {lang === 'sw' ? 'Ghairi' : 'Cancel'}
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </AppShell>
  );
}