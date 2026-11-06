import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Building2,
  MapPin,
  Lock,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { dataClient, mockFacilities, mockNurses } from '@totoafya/api-client';
import { Button, Input, Card, Badge } from '@totoafya/shared-ui';
import { useStation } from '../context/StationContext';

const STATIONS = [
  'MCH Clinic (Clinic 2)',
  'Triage & Vitals Station',
  'Immunization & KEPI Room',
  'Antenatal Care Wing (ANC)',
];

export default function Login() {
  const navigate = useNavigate();
  const { setFacility, setStation, setNurse, lang, toggleLanguage } = useStation();

  const [selectedFacilityId, setSelectedFacilityId] = useState(
    mockFacilities[0]?.id || 'fac-pumwani-01'
  );
  const [selectedStation, setSelectedStation] = useState(STATIONS[0]);
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = async (nurseMock) => {
    setLoading(true);
    setError('');
    try {
      // Find facility
      const fac =
        mockFacilities.find((f) => f.id === nurseMock.facility_id) ||
        mockFacilities.find((f) => f.id === selectedFacilityId) ||
        mockFacilities[0];

      setFacility(fac);
      setStation(selectedStation);
      setNurse(nurseMock);

      // Authenticate in dataClient
      if (dataClient?.auth?.login) {
        await dataClient.auth.login(nurseMock.email, 'password123').catch(() => {});
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Clinical authentication failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleStandardLogin = async (e) => {
    e?.preventDefault();
    if (!pin && !email) {
      setError('Please enter a clinical PIN or work email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fac =
        mockFacilities.find((f) => f.id === selectedFacilityId) || mockFacilities[0];
      const matchingNurse =
        mockNurses.find((n) => n.facility_id === fac.id) || mockNurses[0];

      setFacility(fac);
      setStation(selectedStation);
      setNurse(matchingNurse);

      if (dataClient?.auth?.login) {
        await dataClient.auth
          .login(email || matchingNurse.email, pin || '1234')
          .catch(() => {});
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#006B5F] flex items-center justify-center text-white shadow-sm">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-[#0A0A0A] tracking-tight leading-none flex items-center gap-2">
              TotoAfya Clinical
              <Badge status="scheduled" size="sm" showDot={false}>
                Nurse Workstation
              </Badge>
            </h1>
            <p className="text-xs text-[#6B7280] mt-1">
              Maternal & Newborn Clinical Tablet Intake System
            </p>
          </div>
        </div>

        <button
          onClick={toggleLanguage}
          className="text-xs font-bold text-[#006B5F] bg-white border border-[#D1D5DB] px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          {lang === 'en' ? '🇰🇪 Kiswahili' : '🇬🇧 English'}
        </button>
      </header>

      {/* Main Login Card */}
      <main className="max-w-xl w-full mx-auto my-auto">
        <Card className="shadow-lg border-slate-200">
          <div className="p-6 sm:p-8">
            <div className="mb-6 text-center">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#006B5F] bg-[#E6F4F1] px-3 py-1 rounded-full">
                Point-of-Care Authentication
              </span>
              <h2 className="text-2xl font-black text-[#0A0A0A] mt-2 tracking-tight">
                Staff Station Login
              </h2>
              <p className="text-xs text-[#6B7280] mt-1">
                Select your assigned medical facility and clinical room to begin intake.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-[#DC2626] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Facility Selection */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#4A4A4A] tracking-wider uppercase flex items-center gap-1.5 mb-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#006B5F]" />
                  <span>Healthcare Facility</span>
                </label>
                <select
                  value={selectedFacilityId}
                  onChange={(e) => setSelectedFacilityId(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#0A0A0A] focus:border-[#006B5F] focus:ring-2 focus:ring-[#006B5F]/20 outline-none"
                >
                  {mockFacilities.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name} ({fac.level} • {fac.county})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Station Selection */}
              <div>
                <label className="text-xs font-bold text-[#4A4A4A] tracking-wider uppercase flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#006B5F]" />
                  <span>Clinical Room / Workstation</span>
                </label>
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg text-[#0A0A0A] focus:border-[#006B5F] focus:ring-2 focus:ring-[#006B5F]/20 outline-none"
                >
                  {STATIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fast 1-Click Nurse Login (Mock/Local Mode) */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#C98A2C]" />
                  <span>Instant Clinical Sign-In (Local Mode)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(mockNurses[0])}
                    disabled={loading}
                    className="p-3 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/50 hover:border-[#006B5F] transition-all flex items-center gap-3 group active:scale-[0.98]"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#006B5F] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      JW
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0A0A0A] group-hover:text-[#006B5F] truncate">
                        Nurse Joy Wambui
                      </p>
                      <p className="text-[11px] text-[#6B7280] truncate">
                        Pumwani Maternity
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin(mockNurses[2] || mockNurses[0])}
                    disabled={loading}
                    className="p-3 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/50 hover:border-[#006B5F] transition-all flex items-center gap-3 group active:scale-[0.98]"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#C98A2C] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      MO
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0A0A0A] group-hover:text-[#C98A2C] truncate">
                        Sister Mary Otieno
                      </p>
                      <p className="text-[11px] text-[#6B7280] truncate">
                        Kilifi Referral
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Standard PIN Entry */}
              <div className="pt-2 border-t border-slate-100">
                <form onSubmit={handleStandardLogin} className="space-y-3">
                  <Input
                    label="Nurse PIN / Badge Code"
                    labelSw="Nambari ya Siri ya Muuguzi"
                    type="password"
                    maxLength={6}
                    placeholder="Enter 4-6 digit clinical PIN (e.g. 1234)"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={loading}
                    className="w-full font-bold shadow-md"
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Sign In & Open Station
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </Card>
      </main>

      {/* Footer Disclaimer */}
      <footer className="text-center text-xs text-[#6B7280] pt-6">
        <p className="font-semibold text-slate-700">
          TotoAfya Digital • Kenya Ministry of Health Compliant
        </p>
        <p className="text-[11px] mt-0.5">
          Restricted clinical interface for authorized healthcare professionals only.
        </p>
      </footer>
    </div>
  );
}
