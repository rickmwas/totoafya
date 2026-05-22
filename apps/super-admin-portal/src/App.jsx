import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Building, Users, Baby, Heart, Shield, Sparkles, 
  Search, ArrowRight, Grid, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import db from '@/api/totoafyaClient';
import FacilityFacilities from './components/FacilityFacilities';
import FacilityNurses from './components/FacilityNurses';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [mothers, setMothers] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Search terms
  const [motherSearch, setMotherSearch] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const activeUser = await db.auth.me();
      setUser(activeUser);

      // Load all entities globally
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

  // Switch mock roles for demo purposes
  const handleSwitchRole = (role) => {
    db.auth.switchMockRole(role);
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

  return (
    <div className="flex min-h-screen bg-[#F5F5F7] font-inter text-[#0A0A0A]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#E5E5E5] flex flex-col h-screen sticky top-0">
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
              activeTab === 'overview' ? 'bg-[#0047FF] text-white font-bold' : 'text-[#666666] hover:bg-[#F5F5F7] font-semibold'
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="text-[13px]">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('facilities')}
            className={`flex items-center gap-3 px-4 py-3 rounded-[12px] w-full text-left transition-all duration-150 ${
              activeTab === 'facilities' ? 'bg-[#0047FF] text-white font-bold' : 'text-[#666666] hover:bg-[#F5F5F7] font-semibold'
            }`}
          >
            <Building size={18} />
            <span className="text-[13px]">Facilities</span>
          </button>

          <button
            onClick={() => setActiveTab('nurses')}
            className={`flex items-center gap-3 px-4 py-3 rounded-[12px] w-full text-left transition-all duration-150 ${
              activeTab === 'nurses' ? 'bg-[#0047FF] text-white font-bold' : 'text-[#666666] hover:bg-[#F5F5F7] font-semibold'
            }`}
          >
            <Users size={18} />
            <span className="text-[13px]">Nurses & Staff</span>
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`flex items-center gap-3 px-4 py-3 rounded-[12px] w-full text-left transition-all duration-150 ${
              activeTab === 'patients' ? 'bg-[#0047FF] text-white font-bold' : 'text-[#666666] hover:bg-[#F5F5F7] font-semibold'
            }`}
          >
            <Baby size={18} />
            <span className="text-[13px]">Patients Registry</span>
          </button>
        </nav>

        {/* Mock Switches (Demo Mode Only) */}
        <div className="p-4 border-t border-[#E5E5E5] bg-[#F5F5F7]/50">
          <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider mb-2 px-1">Active Sandbox</p>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleSwitchRole('super_admin')}
              className="text-left text-[11px] font-bold text-[#0047FF] px-2 py-1.5 rounded-md hover:bg-white border border-transparent hover:border-[#E5E5E5] transition-all"
            >
              👑 Super Admin Mode
            </button>
            <button
              onClick={() => handleSwitchRole('facility_admin')}
              className="text-left text-[11px] font-medium text-[#666666] px-2 py-1.5 rounded-md hover:bg-white border border-transparent hover:border-[#E5E5E5] transition-all"
            >
              🏥 Facility Admin (Port 5002)
            </button>
            <button
              onClick={() => handleSwitchRole('nurse')}
              className="text-left text-[11px] font-medium text-[#666666] px-2 py-1.5 rounded-md hover:bg-white border border-transparent hover:border-[#E5E5E5] transition-all"
            >
              👩‍⚕️ Nurse Portal (Port 5001)
            </button>
          </div>
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
        <header className="bg-white border-b border-[#E5E5E5] px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Layers size={18} className="text-[#0047FF]" />
            <span className="text-[13px] font-bold text-[#666666]">Global Dashboard Filter:</span>
            
            <select
              value={selectedFacilityFilter}
              onChange={e => setSelectedFacilityFilter(e.target.value)}
              className="h-9 px-3 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[10px] text-[12px] font-bold text-[#0A0A0A] outline-none focus:border-[#0047FF] cursor-pointer"
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
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-[#E5E5E5] text-[#666666] active:scale-95 transition-all"
              title="Refresh Data"
            >
              <RefreshCw size={15} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0047FF]/10 flex items-center justify-center">
                <span className="text-[12px] font-extrabold text-[#0047FF]">SA</span>
              </div>
              <p className="text-[12px] font-bold text-[#0A0A0A]">super@totoafya.org</p>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <div className="w-12 h-12 rounded-[16px] bg-[#0047FF] flex items-center justify-center shadow-[0_8px_30px_rgba(0,71,255,0.25)] animate-bounce">
                <Heart size={20} className="text-white" fill="white" />
              </div>
              <div className="w-6 h-6 border-2 border-[#0047FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="max-w-6xl mx-auto animate-fade-in">
              
              {/* Tabs Router */}
              {activeTab === 'overview' && (
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
                      <div className="w-10 h-10 rounded-[12px] bg-[#2E7A5D]/10 flex items-center justify-center text-[#2E7A5D]">
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
                        <div className="flex items-center gap-4 p-4 rounded-[16px] bg-[#F5F5F7] border border-[#E5E5E5]/50">
                          <div className="w-8 h-8 rounded-full bg-[#0047FF] text-white flex items-center justify-center text-[13px] font-bold">1</div>
                          <div>
                            <p className="text-[13px] font-bold text-[#0A0A0A]">Register Facility</p>
                            <p className="text-[11px] text-[#666666] mt-0.5">Go to the Facilities tab to pre-register hospitals or clinics by entering their names and location.</p>
                          </div>
                          <button onClick={() => setActiveTab('facilities')} className="ml-auto w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0A0A0A] hover:bg-[#E5E5E5]">
                            <ArrowRight size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-[16px] bg-[#F5F5F7] border border-[#E5E5E5]/50">
                          <div className="w-8 h-8 rounded-full bg-[#0047FF] text-white flex items-center justify-center text-[13px] font-bold">2</div>
                          <div>
                            <p className="text-[13px] font-bold text-[#0A0A0A]">Register Nurse / Administrator</p>
                            <p className="text-[11px] text-[#666666] mt-0.5">Go to the Nurses tab to create staff accounts and associate them with a specific clinic.</p>
                          </div>
                          <button onClick={() => setActiveTab('nurses')} className="ml-auto w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0A0A0A] hover:bg-[#E5E5E5]">
                            <ArrowRight size={14} />
                          </button>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-[16px] bg-[#F5F5F7] border border-[#E5E5E5]/50">
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
              )}

              {activeTab === 'facilities' && (
                <FacilityFacilities facilities={facilities} onRefresh={loadAllData} />
              )}

              {activeTab === 'nurses' && (
                <FacilityNurses nurses={nurses} facilities={facilities} onRefresh={loadAllData} />
              )}

              {activeTab === 'patients' && (
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
                      <thead className="bg-[#F5F5F7]">
                        <tr>
                          {['Mother Name', 'Clinic Number', 'Contact Number', 'Assigned Facility', 'Registered Date'].map(h => (
                            <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase font-bold text-[#A0A0A0] px-6 py-3.5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMothers.map(m => (
                          <tr key={m.id} className="border-t border-[#F5F5F7] hover:bg-[#F5F5F7]/50 transition-colors">
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
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
