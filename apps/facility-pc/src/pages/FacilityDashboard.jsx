import db from '@/api/totoafyaClient';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

import FacilitySidebar from '@/components/facility/FacilitySidebar';
import FacilityOverview from '@/components/facility/FacilityOverview';
import FacilityMothers from '@/components/facility/FacilityMothers';
import FacilityChildren from '@/components/facility/FacilityChildren';
import FacilityVaccines from '@/components/facility/FacilityVaccines';
import FacilityAnalytics from '@/components/facility/FacilityAnalytics';
import FacilityAlerts from '@/components/facility/FacilityAlerts';

export default function FacilityDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({ mothers: [], children: [], immunizations: [], alerts: [], growthRecords: [] });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { loadAll(); }, [user]);

  const loadAll = async () => {
    if (!user?.facility_id) return;
    setLoading(true);
    try {
      const facilityId = user.facility_id;

      // 1. Fetch mothers for this facility
      const mothers = await db.entities.Mother.filter({ facility_id: facilityId }, '-created_date', 100);
      const motherIds = mothers.map(m => m.id);

      if (motherIds.length === 0) {
        setData({ mothers: [], children: [], immunizations: [], alerts: [], growthRecords: [] });
        setLoading(false);
        return;
      }

      // 2. Fetch children belonging to these mothers
      const children = await db.entities.Child.filter({ mother_id: motherIds }, '-created_date', 100);
      const childIds = children.map(c => c.id);

      // 3. Fetch immunizations, growth records and alerts matching these kids/mothers
      const [immunizations, growthRecords, alerts] = await Promise.all([
        childIds.length > 0 ? db.entities.Immunization.filter({ child_id: childIds }, '-created_date', 200) : Promise.resolve([]),
        childIds.length > 0 ? db.entities.GrowthRecord.filter({ child_id: childIds }, '-recorded_date', 200) : Promise.resolve([]),
        db.entities.AIAlert.filter({ mother_id: motherIds, is_resolved: false }, '-created_date', 50),
      ]);

      setData({ mothers, children, immunizations, alerts, growthRecords });
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
    mothers: <FacilityMothers mothers={data.mothers} onRefresh={loadAll} />,
    children: <FacilityChildren children={data.children} growthRecords={data.growthRecords} />,
    vaccines: <FacilityVaccines immunizations={data.immunizations} children={data.children} />,
    analytics: <FacilityAnalytics data={data} />,
    alerts: <FacilityAlerts alerts={data.alerts} onRefresh={loadAll} />,
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-inter">
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
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E5E5E5] sticky top-0 z-30">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-[10px] bg-[#F5F5F7] active:scale-95 transition-transform"
            >
              <span className="flex flex-col gap-1">
                <span className="w-5 h-0.5 bg-[#0A0A0A] rounded" />
                <span className="w-5 h-0.5 bg-[#0A0A0A] rounded" />
                <span className="w-3 h-0.5 bg-[#0A0A0A] rounded" />
              </span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[9px] bg-[#0047FF] flex items-center justify-center">
                <span className="text-white text-[12px] font-extrabold">T</span>
              </div>
              <p className="text-[14px] font-extrabold text-[#0A0A0A]">TotoAfya Facility</p>
            </div>
            {data.alerts.filter(a => !a.is_read).length > 0 && (
              <span className="ml-auto w-5 h-5 bg-[#E51010] rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {data.alerts.filter(a => !a.is_read).length}
              </span>
            )}
          </div>

          <main className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64 mt-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-[16px] bg-[#0047FF] flex items-center justify-center shadow-teal-glow">
                    <span className="text-white text-[18px] font-extrabold">T</span>
                  </div>
                  <div className="w-7 h-7 border-2 border-[#0047FF] border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            ) : (
              <div className="p-4 md:p-6 lg:p-8">{tabs[activeTab]}</div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}