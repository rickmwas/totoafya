import db from '@/api/totoafyaClient';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { LayoutDashboard, Users, Baby, Stethoscope, Menu, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

import FacilitySidebar from '@/components/facility/FacilitySidebar';
import FacilityOverview from '@/components/facility/FacilityOverview';
import FacilityMothers from '@/components/facility/FacilityMothers';
import FacilityChildren from '@/components/facility/FacilityChildren';
import FacilityVaccines from '@/components/facility/FacilityVaccines';
import FacilityAnalytics from '@/components/facility/FacilityAnalytics';
import FacilityAlerts from '@/components/facility/FacilityAlerts';
import FacilityBilling from '@/components/facility/FacilityBilling';
import FacilityNurses from '@/components/facility/FacilityNurses';
import FacilityDeveloperDesk from '@/components/facility/FacilityDeveloperDesk';

const MetricSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white p-6 rounded-[22px] border border-[#E5E5E5] flex items-start justify-between animate-pulse">
        <div className="flex-grow">
          <div className="h-3 bg-slate-200 rounded w-16 mb-3"></div>
          <div className="h-8 bg-slate-200 rounded w-24 mb-3"></div>
          <div className="h-3 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="w-10 h-10 rounded-[12px] bg-slate-200 flex-shrink-0"></div>
      </div>
    ))}
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white rounded-[20px] border border-[#E5E5E5] overflow-hidden animate-pulse">
    <div className="h-12 bg-slate-50 border-b border-[#E5E5E5] flex items-center px-6 gap-6">
      <div className="h-4 bg-slate-200 rounded w-32"></div>
      <div className="h-4 bg-slate-200 rounded w-24"></div>
      <div className="h-4 bg-slate-200 rounded w-20"></div>
      <div className="h-4 bg-slate-200 rounded w-28"></div>
    </div>
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="h-16 border-b border-[#FAFAFA] flex items-center px-6 gap-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-full bg-slate-200"></div>
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-3 bg-slate-200 rounded w-36"></div>
            <div className="h-3 bg-slate-200 rounded w-24"></div>
          </div>
        </div>
        <div className="h-3 bg-slate-200 rounded w-24 flex-1"></div>
        <div className="h-3 bg-slate-200 rounded w-20 flex-1"></div>
        <div className="h-3 bg-slate-200 rounded w-32 flex-1"></div>
      </div>
    ))}
  </div>
);

export default function FacilityDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [facility, setFacility] = useState(null);
  const [data, setData] = useState({
    mothers: [],
    children: [],
    immunizations: [],
    alerts: [],
    growthRecords: [],
    nurses: [],
    concerns: [],
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { loadAll(); }, [user]);

  const loadAll = async () => {
    if (!user?.facility_id) return;
    setLoading(true);
    try {
      const facilityId = user.facility_id;

      // 1. Fetch or create facility details
      let fac = null;
      try {
        fac = await db.entities.Facility.get(facilityId);
        if (!fac) {
          fac = await db.entities.Facility.create({
            id: facilityId,
            name: 'Demo Referral Hospital',
            location: 'Central Region',
            facility_code: 'REF-001',
          });
        }
      } catch (err) {
        console.error('Error fetching facility:', err);
        fac = { id: facilityId, name: 'Demo Referral Hospital' };
      }
      setFacility(fac);

      // 2. Fetch mothers, nurses, and developer concerns in parallel
      const [mothers, nursesFetched, concernsFetched] = await Promise.all([
        db.entities.Mother.filter({ facility_id: facilityId }, '-created_date', 100),
        db.entities.Nurse.filter({ facility_id: facilityId }, '-created_date', 100),
        db.entities.DeveloperConcern.filter({ facility_id: facilityId }, '-created_date', 100).catch(() => []),
      ]);

      // Seed mock nurses if none exist
      let nurses = nursesFetched;
      if (nurses.length === 0) {
        try {
          const mockNursesData = [
            { name: 'Nurse Joy', email: 'joy@totoafya.org', role: 'charge_nurse', badge: 'BADGE-001' },
            { name: 'Nurse Grace', email: 'grace@totoafya.org', role: 'nurse', badge: 'BADGE-002' },
            { name: 'Nurse Florence', email: 'florence@totoafya.org', role: 'nurse', badge: 'BADGE-003' },
          ];
          const createdNurses = [];
          for (const mn of mockNursesData) {
            const n = await db.entities.Nurse.create({
              facility_id: facilityId,
              full_name: mn.name,
              email: mn.email,
              role: mn.role,
              badge_token: mn.badge,
              pin_code: '1234',
            });
            createdNurses.push(n);
          }
          nurses = createdNurses;
        } catch (e) {
          console.error('Failed to seed default nurses:', e);
        }
      }

      const motherIds = mothers.map(m => m.id);
      let children = [];
      let immunizations = [];
      let growthRecords = [];
      let alerts = [];

      if (motherIds.length > 0) {
        children = await db.entities.Child.filter({ mother_id: motherIds }, '-created_date', 100);
        const childIds = children.map(c => c.id);

        const [immResult, growthResult, alertResult] = await Promise.all([
          childIds.length > 0 ? db.entities.Immunization.filter({ child_id: childIds }, '-created_date', 200) : Promise.resolve([]),
          childIds.length > 0 ? db.entities.GrowthRecord.filter({ child_id: childIds }, '-recorded_date', 200) : Promise.resolve([]),
          db.entities.AIAlert.filter({ mother_id: motherIds, is_resolved: false }, '-created_date', 50),
        ]);

        immunizations = immResult;
        growthRecords = growthResult;
        alerts = alertResult;
      }

      setData({
        mothers,
        children,
        immunizations,
        alerts,
        growthRecords,
        nurses,
        concerns: concernsFetched,
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const tabs = {
    overview: <FacilityOverview data={data} />,
    mothers: <FacilityMothers mothers={data.mothers} facilityId={user?.facility_id} onRefresh={loadAll} />,
    children: <FacilityChildren children={data.children} growthRecords={data.growthRecords} />,
    vaccines: <FacilityVaccines immunizations={data.immunizations} children={data.children} />,
    nurses: <FacilityNurses nurses={data.nurses} facilityId={user?.facility_id} onRefresh={loadAll} />,
    analytics: <FacilityAnalytics data={data} />,
    alerts: <FacilityAlerts alerts={data.alerts} onRefresh={loadAll} />,
    billing: <FacilityBilling data={data} />,
    concerns: <FacilityDeveloperDesk concerns={data.concerns} facilityId={user?.facility_id} onRefresh={loadAll} />,
  };

  return (
    <div className="min-h-screen bg-[#FAFBFB] font-inter">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <FacilitySidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          alertCount={data.alerts.filter(a => !a.is_read).length}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          facilityName={facility?.name}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
          {/* Mobile top bar */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E5E5E5] sticky top-0 z-30">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-7 h-7 rounded-[9px] bg-[#2E5B47] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[12px] font-extrabold">T</span>
              </div>
              <p className="text-[14px] font-extrabold text-[#0A0A0A] truncate">
                {facility?.name || 'TotoAfya Facility'}
              </p>
            </div>
            {data.alerts.filter(a => !a.is_read).length > 0 && (
              <span className="ml-auto w-5 h-5 bg-[#E51010] rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {data.alerts.filter(a => !a.is_read).length}
              </span>
            )}
          </div>

          <main className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 md:p-6 lg:p-8">
                {activeTab === 'overview' ? (
                  <div>
                    <MetricSkeleton />
                    <TableSkeleton />
                  </div>
                ) : (
                  <TableSkeleton />
                )}
              </div>
            ) : (
              <div className="p-4 md:p-6 lg:p-8">{tabs[activeTab]}</div>
            )}
          </main>

          {/* Mobile Bottom Navigation (Native App feel) */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] px-2 py-2 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-around">
              {[
                { key: 'overview', icon: LayoutDashboard, label: 'Overview' },
                { key: 'mothers', icon: Users, label: 'Mothers' },
                { key: 'children', icon: Baby, label: 'Children' },
                { key: 'nurses', icon: Stethoscope, label: 'Nurses' }
              ].map(item => {
                const active = activeTab === item.key;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={cn(
                      'flex flex-col items-center gap-1 py-1 px-3 rounded-[16px] min-w-[60px] transition-all active:scale-[0.92]',
                      active ? 'text-[#2E5B47]' : 'text-[#A0A0A0]'
                    )}
                  >
                    <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                    <span className="text-[9px] font-bold uppercase tracking-wider leading-none">
                      {item.label}
                    </span>
                  </button>
                );
              })}
              
              {/* More button to toggle full sidebar overlay */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex flex-col items-center gap-1 py-1 px-3 rounded-[16px] min-w-[60px] text-[#A0A0A0] transition-all active:scale-[0.92]"
              >
                <Menu size={20} strokeWidth={1.8} />
                <span className="text-[9px] font-bold uppercase tracking-wider leading-none">
                  More
                </span>
              </button>
            </div>
          </nav>

        </div>
      </div>
    </div>
  );
}
