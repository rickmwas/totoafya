import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Building, Users, Baby, Heart, Shield, Sparkles, 
  Search, ArrowRight, Grid, AlertCircle, RefreshCw, Layers, LogOut, Menu,
  Activity
} from 'lucide-react';
import db from '@/api/totoafyaClient';
import FacilityFacilities from './components/FacilityFacilities';
import FacilityNurses from './components/FacilityNurses';
import Login from './components/Login';
import PilotMonitoring from './components/PilotMonitoring';

const MetricSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white p-6 rounded-[22px] border border-[#E5E5E5] shadow-premium flex items-start justify-between animate-pulse">
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
  <div className="bg-white rounded-[20px] border border-[#E5E5E5] shadow-premium overflow-hidden animate-pulse">
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

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [mothers, setMothers] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search terms
  const [motherSearch, setMotherSearch] = useState('');

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkInitialAuth();
  }, []);

  const checkInitialAuth = async () => {
    try {
      const activeUser = await db.auth.me();
      setUser(activeUser);
      if (activeUser && activeUser.role === 'super_admin') {
        await loadAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [facs, ns, moms, kids] = await Promise.all([
        db.entities.Facility.list('-created_date', 500),
        db.entities.Nurse.list('-created_date', 500),
        db.entities.Mother.list('-created_date', 500),
        db.entities.Child.list('-created_date', 500),
      ]);

      setFacilities(facs);
      setNurses(ns);
      setMothers(moms);
      setChildren(kids);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const getFacilityName = (facilityId) => {
    const f = facilities.find(fac => fac.id === facilityId);
    return f ? f.name : 'Unknown Facility';
  };



  const handleLoginSuccess = async () => {
    try {
      const activeUser = await db.auth.me();
      setUser(activeUser);
      if (activeUser && activeUser.role === 'super_admin') {
        await loadAllData();
      }
    } catch (err) {
      console.error('Failed to resolve authenticated user', err);
    }
  };

  // Filter lists based on selected facility
  const filteredMothers = mothers.filter(m => {
    const matchesFac = selectedFacilityFilter ? m.facility_id === selectedFacilityFilter : true;
    const matchesSearch = motherSearch ? (
      m.full_name?.toLowerCase().includes(motherSearch.toLowerCase()) ||
      m.phone?.toLowerCase().includes(motherSearch.toLowerCase()) ||
      m.clinic_number?.toLowerCase().includes(motherSearch.toLowerCase())
    ) : true;
    return matchesFac && matchesSearch;
  });

  const filteredChildren = children.filter(c => {
    // A child belongs to a mother. We need to check if their mother belongs to the filtered facility
    if (selectedFacilityFilter) {
      const mother = mothers.find(m => m.id === c.mother_id);
      return mother && mother.facility_id === selectedFacilityFilter;
    }
    return true;
  });

  const filteredNurses = nurses.filter(n => {
    return selectedFacilityFilter ? n.facility_id === selectedFacilityFilter : true;
  });

  // Calculate Metrics
  const totalFacilitiesCount = facilities.length;
  const totalNursesCount = filteredNurses.length;
  const totalMothersCount = filteredMothers.length;
  const totalChildrenCount = filteredChildren.length;

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-full bg-[#FAFAFA] flex flex-col justify-center items-center p-4 text-[#0047FF]">
        <div className="w-12 h-12 rounded-[16px] bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_8px_30px_rgba(59,130,246,0.15)] animate-bounce mb-4">
          <Heart size={20} className="text-white" fill="white" />
        </div>
        <div className="w-6 h-6 border-2 border-[#0047FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-inter text-[#0A0A0A] pb-16 md:pb-0">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0A]/40 backdrop-blur-sm md:hidden flex justify-start">
          <aside className="w-64 bg-white h-full flex flex-col shadow-2xl relative">
            <div className="px-6 py-6 border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-[#0047FF] flex items-center justify-center">
                  <Heart size={18} className="text-white" fill="white" />
                </div>
                <div>
                  <p className="text-[16px] font-extrabold text-[#0A0A0A] leading-none">TotoAfya</p>
                  <p className="text-[10px] text-[#0047FF] font-bold uppercase tracking-wider mt-1">Super Admin</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-slate-100 text-[#666666]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
              <button
                onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-[12px] w-full text-left transition-all ${
                  activeTab === 'overview' ? 'bg-[#0047FF] text-white font-bold' : 'text-[#666666] hover:bg-[#FAFAFA] font-semibold'
                }`}
              >
                <LayoutDashboard size={18} />
                <span className="text-[13px]">Overview</span>
              </button>

              <button
                onClick={() => { setActiveTab('facilities'); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-[12px] w-full text-left transition-all ${
                  activeTab === 'facilities' ? 'bg-[#0047FF] text-white font-bold' : 'text-[#666666] hover:bg-[#FAFAFA] font-semibold'
                }`}
              >
                <Building size={18} />
                <span className="text-[13px]">Facilities</span>
              </button>

              <button
                onClick={() => { setActiveTab('nurses'); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-[12px] w-full text-left transition-all ${
                  activeTab === 'nurses' ? 'bg-[#0047FF] text-white font-bold' : 'text-[#666666] hover:bg-[#FAFAFA] font-semibold'
                }`}
              >
                <Users size={18} />
                <span className="text-[13px]">Nurses & Staff</span>
              </button>

              <button
                onClick={() => { setActiveTab('patients'); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-[12px] w-full text-left transition-all duration-150 ${
                  activeTab === 'patients' ? 'bg-[#0047FF] text-white font-bold' : 'text-[#666666] hover:bg-[#FAFAFA] font-semibold'
                }`}
              >
                <Baby size={18} />
                <span className="text-[13px]">Patients Registry</span>
              </button>

              <button
                onClick={() => { setActiveTab('monitoring'); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-[12px] w-full text-left transition-all duration-150 ${
                  activeTab === 'monitoring' ? 'bg-[#0047FF] text-white font-bold' : 'text-[#666666] hover:bg-[#FAFAFA] font-semibold'
                }`}
              >
                <Activity size={18} />
                <span className="text-[13px]">Pilot Telemetry</span>
              </button>
            </nav>

            <div className="px-4 py-3 border-t border-[#E5E5E5]">
              <button
                onClick={() => { db.auth.logout(); setSidebarOpen(false); }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-[12px] w-full text-left text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold transition-all text-[13px]"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="p-4 border-t border-[#E5E5E5] text-[10px] text-[#A0A0A0]">
              <p className="font-semibold">TotoAfya Kenya Platform</p>
              <p className="mt-0.5">Global Admin Portal v1.0</p>
            </div>
          </aside>
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E5E5] hidden md:flex flex-col h-screen sticky top-0">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-[#E5E5E5] flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-[#0047FF] flex items-center justify-center shadow-[0_4px_16px_rgba(0,71,255,0.25)]">
            <Heart size={18} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-[16px] font-extrabold text-[#0A0A0A] leading-none">TotoAfya</p>
            <p className="text-[10px] text-[#0047FF] font-bold uppercase tracking-wider mt-1">Super Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 px-4 py-3 rounded-[12px] w-full text-left transition-all duration-150 ${
              activeTab === 'overview' ? 'bg-[#0047FF] text-white font-bold' : 'text-[#666666] hover:bg-[#FAFAFA] font-semibold'
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="text-[13px]">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('facilities')}
            className={`flex items-center gap-3 px-4 py-3 rounded-[12px] w-full text-left transition-all duration-150 ${
              activeTab === 'facilities' ? 'bg-[#0047FF] text-white font-bold' : 'text-[#666666] hover:bg-[#FAFAFA] font-semibold'
            }`}
          >
            <Building size={18} />
            <span className="text-[13px]">Facilities</span>
          </button>

          <button
            onClick={() => setActiveTab('nurses')}
            className={`flex items-center gap-3 px-4 py-3 rounded-[12px] w-full text-left transition-all duration-150 ${
              activeTab === 'nurses' ? 'bg-[#0047FF] text-white font-bold' : 'text-[#666666] hover:bg-[#FAFAFA] font-semibold'
            }`}
          >
            <Users size={18} />
            <span className="text-[13px]">Nurses & Staff</span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`flex items-center gap-3 px-4 py-3 rounded-[12px] w-full text-left transition-all duration-150 ${
              activeTab === 'patients' ? 'bg-[#0047FF] text-white font-bold' : 'text-[#666666] hover:bg-[#FAFAFA] font-semibold'
            }`}
          >
            <Baby size={18} />
            <span className="text-[13px]">Patients Registry</span>
          </button>

          <button
            onClick={() => setActiveTab('monitoring')}
            className={`flex items-center gap-3 px-4 py-3 rounded-[12px] w-full text-left transition-all duration-150 ${
              activeTab === 'monitoring' ? 'bg-[#0047FF] text-white font-bold' : 'text-[#666666] hover:bg-[#FAFAFA] font-semibold'
            }`}
          >
            <Activity size={18} />
            <span className="text-[13px]">Pilot Telemetry</span>
          </button>
        </nav>

        {/* Sign Out Button */}
        <div className="px-4 py-3 border-t border-[#E5E5E5]">
          <button
            onClick={() => db.auth.logout()}
            className="flex items-center gap-3 px-4 py-2.5 rounded-[12px] w-full text-left text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold transition-all duration-150 text-[13px]"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#E5E5E5] text-[10px] text-[#A0A0A0]">
          <p className="font-semibold">TotoAfya Kenya Platform</p>
          <p className="mt-0.5">Global Admin Portal v1.0</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E5E5] px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile hamburger button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-md hover:bg-slate-100 text-[#666666] md:hidden block"
            >
              <Menu size={20} />
            </button>
            <Layers size={18} className="text-[#0047FF] hidden sm:block" />
            <span className="text-[13px] font-bold text-[#666666]">Global Dashboard Filter:</span>
            
            <select
              value={selectedFacilityFilter}
              onChange={e => setSelectedFacilityFilter(e.target.value)}
              className="h-9 px-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-[10px] text-[12px] font-bold text-[#0A0A0A] outline-none focus:border-[#0047FF] cursor-pointer"
            >
              <option value="">All Facilities & Clinics</option>
              {facilities.map(fac => (
                <option key={fac.id} value={fac.id}>{fac.name} ({fac.facility_code})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={loadAllData}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FAFAFA] hover:bg-[#E5E5E5] text-[#666666] active:scale-95 transition-all"
              title="Refresh Data"
            >
              <RefreshCw size={15} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0047FF]/10 flex items-center justify-center">
                <span className="text-[12px] font-extrabold text-[#0047FF]">
                  {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SA'}
                </span>
              </div>
              <p className="text-[12px] font-bold text-[#0A0A0A]">{user?.email || 'cto@terraseptsolutions.com'}</p>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto animate-fade-in">
              
              {/* Tabs Router */}
              {activeTab === 'overview' && (
                loading ? (
                  <div>
                    <div className="mb-8">
                      <h1 className="text-[32px] font-black text-[#0A0A0A] tracking-[-0.03em]">System Overview</h1>
                      <p className="text-[14px] text-[#A0A0A0] mt-1">Aggregated statistics across registered medical channels.</p>
                    </div>
                    <MetricSkeleton />
                    <TableSkeleton />
                  </div>
                ) : (
                <div>
                  <div className="mb-8">
                    <h1 className="text-[32px] font-black text-[#0A0A0A] tracking-[-0.03em]">System Overview</h1>
                    <p className="text-[14px] text-[#A0A0A0] mt-1">Aggregated statistics across registered medical channels.</p>
                  </div>

                  {/* Dashboard metrics grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    
                    {/* Metric Card 1 */}
                    <div className="bg-white p-6 rounded-[22px] border border-[#E5E5E5] shadow-premium flex items-start justify-between">
                      <div>
                        <p className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Facilities</p>
                        <p className="text-[38px] font-extrabold text-[#0A0A0A] leading-none mt-2">{totalFacilitiesCount}</p>
                        <p className="text-[11px] text-[#A0A0A0] font-medium mt-2">Active healthcare providers</p>
                      </div>
                      <div className="w-10 h-10 rounded-[12px] bg-[#0047FF]/10 flex items-center justify-center text-[#0047FF]">
                        <Building size={18} />
                      </div>
                    </div>

                    {/* Metric Card 2 */}
                    <div className="bg-white p-6 rounded-[22px] border border-[#E5E5E5] shadow-premium flex items-start justify-between">
                      <div>
                        <p className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Nurses / Clinicians</p>
                        <p className="text-[38px] font-extrabold text-[#0A0A0A] leading-none mt-2">{totalNursesCount}</p>
                        <p className="text-[11px] text-[#A0A0A0] font-medium mt-2">Assigned medical operators</p>
                      </div>
                      <div className="w-10 h-10 rounded-[12px] bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED]">
                        <Users size={18} />
                      </div>
                    </div>

                    {/* Metric Card 3 */}
                    <div className="bg-white p-6 rounded-[22px] border border-[#E5E5E5] shadow-premium flex items-start justify-between">
                      <div>
                        <p className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Mothers Onboarded</p>
                        <p className="text-[38px] font-extrabold text-[#0A0A0A] leading-none mt-2">{totalMothersCount}</p>
                        <p className="text-[11px] text-[#A0A0A0] font-medium mt-2">Registered maternal accounts</p>
                      </div>
                      <div className="w-10 h-10 rounded-[12px] bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5]">
                        <Sparkles size={18} />
                      </div>
                    </div>

                    {/* Metric Card 4 */}
                    <div className="bg-white p-6 rounded-[22px] border border-[#E5E5E5] shadow-premium flex items-start justify-between">
                      <div>
                        <p className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Children Managed</p>
                        <p className="text-[38px] font-extrabold text-[#0A0A0A] leading-none mt-2">{totalChildrenCount}</p>
                        <p className="text-[11px] text-[#A0A0A0] font-medium mt-2">Immunized & monitored infants</p>
                      </div>
                      <div className="w-10 h-10 rounded-[12px] bg-[#E51010]/10 flex items-center justify-center text-[#E51010]">
                        <Baby size={18} />
                      </div>
                    </div>

                  </div>

                  {/* Info Cards / Guidance */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2 bg-white border border-[#E5E5E5] rounded-[24px] p-6 shadow-premium">
                      <h3 className="text-[16px] font-bold text-[#0A0A0A] mb-4">Quick Facility Operations</h3>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 p-4 rounded-[16px] bg-[#FAFAFA] border border-[#E5E5E5]/50">
                          <div className="w-8 h-8 rounded-full bg-[#0047FF] text-white flex items-center justify-center text-[13px] font-bold">1</div>
                          <div>
                            <p className="text-[13px] font-bold text-[#0A0A0A]">Register Facility</p>
                            <p className="text-[11px] text-[#666666] mt-0.5">Go to the Facilities tab to pre-register hospitals or clinics by entering their names and location.</p>
                          </div>
                          <button onClick={() => setActiveTab('facilities')} className="ml-auto w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0A0A0A] hover:bg-[#E5E5E5]">
                            <ArrowRight size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-[16px] bg-[#FAFAFA] border border-[#E5E5E5]/50">
                          <div className="w-8 h-8 rounded-full bg-[#0047FF] text-white flex items-center justify-center text-[13px] font-bold">2</div>
                          <div>
                            <p className="text-[13px] font-bold text-[#0A0A0A]">Register Nurse / Administrator</p>
                            <p className="text-[11px] text-[#666666] mt-0.5">Go to the Nurses tab to create staff accounts and associate them with a specific clinic.</p>
                          </div>
                          <button onClick={() => setActiveTab('nurses')} className="ml-auto w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0A0A0A] hover:bg-[#E5E5E5]">
                            <ArrowRight size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-[16px] bg-[#FAFAFA] border border-[#E5E5E5]/50">
                          <div className="w-8 h-8 rounded-full bg-[#0047FF] text-white flex items-center justify-center text-[13px] font-bold">3</div>
                          <div>
                            <p className="text-[13px] font-bold text-[#0A0A0A]">Onboard Mother / Patient</p>
                            <p className="text-[11px] text-[#666666] mt-0.5">Mothers onboarding via the mother portal will select from the pre-registered facilities.</p>
                          </div>
                          <button onClick={() => setActiveTab('patients')} className="ml-auto w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0A0A0A] hover:bg-[#E5E5E5]">
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-[#E5E5E5] rounded-[24px] p-6 shadow-premium flex flex-col">
                      <div className="w-10 h-10 rounded-[12px] bg-[#F9A825]/10 text-[#F9A825] flex items-center justify-center mb-4">
                        <Shield size={20} />
                      </div>
                      <h3 className="text-[15px] font-bold text-[#0A0A0A] mb-2">Security Notice</h3>
                      <p className="text-[12px] text-[#666666] leading-relaxed mb-4">
                        The Super Admin Portal is completely detached from the <strong>facility-pc</strong> application bundle. 
                        No local facility database has credentials or interface elements mapping back to super admin endpoints.
                      </p>
                      <div className="mt-auto bg-[#F9A825]/5 border border-[#F9A825]/20 p-3.5 rounded-[14px] flex items-start gap-2.5">
                        <AlertCircle size={15} className="text-[#F9A825] flex-shrink-0 mt-0.5" />
                        <span className="text-[10.5px] text-[#A07000] font-semibold leading-snug">
                          Hackers inside local networks cannot access global administrative metrics or alter other facilities' records.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                )
              )}

              {activeTab === 'facilities' && (
                loading ? <TableSkeleton /> : <FacilityFacilities facilities={facilities} onRefresh={loadAllData} />
              )}

              {activeTab === 'nurses' && (
                loading ? <TableSkeleton /> : <FacilityNurses nurses={nurses} facilities={facilities} onRefresh={loadAllData} />
              )}

              {activeTab === 'patients' && (
                loading ? (
                  <div>
                    <div className="mb-6">
                      <h1 className="text-[28px] font-extrabold text-[#0A0A0A] tracking-[-0.02em]">Patients Registry</h1>
                      <p className="text-[14px] text-[#A0A0A0] mt-1">Loading registered caregivers globally...</p>
                    </div>
                    <TableSkeleton />
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <h1 className="text-[28px] font-extrabold text-[#0A0A0A] tracking-[-0.02em]">Patients Registry</h1>
                      <p className="text-[14px] text-[#A0A0A0] mt-1">
                        {filteredMothers.length} mothers globally assigned to healthcare facilities
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-5">
                      <div className="relative flex-1 max-w-sm">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                        <input
                          value={motherSearch}
                          onChange={e => setMotherSearch(e.target.value)}
                          placeholder="Search by name, phone or clinic ID..."
                          className="w-full h-10 pl-9 pr-4 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#0047FF]"
                        />
                      </div>
                    </div>

                    <div className="bg-white rounded-[20px] border border-[#E5E5E5] shadow-premium overflow-x-auto">
                      <table className="w-full min-w-[700px]">
                        <thead className="bg-[#FAFAFA]">
                          <tr>
                            {['Mother Name', 'Clinic Number', 'Contact Number', 'Assigned Facility', 'Registered Date'].map(h => (
                              <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase font-bold text-[#A0A0A0] px-6 py-3.5">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredMothers.map(m => (
                            <tr key={m.id} className="border-t border-[#FAFAFA] hover:bg-[#FAFAFA]/50 transition-colors">
                              <td className="px-6 py-4">
                                <p className="text-[13px] font-semibold text-[#0A0A0A]">{m.full_name}</p>
                                <p className="text-[11px] text-[#A0A0A0]">{m.email || 'No email'}</p>
                              </td>
                              <td className="px-6 py-4 text-[12px] font-bold text-[#0047FF]">{m.clinic_number || '—'}</td>
                              <td className="px-6 py-4 text-[12px] text-[#666666]">{m.phone || '—'}</td>
                              <td className="px-6 py-4 text-[12px] text-[#666666] font-semibold">{getFacilityName(m.facility_id)}</td>
                              <td className="px-6 py-4 text-[12px] text-[#A0A0A0]">{m.created_date ? new Date(m.created_date).toLocaleDateString() : '—'}</td>
                            </tr>
                          ))}
                          {filteredMothers.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-[13px] text-[#A0A0A0]">No mothers found in selected facility registry</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              )}

              {activeTab === 'monitoring' && (
                <PilotMonitoring />
              )}

          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200 py-1.5 px-3 md:hidden backdrop-blur-md safe-bottom shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {[
            { key: 'overview', label: 'Overview', icon: LayoutDashboard },
            { key: 'facilities', label: 'Facilities', icon: Building },
            { key: 'nurses', label: 'Nurses', icon: Users },
            { key: 'patients', label: 'Patients', icon: Baby },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-[16px] min-w-[60px] transition-all active:scale-[0.92] ${
                  active ? 'text-[#0047FF]' : 'text-[#A0A0A0]'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[9px] font-bold uppercase tracking-wider leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
          
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
  );
}
