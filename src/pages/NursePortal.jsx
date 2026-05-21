import db from '@/api/base44Client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, LogOut, User, Stethoscope, TrendingUp, Shield, ChevronRight, X, Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import NursePatientSearch from '@/components/nurse/NursePatientSearch';
import NursePatientView from '@/components/nurse/NursePatientView';

export default function NursePortal() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('search'); // 'search' | 'patient'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    db.auth.me().then(setUser);
    loadRecentPatients();
  }, []);

  const loadRecentPatients = async () => {
    const list = await db.entities.Mother.list('-updated_date', 5);
    setRecentPatients(list);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setView('patient');
  };

  const handleBack = () => {
    setView('search');
    setSelectedPatient(null);
    loadRecentPatients(); // refresh after data entry
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Top Nav */}
      <nav className="bg-white border-b border-[#E5E5E5] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[12px] bg-[#2E7A5D] flex items-center justify-center shadow-green-glow">
            <Stethoscope size={17} className="text-white" />
          </div>
          <div>
            <p className="text-[13px] font-extrabold text-[#0A0A0A] leading-none">TotoAfya Nurse</p>
            <p className="text-[10px] text-[#A0A0A0] mt-0.5">{user?.full_name || 'Nurse Portal'}</p>
          </div>
        </div>
        <button
          onClick={() => db.auth.logout()}
          className="flex items-center gap-1.5 text-[12px] text-[#666666] font-semibold px-3 py-2 rounded-full hover:bg-[#F5F5F7] transition-colors"
        >
          <LogOut size={14} /> Sign out
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {view === 'search' ? (
          <>
            {/* Hero */}
            <div className="mb-6">
              <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#A0A0A0] mb-1">NURSE PORTAL</p>
              <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.025em] text-[#0A0A0A]">
                Patient Records
              </h1>
              <p className="text-[13px] text-[#A0A0A0] mt-1">Search a patient to enter or update clinical data</p>
            </div>

            {/* Search */}
            <NursePatientSearch onSelect={handleSelectPatient} />

            {/* Recent patients */}
            {recentPatients.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] mb-3">RECENTLY UPDATED</p>
                <div className="flex flex-col gap-2">
                  {recentPatients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPatient(p)}
                      className="bg-white rounded-[20px] border border-[#E5E5E5] p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-all shadow-card hover:shadow-card-hover"
                    >
                      <div className="w-10 h-10 rounded-[12px] bg-[#2E7A5D]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[14px] font-extrabold text-[#2E7A5D]">
                          {p.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-[#0A0A0A] truncate">{p.full_name}</p>
                        <p className="text-[11px] text-[#A0A0A0]">
                          {p.anc_number || p.national_id || 'No ID'} · {p.county || '—'}
                        </p>
                      </div>
                      <div className={cn(
                        'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex-shrink-0',
                        p.risk_level === 'critical' ? 'bg-[#E51010]/10 text-[#E51010]' :
                        p.risk_level === 'high' ? 'bg-[#F9A825]/10 text-[#F9A825]' :
                        'bg-[#2E7A5D]/10 text-[#2E7A5D]'
                      )}>
                        {p.risk_level || 'low'}
                      </div>
                      <ChevronRight size={16} className="text-[#D0D0D0]" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <NursePatientView patient={selectedPatient} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}