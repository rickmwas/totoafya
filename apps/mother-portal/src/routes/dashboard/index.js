/**
 * Dashboard & Navigation Surfaces Module (TD-2.3)
 *
 * Exports:
 * - DashboardView (Master coordinator view)
 * - SCR07PregnancyDashboard (SCR-07 Pregnancy Home Dashboard)
 * - SCR08ChildDashboard (SCR-08 Child Home Dashboard)
 * - SCR22ChildSwitcher (SCR-22 Sibling Switcher Bottom Drawer)
 * - BottomNav4Tab (4-Destination Thumb-Zone Navigation Bar)
 * - DashboardTopBar (Sticky Top App Bar with Mode Switcher & System Indicators)
 */

export { DashboardView } from './DashboardView';
export { SCR07PregnancyDashboard } from './SCR07PregnancyDashboard';
export { SCR08ChildDashboard } from './SCR08ChildDashboard';
export { SCR22ChildSwitcher, DEFAULT_CHILDREN } from './SCR22ChildSwitcher';
export { BottomNav4Tab, NAV_TABS } from '../../components/navigation/BottomNav4Tab';
export { DashboardTopBar } from '../../components/navigation/DashboardTopBar';
