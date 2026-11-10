import React, { useState } from 'react';
import { DashboardTopBar } from '../../components/navigation/DashboardTopBar';
import { BottomNav4Tab } from '../../components/navigation/BottomNav4Tab';
import { SCR07PregnancyDashboard } from './SCR07PregnancyDashboard';
import { SCR08ChildDashboard } from './SCR08ChildDashboard';
import { SCR22ChildSwitcher, DEFAULT_CHILDREN } from './SCR22ChildSwitcher';

/**
 * DashboardView — Master Dual Dashboard & Navigation Coordinator
 *
 * Implements:
 * - "The Sunlit Botanical Editorial" centered 390px mobile container
 * - Sticky DashboardTopBar with ModeSwitcherPill (Pregnancy vs Child), sync status, and language toggle
 * - Mode rendering:
 *     * Mode 'pregnancy' -> SCR07PregnancyDashboard
 *     * Mode 'child'     -> SCR08ChildDashboard
 * - Sibling/Child Switcher Sheet (SCR-22) bottom drawer integration
 * - Persistent 4-Tab Bottom Navigation (BottomNav4Tab) anchored in natural thumb zone
 * - ZERO Unicode emojis across all views
 * - Dark-on-Amber compliance on all alert badges
 * - Minimum 48x48px hit targets throughout
 */

export function DashboardView({
  initialMode = 'pregnancy',
  initialLang = 'en',
  initialActiveTab = 'home',
  motherName = 'Faith',
  childrenList = DEFAULT_CHILDREN,
  isOnline = true,
  hasPendingSync = false,
  onNavigate,
  onEmergencyCall,
  className = '',
}) {
  const [mode, setMode] = useState(initialMode);
  const [lang, setLang] = useState(initialLang);
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [isChildSwitcherOpen, setIsChildSwitcherOpen] = useState(false);
  const [activeChildId, setActiveChildId] = useState(() =>
    childrenList && childrenList.length > 0 ? childrenList[0].id : 'child-1'
  );

  const defaultFallbackChild = DEFAULT_CHILDREN[0] || {
    id: 'child-1',
    name: 'Joy Wambui',
    gender: 'female',
    dob: '2026-07-12',
    age: '4 Months 2 Weeks',
    ageSw: 'Miezi 4 Wiki 2',
    weight: '6.4 kg — Normal (50th percentile)',
    weightSw: '6.4 kg — Kawaida (asilimia 50)',
    muac: '13.2 cm — Healthy',
    muacSw: '13.2 cm — Afya Bora',
    muacStatus: 'healthy',
    vaccineAlert: '14-Week KEPI Vaccines Due in 12 Days',
    vaccineAlertSw: 'Chanjo ya Wiki 14 — Zimebaki Siku 12',
    lastClinic: '10-Week KEPI (Given)',
    lastClinicSw: 'Chanjo ya Wiki 10 (Imetolewa)',
  };

  const matchedChild =
    (Array.isArray(childrenList) &&
      childrenList.find((c) => String(c.id) === String(activeChildId))) ||
    (Array.isArray(childrenList) && childrenList[0]) ||
    defaultFallbackChild;

  // Defensive fallback merge: ensures all required child properties are populated
  const activeChild = {
    ...defaultFallbackChild,
    ...matchedChild,
  };

  const handleLangToggle = () => {
    setLang((prev) => (prev === 'en' ? 'sw' : 'en'));
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleTabChange = (tabKey, route) => {
    setActiveTab(tabKey);
    if (typeof onNavigate === 'function') {
      onNavigate(route);
    }
  };

  const handleNavigate = (route) => {
    if (typeof onNavigate === 'function') {
      onNavigate(route);
    }
  };

  const handleSelectChild = (childId) => {
    setActiveChildId(childId);
  };

  const handleAddChild = () => {
    handleNavigate('/add-child');
  };

  return (
    <div
      data-testid="totoafya-dashboard-view"
      className={`min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-start text-[#1A202C] antialiased ${className}`}
    >
      {/* Centered 390px Shell Container */}
      <div className="w-full max-w-[430px] min-h-screen bg-[#F7F5F0] flex flex-col relative pb-20 shadow-xl overflow-x-hidden">
        {/* 1. Sticky Top App Bar with Mode Switcher & Utilities */}
        <DashboardTopBar
          mode={mode}
          onModeChange={handleModeChange}
          lang={lang}
          onLangToggle={handleLangToggle}
          isOnline={isOnline}
          hasPendingSync={hasPendingSync}
          unreadNotifications={1}
          onNotificationsClick={() => handleNavigate('/notifications')}
        />

        {/* 2. Main Dashboard Surface */}
        <main
          role="main"
          id="main-dashboard-content"
          className="flex-1 w-full"
        >
          {mode === 'pregnancy' ? (
            <SCR07PregnancyDashboard
              motherName={motherName}
              lang={lang}
              onNavigate={handleNavigate}
              onEmergencyCall={onEmergencyCall}
            />
          ) : (
            <SCR08ChildDashboard
              child={activeChild}
              onOpenChildSwitcher={() => setIsChildSwitcherOpen(true)}
              onNavigate={handleNavigate}
              lang={lang}
            />
          )}
        </main>

        {/* 3. Child Switcher Bottom Sheet (SCR-22) */}
        <SCR22ChildSwitcher
          isOpen={isChildSwitcherOpen}
          onClose={() => setIsChildSwitcherOpen(false)}
          childrenList={childrenList}
          activeChildId={activeChildId}
          onSelectChild={handleSelectChild}
          onAddChild={handleAddChild}
          lang={lang}
        />

        {/* 4. Persistent 4-Tab Bottom Navigation */}
        <BottomNav4Tab
          activeTab={activeTab}
          onTabChange={handleTabChange}
          lang={lang}
        />
      </div>
    </div>
  );
}

export default DashboardView;
