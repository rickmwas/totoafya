import React from 'react';
import { Users, Baby, Shield, AlertTriangle, TrendingUp, Heart } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, color, bg }) => (
  <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-5 shadow-card">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-[12px] ${bg} flex items-center justify-center`}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    <p className="text-[28px] font-extrabold text-[#0A0A0A] leading-none mb-1">{value}</p>
    <p className="text-[13px] font-semibold text-[#0A0A0A]">{label}</p>
    {sub && <p className="text-[11px] text-[#A0A0A0] mt-0.5">{sub}</p>}
  </div>
);

export default function FacilityOverview({ data }) {
  const { mothers, children, immunizations, alerts, growthRecords } = data;

  const pregnant = mothers.filter(m => m.pregnancy_status === 'pregnant').length;
  const highRisk = mothers.filter(m => ['high', 'critical'].includes(m.risk_level)).length;
  const overdueVax = immunizations.filter(i => i.status === 'overdue').length;
  const dueVax = immunizations.filter(i => i.status === 'due').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const samChildren = growthRecords.filter(g => g.nutrition_status === 'sam').length;

  const recentMothers = [...mothers].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] md:text-[28px] font-extrabold text-[#0A0A0A] tracking-[-0.02em]">Facility Overview</h1>
        <p className="text-[14px] text-[#A0A0A0] mt-1">Real-time summary of all registered patients</p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-8">
        <StatCard icon={Users} label="Registered Caregivers" value={mothers.length} sub={`${pregnant} pregnant`} color="#2E5B47" bg="bg-[#2E5B47]/10" />
        <StatCard icon={Baby} label="Registered Children" value={children.length} sub="active profiles" color="#2E5B47" bg="bg-[#2E5B47]/10" />
        <StatCard icon={AlertTriangle} label="High Risk Caregivers" value={highRisk} sub="need attention" color="#E51010" bg="bg-[#E51010]/10" />
        <StatCard icon={Shield} label="Overdue Vaccines" value={overdueVax} sub={`${dueVax} due soon`} color="#F9A825" bg="bg-[#F9A825]/10" />
        <StatCard icon={Heart} label="SAM Cases" value={samChildren} sub="severe malnutrition" color="#E51010" bg="bg-[#E51010]/10" />
        <StatCard icon={TrendingUp} label="Active Alerts" value={alerts.length} sub={`${criticalAlerts} critical`} color="#7C3AED" bg="bg-[#7C3AED]/10" />
      </div>

      {/* Recent registrations */}
      <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-4 md:p-6 shadow-card overflow-x-auto">
        <h2 className="text-[16px] font-bold text-[#0A0A0A] mb-4">Recent Registrations</h2>
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-[#F5F5F7]">
              {['Name', 'Status', 'Risk Level', 'County', 'Registered'].map(h => (
                <th key={h} className="text-left text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0] pb-3 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentMothers.map(m => (
              <tr key={m.id} className="border-b border-[#F5F5F7] last:border-0">
                <td className="py-3 pr-4 text-[13px] font-semibold text-[#0A0A0A]">{m.full_name}</td>
                <td className="py-3 pr-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    m.pregnancy_status === 'pregnant' ? 'bg-[#2E5B47]/10 text-[#2E5B47]' :
                    m.pregnancy_status === 'postpartum' ? 'bg-[#2E5B47]/10 text-[#2E5B47]' : 'bg-[#F5F5F7] text-[#666666]'
                  }`}>{m.pregnancy_status}</span>
                </td>
                <td className="py-3 pr-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    m.risk_level === 'critical' ? 'bg-[#E51010]/10 text-[#E51010]' :
                    m.risk_level === 'high' ? 'bg-[#F9A825]/10 text-[#F9A825]' : 'bg-[#2E5B47]/10 text-[#2E5B47]'
                  }`}>{m.risk_level || 'low'}</span>
                </td>
                <td className="py-3 pr-4 text-[13px] text-[#666666]">{m.county || '—'}</td>
                <td className="py-3 text-[12px] text-[#A0A0A0]">{new Date(m.created_date).toLocaleDateString()}</td>
              </tr>
            ))}
            {recentMothers.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-[13px] text-[#A0A0A0]">No registrations yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
