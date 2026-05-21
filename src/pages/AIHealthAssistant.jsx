import db from '@/api/base44Client';

import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, TrendingUp, Bell, RefreshCw, ChevronRight, Shield, MessageCircle } from 'lucide-react';
import EmergencyCallBar from '@/components/shared/EmergencyCallBar';

import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';
import { differenceInWeeks, differenceInDays, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import PatientChatbot from '@/components/ai/PatientChatbot';

export default function AIHealthAssistant() {
  const { lang } = useLang();
  const [mother, setMother] = useState(null);
  const [children, setChildren] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [growthRecords, setGrowthRecords] = useState([]);
  const [ancVisits, setAncVisits] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [riskScore, setRiskScore] = useState(null);
  const [existingAlerts, setExistingAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' | 'chat'

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [mothers, kids, v, alerts] = await Promise.all([
      db.entities.Mother.list('-created_date', 1),
      db.entities.Child.list('-created_date', 10),
      db.entities.Immunization.filter({ status: 'overdue' }, '-scheduled_date', 20),
      db.entities.AIAlert.filter({ is_resolved: false }, '-created_date', 10),
    ]);
    setMother(mothers[0] || null);
    setChildren(kids);
    setVaccines(v);
    setExistingAlerts(alerts);
    if (mothers[0]) setRiskScore(mothers[0].risk_score);
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      // Gather context data
      const ancList = await db.entities.ANCVisit.list('-visit_date', 5);
      const growthList = await db.entities.GrowthRecord.list('-recorded_date', 10);

      const contextData = {
        mother: mother ? {
          pregnancy_status: mother.pregnancy_status,
          weeks_pregnant: mother.lmp ? differenceInWeeks(new Date(), parseISO(mother.lmp)) : null,
          gravida: mother.gravida,
          parity: mother.parity,
          anc_visits: ancList.length,
          last_bp: ancList[0] ? `${ancList[0].blood_pressure_systolic}/${ancList[0].blood_pressure_diastolic}` : null,
          danger_signs_reported: ancList.flatMap(v => v.danger_signs || []),
        } : null,
        children: children.map(child => ({
          name: child.full_name,
          age_months: child.date_of_birth
            ? Math.floor(differenceInDays(new Date(), parseISO(child.date_of_birth)) / 30)
            : null,
          health_status: child.health_status,
          days_since_visit: child.last_visit_date
            ? differenceInDays(new Date(), parseISO(child.last_visit_date))
            : null,
        })),
        overdue_vaccines: vaccines.length,
        latest_growth: growthList[0] ? {
          weight_kg: growthList[0].weight_kg,
          height_cm: growthList[0].height_cm,
          muac_cm: growthList[0].muac_cm,
          nutrition_status: growthList[0].nutrition_status,
        } : null,
      };

      const result = await db.integrations.Core.InvokeLLM({
        prompt: `You are a maternal and child health AI assistant for TotoAfya Digital in Kenya.

Analyze the following patient data and provide:
1. A risk score (0-100, where 0=no risk, 100=critical)
2. Risk level: "low", "medium", "high", or "critical"
3. Up to 5 specific health alerts or observations (severity: "info", "warning", or "critical")
4. Up to 4 personalized recommendations
5. A brief health summary (2-3 sentences, warm and reassuring tone)

Be clinically accurate, use WHO/Kenya MCH guidelines. For language preference "${lang}", provide responses in both English and Swahili.

Patient data: ${JSON.stringify(contextData, null, 2)}`,
        response_json_schema: {
          type: 'object',
          properties: {
            risk_score: { type: 'number' },
            risk_level: { type: 'string' },
            summary: { type: 'string' },
            summary_sw: { type: 'string' },
            alerts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  severity: { type: 'string' },
                  title: { type: 'string' },
                  title_sw: { type: 'string' },
                  message: { type: 'string' },
                  message_sw: { type: 'string' },
                  chv_needed: { type: 'boolean' },
                },
              },
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  action_sw: { type: 'string' },
                  priority: { type: 'string' },
                  icon: { type: 'string' },
                },
              },
            },
          },
        },
      });

      setAnalysis(result);
      setRiskScore(result.risk_score);

      // Update mother risk score
      if (mother) {
        await db.entities.Mother.update(mother.id, {
          risk_score: result.risk_score,
          risk_level: result.risk_level,
        });
      }

      // Save new alerts
      for (const alert of (result.alerts || []).slice(0, 3)) {
        await db.entities.AIAlert.create({
          mother_id: mother?.id,
          alert_type: alert.type || 'risk_flag',
          severity: alert.severity || 'info',
          title: alert.title,
          title_sw: alert.title_sw,
          message: alert.message,
          message_sw: alert.message_sw,
          ai_confidence: 0.85,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const riskColor = riskScore === null ? '#A0A0A0'
    : riskScore < 30 ? '#2E7A5D'
    : riskScore < 60 ? '#F9A825'
    : '#E51010';

  const riskLabel = riskScore === null ? '—'
    : riskScore < 30 ? (lang === 'sw' ? 'Hatari Ndogo' : 'Low Risk')
    : riskScore < 60 ? (lang === 'sw' ? 'Hatari ya Kati' : 'Medium Risk')
    : (lang === 'sw' ? 'Hatari Kubwa' : 'High Risk');

  return (
    <AppShell>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="px-4 pt-14 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-[#0047FF]" />
            <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-[#A0A0A0]">
              {lang === 'sw' ? 'AKILI BANDIA' : 'AI POWERED'}
            </p>
          </div>
          <h1 className="text-[32px] font-extrabold leading-none tracking-[-0.03em] text-[#0A0A0A]">
            {lang === 'sw' ? 'Afya ya AI' : 'AI Health'}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mx-4 mb-4 bg-white rounded-[16px] p-1 border border-[#E5E5E5]">
          <button
            onClick={() => setActiveTab('analysis')}
            className={cn('flex-1 py-2.5 rounded-[12px] text-[12px] font-bold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'analysis' ? 'bg-[#0047FF] text-white shadow-blue-glow-sm' : 'text-[#666666]')}
          >
            <Sparkles size={13} /> {lang === 'sw' ? 'Uchambuzi' : 'Analysis'}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={cn('flex-1 py-2.5 rounded-[12px] text-[12px] font-bold transition-all flex items-center justify-center gap-1.5',
              activeTab === 'chat' ? 'bg-[#0047FF] text-white shadow-blue-glow-sm' : 'text-[#666666]')}
          >
            <MessageCircle size={13} /> {lang === 'sw' ? 'Mazungumzo' : 'Chat'}
          </button>
        </div>

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="px-4 pb-6">
            <PatientChatbot mother={mother} children={children} lang={lang} />
          </div>
        )}

        {activeTab === 'analysis' && (<>

        {/* Risk Score Card */}
        <div className="mx-4 mb-4 rounded-[28px] overflow-hidden" style={{ background: `linear-gradient(135deg, ${riskColor}15, ${riskColor}05)`, border: `1px solid ${riskColor}25` }}>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#A0A0A0] mb-1">
                  {lang === 'sw' ? 'ALAMA YA HATARI' : 'RISK SCORE'}
                </p>
                <p className="text-[11px] font-semibold" style={{ color: riskColor }}>{riskLabel}</p>
              </div>
              <Shield size={20} style={{ color: riskColor }} />
            </div>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-[64px] font-extrabold leading-none tracking-[-0.03em]" style={{ color: riskColor }}>
                {riskScore ?? '?'}
              </span>
              <span className="text-[18px] text-[#A0A0A0] mb-3">/100</span>
            </div>
            {/* Risk meter */}
            <div className="h-2 bg-black/8 rounded-full overflow-hidden mb-4">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${riskScore ?? 0}%`,
                  background: `linear-gradient(90deg, #2E7A5D, ${riskColor})`,
                }}
              />
            </div>
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="w-full h-12 rounded-full text-white text-[13px] font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
              style={{ backgroundColor: riskColor, boxShadow: `0 8px 24px ${riskColor}40` }}
            >
              {loading
                ? <><RefreshCw size={16} className="animate-spin" /> {lang === 'sw' ? 'Inachambua...' : 'Analyzing...'}</>
                : <><Sparkles size={16} /> {lang === 'sw' ? 'Changanua Sasa' : 'Run Analysis'}</>
              }
            </button>
          </div>
        </div>

        {/* Emergency Call Bar — shown when risk is high or critical */}
        <EmergencyCallBar mother={mother} lang={lang} />

        {/* Loading state */}
        {loading && (
          <div className="mx-4 mb-4 bg-white rounded-[20px] p-5 border border-[#E5E5E5] shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#0047FF] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <div>
                <p className="text-[13px] font-bold text-[#0A0A0A]">
                  {lang === 'sw' ? 'AI inachambua data yako ya afya...' : 'AI is analyzing your health data...'}
                </p>
                <p className="text-[11px] text-[#A0A0A0] mt-0.5">
                  {lang === 'sw' ? 'Hii inaweza kuchukua sekunde 10-15' : 'This may take 10-15 seconds'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis results */}
        {analysis && !loading && (
          <>
            {/* Summary */}
            <div className="mx-4 mb-4 bg-[#0047FF]/5 rounded-[20px] p-4 border border-[#0047FF]/15">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-[#0047FF]" />
                <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#0047FF]">
                  {lang === 'sw' ? 'MUHTASARI WA AI' : 'AI SUMMARY'}
                </p>
              </div>
              <p className="text-[14px] text-[#0A0A0A] leading-relaxed font-medium">
                {lang === 'sw' && analysis.summary_sw ? analysis.summary_sw : analysis.summary}
              </p>
            </div>

            {/* Alerts */}
            {analysis.alerts?.length > 0 && (
              <div className="px-4 mb-4">
                <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] mb-3">
                  {lang === 'sw' ? 'ARIFA ZA AFYA' : 'HEALTH ALERTS'}
                </p>
                <div className="flex flex-col gap-2">
                  {analysis.alerts.map((alert, i) => {
                    const color = alert.severity === 'critical' ? '#E51010' : alert.severity === 'warning' ? '#F9A825' : '#0047FF';
                    return (
                      <div key={i} className="bg-white rounded-[18px] p-4 border shadow-card" style={{ borderColor: `${color}25`, backgroundColor: `${color}05` }}>
                        <div className="flex items-start gap-3">
                          <AlertTriangle size={16} style={{ color }} className="flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[13px] font-bold text-[#0A0A0A]">
                              {lang === 'sw' && alert.title_sw ? alert.title_sw : alert.title}
                            </p>
                            <p className="text-[12px] text-[#666666] mt-0.5 leading-snug">
                              {lang === 'sw' && alert.message_sw ? alert.message_sw : alert.message}
                            </p>
                            {alert.chv_needed && (
                              <p className="text-[11px] font-bold mt-1.5" style={{ color }}>
                                {lang === 'sw' ? '👷 Ziara ya CHV inahitajika' : '👷 CHV home visit needed'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations?.length > 0 && (
              <div className="px-4 mb-4">
                <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] mb-3">
                  {lang === 'sw' ? 'MAPENDEKEZO' : 'RECOMMENDATIONS'}
                </p>
                <div className="flex flex-col gap-2">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="bg-white rounded-[18px] p-4 border border-[#E5E5E5] flex items-center gap-3 shadow-card">
                      <div className="w-8 h-8 bg-[#2E7A5D]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingUp size={14} className="text-[#2E7A5D]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-[#0A0A0A]">
                          {lang === 'sw' && rec.action_sw ? rec.action_sw : rec.action}
                        </p>
                        {rec.priority === 'high' && (
                          <p className="text-[10px] text-[#F9A825] font-bold mt-0.5 uppercase tracking-wide">
                            {lang === 'sw' ? 'Muhimu' : 'High Priority'}
                          </p>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-[#D0D0D0] flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Existing alerts */}
        {!analysis && existingAlerts.length > 0 && (
          <div className="px-4 mb-4">
            <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] mb-3">
              {lang === 'sw' ? 'ARIFA ZA HIVI KARIBUNI' : 'RECENT ALERTS'}
            </p>
            <div className="flex flex-col gap-2">
              {existingAlerts.slice(0, 5).map(alert => {
                const color = alert.severity === 'critical' ? '#E51010' : alert.severity === 'warning' ? '#F9A825' : '#0047FF';
                return (
                  <div key={alert.id} className="bg-white rounded-[18px] p-4 border shadow-card" style={{ borderColor: `${color}20` }}>
                    <p className="text-[13px] font-bold text-[#0A0A0A]">
                      {lang === 'sw' && alert.title_sw ? alert.title_sw : alert.title}
                    </p>
                    <p className="text-[12px] text-[#666666] mt-0.5">
                      {lang === 'sw' && alert.message_sw ? alert.message_sw : alert.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!analysis && !loading && (
          <div className="px-4 pb-6">
            <div className="bg-white rounded-[20px] p-6 border border-[#E5E5E5] text-center">
              <Sparkles size={28} className="text-[#0047FF] mx-auto mb-3" />
              <p className="text-[14px] font-bold text-[#0A0A0A] mb-1">
                {lang === 'sw' ? 'Changanua Afya Yako' : 'Analyze Your Health'}
              </p>
              <p className="text-[12px] text-[#A0A0A0]">
                {lang === 'sw'
                  ? 'Bonyeza "Changanua Sasa" kupata uchambuzi wa AI kulingana na data yako'
                  : 'Tap "Run Analysis" to get AI-powered health insights based on your data'}
              </p>
            </div>
          </div>
        )}
        </>)}
      </div>
    </AppShell>
  );
}