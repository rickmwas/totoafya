import db from '@/api/totoafyaClient';

import React, { useState, useEffect } from 'react';
import { Globe, User, Bell, Info, LogOut, ChevronRight, Check, Heart, Shield, Phone } from 'lucide-react';
import InvitePartner from '@/components/settings/InvitePartner';

import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { t, lang, setLanguage } = useLang();
  const [mother, setMother] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);
  const [facilityPhone, setFacilityPhone] = useState('');
  const [facilityEmergencyPhone, setFacilityEmergencyPhone] = useState('');

  useEffect(() => { loadMother(); }, []);

  const loadMother = async () => {
    const mothers = await db.entities.Mother.list('-created_date', 1);
    const m = mothers[0] || null;
    setMother(m);
    setFacilityPhone(m?.facility_phone || '');
    setFacilityEmergencyPhone(m?.facility_emergency_phone || '');
  };

  const savePhoneNumbers = async () => {
    if (!mother) return;
    setSaving(true);
    await db.entities.Mother.update(mother.id, {
      facility_phone: facilityPhone || null,
      facility_emergency_phone: facilityEmergencyPhone || null,
    });
    await loadMother();
    setSaving(false);
    setShowPhoneEdit(false);
  };

  const handleLogout = () => db.auth.logout();

  const SettingsRow = ({ icon: IconComp, label, sublabel, value, onClick, danger = false }) => {
    const Icon = IconComp;
    return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-4 px-4 active:bg-[#F7F5F0] rounded-[16px] transition-all active:scale-[0.98] text-left"
    >
      <div className={cn('w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0', danger ? 'bg-[#E51010]/10' : 'bg-[#F7F5F0]')}>
        <Icon size={17} className={danger ? 'text-[#E51010]' : 'text-[#666666]'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-[15px] font-semibold', danger ? 'text-[#E51010]' : 'text-[#0A0A0A]')}>{label}</p>
        {sublabel && <p className="text-[12px] text-[#A0A0A0] mt-0.5">{sublabel}</p>}
      </div>
      {value && <span className="text-[13px] text-[#A0A0A0] font-medium">{value}</span>}
      {!danger && <ChevronRight size={16} className="text-[#D0D0D0] flex-shrink-0" />}
    </button>
    );
  };

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="relative px-4 pt-14 pb-6 overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-[#7C3AED] opacity-[0.05] blur-2xl pointer-events-none" />
          <div className="absolute top-6 right-12 w-20 h-20 rounded-full bg-[#1B6B5A] opacity-[0.05] blur-xl pointer-events-none" />
          <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#7C3AED]/50 mb-1.5">
            {lang === 'sw' ? 'AKAUNTI' : 'ACCOUNT'}
          </p>
          <h1 className="font-bold leading-tight text-[#1a1a1a] text-[34px]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {t('settings')}
          </h1>
        </div>

        {/* Profile card */}
        {mother && (
          <div className="mx-4 mb-5 bg-white rounded-[24px] p-5 border border-[#E5E5E5] shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[18px] bg-[#1B6B5A] flex items-center justify-center flex-shrink-0 shadow-teal-glow-sm">
                <span className="text-white text-[20px] font-extrabold">
                  {mother.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[18px] font-extrabold text-[#0A0A0A] leading-tight truncate">{mother.full_name}</p>
                <p className="text-[13px] text-[#A0A0A0] mt-0.5 truncate">{mother.phone}</p>
                <p className="text-[12px] text-[#A0A0A0]">{mother.county} · {mother.anc_number || mother.national_id}</p>
              </div>
            </div>
            {mother.risk_level && (
              <div className="mt-4 pt-4 border-t border-[#F7F5F0] flex items-center justify-between">
                <p className="text-[12px] text-[#A0A0A0]">
                  {lang === 'sw' ? 'Alama ya Hatari' : 'Risk Score'}
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 bg-[#F7F5F0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${mother.risk_score || 0}%`,
                        backgroundColor: mother.risk_level === 'critical' ? '#E51010' : mother.risk_level === 'high' ? '#F9A825' : '#2E7A5D'
                      }}
                    />
                  </div>
                  <span className="text-[12px] font-bold" style={{
                    color: mother.risk_level === 'critical' ? '#E51010' : mother.risk_level === 'high' ? '#F9A825' : '#2E7A5D'
                  }}>
                    {mother.risk_score ?? 0}/100
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Partner invite */}
        <InvitePartner mother={mother} lang={lang} onUpdated={loadMother} />

        {/* Language Section */}
        <div className="mx-4 mb-4 bg-white rounded-[24px] border border-[#E5E5E5] overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0]">
              {t('language')}
            </p>
          </div>
          <div className="px-4 pb-4 flex gap-2">
            {[
              { code: 'en', label: 'English', native: 'English' },
              { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
            ].map(({ code, label, native }) => (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                className={cn(
                  'flex-1 py-3 rounded-[16px] flex flex-col items-center gap-1 transition-all duration-200 active:scale-[0.97] border',
                  lang === code
                    ? 'bg-[#1B6B5A] border-[#1B6B5A] shadow-teal-glow-sm'
                    : 'bg-[#F7F5F0] border-[#E5E5E5]'
                )}
              >
                <span className="text-[20px]">{code === 'en' ? '🇬🇧' : '🇰🇪'}</span>
                <span className={cn('text-[13px] font-bold', lang === code ? 'text-white' : 'text-[#0A0A0A]')}>{native}</span>
                {lang === code && <Check size={12} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Settings list */}
        <div className="mx-4 mb-4 bg-white rounded-[24px] border border-[#E5E5E5] overflow-hidden">
          <SettingsRow
            icon={User}
            label={t('profile')}
            sublabel={mother?.anc_number ? `ANC: ${mother.anc_number}` : mother?.national_id}
          />
          <div className="h-[0.5px] bg-[#F7F5F0] mx-4" />
          <SettingsRow
            icon={Bell}
            label={t('notifications')}
            sublabel={lang === 'sw' ? 'Washa arifa za chanjo na ziara' : 'Enable vaccine & visit reminders'}
          />
          <div className="h-[0.5px] bg-[#F7F5F0] mx-4" />
          <SettingsRow
            icon={Shield}
            label={lang === 'sw' ? 'Faragha & Usalama' : 'Privacy & Security'}
            sublabel={lang === 'sw' ? 'Data yako ina usalama na AES-256' : 'Your data is secured with AES-256'}
          />
          <div className="h-[0.5px] bg-[#F7F5F0] mx-4" />
          <SettingsRow
            icon={Info}
            label={t('about')}
            sublabel={lang === 'sw' ? 'Toleo 1.0 · Mfumo wa Afya wa Kenya' : 'Version 1.0 · Kenya MCH Digital'}
          />
        </div>

        {/* Facility Contact Numbers */}
        <div className="mx-4 mb-4 bg-white rounded-[24px] border border-[#E5E5E5] overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[#1B6B5A]" />
              <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0]">
                {lang === 'sw' ? 'NAMBARI ZA HOSPITALI' : 'FACILITY CONTACT NUMBERS'}
              </p>
            </div>
            <button onClick={() => setShowPhoneEdit(!showPhoneEdit)}
              className="text-[12px] font-bold text-[#1B6B5A] px-3 py-1 rounded-full bg-[#1B6B5A]/8 active:scale-[0.96] transition-transform">
              {showPhoneEdit ? (lang === 'sw' ? 'Funga' : 'Cancel') : (lang === 'sw' ? 'Hariri' : 'Edit')}
            </button>
          </div>

          {!showPhoneEdit ? (
            <div className="px-4 pb-4 flex flex-col gap-2">
              <div className="flex items-center justify-between py-2">
                <p className="text-[12px] text-[#A0A0A0]">{lang === 'sw' ? 'Maswali' : 'Inquiry'}</p>
                <p className="text-[13px] font-semibold text-[#0A0A0A]">{mother?.facility_phone || (lang === 'sw' ? 'Haijasajiliwa' : 'Not set')}</p>
              </div>
              <div className="h-[0.5px] bg-[#F7F5F0]" />
              <div className="flex items-center justify-between py-2">
                <p className="text-[12px] text-[#A0A0A0]">{lang === 'sw' ? 'Dharura / Uzazi' : 'Emergency / Maternity'}</p>
                <p className="text-[13px] font-semibold text-[#E51010]">{mother?.facility_emergency_phone || (lang === 'sw' ? 'Haijasajiliwa' : 'Not set')}</p>
              </div>
            </div>
          ) : (
            <div className="px-4 pb-4 flex flex-col gap-3">
              <div>
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] block mb-2">
                  {lang === 'sw' ? 'NAMBARI YA MASWALI' : 'INQUIRY PHONE'}
                </label>
                <input type="tel" value={facilityPhone} onChange={e => setFacilityPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full h-12 px-4 bg-[#F7F5F0] border border-[#E5E5E5] rounded-[14px] text-[14px] font-medium outline-none focus:border-[#1B6B5A]" />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] block mb-2">
                  {lang === 'sw' ? 'NAMBARI YA DHARURA / UZAZI' : 'EMERGENCY / MATERNITY LINE'}
                </label>
                <input type="tel" value={facilityEmergencyPhone} onChange={e => setFacilityEmergencyPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full h-12 px-4 bg-[#F7F5F0] border border-[#E5E5E5] rounded-[14px] text-[14px] font-medium outline-none focus:border-[#E51010]" />
              </div>
              <button onClick={savePhoneNumbers} disabled={saving}
                className="w-full h-12 rounded-full bg-[#1B6B5A] text-white text-[13px] font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-50 shadow-teal-glow-sm">
                {saving ? '...' : <><Check size={15} /> {lang === 'sw' ? 'Hifadhi' : 'Save Numbers'}</>}
              </button>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="mx-4 mb-6">
          <button
            onClick={handleLogout}
            className="w-full h-14 rounded-full border border-[#E51010]/30 bg-[#E51010]/5 text-[#E51010] text-[15px] font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
          >
            <LogOut size={17} /> {t('logout')}
          </button>
        </div>

        {/* Branding footer */}
        <div className="pb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Heart size={13} className="text-[#1B6B5A]" fill="#1B6B5A" />
            <span className="text-[11px] font-bold tracking-[0.1em] text-[#0A0A0A]">TotoAfya Digital</span>
          </div>
          <p className="text-[10px] text-[#A0A0A0] tracking-wide">
            {lang === 'sw' ? 'Kulinda afya ya mama na mtoto · Kenya' : 'Protecting Mother & Child Health · Kenya'}
          </p>
        </div>
      </div>
    </AppShell>
  );
}