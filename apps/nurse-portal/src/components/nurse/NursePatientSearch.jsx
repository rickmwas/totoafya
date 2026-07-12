import db from '@/api/totoafyaClient';
import React, { useState } from 'react';
import { Search, X, UserPlus, Shield, Mail, Key, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const KENYA_VACCINE_SCHEDULE = [
  { name: 'BCG', age_weeks: 0 },
  { name: 'OPV 0', age_weeks: 0 },
  { name: 'OPV 1 + Penta 1 + PCV 1 + Rota 1', age_weeks: 6 },
  { name: 'OPV 2 + Penta 2 + PCV 2 + Rota 2', age_weeks: 10 },
  { name: 'OPV 3 + Penta 3 + PCV 3 + IPV', age_weeks: 14 },
  { name: 'Vitamin A + Measles 1', age_weeks: 36 },
  { name: 'Measles 2 + Vitamin A', age_weeks: 74 },
];

export default function NursePatientSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Onboarding modal states
  const [showOnboard, setShowOnboard] = useState(false);
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

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const currentUser = await db.auth.me();
      let all;
      if (currentUser && currentUser.role === 'super_admin') {
        all = await db.entities.Mother.list('-created_date', 100);
      } else if (currentUser && currentUser.facility_id) {
        all = await db.entities.Mother.filter({ facility_id: currentUser.facility_id }, '-created_date', 100);
      } else {
        all = [];
      }
      const q = query.toLowerCase();
      const filtered = all.filter(m =>
        m.full_name?.toLowerCase().includes(q) ||
        m.anc_number?.toLowerCase().includes(q) ||
        m.national_id?.includes(q) ||
        m.phone?.includes(q)
      );
      setResults(filtered);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

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
      const currentUser = await db.auth.me();
      const facilityId = currentUser?.facility_id || null;

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
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeOnboarding = () => {
    setShowOnboard(false);
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
    handleSearch();
  };

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E5E5E5] rounded-[16px] px-4 focus-within:border-[#0F4C81] transition-colors">
          <Search size={17} className="text-[#A0A0A0] flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name, ANC number, ID or phone..."
            className="flex-1 h-12 text-[14px] font-medium text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none bg-transparent"
          />
          {query && (
            <button onClick={clear}>
              <X size={15} className="text-[#A0A0A0]" />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="h-12 px-5 bg-[#0F4C81] text-white text-[13px] font-bold rounded-[16px] disabled:opacity-50 active:scale-[0.97] transition-all shadow-green-glow"
        >
          {loading ? '...' : 'Search'}
        </button>
        <button
          onClick={() => setShowOnboard(true)}
          className="h-12 px-4 bg-[#006B5F] hover:bg-[#005c52] text-white text-[13px] font-bold rounded-[16px] flex items-center gap-1.5 active:scale-[0.97] transition-all"
        >
          <UserPlus size={15} />
          Onboard
        </button>
      </div>

      {searched && (
        <div className="mt-3">
          {results.length === 0 ? (
            <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-6 text-center">
              <p className="text-[14px] font-bold text-[#0A0A0A] mb-1">No patients found</p>
              <p className="text-[12px] text-[#A0A0A0]">Try searching by a different name, ANC number, or phone</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map(p => (
                <button
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className="bg-white rounded-[20px] border border-[#E5E5E5] p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-all shadow-card hover:border-[#0F4C81]/40"
                >
                  <div className="w-10 h-10 rounded-[12px] bg-[#006B5F]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-extrabold text-[#006B5F]">
                      {p.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#0A0A0A] truncate">{p.full_name}</p>
                    <p className="text-[11px] text-[#A0A0A0]">
                      {[p.anc_number, p.phone, p.county].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0F4C81] bg-[#0F4C81]/10 px-2.5 py-1 rounded-full flex-shrink-0">
                    Open →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Onboarding Overlay Modal */}
      {showOnboard && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] border border-[#E5E5E5] w-full max-w-xl max-h-[90vh] flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] px-6 py-4">
              <h2 className="text-[18px] font-extrabold text-[#0A0A0A]">
                {onboardingStep === 'form' ? 'Clinical Patient Intake Form' : 'Credentials Generated'}
              </h2>
              {onboardingStep === 'form' && (
                <button
                  onClick={() => { setShowOnboard(false); setError(''); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F6F8] text-[#666666] hover:bg-[#E5E5E5]"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {onboardingStep === 'form' ? (
                <form onSubmit={handleOnboardSubmit} className="flex flex-col gap-5">
                  {error && (
                    <div className="text-[12px] text-[#D13438] bg-[#FFF5F5] border border-[#D13438]/15 p-3 rounded-[12px] flex items-center gap-2">
                      <AlertCircle size={15} />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Section 1: Caregiver Details */}
                  <div>
                    <h3 className="text-[12px] font-extrabold text-[#0F4C81] uppercase tracking-wider border-b border-[#E5E5E5] pb-1.5 mb-4">1. Caregiver Profile</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={caregiver.full_name}
                          onChange={e => setCaregiver(c => ({ ...c, full_name: e.target.value }))}
                          placeholder="Mother / Caregiver Name"
                          className="h-11 px-3.5 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Phone Number</label>
                        <input
                          type="tel"
                          value={caregiver.phone}
                          onChange={e => setCaregiver(c => ({ ...c, phone: e.target.value }))}
                          placeholder="e.g. 0712345678"
                          className="h-11 px-3.5 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">National ID *</label>
                        <input
                          type="text"
                          value={caregiver.national_id}
                          onChange={e => setCaregiver(c => ({ ...c, national_id: e.target.value }))}
                          placeholder="ID Number (Required if no ANC)"
                          className="h-11 px-3.5 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">ANC Visit Number</label>
                        <input
                          type="text"
                          value={caregiver.anc_number}
                          onChange={e => setCaregiver(c => ({ ...c, anc_number: e.target.value }))}
                          placeholder="ANC-XXXX (Required if no ID)"
                          className="h-11 px-3.5 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Caregiver Type</label>
                        <select
                          value={caregiver.caregiver_type}
                          onChange={e => setCaregiver(c => ({ ...c, caregiver_type: e.target.value }))}
                          className="h-11 px-3 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
                        >
                          <option value="mother">Mother</option>
                          <option value="father">Father</option>
                          <option value="guardian">Guardian</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Blood Group</label>
                        <select
                          value={caregiver.blood_group}
                          onChange={e => setCaregiver(c => ({ ...c, blood_group: e.target.value }))}
                          className="h-11 px-3 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
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

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">County</label>
                        <input
                          type="text"
                          value={caregiver.county}
                          onChange={e => setCaregiver(c => ({ ...c, county: e.target.value }))}
                          placeholder="e.g. Nairobi"
                          className="h-11 px-3.5 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Pregnancy Status</label>
                        <select
                          value={caregiver.pregnancy_status}
                          onChange={e => setCaregiver(c => ({ ...c, pregnancy_status: e.target.value, lmp: e.target.value !== 'pregnant' ? '' : c.lmp }))}
                          className="h-11 px-3 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
                        >
                          <option value="pregnant">Pregnant</option>
                          <option value="postpartum">Postpartum</option>
                          <option value="not_pregnant">Not Pregnant</option>
                        </select>
                      </div>

                      {caregiver.pregnancy_status === 'pregnant' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Last Menstrual Period (LMP)</label>
                          <input
                            type="date"
                            value={caregiver.lmp}
                            onChange={e => setCaregiver(c => ({ ...c, lmp: e.target.value }))}
                            className="h-11 px-3.5 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
                          />
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Security PIN (4 Digits) *</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={caregiver.pin_code}
                          onChange={e => setCaregiver(c => ({ ...c, pin_code: e.target.value.replace(/\D/g, '') }))}
                          placeholder="e.g. 1234"
                          className="h-11 px-3.5 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] font-mono text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Child optional section */}
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        id="addChildCheckbox"
                        checked={addChild}
                        onChange={e => setAddChild(e.target.checked)}
                        className="w-4.5 h-4.5 accent-[#0F4C81] rounded cursor-pointer"
                      />
                      <label htmlFor="addChildCheckbox" className="text-[13px] font-extrabold text-[#0F4C81] uppercase tracking-wider cursor-pointer">
                        2. Onboard Child Profile (Optional)
                      </label>
                    </div>

                    {addChild && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[#E5E5E5] p-4 rounded-[16px] bg-[#F4F6F8]/30 animate-in fade-in duration-200">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Child Name *</label>
                          <input
                            type="text"
                            required={addChild}
                            value={child.full_name}
                            onChange={e => setChild(c => ({ ...c, full_name: e.target.value }))}
                            placeholder="Child Full Name"
                            className="h-11 px-3.5 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Date of Birth *</label>
                          <input
                            type="date"
                            required={addChild}
                            value={child.date_of_birth}
                            onChange={e => setChild(c => ({ ...c, date_of_birth: e.target.value }))}
                            className="h-11 px-3.5 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Gender *</label>
                          <select
                            value={child.gender}
                            onChange={e => setChild(c => ({ ...c, gender: e.target.value }))}
                            className="h-11 px-3 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
                          >
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Birth Weight (kg)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={child.birth_weight_kg}
                            onChange={e => setChild(c => ({ ...c, birth_weight_kg: e.target.value }))}
                            placeholder="e.g. 3.2"
                            className="h-11 px-3.5 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Birth Height (cm)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={child.birth_height_cm}
                            onChange={e => setChild(c => ({ ...c, birth_height_cm: e.target.value }))}
                            placeholder="e.g. 50"
                            className="h-11 px-3.5 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Gestational Age (weeks)</label>
                          <input
                            type="number"
                            value={child.gestational_age_weeks}
                            onChange={e => setChild(c => ({ ...c, gestational_age_weeks: e.target.value }))}
                            placeholder="e.g. 40"
                            className="h-11 px-3.5 bg-[#F4F6F8] border border-transparent rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0F4C81] focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 border-t border-[#E5E5E5] pt-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowOnboard(false)}
                      className="px-5 h-11 border border-[#E5E5E5] text-[#666666] text-[13px] font-semibold rounded-[12px] hover:bg-[#F4F6F8] active:scale-[0.98] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 h-11 bg-[#0F4C81] text-white text-[13px] font-bold rounded-[12px] hover:bg-[#235C45] disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-green-glow"
                    >
                      {submitting ? 'Registering...' : 'Register Family Unit'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="w-16 h-16 bg-[#0F4C81]/10 text-[#0F4C81] rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={36} />
                  </div>
                  
                  <h3 className="text-[22px] font-black text-[#0A0A0A] mb-1">Onboarding Completed!</h3>
                  <p className="text-[13px] text-[#A0A0A0] max-w-sm mb-8 leading-relaxed">
                    The caregiver has been successfully registered. Share the credentials below for PWA/Native mobile sign-in.
                  </p>

                  <div className="w-full max-w-md bg-[#F7F5F0] border border-[#0F4C81]/20 rounded-[20px] p-6 shadow-sm mb-8 flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#0F4C81]/10 text-[#0F4C81] text-[9px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-bl-[12px]">
                      Security Pass
                    </div>
                    
                    <div className="flex flex-col items-start gap-1">
                      <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0]">Caregiver Name</p>
                      <p className="text-[15px] font-bold text-[#0A0A0A]">{credentials?.caregiverName}</p>
                    </div>

                    {credentials?.childName && (
                      <div className="flex flex-col items-start gap-1">
                        <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0]">Child Profile</p>
                        <p className="text-[14px] font-bold text-[#0A0A0A]">{credentials.childName}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 border-t border-[#E5E5E5]/50 pt-4">
                      <div className="flex flex-col items-start gap-1">
                        <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0]">Sign-in ID</p>
                        <p className="text-[16px] font-extrabold text-[#0F4C81] font-mono select-all bg-white px-2 py-0.5 rounded border border-[#E5E5E5]">
                          {credentials?.identifier}
                        </p>
                      </div>
                      <div className="flex flex-col items-start gap-1">
                        <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0]">Security PIN</p>
                        <p className="text-[16px] font-extrabold text-[#0F4C81] font-mono select-all bg-white px-2 py-0.5 rounded border border-[#E5E5E5]">
                          {credentials?.pin}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full max-w-md text-left bg-white border border-[#E5E5E5] rounded-[16px] p-4 text-[12px] text-[#555555] flex flex-col gap-2.5">
                    <p className="font-bold text-[#0A0A0A]">Sign-in Guide / Maelezo ya Kuingia:</p>
                    <div className="flex gap-2">
                      <ArrowRight size={13} className="text-[#0F4C81] flex-shrink-0 mt-0.5" />
                      <p><strong>EN:</strong> Open the PWA, enter the Sign-in ID above (National ID or ANC Number) and the Security PIN to activate your profile.</p>
                    </div>
                    <div className="flex gap-2">
                      <ArrowRight size={13} className="text-[#0F4C81] flex-shrink-0 mt-0.5" />
                      <p><strong>SW:</strong> Fungua PWA, weka Kitambulisho cha Kuingia hapo juu (Kitambulisho cha Taifa au Nambari ya ANC) na PIN ya Usalama ili kuwezesha wasifu wako.</p>
                    </div>
                  </div>

                  <button
                    onClick={closeOnboarding}
                    className="mt-8 px-8 h-12 bg-[#0F4C81] text-white text-[14px] font-bold rounded-[14px] hover:bg-[#235C45] active:scale-[0.98] transition-all shadow-green-glow"
                  >
                    Finish & Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
