import db from '@/api/totoafyaClient';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import NurseANCForm from '@/components/nurse/NurseANCForm';
import NurseVaccineForm from '@/components/nurse/NurseVaccineForm';
import NurseGrowthForm from '@/components/nurse/NurseGrowthForm';
import NurseChatbot from '@/components/nurse/NurseChatbot';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'anc', label: 'ANC Visit' },
  { key: 'vaccine', label: 'Vaccines' },
  { key: 'growth', label: 'Growth' },
  { key: 'chat', label: '🤖 AI Chat' },
];

export default function NursePatientView({ patient, onBack }) {
  const [tab, setTab] = useState('overview');
  const [children, setChildren] = useState([]);
  const [ancVisits, setAncVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, [patient.id]);

  const loadPatientData = async () => {
    setLoading(true);
    const [kids, visits] = await Promise.all([
      db.entities.Child.list('-created_date', 10),
      db.entities.ANCVisit.filter({ mother_id: patient.id }, '-visit_date', 10),
    ]);
    setChildren(kids.filter(k => k.mother_id === patient.id));
    setAncVisits(visits);
    setLoading(false);
  };

  const riskColor = (patient.risk_level === 'critical' && db.features.isEnabled('enable-danger-signs-red-alerts')) ? '#E51010' :
    patient.risk_level === 'high' ? '#F9A825' : '#0F4C81';

  return (
    <div>
      {/* Back + header */}
      <button onClick={onBack} className="flex items-center gap-2 text-[#666666] mb-5 active:scale-[0.97] transition-transform min-h-[44px]">
        <ArrowLeft size={18} /> <span className="text-[13px] font-medium">Back to search</span>
      </button>

      {/* Patient card */}
      <div className="bg-white rounded-[24px] border border-[#E5E5E5] p-5 mb-5 shadow-card">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-[18px] flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${riskColor}15` }}>
            <span className="text-[20px] font-extrabold" style={{ color: riskColor }}>
              {patient.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-extrabold text-[#0A0A0A] truncate">{patient.full_name}</p>
            <p className="text-[12px] text-[#A0A0A0]">{patient.phone} · {patient.county}</p>
            <p className="text-[12px] text-[#A0A0A0]">
              {patient.anc_number ? `ANC: ${patient.anc_number}` : patient.national_id ? `ID: ${patient.national_id}` : ''}
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide flex-shrink-0"
            style={{ backgroundColor: `${riskColor}15`, color: riskColor }}>
            {patient.risk_level || 'low'} risk
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#F4F6F8] grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#A0A0A0] font-bold">Status</p>
            <p className="text-[13px] font-bold text-[#0A0A0A] mt-0.5 capitalize">{patient.pregnancy_status?.replace('_', ' ') || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#A0A0A0] font-bold">Children</p>
            <p className="text-[13px] font-bold text-[#0A0A0A] mt-0.5">{children.length}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#A0A0A0] font-bold">ANC Visits</p>
            <p className="text-[13px] font-bold text-[#0A0A0A] mt-0.5">{ancVisits.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white rounded-[16px] p-1 border border-[#E5E5E5]">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 py-2.5 rounded-[12px] text-[12px] font-bold transition-all',
              tab === t.key ? 'bg-[#0F4C81] text-white shadow-green-glow' : 'text-[#666666]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-3">
          {loading ? (
            <p className="text-[13px] text-[#A0A0A0] text-center py-8">Loading...</p>
          ) : (
            <>
              {children.length > 0 && (
                <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-4">
                  <p className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] mb-3">Children</p>
                  {children.map(c => (
                    <div key={c.id} className="flex items-center gap-3 py-2">
                      <span className="text-xl">{c.gender === 'female' ? '👧' : '👦'}</span>
                      <div>
                        <p className="text-[14px] font-bold text-[#0A0A0A]">{c.full_name}</p>
                        <p className="text-[11px] text-[#A0A0A0]">DOB: {c.date_of_birth}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {ancVisits.length > 0 && (
                <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-4">
                  <p className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] mb-3">Recent ANC Visits</p>
                  {ancVisits.slice(0, 3).map(v => (
                    <div key={v.id} className="flex items-center justify-between py-2 border-b border-[#F4F6F8] last:border-0">
                      <div>
                        <p className="text-[13px] font-bold text-[#0A0A0A]">Visit #{v.visit_number || '—'}</p>
                        <p className="text-[11px] text-[#A0A0A0]">{v.visit_date} · {v.facility || '—'}</p>
                      </div>
                      <p className="text-[12px] text-[#A0A0A0]">{v.gestational_age_weeks ? `${v.gestational_age_weeks} wks` : ''}</p>
                    </div>
                  ))}
                </div>
              )}
              {children.length === 0 && ancVisits.length === 0 && (
                <div className="bg-white rounded-[20px] border border-dashed border-[#E5E5E5] p-8 text-center">
                  <p className="text-[14px] font-bold text-[#0A0A0A] mb-1">No records yet</p>
                  <p className="text-[12px] text-[#A0A0A0]">Use the tabs above to enter clinical data</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'anc' && (
        <NurseANCForm patient={patient} onSaved={loadPatientData} />
      )}

      {tab === 'vaccine' && (
        <NurseVaccineForm patient={patient} children={children} onSaved={loadPatientData} />
      )}

      {tab === 'growth' && (
        <NurseGrowthForm patient={patient} children={children} onSaved={loadPatientData} />
      )}

      {tab === 'chat' && (
        <NurseChatbot patient={patient} children={children} ancVisits={ancVisits} />
      )}
    </div>
  );
}
