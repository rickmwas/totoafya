import React from 'react';
import { Phone, AlertTriangle } from 'lucide-react';

/**
 * Shown when AI risk is high or critical.
 * mother: the mother entity record (needs facility_phone, facility_emergency_phone, facility_name)
 * lang: 'en' | 'sw'
 * forceShow: show even if risk not high (e.g. for settings page preview)
 */
export default function EmergencyCallBar({ mother, lang, forceShow = false }) {
  const riskLevel = mother?.risk_level;
  const isUrgent = forceShow || riskLevel === 'critical' || riskLevel === 'high';

  if (!isUrgent) return null;

  const isCritical = riskLevel === 'critical';
  const facilityName = mother?.facility_name || (lang === 'sw' ? 'Hospitali Yako' : 'Your Facility');
  const inquiryPhone = mother?.facility_phone;
  const emergencyPhone = mother?.facility_emergency_phone;

  if (!inquiryPhone && !emergencyPhone) {
    // No numbers saved — show a prompt to update profile
    return (
      <div className="mx-4 mb-4 rounded-[20px] p-4 border border-[#F9A825]/30 bg-[#F9A825]/8 flex items-start gap-3">
        <AlertTriangle size={18} className="text-[#F9A825] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-bold text-[#0A0A0A]">
            {lang === 'sw' ? 'Nambari ya hospitali haijasajiliwa' : 'No facility number saved'}
          </p>
          <p className="text-[12px] text-[#666] mt-0.5">
            {lang === 'sw'
              ? 'Enda Mipangilio → Maelezo ya Hospitali ili kuongeza nambari ya dharura.'
              : 'Go to Settings → Facility Details to add an emergency contact number.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-4 mb-4 rounded-[24px] overflow-hidden border ${isCritical ? 'border-[#E51010]/30 bg-[#E51010]/5' : 'border-[#F9A825]/30 bg-[#F9A825]/5'}`}>
      {/* Header */}
      <div className={`px-4 py-3 flex items-center gap-2 ${isCritical ? 'bg-[#E51010]' : 'bg-[#F9A825]'}`}>
        <Phone size={14} className="text-white" />
        <p className="text-[11px] font-extrabold text-white tracking-[0.12em] uppercase">
          {isCritical
            ? (lang === 'sw' ? '🚨 DHARURA — PIGA SIMU SASA' : '🚨 EMERGENCY — CALL NOW')
            : (lang === 'sw' ? '⚠️ Unashauriwa kuwasiliana na hospitali' : '⚠️ Contact your facility')}
        </p>
      </div>

      <div className="px-4 py-4 flex flex-col gap-3">
        <p className="text-[12px] text-[#666]">
          <span className="font-bold text-[#0A0A0A]">{facilityName}</span>
        </p>

        <div className="flex flex-col gap-2">
          {emergencyPhone && (
            <a href={`tel:${emergencyPhone}`}
              className={`flex items-center justify-between w-full h-14 px-5 rounded-[16px] text-white font-extrabold text-[14px] active:scale-[0.97] transition-transform shadow-lg ${isCritical ? 'bg-[#E51010] shadow-[0_6px_20px_rgba(229,16,16,0.35)]' : 'bg-[#F9A825] shadow-[0_6px_20px_rgba(249,168,37,0.3)]'}`}>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-white" />
                <div>
                  <p className="text-[11px] font-bold opacity-80 leading-none mb-0.5">
                    {lang === 'sw' ? 'DHARURA / UZAZI' : 'EMERGENCY / MATERNITY'}
                  </p>
                  <p className="text-[16px] font-black tracking-wide leading-none">{emergencyPhone}</p>
                </div>
              </div>
              <span className="text-[12px] font-bold opacity-90">
                {lang === 'sw' ? 'Piga' : 'Call'}
              </span>
            </a>
          )}

          {inquiryPhone && (
            <a href={`tel:${inquiryPhone}`}
              className="flex items-center justify-between w-full h-12 px-5 rounded-[16px] bg-white border-2 border-[#E5E5E5] font-bold text-[14px] active:scale-[0.97] transition-transform">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#0047FF]" />
                <div>
                  <p className="text-[10px] font-bold text-[#A0A0A0] leading-none mb-0.5">
                    {lang === 'sw' ? 'MASWALI' : 'GENERAL INQUIRY'}
                  </p>
                  <p className="text-[14px] font-black text-[#0A0A0A] tracking-wide leading-none">{inquiryPhone}</p>
                </div>
              </div>
              <span className="text-[12px] font-bold text-[#0047FF]">
                {lang === 'sw' ? 'Piga' : 'Call'}
              </span>
            </a>
          )}
        </div>

        <p className="text-[11px] text-[#A0A0A0] text-center">
          {lang === 'sw'
            ? 'Au tembelea hospitali yako ya karibu mara moja'
            : 'Or visit your nearest facility immediately'}
        </p>
      </div>
    </div>
  );
}
