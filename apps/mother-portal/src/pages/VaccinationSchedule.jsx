import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
  Calendar,
  Baby,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { dataClient } from '@totoafya/api-client';
import { KENYA_VACCINE_SCHEDULE } from '@totoafya/business-logic';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from '@totoafya/shared-ui';
import AppShell from '@/components/layout/AppShell';
import { useLang } from '@/context/LanguageContext';
import { parseISO, format } from 'date-fns';

export default function VaccinationSchedule({ hideShell = false }) {
  const navigate = useNavigate();
  const { lang } = useLang();
  const isSw = lang === 'sw';

  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'completed' | 'all'

  useEffect(() => {
    loadScopedChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadChildVaccines(selectedChild.id);
    }
  }, [selectedChild]);

  const loadScopedChildren = async () => {
    setLoading(true);
    try {
      const user = await dataClient.auth.me();
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      let motherId = user.mother_id;
      if (!motherId) {
        const mothers = await dataClient.mothers.filter({ user_id: user.id });
        if (mothers.length > 0) motherId = mothers[0].id;
      }

      let kids = [];
      if (motherId) {
        kids = await dataClient.children.filter({ mother_id: motherId });
      } else if (dataClient.mode === 'mock') {
        const allMothers = await dataClient.mothers.list();
        const demoMother = allMothers[0];
        if (demoMother) kids = await dataClient.children.filter({ mother_id: demoMother.id });
      }

      setChildren(kids);
      if (kids.length > 0) {
        setSelectedChild(kids[0]);
      }
    } catch (e) {
      console.error('Failed to load children for vaccines:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadChildVaccines = async (childId) => {
    try {
      const v = await dataClient.immunizations.filter({ child_id: childId }, 'scheduled_date', 50);
      setVaccines(v);
    } catch (e) {
      console.warn('Failed to load child immunizations:', e);
    }
  };

  const filteredVaccines = vaccines.filter((v) => {
    if (activeTab === 'upcoming') return v.status !== 'given';
    if (activeTab === 'completed') return v.status === 'given';
    return true;
  });

  const content = (
    <div className="bg-[#F8FAFC] min-h-screen pb-16 font-sans text-slate-900">
      {/* Header */}
      <div className="px-4 pt-4 pb-4 bg-white border-b border-slate-200/80 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-extrabold text-slate-900">
              {isSw ? 'Ratiba ya Chanjo (KEPI)' : 'KEPI Vaccine Schedule'}
            </h1>
          </div>
          <Badge variant="secondary">MOH Kenya</Badge>
        </div>

        {/* Child Selector Tabs */}
        {children.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-2">
            {children.map((child) => {
              const isSelected = selectedChild?.id === child.id;
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-[#006B5F] text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  👶 {child.full_name?.split(' ')[0]}
                </button>
              );
            })}
          </div>
        )}

        {/* Filter Pills */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mt-2">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'upcoming'
                ? 'bg-white text-[#006B5F] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isSw ? 'Zinazofuata' : 'Upcoming'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'completed'
                ? 'bg-white text-[#006B5F] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isSw ? 'Zilizopewa' : 'Administered'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white text-[#006B5F] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isSw ? 'Zote (KEPI)' : 'All Doses'}
          </button>
        </div>
      </div>

      {/* KEPI Info Box */}
      <div className="p-4">
        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-2.5 text-xs text-teal-900 mb-4">
          <Shield className="w-5 h-5 text-[#006B5F] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">
              {isSw ? 'Mpango wa Kitaifa wa Chanjo wa Kenya (KEPI)' : 'Kenya Expanded Programme on Immunization'}
            </span>
            <p className="text-[11px] text-teal-800 mt-0.5 leading-relaxed">
              {isSw
                ? 'Chanjo zote za KEPI hutolewa bila malipo katika vituo vyote vya afya vya umma nchini Kenya ili kumlinda mtoto dhidi ya magonjwa hatari.'
                : 'All standard KEPI vaccines are provided free of charge at all public health facilities across Kenya to protect against polio, measles, tuberculosis, and rotavirus.'}
            </p>
          </div>
        </div>

        {/* Selected Child Identity Banner */}
        {selectedChild && (
          <div className="mb-4 flex items-center justify-between text-xs text-slate-600 px-1">
            <span>
              {isSw ? 'Ratiba ya:' : 'Timeline for:'}{' '}
              <strong className="text-slate-900">{selectedChild.full_name}</strong>
            </span>
            <span>
              DOB: {selectedChild.date_of_birth || selectedChild.dob || '2026-02-10'}
            </span>
          </div>
        )}

        {/* Timeline List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#006B5F] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 mt-2 font-semibold">
              {isSw ? 'Inapakia ratiba...' : 'Loading schedule...'}
            </p>
          </div>
        ) : filteredVaccines.length > 0 ? (
          <div className="space-y-3">
            {filteredVaccines.map((v) => {
              const isGiven = v.status === 'given';
              const isOverdue = v.status === 'overdue';
              return (
                <div
                  key={v.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isGiven
                          ? 'bg-emerald-50 text-emerald-700'
                          : isOverdue
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {isGiven ? (
                        <CheckCircle2 size={20} />
                      ) : isOverdue ? (
                        <AlertCircle size={20} />
                      ) : (
                        <Clock size={20} />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                        {v.vaccine_name}
                      </h4>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {isGiven
                          ? `${isSw ? 'Ilipewa mnamo' : 'Administered on'}: ${v.administered_date || v.date_given}`
                          : `${isSw ? 'Tarehe iliyopangwa' : 'Due date'}: ${v.scheduled_date}`}
                      </div>
                      {v.batch_number && (
                        <div className="text-[10px] font-mono text-slate-400 mt-1">
                          Batch: {v.batch_number} {v.clinician_name && `• Nurse: ${v.clinician_name}`}
                        </div>
                      )}
                    </div>
                  </div>

                  <Badge variant={isGiven ? 'normal' : isOverdue ? 'sam' : 'scheduled'}>
                    {isGiven
                      ? isSw ? 'Imepewa' : 'Given'
                      : isOverdue
                      ? isSw ? 'Imechelewa' : 'Overdue'
                      : isSw ? 'Inasubiri' : 'Upcoming'}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
            <Baby className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">
              {children.length === 0
                ? isSw ? 'Bado hujasajili mtoto' : 'No children registered'
                : isSw ? 'Hakuna chanjo katika orodha hii' : 'No vaccines in this filter'}
            </p>
            {children.length === 0 && (
              <Link to="/add-child" className="mt-3 inline-block">
                <Button variant="primary" size="sm">
                  {isSw ? 'Sajili Mtoto' : 'Register Child'}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return hideShell ? content : <AppShell>{content}</AppShell>;
}
