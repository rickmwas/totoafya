import db from '@/api/base44Client';

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
          <div className="w-12 h-12 rounded-[16px] bg-[#0047FF] flex items-center justify-center shadow-blue-glow-sm">
            <span className="text-white text-[18px] font-extrabold">T</span>
          </div>
          <div className="w-7 h-7 border-2 border-[#0047FF] border-t-transparent rounded-full animate-spin" />
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
            className="h-12 px-8 rounded-full bg-[#0047FF] text-white text-[14px] font-bold shadow-blue-glow-sm active:scale-[0.97] transition-transform">
            {lang === 'sw' ? 'Jaribu Tena' : 'Retry'}
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="animate-fade-in">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-4 pt-14 pb-5">
          <div>
            <p className="text-[11px] tracking-[0.12em] font-semibold text-[#A0A0A0] mb-1.5">
              {getGreeting(lang)}
            </p>
            <h1 className="text-[34px] font-extrabold leading-none tracking-[-0.03em] text-[#0A0A0A]">
              {mother?.full_name?.split(' ')[0] || caregiverLabel}
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Link to="/ai-health">
              <div className="w-11 h-11 bg-[#0047FF] rounded-full flex items-center justify-center active:scale-[0.92] transition-transform shadow-blue-glow-sm">
                <Sparkles size={17} className="text-white" />
              </div>
            </Link>
            <button className="relative w-11 h-11 bg-white rounded-full border border-[#EBEBEB] flex items-center justify-center active:scale-[0.92] transition-transform shadow-card">
              <Bell size={17} className="text-[#0A0A0A]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#E51010] rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Mode Header Badge ── */}
        <ModeHeader mother={mother} childCount={children.length} lang={lang} />

        {/* ── AI Alerts ── */}
        <AIAlertBanner alerts={alerts} onDismiss={dismissAlert} />

        {/* ── MATERNAL MODE: Pregnancy Banner + Stats ── */}
        {isPregnant && !isCaregiverOnly && (
          <>
            <FetalDevelopmentCard mother={mother} lang={lang} />
            <div className="mx-4 mb-5 grid grid-cols-3 gap-2">
              <Link to="/anc" className="active:scale-[0.97] transition-transform">
                <div className="bg-white rounded-[20px] p-3.5 border border-[#F0F0F0] text-center shadow-card">
                  <div className="w-9 h-9 rounded-[12px] bg-[#EFF4FF] flex items-center justify-center mx-auto mb-2">
                    <HeartHandshake size={17} className="text-[#0047FF]" />
                  </div>
                  <p className="text-[18px] font-extrabold text-[#0047FF] leading-none">{mother.gravida || '—'}</p>
                  <p className="text-[10px] text-[#A0A0A0] mt-1">{lang === 'sw' ? 'Ziara' : 'ANC Visits'}</p>
                </div>
              </Link>
              <Link to="/learn" className="active:scale-[0.97] transition-transform">
                <div className="bg-white rounded-[20px] p-3.5 border border-[#F0F0F0] text-center shadow-card">
                  <div className="w-9 h-9 rounded-[12px] bg-[#F5F0FF] flex items-center justify-center mx-auto mb-2">
                    <BookOpen size={17} className="text-[#7C3AED]" />
                  </div>
                  <p className="text-[13px] font-bold text-[#0A0A0A]">{lang === 'sw' ? 'Elimu' : 'Learn'}</p>
                  <p className="text-[10px] text-[#A0A0A0] mt-1">{lang === 'sw' ? 'Video' : 'Videos'}</p>
                </div>
              </Link>
              <Link to="/ai-health" className="active:scale-[0.97] transition-transform">
                <div className={`rounded-[20px] p-3.5 border text-center shadow-card ${
                  mother.risk_level === 'critical' ? 'bg-[#E51010]/5 border-[#E51010]/20' :
                  mother.risk_level === 'high' ? 'bg-[#F9A825]/5 border-[#F9A825]/20' : 'bg-white border-[#F0F0F0]'
                }`}>
                  <div className="w-9 h-9 rounded-[12px] bg-[#F5F5F7] flex items-center justify-center mx-auto mb-2">
                    <Shield size={17} className={mother.risk_level === 'critical' || mother.risk_level === 'high' ? 'text-[#E51010]' : 'text-[#2E7A5D]'} />
                  </div>
                  <p className={`text-[18px] font-extrabold leading-none ${
                    mother.risk_level === 'critical' ? 'text-[#E51010]' :
                    mother.risk_level === 'high' ? 'text-[#F9A825]' : 'text-[#2E7A5D]'
                  }`}>{mother.risk_score ?? '—'}</p>
                  <p className="text-[10px] text-[#A0A0A0] mt-1">{lang === 'sw' ? 'Hatari' : 'Risk'}</p>
                </div>
              </Link>
            </div>
          </>
        )}

        {/* ── CHILD CARE MODE: Stats ── */}
        {(isCaregiverOnly || !isPregnant) && hasChildren && (
          <div className="mx-4 mb-5 grid grid-cols-3 gap-2">
            <Link to="/vaccines" className="active:scale-[0.97] transition-transform">
              <div className="bg-white rounded-[20px] p-3.5 border border-[#F0F0F0] text-center shadow-card">
                <div className="w-9 h-9 rounded-[12px] bg-[#EFF4FF] flex items-center justify-center mx-auto mb-2">
                  <Shield size={17} className="text-[#0047FF]" />
                </div>
                <p className="text-[13px] font-bold text-[#0A0A0A]">{lang === 'sw' ? 'Chanjo' : 'Vaccines'}</p>
                <p className="text-[10px] text-[#A0A0A0] mt-0.5">{lang === 'sw' ? 'Hali' : 'Status'}</p>
              </div>
            </Link>
            <Link to="/growth" className="active:scale-[0.97] transition-transform">
              <div className="bg-white rounded-[20px] p-3.5 border border-[#F0F0F0] text-center shadow-card">
                <div className="w-9 h-9 rounded-[12px] bg-[#F0FAF5] flex items-center justify-center mx-auto mb-2">
                  <TrendingUp size={17} className="text-[#2E7A5D]" />
                </div>
                <p className="text-[13px] font-bold text-[#0A0A0A]">{lang === 'sw' ? 'Ukuaji' : 'Growth'}</p>
                <p className="text-[10px] text-[#A0A0A0] mt-0.5">{lang === 'sw' ? 'Grafu' : 'Charts'}</p>
              </div>
            </Link>
            <Link to="/ai-health" className="active:scale-[0.97] transition-transform">
              <div className="bg-white rounded-[20px] p-3.5 border border-[#F0F0F0] text-center shadow-card">
                <div className="w-9 h-9 rounded-[12px] bg-[#F5F0FF] flex items-center justify-center mx-auto mb-2">
                  <Sparkles size={17} className="text-[#7C3AED]" />
                </div>
                <p className="text-[13px] font-bold text-[#0A0A0A]">AI</p>
                <p className="text-[10px] text-[#A0A0A0] mt-0.5">{lang === 'sw' ? 'Uchambuzi' : 'Insights'}</p>
              </div>
            </Link>
          </div>
        )}

        {/* ── Children Section ── */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[#0A0A0A]">
              {isPregnant && !hasChildren
                ? (lang === 'sw' ? 'Watoto Wako' : 'Your Children')
                : t('my_children')}
            </h2>
            <Link to="/add-child">
              <button className="flex items-center gap-1.5 bg-[#0047FF] text-white pl-3 pr-4 py-2 rounded-full text-[12px] font-semibold active:scale-[0.95] transition-transform shadow-blue-glow-sm">
                <Plus size={14} /> {t('add_child')}
              </button>
            </Link>
          </div>

          {children.length === 0 ? (
            <Link to="/add-child" className="block active:scale-[0.98] transition-transform">
              <div className="bg-white rounded-[24px] border border-dashed border-[#E5E5E5] p-8 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-[18px] bg-[#0047FF]/8 flex items-center justify-center">
                  <Plus size={24} className="text-[#0047FF]" />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-bold text-[#0A0A0A] mb-1">
                    {lang === 'sw' ? 'Ongeza Mtoto' : 'Add a Child'}
                  </p>
                  <p className="text-[13px] text-[#A0A0A0]">
                    {lang === 'sw' ? 'Anza kufuatilia afya ya mtoto wako' : "Start tracking your child's health"}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              {children.map(child => (
                <ChildCard key={child.id} child={child}
                  nextVaccine={vaccineMap[child.id]}
                  lastGrowth={growthMap[child.id]} />
              ))}
            </div>
          )}
        </div>

        {/* ── Emergency Call Bar ── */}
        <EmergencyCallBar mother={mother} lang={lang} />

        {/* ── Quick Actions ── */}
        <QuickActions isPregnant={isPregnant && !isCaregiverOnly} caregiverType={caregiverType} lang={lang} />

      </div>
    </AppShell>
  );
}