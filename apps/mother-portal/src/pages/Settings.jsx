import db from '@/api/totoafyaClient';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  Info,
  LogOut,
  ChevronRight,
  Check,
  Heart,
  Shield,
  Phone,
  Lock,
  Database,
  HeartHandshake,
  X,
} from 'lucide-react';
import InvitePartner from '@/components/settings/InvitePartner';

import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import { cn } from '@/lib/utils';

export default function Settings() {
  const navigate = useNavigate();
  const { t, lang, setLanguage } = useLang();
  const isSw = lang === 'sw';

  const [mother, setMother] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);
  const [facilityPhone, setFacilityPhone] = useState('');
  const [facilityEmergencyPhone, setFacilityEmergencyPhone] = useState('');

  // 4-Digit PIN modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  useEffect(() => {
    loadMother();
  }, []);

  const loadMother = async () => {
    try {
      const mothers = await db.entities.Mother.list('-created_date', 1);
      const m = mothers[0] || null;
      setMother(m);
      setFacilityPhone(m?.facility_phone || '');
      setFacilityEmergencyPhone(m?.facility_emergency_phone || '');
    } catch (e) {
      console.warn('Could not load mother profile in settings:', e);
    }
  };

  const savePhoneNumbers = async () => {
    if (!mother) return;
    setSaving(true);
    try {
      await db.entities.Mother.update(mother.id, {
        facility_phone: facilityPhone || null,
        facility_emergency_phone: facilityEmergencyPhone || null,
      });
      await loadMother();
      setShowPhoneEdit(false);
    } catch (e) {
      console.error('Error saving phone numbers:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePin = (e) => {
    e.preventDefault();
    setPinError('');
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError(
        isSw
          ? 'PIN lazima iwe ya tarakimu 4 kamili.'
          : 'PIN must be exactly 4 numeric digits.'
      );
      return;
    }
    if (newPin !== confirmPin) {
      setPinError(
        isSw
          ? 'PIN hazilingani. Tafadhali thibitisha tena.'
          : 'PIN confirmation does not match.'
      );
      return;
    }

    try {
      localStorage.setItem('toto_pin', newPin);
      setPinSuccess(true);
      setTimeout(() => {
        setShowPinModal(false);
        setNewPin('');
        setConfirmPin('');
        setPinSuccess(false);
      }, 1500);
    } catch (e) {
      setPinError(isSw ? 'Hitilafu wakati wa kuhifadhi PIN.' : 'Failed to save PIN.');
    }
  };

  const handleLogout = () => db.auth.logout();

  const SettingsRow = ({
    icon: IconComp,
    label,
    sublabel,
    value,
    onClick,
    danger = false,
  }) => {
    const Icon = IconComp;
    return (
      <button
        onClick={onClick}
        type="button"
        className="w-full min-h-[52px] flex items-center gap-3 py-3.5 px-4 active:bg-[#F7F5F0] rounded-[16px] transition-all active:scale-[0.98] text-left"
      >
        <div
          className={cn(
            'w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0',
            danger ? 'bg-[#E51010]/10' : 'bg-[#F7F5F0]'
          )}
        >
          <Icon
            size={18}
            className={danger ? 'text-[#E51010]' : 'text-[#006B5F]'}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-[14px] font-semibold',
              danger ? 'text-[#E51010]' : 'text-[#0A0A0A]'
            )}
          >
            {label}
          </p>
          {sublabel && (
            <p className="text-[12px] text-[#718096] mt-0.5 truncate">{sublabel}</p>
          )}
        </div>
        {value && (
          <span className="text-[13px] text-[#718096] font-medium mr-1">
            {value}
          </span>
        )}
        {!danger && (
          <ChevronRight size={16} className="text-[#A0A0A0] flex-shrink-0" />
        )}
      </button>
    );
  };

  return (
    <AppShell>
      <div className="animate-fade-in pb-24">
        {/* Header */}
        <div className="relative px-4 pt-12 pb-5 overflow-hidden">
          <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#006B5F] mb-1">
            {lang === 'sw' ? 'AKAUNTI NA USALAMA' : 'ACCOUNT & SECURITY'}
          </p>
          <h1
            className="font-bold leading-tight text-[#1a1a1a] text-[30px]"
            style={{ fontFamily: "'Merriweather', Georgia, serif" }}
          >
            {t('settings')}
          </h1>
        </div>

        {/* Profile Card */}
        {mother && (
          <div className="mx-4 mb-5 bg-white rounded-[24px] p-5 border border-[#E5E5E5] shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[18px] bg-[#006B5F] flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white text-[18px] font-extrabold">
                  {mother.full_name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'MA'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[17px] font-extrabold text-[#0A0A0A] leading-tight truncate">
                  {mother.full_name || 'Mama'}
                </p>
                <p className="text-[13px] text-[#718096] mt-0.5 truncate">{mother.phone}</p>
                <p className="text-[12px] text-[#718096]">
                  {mother.county} · {mother.anc_number || mother.national_id}
                </p>
              </div>
            </div>
          </div>
        )}

        <InvitePartner mother={mother} lang={lang} onUpdated={loadMother} />

        {/* Language Section (Zero Unicode Flag Emojis) */}
        <div className="mx-4 mb-4 bg-white rounded-[24px] border border-[#E5E5E5] overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#718096]">
              {t('language')}
            </p>
          </div>
          <div className="px-4 pb-4 flex gap-2">
            {[
              { code: 'en', badge: 'EN', label: 'English', native: 'English' },
              { code: 'sw', badge: 'SW', label: 'Swahili', native: 'Kiswahili' },
            ].map(({ code, badge, native }) => (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                className={cn(
                  'flex-1 min-h-[48px] py-3 rounded-[16px] flex flex-col items-center gap-1 transition-all duration-200 active:scale-[0.97] border',
                  lang === code
                    ? 'bg-[#006B5F] border-[#006B5F] shadow-sm'
                    : 'bg-[#F9F8F5] border-[#E5E5E5]'
                )}
              >
                <span
                  className={cn(
                    'text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider',
                    lang === code
                      ? 'bg-white/20 text-white'
                      : 'bg-[#E2E8F0] text-[#006B5F]'
                  )}
                >
                  {badge}
                </span>
                <span
                  className={cn(
                    'text-[13px] font-bold',
                    lang === code ? 'text-white' : 'text-[#0A0A0A]'
                  )}
                >
                  {native}
                </span>
                {lang === code && <Check size={12} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Core Security & Sync Settings List */}
        <div className="mx-4 mb-4 bg-white rounded-[24px] border border-[#E5E5E5] overflow-hidden">
          {/* 4-Digit PIN Security Management */}
          <SettingsRow
            icon={Lock}
            label={isSw ? 'Badilisha PIN ya Tarakimu 4' : 'Change 4-Digit Security PIN'}
            sublabel={
              isSw
                ? 'Dhibiti nambari ya siri ya kufungua programu'
                : 'Manage shared-phone authentication PIN'
            }
            onClick={() => setShowPinModal(true)}
          />
          <div className="h-[0.5px] bg-[#F7F5F0] mx-4" />

          {/* Offline Sync Vault (SCR-24) */}
          <SettingsRow
            icon={Database}
            label={isSw ? 'Hifadhi ya Nje ya Mtandao (Sync Vault)' : 'Offline Sync Vault'}
            sublabel={
              isSw
                ? 'Kagua foleni ya rekodi na kumbukumbu ya simu'
                : 'Inspect mutation outbox & local storage'
            }
            onClick={() => navigate('/settings/sync')}
          />
          <div className="h-[0.5px] bg-[#F7F5F0] mx-4" />

          {/* Bereavement Mode Entry (SCR-28) */}
          <SettingsRow
            icon={HeartHandshake}
            label={isSw ? 'Hali ya Maombolezo (Bereavement)' : 'Bereavement Support'}
            sublabel={
              isSw
                ? 'Nimepoteza ujauzito au mtoto mchanga'
                : 'Sensitive care after pregnancy or infant loss'
            }
            onClick={() => navigate('/sensitive/bereavement')}
          />
          <div className="h-[0.5px] bg-[#F7F5F0] mx-4" />

          {/* User Profile */}
          <SettingsRow
            icon={User}
            label={t('profile')}
            sublabel={mother?.anc_number ? `ANC: ${mother.anc_number}` : mother?.national_id}
          />
          <div className="h-[0.5px] bg-[#F7F5F0] mx-4" />

          {/* Notifications */}
          <SettingsRow
            icon={Bell}
            label={t('notifications')}
            sublabel={isSw ? 'Washa arifa za chanjo na ziara' : 'Enable vaccine & visit reminders'}
          />
          <div className="h-[0.5px] bg-[#F7F5F0] mx-4" />

          {/* Privacy & Security */}
          <SettingsRow
            icon={Shield}
            label={isSw ? 'Faragha & Usalama wa Data' : 'Privacy & Security'}
            sublabel={
              isSw
                ? 'Data inalindwa kulingana na Sheria ya KDPA 2019'
                : 'KDPA 2019 compliant encryption & tokenization'
            }
          />
          <div className="h-[0.5px] bg-[#F7F5F0] mx-4" />

          {/* About */}
          <SettingsRow
            icon={Info}
            label={t('about')}
            sublabel={isSw ? 'Toleo 1.0 · Mfumo wa Afya wa Kenya' : 'Version 1.0 · Kenya MCH Digital'}
          />
        </div>

        {/* Facility Contact Numbers */}
        <div className="mx-4 mb-4 bg-white rounded-[24px] border border-[#E5E5E5] overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[#006B5F]" />
              <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#718096]">
                {isSw ? 'NAMBARI ZA HOSPITALI' : 'FACILITY CONTACT NUMBERS'}
              </p>
            </div>
            <button
              onClick={() => setShowPhoneEdit(!showPhoneEdit)}
              className="min-h-[48px] px-4 py-1.5 rounded-full bg-[#006B5F]/10 text-[#006B5F] text-[12px] font-bold active:scale-[0.96] transition-transform flex items-center"
            >
              {showPhoneEdit
                ? isSw
                  ? 'Funga'
                  : 'Cancel'
                : isSw
                ? 'Hariri'
                : 'Edit'}
            </button>
          </div>

          {!showPhoneEdit ? (
            <div className="px-4 pb-4 flex flex-col gap-2">
              <div className="flex items-center justify-between py-2">
                <p className="text-[12px] text-[#718096]">
                  {isSw ? 'Maswali' : 'Inquiry'}
                </p>
                <p className="text-[13px] font-semibold text-[#0A0A0A]">
                  {mother?.facility_phone || (isSw ? 'Haijasajiliwa' : 'Not set')}
                </p>
              </div>
              <div className="h-[0.5px] bg-[#F7F5F0]" />
              <div className="flex items-center justify-between py-2">
                <p className="text-[12px] text-[#718096]">
                  {isSw ? 'Dharura / Uzazi' : 'Emergency / Maternity'}
                </p>
                <p className="text-[13px] font-semibold text-[#DC2626]">
                  {mother?.facility_emergency_phone || (isSw ? 'Haijasajiliwa' : 'Not set')}
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 pb-4 flex flex-col gap-3">
              <div>
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#718096] block mb-2">
                  {isSw ? 'NAMBARI YA MASWALI' : 'INQUIRY PHONE'}
                </label>
                <input
                  type="tel"
                  value={facilityPhone}
                  onChange={(e) => setFacilityPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full h-12 px-4 bg-[#F9F8F5] border border-[#E5E5E5] rounded-[14px] text-[14px] font-medium outline-none focus:border-[#006B5F]"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#718096] block mb-2">
                  {isSw ? 'NAMBARI YA DHARURA / UZAZI' : 'EMERGENCY / MATERNITY LINE'}
                </label>
                <input
                  type="tel"
                  value={facilityEmergencyPhone}
                  onChange={(e) => setFacilityEmergencyPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full h-12 px-4 bg-[#F9F8F5] border border-[#E5E5E5] rounded-[14px] text-[14px] font-medium outline-none focus:border-[#DC2626]"
                />
              </div>
              <button
                onClick={savePhoneNumbers}
                disabled={saving}
                className="w-full min-h-[48px] rounded-full bg-[#006B5F] text-white text-[13px] font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50 shadow-sm"
              >
                {saving ? '...' : (
                  <>
                    <Check size={16} />{' '}
                    <span>{isSw ? 'Hifadhi Nambari' : 'Save Numbers'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="mx-4 mb-6">
          <button
            onClick={handleLogout}
            className="w-full min-h-[48px] py-3.5 rounded-full border border-[#DC2626]/30 bg-[#DC2626]/5 text-[#DC2626] text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
          >
            <LogOut size={17} /> <span>{t('logout')}</span>
          </button>
        </div>

        {/* Branding Footer */}
        <div className="pb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Heart size={14} className="text-[#006B5F]" fill="#006B5F" />
            <span className="text-[11px] font-bold tracking-[0.1em] text-[#0A0A0A]">
              TotoAfya Digital
            </span>
          </div>
          <p className="text-[10px] text-[#718096] tracking-wide">
            {isSw
              ? 'Kulinda afya ya mama na mtoto · Kenya'
              : 'Protecting Mother & Child Health · Kenya'}
          </p>
        </div>

        {/* 4-Digit PIN Modal */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[28px] max-w-sm w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 animate-scale-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#E6F4F1] text-[#006B5F] flex items-center justify-center">
                    <Lock size={18} />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#1A202C]">
                    {isSw ? 'Weka PIN Mpya' : 'Set New 4-Digit PIN'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowPinModal(false)}
                  className="min-w-[48px] min-h-[48px] rounded-full hover:bg-[#F1EFEA] text-[#718096] flex items-center justify-center"
                  aria-label={isSw ? 'Funga' : 'Close'}
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-xs text-[#4A5568] leading-relaxed">
                {isSw
                  ? 'Weka tarakimu 4 zitakazotumika kufungua programu na kulinda rekodi zako za faragha.'
                  : 'Enter 4 digits to secure your private maternal records on this device.'}
              </p>

              <form onSubmit={handleSavePin} className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-[#4A5568] block mb-1">
                    {isSw ? 'PIN Mpya (Tarakimu 4)' : 'New PIN (4 digits)'}
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full h-12 text-center tracking-[0.5em] text-lg font-bold bg-[#F9F8F5] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#006B5F]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#4A5568] block mb-1">
                    {isSw ? 'Thibitisha PIN' : 'Confirm PIN'}
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full h-12 text-center tracking-[0.5em] text-lg font-bold bg-[#F9F8F5] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#006B5F]"
                  />
                </div>

                {pinError && (
                  <p className="text-xs text-[#DC2626] font-medium">{pinError}</p>
                )}

                {pinSuccess && (
                  <div className="p-2.5 rounded-xl bg-[#F0FDF4] text-[#166534] text-xs font-bold flex items-center gap-1.5">
                    <Check size={14} />
                    <span>{isSw ? 'PIN imehifadhiwa kikamilifu!' : 'PIN saved successfully!'}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="flex-1 min-h-[48px] rounded-full border border-[#E2E8F0] text-xs font-bold text-[#4A5568] hover:bg-[#F9F8F5]"
                  >
                    {isSw ? 'Ghairi' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 min-h-[48px] rounded-full bg-[#006B5F] hover:bg-[#004D44] text-white text-xs font-bold transition-transform active:scale-95 shadow-sm"
                  >
                    {isSw ? 'Hifadhi PIN' : 'Save PIN'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
