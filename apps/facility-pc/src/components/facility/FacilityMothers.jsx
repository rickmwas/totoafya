import React, { useState } from 'react';
import { Search, UserPlus, X, Key, Shield, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import db from '@/api/totoafyaClient';

const RISK_COLORS = {
  low: 'bg-[#2E5B47]/10 text-[#2E5B47]',
  medium: 'bg-[#F9A825]/10 text-[#F9A825]',
  high: 'bg-[#E51010]/10 text-[#E51010]',
  critical: 'bg-[#E51010]/10 text-[#E51010]',
};

const KENYA_VACCINE_SCHEDULE = [
  { name: 'BCG', age_weeks: 0 },
  { name: 'OPV 0', age_weeks: 0 },
  { name: 'OPV 1 + Penta 1 + PCV 1 + Rota 1', age_weeks: 6 },
  { name: 'OPV 2 + Penta 2 + PCV 2 + Rota 2', age_weeks: 10 },
  { name: 'OPV 3 + Penta 3 + PCV 3 + IPV', age_weeks: 14 },
  { name: 'Vitamin A + Measles 1', age_weeks: 36 },
  { name: 'Measles 2 + Vitamin A', age_weeks: 74 },
];

export default function FacilityMothers({ mothers, facilityId, onRefresh }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  // Onboarding Drawer States
  const [showAddForm, setShowAddForm] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState('form'); // 'form' | 'success'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Caregiver form state
  const [caregiver, setCaregiver] = useState({
    full_name: '',
    national_id: '',
    anc_number: '',
    phone: '',
    county: 'Nairobi',
    sub_county: '',
    blood_group: 'Unknown',
    pregnancy_status: 'pregnant',
    lmp: '',
    pin_code: '',
    caregiver_type: 'mother',
    language_preference: 'en',
  });

  // Child optional form state
  const [addChild, setAddChild] = useState(false);
  const [child, setChild] = useState({
    full_name: '',
    date_of_birth: new Date().toISOString().split('T')[0],
    gender: 'female',
    birth_weight_kg: '',
    birth_height_cm: '',
    birth_type: 'normal',
    gestational_age_weeks: '',
  });

  // Registered credentials data for display
  const [credentials, setCredentials] = useState(null);

  const filtered = mothers.filter(m => {
    const matchSearch = m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.national_id?.includes(search) || m.phone?.includes(search);
    const matchStatus = filterStatus === 'all' || m.pregnancy_status === filterStatus;
    const matchRisk = filterRisk === 'all' || m.risk_level === filterRisk;
    const matchRole = filterRole === 'all' || (m.caregiver_type || 'mother') === filterRole;
    return matchSearch && matchStatus && matchRisk && matchRole;
  });

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!caregiver.full_name || !caregiver.pin_code) {
      setError('Caregiver Full Name and 4-Digit Security PIN are required.');
      return;
    }
    if (!caregiver.national_id && !caregiver.anc_number) {
      setError('Please provide at least a National ID or an ANC Number.');
      return;
    }
    if (!/^\d{4}$/.test(caregiver.pin_code.trim())) {
      setError('Security PIN must be a 4-digit number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Create caregiver profile
      const newMother = await db.entities.Mother.create({
        ...caregiver,
        facility_id: facilityId,
        national_id: caregiver.national_id || null,
        anc_number: caregiver.anc_number || null,
        edd: caregiver.lmp ? new Date(new Date(caregiver.lmp).getTime() + 280 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
        profile_complete: true,
      });

      let childRegistered = false;
      let newChild = null;

      // 2. Add child details if checked
      if (addChild && child.full_name && child.date_of_birth) {
        newChild = await db.entities.Child.create({
          mother_id: newMother.id,
          full_name: child.full_name,
          date_of_birth: child.date_of_birth,
          gender: child.gender,
          birth_weight_kg: parseFloat(child.birth_weight_kg) || null,
          birth_height_cm: parseFloat(child.birth_height_cm) || null,
          birth_type: child.birth_type,
          gestational_age_weeks: parseInt(child.gestational_age_weeks) || null,
          health_status: 'healthy',
        });

        // 3. Auto-seed vaccine schedules
        const dobDate = new Date(child.date_of_birth);
        const vaccineRecords = KENYA_VACCINE_SCHEDULE.map(v => ({
          child_id: newChild.id,
          vaccine_name: v.name,
          age_weeks: v.age_weeks,
          scheduled_date: new Date(dobDate.getTime() + v.age_weeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'scheduled',
          dose_number: 1,
        }));
        await db.entities.Immunization.bulkCreate(vaccineRecords);
        childRegistered = true;
      }

      setCredentials({
        identifier: caregiver.national_id || caregiver.anc_number,
        pin: caregiver.pin_code,
        caregiverName: caregiver.full_name,
        childName: childRegistered ? child.full_name : null,
      });

      setOnboardingStep('success');
      onRefresh();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeDrawer = () => {
    setShowAddForm(false);
    setOnboardingStep('form');
    setCredentials(null);
    setError('');
    setCaregiver({
      full_name: '',
      national_id: '',
      anc_number: '',
      phone: '',
      county: 'Nairobi',
      sub_county: '',
      blood_group: 'Unknown',
      pregnancy_status: 'pregnant',
      lmp: '',
      pin_code: '',
      caregiver_type: 'mother',
      language_preference: 'en',
    });
    setAddChild(false);
    setChild({
      full_name: '',
      date_of_birth: new Date().toISOString().split('T')[0],
      gender: 'female',
      birth_weight_kg: '',
      birth_height_cm: '',
      birth_type: 'normal',
      gestational_age_weeks: '',
    });
  };

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0A0A0A] tracking-[-0.02em]">Mothers & Caregivers</h1>
          <p className="text-[14px] text-[#A0A0A0] mt-1">{mothers.length} registered caregivers</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-[#2E5B47] hover:bg-[#003CE5] active:scale-95 text-white text-[13px] font-bold rounded-[12px] shadow-sm transition-all"
        >
          <UserPlus size={15} />
          Onboard Caregiver
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID or phone..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#2E5B47] transition-all"
          />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="h-10 px-3 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] cursor-pointer">
          <option value="all">All Roles</option>
          <option value="mother">Mother</option>
          <option value="father">Father</option>
          <option value="guardian">Guardian</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-10 px-3 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] cursor-pointer">
          <option value="all">All Status</option>
          <option value="pregnant">Pregnant</option>
          <option value="postpartum">Postpartum</option>
          <option value="not_pregnant">Not Pregnant</option>
        </select>
        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
          className="h-10 px-3 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] cursor-pointer">
          <option value="all">All Risk Levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] border border-[#E5E5E5] shadow-card overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-[#F5F5F7]">
            <tr>
              {['Name', 'Role', 'National ID', 'Phone', 'Status', 'Risk', 'EDD', 'County', 'Facility', 'Registered'].map(h => (
                <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase font-bold text-[#A0A0A0] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-t border-[#F5F5F7] hover:bg-[#F5F5F7]/50 transition-colors">
                <td className="px-4 py-3 text-[13px] font-semibold text-[#0A0A0A] whitespace-nowrap">{m.full_name}</td>
                <td className="px-4 py-3 text-[12px] capitalize font-medium text-[#666666]">{m.caregiver_type || 'mother'}</td>
                <td className="px-4 py-3 text-[12px] text-[#666666]">{m.national_id || '—'}</td>
                <td className="px-4 py-3 text-[12px] text-[#666666]">{m.phone || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    m.pregnancy_status === 'pregnant' ? 'bg-[#2E5B47]/10 text-[#2E5B47]' :
                    m.pregnancy_status === 'postpartum' ? 'bg-[#2E5B47]/10 text-[#2E5B47]' : 'bg-[#F5F5F7] text-[#666666]'
                  }`}>{m.pregnancy_status}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${RISK_COLORS[m.risk_level] || RISK_COLORS.low}`}>
                    {m.risk_level || 'low'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#666666]">{m.edd || '—'}</td>
                <td className="px-4 py-3 text-[12px] text-[#666666]">{m.county || '—'}</td>
                <td className="px-4 py-3 text-[12px] text-[#666666] max-w-[140px] truncate">{m.facility_name || '—'}</td>
                <td className="px-4 py-3 text-[12px] text-[#A0A0A0]">{new Date(m.created_date).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-[13px] text-[#A0A0A0]">No caregivers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Caregiver Drawer Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end transition-opacity duration-350">
          <div className="w-full max-w-[460px] bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-[#F5F5F7] pb-4 mb-6">
              <h2 className="text-[18px] font-extrabold text-[#0A0A0A]">
                {onboardingStep === 'form' ? 'Onboard Caregiver & Child' : 'Credentials Generated'}
              </h2>
              {onboardingStep === 'form' && (
                <button
                  onClick={closeDrawer}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F7] text-[#666666] transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {onboardingStep === 'form' ? (
              <form onSubmit={handleOnboardSubmit} className="flex-grow flex flex-col gap-5">
                {error && (
                  <div className="text-[12px] text-[#E51010] bg-[#E51010]/5 border border-[#E51010]/15 p-3 rounded-[12px] flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Section 1: Caregiver */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-[11px] tracking-[0.1em] font-extrabold text-[#2E5B47] uppercase border-b border-[#F5F5F7] pb-1">1. Caregiver Details</h3>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={caregiver.full_name}
                      onChange={e => setCaregiver(c => ({ ...c, full_name: e.target.value }))}
                      placeholder="e.g. Mary Atieno"
                      className="h-11 px-3.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">National ID</label>
                      <input
                        type="text"
                        value={caregiver.national_id}
                        onChange={e => setCaregiver(c => ({ ...c, national_id: e.target.value }))}
                        placeholder="ID number"
                        className="h-11 px-3.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">ANC Number</label>
                      <input
                        type="text"
                        value={caregiver.anc_number}
                        onChange={e => setCaregiver(c => ({ ...c, anc_number: e.target.value }))}
                        placeholder="ANC number"
                        className="h-11 px-3.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">Caregiver Type</label>
                      <select
                        value={caregiver.caregiver_type}
                        onChange={e => setCaregiver(c => ({ ...c, caregiver_type: e.target.value }))}
                        className="h-11 px-2.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="mother">Mother</option>
                        <option value="father">Father</option>
                        <option value="guardian">Guardian</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">Phone Number</label>
                      <input
                        type="tel"
                        value={caregiver.phone}
                        onChange={e => setCaregiver(c => ({ ...c, phone: e.target.value }))}
                        placeholder="e.g. 0712345678"
                        className="h-11 px-3.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">Pregnancy Status</label>
                      <select
                        value={caregiver.pregnancy_status}
                        onChange={e => setCaregiver(c => ({ ...c, pregnancy_status: e.target.value, lmp: e.target.value !== 'pregnant' ? '' : c.lmp }))}
                        className="h-11 px-2.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="pregnant">Pregnant</option>
                        <option value="postpartum">Postpartum</option>
                        <option value="not_pregnant">Not Pregnant</option>
                      </select>
                    </div>
                    {caregiver.pregnancy_status === 'pregnant' ? (
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">LMP Date</label>
                        <input
                          type="date"
                          value={caregiver.lmp}
                          onChange={e => setCaregiver(c => ({ ...c, lmp: e.target.value }))}
                          className="h-11 px-3 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">Blood Group</label>
                        <select
                          value={caregiver.blood_group}
                          onChange={e => setCaregiver(c => ({ ...c, blood_group: e.target.value }))}
                          className="h-11 px-2.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all cursor-pointer"
                        >
                          <option value="Unknown">Unknown</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">County</label>
                      <input
                        type="text"
                        value={caregiver.county}
                        onChange={e => setCaregiver(c => ({ ...c, county: e.target.value }))}
                        className="h-11 px-3.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">Security PIN (4 digits) *</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={caregiver.pin_code}
                        onChange={e => setCaregiver(c => ({ ...c, pin_code: e.target.value.replace(/\D/g, '') }))}
                        placeholder="e.g. 1234"
                        className="h-11 px-3.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] font-mono text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Optional Child */}
                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex items-center gap-2 border-b border-[#F5F5F7] pb-1">
                    <input
                      type="checkbox"
                      id="addChildCheckbox"
                      checked={addChild}
                      onChange={e => setAddChild(e.target.checked)}
                      className="w-4 h-4 accent-[#2E5B47] rounded cursor-pointer"
                    />
                    <label htmlFor="addChildCheckbox" className="text-[11px] tracking-[0.1em] font-extrabold text-[#2E5B47] uppercase cursor-pointer select-none">
                      2. Add Child Profile (Optional)
                    </label>
                  </div>

                  {addChild && (
                    <div className="flex flex-col gap-4 border border-[#E5E5E5] p-4 rounded-[16px] bg-[#F5F5F7]/30 animate-in fade-in duration-200">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">Child Full Name *</label>
                        <input
                          type="text"
                          required={addChild}
                          value={child.full_name}
                          onChange={e => setChild(c => ({ ...c, full_name: e.target.value }))}
                          placeholder="e.g. Imani Atieno"
                          className="h-11 px-3.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">Date of Birth *</label>
                          <input
                            type="date"
                            required={addChild}
                            value={child.date_of_birth}
                            onChange={e => setChild(c => ({ ...c, date_of_birth: e.target.value }))}
                            className="h-11 px-3 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">Gender *</label>
                          <select
                            value={child.gender}
                            onChange={e => setChild(c => ({ ...c, gender: e.target.value }))}
                            className="h-11 px-2.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all cursor-pointer"
                          >
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">Weight (kg)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={child.birth_weight_kg}
                            onChange={e => setChild(c => ({ ...c, birth_weight_kg: e.target.value }))}
                            placeholder="3.2"
                            className="h-11 px-2.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">Height (cm)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={child.birth_height_cm}
                            onChange={e => setChild(c => ({ ...c, birth_height_cm: e.target.value }))}
                            placeholder="50"
                            className="h-11 px-2.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-[#A0A0A0] uppercase tracking-wider px-0.5">Gest. Age (wks)</label>
                          <input
                            type="number"
                            value={child.gestational_age_weeks}
                            onChange={e => setChild(c => ({ ...c, gestational_age_weeks: e.target.value }))}
                            placeholder="40"
                            className="h-11 px-2.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-6 flex flex-col gap-2 border-t border-[#F5F5F7]">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-[#2E5B47] hover:bg-[#003CE5] active:scale-[0.98] transition-all text-white text-[14px] font-bold rounded-[14px] flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Onboard Caregiver & Initialize'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="w-full h-11 border border-[#E5E5E5] hover:bg-[#F5F5F7] text-[#666666] text-[13px] font-semibold rounded-[14px] active:scale-[0.98] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 bg-[#2E5B47]/10 text-[#2E5B47] rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={36} />
                </div>
                
                <h3 className="text-[20px] font-black text-[#0A0A0A] mb-1">Onboarding Completed!</h3>
                <p className="text-[13px] text-[#A0A0A0] max-w-xs mb-8 leading-relaxed">
                  Caregiver is registered under facility records. Copy credentials below for their first-time login activation.
                </p>

                <div className="w-full max-w-sm bg-[#FAFBFB] border border-[#2E5B47]/20 rounded-[20px] p-6 shadow-sm mb-8 flex flex-col gap-4 relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 bg-[#2E5B47]/10 text-[#2E5B47] text-[9px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-bl-[12px]">
                    Security Pass
                  </div>
                  
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0]">Caregiver Name</p>
                    <p className="text-[14px] font-bold text-[#0A0A0A]">{credentials?.caregiverName}</p>
                  </div>

                  {credentials?.childName && (
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0]">Linked Child</p>
                      <p className="text-[13px] font-bold text-[#0A0A0A]">{credentials.childName}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 border-t border-[#E5E5E5]/50 pt-4">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0]">Login ID</p>
                      <p className="text-[15px] font-extrabold text-[#2E5B47] font-mono select-all bg-white px-2 py-0.5 rounded border border-[#E5E5E5] w-fit">
                        {credentials?.identifier}
                      </p>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0]">PIN Code</p>
                      <p className="text-[15px] font-extrabold text-[#2E5B47] font-mono select-all bg-white px-2 py-0.5 rounded border border-[#E5E5E5] w-fit">
                        {credentials?.pin}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-sm text-left bg-white border border-[#E5E5E5] rounded-[16px] p-4 text-[12px] text-[#555555] flex flex-col gap-2">
                  <p className="font-bold text-[#0A0A0A]">How to Sign-in / Jinsi ya Kuingia:</p>
                  <div className="flex gap-2 text-[11px] leading-relaxed">
                    <ArrowRight size={13} className="text-[#2E5B47] flex-shrink-0 mt-0.5" />
                    <p><strong>EN:</strong> Log into the mother portal PWA or app using the login ID and PIN code above to finalize profile linking.</p>
                  </div>
                  <div className="flex gap-2 text-[11px] leading-relaxed">
                    <ArrowRight size={13} className="text-[#2E5B47] flex-shrink-0 mt-0.5" />
                    <p><strong>SW:</strong> Ingia kwenye PWA ya mama au app ukitumia kitambulisho cha kuingia na PIN hapo juu ili kuunganisha wasifu.</p>
                  </div>
                </div>

                <button
                  onClick={closeDrawer}
                  className="mt-8 w-full max-w-sm h-12 bg-[#2E5B47] hover:bg-[#003CE5] active:scale-[0.98] transition-all text-white text-[14px] font-bold rounded-[14px]"
                >
                  Finish & Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
