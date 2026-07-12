import db from '@/api/totoafyaClient';
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, Circle, Check, ChevronLeft, MoreVertical, Shield } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import { useRequireOnboarding } from '@/hooks/useRequireOnboarding';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

const KENYA_VACCINE_SCHEDULE = [
  { name: 'BCG', age_weeks: 0, description: 'Tuberculosis' },
  { name: 'OPV 0', age_weeks: 0, description: 'Polio (birth)' },
  { name: 'OPV 1 + Penta 1 + PCV 1 + Rota 1', age_weeks: 6, description: 'Polio, DPT-HepB-Hib, Pneumonia, Rotavirus' },
  { name: 'OPV 2 + Penta 2 + PCV 2 + Rota 2', age_weeks: 10, description: 'Second dose' },
  { name: 'OPV 3 + Penta 3 + PCV 3 + IPV', age_weeks: 14, description: 'Third dose + Inactivated Polio' },
  { name: 'Vitamin A + Measles 1', age_weeks: 36, description: '9 months: Measles & Vitamin A' },
  { name: 'Measles 2 + Vitamin A', age_weeks: 74, description: '18 months booster' },
];

const statusColor = { given: 'text-[#1eb96c] bg-[#e8f7ee]', due: 'text-[#e68a00] bg-[#fffbf0]', overdue: 'text-[#ff5f58] bg-[#fff5f5]', scheduled: 'text-toto-gray bg-toto-gray/5' };

const getVaccineDescription = (name) => {
  const cleanName = name.split('+')[0].trim();
  const match = KENYA_VACCINE_SCHEDULE.find(v => v.name.includes(cleanName) || cleanName.includes(v.name));
  return match ? match.description : null;
};

export default function VaccinationSchedule({ hideShell = false }) {
  const { t, lang } = useLang();
  const { loading: checkingOnboarding } = useRequireOnboarding();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scheduleTab, setScheduleTab] = useState('upcoming'); // 'upcoming' | 'completed' | 'all'

  useEffect(() => { loadChildren(); }, []);
  useEffect(() => { if (selectedChild) loadVaccines(selectedChild.id); }, [selectedChild]);

  const loadChildren = async () => {
    const kids = await db.entities.Child.list('-created_date', 20);
    setChildren(kids);
    if (kids.length > 0) setSelectedChild(kids[0]);
    setLoading(false);
  };

  const loadVaccines = async (childId) => {
    const v = await db.entities.Immunization.filter({ child_id: childId }, 'scheduled_date', 50);
    setVaccines(v);
  };

  const markGiven = async (vaccine) => {
    setSaving(true);
    try {
      await db.entities.Immunization.update(vaccine.id, {
        status: 'given',
        given_date: new Date().toISOString().split('T')[0],
      });
      await loadVaccines(selectedChild.id);
    } catch (err) {
      console.error(err);
      alert(lang === 'sw' ? 'Imeshindwa kusasisha chanjo.' : 'Failed to update vaccine.');
    } finally {
      setSaving(false);
    }
  };

  const seedSchedule = async () => {
    if (!selectedChild) return;
    setSaving(true);
    try {
      const dob = parseISO(selectedChild.date_of_birth);
      const records = KENYA_VACCINE_SCHEDULE.map(v => ({
        child_id: selectedChild.id,
        vaccine_name: v.name,
        age_weeks: v.age_weeks,
        scheduled_date: new Date(dob.getTime() + v.age_weeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'scheduled',
        dose_number: 1,
      }));
      await db.entities.Immunization.bulkCreate(records);
      await loadVaccines(selectedChild.id);
    } catch (err) {
      console.error(err);
      alert(lang === 'sw' ? 'Imeshindwa kutengeneza ratiba.' : 'Failed to generate schedule.');
    } finally {
      setSaving(false);
    }
  };

  const filteredVaccines = vaccines.filter(v => {
    if (scheduleTab === 'upcoming') return v.status !== 'given';
    if (scheduleTab === 'completed') return v.status === 'given';
    return true;
  });

  const renderContent = () => {
    if (!selectedChild) {
      return (
        <div className="px-6 py-12 text-center">
          <p className="text-[14px] text-toto-gray font-semibold">
            {lang === 'sw' ? 'Ongeza mtoto kwanza.' : 'Add a child first.'}
          </p>
        </div>
      );
    }

    return (
      <div className="px-4">
        {/* Child Selector for Vaccines */}
        {children.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3.5 scrollbar-none">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={cn(
                  'flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all',
                  selectedChild?.id === child.id ? 'bg-[#0d623d] text-white shadow-sm' : 'bg-white border border-[#e5e7eb] text-toto-gray'
                )}
              >
                {child.full_name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {/* Schedule Sub-tabs: Upcoming, Completed, All (Screen 07 Tabs) */}
        <div className="flex bg-[#f0f2f0] p-1 rounded-[16px] w-full mb-5 border border-[#e5e7eb]">
          {[
            { key: 'upcoming', label: lang === 'sw' ? 'Zinazokuja' : 'Upcoming' },
            { key: 'completed', label: lang === 'sw' ? 'Zilizopewa' : 'Completed' },
            { key: 'all', label: lang === 'sw' ? 'Zote' : 'All' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setScheduleTab(tab.key)}
              className={cn(
                'flex-1 py-2 text-xs font-bold rounded-[12px] transition-all',
                scheduleTab === tab.key ? 'bg-white text-toto-black shadow-sm' : 'text-toto-gray hover:text-toto-black'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Seed schedule container */}
        {vaccines.length === 0 && (
          <div className="bg-white rounded-[24px] p-6 border border-[#e5e7eb] text-center mb-6">
            <Shield className="w-10 h-10 text-toto-teal mx-auto mb-3" />
            <h4 className="text-[15px] font-bold text-toto-black">
              {lang === 'sw' ? 'Ratiba ya Chanjo haijatengenezwa' : 'No vaccine schedule generated'}
            </h4>
            <p className="text-[12.5px] text-toto-gray mt-1 leading-relaxed">
              {lang === 'sw' ? 'Tengeneza ratiba rasmi ya chanjo ya Kenya kwa mtoto wako.' : 'Generate the standard Kenyan immunization schedule for your baby.'}
            </p>
            <button
              onClick={seedSchedule}
              disabled={saving}
              className="mt-4 bg-toto-teal hover:bg-toto-teal-dark text-white px-6 py-2.5 rounded-full text-[13px] font-bold shadow-sm active:scale-95 transition-all"
            >
              {lang === 'sw' ? 'Tengeneza Ratiba' : 'Generate Schedule'}
            </button>
          </div>
        )}

        {/* Vaccine List (Screen 07 Layout) */}
        <div className="flex flex-col gap-3">
          {filteredVaccines.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date)).map(vaccine => {
            const isGiven = vaccine.status === 'given';
            const daysLeft = differenceInDays(parseISO(vaccine.scheduled_date), new Date());
            
            // Map badge colors
            let badgeClass = 'text-toto-gray bg-toto-gray/5';
            let badgeText = lang === 'sw' ? 'Imepangwa' : 'Scheduled';
            if (vaccine.status === 'given') {
              badgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-100';
              badgeText = lang === 'sw' ? 'Ilipewa' : 'Completed';
            } else if (daysLeft < 0) {
              badgeClass = 'text-rose-700 bg-rose-50 border-rose-100';
              badgeText = lang === 'sw' ? 'Imechelewa' : 'Overdue';
            } else if (daysLeft <= 14) {
              badgeClass = 'text-amber-700 bg-amber-50 border-amber-100';
              badgeText = lang === 'sw' ? 'Karibu' : 'Due';
            }

            return (
              <div 
                key={vaccine.id}
                className="bg-white border border-[#e5e7eb] rounded-[24px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col gap-3 hover:border-toto-teal/20 transition-all"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-[14px] font-extrabold text-[#131714] leading-snug">
                      {vaccine.vaccine_name}
                    </h4>
                    {getVaccineDescription(vaccine.vaccine_name) && (
                      <p className="text-[11.5px] text-toto-gray mt-0.5 font-medium leading-tight">
                        {lang === 'sw' ? 'Kuhusu: ' : 'Prevents: '} <span className="font-semibold text-toto-teal">{getVaccineDescription(vaccine.vaccine_name)}</span>
                      </p>
                    )}
                    <p className="text-[11.5px] text-toto-light mt-1 font-semibold font-numeric-tabular">
                      {lang === 'sw' ? 'Tarehe: ' : 'Due date: '} {format(parseISO(vaccine.scheduled_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div className={cn("px-3 py-1 rounded-full text-[11px] font-bold border flex-shrink-0", badgeClass)}>
                    {isGiven ? badgeText : `${badgeText} ${format(parseISO(vaccine.scheduled_date), 'd MMM')}`}
                  </div>
                </div>

                {!isGiven && (
                  <button
                    onClick={() => markGiven(vaccine)}
                    disabled={saving}
                    className="w-full h-11 bg-toto-teal hover:bg-toto-teal-dark active:scale-[0.98] text-white rounded-full font-bold text-[13.5px] shadow-sm transition-all flex items-center justify-center gap-1.5 mt-1"
                  >
                    <Check size={14} strokeWidth={2.5} />
                    {lang === 'sw' ? 'Weka Alama ya Kupewa' : 'Mark as Administered'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (checkingOnboarding) return null;

  if (hideShell) {
    return renderContent();
  }

  return (
    <AppShell>
      <div className="bg-[#f7f9f7] min-h-screen pb-12 font-sans text-[#131714]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <Link to="/" className="w-10 h-10 bg-white rounded-full border border-[#e5e7eb] flex items-center justify-center shadow-sm active:scale-95 transition-transform">
            <ChevronLeft size={20} className="text-[#131714]" />
          </Link>
          <h1 className="text-[18px] font-extrabold text-[#131714]">
            {lang === 'sw' ? 'Chanjo' : 'Vaccines'}
          </h1>
          <button 
            className="w-10 h-10 bg-white rounded-full border border-[#e5e7eb] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            onClick={() => alert(lang === 'sw' ? 'Chaguo' : 'Options')}
          >
            <MoreVertical size={20} className="text-[#131714]" />
          </button>
        </div>

        {renderContent()}
      </div>
    </AppShell>
  );
}
