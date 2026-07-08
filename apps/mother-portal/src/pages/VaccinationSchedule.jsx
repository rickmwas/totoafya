import db from '@/api/totoafyaClient';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, Circle, Check } from 'lucide-react';

import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import { useRequireOnboarding } from '@/hooks/useRequireOnboarding';
import StatusBadge from '@/components/atoms/StatusBadge';
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

const statusIcon = { given: CheckCircle2, due: Clock, overdue: AlertCircle, upcoming: Circle, scheduled: Circle, missed: AlertCircle };
const statusColor = { given: '#107C41', due: '#FFB900', overdue: '#D13438', upcoming: '#A0A0A0', scheduled: '#006B5F', missed: '#D13438' };
const leftBorderColor = { given: '#107C41', due: '#FFB900', overdue: '#D13438', upcoming: '#A0A0A0', scheduled: '#006B5F', missed: '#D13438' };

const getVaccineDescription = (name) => {
  const cleanName = name.split('+')[0].trim();
  const match = KENYA_VACCINE_SCHEDULE.find(v => v.name.includes(cleanName) || cleanName.includes(v.name));
  return match ? match.description : null;
};

export default function VaccinationSchedule() {
  const { t, lang } = useLang();
  const { loading: checkingOnboarding } = useRequireOnboarding();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    await db.entities.Immunization.update(vaccine.id, {
      status: 'given',
      given_date: new Date().toISOString().split('T')[0],
    });
    await loadVaccines(selectedChild.id);
    setSaving(false);
  };

  const seedSchedule = async () => {
    if (!selectedChild) return;
    setSaving(true);
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
    setSaving(false);
  };

  const statsCount = (status) => vaccines.filter(v => v.status === status).length;

  if (checkingOnboarding) return null;

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="relative px-4 pt-14 pb-6 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-toto-teal opacity-[0.06] blur-2xl pointer-events-none" />
          <div className="absolute top-6 right-12 w-20 h-20 rounded-full bg-toto-green opacity-[0.05] blur-xl pointer-events-none" />
          <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-toto-teal/60 mb-1.5">
            {lang === 'sw' ? 'RATIBA' : 'SCHEDULE'}
          </p>
          <h1 className="font-bold leading-tight text-toto-teal text-[34px]" style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
            {t('vaccination_schedule')}
          </h1>
        </div>

        {/* Child selector */}
        {children.length > 0 && (
          <div className="px-4 mb-4 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 active:scale-[0.96]',
                  selectedChild?.id === child.id
                    ? 'bg-toto-teal text-white shadow-teal-glow-sm'
                    : 'bg-white border border-[#EBEBEB] text-[#666666]'
                )}
              >
                {child.full_name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {!selectedChild ? (
          <div className="px-4 py-12 text-center">
            <p className="text-[15px] text-toto-light">
              {lang === 'sw' ? 'Hakuna mtoto. Ongeza mtoto kwanza.' : 'No children found. Add a child first.'}
            </p>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="px-4 mb-4 grid grid-cols-4 gap-2">
              {[
                { label: t('given'), status: 'given', color: '#107C41', bg: '#F0FAF5' },
                { label: t('due_soon'), status: 'due', color: '#FFB900', bg: '#FFFBEB' },
                { label: t('overdue'), status: 'overdue', color: '#D13438', bg: '#FFF5F5' },
                { label: t('upcoming'), status: 'scheduled', color: '#006B5F', bg: '#E6F4F1' },
              ].map(({ label, status, color, bg }) => (
                <div key={status} className="rounded-[18px] p-3 border text-center" style={{ backgroundColor: bg, borderColor: color + '20' }}>
                  <p className="text-[22px] font-extrabold leading-none font-numeric-tabular" style={{ color }}>{statsCount(status)}</p>
                  <p className="text-[8px] tracking-[0.08em] uppercase font-bold mt-1 leading-tight" style={{ color: color + 'CC' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Seed schedule button */}
            {vaccines.length === 0 && (
              <div className="px-4 mb-4">
                <div className="bg-[#1B6B5A]/5 rounded-[20px] p-5 border border-[#1B6B5A]/15 text-center">
                  <p className="text-[14px] font-semibold text-[#0A0A0A] mb-1">
                    {lang === 'sw' ? 'Hakuna ratiba ya chanjo bado' : 'No vaccine schedule yet'}
                  </p>
                  <p className="text-[12px] text-[#666666] mb-4">
                    {lang === 'sw' ? 'Tengeneza ratiba ya Kenya kulingana na tarehe ya kuzaliwa' : 'Generate Kenya standard schedule based on date of birth'}
                  </p>
                  <button
                    onClick={seedSchedule}
                    disabled={saving}
                    className="bg-[#1B6B5A] text-white px-6 py-3 rounded-full text-[13px] font-bold shadow-[0_8px_24px_rgba(27,107,90,0.25)] active:scale-[0.97] transition-all"
                  >
                    {saving ? '...' : (lang === 'sw' ? 'Tengeneza Ratiba' : 'Generate Schedule')}
                  </button>
                </div>
              </div>
            )}

            {/* Vaccine Timeline with connected visual timeline spine */}
            <div className="relative ml-8 mr-4 pb-10 flex flex-col gap-5">
              {/* Vertical Spine Line */}
              <div className="absolute left-[13px] top-3 bottom-3 w-[2px] bg-toto-surface border-l border-toto-light/25 pointer-events-none" />

              {vaccines.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date)).map((vaccine) => {
                const IconComp = statusIcon[vaccine.status] || Circle;
                const isGiven = vaccine.status === 'given';
                const isOverdue = vaccine.status === 'overdue';
                const isDue = vaccine.status === 'due';
                const daysLeft = differenceInDays(parseISO(vaccine.scheduled_date), new Date());
                const iconColor = statusColor[vaccine.status] || '#A0A0A0';
                const borderLeft = leftBorderColor[vaccine.status] || '#006B5F';

                return (
                  <div key={vaccine.id} className="relative">
                    {/* Visual Spine Node Icon */}
                    <div
                      className="absolute -left-[31px] top-5 w-[28px] h-[28px] rounded-full bg-white flex items-center justify-center border shadow-sm z-10"
                      style={{ borderColor: iconColor, color: iconColor }}
                    >
                      <IconComp size={15} strokeWidth={2.5} />
                    </div>

                    <div
                      className="bg-white rounded-[18px] overflow-hidden shadow-card transition-all duration-200"
                      style={{
                        border: `1px solid ${isOverdue ? '#D1343818' : isDue ? '#FFB90018' : '#F0F0F0'}`,
                        borderLeft: `3.5px solid ${borderLeft}`,
                      }}
                      aria-label={`${vaccine.status === 'overdue' ? 'Overdue' : vaccine.status === 'due' ? 'Due' : vaccine.status === 'given' ? 'Given' : 'Upcoming'}, ${vaccine.vaccine_name}, ${lang === 'sw' ? 'inapaswa kutolewa tarehe' : 'due on'} ${format(parseISO(vaccine.scheduled_date), 'MMMM d, yyyy')}`}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-[14px] font-bold text-toto-black leading-tight">{vaccine.vaccine_name}</p>
                                
                                {/* Disease Prevented Microcopy */}
                                {getVaccineDescription(vaccine.vaccine_name) && (
                                  <p className="text-[11px] text-toto-gray mt-0.5 font-medium leading-tight">
                                    {lang === 'sw' ? 'Huzuia' : 'Prevents'}: <span className="font-semibold text-toto-teal">{getVaccineDescription(vaccine.vaccine_name)}</span>
                                  </p>
                                )}

                                <p className="text-[11px] text-toto-light mt-1 font-semibold font-numeric-tabular">
                                  {format(parseISO(vaccine.scheduled_date), 'MMM d, yyyy')}
                                  {!isGiven && daysLeft > 0 && (
                                    <span className="ml-1.5 font-bold animate-pulse-dot" style={{ color: '#FFB900' }}>· {daysLeft}d</span>
                                  )}
                                  {!isGiven && daysLeft < 0 && (
                                    <span className="ml-1.5 font-bold text-toto-red">· {Math.abs(daysLeft)}d late</span>
                                  )}
                                </p>
                              </div>
                              <StatusBadge status={vaccine.status} />
                            </div>
                            
                            {vaccine.given_date && (
                              <p className="text-[11px] text-toto-green mt-1.5 font-semibold font-numeric-tabular">
                                ✓ {lang === 'sw' ? 'Ilipewa' : 'Given'}: {format(parseISO(vaccine.given_date), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Mark as given — 48px height touch target button */}
                        {!isGiven && (
                          <button
                            onClick={() => markGiven(vaccine)}
                            disabled={saving}
                            className="mt-3 w-full h-12 rounded-[12px] flex items-center justify-center gap-2 text-white text-[13px] font-bold active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
                            style={{ backgroundColor: isOverdue ? '#D13438' : isDue ? '#FFB900' : '#107C41' }}
                          >
                            <Check size={14} strokeWidth={2.5} />
                            {lang === 'sw' ? 'Weka Alama: Imepewa' : 'Mark as Given'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}