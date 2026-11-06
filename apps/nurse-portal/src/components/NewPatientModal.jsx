import React, { useState } from 'react';
import { X, UserPlus, Baby, Heart, Save } from 'lucide-react';
import { dataClient } from '@totoafya/api-client';
import { calculateGestationalAgeInWeeks, calculateEdd } from '@totoafya/business-logic';
import { Button, Input, Badge } from '@totoafya/shared-ui';

export default function NewPatientModal({ facility, onClose, onCreated }) {
  const [patientType, setPatientType] = useState('pregnant'); // 'pregnant' | 'child' | 'both'
  const [caregiverType, setCaregiverType] = useState('mother');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [ancNumber, setAncNumber] = useState('');
  const [county, setCounty] = useState(facility?.county || 'Nairobi');
  const [lmp, setLmp] = useState('');

  // Child details (if child or both)
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState(() => new Date().toISOString().split('T')[0]);
  const [childGender, setChildGender] = useState('female');
  const [birthWeight, setBirthWeight] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const gestationalWeeks = lmp ? calculateGestationalAgeInWeeks(lmp) : null;
  const edd = lmp ? calculateEdd(lmp) : '';

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!fullName) {
      setError('Please enter caregiver full name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Mother/Caregiver
      const motherPayload = {
        full_name: fullName,
        phone: phone || '+254 700 000000',
        national_id: nationalId || undefined,
        anc_number: ancNumber || `ANC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        caregiver_type: caregiverType,
        pregnancy_status: patientType === 'child' ? 'postpartum' : 'pregnant',
        lmp: lmp || undefined,
        edd: edd || undefined,
        county: county,
        facility_id: facility?.id || 'fac-pumwani-01',
        facility_name: facility?.name || 'Pumwani Maternity Hospital',
        risk_level: 'low',
        risk_score: 10,
        profile_complete: true,
      };

      const newMother = await dataClient.mothers.create(motherPayload);

      // 2. If child registration, create child record
      let newChild = null;
      if (patientType === 'child' || patientType === 'both' || childName) {
        newChild = await dataClient.children.create({
          mother_id: newMother.id,
          full_name: childName || `Baby of ${fullName}`,
          date_of_birth: childDob,
          gender: childGender,
          birth_weight_kg: birthWeight ? parseFloat(birthWeight) : 3.2,
          birth_facility: facility?.name || 'Local Hospital',
          health_status: 'healthy',
        });
      }

      if (onCreated) {
        onCreated(newMother, newChild);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#006B5F] text-white flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0A0A0A]">
                Quick Walk-In Patient Registration
              </h3>
              <p className="text-xs text-[#6B7280]">
                Registering at {facility?.name || 'Current Hospital'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-[#DC2626]">
              {error}
            </div>
          )}

          {/* Type Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
              Registration Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'pregnant', label: 'Pregnant Mother', icon: Heart },
                { key: 'child', label: 'Infant / Child', icon: Baby },
                { key: 'both', label: 'Mother & Infant', icon: UserPlus },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setPatientType(opt.key)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    patientType === opt.key
                      ? 'border-[#006B5F] bg-teal-50 text-[#006B5F] shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <opt.icon className="w-4 h-4" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Maternal / Caregiver Details */}
          <div className="space-y-3">
            <Input
              label="Caregiver Full Name *"
              placeholder="e.g. Amina Wanjiku Mwangi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Phone Number"
                placeholder="e.g. +254 712 345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Input
                label="National ID / Passport"
                placeholder="e.g. 12345678"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Clinic / ANC Number"
                placeholder="e.g. ANC-2026-088"
                value={ancNumber}
                onChange={(e) => setAncNumber(e.target.value)}
              />

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  County
                </label>
                <input
                  type="text"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-medium outline-none focus:border-[#006B5F]"
                />
              </div>
            </div>

            {patientType !== 'child' && (
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  LMP (Last Menstrual Period Date)
                </label>
                <input
                  type="date"
                  value={lmp}
                  onChange={(e) => setLmp(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-semibold outline-none focus:border-[#006B5F]"
                />
                {gestationalWeeks !== null && (
                  <p className="text-xs text-[#006B5F] font-bold mt-1">
                    Gestation: {gestationalWeeks} Weeks • EDD: {edd}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Child Section */}
          {(patientType === 'child' || patientType === 'both') && (
            <div className="pt-3 border-t border-slate-200/80 space-y-3 bg-slate-50 p-4 rounded-xl">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Baby className="w-4 h-4 text-[#006B5F]" />
                <span>Infant / Newborn Information</span>
              </h4>

              <Input
                label="Child Full Name"
                placeholder="e.g. Baby Jabali Mwangi"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
              />

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={childDob}
                    onChange={(e) => setChildDob(e.target.value)}
                    className="w-full h-11 px-2.5 bg-white border border-[#D1D5DB] rounded-lg text-xs font-semibold outline-none focus:border-[#006B5F]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Gender
                  </label>
                  <select
                    value={childGender}
                    onChange={(e) => setChildGender(e.target.value)}
                    className="w-full h-11 px-2 bg-white border border-[#D1D5DB] rounded-lg text-xs font-semibold outline-none focus:border-[#006B5F]"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                    Birth Wt (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="3.2"
                    value={birthWeight}
                    onChange={(e) => setBirthWeight(e.target.value)}
                    className="w-full h-11 px-2.5 bg-white border border-[#D1D5DB] rounded-lg text-xs font-semibold outline-none focus:border-[#006B5F]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={loading} icon={Save}>
              Register Patient
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
