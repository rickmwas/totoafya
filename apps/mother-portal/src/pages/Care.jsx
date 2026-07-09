import React, { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import PregnancyOverview from './PregnancyOverview';
import VaccinationSchedule from './VaccinationSchedule';
import ANCVisitLog from './ANCVisitLog';
import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';

export default function Care() {
  const { profile } = useProfile();
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState('vaccines'); // 'vaccines' | 'appointments'

  const isPregnant = profile?.pregnancy_status === 'pregnant';
  const caregiverType = profile?.caregiver_type || 'mother';
  const isCaregiverOnly = caregiverType === 'father' || caregiverType === 'guardian';

  // If pregnant, render PregnancyOverview screen directly!
  if (isPregnant && !isCaregiverOnly) {
    return <PregnancyOverview />;
  }

  // If childcare mode or caregiver, show tabbed schedule & appointments
  return (
    <AppShell>
      <div className="bg-[#f7f9f7] min-h-screen pb-12 font-sans text-[#131714]">
        {/* Tab Header (Screen 07/10 Tabs) */}
        <div className="flex bg-white border-b border-[#e5e7eb] px-6 pt-6">
          <button
            onClick={() => setActiveTab('vaccines')}
            className={`flex-1 pb-3.5 text-[15px] font-bold text-center relative transition-all ${
              activeTab === 'vaccines' ? 'text-toto-teal' : 'text-[#6e7772] hover:text-[#131714]'
            }`}
          >
            {lang === 'sw' ? 'Ratiba ya Chanjo' : 'Vaccinations'}
            {activeTab === 'vaccines' && (
              <div className="absolute bottom-0 left-4 right-4 h-[2.5px] bg-toto-teal rounded-full animate-fade-in" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 pb-3.5 text-[15px] font-bold text-center relative transition-all ${
              activeTab === 'appointments' ? 'text-[#0d623d]' : 'text-[#6e7772] hover:text-[#131714]'
            }`}
          >
            {lang === 'sw' ? 'Miadi ya Kliniki' : 'Appointments'}
            {activeTab === 'appointments' && (
              <div className="absolute bottom-0 left-4 right-4 h-[2.5px] bg-[#0d623d] rounded-full animate-fade-in" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4 animate-fade-in">
          {activeTab === 'vaccines' ? (
            <VaccinationSchedule hideShell={true} />
          ) : (
            <ANCVisitLog hideShell={true} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
