import db from '@/api/totoafyaClient';

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Bell, Sparkles, BookOpen, Shield, TrendingUp, HeartHandshake } from 'lucide-react';

import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import FetalDevelopmentCard from '@/components/home/FetalDevelopmentCard';
import ChildCard from '@/components/home/ChildCard';
import AIAlertBanner from '@/components/home/AIAlertBanner';
import ModeHeader from '@/components/home/ModeHeader';
import QuickActions from '@/components/home/QuickActions';
import EmergencyCallBar from '@/components/shared/EmergencyCallBar';
import { useProfile } from '@/context/ProfileContext';
import { cn } from '@/lib/utils';

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
  const [mother, setMother] = useState(null);
  const [children, setChildren] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [vaccineMap, setVaccineMap] = useState({});
  const [growthMap, setGrowthMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);

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
        <div className="flex items-center justify-between px-4 pt-6 pb-4">
          <div>
            <h1 className="text-[26px] font-extrabold leading-tight text-[#131714]">
              Hello, {mother?.full_name?.split(' ')[0] || 'Amina'} 👋
            </h1>
            <p className="text-[13.5px] text-[#6e7772] font-semibold mt-0.5">
              {lang === 'sw' ? 'Unaendelea vyema sana!' : "You're doing great!"}
            </p>
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

        {/* ── AI Alerts (If any) ── */}
        <AIAlertBanner alerts={alerts} onDismiss={dismissAlert} />

        {/* ── MATERNAL MODE: Pregnancy Progress Banner ── */}
        {isPregnant && !isCaregiverOnly && (
          <FetalDevelopmentCard mother={mother} lang={lang} />
        )}

        {/* ── Today's Recommendation Banner (Screen 04) ── */}
        <div className="mx-4 mb-5">
          <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-4.5 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[11px] font-black text-toto-gray tracking-wider uppercase">
                {lang === 'sw' ? 'PENDEKEZO LA LEO' : "TODAY'S RECOMMENDATION"}
              </p>
              <p className="text-[13.5px] font-bold text-[#131714] mt-1 leading-relaxed">
                {isPregnant 
                  ? (lang === 'sw' ? 'Kunywa maji ya kutosha na upate mapumziko ya kutosha leo.' : 'Drink enough water and get enough rest today.')
                  : (lang === 'sw' ? 'Hakikisha mtoto amelala salama na ana joto la kutosha.' : 'Ensure your baby sleeps in a safe position and is kept warm.')}
              </p>
            </div>
          </div>
        </div>

        {/* ── Upcoming Appointments Card (Screen 04) ── */}
        <div className="mx-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-toto-black">
              {lang === 'sw' ? 'Miadi Inayofuata' : 'Upcoming Appointment'}
            </h3>
            <Link to="/care" className="text-[12px] font-bold text-toto-teal hover:underline">
              {lang === 'sw' ? 'Ona Zote' : 'View All'}
            </Link>
          </div>
          
          <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-4.5 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex items-center justify-between gap-4 hover:border-toto-teal/20 transition-all">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-toto-teal/5 flex items-center justify-center text-toto-teal flex-shrink-0">
                <HeartHandshake size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-[14px] font-extrabold text-[#131714] truncate">
                  {lang === 'sw' ? 'Ziara ya ANC' : 'ANC Visit'}
                </h4>
                <p className="text-[12px] text-[#6e7772] mt-0.5">
                  10 May 2026 • 10:00 AM
                </p>
                <p className="text-[11px] text-toto-light mt-0.5 truncate">
                  {mother?.facility_name || 'Kibera Health Centre'}
                </p>
              </div>
            </div>
            
            <div className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-[11px] font-bold border border-emerald-100 flex-shrink-0">
              {lang === 'sw' ? 'Imethibitishwa' : 'Confirmed'}
            </div>
          </div>
        </div>

        {/* ── Quick Actions Grid (Screen 04) ── */}
        <QuickActions isPregnant={isPregnant && !isCaregiverOnly} caregiverType={caregiverType} lang={lang} />

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
    </AppShell>
  );
}